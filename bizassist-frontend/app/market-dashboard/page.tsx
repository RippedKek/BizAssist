'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, FileDown, ArrowRight, Loader2, ChevronDown } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

type MarketStat = {
  label: string
  value: string
  detail: string
}

type MarketRecord = {
  name: string
  percentage: number
  rationale: string
}

type GlobalHighlight = {
  region: string
  signal: string
  detail: string
  percentage: number
}

type Challenge = {
  label: string
  percentage: number
  detail: string
}

type Recommendation = {
  text: string
}

type Company = {
  name: string
  lat: number
  lng: number
  type: 'company' | 'office'
  district?: string
}

type MarketInsights = {
  headline: string
  feasibilityScore: {
    value: number
    label: string
    justification: string
  }
  stats: MarketStat[]
  topMarkets: MarketRecord[]
  globalHighlights: GlobalHighlight[]
  challenges: Challenge[]
  recommendations: Recommendation[]
  region: string
  companies: Company[]
}

const clampPercentage = (value: number) => {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

import dynamic from 'next/dynamic'
const RealWorldMap = dynamic(() => import('@/components/RealWorldMap'), { ssr: false })

// ---- Official district names (current English spellings) ----
// Source list uses current official names, e.g., Chattogram, Cumilla, Barishal, Jashore, Bogura. :contentReference[oaicite:1]{index=1}
const BD_DISTRICTS = [
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur','Chapai Nawabganj',
  'Chattogram',"Cox's Bazar",'Chuadanga','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur',
  'Gopalganj','Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachhari','Khulna',
  'Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur',
  'Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore','Netrokona','Nilphamari',
  'Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira',
  'Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon'
]

// Common alias → official (handles older spellings & punctuation)
const DISTRICT_ALIASES: Record<string, string> = {
  // 2018 renames (Govt. Gazette / press) :contentReference[oaicite:2]{index=2}
  'chittagong': 'Chattogram',
  'comilla': 'Cumilla',
  'barisal': 'Barishal',
  'jessore': 'Jashore',
  'bogra': 'Bogura',
  // punctuation/spacing variants
  'coxs bazar': "Cox's Bazar",
  'cox s bazar': "Cox's Bazar",
}

// Build a normalization map so we can canonicalize free-text names
const BD_BY_NORMALIZED: Record<string, string> = BD_DISTRICTS.reduce((acc, d) => {
  acc[
    d.toLowerCase()
      .replace(/['’\-.]/g, '')
      .replace(/\s+/g, ' ')
  ] = d
  return acc
}, {} as Record<string, string>)

const normalizeLoose = (s: string) =>
  s.toLowerCase().replace(/['’\-.]/g, '').replace(/\s+/g, ' ').trim()

const canonicalDistrict = (maybeName?: string | null): string | null => {
  if (!maybeName) return null
  const loose = normalizeLoose(maybeName)
  // alias first
  if (DISTRICT_ALIASES[loose]) return DISTRICT_ALIASES[loose]
  // exact normalized match to official list
  if (BD_BY_NORMALIZED[loose]) return BD_BY_NORMALIZED[loose]
  return null
}

const MarketDashboardPage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [summary, setSummary] = useState<string>('')
  const [insights, setInsights] = useState<MarketInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dropdown states
  const [timeframe, setTimeframe] = useState('last-6-months')
  const [region, setRegion] = useState('international')
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false)
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)

  const isDark = theme === 'dark'

  const timeframeOptions = [
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'last-6-months', label: 'Last 6 Months' },
    { value: 'last-12-months', label: 'Last 12 Months' },
    { value: 'last-24-months', label: 'Last 24 Months' }
  ]

  const regionOptions = [
    { value: 'bangladesh', label: 'Bangladesh' },
    { value: 'international', label: 'International' }
  ]

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const storedSummary = sessionStorage.getItem('bizassist-shared-summary')
      if (storedSummary) setSummary(storedSummary)
    } catch (error) {
      console.error('Error retrieving summary:', error)
    }
  }, [])

  useEffect(() => {
    if (!summary) return
    fetchInsights()
  }, [summary, timeframe, region])

  const fetchInsights = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const timeframeText = timeframeOptions.find(t => t.value === timeframe)?.label || 'Last 6 Months'
      const regionText = region === 'bangladesh' ? 'Bangladesh' : 'International'
      const contextualSummary = `${summary}. Business target is for ${regionText} and analysis required for ${timeframeText.toLowerCase()}.`

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/market-insights`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: contextualSummary }),
      })

      if (!response.ok) {
        throw new Error('Failed to load market insights')
      }

      const data = await response.json()
      if (!data?.success || !data?.insights) {
        throw new Error('Market insights response malformed')
      }

      setInsights(data.insights)
    } catch (fetchError) {
      console.error('Error fetching market insights:', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load market insights')
      setInsights(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (typeof window !== 'undefined' && summary) {
      try {
        sessionStorage.setItem('bizassist-shared-summary', summary)
      } catch (error) {
        console.error('Error storing summary:', error)
      }
    }
    window.location.href = '/idea-ranker'
  }

  const scoreValue = clampPercentage(insights?.feasibilityScore?.value ?? 0)
  const scoreLabel = insights?.feasibilityScore?.label ?? 'Awaiting analysis'
  const scoreJustification = insights?.feasibilityScore?.justification ?? 'Provide your idea summary to generate a feasibility score.'

  // ---- Pull "top districts" from AI (markets, highlights, and company tags) ----
  const aiTopDistricts = React.useMemo(() => {
    const out = new Set<string>()

    // from companies[].district
    for (const c of (insights?.companies || [])) {
      const canon = canonicalDistrict(c.district || '')
      if (canon) out.add(canon)
    }

    // from topMarkets names
    for (const t of (insights?.topMarkets || [])) {
      const canon = canonicalDistrict(t.name || '')
      if (canon) out.add(canon)
    }

    // from globalHighlights regions
    for (const g of (insights?.globalHighlights || [])) {
      const canon = canonicalDistrict(g.region || '')
      if (canon) out.add(canon)
    }

    return Array.from(out)
  }, [insights])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'}`}>
      <Navbar
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        showHomeLink={true}
        showMyPitchesLink={true}
        showLogout={true}
      />

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-8'>
        {/* Page Heading */}
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
          <div className="flex-1">
            <h1 className={`text-5xl font-black mb-4 ${isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'}`}>
              Global Market Feasibility
            </h1>
            <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              <span className="font-semibold">Your Idea:</span> {summary || 'Add your idea in the previous step to unlock insights'}
            </p>
            {insights?.headline && (
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} italic`}>
                {insights.headline}
              </p>
            )}
          </div>
          <button className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
            <FileDown className='w-5 h-5' />
            Export Report
          </button>
        </div>

        {/* Filter Chips */}
        <div className='flex gap-3 flex-wrap'>
          {/* Timeframe Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTimeframeDropdown(!showTimeframeDropdown)
                setShowRegionDropdown(false)
              }}
              disabled={isLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>{timeframeOptions.find(t => t.value === timeframe)?.label}</span>
              <ChevronDown className='w-4 h-4' />
            </button>
            {showTimeframeDropdown && (
              <div className={`absolute top-full mt-2 left-0 min-w-[200px] rounded-xl border shadow-xl z-50 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {timeframeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTimeframe(option.value)
                      setShowTimeframeDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      timeframe === option.value
                        ? isDark ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-900'
                        : isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Region Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRegionDropdown(!showRegionDropdown)
                setShowTimeframeDropdown(false)
              }}
              disabled={isLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>{regionOptions.find(r => r.value === region)?.label}</span>
              <ChevronDown className='w-4 h-4' />
            </button>
            {showRegionDropdown && (
              <div className={`absolute top-full mt-2 left-0 min-w-[200px] rounded-xl border shadow-xl z-50 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {regionOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setRegion(option.value)
                      setShowRegionDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      region === option.value
                        ? isDark ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-900'
                        : isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading/Error States */}
        {error && (
          <div className={`rounded-xl p-4 ${isDark ? 'bg-red-500/10 border border-red-500/40 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl border ${isDark ? 'border-blue-500/40 bg-blue-500/10' : 'border-blue-200 bg-blue-50'}`}>
            <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`font-medium ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
              Generating market insights for {regionOptions.find(r => r.value === region)?.label} ({timeframeOptions.find(t => t.value === timeframe)?.label.toLowerCase()})...
            </span>
          </div>
        )}

        {/* Main Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column */}
          <div className='lg:col-span-2 flex flex-col gap-8'>
            {/* Feasibility Score */}
            <div className={`p-8 rounded-2xl border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <p className='text-lg font-bold mb-1'>Feasibility Score</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{scoreLabel}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl font-black text-2xl ${isDark ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                  {scoreValue}/100
                </div>
              </div>
              <div className={`rounded-full h-3 mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-3 rounded-full transition-all ${isDark ? 'bg-blue-500' : 'bg-emerald-500'}`}
                  style={{ width: `${scoreValue}%` }}
                ></div>
              </div>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {scoreJustification}
              </p>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
              {(insights?.stats || []).map((stat) => (
                <div
                  key={stat.label}
                  className={`p-6 rounded-2xl border shadow-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                  <p className={`text-sm font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-black mb-2 ${isDark ? 'text-blue-400' : 'text-emerald-600'}`}>{stat.value}</p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Top Markets */}
            <div className={`p-8 rounded-2xl border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className='text-2xl font-bold mb-6'>Top 5 Potential Export Markets</h3>
              {insights?.topMarkets && insights.topMarkets.length > 0 ? (
                <div className='space-y-6'>
                  {insights.topMarkets.slice(0, 5).map((market, idx) => {
                    const share = clampPercentage(market.percentage)
                    return (
                      <div key={`${market.name}-${idx}`} className='space-y-3'>
                        <div className='flex items-center gap-4'>
                          <p className={`w-36 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {market.name}
                          </p>
                          <div className={`flex-1 h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className={`h-4 rounded-full ${isDark ? 'bg-blue-500' : 'bg-emerald-500'}`}
                              style={{ width: `${share}%` }}
                            ></div>
                          </div>
                          <span className={`text-base font-bold ${isDark ? 'text-blue-400' : 'text-emerald-600'}`}>
                            {share}%
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {market.rationale}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Analyzing export markets...
                </p>
              )}
            </div>

            {/* World Map */}
            <div className={`p-8 rounded-2xl border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className='text-2xl font-bold mb-6'>Global Market Map</h3>
              <RealWorldMap
                theme={theme}
                markets={insights?.topMarkets || []}
                region={region}                 // user's dropdown choice
                companies={insights?.companies || []}
                topDistricts={aiTopDistricts}   // <-- highlight these in Bangladesh mode
              />
            </div>

            {/* Global Demand Signals */}
            <div className={`p-8 rounded-2xl border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className='text-2xl font-bold mb-6'>Global Demand Signals</h3>
              {insights?.globalHighlights && insights.globalHighlights.length > 0 ? (
                <div className='space-y-6'>
                  {insights.globalHighlights.map((highlight, idx) => {
                    const intensity = clampPercentage(highlight.percentage)
                    return (
                      <div key={`${highlight.region}-${idx}`} className='space-y-3'>
                        <div className='flex items-start justify-between gap-4'>
                          <div>
                            <p className={`font-bold uppercase tracking-wide text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {highlight.region}
                            </p>
                            <p className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              {highlight.signal}
                            </p>
                          </div>
                          <span className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-emerald-600'}`}>
                            {intensity}%
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {highlight.detail}
                        </p>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full ${isDark ? 'bg-blue-500' : 'bg-emerald-500'}`}
                            style={{ width: `${intensity}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Analyzing demand signals...
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className='lg:col-span-1 flex flex-col gap-8'>
            {/* Challenges */}
            <div className={`p-8 rounded-2xl border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className='text-xl font-bold mb-6'>Key Execution Constraints</h3>
              {insights?.challenges && insights.challenges.length > 0 ? (
                <div className='space-y-5'>
                  {insights.challenges.map((challenge, idx) => {
                    const weight = clampPercentage(challenge.percentage)
                    return (
                      <div key={`${challenge.label}-${idx}`} className='space-y-2'>
                        <div className='flex items-center justify-between gap-3'>
                          <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {challenge.label}
                          </p>
                          <span className={`font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            {weight}%
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {challenge.detail}
                        </p>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className='h-full bg-red-500'
                            style={{ width: `${weight}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Identifying constraints...
                </p>
              )}
            </div>

            {/* Recommendations */}
            <div className={`p-8 rounded-2xl border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className='text-xl font-bold mb-6'>Strategic Recommendations</h3>
              {insights?.recommendations && insights.recommendations.length > 0 ? (
                <ul className='space-y-4'>
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className='flex items-start gap-3'>
                      <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {rec.text}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Generating recommendations...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className='flex justify-end'>
          <button
            onClick={handleNext}
            disabled={isLoading || !insights}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              isLoading || !insights
                ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDark ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white hover:shadow-xl' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white hover:shadow-xl'
            }`}
          >
            Rank Ideas
            <ArrowRight className='w-5 h-5' />
          </button>
        </div>
      </main>
    </div>
  )
}

export default MarketDashboardPage
