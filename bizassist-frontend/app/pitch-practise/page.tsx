'use client'

import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import {
  Mic,
  StopCircle,
  SkipForward,
  Upload,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react'

interface ReferencePitch {
  sections?: Array<{
    sectionName: string
    content: string
    timeMinutes: number
    timeSeconds: number
    notes?: string
  }>
  totalTimeMinutes?: number
  totalTimeSeconds?: number
}

interface AssessmentSlideResult {
  slideIndex: number
  durationMs: number
  text: string
  assessment: { mark: number; advice: string }
}

interface AssessmentResponse {
  totalTimeMs: number
  averageMark: number
  slides: AssessmentSlideResult[]
}

const PitchPractisePage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const isDark = theme === 'dark'

  const [deckFile, setDeckFile] = useState<File | null>(null)
  const [totalSlides, setTotalSlides] = useState<number>(0)
  const [declaredTotalTimeMin, setDeclaredTotalTimeMin] = useState<number>(5)
  const [referencePitch, setReferencePitch] = useState<ReferencePitch | null>(
    null
  )

  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0)
  const [slideBoundaries, setSlideBoundaries] = useState<
    { slideIndex: number; startMs: number }[]
  >([])
  const [result, setResult] = useState<AssessmentResponse | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number | null>(null)
  const timerIntervalRef = useRef<number | null>(null)

  // PDF rendering
  const [deckUrl, setDeckUrl] = useState<string | null>(null)
  const [pdfPageCount, setPdfPageCount] = useState<number>(0)
  const [pdfPageNum, setPdfPageNum] = useState<number>(1)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pdfDocRef = useRef<any>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('bizassist-pitch-data')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.pitchSpeech) {
          setReferencePitch(parsed.pitchSpeech)
          if (!totalSlides && parsed.pitchSpeech.sections?.length) {
            setTotalSlides(parsed.pitchSpeech.sections.length)
          }
        }
      }
    } catch (e) {
      console.error('Failed to load reference pitch:', e)
    }
  }, [])

  useEffect(() => {
    if (!isRecording) return
    timerIntervalRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        setElapsedMs(Date.now() - startTimeRef.current)
      }
    }, 100)
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [isRecording])

  const handleDeckUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setDeckFile(file)
    const url = URL.createObjectURL(file)
    setDeckUrl(url)

    try {
      const pdfjsLib: any = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

      const loadingTask = pdfjsLib.getDocument(url)
      const pdf = await loadingTask.promise
      pdfDocRef.current = pdf
      setPdfPageCount(pdf.numPages)
      setTotalSlides((prev) => (prev && prev > 0 ? prev : pdf.numPages))
      setPdfPageNum(1)
      await renderPage(1)
    } catch (err) {
      console.error('Error processing PDF:', err)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (deckUrl && pdfDocRef.current && pdfPageNum && canvasRef.current) {
        await renderPage(pdfPageNum)
      }
    })()
  }, [deckUrl, pdfPageNum])

  const renderPage = async (pageNumber: number) => {
    try {
      if (!pdfDocRef.current || !canvasRef.current) return
      const page = await pdfDocRef.current.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (!context) return
      canvas.height = viewport.height
      canvas.width = viewport.width
      const renderContext = {
        canvasContext: context,
        viewport,
      }
      await page.render(renderContext).promise
    } catch (e) {
      console.error('Failed to render page:', e)
    }
  }

  const goPrevPage = async () => {
    if (pdfPageNum <= 1) return
    const next = pdfPageNum - 1
    setPdfPageNum(next)
    setCurrentSlideIdx(next - 1)
    await renderPage(next)
  }

  const goNextPage = async () => {
    if (!pdfPageCount || pdfPageNum >= pdfPageCount) return
    const next = pdfPageNum + 1
    setPdfPageNum(next)
    setCurrentSlideIdx(next - 1)
    await renderPage(next)
  }

  const startRecording = async () => {
    if (isRecording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
          console.log('Audio chunk received:', e.data.size, 'bytes')
        }
      }

      mediaRecorder.onstop = () => {
        console.log('Total audio chunks:', audioChunksRef.current.length)
      }

      mediaRecorderRef.current = mediaRecorder
      setElapsedMs(0)
      setCurrentSlideIdx(0)
      setPdfPageNum(1)
      const now = Date.now()
      startTimeRef.current = now
      setSlideBoundaries([{ slideIndex: 0, startMs: 0 }])

      // Request data every second to ensure chunks are captured
      mediaRecorder.start(1000)
      setIsRecording(true)
      console.log('Recording started')
    } catch (e) {
      alert('Microphone permission denied or not available')
      console.error(e)
    }
  }

  const nextSlide = async () => {
    if (!isRecording) return
    const nextIdx = Math.min(currentSlideIdx + 1, Math.max(0, totalSlides - 1))
    const nowMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    setSlideBoundaries((prev) => {
      const exists = prev.find((b) => b.slideIndex === nextIdx)
      if (exists) return prev
      return [...prev, { slideIndex: nextIdx, startMs: nowMs }]
    })
    setCurrentSlideIdx(nextIdx)
    if (deckUrl) {
      setPdfPageNum(nextIdx + 1)
      await renderPage(nextIdx + 1)
    }
  }

  const stopRecording = async () => {
    if (!isRecording || !mediaRecorderRef.current) return

    return new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current!

      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((t) => t.stop())
        setIsRecording(false)
        console.log(
          'Recording stopped. Audio chunks:',
          audioChunksRef.current.length
        )
        resolve()
      }

      recorder.stop()
    })
  }

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${r.toString().padStart(2, '0')}`
  }

  const submitForAssessment = async () => {
    if (audioChunksRef.current.length === 0) {
      alert('No recording found. Please record your pitch first.')
      return
    }
    if (!totalSlides || totalSlides < 1) {
      alert('Please set total slides > 0')
      return
    }
    try {
      setIsProcessing(true)
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const form = new FormData()
      form.append('audio', audioBlob, 'recording.webm')
      form.append('totalSlides', String(totalSlides))
      form.append('slideBoundaries', JSON.stringify(slideBoundaries))
      if (referencePitch)
        form.append('referencePitch', JSON.stringify(referencePitch))

      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      }/api/v1/pitch-practice/assess`
      const res = await fetch(apiUrl, { method: 'POST', body: form })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Upload failed')
      }
      const json = await res.json()
      setResult(json.data as AssessmentResponse)
    } catch (e) {
      console.error(e)
      alert('Failed to process recording. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950'
          : 'bg-gradient-to-br from-gray-50 via-white to-indigo-50'
      }`}
    >
      <Navbar
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        showHomeLink={true}
        showMyPitchesLink={true}
        showLogout={true}
      />

      <main className='max-w-[1800px] mx-auto px-6 lg:px-10 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1
            className={`text-5xl font-black mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Pitch Practice Studio
          </h1>
          <p
            className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Perfect your pitch with real-time feedback and AI assessment
          </p>
        </div>

        {!deckUrl ? (
          /* Upload State */
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Upload Section */}
            <div
              className={`rounded-3xl p-8 border-2 border-dashed ${
                isDark
                  ? 'bg-gray-800/30 border-gray-700'
                  : 'bg-white border-gray-300'
              }`}
            >
              <h2
                className={`text-3xl font-bold mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Upload Your Deck
              </h2>

              <div className='space-y-6'>
                <div
                  className={`rounded-2xl p-12 text-center border-2 border-dashed transition-colors ${
                    isDark
                      ? 'bg-gray-900/50 border-gray-600 hover:border-indigo-500'
                      : 'bg-gray-50 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  <Upload
                    className={`w-16 h-16 mx-auto mb-4 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                  <label className='cursor-pointer'>
                    <span className='inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors'>
                      Choose PDF File
                    </span>
                    <input
                      type='file'
                      accept='application/pdf'
                      className='hidden'
                      onChange={handleDeckUpload}
                    />
                  </label>
                  <p
                    className={`mt-4 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Upload your pitch deck to get started
                  </p>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Total Slides
                    </label>
                    <input
                      type='number'
                      min={1}
                      value={totalSlides || ''}
                      onChange={(e) => setTotalSlides(Number(e.target.value))}
                      className={`w-full px-4 py-3 rounded-xl border text-lg ${
                        isDark
                          ? 'bg-gray-900/50 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder='e.g., 8'
                    />
                    {referencePitch?.sections && (
                      <p
                        className={`text-sm mt-2 ${
                          isDark ? 'text-indigo-400' : 'text-indigo-600'
                        }`}
                      >
                        💡 Suggestion: {referencePitch.sections.length} sections
                        in your generated pitch
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Target Duration (minutes)
                    </label>
                    <input
                      type='number'
                      min={1}
                      value={declaredTotalTimeMin}
                      onChange={(e) =>
                        setDeclaredTotalTimeMin(Number(e.target.value))
                      }
                      className={`w-full px-4 py-3 rounded-xl border text-lg ${
                        isDark
                          ? 'bg-gray-900/50 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Pitch */}
            <div
              className={`rounded-3xl p-8 border ${
                isDark
                  ? 'bg-gray-800/30 border-gray-700/50'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h2
                className={`text-3xl font-bold mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Reference Script
              </h2>
              {referencePitch?.sections ? (
                <div className='space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar'>
                  {referencePitch.sections.map((s, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border backdrop-blur-sm ${
                        isDark
                          ? 'bg-gray-900/50 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <p className='font-bold text-lg'>
                          {idx + 1}. {s.sectionName}
                        </p>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isDark
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {s.timeMinutes}m {s.timeSeconds}s
                        </span>
                      </div>
                      <p
                        className={`leading-relaxed ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {s.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`text-center py-12 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <p className='text-lg'>No reference pitch found</p>
                  <p className='text-sm mt-2'>
                    Generate one in the pitch generator first
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Recording State */
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Main Presentation Area */}
            <div className='lg:col-span-2 space-y-6'>
              {/* PDF Viewer */}
              <div
                className={`rounded-3xl overflow-hidden border ${
                  isDark
                    ? 'bg-gray-800/30 border-gray-700/50'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div
                  className={`px-6 py-4 border-b flex items-center justify-between ${
                    isDark
                      ? 'border-gray-700 bg-gray-900/50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className='flex items-center gap-4'>
                    <h3
                      className={`font-bold text-lg ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Slide {pdfPageNum} of {pdfPageCount}
                    </h3>
                    {isRecording && (
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse' />
                        <span
                          className={`text-sm font-medium ${
                            isDark ? 'text-red-400' : 'text-red-600'
                          }`}
                        >
                          Recording
                        </span>
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-3'>
                    <button
                      onClick={goPrevPage}
                      disabled={pdfPageNum <= 1}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronLeft className='w-5 h-5' />
                    </button>
                    <button
                      onClick={goNextPage}
                      disabled={pdfPageNum >= pdfPageCount}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronRight className='w-5 h-5' />
                    </button>
                  </div>
                </div>
                <div
                  className='p-6 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800'
                  style={{ minHeight: '600px' }}
                >
                  <canvas
                    ref={canvasRef}
                    className='max-w-full h-auto rounded-lg shadow-2xl'
                  />
                </div>
              </div>

              {/* Recording Controls */}
              <div
                className={`rounded-3xl p-6 border ${
                  isDark
                    ? 'bg-gray-800/30 border-gray-700/50'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-4'>
                    <Clock
                      className={`w-6 h-6 ${
                        isDark ? 'text-indigo-400' : 'text-indigo-600'
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Elapsed Time
                      </p>
                      <p className='text-3xl font-bold font-mono'>
                        {formatMs(elapsedMs)}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Current Slide
                    </p>
                    <p className='text-3xl font-bold'>
                      {currentSlideIdx + 1} / {totalSlides}
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-3'>
                  <button
                    onClick={startRecording}
                    disabled={isRecording}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRecording
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <Play className='w-5 h-5' />
                    Start
                  </button>

                  <button
                    onClick={nextSlide}
                    disabled={!isRecording}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    <SkipForward className='w-5 h-5' />
                    Next
                  </button>

                  <button
                    onClick={stopRecording}
                    disabled={!isRecording}
                    className='flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl'
                  >
                    <StopCircle className='w-5 h-5' />
                    Stop
                  </button>
                </div>

                <button
                  onClick={submitForAssessment}
                  disabled={
                    isRecording ||
                    isProcessing ||
                    audioChunksRef.current.length === 0 ||
                    !totalSlides
                  }
                  className='w-full mt-4 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl'
                >
                  {isProcessing ? (
                    <span className='inline-flex items-center gap-2'>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      Analyzing Your Pitch...
                    </span>
                  ) : (
                    'Get AI Assessment'
                  )}
                </button>
                <p
                  className={`text-xs text-center mt-3 ${
                    isDark ? 'text-gray-500' : 'text-gray-600'
                  }`}
                >
                  Powered by AssemblyAI transcription & Gemini AI analysis
                </p>
              </div>
            </div>

            {/* Sidebar - Assessment & Reference */}
            <div className='space-y-6'>
              {/* Assessment Results */}
              <div
                className={`rounded-3xl p-6 border ${
                  isDark
                    ? 'bg-gray-800/30 border-gray-700/50'
                    : 'bg-white border-gray-200'
                }`}
              >
                <h2
                  className={`text-2xl font-bold mb-6 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Assessment
                </h2>
                {result ? (
                  <div>
                    <div className='grid grid-cols-2 gap-4 mb-6'>
                      <div
                        className={`p-4 rounded-xl ${
                          isDark
                            ? 'bg-indigo-500/10 border border-indigo-500/20'
                            : 'bg-indigo-50 border border-indigo-200'
                        }`}
                      >
                        <p
                          className={`text-sm font-medium mb-1 ${
                            isDark ? 'text-indigo-300' : 'text-indigo-700'
                          }`}
                        >
                          Total Time
                        </p>
                        <p className='text-2xl font-bold'>
                          {formatMs(result.totalTimeMs)}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-xl ${
                          isDark
                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                            : 'bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        <p
                          className={`text-sm font-medium mb-1 ${
                            isDark ? 'text-emerald-300' : 'text-emerald-700'
                          }`}
                        >
                          Avg Score
                        </p>
                        <p className='text-2xl font-bold'>
                          {result.averageMark.toFixed(1)} / 5
                        </p>
                      </div>
                    </div>

                    <div className='space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar'>
                      {result.slides.map((s, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border ${
                            isDark
                              ? 'bg-gray-900/50 border-gray-700'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <p className='font-bold'>
                              Slide {s.slideIndex + 1}
                            </p>
                            <span
                              className={`px-2 py-1 rounded-lg text-sm font-bold ${
                                s.assessment.mark >= 4
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : s.assessment.mark >= 3
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {s.assessment.mark}/5
                            </span>
                          </div>
                          <p
                            className={`text-xs mb-2 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            Duration: {formatMs(s.durationMs)}
                          </p>
                          <p
                            className={`text-sm mb-2 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {s.assessment.advice}
                          </p>
                          <p
                            className={`text-xs opacity-60 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            "{s.text.substring(0, 100)}
                            {s.text.length > 100 ? '...' : ''}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-center py-12 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <p>
                      Record your pitch and submit to receive detailed
                      AI-powered feedback
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Reference */}
              {referencePitch?.sections && (
                <div
                  className={`rounded-3xl p-6 border ${
                    isDark
                      ? 'bg-gray-800/30 border-gray-700/50'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <h3
                    className={`text-xl font-bold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Quick Reference
                  </h3>
                  <div className='space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar'>
                    {referencePitch.sections.map((s, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl ${
                          isDark ? 'bg-gray-900/50' : 'bg-gray-50'
                        }`}
                      >
                        <div className='flex items-center justify-between mb-1'>
                          <p className='font-semibold text-sm'>
                            {idx + 1}. {s.sectionName}
                          </p>
                          <span
                            className={`text-xs ${
                              isDark ? 'text-indigo-400' : 'text-indigo-600'
                            }`}
                          >
                            {s.timeMinutes}m{s.timeSeconds}s
                          </span>
                        </div>
                        <p
                          className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {s.content.substring(0, 80)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDark
            ? 'rgba(55, 65, 81, 0.3)'
            : 'rgba(229, 231, 235, 0.5)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark
            ? 'rgba(99, 102, 241, 0.5)'
            : 'rgba(99, 102, 241, 0.3)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark
            ? 'rgba(99, 102, 241, 0.7)'
            : 'rgba(99, 102, 241, 0.5)'};
        }
      `}</style>
    </div>
  )
}

export default PitchPractisePage
