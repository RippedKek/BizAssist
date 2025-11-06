'use client'

import React, { useEffect, useState } from 'react'
import {
  Sparkles,
  FileText,
  Wand2,
  BookOpen,
  Settings,
  Download,
  TrendingUp,
  Award,
  Layers,
  Palette,
  Presentation,
  ChevronDown,
  Sun,
  Moon,
  ArrowUpRight,
  BarChart3,
  Target,
  Zap,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAppSelector } from '../redux/hooks'
import { getPitchById, deletePitchById } from '../firebase/pitches'
import { removePitchIdFromUser } from '../firebase/users'

/** Helpers for PDF building (shared by all download handlers) */
async function getPdfBits() {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableModule.default as (doc: any, opts: any) => any
  return { jsPDF, autoTable }
}
const nowStr = () => new Date().toLocaleString()

// Using imported Navbar component from original code

const PitchDetailsPage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pitch, setPitch] = useState<any | null>(null)
  const [openSettings, setOpenSettings] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [detailsSection, setDetailsSection] = useState<
    'market' | 'ranker' | 'pitch' | 'branding' | 'slides' | null
  >(null)

  const isDark = theme === 'dark'
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAppSelector((s) => s.user)

  useEffect(() => {
    const id = searchParams?.get('id')
    if (!id) {
      setError('Missing pitch id')
      setLoading(false)
      return
    }
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getPitchById(id)
        if (!data) {
          setError('Pitch not found')
        }
        setPitch({ id, ...data })
      } catch (e) {
        console.error(e)
        setError('Failed to load pitch')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [searchParams])

  const handleDownloadAll = async () => {
    if (busy) return
    setBusy('all')
    try {
      const { jsPDF, autoTable } = await getPdfBits()
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const primary: [number, number, number] = isDark
        ? [37, 99, 235]
        : [16, 185, 129]

      // Header
      doc.setFillColor(...primary)
      doc.rect(0, 0, pageW, 48, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(255, 255, 255)
      doc.text('Overall Pitch Report', 40, 30)
      doc.setFontSize(10)
      doc.text(`Generated: ${nowStr()}`, pageW - 40, 30, { align: 'right' })

      let y = 48 + 40

      // Content sections
      const addSection = (title: string, content: string) => {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(35, 35, 35)
        doc.text(title, 40, y)
        y += 12
        doc.setDrawColor(210, 210, 210)
        doc.line(40, y, pageW - 40, y)
        y += 16
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(70, 70, 70)
        const lines = doc.splitTextToSize(content, pageW - 80)
        lines.forEach((ln: string) => {
          doc.text(ln, 40, y)
          y += 14
        })
        y += 8
      }

      addSection(
        'Pitch Overview',
        'Core business idea: Sustainable textile manufacturing using eco-friendly jute fibers. Target Audience: Socially conscious fashion brands in Europe.'
      )
      addSection(
        'Market Analysis',
        'Summary: Market size growing with EU sustainable mandates; target customers include boutique eco brands and private-label lines.'
      )

      doc.save('overall-pitch-report.pdf')
    } catch (e) {
      console.error(e)
      alert(
        'Failed to generate overall report. Make sure jspdf & jspdf-autotable are installed.'
      )
    } finally {
      setBusy(null)
    }
  }

  const stats = [
    { label: 'Market Score', value: '85', icon: TrendingUp, color: 'blue' },
    { label: 'Viability', value: '92', icon: Target, color: 'emerald' },
    { label: 'Innovation', value: '78', icon: Zap, color: 'purple' },
    { label: 'Scalability', value: '88', icon: BarChart3, color: 'amber' },
  ]

  const sections = [
    {
      id: 'market',
      title: 'Market Analysis',
      icon: TrendingUp,
      description:
        'Comprehensive market insights, competitive landscape, and target audience analysis',
      color: 'blue',
    },
    {
      id: 'ranker',
      title: 'IdeaRanker™ Score',
      icon: Award,
      description: 'AI-powered viability assessment across 5 key dimensions',
      color: 'emerald',
    },
    {
      id: 'pitch',
      title: 'Structured Pitch',
      icon: Layers,
      description:
        'Complete pitch narrative with problem, solution, and business model',
      color: 'purple',
    },
    {
      id: 'branding',
      title: 'Visual Branding',
      icon: Palette,
      description:
        'Logo concepts, color palettes, and brand identity guidelines',
      color: 'amber',
    },
    {
      id: 'slides',
      title: 'Pitch Deck',
      icon: Presentation,
      description: 'Professional presentation slides ready for investors',
      color: 'rose',
    },
  ]

  const colorMap: any = {
    blue: isDark
      ? 'from-blue-500/20 to-blue-600/20 border-blue-500/30'
      : 'from-blue-50 to-blue-100 border-blue-200',
    emerald: isDark
      ? 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30'
      : 'from-emerald-50 to-emerald-100 border-emerald-200',
    purple: isDark
      ? 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
      : 'from-purple-50 to-purple-100 border-purple-200',
    amber: isDark
      ? 'from-amber-500/20 to-amber-600/20 border-amber-500/30'
      : 'from-amber-50 to-amber-100 border-amber-200',
    rose: isDark
      ? 'from-rose-500/20 to-rose-600/20 border-rose-500/30'
      : 'from-rose-50 to-rose-100 border-rose-200',
  }

  const iconColorMap: any = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
  }

  const title = pitch?.businessTitle || 'Untitled Pitch'
  const shortSummary = pitch?.summary || pitch?.draftIdea?.aiSummary || ''

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Navbar
        theme={theme}
        onThemeChange={(newTheme: string) =>
          setTheme(newTheme as 'dark' | 'light')
        }
        showHomeLink
        showMyPitchesLink
        showLogout
      />

      <main className='max-w-7xl mx-auto px-6 py-12'>
        {loading ? (
          <div className='text-center py-24'>
            <div
              className={`w-12 h-12 border-4 rounded-full mx-auto mb-4 ${
                isDark
                  ? 'border-blue-500 border-t-transparent animate-spin'
                  : 'border-emerald-500 border-t-transparent animate-spin'
              }`}
            ></div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading pitch...
            </p>
          </div>
        ) : error ? (
          <div className='text-center py-24'>
            <p className={isDark ? 'text-red-400' : 'text-red-600'}>{error}</p>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className='mb-12'>
              <div className='flex items-center gap-2 mb-4'>
                <a
                  href='/pitch-list'
                  className='text-sm text-gray-500 hover:text-gray-400 transition-colors'
                >
                  My Pitches
                </a>
                <span className='text-gray-600'>/</span>
                <span
                  className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {title}
                </span>
              </div>

              <div className='flex flex-col lg:flex-row items-start justify-between gap-8 mb-8'>
                <div className='flex-1'>
                  <h1
                    className={`text-5xl font-black mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {title}
                  </h1>
                  <p className='text-xl text-gray-400 mb-6 max-w-2xl'>
                    {shortSummary || 'No summary provided.'}
                  </p>
                  <div className='flex flex-wrap gap-3'>
                    <button
                      onClick={handleDownloadAll}
                      disabled={busy === 'all'}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                        isDark
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      <Download className='w-4 h-4' />
                      Export All Assets
                    </button>
                    <button
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                        isDark
                          ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                          : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm'
                      }`}
                    >
                      <FileText className='w-4 h-4' />
                      Share Pitch
                    </button>
                    <div className='relative inline-block'>
                      <button
                        onClick={() => setOpenSettings((v) => !v)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                          isDark
                            ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                            : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm'
                        }`}
                      >
                        <Settings className='w-4 h-4' />
                        Settings
                      </button>
                      {openSettings && (
                        <div
                          className={`absolute right-0 mt-2 w-44 rounded-md shadow-lg ring-1 ring-black/5 z-10 ${
                            isDark
                              ? 'bg-gray-900 border border-gray-800'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setOpenSettings(false)
                              setShowDeleteModal(true)
                            }}
                            className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                              isDark
                                ? 'hover:bg-gray-800 text-red-300'
                                : 'hover:bg-gray-50 text-red-700'
                            }`}
                          >
                            Delete pitch
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='w-full lg:w-96 h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600'>
                  {pitch?.visualBranding?.logo?.image ? (
                    <img
                      src={pitch.visualBranding.logo.image}
                      alt={pitch.businessTitle || 'Business logo'}
                      className='w-full h-full object-contain p-4'
                    />
                  ) : (
                    <div className='flex items-center justify-center w-full h-full'>
                      <Sparkles className='w-16 h-16 text-white/50' />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12'>
              {(pitch?.ideaRanking?.rankerData
                ? [
                    {
                      label: 'Overall Score',
                      value: String(
                        pitch.ideaRanking.rankerData.overallScore ?? '—'
                      ),
                      icon: TrendingUp,
                      color: 'blue',
                    },
                  ]
                : stats
              ).map((stat, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl p-6 border ${
                    isDark
                      ? 'bg-gray-900 border-gray-800'
                      : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div
                      className={`p-3 rounded-xl ${
                        isDark ? 'bg-gray-800' : 'bg-gray-50'
                      }`}
                    >
                      <stat.icon
                        className={`w-5 h-5 ${iconColorMap[stat.color]}`}
                      />
                    </div>
                  </div>
                  <div
                    className={`text-3xl font-black mb-1 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stat.value}
                  </div>
                  <div className='text-sm text-gray-500'>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Section Cards */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`group relative overflow-hidden rounded-2xl p-8 border transition-all hover:scale-[1.02] cursor-pointer bg-gradient-to-br ${
                    colorMap[section.color]
                  } ${isDark ? '' : 'shadow-md hover:shadow-xl'}`}
                >
                  <div className='relative z-10'>
                    <div className='flex items-start justify-between mb-4'>
                      <div
                        className={`p-4 rounded-xl ${
                          isDark ? 'bg-gray-900/50' : 'bg-white/70'
                        } backdrop-blur-sm`}
                      >
                        <section.icon
                          className={`w-6 h-6 ${iconColorMap[section.color]}`}
                        />
                      </div>
                      <button
                        className={`p-2 rounded-lg transition-all ${
                          isDark ? 'hover:bg-gray-900/50' : 'hover:bg-white/70'
                        }`}
                      >
                        <ArrowUpRight className='w-5 h-5' />
                      </button>
                    </div>

                    <h3
                      className={`text-2xl font-bold mb-3 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {section.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {section.id === 'market' &&
                        (pitch?.marketAnalysis?.headline ||
                          'Market insights coming soon...')}
                      {section.id === 'ranker' &&
                        (pitch?.ideaRanking?.rankerData?.readinessLabel ||
                          'Viability assessment coming soon...')}
                      {section.id === 'pitch' &&
                        (pitch?.pitchGeneration?.pitchSpeech?.sections?.length
                          ? `${pitch.pitchGeneration.pitchSpeech.sections.length} sections generated`
                          : 'Pitch narrative coming soon...')}
                      {section.id === 'branding' &&
                        (pitch?.visualBranding?.palette?.name ||
                          'Branding coming soon...')}
                      {section.id === 'slides' &&
                        'Export or view generated slides.'}
                    </p>

                    <div className='mt-6 flex items-center gap-3'>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isDark
                            ? 'bg-gray-900/50 hover:bg-gray-900 text-white backdrop-blur-sm'
                            : 'bg-white/70 hover:bg-white text-gray-900 backdrop-blur-sm'
                        }`}
                      >
                        <Download className='w-4 h-4' />
                        Export
                      </button>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isDark
                            ? 'hover:bg-gray-900/30 text-white'
                            : 'hover:bg-white/50 text-gray-900'
                        }`}
                        onClick={() => setDetailsSection(section.id as any)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Decorative gradient overlay */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${
                      isDark
                        ? 'from-white/5 to-transparent'
                        : 'from-white/40 to-transparent'
                    }`}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Delete Modal */}
      {showDeleteModal && pitch && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
          <div
            className={`w-full max-w-lg rounded-xl border ${
              isDark
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            } shadow-2xl`}
          >
            <div
              className={`p-6 border-b ${
                isDark ? 'border-gray-800' : 'border-gray-200'
              }`}
            >
              <h2 className='text-xl font-bold'>Delete pitch</h2>
              <p
                className={`mt-2 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                This action cannot be undone. This will permanently delete the
                pitch{' '}
                <span
                  className={`${
                    isDark ? 'text-white' : 'text-gray-900'
                  } font-semibold`}
                >
                  &quot;{title}&quot;
                </span>
                .
              </p>
            </div>
            <div className='p-6 space-y-4'>
              <p
                className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Please type the pitch title to confirm:
              </p>
              <input
                type='text'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={title}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 ${
                  isDark ? 'focus:ring-red-500/20' : 'focus:ring-red-500/20'
                }`}
              />
            </div>
            <div
              className={`p-6 border-t ${
                isDark ? 'border-gray-800' : 'border-gray-200'
              } flex justify-end gap-3`}
            >
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setConfirmText('')
                }}
                className={`${
                  isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                } px-4 py-2 rounded-lg`}
              >
                Cancel
              </button>
              <button
                disabled={confirmText !== title || isDeleting}
                onClick={async () => {
                  const id = pitch?.id as string
                  if (!id || !user?.email) return
                  setIsDeleting(true)
                  try {
                    await deletePitchById(id)
                    await removePitchIdFromUser(user.email, id)
                    router.push('/pitch-list')
                  } catch (e) {
                    console.error('Delete failed', e)
                  } finally {
                    setIsDeleting(false)
                  }
                }}
                className={`${
                  confirmText !== title || isDeleting
                    ? isDark
                      ? 'bg-red-700/40 text-red-300 cursor-not-allowed'
                      : 'bg-red-200 text-red-500 cursor-not-allowed'
                    : isDark
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } px-4 py-2 rounded-lg`}
              >
                {isDeleting ? 'Deleting...' : 'Delete this pitch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsSection && pitch && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
          <div
            className={`w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border ${
              isDark
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            } shadow-2xl`}
          >
            <div
              className={`p-6 border-b ${
                isDark ? 'border-gray-800' : 'border-gray-200'
              } flex items-center justify-between`}
            >
              <h2 className='text-xl font-bold'>
                {detailsSection === 'market' && 'Market Analysis'}
                {detailsSection === 'ranker' && 'IdeaRanker'}
                {detailsSection === 'pitch' && 'Structured Pitch'}
                {detailsSection === 'branding' && 'Visual Branding'}
              </h2>
              <button
                className={`${
                  isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } px-3 py-2 rounded-lg`}
                onClick={() => setDetailsSection(null)}
              >
                Close
              </button>
            </div>
            <div className='p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6'>
              {detailsSection === 'market' && (
                <div className='space-y-4'>
                  <p
                    className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {pitch?.marketAnalysis?.headline ||
                      'No headline available.'}
                  </p>
                  {pitch?.marketAnalysis?.feasibilityScore && (
                    <div
                      className={`rounded-lg p-4 ${
                        isDark
                          ? 'bg-gray-800 border border-gray-700'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <p className='text-sm font-semibold mb-1'>
                        Feasibility Score
                      </p>
                      <p className='text-xl font-bold'>
                        {pitch.marketAnalysis.feasibilityScore.value}/100 -{' '}
                        {pitch.marketAnalysis.feasibilityScore.label}
                      </p>
                      <p
                        className={`${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        } text-sm mt-2`}
                      >
                        {pitch.marketAnalysis.feasibilityScore.justification}
                      </p>
                    </div>
                  )}
                  {Array.isArray(pitch?.marketAnalysis?.stats) &&
                    pitch.marketAnalysis.stats.length > 0 && (
                      <div>
                        <h3 className='font-bold mb-2'>Key Stats</h3>
                        <ul className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                          {pitch.marketAnalysis.stats.map(
                            (s: any, i: number) => (
                              <li
                                key={i}
                                className={`rounded-lg p-3 ${
                                  isDark
                                    ? 'bg-gray-800 border border-gray-700'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <p className='text-sm font-semibold'>
                                  {s.label}
                                </p>
                                <p className='text-lg font-bold'>{s.value}</p>
                                <p
                                  className={`text-xs ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                  }`}
                                >
                                  {s.detail}
                                </p>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  {Array.isArray(pitch?.marketAnalysis?.topMarkets) && (
                    <div>
                      <h3 className='font-bold mb-2'>Top Markets</h3>
                      <ul className='space-y-2'>
                        {pitch.marketAnalysis.topMarkets.map(
                          (m: any, i: number) => (
                            <li
                              key={i}
                              className={`rounded-lg p-3 ${
                                isDark
                                  ? 'bg-gray-800 border border-gray-700'
                                  : 'bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <div className='flex items-center justify-between'>
                                <span className='font-semibold'>{m.name}</span>
                                <span className='text-sm'>{m.percentage}%</span>
                              </div>
                              <p
                                className={`text-xs mt-1 ${
                                  isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                {m.rationale}
                              </p>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(pitch?.marketAnalysis?.challenges) && (
                    <div>
                      <h3 className='font-bold mb-2'>Challenges</h3>
                      <ul className='space-y-2'>
                        {pitch.marketAnalysis.challenges.map(
                          (c: any, i: number) => (
                            <li
                              key={i}
                              className={`rounded-lg p-3 ${
                                isDark
                                  ? 'bg-gray-800 border border-gray-700'
                                  : 'bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <div className='flex items-center justify-between'>
                                <span className='font-semibold'>{c.label}</span>
                                <span className='text-sm'>{c.percentage}%</span>
                              </div>
                              <p
                                className={`text-xs mt-1 ${
                                  isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                {c.detail}
                              </p>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(pitch?.marketAnalysis?.recommendations) && (
                    <div>
                      <h3 className='font-bold mb-2'>Recommendations</h3>
                      <ul className='list-disc pl-5 space-y-1'>
                        {pitch.marketAnalysis.recommendations.map(
                          (r: any, i: number) => (
                            <li
                              key={i}
                              className={`${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              } text-sm`}
                            >
                              {r.text}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {detailsSection === 'ranker' &&
                pitch?.ideaRanking?.rankerData && (
                  <div className='space-y-4'>
                    <p className='text-lg font-bold'>
                      Overall: {pitch.ideaRanking.rankerData.overallScore}/100
                    </p>
                    <p
                      className={`${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {pitch.ideaRanking.rankerData.readinessLabel}
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {Object.entries(
                        pitch.ideaRanking.rankerData.scores || {}
                      ).map(([k, v]: any, i) => (
                        <div
                          key={i}
                          className={`rounded-lg p-4 ${
                            isDark
                              ? 'bg-gray-800 border border-gray-700'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <p className='text-sm font-semibold capitalize'>
                            {k}
                          </p>
                          <p className='font-bold'>{v?.score ?? '—'}/100</p>
                          <p
                            className={`text-xs mt-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {v?.justification}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {detailsSection === 'pitch' &&
                pitch?.pitchGeneration?.pitchSpeech && (
                  <div className='space-y-4'>
                    <div
                      className={`rounded-lg p-4 ${
                        isDark
                          ? 'bg-gray-800 border border-gray-700'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <p className='text-sm'>Total Time</p>
                      <p className='font-bold'>
                        {pitch.pitchGeneration.pitchSpeech.totalTimeMinutes}m{' '}
                        {pitch.pitchGeneration.pitchSpeech.totalTimeSeconds}s
                      </p>
                    </div>
                    <div className='space-y-3'>
                      {pitch.pitchGeneration.pitchSpeech.sections.map(
                        (s: any, i: number) => (
                          <div
                            key={i}
                            className={`rounded-lg p-4 ${
                              isDark
                                ? 'bg-gray-800 border border-gray-700'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className='flex items-center justify-between'>
                              <p className='font-semibold'>{s.sectionName}</p>
                              <span className='text-sm'>
                                {s.timeMinutes}m {s.timeSeconds}s
                              </span>
                            </div>
                            <p
                              className={`text-sm mt-2 ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {s.content}
                            </p>
                            {s.notes && (
                              <p
                                className={`text-xs mt-2 italic ${
                                  isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                Note: {s.notes}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {detailsSection === 'branding' && (
                <div className='space-y-4'>
                  {pitch?.visualBranding?.palette && (
                    <div
                      className={`rounded-lg p-4 ${
                        isDark
                          ? 'bg-gray-800 border border-gray-700'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <p className='font-semibold mb-2'>
                        Palette:{' '}
                        {pitch.visualBranding.palette.name || 'Unnamed'}
                      </p>
                      <div className='flex gap-2'>
                        {(pitch.visualBranding.palette.colors || []).map(
                          (c: string, idx: number) => (
                            <div
                              key={idx}
                              className='w-10 h-10 rounded-md border'
                              style={{ backgroundColor: c }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {pitch?.visualBranding?.logo && (
                    <div
                      className={`rounded-lg p-4 ${
                        isDark
                          ? 'bg-gray-800 border border-gray-700'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <p className='font-semibold mb-2'>Logo</p>
                      {pitch.visualBranding.logo.image ? (
                        <img
                          src={pitch.visualBranding.logo.image}
                          alt='Logo'
                          className='w-24 h-24 object-contain'
                        />
                      ) : (
                        <p
                          className={`${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          } text-sm`}
                        >
                          No logo image stored.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PitchDetailsPage
