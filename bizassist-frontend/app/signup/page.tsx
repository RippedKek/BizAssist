'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
import { auth, db } from '../firebase/firebase'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '../redux/hooks'
import { setUser } from '../redux/features/userSlice'

const SignUpPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [theme, setTheme] = useState('dark')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isDark = theme === 'dark'

  const handleSignUp = async () => {
    if (!email || !password || !name || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    try {
      setError('')
      setLoading(true)

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      // Add user data to Firestore
      await setDoc(doc(db, 'users', email), {
        name: name,
      })

      // Update Redux store
      dispatch(
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: name,
        })
      )

      router.push('/homepage')
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-32 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`fixed top-6 right-6 w-10 h-10 rounded-lg flex items-center justify-center ${
          isDark
            ? 'bg-gray-800 hover:bg-gray-700'
            : 'bg-white hover:bg-gray-100 border border-gray-300'
        }`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className='w-full max-w-md px-6'>
        {/* Logo & Title */}
        <div className='text-center mb-8'>
          <div
            className={`w-16 h-16 rounded-2xl ${
              isDark ? 'bg-blue-600' : 'bg-emerald-600'
            } flex items-center justify-center mx-auto mb-4`}
          >
            <Sparkles className='w-8 h-8 text-white' />
          </div>
          <h1
            className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Create Account
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign up to get started with BizAssist
          </p>
        </div>

        {/* Sign Up Form */}
        <div
          className={`rounded-2xl border p-8 ${
            isDark
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200 shadow-lg'
          }`}
        >
          <div className='space-y-6'>
            {/* Name Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Full Name
              </label>
              <div className='relative'>
                <User
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='John Doe'
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-600'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                  } focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-blue-600' : 'focus:ring-emerald-600'
                  } focus:ring-opacity-50`}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Email Address
              </label>
              <div className='relative'>
                <Mail
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='you@example.com'
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-600'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                  } focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-blue-600' : 'focus:ring-emerald-600'
                  } focus:ring-opacity-50`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Password
              </label>
              <div className='relative'>
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-600'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                  } focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-blue-600' : 'focus:ring-emerald-600'
                  } focus:ring-opacity-50`}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? 'text-gray-500 hover:text-gray-400'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Confirm Password
              </label>
              <div className='relative'>
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='••••••••'
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-600'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                  } focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-blue-600' : 'focus:ring-emerald-600'
                  } focus:ring-opacity-50`}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? 'text-gray-500 hover:text-gray-400'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className='flex items-start gap-2'>
              <input
                type='checkbox'
                className={`mt-1 w-4 h-4 rounded ${
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-300'
                }`}
              />
              <span
                className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                I agree to the{' '}
                <a
                  href='#'
                  className={`font-medium ${
                    isDark
                      ? 'text-blue-500 hover:text-blue-400'
                      : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href='#'
                  className={`font-medium ${
                    isDark
                      ? 'text-blue-500 hover:text-blue-400'
                      : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  Privacy Policy
                </a>
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  isDark
                    ? 'bg-red-900/50 text-red-200 border border-red-800'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSignUp}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              } ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              } transition-colors`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className='w-5 h-5' />
            </button>
          </div>

          {/* Divider */}
          <div className='relative my-6'>
            <div className={`absolute inset-0 flex items-center`}>
              <div
                className={`w-full border-t ${
                  isDark ? 'border-gray-800' : 'border-gray-200'
                }`}
              ></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span
                className={`px-4 ${
                  isDark
                    ? 'bg-gray-900 text-gray-400'
                    : 'bg-white text-gray-500'
                }`}
              >
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className='grid grid-cols-2 gap-4'>
            <button
              className={`py-3 px-4 rounded-xl border font-medium flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-750'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className='w-5 h-5' viewBox='0 0 24 24'>
                <path
                  fill='currentColor'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='currentColor'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='currentColor'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='currentColor'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                />
              </svg>
              Google
            </button>
            <button
              className={`py-3 px-4 rounded-xl border font-medium flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-750'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
              </svg>
              GitHub
            </button>
          </div>

          {/* Login Link */}
          <p
            className={`text-center mt-6 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Already have an account?{' '}
            <a
              href='/login'
              className={`font-medium ${
                isDark
                  ? 'text-blue-500 hover:text-blue-400'
                  : 'text-emerald-600 hover:text-emerald-700'
              }`}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
