'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const VisualBrandingScreen = () => {
  const [selectedLogo, setSelectedLogo] = useState(0);
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [theme, setTheme] = useState('dark');
  const searchParams = useSearchParams();
  const isDark = theme === 'dark';

  useEffect(() => {
    const ideaParam = searchParams.get('idea');
    if (ideaParam) {
      // You can use the idea here if needed for branding generation
      console.log('Idea from params:', decodeURIComponent(ideaParam));
    }
  }, [searchParams]);

  const logos = [
    { color: '#5B5FEF', label: 'Indigo' },
    { color: '#10B981', label: 'Emerald' },
    { color: '#F59E0B', label: 'Amber' },
    { color: '#6B7280', label: 'Gray' }
  ];

  const palettes = [
    {
      name: 'Corporate Indigo',
      colors: ['#5B5FEF', '#10B981', '#F59E0B', '#F9FAFB']
    },
    {
      name: 'Emerald & Gold',
      colors: ['#059669', '#FBBF24', '#F3F4F6', '#1F2937']
    },
    {
      name: 'Crimson & Slate',
      colors: ['#DC2626', '#64748B', '#F1F5F9', '#1E293B']
    }
  ];

  const currentPalette = palettes[selectedPalette];

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
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Page Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-10">
          <div>
            <h1 className={`text-5xl font-black mb-3 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Craft Your Visual Identity
            </h1>
            <p className={`text-base max-w-2xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Our AI has generated these visual concepts based on your business idea. Select a logo and color palette to see them applied to your slides.
            </p>
          </div>
          <div className="flex gap-3">
            <button className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors font-semibold ${
              isDark 
                ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}>
              <Sparkles className="w-4 h-4" />
              Generate More
            </button>
            <button
              onClick={() => {
                const params = new URLSearchParams();
                const ideaParam = searchParams.get('idea');
                if (ideaParam) {
                  params.set('idea', ideaParam);
                }
                window.location.href = `/pitch-improvement?${params.toString()}`;
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo Concepts */}
          <div className={`rounded-2xl p-6 border ${
            isDark 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Logo Concepts
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {logos.map((logo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedLogo(idx)}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all ${
                    selectedLogo === idx 
                      ? `ring-4 ring-indigo-500 ring-offset-4 ${isDark ? 'ring-offset-gray-800' : 'ring-offset-white'}` 
                      : ''
                  }`}
                >
                  <div
                    className="aspect-square flex items-center justify-center text-white text-6xl font-black"
                    style={{ backgroundColor: logo.color }}
                  >
                    B
                  </div>
                  <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
                    selectedLogo === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <span className="text-white font-bold">
                      {selectedLogo === idx ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Colors */}
          <div className={`rounded-2xl p-6 border ${
            isDark 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Brand Colors
            </h2>
            <div className="space-y-4">
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
                  <p className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {palette.name}
                  </p>
                  <div className="flex h-12 rounded-lg overflow-hidden">
                    {palette.colors.map((color, colorIdx) => (
                      <div
                        key={colorIdx}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pitch Deck Preview */}
          <div className={`rounded-2xl p-6 border ${
            isDark 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Pitch Deck Preview
            </h2>
            <div className="space-y-6">
              {/* Cover Slide */}
              <div>
                <div
                  className="rounded-xl p-6 flex flex-col justify-center aspect-video"
                  style={{ backgroundColor: currentPalette.colors[0] }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-4xl font-black mb-4"
                    style={{
                      backgroundColor: 'white',
                      color: currentPalette.colors[0]
                    }}
                  >
                    B
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">BizAssist Pitch</h3>
                  <p className="text-white/80 text-sm">Transforming ideas into reality.</p>
                </div>
                <p className={`text-center text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Cover Page
                </p>
              </div>

              {/* Problem Slide */}
              <div>
                <div className={`rounded-xl p-6 aspect-video flex flex-col justify-center border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4
                    className="text-xs font-bold mb-2 tracking-wider"
                    style={{ color: currentPalette.colors[0] }}
                  >
                    THE PROBLEM
                  </h4>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Entrepreneurs struggle with creating compelling business pitches.
                  </h3>
                </div>
                <p className={`text-center text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  The Problem
                </p>
              </div>

              {/* Solution Slide */}
              <div>
                <div className={`rounded-xl p-6 aspect-video flex flex-col justify-center border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4
                    className="text-xs font-bold mb-2 tracking-wider"
                    style={{ color: currentPalette.colors[1] }}
                  >
                    OUR SOLUTION
                  </h4>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    An AI-powered platform that generates business pitches instantly.
                  </h3>
                </div>
                <p className={`text-center text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Our Solution
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisualBrandingScreen;