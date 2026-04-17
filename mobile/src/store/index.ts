import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user:      any | null
  isLoggedIn: boolean
  tenantId:  string
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isLoggedIn: false, tenantId: '' } as AuthState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user      = action.payload.user
      state.tenantId  = action.payload.user?.tenant_id || ''
      state.isLoggedIn = true
    },
    clearUser: (state) => {
      state.user       = null
      state.isLoggedIn = false
      state.tenantId   = ''
    },
  },
})

export const { setUser, clearUser } = authSlice.actions

export const store = configureStore({
  reducer: { auth: authSlice.reducer },
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch