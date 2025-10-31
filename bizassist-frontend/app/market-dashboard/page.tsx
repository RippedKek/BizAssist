'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Bell, CheckCircle, ChevronDown, FileDown, Menu, Sparkles, Sun, Moon, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const RealWorldMap = dynamic(() => import('@/components/RealWorldMap'), { ssr: false });

const MarketDashboardPage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [summary, setSummary] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDark = theme === 'dark';

  useEffect(() => {
    const summaryParam = searchParams.get('summary');
    if (summaryParam) {
      setSummary(decodeURIComponent(summaryParam));
    }
  }, [searchParams]);

  const handleNext = () => {
    const params = new URLSearchParams();
    if (summary) {
      params.set('summary', encodeURIComponent(summary));
    }
    router.push(`/idea-ranker?${params.toString()}`);
  };

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
              Your Idea: {summary || 'AI-powered business pitch generator'}
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

              {/* Real interactive map */}
              <RealWorldMap theme={theme} markets={markets} />

              {/* Legend (kept from your original UI) */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>High Demand (75%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Medium Demand (50–75%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Growing Demand (40–50%)</span>
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

        {/* Rank Ideas Button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Rank Ideas
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default MarketDashboardPage;