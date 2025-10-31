'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  X,
  ArrowRight,
} from 'lucide-react'

const InputIdeaPage = () => {
  const [theme, setTheme] = useState('dark')
  const [ideaText, setIdeaText] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isDark = theme === 'dark'

  const handleSummary = async () => {
    if (!ideaText.trim()) return

    setIsLoading(true)
    // Simulate AI summary generation
    setTimeout(() => {
      setSummary(`Summary: ${ideaText.substring(0, 100)}...`)
      setIsLoading(false)
    }, 2000)
  }

  const handleNext = () => {
    // Navigate to market dashboard
    router.push('/market-dashboard')
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
              href='/homepage'
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
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className={`w-full max-w-2xl rounded-xl border ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } flex flex-col max-h-[90vh]`}>
          {/* Modal Header */}
          <div className={`p-6 border-b ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          } flex justify-between items-center`}>
            <h2 className='text-xl font-bold'>Let's Start with Your Idea</h2>
            <button className={`${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}>
              <X className='w-6 h-6' />
            </button>
          </div>

          {/* Modal Body */}
          <div className='p-6 space-y-6 flex-grow overflow-y-auto'>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`} for="raw-idea">Describe your business idea</label>
              <textarea
                id="raw-idea"
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder='e.g., An on-demand delivery service for organic groceries in Dhaka, targeting busy professionals who value health and convenience...'
                className={`block w-full rounded-lg border ${
                  isDark
                    ? 'border-gray-800 bg-gray-900 text-white placeholder-gray-600 focus:border-gray-700'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                } focus:ring-0 resize-none`}
                rows={5}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`} for="ai-summary">AI Generated Summary</label>
              <div className='relative'>
                <textarea
                  id="ai-summary"
                  value={summary}
                  readOnly
                  placeholder='Our AI will summarize your idea here...'
                  className={`block w-full rounded-lg border ${
                    isDark
                      ? 'border-gray-800 bg-gray-900 text-white placeholder-gray-600'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  } focus:ring-0 resize-none`}
                  rows={4}
                />
                {isLoading && (
                  <div className='absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg'>
                    <Sparkles className='w-8 h-8 text-emerald-500 animate-spin' />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className={`p-6 ${
            isDark ? 'bg-gray-900/50' : 'bg-gray-50'
          } border-t ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          } rounded-b-xl flex justify-end`}>
            <button
              onClick={handleNext}
              disabled={!summary}
              className={`flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-base font-bold transition-colors ${
                isDark
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300'
              } disabled:cursor-not-allowed`}
            >
              <span className="truncate">Next</span>
              <ArrowRight className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>

      {/* Background Content (Optional - could show homepage content) */}
      <div className='min-h-screen'>
        {/* You could include homepage content here if needed */}
      </div>
    </div>
  )
}

export default InputIdeaPage
