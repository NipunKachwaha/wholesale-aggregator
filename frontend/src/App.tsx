import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "./store";
import type { RootState } from "./store";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
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

// Login Page with GSAP
function TempLogin() {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Card slide up
    tl.fromTo(
      cardRef.current,
      { y: 80, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" },
    )
      // Logo bounce
      .fromTo(
        logoRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.3",
      )
      // Title fade
      .fromTo(
        titleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        "-=0.2",
      )
      // Subtitle fade
      .fromTo(
        subRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        "-=0.2",
      )
      // Button pop
      .fromTo(
        btnRef.current,
        { y: 20, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.1",
      );
  }, []);

  // Button hover animation
  const handleMouseEnter = () => {
    gsap.to(btnRef.current, {
      scale: 1.05,
      duration: 0.2,
      ease: "power2.out",
    });
  };
  const handleMouseLeave = () => {
    gsap.to(btnRef.current, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleLogin = () => {
    // Click animation phir login
    gsap.to(btnRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
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
      },
    });
  };

  if (isLoggedIn) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center overflow-hidden">
      {/* Background floating circles */}
      <FloatingCircles />

      <div
        ref={cardRef}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <span ref={logoRef} className="text-6xl inline-block">
            🏪
          </span>
          <h1 ref={titleRef} className="text-2xl font-bold text-slate-800 mt-3">
            Wholesale Aggregator
          </h1>
          <p ref={subRef} className="text-slate-500 text-sm mt-1">
            AI-Powered Order Management System
          </p>
        </div>

        <button
          ref={btnRef}
          onClick={handleLogin}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-200"
        >
          Demo Login (Admin) →
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          Step 10 mein real JWT login aayega
        </p>
      </div>
    </div>
  );
}

// Floating background circles
function FloatingCircles() {
  const c1 = useRef<HTMLDivElement>(null);
  const c2 = useRef<HTMLDivElement>(null);
  const c3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Circle 1
    gsap.to(c1.current, {
      y: -30,
      x: 20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    // Circle 2
    gsap.to(c2.current, {
      y: 20,
      x: -25,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1,
    });
    // Circle 3
    gsap.to(c3.current, {
      y: -20,
      x: 15,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 2,
    });
  }, []);

  return (
    <>
      <div
        ref={c1}
        className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl"
      />
      <div
        ref={c2}
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl"
      />
      <div
        ref={c3}
        className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-500 rounded-full opacity-10 blur-3xl"
      />
    </>
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
