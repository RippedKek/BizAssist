'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CheckCircle,
  ChevronDown,
  FileDown,
  Menu,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react'

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
}

const clampPercentage = (value: number) => {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

const MarketDashboardPage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [summary, setSummary] = useState<string>('')
  const [insights, setInsights] = useState<MarketInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isDark = theme === 'dark'

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedSummary = sessionStorage.getItem('bizassist-shared-summary')
      if (storedSummary) {
        setSummary(storedSummary)
      }
    } catch (error) {
      console.error('Error retrieving summary:', error)
    }
  }, [])

  useEffect(() => {
    if (!summary) return

    let isMounted = true

    const fetchInsights = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const apiUrl = `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        }/api/v1/market-insights`

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ summary }),
        })

        if (!response.ok) {
          throw new Error('Failed to load market insights')
        }

        const data = await response.json()

        if (!data?.success || !data?.insights) {
          throw new Error('Market insights response malformed')
        }

        if (isMounted) {
          setInsights(data.insights)
        }
      } catch (fetchError) {
        console.error('Error fetching market insights:', fetchError)
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Unable to load market insights'
          )
          setInsights(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchInsights()

    return () => {
      isMounted = false
    }
  }, [summary])

  const scoreValue = clampPercentage(insights?.feasibilityScore?.value ?? 0)
  const scoreLabel = insights?.feasibilityScore?.label ?? 'Awaiting analysis'
  const scoreJustification =
    insights?.feasibilityScore?.justification ??
    'Provide your idea summary to generate a feasibility score.'

  const statsToDisplay =
    insights?.stats && insights.stats.length > 0
      ? insights.stats
      : [
          {
            label: 'Total Addressable Market',
            value: '—',
            detail: 'Run the analysis to estimate market size.',
          },
          {
            label: 'Projected Growth (YoY)',
            value: '—',
            detail: 'Growth projections will appear here.',
          },
          {
            label: 'Top Competitors',
            value: '—',
            detail: 'Competitive landscape will be summarized here.',
          },
        ]
  const topMarkets = insights?.topMarkets ?? []
  const highlights = insights?.globalHighlights ?? []
  const challenges = insights?.challenges ?? []
  const recommendations = insights?.recommendations ?? []

  const handleNext = () => {
    if (typeof window !== 'undefined' && summary) {
      try {
        sessionStorage.setItem('bizassist-shared-summary', summary)
      } catch (error) {
        console.error('Error storing summary for next step:', error)
      }
    }

    router.push('/idea-ranker')
  }
  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <nav
        className={`border-b ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        } sticky top-0 z-10 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      >
        <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div
              className={`w-8 h-8 rounded-lg ${
                isDark ? 'bg-blue-600' : 'bg-emerald-600'
              } flex items-center justify-center`}
            >
              <Sparkles className='w-5 h-5 text-white' />
            </div>
            <span className='text-xl font-bold'>BizAssist</span>
          </div>

          <div className='flex items-center gap-6'>
            <a
              href='#'
              className={`${
                isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </a>
            <a
              href='#'
              className={`${
                isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Pitches
            </a>
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              Log Out
            </button>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-100 border border-gray-300'
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
      <main className='max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8'>
        {/* Page Heading */}
        <div className='flex flex-wrap justify-between items-start gap-4'>
          <div>
            <h1 className='text-4xl font-black mb-3'>
              Global Market Feasibility Dashboard
            </h1>
            <p
              className={`text-base ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Your Idea:{' '}
              {summary ||
                'Add your idea in the previous step to unlock insights'}
            </p>
            <p
              className={`mt-2 text-sm ${
                isDark ? 'text-gray-500' : 'text-gray-600'
              }`}
            >
              {insights?.headline
                ? insights.headline
                : isLoading
                ? 'We are preparing a market brief for you...'
                : 'Generate a summary to receive a tailored market brief.'}
            </p>
          </div>
          <button className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors'>
            <FileDown className='w-4 h-4' />
            Export Report
          </button>
        </div>

        {error && (
          <div
            className={`border rounded-lg px-4 py-3 text-sm ${
              isDark
                ? 'border-red-500/40 bg-red-500/10 text-red-300'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {error}
          </div>
        )}

        {isLoading && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
              isDark
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-200'
                : 'border-blue-200 bg-blue-50 text-blue-700'
            }`}
          >
            <Sparkles className='w-4 h-4 animate-spin' />
            <span className='text-sm font-medium'>
              Generating fresh market insights…
            </span>
          </div>
        )}

        {/* Filter Chips */}
        <div className='flex gap-3 overflow-x-auto pb-2'>
          <button
            className={`flex items-center gap-2 h-8 px-4 rounded-lg ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className='text-sm font-medium'>Product Category</span>
            <ChevronDown className='w-4 h-4' />
          </button>
          <button
            className={`flex items-center gap-2 h-8 px-4 rounded-lg ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className='text-sm font-medium'>Last 6 Months</span>
            <ChevronDown className='w-4 h-4' />
          </button>
          <button
            className={`flex items-center gap-2 h-8 px-4 rounded-lg ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className='text-sm font-medium'>All Regions</span>
            <ChevronDown className='w-4 h-4' />
          </button>
        </div>

        {/* Main Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column */}
          <div className='lg:col-span-2 flex flex-col gap-6'>
            {/* Feasibility Score */}
            <div
              className={`p-6 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className='flex justify-between items-center mb-3'>
                <p className='text-base font-medium'>Feasibility Score</p>
                <p className='text-blue-500 text-2xl font-bold'>
                  {scoreValue}/100
                </p>
              </div>
              <div
                className={`rounded-full h-2 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <div
                  className='h-2 rounded-full bg-blue-600 transition-all'
                  style={{ width: `${scoreValue}%` }}
                ></div>
              </div>
              <p
                className={`text-sm mt-3 font-semibold ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {scoreLabel}
              </p>
              <p
                className={`text-sm mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {scoreJustification}
              </p>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              {statsToDisplay.map((stat) => (
                <div
                  key={stat.label}
                  className={`p-6 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <p
                    className={`text-base font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stat.label}
                  </p>
                  <p className='text-2xl font-bold'>{stat.value}</p>
                  <p
                    className={`text-sm mt-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Top 5 Markets */}
            <div
              className={`p-6 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3 className='text-lg font-bold mb-4'>
                Top 5 Potential Export Markets
              </h3>
              {topMarkets.length > 0 ? (
                <div className='space-y-4'>
                  {topMarkets.slice(0, 5).map((market) => {
                    const share = clampPercentage(market.percentage)
                    return (
                      <div
                        key={`${market.name}-${share}`}
                        className='space-y-2'
                      >
                        <div className='flex items-center gap-4'>
                          <p
                            className={`w-32 text-sm font-medium ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {market.name}
                          </p>
                          <div
                            className={`flex-1 h-3 rounded-full ${
                              isDark ? 'bg-gray-700' : 'bg-gray-200'
                            }`}
                          >
                            <div
                              className='bg-blue-600 h-3 rounded-full transition-all'
                              style={{ width: `${share}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              isDark ? 'text-blue-300' : 'text-blue-600'
                            }`}
                          >
                            {share}%
                          </span>
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {market.rationale}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p
                  className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Run the analysis to identify your strongest expansion markets.
                </p>
              )}
            </div>

            {/* World Map */}
            <div
              className={`p-6 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3 className='text-lg font-bold mb-4'>Global Demand Signals</h3>
              {highlights.length > 0 ? (
                <div className='space-y-5'>
                  {highlights.map((highlight) => {
                    const intensity = clampPercentage(highlight.percentage)
                    return (
                      <div
                        key={`${highlight.region}-${highlight.signal}`}
                        className='space-y-2'
                      >
                        <div className='flex items-start justify-between gap-4'>
                          <div>
                            <p
                              className={`text-sm font-semibold uppercase tracking-wide ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {highlight.region}
                            </p>
                            <p
                              className={`text-sm ${
                                isDark ? 'text-emerald-300' : 'text-emerald-600'
                              }`}
                            >
                              {highlight.signal}
                            </p>
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              isDark ? 'text-blue-300' : 'text-blue-600'
                            }`}
                          >
                            {intensity}%
                          </span>
                        </div>
                        <p
                          className={`text-sm leading-relaxed ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {highlight.detail}
                        </p>
                        <div
                          className={`h-1.5 rounded-full overflow-hidden ${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <div
                            className='h-full bg-blue-500'
                            style={{ width: `${intensity}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p
                  className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Requesting global demand signals from our AI analyst...
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className='lg:col-span-1 flex flex-col gap-6'>
            {/* Challenges Donut */}
            <div
              className={`p-6 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3 className='text-lg font-bold mb-4'>
                Key Execution Constraints
              </h3>
              {challenges.length > 0 ? (
                <div className='space-y-4'>
                  {challenges.map((challenge) => {
                    const weight = clampPercentage(challenge.percentage)
                    return (
                      <div key={challenge.label} className='space-y-2'>
                        <div className='flex items-center justify-between gap-3'>
                          <p
                            className={`text-sm font-medium ${
                              isDark ? 'text-gray-200' : 'text-gray-700'
                            }`}
                          >
                            {challenge.label}
                          </p>
                          <span
                            className={`text-sm font-semibold ${
                              isDark ? 'text-red-300' : 'text-red-500'
                            }`}
                          >
                            {weight}%
                          </span>
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {challenge.detail}
                        </p>
                        <div
                          className={`h-1.5 rounded-full overflow-hidden ${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
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
                <p
                  className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  We will highlight the main risks once the analysis is ready.
                </p>
              )}
            </div>

            {/* Recommendations */}
            <div
              className={`p-6 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3 className='text-lg font-bold mb-4'>
                Strategic Recommendations
              </h3>
              {recommendations.length > 0 ? (
                <ul className='space-y-3'>
                  {recommendations.map((rec, index) => (
                    <li key={index} className='flex items-start gap-3'>
                      <CheckCircle className='w-5 h-5 text-blue-600 mt-1 shrink-0' />
                      <p
                        className={`text-sm leading-relaxed ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {rec.text}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Actionable recommendations will appear here once insights are
                  ready.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rank Ideas Button */}
        <div className='flex justify-end'>
          <button
            onClick={handleNext}
            disabled={isLoading || !insights}
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors ${
              isLoading || !insights
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
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
