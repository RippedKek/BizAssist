import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  user: {
    uid: string
    email: string | null
    displayName: string | null
  } | null
  loading: boolean
}

const initialState: UserState = {
  user: null,
  loading: true,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState['user']>) => {
      state.user = action.payload
      state.loading = false
    },
    clearUser: (state) => {
      state.user = null
      state.loading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setUser, clearUser, setLoading } = userSlice.actions
export default userSlice.reducer
