const axios = require('axios')
const geminiService = require('./geminiService')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const ASSEMBLY_BASE = 'https://api.assemblyai.com/v2'

let altGeminiModel = null
try {
  if (process.env.GEMINI_API_KEY_2) {
    const altGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2)
    altGeminiModel = altGenAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    })
  }
} catch (_) {}

async function uploadToAssembly(audioBuffer) {
  const uploadRes = await axios.post(`${ASSEMBLY_BASE}/upload`, audioBuffer, {
    headers: {
      authorization: process.env.ASSEMBLY_AI_API_KEY,
      'content-type': 'application/octet-stream',
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  })
  return uploadRes.data.upload_url
}

async function requestTranscript(audioUrl) {
  const res = await axios.post(
    `${ASSEMBLY_BASE}/transcript`,
    {
      audio_url: audioUrl,
      speaker_labels: false,
      punctuate: true,
      format_text: true,
    },
    {
      headers: { authorization: process.env.ASSEMBLY_AI_API_KEY },
    }
  )
  return res.data.id
}

async function waitForTranscript(transcriptId) {
  // Poll until completed
  for (;;) {
    const res = await axios.get(`${ASSEMBLY_BASE}/transcript/${transcriptId}`, {
      headers: { authorization: process.env.ASSEMBLY_AI_API_KEY },
    })
    const data = res.data
    if (data.status === 'completed') return data
    if (data.status === 'error')
      throw new Error(data.error || 'Transcription failed')
    await new Promise((r) => setTimeout(r, 3000))
  }
}

function segmentTranscriptBySlides(words, slideBoundariesMs, totalSlides) {
  // slideBoundariesMs is array of cumulative ms when user clicked Next (start times per slide) or segment ends
  // Expect format: [{slideIndex:0, startMs:0}, {slideIndex:1, startMs:t1}, ...]
  // Compute end times by next start or last word end
  const starts = slideBoundariesMs
    .sort((a, b) => a.slideIndex - b.slideIndex)
    .map((b) => ({ slideIndex: b.slideIndex, startMs: b.startMs }))

  const lastEnd = words.length ? words[words.length - 1].end : 0
  const slides = []
  for (let i = 0; i < totalSlides; i++) {
    const startMs = starts[i]
      ? starts[i].startMs
      : i === 0
      ? 0
      : slides[i - 1]?.endMs || 0
    const endMs = starts[i + 1] ? starts[i + 1].startMs : lastEnd
    const slideWords = words.filter((w) => w.start >= startMs && w.end <= endMs)
    const text = slideWords
      .map((w) => w.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    const durationMs = Math.max(0, endMs - startMs)
    slides.push({ slideIndex: i, startMs, endMs, durationMs, text })
  }
  return slides
}

async function assessSlideWithGemini({
  slideText,
  slideDurationMs,
  referenceSection,
}) {
  if (!slideText || !slideText.trim()) {
    return { mark: 0, advice: 'No speech captured for this slide.' }
  }
  const minutes = (slideDurationMs / 60000).toFixed(2)
  const refName = referenceSection?.sectionName || 'Slide'
  const refFull = referenceSection?.content || ''
  const refContent =
    refFull.length > 1200 ? `${refFull.slice(0, 1200)}…` : refFull
  const spoken =
    slideText.length > 1500 ? `${slideText.slice(0, 1500)}…` : slideText

  const prompt = `You are an expert pitch coach. Evaluate the spoken segment against the reference section.

Reference: ${refName}
ReferenceContent: ${refContent}
SpokenTranscript: ${spoken}
SpokenDurationMinutes: ${minutes}

Rate ONLY on: clarity, alignment, pacing, confidence, persuasiveness, focus.
Keep response concise to save tokens.
Return STRICT JSON: {"mark": number, "advice": string} (mark 0-100, advice <= 2 sentences).`

  const model = altGeminiModel || geminiService.model
  const result = await model.generateContent(prompt)
  const response = await result.response
  const raw = response.text().trim()
  const cleaned = raw.replace(/```json\n?|```/gi, '').trim()
  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    parsed = { mark: 0, advice: 'Parsing error. Please re-run.' }
  }
  if (typeof parsed.mark !== 'number') parsed.mark = 0
  if (typeof parsed.advice !== 'string') parsed.advice = ''
  return parsed
}

async function processAndAssess({
  audioBuffer,
  slideBoundaries,
  totalSlides,
  referencePitch,
}) {
  const audioUrl = await uploadToAssembly(audioBuffer)
  const transcriptId = await requestTranscript(audioUrl)
  const transcript = await waitForTranscript(transcriptId)

  console.log('transcript', transcript)

  const words = (transcript.words || []).map((w) => ({
    start: w.start, // ms
    end: w.end, // ms
    text: w.text,
  }))

  const slides = segmentTranscriptBySlides(
    words,
    slideBoundaries || [],
    totalSlides
  )

  const perSlide = []
  for (const s of slides) {
    const refSection = Array.isArray(referencePitch?.sections)
      ? referencePitch.sections[s.slideIndex] || null
      : null
    const assessment = await assessSlideWithGemini({
      slideText: s.text,
      slideDurationMs: s.durationMs,
      referenceSection: refSection,
    })
    perSlide.push({
      slideIndex: s.slideIndex,
      durationMs: s.durationMs,
      text: s.text,
      assessment,
    })
  }

  const marks = perSlide.map((p) => p.assessment.mark)
  const averageMark = marks.length
    ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length)
    : 0

  const totalTimeMs = slides.reduce((acc, s) => acc + s.durationMs, 0)

  return {
    totalTimeMs,
    averageMark,
    slides: perSlide,
  }
}

module.exports = {
  processAndAssess,
}
