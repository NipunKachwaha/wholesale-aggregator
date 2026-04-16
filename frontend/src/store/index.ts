import { configureStore, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// ── Types
interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "purchaser" | "viewer" | "supplier";
  isActive: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// ── Auth Slice
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  loading: boolean;
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    isLoggedIn: !!localStorage.getItem("accessToken"),
    loading: false,
  } as AuthState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken;
      state.isLoggedIn = true;
      localStorage.setItem("accessToken", action.payload.tokens.accessToken);
      localStorage.setItem("refreshToken", action.payload.tokens.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

// ── UI Slice
interface UiState {
  sidebarOpen: boolean;
  currentPage: string;
  darkMode: boolean; // ← ADD
  notifications: { id: string; message: string; type: string }[];
}

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    currentPage: "dashboard",
    darkMode: localStorage.getItem("darkMode") === "true", // ← ADD
    notifications: [],
  } as UiState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDarkMode: (state) => {
      // ← ADD
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", String(state.darkMode));
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<{ message: string; type: string }>,
    ) => {
      state.notifications.push({
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
    },
  },
});

// ── Store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
});

// ── Types — ZAROORI EXPORTS
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ── Action Exports
export const { setCredentials, logout, setLoading } = authSlice.actions;
export const {
  toggleSidebar,
  setCurrentPage,
  addNotification,
  removeNotification,
  toggleDarkMode, // ← ADD
} = uiSlice.actions;