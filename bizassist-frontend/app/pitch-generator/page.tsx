'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Sparkles,
  Copy,
  Download,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react'

const PitchGeneratorPage = () => {
  const [theme, setTheme] = useState('dark')
  const [ideaText, setIdeaText] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    problem: true,
    solution: true,
    market: true,
    ask: true,
  })
  const searchParams = useSearchParams();

  const isDark = theme === 'dark'

  useEffect(() => {
    const summaryParam = searchParams.get('summary');
    if (summaryParam) {
      setIdeaText(decodeURIComponent(summaryParam));
    }
  }, [searchParams]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const pitchData = {
    problem:
      'Office workers in Dhaka often struggle to find healthy, affordable, and quick lunch options. They resort to unhealthy street food or expensive restaurants, compromising their health and budget. Existing delivery services offer limited variety and inconsistent quality of homemade meals.',
    solution:
      'A mobile application that connects office workers with a network of verified home cooks. Our platform will offer a daily-changing menu of fresh, homemade meals, ensuring quality and hygiene. Features include subscription plans, pre-ordering, and real-time delivery tracking for maximum convenience.',
    market:
      'Our primary target market is young to middle-aged professionals (22-45 years old) working in corporate offices within major commercial hubs of Dhaka, such as Gulshan, Banani, and Motijheel. These individuals are tech-savvy, health-conscious, and value convenience.',
    ask: 'We are seeking $50,000 in seed funding to finalize app development, onboard the first 50 home cooks, and launch a targeted marketing campaign to acquire our initial 1,000 users. Funds will be allocated to technology, marketing, and operational overheads for the first six months.',
  }

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Navbar */}
      <nav
        className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
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
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-6 py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Column - Input */}
          <div>
            <h1 className='text-4xl font-bold mb-4 leading-tight'>
              Let's build your pitch. Start with your raw idea.
            </h1>
            <p
              className={`text-lg mb-8 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Just type or paste your business concept below. Our AI will
              structure it into a professional pitch in seconds.
            </p>

            <div className='mb-6'>
              <label className='block text-sm font-medium mb-3'>
                Your Business Idea
              </label>
              <textarea
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder='e.g., I want to create a mobile app that delivers fresh, homemade food to office workers in Dhaka...'
                className={`w-full h-96 p-4 rounded-xl border ${
                  isDark
                    ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                } resize-none focus:outline-none focus:ring-2 ${
                  isDark ? 'focus:ring-blue-600' : 'focus:ring-emerald-600'
                } focus:ring-opacity-50`}
              />
              <div
                className={`text-sm mt-2 ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                0/2000 words
              </div>
            </div>

            <button
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              } transition-colors`}
            >
              <Sparkles className='w-5 h-5' />
              Generate Pitch
            </button>

            <button
              onClick={() => {
                const params = new URLSearchParams();
                if (ideaText) {
                  params.set('idea', encodeURIComponent(ideaText));
                }
                window.location.href = `/visual-branding?${params.toString()}`;
              }}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 mt-4 ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } transition-colors`}
            >
              Create Visual Branding
            </button>
          </div>

          {/* Right Column - Output */}
          <div>
            <div
              className={`rounded-2xl border p-8 ${
                isDark
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className='flex items-center justify-between mb-8'>
                <h2 className='text-2xl font-bold'>
                  Here's Your Structured Business Pitch
                </h2>
                <div className='flex gap-2'>
                  <button
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                    aria-label="Copy pitch"
                  >
                    <Copy className='w-5 h-5' />
                  </button>
                  <button
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                    aria-label="Download pitch"
                  >
                    <Download className='w-5 h-5' />
                  </button>
                </div>
              </div>

              {/* Pitch Sections */}
              <div className='space-y-4'>
                {/* Problem Section */}
                <div
                  className={`border rounded-xl ${
                    isDark ? 'border-gray-800' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => toggleSection('problem')}
                    className={`w-full px-6 py-4 flex items-center justify-between ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    } rounded-xl transition-colors`}
                  >
                    <span className='font-semibold'>
                      The Problem You're Solving
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.problem ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.problem && (
                    <div
                      className={`px-6 pb-6 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      } leading-relaxed`}
                    >
                      {pitchData.problem}
                    </div>
                  )}
                </div>

                {/* Solution Section */}
                <div
                  className={`border rounded-xl ${
                    isDark ? 'border-gray-800' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => toggleSection('solution')}
                    className={`w-full px-6 py-4 flex items-center justify-between ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    } rounded-xl transition-colors`}
                  >
                    <span className='font-semibold'>Your Unique Solution</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.solution ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.solution && (
                    <div
                      className={`px-6 pb-6 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      } leading-relaxed`}
                    >
                      {pitchData.solution}
                    </div>
                  )}
                </div>

                {/* Market Section */}
                <div
                  className={`border rounded-xl ${
                    isDark ? 'border-gray-800' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => toggleSection('market')}
                    className={`w-full px-6 py-4 flex items-center justify-between ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    } rounded-xl transition-colors`}
                  >
                    <span className='font-semibold'>Your Target Market</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.market ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.market && (
                    <div
                      className={`px-6 pb-6 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      } leading-relaxed`}
                    >
                      {pitchData.market}
                    </div>
                  )}
                </div>

                {/* Ask Section */}
                <div
                  className={`border rounded-xl ${
                    isDark ? 'border-gray-800' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => toggleSection('ask')}
                    className={`w-full px-6 py-4 flex items-center justify-between ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    } rounded-xl transition-colors`}
                  >
                    <span className='font-semibold'>
                      The Ask (Funding/Resource Needs)
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.ask ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.ask && (
                    <div
                      className={`px-6 pb-6 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      } leading-relaxed`}
                    >
                      {pitchData.ask}
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Section */}
              <div
                className={`mt-8 pt-6 border-t ${
                  isDark ? 'border-gray-800' : 'border-gray-200'
                } flex items-center justify-between`}
              >
                <span
                  className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Was this helpful?
                </span>
                <div className='flex gap-4'>
                  <button
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                    aria-label="Like this pitch"
                  >
                    <ThumbsUp className='w-5 h-5' />
                  </button>
                  <button
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                    aria-label="Dislike this pitch"
                  >
                    <ThumbsDown className='w-5 h-5' />
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      isDark
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    aria-label="Regenerate pitch"
                  >
                    <RefreshCw className='w-4 h-4' />
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PitchGeneratorPage
