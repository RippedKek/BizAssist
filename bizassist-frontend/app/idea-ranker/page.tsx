'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Lightbulb, Sparkles, Download, Share, Menu, Sun, Moon } from 'lucide-react';


const IdeaRankerPage = () => {
  const [theme, setTheme] = useState('dark');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Data
    const labels = ['Novelty', 'Local Capability', 'Feasibility', 'Sustainability', 'Global Demand'];
    const data = [88, 85, 75, 90, 70];
    const max = 100;

    // Draw grid circles
    ctx.strokeStyle = isDark ? 'rgba(71, 85, 105, 0.7)' : 'rgba(203, 213, 225, 0.7)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 5) * i, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw axis lines
    const angleStep = (2 * Math.PI) / labels.length;
    labels.forEach((label, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw data polygon
    ctx.beginPath();
    data.forEach((value, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (value / max) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    data.forEach((value, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (value / max) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#2563EB';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw labels
    ctx.fillStyle = isDark ? 'rgba(248, 250, 252, 1)' : 'rgba(30, 41, 59, 1)';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    labels.forEach((label, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = radius + 30;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      ctx.fillText(label, x, y);
    });
  }, [theme, isDark]);

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
      <main className="max-w-7xl mx-auto px-6 lg:px-24 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">IdeaRanker Score for Agri-Tech Drone Solution</h1>
          <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Here's the breakdown of your idea's potential based on our analysis.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart - Large Column */}
          <div className={`lg:col-span-2 p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-center p-4">
              <canvas ref={canvasRef} width="500" height="500" className="max-w-full"></canvas>
            </div>
          </div>

          {/* Right Column Cards */}
          <div className="flex flex-col gap-6">
            {/* Pitch Readiness Index */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Pitch Readiness Index
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-blue-500 text-base font-bold mb-1">Strong Potential</p>
                  <p className="text-5xl font-black">
                    82
                    <span className={`text-3xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/100</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Next Steps
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Validate global demand assumptions with targeted market research.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Develop a detailed plan to address potential supply chain challenges.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold px-4 pb-3 pt-5">Score Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 p-4">
            <div className={`flex flex-col gap-1 border-t py-4 pr-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Novelty</p>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <strong>88/100:</strong> The use of AI for crop analysis is highly innovative in the local market.
              </p>
            </div>
            <div className={`flex flex-col gap-1 border-t py-4 md:pl-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Local Capability</p>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <strong>85/100:</strong> Strong alignment with local agricultural needs and government support.
              </p>
            </div>
            <div className={`flex flex-col gap-1 border-t py-4 pr-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Feasibility</p>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <strong>75/100:</strong> Solid operational strategy but may face initial supply chain challenges.
              </p>
            </div>
            <div className={`flex flex-col gap-1 border-t py-4 md:pl-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sustainability</p>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <strong>90/100:</strong> Promotes sustainable farming practices and reduces resource waste.
              </p>
            </div>
            <div className={`flex flex-col gap-1 border-t py-4 pr-2 col-span-1 md:col-span-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Global Demand</p>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <strong>70/100:</strong> High potential, but requires further research to validate international market assumptions.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
            <Sparkles className="w-5 h-5" />
            Generate Full Pitch
          </button>
          <button className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <button className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
            <Share className="w-5 h-5" />
            Share
          </button>
        </div>
      </main>
    </div>
  );
};

export default IdeaRankerPage;