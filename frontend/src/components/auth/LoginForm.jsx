import React, { useState } from "react";
import { useAuth } from "../../services/authContext.jsx";

/**
 * BODHIX Login Form.
 * Uses the EXISTING authentication context (`useAuth().login`) which calls the
 * real backend `/auth/login` API and stores the JWT + user in localStorage.
 *
 * - On API success -> onSuccess(user) -> MasterAuth shows the success popup,
 *   rotates the card 360° and navigates to the Dashboard.
 * - On API failure -> onFailure(message) -> MasterAuth shows the failure popup.
 *   Inline errors are used for client-side field validation only.
 *
 * Guest Login calls the real backend `/auth/guest` endpoint, which
 * authenticates the dedicated guest/demo account server-side and returns the
 * NORMAL BODHIX JWT (role HEALTH_WORKER). No token or password lives in the
 * frontend and no authentication is bypassed.
 */

export default function LoginForm({ onSuccess, onFailure, onNavigate }) {
  const { login, guestLogin, updateProfile } = useAuth();
  const [specialistName, setSpecialistName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Guest sign-in state
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuestSignIn = async () => {
    if (guestLoading || isLoading) return;
    setError(null);
    setGuestLoading(true);
    try {
      // Real backend authentication: /auth/guest issues the normal BODHIX JWT
      // for the dedicated guest/demo account (role HEALTH_WORKER).
      const user = await guestLogin();
      // Reuse the EXISTING success popup + 360° card rotation flow.
      onSuccess(user);
    } catch (err) {
      onFailure(err?.message || "Guest sign-in is currently unavailable. Please try again.");
    } finally {
      setGuestLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // STEP 1: validate the form.
    if (!specialistName.trim()) {
      setError("Specialist name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    // STEP 2: call the existing REAL authentication API.
    setIsLoading(true);
    try {
      const user = await login(email.trim(), password);
      // Persist the specialist name on the authenticated user profile
      // (drives the existing navbar identity logic).
      await updateProfile({ fullName: specialistName.trim() });
      // STEP 3A: success -> MasterAuth shows the green popup + 360° card rotation.
      onSuccess(user || { fullName: specialistName.trim() });
    } catch (err) {
      // STEP 3B: failure -> real backend error, red popup, stay on the Login page.
      onFailure(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Title & subtitle */}
      <div className="text-center mb-6">
        <h1
          className="text-[26px] font-extrabold text-slate-800"
          style={{
            fontFamily: "'Manrope', 'Inter', sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Welcome Back!
        </h1>
        <p
          className="text-xs text-slate-500 font-medium mt-1.5"
          style={{ letterSpacing: "0.01em" }}
        >
          Sign in to continue to your cognitive dashboard
        </p>
      </div>
{/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-rose-50/90 border border-rose-200/90 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-rose-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        {/* Specialist Name field (first) */}
        <div>
          <label
            className="block text-[11px] font-semibold text-slate-700 mb-1.5 ml-0.5 uppercase"
            style={{ letterSpacing: "0.05em" }}
          >
            Specialist Name *
          </label>
          <input
            type="text"
            value={specialistName}
            onChange={(e) => setSpecialistName(e.target.value)}
            disabled={isLoading}
            placeholder="Dr. Abhay Kumar Dutta"
            autoComplete="name"
            className="w-full px-4 py-3 bg-blue-50/60 hover:bg-blue-50/80 focus:bg-white border border-blue-100 focus:border-indigo-500 rounded-xl text-[13px] text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
          />
        </div>

        {/* Email field (second) */}
        <div>
          <label
            className="block text-[11px] font-semibold text-slate-700 mb-1.5 ml-0.5 uppercase"
            style={{ letterSpacing: "0.05em" }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="worker1@dementiascreen.demo"
            autoComplete="email"
            className="w-full px-4 py-3 bg-blue-50/60 hover:bg-blue-50/80 focus:bg-white border border-blue-100 focus:border-indigo-500 rounded-xl text-[13px] text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
          />
        </div>
{/* Password field */}
        <div>
          <div className="flex items-center justify-between mb-1.5 ml-0.5">
            <label
              className="text-[11px] font-semibold text-slate-700 uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => onNavigate("forgot-password")}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer bg-transparent border-0 p-0"
              style={{ letterSpacing: "0.01em" }}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-blue-50/60 hover:bg-blue-50/80 focus:bg-white border border-blue-100 focus:border-indigo-500 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
{/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-75"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          or
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Guest sign-in */}
      <button
        type="button"
        onClick={handleGuestSignIn}
        disabled={guestLoading || isLoading}
        aria-label="Continue as Guest"
        className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {guestLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Signing in as Guest…</span>
          </>
        ) : (
          <>
            {/* Guest / user icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-slate-500">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Continue as Guest</span>
          </>
        )}
      </button>

      {/* Footer switch */}
      <div className="mt-6 text-center text-xs text-slate-500 font-medium">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => onNavigate("signup")}
          className="font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}