import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "./store";
import type { RootState } from "./store";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Vendors from "./pages/Vendors";
import Analytics from './pages/Analytics'

// Protected Route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode } = useSelector((state: RootState) => state.ui)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return <>{children}</>
}

function AppRoutes() {
  return (
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
      </Route>
    </Routes>
  );
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
