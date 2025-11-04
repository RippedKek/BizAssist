'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { upsertStep } from '../firebase/pitches'

interface Logo {
  id: number
  color: string
  label: string
  description?: string
  style?: string
  elements?: string[]
  colors?: string[]
  image?: string // Base64 or data URL of generated logo
}

interface Palette {
  name: string
  colors: string[]
  description?: string
}

const VisualBrandingScreen = () => {
  const [selectedLogo, setSelectedLogo] = useState(0)
  const [selectedPalette, setSelectedPalette] = useState(0)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [summary, setSummary] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [logos, setLogos] = useState<Logo[]>([])
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isDark = theme === 'dark'

  useEffect(() => {
    // Load data from sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const storedSummary = sessionStorage.getItem('bizassist-shared-summary')
        const storedBusinessTitle = sessionStorage.getItem(
          'bizassist-business-title'
        )
        const storedPitchData = sessionStorage.getItem('bizassist-pitch-data')

        if (storedSummary) {
          setSummary(storedSummary)
        }

        // Prioritize direct businessTitle storage, then pitch-data
        if (storedBusinessTitle) {
          setBusinessName(storedBusinessTitle)
        } else if (storedPitchData) {
          try {
            const pitchData = JSON.parse(storedPitchData)
            if (pitchData.businessTitle) {
              setBusinessName(pitchData.businessTitle)
            }
          } catch (e) {
            console.error('Error parsing pitch data:', e)
          }
        }

        // Generate logos and palettes
        if (storedSummary) {
          const nameToUse =
            storedBusinessTitle || businessName || 'Your Business'
          generateBranding(storedSummary, nameToUse)
        } else {
          setError('No business summary found. Please go back and create one.')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load business data.')
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    // Regenerate palettes when businessName is available and logos are loaded
    if (businessName && summary && logos.length > 0 && palettes.length === 0) {
      const logoColors = (logos[selectedLogo]?.colors ||
        logos[0]?.colors ||
        []) as string[]
      generatePalettes(logoColors, summary, businessName)
    }
  }, [businessName, summary, logos, selectedLogo])

  const generateLogo = async (
    businessName: string,
    summary: string,
    variation: number
  ): Promise<string | null> => {
    try {
      const prompts = [
        `logo-of-${businessName
          .toLowerCase()
          .replace(
            /\s+/g,
            '-'
          )}-professional-minimalist-design-clean-modern-transparent-background`,
        `logo-of-${businessName
          .toLowerCase()
          .replace(
            /\s+/g,
            '-'
          )}-modern-creative-geometric-shapes-bold-typography`,
        `logo-of-${businessName
          .toLowerCase()
          .replace(/\s+/g, '-')}-corporate-identity-simple-icon-vector-style`,
        `logo-of-${businessName
          .toLowerCase()
          .replace(/\s+/g, '-')}-contemporary-branding-professional-design`,
      ]

      const prompt = prompts[variation % prompts.length]
      // Use different seeds for each variation to get different results
      const seeds = [41, 42, 43, 44]
      const seed = seeds[variation % seeds.length]

      // Use Pollinations API
      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        prompt
      )}?height=1000&width=1000&seed=${seed}`

      const response = await fetch(apiUrl)

      if (response.ok) {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        return imageUrl
      } else {
        console.error(`Pollinations API error: ${response.status}`)
        return null
      }
    } catch (error) {
      console.error('Error generating logo:', error)
      return null
    }
  }

  const generateBranding = async (summaryText: string, name: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Generate logos using Pollinations API
      const logoPromises = []
      const baseLogos: Logo[] = [
        {
          id: 0,
          color: '#5B5FEF',
          label: 'Indigo',
          colors: ['#5B5FEF', '#10B981', '#F59E0B', '#F9FAFB'],
        },
        {
          id: 1,
          color: '#10B981',
          label: 'Emerald',
          colors: ['#10B981', '#F59E0B', '#6B7280', '#F9FAFB'],
        },
        {
          id: 2,
          color: '#F59E0B',
          label: 'Amber',
          colors: ['#F59E0B', '#EF4444', '#6366F1', '#F9FAFB'],
        },
        {
          id: 3,
          color: '#EF4444',
          label: 'Red',
          colors: ['#EF4444', '#8B5CF6', '#06B6D4', '#F9FAFB'],
        },
      ]

      // Generate 4 logo variations
      for (let i = 0; i < 4; i++) {
        logoPromises.push(generateLogo(name, summaryText, i))
      }

      const logoImages = await Promise.all(logoPromises)

      // Combine base logos with generated images
      const logosWithImages: Logo[] = baseLogos.map((logo, index) => ({
        ...logo,
        image: logoImages[index] || undefined,
      }))

      setLogos(logosWithImages)

      // Generate palettes with first logo colors - pass summaryText and name directly
      await generatePalettes(baseLogos[0].colors || [], summaryText, name)
    } catch (error) {
      console.error('Error generating branding:', error)
      setError('Failed to generate branding. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generatePalettes = async (
    logoColors: string[] = [],
    summaryText?: string,
    businessNameText?: string
  ) => {
    // Use provided parameters or fall back to state
    const summaryToUse = summaryText || summary
    const businessNameToUse =
      businessNameText || businessName || 'Your Business'

    if (!summaryToUse) {
      // Use fallback if no summary
      const fallbackPalettes = [
        {
          name: 'Corporate Indigo',
          colors: ['#5B5FEF', '#10B981', '#F59E0B', '#F9FAFB'],
        },
        {
          name: 'Emerald & Gold',
          colors: ['#059669', '#FBBF24', '#F3F4F6', '#1F2937'],
        },
        {
          name: 'Crimson & Slate',
          colors: ['#DC2626', '#64748B', '#F1F5F9', '#1E293B'],
        },
      ]
      setPalettes(fallbackPalettes)
      return
    }

    try {
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      }/api/v1/generate-palettes`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessNameToUse,
          summary: summaryToUse,
          logoColors: logoColors,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Failed to generate palettes: ${response.status}`)
      }

      const result = await response.json()
      if (result.success && result.data && result.data.palettes) {
        console.log('Successfully received palettes:', result.data.palettes)
        setPalettes(result.data.palettes)
      } else {
        console.error('Unexpected response format:', result)
        throw new Error('Invalid response format from API')
      }
    } catch (error) {
      console.error('Error generating palettes:', error)
      // Use fallback palettes
      setPalettes([
        {
          name: 'Corporate Indigo',
          colors: ['#5B5FEF', '#10B981', '#F59E0B', '#F9FAFB'],
        },
        {
          name: 'Emerald & Gold',
          colors: ['#059669', '#FBBF24', '#F3F4F6', '#1F2937'],
        },
        {
          name: 'Crimson & Slate',
          colors: ['#DC2626', '#64748B', '#F1F5F9', '#1E293B'],
        },
      ])
    }
  }

  const handleGenerateMore = async () => {
    if (!summary) return
    setIsLoading(true)
    try {
      // Regenerate logos and palettes
      const logoPromises = []
      for (let i = 0; i < 4; i++) {
        logoPromises.push(
          generateLogo(businessName || 'Your Business', summary, i)
        )
      }

      const logoImages = await Promise.all(logoPromises)
      const baseLogos: Logo[] = [
        {
          id: 0,
          color: '#5B5FEF',
          label: 'Indigo',
          colors: ['#5B5FEF', '#10B981', '#F59E0B', '#F9FAFB'],
        },
        {
          id: 1,
          color: '#10B981',
          label: 'Emerald',
          colors: ['#10B981', '#F59E0B', '#6B7280', '#F9FAFB'],
        },
        {
          id: 2,
          color: '#F59E0B',
          label: 'Amber',
          colors: ['#F59E0B', '#EF4444', '#6366F1', '#F9FAFB'],
        },
        {
          id: 3,
          color: '#EF4444',
          label: 'Red',
          colors: ['#EF4444', '#8B5CF6', '#06B6D4', '#F9FAFB'],
        },
      ]

      const logosWithImages: Logo[] = baseLogos.map((logo, index) => ({
        ...logo,
        image: logoImages[index] || undefined,
      }))

      setLogos(logosWithImages)

      // Regenerate palettes
      const logoColors = (logosWithImages[selectedLogo]?.colors ||
        logosWithImages[0]?.colors ||
        []) as string[]
      await generatePalettes(logoColors, summary, businessName)
    } catch (error) {
      console.error('Error regenerating:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentPalette = palettes[selectedPalette] ||
    palettes[0] || {
      name: 'Default',
      colors: ['#5B5FEF', '#10B981', '#F59E0B', '#F9FAFB'],
    }

  if (isLoading && logos.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className='text-center'>
          <Loader2
            className={`w-12 h-12 animate-spin mx-auto mb-4 ${
              isDark ? 'text-blue-500' : 'text-indigo-600'
            }`}
          />
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Generating your visual identity...
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
        <div className='text-center max-w-md px-6'>
          <p
            className={`text-lg mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {error}
          </p>
          <button
            onClick={() => (window.location.href = '/homepage')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
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
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <Navbar
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        showHomeLink={true}
        showMyPitchesLink={true}
        showLogout={true}
      />

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-6 lg:px-10 py-10'>
        {/* Page Header */}
        <div className='flex flex-wrap justify-between items-start gap-4 mb-10'>
          <div>
            <h1
              className={`text-5xl font-black mb-3 tracking-tight ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Craft Your Visual Identity
            </h1>
            {businessName && (
              <p
                className={`text-2xl font-bold mb-2 ${
                  isDark ? 'text-blue-400' : 'text-indigo-600'
                }`}
              >
                {businessName}
              </p>
            )}
            <p
              className={`text-base max-w-2xl ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Select a logo and color palette to see them applied to your
              slides. The color palettes are AI-generated based on your
              business.
            </p>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={handleGenerateMore}
              disabled={isLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors font-semibold ${
                isDark
                  ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className='w-4 h-4' />
                  Generate More
                </>
              )}
            </button>
            <button
              onClick={async () => {
                // Store selected branding in sessionStorage
                try {
                  const brandingData = {
                    selectedLogo: selectedLogo,
                    selectedPalette: selectedPalette,
                    logo: logos[selectedLogo],
                    palette: currentPalette,
                  }
                  sessionStorage.setItem(
                    'bizassist-branding',
                    JSON.stringify(brandingData)
                  )
                  const pitchId = sessionStorage.getItem('bizassist-pitch-id')
                  if (pitchId) {
                    await upsertStep(pitchId, 'visual_branding', brandingData, {
                      businessTitle: businessName,
                      summary,
                      status: 'completed',
                      currentStep: 'visual_branding',
                    })
                  }
                } catch (error) {
                  console.error('Error saving branding:', error)
                }
                window.location.href = '/pitch-practise'
              }}
              className={`px-6 py-2.5 rounded-lg transition-colors font-semibold ${
                isDark
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Save & Continue
            </button>
          </div>
        </div>

        {/* Three Column Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Logo Concepts */}
          <div
            className={`rounded-2xl p-6 border ${
              isDark
                ? 'bg-gray-800/50 border-gray-700/50'
                : 'bg-white border-gray-200'
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Logo Concepts
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {logos.map((logo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedLogo(idx)}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all ${
                    selectedLogo === idx
                      ? `ring-4 ring-indigo-500 ring-offset-4 ${
                          isDark ? 'ring-offset-gray-800' : 'ring-offset-white'
                        }`
                      : ''
                  }`}
                >
                  {logo.image ? (
                    <img
                      src={logo.image}
                      alt={`Logo ${idx + 1}`}
                      className='w-full h-full object-contain aspect-square bg-transparent'
                    />
                  ) : (
                    <div
                      className='aspect-square flex items-center justify-center text-white text-6xl font-black'
                      style={{ backgroundColor: logo.color }}
                    >
                      {businessName
                        ? businessName.charAt(0).toUpperCase()
                        : logo.label.charAt(0)}
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
                      selectedLogo === idx
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <span className='text-white font-bold'>
                      {selectedLogo === idx ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Colors */}
          <div
            className={`rounded-2xl p-6 border ${
              isDark
                ? 'bg-gray-800/50 border-gray-700/50'
                : 'bg-white border-gray-200'
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Brand Colors
            </h2>
            <div className='space-y-4'>
              {palettes.map((palette, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPalette(idx)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedPalette === idx
                      ? 'bg-indigo-600/20 ring-2 ring-indigo-500'
                      : isDark
                      ? 'hover:bg-gray-700/30'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <p
                    className={`font-bold mb-3 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {palette.name}
                  </p>
                  <div className='flex h-12 rounded-lg overflow-hidden'>
                    {palette.colors.map((color, colorIdx) => (
                      <div
                        key={colorIdx}
                        className='flex-1'
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pitch Deck Preview */}
          <div
            className={`rounded-2xl p-6 border ${
              isDark
                ? 'bg-gray-800/50 border-gray-700/50'
                : 'bg-white border-gray-200'
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Pitch Deck Preview
            </h2>
            <div className='space-y-6'>
              {/* Cover Slide */}
              <div>
                <div
                  className='rounded-xl p-6 flex flex-col justify-center aspect-video'
                  style={{ backgroundColor: currentPalette.colors[0] }}
                >
                  {logos[selectedLogo]?.image ? (
                    <img
                      src={logos[selectedLogo].image}
                      alt='Business Logo'
                      className='w-16 h-16 object-contain mb-4'
                      style={{ backgroundColor: 'transparent' }}
                    />
                  ) : (
                    <div
                      className='w-16 h-16 rounded-full flex items-center justify-center text-4xl font-black mb-4'
                      style={{
                        backgroundColor: 'white',
                        color: currentPalette.colors[0],
                      }}
                    >
                      {businessName
                        ? businessName.charAt(0).toUpperCase()
                        : 'B'}
                    </div>
                  )}
                  <h3 className='text-2xl font-bold text-white mb-2'>
                    {businessName || 'Business Pitch'}
                  </h3>
                  <p className='text-white/80 text-sm'>
                    {summary
                      ? summary.substring(0, 50) + '...'
                      : 'Transforming ideas into reality.'}
                  </p>
                </div>
                <p
                  className={`text-center text-sm mt-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Cover Page
                </p>
              </div>

              {/* Problem Slide */}
              <div>
                <div
                  className={`rounded-xl p-6 aspect-video flex flex-col justify-center border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4
                    className='text-xs font-bold mb-2 tracking-wider'
                    style={{ color: currentPalette.colors[0] }}
                  >
                    THE PROBLEM
                  </h4>
                  <h3
                    className={`text-lg font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Entrepreneurs struggle with creating compelling business
                    pitches.
                  </h3>
                </div>
                <p
                  className={`text-center text-sm mt-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  The Problem
                </p>
              </div>

              {/* Solution Slide */}
              <div>
                <div
                  className={`rounded-xl p-6 aspect-video flex flex-col justify-center border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4
                    className='text-xs font-bold mb-2 tracking-wider'
                    style={{ color: currentPalette.colors[1] }}
                  >
                    OUR SOLUTION
                  </h4>
                  <h3
                    className={`text-lg font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    An AI-powered platform that generates business pitches
                    instantly.
                  </h3>
                </div>
                <p
                  className={`text-center text-sm mt-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Our Solution
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VisualBrandingScreen
