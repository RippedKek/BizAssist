'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle, ChevronDown, FileDown, Menu, Sparkles, Sun, Moon } from 'lucide-react';

const MarketDashboardPage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

  const markets = [
    { name: 'USA', percentage: 90 },
    { name: 'Germany', percentage: 75 },
    { name: 'Singapore', percentage: 60 },
    { name: 'Japan', percentage: 55 },
    { name: 'Australia', percentage: 40 },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <nav className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} sticky top-0 z-10 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
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
              href='#'
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
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-black mb-3">Global Market Feasibility Dashboard</h1>
            <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Your Idea: AI-powered business pitch generator
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
            <FileDown className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button className={`flex items-center gap-2 h-8 px-4 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
            <span className="text-sm font-medium">Product Category</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className={`flex items-center gap-2 h-8 px-4 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
            <span className="text-sm font-medium">Last 6 Months</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className={`flex items-center gap-2 h-8 px-4 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
            <span className="text-sm font-medium">All Regions</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Feasibility Score */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-base font-medium">Feasibility Score</p>
                <p className="text-blue-500 text-2xl font-bold">78/100</p>
              </div>
              <div className={`rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-2 rounded-full bg-blue-600" style={{ width: '78%' }}></div>
              </div>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>High Potential</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <p className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Total Addressable Market
                </p>
                <p className="text-2xl font-bold">$1.2B</p>
              </div>
              <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <p className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Projected Growth (YoY)
                </p>
                <p className="text-2xl font-bold">15%</p>
                <p className="text-blue-500 text-sm font-medium">+2.1%</p>
              </div>
              <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <p className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Top Competitors
                </p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>

            {/* Top 5 Markets */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-bold mb-4">Top 5 Potential Export Markets</h3>
              <div className="space-y-4">
                {markets.map((market) => (
                  <div key={market.name} className="flex items-center gap-4">
                    <p className={`w-24 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{market.name}</p>
                    <div className={`flex-1 h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all"
                        style={{ width: `${market.percentage}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {market.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* World Map */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-bold mb-4">Global Demand Intensity</h3>
              <div className="aspect-video w-full rounded-md overflow-hidden" style={{background: isDark ? '#111827' : '#f3f4f6'}}>
                <svg viewBox="0 0 800 400" className="w-full h-full">
                  {/* Background */}
                  <rect width="800" height="400" fill={isDark ? "#0f172a" : "#e0e7ff"} />
                  
                  {/* Base world map - continents with visible outlines */}
                  {/* North America */}
                  <path d="M 50 80 Q 60 60 80 65 L 120 70 L 140 85 L 155 90 L 165 110 L 170 130 L 165 150 L 155 165 L 140 175 L 120 180 L 100 185 L 85 190 L 75 185 L 65 175 L 55 160 Q 45 140 48 120 Q 50 100 50 80 Z" 
                        fill={isDark ? "#1e293b" : "#cbd5e1"} 
                        stroke={isDark ? "#334155" : "#94a3b8"} 
                        strokeWidth="1.5" />
                  
                  {/* South America */}
                  <path d="M 140 200 L 150 210 L 155 230 L 160 250 L 158 270 L 150 285 L 140 295 L 130 300 L 120 295 L 115 280 L 118 260 L 125 240 L 130 220 L 135 205 Z"
                        fill={isDark ? "#1e293b" : "#cbd5e1"} 
                        stroke={isDark ? "#334155" : "#94a3b8"} 
                        strokeWidth="1.5" />
                  
                  {/* Europe */}
                  <path d="M 380 80 L 400 75 L 420 80 L 435 85 L 445 95 L 450 110 L 445 125 L 435 135 L 420 140 L 405 142 L 390 140 L 378 130 L 375 115 L 378 95 Z"
                        fill={isDark ? "#1e293b" : "#cbd5e1"} 
                        stroke={isDark ? "#334155" : "#94a3b8"} 
                        strokeWidth="1.5" />
                  
                  {/* Africa */}
                  <path d="M 390 150 L 410 155 L 425 165 L 435 185 L 440 210 L 438 235 L 430 255 L 415 270 L 400 275 L 385 272 L 375 260 L 370 240 L 372 220 L 378 195 L 385 170 Z"
                        fill={isDark ? "#1e293b" : "#cbd5e1"} 
                        stroke={isDark ? "#334155" : "#94a3b8"} 
                        strokeWidth="1.5" />
                  
                  {/* Asia */}
                  <path d="M 460 90 L 500 85 L 540 90 L 570 100 L 590 115 L 600 135 L 595 155 L 580 170 L 560 180 L 540 185 L 520 183 L 500 175 L 485 160 L 475 140 L 470 120 L 465 105 Z"
                        fill={isDark ? "#1e293b" : "#cbd5e1"} 
                        stroke={isDark ? "#334155" : "#94a3b8"} 
                        strokeWidth="1.5" />
                  
                  {/* Australia */}
                  <path d="M 600 240 L 630 235 L 655 240 L 670 255 L 675 275 L 670 290 L 650 300 L 625 302 L 605 295 L 595 280 L 593 260 Z"
                        fill={isDark ? "#1e293b" : "#cbd5e1"} 
                        stroke={isDark ? "#334155" : "#94a3b8"} 
                        strokeWidth="1.5" />
                  
                  {/* Highlighted Markets - ordered by percentage */}
                  {/* USA - 90% (Brightest) */}
                  <circle cx="120" cy="130" r="38" fill="#2563EB" opacity="0.3">
                    <animate attributeName="r" values="38;45;38" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="120" cy="130" r="32" fill="#2563EB" opacity="0.95" />
                  <text x="120" y="135" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">USA</text>
                  <text x="120" y="151" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">90%</text>
                  
                  {/* Germany - 75% */}
                  <circle cx="415" cy="110" r="34" fill="#3b82f6" opacity="0.3">
                    <animate attributeName="r" values="34;40;34" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="415" cy="110" r="28" fill="#3b82f6" opacity="0.9" />
                  <text x="415" y="113" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">GER</text>
                  <text x="415" y="127" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">75%</text>
                  
                  {/* Singapore - 60% */}
                  <circle cx="555" cy="165" r="30" fill="#60a5fa" opacity="0.3">
                    <animate attributeName="r" values="30;36;30" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="555" cy="165" r="24" fill="#60a5fa" opacity="0.85" />
                  <text x="555" y="168" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">SGP</text>
                  <text x="555" y="181" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">60%</text>
                  
                  {/* Japan - 55% */}
                  <circle cx="620" cy="120" r="28" fill="#60a5fa" opacity="0.3">
                    <animate attributeName="r" values="28;34;28" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="620" cy="120" r="22" fill="#60a5fa" opacity="0.8" />
                  <text x="620" y="123" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">JPN</text>
                  <text x="620" y="136" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">55%</text>
                  
                  {/* Australia - 40% */}
                  <circle cx="640" cy="270" r="26" fill="#93c5fd" opacity="0.3">
                    <animate attributeName="r" values="26;32;26" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="640" cy="270" r="20" fill="#93c5fd" opacity="0.8" />
                  <text x="640" y="273" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">AUS</text>
                  <text x="640" y="286" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">40%</text>
                </svg>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>High Demand (75%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Medium Demand (50-75%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Growing Demand (40-50%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Challenges Donut */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-bold mb-4">Anticipated Challenges</h3>
              <div className="flex justify-center items-center py-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="40, 60" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="30, 70" strokeDashoffset="-40" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="30, 70" strokeDashoffset="-70" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <p className="text-sm">Logistics (40%)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <p className="text-sm">Regulatory (30%)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <p className="text-sm">Competition (30%)</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-bold mb-4">Strategic Recommendations</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Focus on digital marketing strategies tailored for the North American market to capture high-intent users.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Explore partnerships with logistics providers in the EU to mitigate potential supply chain challenges.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Develop a tiered pricing model to compete effectively with established players in the Asian market.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketDashboardPage;