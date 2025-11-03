'use client'

import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebase'
import { useAppDispatch } from './hooks'
import { setUser, clearUser, setLoading } from './features/userSlice'

export function AuthStateListener({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setLoading(true))
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          })
        )
      } else {
        dispatch(clearUser())
      }
    })

    return () => unsubscribe()
  }, [dispatch])

  return <>{children}</>
}
