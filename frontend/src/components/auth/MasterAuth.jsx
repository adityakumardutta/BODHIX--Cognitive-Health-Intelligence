import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import LoginForm from "./LoginForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ResetPasswordForm from "./ResetPasswordForm";
import SignUpForm from "./SignUpForm";
import LoginStatusOverlay from "./LoginStatusOverlay.jsx";

/**
 * BODHIX Master Authentication orchestrator.
 *
 * Flow (login):
 *   Real API authenticates via `authContext`
 *   -> SUCCESS: green "Login Successful" popup (brief)
 *   -> the login CARD itself rotates exactly 360° in 3D
 *   -> navigate to the existing Dashboard.
 *   -> FAILURE: red "Login Unsuccessful" popup with the real backend error;
 *      the user stays on the Login page. No rotation, no redirect.
 *
 * The rotation is applied ONLY to the outer card container (AuthLayout), so the
 * whole card — logo, headings, fields, buttons — rotates as one physical object.
 */

export default function MasterAuth() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("login");
  const [isRotating, setIsRotating] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }

  const handleAuthSuccess = () => {
    // 1. Green success popup (centered, premium animation).
    setStatus({ type: "success", message: null });

    // 2. After the popup is briefly visible, rotate ONLY the login card 360°.
    setTimeout(() => {
      setIsRotating(true);
    }, 1200);

    // 3. Navigate to the existing Dashboard once the flip completes (1.05s).
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 2350);
  };

  const handleAuthFailure = (message) => {
    // Red failure popup with the real backend error. Stays on the Login page.
    setStatus({ type: "error", message });
    setTimeout(() => setStatus(null), 2200);
  };

  return (
    <>
      <AuthLayout isRotating={isRotating}>
        {screen === "login" && (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onFailure={handleAuthFailure}
            onNavigate={setScreen}
          />
        )}

        {screen === "forgot-password" && (
          <ForgotPasswordForm onNavigate={setScreen} />
        )}

        {screen === "reset-password" && (
          <ResetPasswordForm onNavigate={setScreen} />
        )}

        {screen === "signup" && (
          <SignUpForm onSuccess={handleAuthSuccess} onNavigate={setScreen} />
        )}
      </AuthLayout>

      {/* Centered status popup (does NOT rotate with the card) */}
      <LoginStatusOverlay type={status?.type} message={status?.message} />
    </>
  );
}
