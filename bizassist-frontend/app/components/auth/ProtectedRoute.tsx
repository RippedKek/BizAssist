'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '../../redux/hooks'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, loading } = useAppSelector((state) => state.user)

  useEffect(() => {
    // Wait for auth state to be determined
    if (!loading && !user) {
      // User is not logged in, redirect to login
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if user is not logged in (will redirect)
  if (!user) {
    return null
  }

  return <>{children}</>
}

