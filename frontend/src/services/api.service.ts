import axios from "axios";
import { store } from "../store";
import { logout } from "../store";

// ── Axios instance
const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor
// Har request mein JWT token attach karo
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor
// 401 aaye toh logout karo
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expire ho gaya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Refresh token try karo
      const refreshToken = store.getState().auth.refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post(
            "http://localhost:3001/auth/refresh",
            { refreshToken },
          );

          const newToken = response.data.data.tokens.accessToken;

          // Store update karo
          store.dispatch({
            type: "auth/setCredentials",
            payload: {
              user: store.getState().auth.user,
              tokens: response.data.data.tokens,
            },
          });

          // Original request retry karo
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch {
          // Refresh bhi fail — logout karo
          store.dispatch(logout());
          window.location.href = "/login";
        }
      } else {
        store.dispatch(logout());
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// ── Auth API calls
export const authApi = {
  // Login
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Register
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Refresh token
  refresh: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  // Current user
  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export default api;
