import React from "react";

/**
 * Centered login status popup (premium, professional).
 *  - type="success": green circular tick, "Login Successful"
 *  - type="error":   red circular cross, "Login Unsuccessful"
 * Smooth entrance animation with a subtle glow. Purely visual — the login
 * flow logic lives in MasterAuth.
 */

export default function LoginStatusOverlay({ type, message }) {
  if (!type) return null;
  const success = type === "success";

  return (
    <div className="bodhix-login-overlay" role="status" aria-live="polite">
      <style>{`
        .bodhix-login-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.18);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: bodhix-overlay-in 0.25s ease-out both;
          pointer-events: all;
        }
        @keyframes bodhix-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .bodhix-login-popup {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 34px 52px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
          animation: bodhix-popup-in 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) both;
          font-family: 'Inter', sans-serif;
        }
        @keyframes bodhix-popup-in {
          from { opacity: 0; transform: translateY(14px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .bodhix-login-popup-success {
          box-shadow: 0 24px 60px rgba(16, 185, 129, 0.28), 0 0 40px rgba(16, 185, 129, 0.12);
        }
        .bodhix-login-popup-error {
          box-shadow: 0 24px 60px rgba(244, 63, 94, 0.26), 0 0 40px rgba(244, 63, 94, 0.10);
        }
        .bodhix-login-icon {
          width: 72px;
          height: 72px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bodhix-icon-pop 0.5s cubic-bezier(0.34, 1.5, 0.64, 1) 0.1s both;
        }
        @keyframes bodhix-icon-pop {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        .bodhix-login-icon-success {
          background: radial-gradient(circle at 32% 28%, #d1fae5, #a7f3d0);
          box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.10), 0 10px 24px rgba(16, 185, 129, 0.30);
        }
        .bodhix-login-icon-error {
          background: radial-gradient(circle at 32% 28%, #ffe4e6, #fecdd3);
          box-shadow: 0 0 0 8px rgba(244, 63, 94, 0.08), 0 10px 24px rgba(244, 63, 94, 0.26);
        }
        .bodhix-login-icon svg path,
        .bodhix-login-icon svg circle {
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .bodhix-tick-circle, .bodhix-cross-circle { stroke-width: 3; }
        .bodhix-tick-path, .bodhix-cross-path { stroke-width: 4.5; }
        .bodhix-login-icon-success svg circle { stroke: #10b981; }
        .bodhix-login-icon-success svg path {
          stroke: #059669;
          stroke-dasharray: 34;
          stroke-dashoffset: 34;
          animation: bodhix-draw 0.45s ease-out 0.35s forwards;
        }
        .bodhix-login-icon-error svg circle { stroke: #f43f5e; }
        .bodhix-login-icon-error svg path {
          stroke: #e11d48;
          stroke-dasharray: 46;
          stroke-dashoffset: 46;
          animation: bodhix-draw 0.45s ease-out 0.35s forwards;
        }
        @keyframes bodhix-draw {
          to { stroke-dashoffset: 0; }
        }
        .bodhix-login-title {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.01em;
          font-family: 'Manrope', 'Inter', sans-serif;
        }
        .bodhix-login-message {
          margin-top: -6px;
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          max-width: 260px;
          text-align: center;
          line-height: 1.45;
        }
      `}</style>
      <div className={`bodhix-login-popup ${success ? "bodhix-login-popup-success" : "bodhix-login-popup-error"}`}>
        {/* Circular icon */}
        <div className={`bodhix-login-icon ${success ? "bodhix-login-icon-success" : "bodhix-login-icon-error"}`}>
          {success ? (
            <svg viewBox="0 0 52 52" width="34" height="34" aria-hidden="true">
              <circle className="bodhix-tick-circle" cx="26" cy="26" r="24" fill="none" />
              <path className="bodhix-tick-path" d="M15 27 L23 35 L38 19" fill="none" />
            </svg>
          ) : (
            <svg viewBox="0 0 52 52" width="34" height="34" aria-hidden="true">
              <circle className="bodhix-cross-circle" cx="26" cy="26" r="24" fill="none" />
              <path className="bodhix-cross-path" d="M18 18 L34 34 M34 18 L18 34" fill="none" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div
          className={`bodhix-login-title ${success ? "text-emerald-700" : "text-rose-700"}`}
          style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
        >
          {success ? "Login Successful" : "Login Unsuccessful"}
        </div>
        {message && !success && (
          <div className="bodhix-login-message">{message}</div>
        )}
      </div>
    </div>
  );
}

