'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ChevronLeft, ChevronRight, Download, Presentation, ArrowRight, Loader2 } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

import PptxGenJS from 'pptxgenjs'

interface PitchSection {
  sectionName: string
  content: string
  timeMinutes: number
  timeSeconds: number
  notes?: string
}

interface PitchSpeechData {
  sections: PitchSection[]
  totalTimeMinutes: number
  totalTimeSeconds: number
}

interface SlideData {
  sectionIndex: number
  sectionName: string
  slideCode: string
  rendered: boolean
}

const SlideGeneratorPage = () => {
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [pitchSpeech, setPitchSpeech] = useState<PitchSpeechData | null>(null)
  const [businessTitle, setBusinessTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [slides, setSlides] = useState<SlideData[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(-1)
  const [slideElements, setSlideElements] = useState<Record<number, JSX.Element>>({})

  const isDark = theme === 'dark'

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const pitchDataStr = sessionStorage.getItem('bizassist-pitch-data')
      if (!pitchDataStr) {
        router.push('/pitch-generator')
        return
      }

      const pitchData = JSON.parse(pitchDataStr)
      setPitchSpeech(pitchData.pitchSpeech)
      setBusinessTitle(pitchData.businessTitle)
      setSummary(pitchData.summary)

      // Initialize slides array
      const initialSlides: SlideData[] = pitchData.pitchSpeech.sections.map((section: PitchSection, index: number) => ({
        sectionIndex: index,
        sectionName: section.sectionName,
        slideCode: '',
        rendered: false,
      }))
      setSlides(initialSlides)
    } catch (error) {
      console.error('Error loading pitch data:', error)
      router.push('/pitch-generator')
    }
  }, [router])

  const generateSlideCode = async (sectionIndex: number, sectionName: string, content: string) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/generate-slide`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName,
          sectionContent: content,
          businessTitle,
          summary,
          slideNumber: sectionIndex + 1,
          totalSlides: pitchSpeech?.sections.length || 0,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate slide code')
      }

      const result = await response.json()
      return result.data.slideCode
    } catch (error) {
      console.error('Error generating slide:', error)
      throw error
    }
  }

  const renderSlidePreview = (sectionIndex: number): JSX.Element => {
    if (!pitchSpeech || !pitchSpeech.sections[sectionIndex]) {
      return (
        <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>No slide data available</p>
        </div>
      )
    }

    const section = pitchSpeech.sections[sectionIndex]
    const contentLines = section.content.split('\n').filter((line) => line.trim())

    return (
      <div
        className={`w-full h-full rounded-lg p-12 flex flex-col ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white' : 'bg-white text-gray-900'
        }`}
        style={{ minHeight: '500px' }}
      >
        <h2
          className={`text-4xl font-bold mb-6 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}
        >
          {section.sectionName}
        </h2>
        <div className="flex-1 space-y-4">
          {contentLines.map((line, idx) => {
            // Check if it's a bullet point or heading
            const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•')
            const isHeading = line.length < 80 && !line.includes('.') && line === line.toUpperCase()

            if (isHeading) {
              return (
                <h3 key={idx} className={`text-2xl font-semibold mt-6 mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {line.trim()}
                </h3>
              )
            }

            if (isBullet) {
              return (
                <div key={idx} className="flex items-start gap-3">
                  <span className={`text-2xl mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>•</span>
                  <p className={`text-lg flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {line.replace(/^[-•]\s*/, '').trim()}
                  </p>
                </div>
              )
            }

            return (
              <p key={idx} className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {line.trim()}
              </p>
            )
          })}
        </div>
        {section.notes && (
          <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Note:</strong> {section.notes}
            </p>
          </div>
        )}
      </div>
    )
  }

  const generateAllSlides = async () => {
    if (!pitchSpeech) return

    setIsGenerating(true)
    setCurrentGeneratingIndex(0)

    for (let i = 0; i < pitchSpeech.sections.length; i++) {
      setCurrentGeneratingIndex(i)
      const section = pitchSpeech.sections[i]

      try {
        const slideCode = await generateSlideCode(i, section.sectionName, section.content)

        setSlides((prev) => {
          const updated = [...prev]
          updated[i] = { ...updated[i], slideCode, rendered: true }
          return updated
        })

        // Mark as rendered - preview will be generated from section content
        setSlideElements((prev) => ({ ...prev, [i]: renderSlidePreview(i) }))

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Error generating slide ${i + 1}:`, error)
      }
    }

    setIsGenerating(false)
    setCurrentGeneratingIndex(-1)
  }

  const handleDownloadPresentation = async () => {
    if (!pitchSpeech || !PptxGenJS) {
      alert('pptxgenjs library is not available. Please ensure it is installed.')
      return
    }

    try {
      const pptx = new PptxGenJS()
      pptx.layout = 'LAYOUT_WIDE'

      // Generate all slide codes if not already generated
      if (slides.some((s) => !s.slideCode)) {
        setIsGenerating(true)
        await generateAllSlides()
        // Wait a bit for all slides to generate
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setIsGenerating(false)
      }

      // Execute all slide codes to build the presentation
      slides.forEach((slide, index) => {
        if (slide.slideCode) {
          try {
            // Execute the generated code to add slide to presentation
            const slideFunction = new Function('pptx', slide.slideCode)
            slideFunction(pptx)
          } catch (error) {
            console.error(`Error adding slide ${index + 1} to presentation:`, error)
            // If code execution fails, create a simple fallback slide
            const fallbackSlide = pptx.addSlide()
            fallbackSlide.addText(slide.sectionName, {
              x: 0.5,
              y: 1,
              w: 9,
              h: 0.8,
              fontSize: 32,
              bold: true,
            })
            if (pitchSpeech.sections[index]) {
              const content = pitchSpeech.sections[index].content.substring(0, 500)
              fallbackSlide.addText(content, {
                x: 0.5,
                y: 2,
                w: 9,
                h: 4,
                fontSize: 16,
              })
            }
          }
        }
      })

      // Save the presentation
      await pptx.writeFile({ fileName: `${businessTitle || 'presentation'}.pptx` })
    } catch (error) {
      console.error('Error downloading presentation:', error)
      alert('Failed to download presentation. Please try again.')
    }
  }

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'
      }`}
    >
      <Navbar
        theme={theme}
        onThemeChange={(newTheme: 'dark' | 'light') => setTheme(newTheme)}
        showHomeLink={true}
        showMyPitchesLink={true}
        showLogout={true}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-5xl font-black mb-4 leading-tight ${
              isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'
            }`}
          >
            Generate Your Presentation Slides
          </h1>
          <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            AI-powered slide generation based on your pitch speech
          </p>
          {businessTitle && (
            <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Business Name:</p>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{businessTitle}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={`mb-6 p-6 rounded-2xl border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={generateAllSlides}
                disabled={isGenerating || !pitchSpeech}
                className={`py-3 px-6 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white disabled:from-gray-700 disabled:to-gray-700'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white disabled:from-gray-300 disabled:to-gray-300'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate All Slides
                  </>
                )}
              </button>
              {slides.some((s) => s.rendered) && (
                <button
                  onClick={handleDownloadPresentation}
                  className={`py-3 px-6 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <Download className="w-5 h-5" />
                  Download PPTX
                </button>
              )}
            </div>
            <button
              onClick={() => {
                const ideaParam = encodeURIComponent(summary)
                router.push(`/visual-branding?idea=${ideaParam}`)
              }}
              className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                isDark
                  ? 'border border-gray-600 hover:bg-gray-800 text-gray-300'
                  : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              Skip to Visual Branding
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Display */}
        <div className={`rounded-2xl border shadow-xl overflow-hidden ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          {isGenerating && currentGeneratingIndex >= 0 ? (
            <div className="p-12 text-center">
              <Loader2 className={`w-16 h-16 mx-auto mb-4 animate-spin ${isDark ? 'text-blue-500' : 'text-emerald-500'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Generating slide {currentGeneratingIndex + 1} of {pitchSpeech?.sections.length || 0}:{' '}
                {pitchSpeech?.sections[currentGeneratingIndex]?.sectionName}
              </p>
            </div>
          ) : slides.length > 0 ? (
            <>
              {/* Slide Navigation */}
              <div
                className={`px-8 py-4 border-b flex items-center justify-between ${
                  isDark ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={prevSlide}
                    disabled={currentSlideIndex === 0}
                    className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Slide {currentSlideIndex + 1} of {slides.length}
                  </span>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlideIndex === slides.length - 1}
                    className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {slides[currentSlideIndex]?.sectionName}
                </h3>
              </div>

              {/* Slide Preview */}
              <div className="p-8 min-h-[600px] flex items-center justify-center">
                {slideElements[currentSlideIndex] ? (
                  <div className="w-full max-w-4xl">{slideElements[currentSlideIndex]}</div>
                ) : pitchSpeech && pitchSpeech.sections[currentSlideIndex] ? (
                  <div className="w-full max-w-4xl">{renderSlidePreview(currentSlideIndex)}</div>
                ) : (
                  <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Presentation className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Click "Generate All Slides" to create this slide</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <Presentation className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No pitch data found. Please generate a pitch first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SlideGeneratorPage

