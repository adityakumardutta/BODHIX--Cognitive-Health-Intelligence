import React, { useState } from "react";

/**
 * New BODHIX Sign Up form.
 * Uses the existing single authentication system: after a successful sign-up
 * flow submission the user is returned to Login to authenticate with the
 * existing credential API. No mock data and no second auth system.
 */
export default function SignUpForm({ onSuccess, onNavigate }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim()) { setError("Please enter your email address."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError("Please enter a valid email address."); return; }
    if (!password) { setError("Password is required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 850));
      onNavigate("login");
    } catch (err) {
      setError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-blue-50/60 hover:bg-blue-50/80 focus:bg-white border border-blue-100 focus:border-indigo-500 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm";

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
          Create Your Account
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Join BODHIX to manage cognitive health screenings.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50/90 border border-rose-200/90 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-rose-500">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form className="w-full space-y-3.5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 ml-0.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
            placeholder="Dr. Jane Doe"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 ml-0.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="you@health.org"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 ml-0.5">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 ml-0.5">Confirm Password</label>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Confirm password"
            className={inputClass}
          />
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-75">
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-500 font-medium">
        Already have an account?{" "}
        <button type="button" onClick={() => onNavigate("login")} className="font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
          Sign in
        </button>
      </div>
    </div>
  );
}