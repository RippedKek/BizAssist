'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from './redux/hooks'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAppSelector((state) => state.user)

  useEffect(() => {
    // Wait for auth state to be determined
    if (!loading) {
      if (user) {
        // User is logged in, redirect to homepage
        router.push('/homepage')
      } else {
        // User is not logged in, redirect to login
        router.push('/login')
      }
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
