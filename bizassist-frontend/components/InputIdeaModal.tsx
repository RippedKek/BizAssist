'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, X, ArrowRight, Check } from 'lucide-react'

interface InputIdeaModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'dark' | 'light'
}

const InputIdeaModal: React.FC<InputIdeaModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [ideaText, setIdeaText] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [summaryVisible, setSummaryVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const isDark = theme === 'dark'

  const handleSummary = async () => {
    if (!ideaText.trim()) return

    setIsLoading(true)
    setSummaryVisible(true)

    try {
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      }/api/v1/idea-summary`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: ideaText }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      setSummary(data.summary)
      setCopied(false)
    } catch (error) {
      console.error('Error generating summary:', error)
      setSummary('Failed to generate summary. Please try again.')
      setCopied(false)
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
      console.error('Error copying summary:', error)
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

    router.push('/market-dashboard')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div
        className={`w-full max-w-2xl rounded-xl border ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } flex flex-col max-h-[90vh]`}
      >
        {/* Modal Header */}
        <div
          className={`p-6 border-b ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          } flex justify-between items-center`}
        >
          <h2 className='text-xl font-bold'>Let's Start with Your Idea</h2>
          <button
            className={`${
              isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
            onClick={onClose}
            aria-label='Close modal'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Modal Body */}
        <div className='p-6 grow overflow-y-auto'>
          <div className='flex flex-col gap-6 lg:flex-row'>
            <div className='lg:w-2/5 space-y-3'>
              <div>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Share the raw version of your idea. We will polish it into a
                  concise summary that you can take into the next step.
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? 'border-gray-800 bg-gray-900/60 text-gray-200'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                <h3 className='text-sm font-semibold uppercase tracking-wide mb-2'>
                  Tips
                </h3>
                <ul className='space-y-1 text-sm list-disc list-inside leading-relaxed'>
                  <li>Focus on the problem and the customer segment.</li>
                  <li>Highlight what makes your approach different.</li>
                  <li>
                    Mention any constraints or goals you want us to respect.
                  </li>
                </ul>
              </div>
            </div>

            <div className='flex-1 space-y-6'>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                  htmlFor='raw-idea'
                >
                  Describe your business idea
                </label>
                <textarea
                  id='raw-idea'
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder='e.g., An on-demand delivery service for organic groceries in Dhaka, targeting busy professionals who value health and convenience...'
                  className={`block w-full rounded-lg border px-3 py-4 text-base leading-relaxed ${
                    isDark
                      ? 'border-gray-800 bg-gray-900 text-white placeholder-gray-600 focus:border-gray-700'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                  } focus:ring-0 resize-none min-h-[180px]`}
                />
              </div>

              {summaryVisible && (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between gap-4'>
                    <span
                      className={`text-sm font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      AI Generated Summary
                    </span>
                    <button
                      type='button'
                      onClick={handleCopySummary}
                      disabled={!summary || isLoading}
                      className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                        isDark
                          ? 'text-emerald-400 hover:text-emerald-300 disabled:text-gray-600'
                          : 'text-emerald-700 hover:text-emerald-600 disabled:text-gray-400'
                      } disabled:cursor-not-allowed`}
                      aria-label='Copy summary to clipboard'
                    >
                      {copied ? (
                        <Check className='h-4 w-4' />
                      ) : (
                        <Sparkles className='h-4 w-4' />
                      )}
                      {copied ? 'Copied' : 'Copy summary'}
                    </button>
                  </div>

                  <div
                    id='ai-summary'
                    className={`relative rounded-xl border ${
                      isDark
                        ? 'border-gray-800 bg-gray-900/60'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div
                      className={`max-h-64 min-h-[160px] overflow-y-auto px-4 py-5 text-sm leading-7 whitespace-pre-wrap ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}
                    >
                      {summary
                        ? summary
                        : 'Our AI will summarize your idea here once it is ready. You can continue editing your idea while we work.'}
                    </div>

                    {isLoading && (
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm ${
                          isDark ? 'bg-gray-900/70' : 'bg-white/80'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <Sparkles className='w-6 h-6 text-emerald-500 animate-pulse' />
                          <span
                            className={`text-sm font-medium ${
                              isDark ? 'text-gray-200' : 'text-gray-700'
                            }`}
                          >
                            Generating summary...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-6 ${
            isDark ? 'bg-gray-900/50' : 'bg-gray-50'
          } border-t ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          } rounded-b-xl flex justify-between`}
        >
          <button
            onClick={handleSummary}
            disabled={!ideaText.trim() || isLoading}
            className={`flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-base font-bold transition-colors ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300'
            } disabled:cursor-not-allowed`}
            aria-label='Generate AI summary'
          >
            <Sparkles className='w-5 h-5' />
            <span className='truncate'>Generate Summary</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!summary}
            className={`flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-base font-bold transition-colors ${
              isDark
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300'
            } disabled:cursor-not-allowed`}
            aria-label='Proceed to next step'
          >
            <span className='truncate'>Next</span>
            <ArrowRight className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default InputIdeaModal
