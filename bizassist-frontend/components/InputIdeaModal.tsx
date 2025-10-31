'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  X,
  ArrowRight,
} from 'lucide-react'

interface InputIdeaModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'dark' | 'light'
}

const InputIdeaModal: React.FC<InputIdeaModalProps> = ({ isOpen, onClose, theme }) => {
  const [ideaText, setIdeaText] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [summaryVisible, setSummaryVisible] = useState(false)
  const router = useRouter()

  const isDark = theme === 'dark'

  const handleSummary = async () => {
    if (!ideaText.trim()) return

    setIsLoading(true)
    // Simulate AI summary generation
    setTimeout(() => {
      setSummary(`Summary: ${ideaText.substring(0, 100)}...`)
      setSummaryVisible(true)
      setIsLoading(false)
    }, 2000)
  }

  const handleNext = () => {
    // Navigate to market dashboard with summary as query param
    const encodedSummary = encodeURIComponent(summary)
    router.push(`/market-dashboard?summary=${encodedSummary}`)
    onClose()
  }

  if (!isOpen) return null

  return (
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
          } transition-colors`} onClick={onClose} aria-label="Close modal">
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Modal Body */}
        <div className='p-6 space-y-6 flex-grow overflow-y-auto'>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`} htmlFor="raw-idea">Describe your business idea</label>
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

          {summaryVisible && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`} htmlFor="ai-summary">AI Generated Summary</label>
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
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-6 ${
          isDark ? 'bg-gray-900/50' : 'bg-gray-50'
        } border-t ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        } rounded-b-xl flex justify-between`}>
          <button
            onClick={handleSummary}
            disabled={!ideaText.trim() || isLoading}
            className={`flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-base font-bold transition-colors ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300'
            } disabled:cursor-not-allowed`}
            aria-label="Generate AI summary"
          >
            <Sparkles className='w-5 h-5' />
            <span className="truncate">Generate Summary</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!summary}
            className={`flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-base font-bold transition-colors ${
              isDark
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300'
            } disabled:cursor-not-allowed`}
            aria-label="Proceed to next step"
          >
            <span className="truncate">Next</span>
            <ArrowRight className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default InputIdeaModal
