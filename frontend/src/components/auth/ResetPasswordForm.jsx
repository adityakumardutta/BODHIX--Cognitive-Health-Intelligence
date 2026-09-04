import React, { useState } from "react";

/**
 * New BODHIX Reset Password form.
 * Matches the BODHIX design; returns to Login after the flow completes.
 */
export default function ResetPasswordForm({ onNavigate }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!password) { setError("Please enter a new password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters long."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      setIsSuccess(true);
    } catch (err) {
      setError(err?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const eyeIcon = (showState, setShowState) => (
    <button
      type="button"
      onClick={() => setShowState(!showState)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
    >
      {showState ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
          Create New Password
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Enter your new password below.</p>
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
            <div className="font-bold text-sm text-emerald-900 mb-0.5">Password Updated</div>
            <p className="text-emerald-700 text-[11px]">Your password has been successfully reset. You can now sign in.</p>
          </div>
          <button type="button" onClick={() => onNavigate("login")} className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer">
            Sign In with New Password →
          </button>
        </div>
      ) : (
<form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-0.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your new password"
                className="w-full px-4 py-3 bg-blue-50/60 hover:bg-blue-50/80 focus:bg-white border border-blue-100 focus:border-indigo-500 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm pr-11"
              />
              {eyeIcon(showPassword, setShowPassword)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-0.5">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 bg-blue-50/60 hover:bg-blue-50/80 focus:bg-white border border-blue-100 focus:border-indigo-500 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm pr-11"
              />
              {eyeIcon(showConfirm, setShowConfirm)}
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-75">
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
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