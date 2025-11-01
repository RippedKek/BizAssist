'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Download, Share, Sun, Moon, Loader2 } from 'lucide-react'

const IdeaRankerPage = () => {
  const [theme, setTheme] = useState('dark')
  const [summary, setSummary] = useState('')
  const [rankerData, setRankerData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)
  const isDark = theme === 'dark'

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedSummary = sessionStorage.getItem('bizassist-shared-summary')
      if (storedSummary) {
        setSummary(storedSummary)
        fetchIdeaRankerScore(storedSummary)
      } else {
        setError('No business summary found. Please go back and create one.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error retrieving summary:', error)
      setError('Failed to load business summary.')
      setIsLoading(false)
    }
  }, [])

  const fetchIdeaRankerScore = async (summaryText) => {
    setIsLoading(true)
    setError(null)

    try {
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      }/api/v1/idea-ranker`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: summaryText }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate idea ranker score')
      }

      const result = await response.json()
      setRankerData(result.data)
    } catch (error) {
      console.error('Error fetching idea ranker score:', error)
      setError('Failed to generate analysis. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!rankerData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 40

    ctx.clearRect(0, 0, width, height)

    const labels = [
      'Novelty',
      'Local Capability',
      'Feasibility',
      'Sustainability',
      'Global Demand',
    ]
    const data = [
      rankerData.scores.novelty.score,
      rankerData.scores.localCapability.score,
      rankerData.scores.feasibility.score,
      rankerData.scores.sustainability.score,
      rankerData.scores.globalDemand.score,
    ]
    const max = 100

    // Draw grid circles
    ctx.strokeStyle = isDark
      ? 'rgba(71, 85, 105, 0.5)'
      : 'rgba(203, 213, 225, 0.7)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (radius / 5) * i, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Draw axis lines
    const angleStep = (2 * Math.PI) / labels.length
    labels.forEach((label, i) => {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
    })

    // Draw data polygon
    ctx.beginPath()
    data.forEach((value, i) => {
      const angle = i * angleStep - Math.PI / 2
      const r = (value / max) * radius
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fillStyle = isDark
      ? 'rgba(59, 130, 246, 0.2)'
      : 'rgba(16, 185, 129, 0.2)'
    ctx.fill()
    ctx.strokeStyle = isDark ? '#3B82F6' : '#10B981'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw data points
    data.forEach((value, i) => {
      const angle = i * angleStep - Math.PI / 2
      const r = (value / max) * radius
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fillStyle = isDark ? '#3B82F6' : '#10B981'
      ctx.fill()
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw labels
    ctx.fillStyle = isDark ? 'rgba(248, 250, 252, 1)' : 'rgba(30, 41, 59, 1)'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    labels.forEach((label, i) => {
      const angle = i * angleStep - Math.PI / 2
      const labelRadius = radius + 30
      const x = centerX + labelRadius * Math.cos(angle)
      const y = centerY + labelRadius * Math.sin(angle)
      ctx.fillText(label, x, y)
    })
  }, [rankerData, theme, isDark])

  const handleLogout = async () => {
    try {
      const { getAuth, signOut } = await import('firebase/auth')
      const auth = getAuth()
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleGeneratePitch = () => {
    if (typeof window !== 'undefined' && summary) {
      try {
        sessionStorage.setItem('bizassist-shared-summary', summary)
      } catch (error) {
        console.error('Error storing summary:', error)
      }
    }
    window.location.href = '/pitch-generator'
  }

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className='text-center'>
          <Loader2
            className={`w-12 h-12 animate-spin mx-auto mb-4 ${
              isDark ? 'text-blue-500' : 'text-emerald-500'
            }`}
          />
          <p
            className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Analyzing your business idea...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className='text-center max-w-md'>
          <div className={`text-6xl mb-4`}>⚠️</div>
          <p
            className={`text-lg mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {error}
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white`}
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <nav
        className={`backdrop-blur-sm border-b ${
          isDark
            ? 'border-gray-800 bg-gray-900/80'
            : 'border-gray-200 bg-white/80'
        } sticky top-0 z-40`}
      >
        <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-10 h-10 rounded-xl ${
                isDark
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              } flex items-center justify-center shadow-lg`}
            >
              <Sparkles className='w-6 h-6 text-white' />
            </div>
            <span className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'>
              BizAssist
            </span>
          </div>

          <div className='flex items-center gap-4'>
            <a
              href='/'
              className={`${
                isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              Home
            </a>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm'
              }`}
            >
              <svg
                className='w-4 h-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              <span>Log Out</span>
            </button>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-100 border border-gray-300 shadow-sm'
              }`}
            >
              {isDark ? (
                <Sun className='w-5 h-5' />
              ) : (
                <Moon className='w-5 h-5' />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-6 lg:px-12 py-12'>
        {/* Title Section */}
        <div className='mb-12'>
          <h1
            className={`text-5xl font-black mb-3 ${
              isDark
                ? 'text-white'
                : 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'
            }`}
          >
            IdeaRanker Score for {rankerData?.ideaTitle || 'Your Business'}
          </h1>
          <p
            className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Comprehensive analysis of your idea's potential in the Bangladesh
            market
          </p>
        </div>

        {/* Main Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12'>
          {/* Radar Chart */}
          <div
            className={`lg:col-span-2 p-8 rounded-2xl border ${
              isDark
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            } shadow-xl`}
          >
            <h2 className='text-xl font-bold mb-6'>Performance Breakdown</h2>
            <div className='flex items-center justify-center p-4'>
              <canvas
                ref={canvasRef}
                width='500'
                height='500'
                className='max-w-full'
              ></canvas>
            </div>
          </div>

          {/* Right Column Cards */}
          <div className='flex flex-col gap-6'>
            {/* Pitch Readiness Index */}
            <div
              className={`p-8 rounded-2xl border ${
                isDark
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500'
                  : 'bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500'
              } text-white shadow-xl`}
            >
              <p className='text-lg font-semibold mb-2 opacity-90'>
                Pitch Readiness Index
              </p>
              <p className='text-sm font-bold mb-4'>
                {rankerData?.readinessLabel || 'Analyzing...'}
              </p>
              <div className='flex items-end gap-2'>
                <p className='text-7xl font-black'>
                  {rankerData?.overallScore || 0}
                </p>
                <span className='text-4xl opacity-80 mb-2'>/100</span>
              </div>
            </div>

            {/* Next Steps */}
            <div
              className={`p-8 rounded-2xl border ${
                isDark
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white border-gray-200'
              } shadow-xl`}
            >
              <div className='flex items-center gap-2 mb-4'>
                <svg
                  className='w-5 h-5 text-blue-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                  />
                </svg>
                <h3 className='text-xl font-bold'>Next Steps</h3>
              </div>
              <ul className='space-y-4'>
                {rankerData?.nextSteps?.map((step, idx) => (
                  <li key={idx} className='flex items-start gap-3'>
                    <div
                      className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDark ? 'bg-blue-600' : 'bg-emerald-600'
                      } text-white text-sm font-bold`}
                    >
                      {idx + 1}
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {step.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div
          className={`rounded-2xl border ${
            isDark
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          } shadow-xl overflow-hidden`}
        >
          <div className="p-8 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}">
            <h2 className='text-2xl font-bold'>Detailed Score Breakdown</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 p-8'>
            {rankerData &&
              Object.entries(rankerData.scores).map(([key, value], idx) => {
                const labels = {
                  novelty: 'Novelty',
                  localCapability: 'Local Capability',
                  feasibility: 'Feasibility',
                  sustainability: 'Sustainability',
                  globalDemand: 'Global Demand',
                }

                return (
                  <div
                    key={key}
                    className={`flex flex-col gap-3 border-t py-6 ${
                      idx % 2 === 0 ? 'md:pr-4' : 'md:pl-4'
                    } ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className='flex items-center justify-between'>
                      <p
                        className={`text-sm font-bold uppercase tracking-wide ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {labels[key]}
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          isDark
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {value.score}/100
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {value.justification}
                    </p>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-12 flex flex-col sm:flex-row items-center justify-center gap-4'>
          <button
            onClick={handleGeneratePitch}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl ${
              isDark
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
            }`}
          >
            <Sparkles className='w-5 h-5' />
            Generate Full Pitch
          </button>
          <button
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            <Download className='w-5 h-5' />
            Download PDF
          </button>
          <button
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            <Share className='w-5 h-5' />
            Share
          </button>
        </div>
      </main>
    </div>
  )
}

export default IdeaRankerPage
