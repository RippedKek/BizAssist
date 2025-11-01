'use client';

import React, { useState } from 'react';
import { Download, Share2, Upload, Lightbulb, CheckCircle, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const PitchImprovementScreen = () => {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('feedback');
  const [currentSlide, setCurrentSlide] = useState(4);
  const isDark = theme === 'dark';

  const totalSlides = 12;

  const slides = [
    { id: 3, thumbnail: 'bg-gradient-to-br from-blue-100 to-blue-200' },
    { id: 4, thumbnail: 'bg-gradient-to-br from-purple-100 to-purple-200' },
    { id: 5, thumbnail: 'bg-gradient-to-br from-indigo-100 to-indigo-200', active: true },
    { id: 6, thumbnail: 'bg-gradient-to-br from-pink-100 to-pink-200' },
    { id: 7, thumbnail: 'bg-gradient-to-br from-cyan-100 to-cyan-200' },
  ];

  const feedback = [
    {
      type: 'suggestion',
      title: 'Clarity on Financials',
      description: 'Add a 3-year financial projection to Slide 5 to build investor confidence.',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'yellow'
    },
    {
      type: 'suggestion',
      title: 'Strengthen Market Analysis',
      description: 'Include competitor analysis for the Bangladeshi market on Slide 3.',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'yellow'
    },
    {
      type: 'success',
      title: 'Problem Statement',
      description: 'Well-defined and compelling. This section is strong.',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'green'
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        showHomeLink={true}
        showMyPitchesLink={true}
        showLogout={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className={`text-4xl md:text-5xl font-black mb-3 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Investor-Ready Pitch is Complete!
          </h1>
          <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Review the generated slides, get AI feedback, and export your final pitch deck.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Slide Viewer (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Main Slide Display */}
            <div className={`rounded-2xl overflow-hidden shadow-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`p-4 ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`}>
                <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <div className="w-full h-full p-8 flex flex-col">
                    <h2 className="text-gray-800 text-3xl font-bold mb-8">Market Revenue View</h2>
                    <div className="flex-1 flex items-center gap-8">
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm font-semibold mb-4">Revenue</p>
                        <div className="space-y-2">
                          {[30, 45, 60, 50, 70, 55, 65].map((height, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-6">{idx + 1}</span>
                              <div className="flex-1 bg-blue-200 rounded-full h-3">
                                <div 
                                  className="bg-blue-500 h-3 rounded-full" 
                                  style={{ width: `${height}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="w-1/3 space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-teal-400"></div>
                          <div className="w-8 h-8 rounded-full bg-cyan-500"></div>
                        </div>
                        <div>
                          <p className="text-gray-800 font-bold text-lg mb-2">Market Overview</p>
                          <p className="text-gray-600 text-xs leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Controls */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  <ZoomOut className="w-5 h-5" />
                </button>
                <div className={`w-px h-6 mx-2 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                <button 
                  onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <p className={`text-sm font-medium px-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Slide {currentSlide} of {totalSlides}
                </p>
                <button 
                  onClick={() => setCurrentSlide(Math.min(totalSlides, currentSlide + 1))}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Slide Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    onClick={() => setCurrentSlide(slide.id)}
                    className={`w-16 h-10 rounded cursor-pointer shrink-0 ${slide.thumbnail} ${
                      slide.active 
                        ? 'ring-2 ring-blue-500' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Feedback Panel (1/3 width) */}
          <div className={`lg:col-span-1 rounded-2xl shadow-lg border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Tabs */}
            <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} px-4`}>
              <div className="flex gap-4 -mb-px">
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`py-3 px-2 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'feedback'
                      ? `border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                      : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  AI Feedback
                </button>
                <button
                  onClick={() => setActiveTab('refine')}
                  className={`py-3 px-2 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'refine'
                      ? `border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                      : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  Refine
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className={`py-3 px-2 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'export'
                      ? `border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                      : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  Export
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-300px)]">
              {activeTab === 'feedback' && (
                <>
                  {/* Score */}
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Overall Pitch Score: 8.5/10
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Great start! Here are some suggestions to make your pitch even stronger.
                    </p>
                  </div>

                  {/* Feedback Items */}
                  <div className="space-y-3">
                    {feedback.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-4 rounded-lg ${
                          item.color === 'yellow'
                            ? isDark
                              ? 'bg-yellow-500/10'
                              : 'bg-yellow-50'
                            : isDark
                              ? 'bg-green-500/10'
                              : 'bg-green-50'
                        }`}
                      >
                        <div className={`mt-0.5 ${
                          item.color === 'yellow'
                            ? 'text-yellow-500'
                            : 'text-green-600'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.title}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload Section */}
                  <div>
                    <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Get Feedback on Another Pitch
                    </h3>
                    <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDark
                        ? 'border-gray-600 hover:bg-gray-700/30'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <Upload className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Drag & drop your file here
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        or click to browse
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-colors ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                      <Download className="w-5 h-5" />
                      Download Pitch
                    </button>
                    <button className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-colors ${
                      isDark
                        ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    }`}>
                      <Share2 className="w-5 h-5" />
                      Generate Shareable Link
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'refine' && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Refine content tools coming soon...</p>
                </div>
              )}

              {activeTab === 'export' && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Export options coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PitchImprovementScreen;