'use client'

import React from 'react'
import { Sparkles, Sun, Moon, LogOut } from 'lucide-react'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  theme: 'dark' | 'light'
  onThemeChange: (theme: 'dark' | 'light') => void
  showHomeLink?: boolean
  showMyPitchesLink?: boolean
  showLogout?: boolean
  onLogout?: () => void
  className?: string
}

const Navbar: React.FC<NavbarProps> = ({
  theme,
  onThemeChange,
  showHomeLink = true,
  showMyPitchesLink = false,
  showLogout = true,
  onLogout,
  className = '',
}) => {
  const router = useRouter()
  const isDark = theme === 'dark'

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      try {
        const auth = getAuth()
        await signOut(auth)
        router.push('/login')
      } catch (error) {
        console.error('Error signing out:', error)
      }
    }
  }

  const toggleTheme = () => {
    onThemeChange(isDark ? 'light' : 'dark')
  }

  return (
    <nav
      className={`backdrop-blur-sm border-b ${
        isDark
          ? 'border-gray-800 bg-gray-900/80'
          : 'border-gray-200 bg-white/80'
      } sticky top-0 z-40 ${className}`}
    >
      <div className='max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between'>
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <a href='/homepage' className='flex items-center gap-3'>
            <div
              className={`w-10 h-10 rounded-xl ${
                isDark
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              } flex items-center justify-center shadow-lg`}
            >
              <Sparkles className='w-6 h-6 text-white' />
            </div>
            <span className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'>
              BizAssist
            </span>
          </a>
        </div>

        {/* Navigation Links and Actions */}
        <div className='flex items-center gap-4'>
          {showHomeLink && (
            <a
              href='/homepage'
              className={`${
                isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              Home
            </a>
          )}

          {showMyPitchesLink && (
            <a
              href='/pitch-list'
              className={`${
                isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              My Pitches
            </a>
          )}

          {showLogout && (
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm'
              }`}
            >
              <LogOut className='w-4 h-4' />
              <span>Log Out</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-100 border border-gray-300 shadow-sm'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className='w-5 h-5' />
            ) : (
              <Moon className='w-5 h-5' />
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

