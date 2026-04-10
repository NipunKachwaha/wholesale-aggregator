import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "./store";
import type { RootState } from "./store";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Vendors from "./pages/Vendors";

// Protected Route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

// Temp Login Page
function TempLogin() {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  if (isLoggedIn) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-5xl">🏪</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-3">
            Wholesale Aggregator
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Step 10 mein real login banega
          </p>
        </div>
        <button
          onClick={() => {
            store.dispatch({
              type: "auth/setCredentials",
              payload: {
                user: {
                  id: "1",
                  tenantId: "00000000-0000-0000-0000-000000000001",
                  email: "admin@demo.com",
                  firstName: "Admin",
                  lastName: "User",
                  role: "admin",
                  isActive: true,
                },
                tokens: {
                  accessToken: "temp-token",
                  refreshToken: "temp-refresh",
                  expiresIn: "15m",
                },
              },
            });
          }}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Demo Login (Admin) →
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<TempLogin />} />
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
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
