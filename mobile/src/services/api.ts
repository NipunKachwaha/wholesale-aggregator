import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// Development — local IP use karo (localhost nahi chalega device pe)
const BASE_URL = 'http://192.168.1.100:3001' // Apna IP daalo

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Token interceptor
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth
export const authApi = {
  login: async (email: string, password: string) => {
    const r = await api.post('/auth/login', { email, password })
    // Token secure store mein save karo
    await SecureStore.setItemAsync('accessToken',  r.data.data.tokens.accessToken)
    await SecureStore.setItemAsync('refreshToken', r.data.data.tokens.refreshToken)
    return r.data
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
  },
  getToken: () => SecureStore.getItemAsync('accessToken'),
}

// ── Products
export const productsApi = {
  getAll: async (tenantId: string, search?: string) => {
    const r = await api.get('http://192.168.1.100:3002/catalog/products', {
      params: { tenantId, search, limit: 20 }
    })
    return r.data
  },
}

// ── Orders
export const ordersApi = {
  getAll: async (tenantId: string, status?: string) => {
    const r = await api.get('http://192.168.1.100:3003/orders', {
      params: { tenantId, status }
    })
    return r.data
  },
  create: async (data: any) => {
    const r = await api.post('http://192.168.1.100:3003/orders', data)
    return r.data
  },
  updateStatus: async (id: string, status: string, tenantId: string) => {
    const r = await api.patch(
      `http://192.168.1.100:3003/orders/${id}/status`,
      { status, tenantId }
    )
    return r.data
  },
}

export default api