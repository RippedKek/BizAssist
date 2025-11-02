'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Copy, Download, ChevronDown, Check, Wand2, X, Clock, FileText, Info, Presentation, ArrowRight } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

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

const availableSections = [
  { id: 'intro', label: 'Introduction', description: 'Opening hook and overview' },
  { id: 'problem', label: 'The Problem', description: 'Problem statement and pain points' },
  { id: 'solution', label: 'The Solution', description: 'Your unique solution' },
  { id: 'market', label: 'Target Market', description: 'Market analysis and opportunity' },
  { id: 'businessModel', label: 'Business Model', description: 'Revenue streams and monetization' },
  { id: 'traction', label: 'Traction', description: 'Progress and achievements' },
  { id: 'team', label: 'Team', description: 'Team members and expertise' },
  { id: 'ask', label: 'The Ask', description: 'Funding needs and use of funds' },
  { id: 'conclusion', label: 'Conclusion', description: 'Closing statement and next steps' },
]

const PitchGeneratorPage = () => {
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [summary, setSummary] = useState('')
  const [showNameModal, setShowNameModal] = useState(false)
  const [businessTitle, setBusinessTitle] = useState('')
  const [businessNameSuggestions, setBusinessNameSuggestions] = useState<string[]>([])
  const [loadingNames, setLoadingNames] = useState(false)
  const [selectedSections, setSelectedSections] = useState<string[]>(['problem', 'solution', 'market', 'ask'])
  const [timeLimit, setTimeLimit] = useState(5)
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [pitchSpeech, setPitchSpeech] = useState<PitchSpeechData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedSummary = sessionStorage.getItem('bizassist-shared-summary')
      if (storedSummary) {
        setSummary(storedSummary)
        // Show name modal when page loads with summary
        setShowNameModal(true)
        fetchBusinessNames(storedSummary)
      }
    } catch (error) {
      console.error('Error retrieving summary:', error)
    }
  }, [])

  const fetchBusinessNames = async (summaryText: string) => {
    setLoadingNames(true)
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/business-names`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: summaryText }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate business names')
      }

      const result = await response.json()
      setBusinessNameSuggestions(result.data.names || [])
    } catch (error) {
      console.error('Error fetching business names:', error)
    } finally {
      setLoadingNames(false)
    }
  }

  const handleSelectName = (name: string) => {
    setBusinessTitle(name)
    // Save businessTitle to sessionStorage immediately when selected
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bizassist-business-title', name)
    }
    setShowNameModal(false)
  }

  const handleCustomName = () => {
    setShowNameModal(false)
  }

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleGeneratePitch = async () => {
    if (!businessTitle.trim()) {
      alert('Please enter or select a business title')
      return
    }

    if (!summary.trim()) {
      alert('Please provide your business idea')
      return
    }

    if (selectedSections.length === 0) {
      alert('Please select at least one section for your pitch')
      return
    }

    setIsGenerating(true)
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/pitch-speech`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          businessTitle,
          selectedSections,
          timeLimit,
          ...(additionalInfo.trim() && { additionalInfo: additionalInfo.trim() }),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate pitch speech')
      }

      const result = await response.json()
      setPitchSpeech(result.data)
    } catch (error) {
      console.error('Error generating pitch:', error)
      alert('Failed to generate pitch. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadCSV = () => {
    if (!pitchSpeech) return

    const csvRows = [
      ['Section', 'Content', 'Time (Minutes)', 'Time (Seconds)', 'Notes'],
      ...pitchSpeech.sections.map((section) => [
        section.sectionName,
        `"${section.content.replace(/"/g, '""')}"`,
        section.timeMinutes.toString(),
        section.timeSeconds.toString(),
        section.notes ? `"${section.notes.replace(/"/g, '""')}"` : '',
      ]),
      [
        'TOTAL',
        '',
        pitchSpeech.totalTimeMinutes.toString(),
        pitchSpeech.totalTimeSeconds.toString(),
        '',
      ],
    ]

    const csvContent = csvRows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${businessTitle || 'pitch'}_speech.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyPitch = async () => {
    if (!pitchSpeech) return

    const fullPitch = pitchSpeech.sections
      .map((section) => {
        const timeStr = `${section.timeMinutes}m ${section.timeSeconds}s`
        return `[${timeStr}] ${section.sectionName.toUpperCase()}\n${section.content}${section.notes ? `\n\nNote: ${section.notes}` : ''}`
      })
      .join('\n\n---\n\n')

    try {
      await navigator.clipboard.writeText(fullPitch)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes}m ${seconds}s`
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

      {/* Business Name Modal */}
      {showNameModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
          <div
            className={`w-full max-w-2xl rounded-xl border ${
              isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            } shadow-2xl`}
          >
            <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} flex justify-between items-center`}>
              <h2 className='text-2xl font-bold'>Choose Your Business Name</h2>
              <button
                onClick={() => setShowNameModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='p-6 space-y-6'>
              {loadingNames ? (
                <div className='flex items-center justify-center py-8'>
                  <Sparkles className={`w-8 h-8 animate-spin ${isDark ? 'text-blue-500' : 'text-emerald-500'}`} />
                </div>
              ) : (
                <>
                  <div>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Select a suggested name or enter your own:
                    </p>
                    <div className='grid grid-cols-2 gap-3 mb-4'>
                      {businessNameSuggestions.map((name, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectName(name)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isDark
                              ? 'border-gray-700 hover:border-blue-500 hover:bg-gray-800'
                              : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className='font-medium'>{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Or enter your own business name:
                    </label>
                    <input
                      type='text'
                      value={businessTitle}
                      onChange={(e) => {
                        const value = e.target.value
                        setBusinessTitle(value)
                        // Save businessTitle to sessionStorage as user types
                        if (typeof window !== 'undefined' && value.trim()) {
                          sessionStorage.setItem('bizassist-business-title', value)
                        }
                      }}
                      placeholder='Enter business name...'
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                      } focus:outline-none focus:ring-2 ${
                        isDark ? 'focus:ring-blue-500/20' : 'focus:ring-emerald-500/20'
                      }`}
                    />
                  </div>

                  <div className='flex gap-3'>
                    <button
                      onClick={handleCustomName}
                      disabled={!businessTitle.trim()}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700 disabled:opacity-50'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300 disabled:opacity-50'
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-6 lg:px-12 py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Left Column - Input */}
          <div className='space-y-8'>
            <div>
              <h1
                className={`text-5xl font-black mb-4 leading-tight ${
                  isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'
                }`}
              >
                Transform Your Idea Into a Professional Pitch
              </h1>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Create a customized pitch speech with precise timing for each section.
              </p>
            </div>

            {/* Business Title Display */}
            {businessTitle && (
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Business Name:</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{businessTitle}</p>
              </div>
            )}

            {/* Section Selection */}
            <div className={`p-6 rounded-2xl border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <label className='block text-lg font-bold mb-4'>Select Pitch Sections</label>
              <div className='space-y-3'>
                {availableSections.map((section) => (
                  <label
                    key={section.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSections.includes(section.id)
                        ? isDark
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-emerald-500 bg-emerald-50'
                        : isDark
                          ? 'border-gray-700 hover:border-gray-600'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type='checkbox'
                      checked={selectedSections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className='mt-1 w-5 h-5 rounded'
                    />
                    <div className='flex-1'>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{section.label}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{section.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Limit Selection */}
            <div className={`p-6 rounded-2xl border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <label className='block text-lg font-bold mb-4 flex items-center gap-2'>
                <Clock className='w-5 h-5' />
                Time Limit
              </label>
              <div className='flex items-center gap-4'>
                <input
                  type='range'
                  min='2'
                  max='15'
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className='flex-1'
                />
                <span className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-emerald-600'}`}>
                  {timeLimit} min
                </span>
              </div>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Recommended: 3-5 minutes for elevator pitch, 5-10 minutes for detailed presentation
              </p>
            </div>

            {/* Additional Information */}
            <div className={`p-6 rounded-2xl border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <label className='block text-lg font-bold mb-4 flex items-center gap-2'>
                <Info className='w-5 h-5' />
                Additional Guidance (Optional)
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder='E.g., "Presenting at TechCrunch Disrupt", "Judges are VC investors focused on SaaS", "Emphasize scalability and market size", "Target audience is startup founders"...'
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border resize-none ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                } focus:outline-none focus:ring-2 ${
                  isDark ? 'focus:ring-blue-500/20' : 'focus:ring-emerald-500/20'
                }`}
              />
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Provide context about where you'll present, who your audience is, or what aspects to emphasize. This helps AI tailor your pitch perfectly.
              </p>
            </div>

            <button
              onClick={handleGeneratePitch}
              disabled={!businessTitle || !summary.trim() || selectedSections.length === 0 || isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white disabled:from-gray-700 disabled:to-gray-700'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white disabled:from-gray-300 disabled:to-gray-300'
              } disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-xl`}
            >
              {isGenerating ? (
                <>
                  <Sparkles className='w-6 h-6 animate-spin' />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className='w-6 h-6' />
                  Generate Pitch
                </>
              )}
            </button>
          </div>

          {/* Right Column - Output */}
          <div>
            {pitchSpeech ? (
              <div className={`rounded-2xl border shadow-xl overflow-hidden ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Header */}
                <div
                  className={`px-8 py-6 border-b ${
                    isDark ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white'
                  }`}
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <h2 className='text-2xl font-bold mb-1'>Your Pitch Speech</h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Time: {formatTime(pitchSpeech.totalTimeMinutes, pitchSpeech.totalTimeSeconds)}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={handleCopyPitch}
                        className={`p-2.5 rounded-lg transition-all ${
                          copied
                            ? isDark
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-100 text-emerald-700'
                            : isDark
                              ? 'hover:bg-gray-700'
                              : 'hover:bg-gray-100'
                        }`}
                        aria-label='Copy pitch'
                      >
                        {copied ? <Check className='w-5 h-5' /> : <Copy className='w-5 h-5' />}
                      </button>
                      <button
                        onClick={handleDownloadCSV}
                        className={`p-2.5 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all`}
                        aria-label='Download CSV'
                      >
                        <FileText className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className='flex gap-3 mt-4'>
                    <button
                      onClick={() => {
                        // Save businessTitle to sessionStorage
                        if (typeof window !== 'undefined' && businessTitle) {
                          sessionStorage.setItem('bizassist-business-title', businessTitle)
                        }
                        const pitchData = {
                          pitchSpeech,
                          businessTitle,
                          summary,
                        }
                        sessionStorage.setItem('bizassist-pitch-data', JSON.stringify(pitchData))
                        router.push('/slide-generator')
                      }}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        isDark
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
                      }`}
                    >
                      <Presentation className='w-5 h-5' />
                      Generate Slides
                    </button>
                    <button
                      onClick={() => {
                        // Save businessTitle to sessionStorage before navigating
                        if (typeof window !== 'undefined' && businessTitle) {
                          sessionStorage.setItem('bizassist-business-title', businessTitle)
                          // Also save it in pitch-data for consistency
                          try {
                            const pitchData = {
                              pitchSpeech,
                              businessTitle,
                              summary,
                            }
                            sessionStorage.setItem('bizassist-pitch-data', JSON.stringify(pitchData))
                          } catch (error) {
                            console.error('Error saving pitch data:', error)
                          }
                        }
                        router.push(`/visual-branding`)
                      }}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        isDark
                          ? 'border border-gray-600 hover:bg-gray-800 text-gray-300'
                          : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Skip to Visual Branding
                      <ArrowRight className='w-5 h-5' />
                    </button>
                  </div>
                </div>

                {/* Pitch Content */}
                <div className='p-8 space-y-6 max-h-[calc(100vh-150px)] overflow-y-auto'>
                  {pitchSpeech.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-xl overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <div
                        className={`px-6 py-4 flex items-center justify-between ${
                          isDark ? 'bg-gray-900/50' : 'bg-gray-50'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                            <span className='text-white font-bold'>{idx + 1}</span>
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {section.sectionName}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-emerald-600'} font-medium`}>
                              {formatTime(section.timeMinutes, section.timeSeconds)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed whitespace-pre-wrap`}>
                        {section.content}
                        {section.notes && (
                          <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <p className={`text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <strong>Note:</strong> {section.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className={`rounded-2xl border shadow-xl p-12 text-center ${
                  isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <Wand2 className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your generated pitch speech will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PitchGeneratorPage
