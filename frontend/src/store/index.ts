import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthTokens } from "../types";

// ── Auth Slice
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  loading: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isLoggedIn: !!localStorage.getItem("accessToken"),
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
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
  notifications: { id: string; message: string; type: string }[];
}

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    currentPage: "dashboard",
    notifications: [],
  } as UiState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
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

// ── Exports
export const { setCredentials, logout, setLoading } = authSlice.actions;

export const {
  toggleSidebar,
  setCurrentPage,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
