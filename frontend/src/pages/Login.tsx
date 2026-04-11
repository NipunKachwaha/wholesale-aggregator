import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { gsap } from "gsap";
import type { RootState } from "../store";
import { useAuth } from "../hooks/useAuth";

type Mode = "login" | "register";

export default function Login() {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { login, register, loading, error, clearError } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Refs for GSAP
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const c1Ref = useRef<HTMLDivElement>(null);
  const c2Ref = useRef<HTMLDivElement>(null);
  const c3Ref = useRef<HTMLDivElement>(null);

  // Mount animation
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      cardRef.current,
      { y: 80, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" },
    )
      .fromTo(
        logoRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.3",
      )
      .fromTo(
        formRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        "-=0.2",
      );

    // Floating circles
    gsap.to(c1Ref.current, {
      y: -30,
      x: 20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(c2Ref.current, {
      y: 20,
      x: -25,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1,
    });
    gsap.to(c3Ref.current, {
      y: -20,
      x: 15,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 2,
    });
  }, []);

  // Error shake animation
  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { x: -10 },
        { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
      );
    }
  }, [error]);

  // Mode switch animation
  const switchMode = (newMode: Mode) => {
    clearError();
    gsap.to(formRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.2,
      onComplete: () => {
        setMode(newMode);
        gsap.to(formRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === "login") {
      await login(email, password);
    } else {
      await register({ email, password, firstName, lastName });
    }
  };

  if (isLoggedIn) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center overflow-hidden">
      {/* Floating BG Circles */}
      <div
        ref={c1Ref}
        className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl"
      />
      <div
        ref={c2Ref}
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl"
      />
      <div
        ref={c3Ref}
        className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-500 rounded-full opacity-10 blur-3xl"
      />

      {/* Card */}
      <div
        ref={cardRef}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <span ref={logoRef} className="text-6xl inline-block">
            🏪
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-3">
            Wholesale Aggregator
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            AI-Powered Order Management
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize ${
                mode === m
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m === "login" ? "🔑 Login" : "✨ Register"}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            ref={errorRef}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
          >
            <span>❌</span>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* Register fields */}
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Rahul"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sharma"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@demo.com"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "login" ? "Admin@1234" : "Min 8 chars"}
                required
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 shadow-lg ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"
            }`}
          >
            {loading
              ? "⏳ Please wait..."
              : mode === "login"
                ? "🔑 Login"
                : "✨ Create Account"}
          </button>

          {/* Demo credentials hint */}
          {mode === "login" && (
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-600 font-medium">
                Demo: admin@demo.com / Admin@1234
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
