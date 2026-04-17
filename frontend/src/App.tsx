
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { store } from './store'
import type { RootState } from './store'
import { lazy, Suspense, useEffect, type ReactNode } from 'react'

// ── Lazy load all pages
const Layout = lazy(() => import('./components/layout/Layout'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Products = lazy(() => import('./pages/Products'))
const Orders = lazy(() => import('./pages/Orders'))
const Vendors = lazy(() => import('./pages/Vendors'))
const Analytics = lazy(() => import('./pages/Analytics'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'))
const Security = lazy(() => import('./pages/Security'))
const AIChatbot = lazy(() => import('./components/AIChatbot'))

// ── Loading Spinner
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}

// ── Dark Mode Provider
function DarkModeProvider({ children }: { children: ReactNode }) {
  const { darkMode } = useSelector((s: RootState) => s.ui)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return <>{children}</>
}

// ── Protected Route
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useSelector((s: RootState) => s.auth)
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="security" element={<Security />} />
          </Route>
        </Routes>
      </Suspense>

      {/* AI Chatbot — sab pages pe */}
      <Suspense fallback={null}>
        <AIChatbot />
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <DarkModeProvider>
          <AppRoutes />
        </DarkModeProvider>
      </BrowserRouter>
    </Provider>
  )
}