'use client'

import { store } from './store'
import { Provider } from 'react-redux'
import { ReactNode } from 'react'
import { AuthStateListener } from './AuthStateListener'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthStateListener>{children}</AuthStateListener>
    </Provider>
  )
}
