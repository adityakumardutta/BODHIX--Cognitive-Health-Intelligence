import React, { useEffect, useState, useCallback } from "react";
import "./BodhixIntro.css";

/**
 * BODHIX Premium Brand Intro
 *
 * 5-Stage Sequence (~3s total):
 * Stage 1 (0.0-0.4s): Deep navy background with subtle ambient light emerging
 * Stage 2 (0.4-1.0s): Minimal intelligence field
 * Stage 3 (1.0-1.7s): Logo reveal
 * Stage 4 (1.7-2.3s): Tagline reveal
 * Stage 5 (2.3-3.0s): Smooth transition out
 *
 * Design: Apple-level restraint + medical technology + cognitive intelligence
 * Pure CSS animations for performance. No canvas, no heavy libraries.
 */

export default function BodhixIntro({ onComplete }) {
  const [stage, setStage] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const completedRef = React.useRef(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const handleComplete = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setStage(4);
      const t = setTimeout(() => {
        setIsExiting(true);
        setTimeout(handleComplete, 500);
      }, 1200);
      return () => clearTimeout(t);
    }

    const timers = [
      setTimeout(() => setStage(1), 50),
      setTimeout(() => setStage(2), 400),
      setTimeout(() => setStage(3), 1000),
      setTimeout(() => setStage(4), 1700),
      setTimeout(() => {
        setStage(5);
        setIsExiting(true);
      }, 2300),
      setTimeout(handleComplete, 3000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [prefersReducedMotion, handleComplete]);

  const cn = "bx-intro" + (isExiting ? " bx-intro--exit" : "");

  return (
    <div
      className={cn}
      role="region"
      aria-label="BODHIX loading"
    >
      <div className="bx-bg" />

      <div
        className="bx-ambient"
        style={{ opacity: stage >= 1 ? 1 : 0 }}
      />

      <div
        className="bx-field"
        style={{ opacity: stage >= 2 && stage < 5 ? 1 : 0 }}
      >
        <div className="bx-ring bx-ring--1" />
        <div className="bx-ring bx-ring--2" />
        <div className="bx-ring bx-ring--3" />

        <div className="bx-dot bx-dot--1" />
        <div className="bx-dot bx-dot--2" />
        <div className="bx-dot bx-dot--3" />
        <div className="bx-dot bx-dot--4" />
        <div className="bx-dot bx-dot--5" />
        <div className="bx-dot bx-dot--6" />
      </div>

      <div
        className="bx-logo-wrap"
        style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3
            ? "translate(-50%, -50%) scale(1) translateY(0)"
            : "translate(-50%, -50%) scale(0.96) translateY(6px)",
        }}
      >
        <div
          className="bx-logo-glow"
          style={{ opacity: stage >= 3 ? 1 : 0 }}
        />
        <div
          className="bx-logo-pulse"
          style={{ opacity: stage >= 4 ? 1 : 0 }}
        />
        <img
          src="/assets/bodhix-logo-official.png"
          alt="BODHIX"
          className="bx-logo"
          loading="eager"
          draggable={false}
        />
      </div>

      <div
        className="bx-tagline"
        style={{
          opacity: stage >= 4 ? 1 : 0,
          transform: stage >= 4
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(8px)",
        }}
      >
        <span className="bx-tagline-text">
          COGNITIVE HEALTH INTELLIGENCE
        </span>
      </div>

      <div
        className="bx-sweep"
        style={{ opacity: stage >= 5 ? 1 : 0 }}
      />
    </div>
  );
}