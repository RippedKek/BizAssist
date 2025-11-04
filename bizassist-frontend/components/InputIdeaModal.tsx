'use client'

import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Lightbulb } from 'lucide-react'
import { useAppSelector } from '../app/redux/hooks'
import { createPitchForUser } from '../app/firebase/pitches'
import { appendPitchIdToUser } from '../app/firebase/users'

// Modal Component
const InputIdeaModal = ({ isOpen, onClose, theme }) => {
  const [ideaText, setIdeaText] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { user } = useAppSelector((state) => state.user)

  const isDark = theme === 'dark'

  const handleSummary = async () => {
    if (!ideaText.trim()) return
    setIsLoading(true)

    try {
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      }/api/v1/idea-summary`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaText }),
      })

      if (!response.ok) throw new Error('Failed to generate summary')
      const data = await response.json()
      setSummary(data.summary)
      setCopied(false)
    } catch (error) {
      console.error('Error:', error)
      setSummary('Failed to generate summary. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopySummary = async () => {
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const handleNext = async () => {
    if (typeof window !== 'undefined' && summary) {
      try {
        sessionStorage.setItem('bizassist-shared-summary', summary)
        // Create a new pitch if not already present
        const existingPitchId = sessionStorage.getItem('bizassist-pitch-id')
        if (!existingPitchId && user?.uid) {
          const pitchId = await createPitchForUser(
            { uid: user.uid, email: user.email },
            {
              status: 'in_progress',
              currentStep: 'idea_summary',
              summary,
              draftIdea: { ideaText, aiSummary: summary },
            }
          )
          sessionStorage.setItem('bizassist-pitch-id', pitchId)
          // Append pitchId to user's profile document keyed by email
          if (user.email) {
            try {
              await appendPitchIdToUser(user.email, pitchId)
            } catch (e) {
              console.error('Failed to append pitchId to user profile:', e)
            }
          }
        }
      } catch (error) {
        console.error('Error storing summary:', error)
      }
    }
    window.location.href = '/market-dashboard'
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4'>
      <div
        className={`w-full max-w-5xl rounded-2xl shadow-2xl ${
          isDark ? 'bg-gray-900' : 'bg-white'
        } flex flex-col max-h-[95vh] overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-8 py-6 border-b ${
            isDark
              ? 'border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800'
              : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white'
          }`}
        >
          <div className='flex justify-between items-center'>
            <div>
              <h2
                className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Share Your Business Idea
              </h2>
              <p
                className={`text-sm mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Let AI transform your vision into a structured summary
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className='p-8 overflow-y-auto flex-1'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Left Column - Tips */}
            <div className='space-y-6'>
              <div
                className={`rounded-xl border p-6 ${
                  isDark
                    ? 'border-gray-800 bg-gradient-to-br from-gray-800 to-gray-900'
                    : 'border-gray-200 bg-gradient-to-br from-blue-50 to-emerald-50'
                }`}
              >
                <div className='flex items-center gap-3 mb-4'>
                  <div
                    className={`p-2 rounded-lg ${
                      isDark ? 'bg-blue-600' : 'bg-emerald-600'
                    }`}
                  >
                    <Lightbulb className='w-5 h-5 text-white' />
                  </div>
                  <h3
                    className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Writing Tips
                  </h3>
                </div>
                <ul
                  className={`space-y-3 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <li className='flex gap-2'>
                    <span className='text-emerald-500 mt-0.5'>•</span>
                    <span>Describe the problem you're solving</span>
                  </li>
                  <li className='flex gap-2'>
                    <span className='text-emerald-500 mt-0.5'>•</span>
                    <span>Identify your target customers</span>
                  </li>
                  <li className='flex gap-2'>
                    <span className='text-emerald-500 mt-0.5'>•</span>
                    <span>Explain what makes you unique</span>
                  </li>
                  <li className='flex gap-2'>
                    <span className='text-emerald-500 mt-0.5'>•</span>
                    <span>Mention any specific goals or constraints</span>
                  </li>
                </ul>
              </div>

              <div
                className={`rounded-xl border p-6 ${
                  isDark
                    ? 'border-gray-800 bg-gray-800/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <h4
                  className={`font-semibold mb-3 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Example
                </h4>
                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  "An on-demand delivery service for organic groceries in Dhaka,
                  targeting busy professionals who value health and convenience
                  but lack time to shop..."
                </p>
              </div>
            </div>

            {/* Right Column - Input & Summary */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Idea Input */}
              <div>
                <label
                  className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}
                >
                  Your Business Idea
                </label>
                <textarea
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder='Describe your business idea in detail. The more information you provide, the better our AI can help structure your pitch...'
                  className={`block w-full rounded-xl border px-5 py-4 text-base leading-relaxed resize-none transition-all ${
                    isDark
                      ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  } min-h-[200px]`}
                />
                <div className='flex justify-between items-center mt-3'>
                  <span
                    className={`text-xs ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}
                  >
                    {ideaText.length} characters
                  </span>
                  <button
                    onClick={handleSummary}
                    disabled={!ideaText.trim() || isLoading}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700 disabled:text-gray-500'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-200 disabled:text-gray-400'
                    } disabled:cursor-not-allowed`}
                  >
                    <Sparkles className='w-4 h-4' />
                    {isLoading ? 'Generating...' : 'Generate Summary'}
                  </button>
                </div>
              </div>

              {/* AI Summary */}
              {(summary || isLoading) && (
                <div
                  className={`rounded-xl border ${
                    isDark
                      ? 'border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900'
                      : 'border-gray-200 bg-gradient-to-br from-white to-gray-50'
                  } overflow-hidden`}
                >
                  <div
                    className={`px-5 py-3 border-b ${
                      isDark
                        ? 'border-gray-700 bg-gray-800/50'
                        : 'border-gray-200 bg-gray-50'
                    } flex justify-between items-center`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}
                    >
                      AI-Generated Summary
                    </span>
                    {summary && !isLoading && (
                      <button
                        onClick={handleCopySummary}
                        className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          copied
                            ? isDark
                              ? 'bg-emerald-900/30 text-emerald-400'
                              : 'bg-emerald-100 text-emerald-700'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {copied ? (
                          <>
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
                                d='M5 13l4 4L19 7'
                              />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
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
                                d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                              />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className='relative p-6 min-h-[240px]'>
                    {isLoading ? (
                      <div className='flex flex-col items-center justify-center h-full gap-4'>
                        <div className='relative'>
                          <div
                            className={`w-16 h-16 rounded-full border-4 ${
                              isDark ? 'border-gray-700' : 'border-gray-200'
                            }`}
                          ></div>
                          <div
                            className={`w-16 h-16 rounded-full border-4 border-t-blue-600 animate-spin absolute top-0`}
                          ></div>
                        </div>
                        <p
                          className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Analyzing your idea...
                        </p>
                      </div>
                    ) : (
                      <p
                        className={`text-base leading-relaxed whitespace-pre-wrap ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        {summary}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-8 py-6 border-t ${
            isDark
              ? 'border-gray-800 bg-gray-900/50'
              : 'border-gray-200 bg-gray-50'
          } flex justify-between items-center`}
        >
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={!summary || isLoading}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-lg font-semibold transition-all ${
              isDark
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-700 disabled:text-gray-500'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-200 disabled:text-gray-400'
            } disabled:cursor-not-allowed`}
          >
            Continue to Market Dashboard
            <svg
              className='w-5 h-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 7l5 5m0 0l-5 5m5-5H6'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default InputIdeaModal
