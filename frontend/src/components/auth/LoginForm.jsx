import React, { useState } from "react";
import { useAuth } from "../../services/authContext.jsx";
import { auth as firebaseAuth, googleProvider } from "../../services/firebase.js";
import { signInWithPopup, signOut } from "firebase/auth";

/**
 * BODHIX Login Form.
 * Uses the EXISTING authentication context (`useAuth().login`) which calls the
 * real backend `/auth/login` API and stores the JWT + user in localStorage.
 *
 * - On API success -> onSuccess(user) -> MasterAuth shows the success popup,
 *   rotates the card 360° and navigates to the Dashboard.
 * - On API failure -> onFailure(message) -> MasterAuth shows the failure popup.
 *   Inline errors are used for client-side field validation only.
 */

export default function LoginForm({ onSuccess, onFailure, onNavigate }) {
  const { login, googleLogin, updateProfile } = useAuth();
  const [specialistName, setSpecialistName] = useState("");
  const [email, setEmail] = useState("worker1@dementiascreen.demo");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Google sign-in state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [nameError, setNameError] = useState(null);

  // Maps Firebase error codes to clean user-facing messages. Raw codes,
  // stack traces and token contents are never shown to the user.
  function googleErrorMessage(err) {
    const code = err?.code || "";
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      return "Google sign-in was cancelled.";
    }
    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      return "Unable to sign in with Google. Please try again.";
    }
    if (code === "auth/network-request-failed") {
      return "Unable to connect to Google sign-in. Please try again.";
    }
    if (
      code === "auth/account-exists-with-different-credential" ||
      code === "auth/invalid-credential" ||
      code === "auth/invalid-api-key" ||
      code === "auth/unauthorized-domain" ||
      code === "auth/configuration-not-found"
    ) {
      return "Unable to sign in with Google. Please try again.";
    }
    return "Unable to connect to Google sign-in. Please try again.";
  }

  const handleGoogleSignIn = async () => {
    if (googleLoading || isLoading) return;
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(
        firebaseAuth,
        googleProvider
      );
      const idToken = await result.user.getIdToken();
      // Do NOT treat the user as logged in yet. Ask for the doctor/specialist
      // name, then authenticate against the real BODHIX backend.
      setGoogleIdToken(idToken);
      setDoctorName(result.user.displayName || "");
      setNameError(null);
      setShowNameModal(true);
    } catch (err) {
      onFailure(googleErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleModalCancel = async () => {
    setShowNameModal(false);
    setGoogleIdToken(null);
    setDoctorName("");
    setNameError(null);
    // Sign out of Firebase so no partially authenticated state remains.
    try {
      await signOut(firebaseAuth);
    } catch {
      /* non-fatal */
    }
  };

  const handleModalContinue = async () => {
    if (!doctorName.trim()) {
      setNameError("Please enter your name.");
      return;
    }
    setNameError(null);
    setIsLoading(true);
    try {
      // Backend verifies the Firebase ID token, finds/links the BODHIX user
      // and returns the normal BODHIX JWT. Role always comes from the server.
      const user = await googleLogin(googleIdToken, doctorName.trim());
      await updateProfile({ fullName: doctorName.trim() });
      setShowNameModal(false);
      setGoogleIdToken(null);
      // Reuse the EXISTING success popup + 360° card rotation flow.
      onSuccess(user || { fullName: doctorName.trim() });
    } catch {
      onFailure("Unable to complete sign-in. Please try again.");
      handleModalCancel();
    } finally {
      setIsLoading(false);
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

      {/* Google sign-in */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || isLoading}
        aria-label="Continue with Google"
        className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Signing in with Google…</span>
          </>
        ) : (
          <>
            {/* Official Google "G" logo */}
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Doctor / Specialist name modal (after Google auth, before backend auth) */}
      {showNameModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{ background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctor-name-modal-title"
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
            <h2
              id="doctor-name-modal-title"
              className="text-lg font-extrabold text-slate-800 text-center"
              style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
            >
              Complete Your Profile
            </h2>
            <p className="text-xs text-slate-500 font-medium text-center mt-1.5 mb-5">
              Tell us your name before continuing.
            </p>

            <label
              htmlFor="doctor-name-input"
              className="block text-[11px] font-bold text-slate-600 mb-1.5"
              style={{ letterSpacing: "0.02em" }}
            >
              Doctor / Specialist Name
            </label>
            <input
              id="doctor-name-input"
              type="text"
              value={doctorName}
              onChange={(e) => {
                setDoctorName(e.target.value);
                if (nameError) setNameError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleModalContinue();
              }}
              disabled={isLoading}
              placeholder="Enter your name"
              autoFocus
              className={`w-full px-4 py-3 bg-blue-50/60 hover:bg-blue-50/80 focus:bg-white border rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                nameError
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-blue-100 focus:border-indigo-500 focus:ring-indigo-500/20"
              }`}
            />
            {nameError && (
              <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{nameError}</p>
            )}

            <button
              type="button"
              onClick={handleModalContinue}
              disabled={isLoading}
              className="w-full mt-5 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-500/25 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Completing sign-in…</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleModalCancel}
              disabled={isLoading}
              className="w-full mt-2.5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-transparent border-0 cursor-pointer transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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