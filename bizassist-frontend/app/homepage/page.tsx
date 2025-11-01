'use client'

import React, { useState } from 'react'
import {
  Lightbulb,
  Wand2,
  Palette,
  Network,
  CheckCircle,
  BarChart3,
  PenTool,
  User,
  Sparkles,
} from 'lucide-react'
import InputIdeaModal from '../../components/InputIdeaModal'
import Navbar from '../components/layout/Navbar'
const Homepage = () => {
  const [theme, setTheme] = useState('dark')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isDark = theme === 'dark'

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'
      }`}
    >
      <Navbar
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        showHomeLink={false}
        showMyPitchesLink={false}
        showLogout={true}
      />

      <main>
        {/* Hero Section */}
        <section className='py-20 px-32 md:py-32'>
          <div className='container mx-auto px-4'>
            <div className='grid grid-cols-1 gap-16 text-center lg:grid-cols-2 lg:gap-20 lg:text-left items-center'>
              <div className='flex flex-col items-center justify-center gap-8 lg:items-start'>
                <div className='flex flex-col gap-6'>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                      isDark
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                    } self-center lg:self-start`}
                  >
                    <Sparkles className='w-4 h-4' />
                    <span className='text-sm font-semibold'>
                      AI-Powered Business Planning
                    </span>
                  </div>
                  <h1
                    className={`text-5xl font-black leading-tight tracking-tight ${
                      isDark
                        ? 'text-white'
                        : 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'
                    } md:text-6xl lg:text-7xl`}
                  >
                    From Idea to Investor-Ready Pitch
                  </h1>
                  <p
                    className={`text-lg leading-relaxed ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    } md:text-xl max-w-xl`}
                  >
                    Transform your business vision into a compelling pitch deck
                    with AI-powered insights, market validation, and
                    professional design—all in minutes.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`group flex h-14 px-8 items-center justify-center rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
                  }`}
                >
                  Get Started for Free
                  <svg
                    className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform'
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
              <div className='flex items-center justify-center'>
                <div
                  className={`aspect-video w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
                    isDark ? 'ring-1 ring-gray-800' : 'ring-1 ring-gray-200'
                  }`}
                >
                  <img
                    alt='Business presentation'
                    className='h-full w-full object-cover'
                    src='https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80'
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          className={`py-20 md:py-32 ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}
        >
          <div className='container mx-auto px-4'>
            <div className='text-center mb-16'>
              <h2
                className={`text-4xl font-bold mb-4 ${
                  isDark
                    ? 'text-white'
                    : 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'
                } md:text-5xl`}
              >
                Simple Steps to Success
              </h2>
              <p
                className={`text-lg ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                } max-w-2xl mx-auto`}
              >
                Transform your vision into reality with our streamlined process
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
              {[
                {
                  icon: '💡',
                  title: 'Share Your Idea',
                  desc: 'Input your business concept, target market, and unique value proposition',
                },
                {
                  icon: '✨',
                  title: 'AI Analysis',
                  desc: 'Our AI structures your idea professionally and generates key insights',
                },
                {
                  icon: '🎨',
                  title: 'Customize & Export',
                  desc: 'Refine content, choose templates, and create your investor-ready pitch',
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className={`relative p-8 rounded-2xl border ${
                    isDark
                      ? 'border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900'
                      : 'border-gray-200 bg-gradient-to-br from-white to-gray-50'
                  } text-center group hover:scale-105 transition-transform`}
                >
                  <div
                    className={`absolute -top-4 -left-4 w-12 h-12 rounded-xl ${
                      isDark ? 'bg-blue-600' : 'bg-emerald-600'
                    } flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {i + 1}
                  </div>
                  <div className='text-5xl mb-6'>{step.icon}</div>
                  <h3 className='text-xl font-bold mb-3'>{step.title}</h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className='py-20 md:py-32'>
          <div className='container mx-auto px-4'>
            <div className='text-center mb-16'>
              <h2
                className={`text-4xl font-bold mb-4 ${
                  isDark
                    ? 'text-white'
                    : 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'
                } md:text-5xl`}
              >
                Powerful Features
              </h2>
              <p
                className={`text-lg ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                } max-w-2xl mx-auto`}
              >
                Everything you need to create an impressive business pitch
              </p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto'>
              {[
                {
                  icon: '🧠',
                  title: 'AI Structuring',
                  desc: 'Transform scattered thoughts into coherent narratives',
                },
                {
                  icon: '📊',
                  title: 'Market Validation',
                  desc: 'Get insights on target markets and competition',
                },
                {
                  icon: '💰',
                  title: 'Financial Projections',
                  desc: 'Generate realistic forecasts and metrics',
                },
                {
                  icon: '🎨',
                  title: 'Professional Design',
                  desc: 'Stunning templates that impress investors',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-2xl border ${
                    isDark
                      ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  } transition-all`}
                >
                  <div className='text-4xl mb-4'>{feature.icon}</div>
                  <h3 className='text-lg font-bold mb-2'>{feature.title}</h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='py-20 md:py-32'>
          <div className='container mx-auto px-4'>
            <div
              className={`max-w-4xl mx-auto rounded-3xl p-12 text-center shadow-2xl ${
                isDark
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                  : 'bg-gradient-to-br from-emerald-600 to-emerald-700'
              } text-white`}
            >
              <h2 className='text-4xl font-bold mb-6 md:text-5xl'>
                Ready to Build Your Future?
              </h2>
              <p className='text-xl mb-8 text-white/90 max-w-2xl mx-auto'>
                Join thousands of entrepreneurs who've transformed their ideas
                into successful businesses
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className='px-10 py-4 rounded-xl text-lg font-bold bg-white text-emerald-600 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl'
              >
                Start Your Journey Today
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`py-12 border-t ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className='container mx-auto px-4 text-center'>
          <div className='flex items-center justify-center gap-3 mb-4'>
            <div
              className={`w-8 h-8 rounded-lg ${
                isDark
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              } flex items-center justify-center`}
            >
              <Lightbulb className='w-5 h-5 text-white' />
            </div>
            <span className='text-xl font-bold'>BizAssist</span>
          </div>
          <p
            className={`text-sm mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Empowering the next generation of Bangladeshi entrepreneurs
          </p>
          <p
            className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
          >
            © {new Date().getFullYear()} BizAssist by Team Ultron
          </p>
        </div>
      </footer>

      <InputIdeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        theme={theme}
      />
    </div>
  )
}

export default Homepage
