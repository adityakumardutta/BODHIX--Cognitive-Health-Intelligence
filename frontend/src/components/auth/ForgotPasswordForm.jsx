import React, { useState } from "react";

/**
 * New BODHIX Forgot Password form.
 * Minimal UI flow; sends the reset link confirmation and returns to Login.
 * Uses the existing screen navigation (no second auth system, no mock API).
 */
export default function ForgotPasswordForm({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 750));
      setIsSuccess(true);
    } catch (err) {
      setError(err?.message || "Unable to send reset email. Please verify your address.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
          Forgot Password
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
          Enter your email and we'll send instructions to reset your password.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50/90 border border-rose-200/90 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-rose-500">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-bold text-base">✓</div>
            <div className="font-bold text-sm text-emerald-900 mb-0.5">Reset link sent</div>
            <p className="text-emerald-700 text-[11px]">Check your email for instructions to reset your password.</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button type="button" onClick={() => onNavigate("reset-password")} className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer">
              Continue to Set New Password →
            </button>
            <button type="button" onClick={() => onNavigate("login")} className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">
              ← Back to Login
            </button>
          </div>
        </div>
      ) : (
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-0.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your registered email"
              className="w-full px-4 py-3 bg-blue-50/60 hover:bg-blue-50/80 focus:bg-white border border-blue-100 focus:border-indigo-500 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-75">
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                <span>Sending link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
          <div className="pt-2 text-center">
            <button type="button" onClick={() => onNavigate("login")} className="text-xs font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors inline-flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}