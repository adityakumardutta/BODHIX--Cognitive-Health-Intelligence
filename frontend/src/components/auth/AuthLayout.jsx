import React from "react";

/**
 * New BODHIX Authentication Layout
 * Wraps the complete authentication card in a 3D perspective container.
 * The ENTIRE card rotates 360° as one object when `isRotating` is enabled
 * (triggered only after the real API authenticates the user successfully).
 */

export default function AuthLayout({ children, isRotating = false }) {
  return (
    <div
      className="min-h-screen w-full h-full flex items-center justify-center relative overflow-y-auto px-4 py-8 select-none"
      style={{
        background: `radial-gradient(ellipse at 75% 15%, rgba(147, 197, 253, 0.40) 0%, transparent 60%),
                     radial-gradient(ellipse at 15% 85%, rgba(196, 181, 253, 0.35) 0%, transparent 55%),
                     linear-gradient(135deg, #edf3fc 0%, #e1ebf9 50%, #e7f0fb 100%)`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Soft ambient background lighting (remains stable, never rotates) */}
      <div
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-45 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #93c5fd 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #c4b5fd 0%, transparent 70%)" }}
      />

      {/* 3D perspective viewport container */}
      <div
        className="w-full max-w-[450px] my-auto flex items-center justify-center"
        style={{
          perspective: "1200px",
          WebkitPerspective: "1200px",
        }}
      >
        {/* The complete authentication card (rotates 360° as one 3D object) */}
        <div
          className={`relative z-10 w-full p-8 sm:p-9 bg-white/75 backdrop-blur-2xl border border-white/85 rounded-[28px] shadow-[0_24px_60px_rgba(30,45,90,0.09)] flex flex-col items-center transition-all ${
            isRotating ? "auth-card-360-flip" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
          }}
        >
          {/* Master BODHIX brand header — logo already contains wordmark + tagline */}
          <div className="flex flex-col items-center text-center mb-5">
            <img
              src="/assets/bodhix-logo-full.png"
              alt="BODHIX — Cognitive Health Intelligence"
              width="165"
              height="110"
              style={{ height: 110, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
              className="drop-shadow-[0_10px_24px_rgba(99,102,241,0.35)]"
              loading="eager"
              fetchpriority="high"
            />
          </div>

          {/* Dynamic content section */}
          <div className="w-full">{children}</div>
        </div>
      </div>

      <style>{`
        @keyframes bodhix-card-flip-3d {
          0%   { transform: rotateY(0deg) scale(1);    box-shadow: 0 24px 60px rgba(30,45,90,0.09); }
          50%  { transform: rotateY(180deg) scale(1.04); box-shadow: 0 36px 85px rgba(99,102,241,0.24); }
          100% { transform: rotateY(360deg) scale(1);  box-shadow: 0 24px 60px rgba(30,45,90,0.09); }
        }
        .auth-card-360-flip {
          animation: bodhix-card-flip-3d 1.05s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}