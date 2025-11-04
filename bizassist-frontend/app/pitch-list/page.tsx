'use client'

import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import InputIdeaModal from '../../components/InputIdeaModal';

const MyPitchesPage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Validated' | 'Draft'>('all');
  const isDark = theme === 'dark';

  const pitches = [
    { id: 1, title: 'Eco-Friendly Jute Packaging', lastUpdated: '2 days ago', status: 'Validated' },
    { id: 2, title: 'Dhaka Food Delivery Service', lastUpdated: '1 week ago', status: 'Draft' },
    { id: 3, title: 'Digital Rickshaw Payment System', lastUpdated: '3 hours ago', status: 'Draft' },
  ];

  const filteredAndSortedPitches = useMemo(() => {
    let filtered = pitches.filter(pitch => {
      const matchesSearch = pitch.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || pitch.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'date') {
      // Simple sort by lastUpdated (assuming format like "X days ago")
      filtered.sort((a, b) => {
        const aDays = parseInt(a.lastUpdated.split(' ')[0]) || 0;
        const bDays = parseInt(b.lastUpdated.split(' ')[0]) || 0;
        return aDays - bDays;
      });
    } else if (sortBy === 'status') {
      filtered.sort((a, b) => a.status.localeCompare(b.status));
    }

    return filtered;
  }, [pitches, searchQuery, filterStatus, sortBy]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'}`}>
      <Navbar
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        showHomeLink={true}
        showMyPitchesLink={false}
        showLogout={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            My Pitches
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`group flex h-14 px-8 items-center justify-center rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl ${
              isDark
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
            }`}
          >
            Create New Pitch
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

        {/* Toolbar */}
        <div className={`flex flex-wrap items-center justify-between gap-4 p-2 rounded-lg mb-6 ${isDark ? 'bg-gray-800/40' : 'bg-white/40 border border-gray-200'}`}>
          <div className="relative flex-1 min-w-[250px]">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search pitches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-md border-0 ${
                isDark
                  ? 'bg-gray-800 text-gray-200 placeholder:text-gray-400'
                  : 'bg-gray-50 text-gray-800 placeholder:text-gray-500'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus(filterStatus === 'all' ? 'Validated' : filterStatus === 'Validated' ? 'Draft' : 'all')}
              className={`flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Status: {filterStatus === 'all' ? 'All' : filterStatus}</span>
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'status' : 'date')}
              className={`flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Sort: {sortBy === 'date' ? 'Date' : 'Status'}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-700">
          <div className={`overflow-x-auto ${isDark ? 'bg-gray-800/30' : 'bg-white'}`}>
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Pitch Title
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Last Updated
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAndSortedPitches.map((pitch) => (
                  <tr
                    key={pitch.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className={`px-6 py-4 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {pitch.title}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {pitch.lastUpdated}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          pitch.status === 'Validated'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {pitch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} aria-label="More actions">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <InputIdeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        theme={theme}
      />
    </div>
  );
};

export default MyPitchesPage;
