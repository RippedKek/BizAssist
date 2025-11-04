'use client'

import React, { useState } from 'react'
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

  const isDark = theme === 'dark'

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
        {/* Hero Section */}
        <div className='mb-12'>
          <div className='flex items-center gap-2 mb-4'>
            <a
              href='#'
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
              EcoWeave Textiles
            </span>
          </div>

          <div className='flex flex-col lg:flex-row items-start justify-between gap-8 mb-8'>
            <div className='flex-1'>
              <h1
                className={`text-5xl font-black mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                EcoWeave Textiles
              </h1>
              <p className='text-xl text-gray-400 mb-6 max-w-2xl'>
                Sustainable textile manufacturing using eco-friendly jute fibers
                for socially conscious fashion brands in Europe
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
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                      : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm'
                  }`}
                >
                  <Settings className='w-4 h-4' />
                  Settings
                </button>
              </div>
            </div>

            <div className='w-full lg:w-96 h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10'>
              <img
                src='https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'
                alt='Business concept'
                className='w-full h-full object-cover'
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12'>
          {stats.map((stat, i) => (
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
                  {section.description}
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
      </main>
    </div>
  )
}

export default PitchDetailsPage
