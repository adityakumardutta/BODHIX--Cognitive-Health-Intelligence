import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "dashboard"
  | "new-screening"
  | "people"
  | "screening-questions"
  | "screening-result"
  | "follow-ups"
  | "analytics"
  | "settings";

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  ClipboardCheck: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  BarChart2: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Sun: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Moon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Brain: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66z"/>
    </svg>
  ),
  Activity: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  UserCheck: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <polyline points="16 11 18 13 22 9"/>
    </svg>
  ),
  Clock: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  FileText: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    "Low concern": {
      label: "Low Concern",
      cls: "px-2.5 py-0.5 rounded-full text-xs font-medium",
    },
    "Review recommended": {
      label: "Review Recommended",
      cls: "px-2.5 py-0.5 rounded-full text-xs font-medium",
    },
    "Not screened": {
      label: "Not Screened",
      cls: "px-2.5 py-0.5 rounded-full text-xs font-medium",
    },
    "Pending": {
      label: "Pending",
      cls: "px-2.5 py-0.5 rounded-full text-xs font-medium",
    },
    "Overdue": {
      label: "Overdue",
      cls: "px-2.5 py-0.5 rounded-full text-xs font-medium",
    },
    "Completed": {
      label: "Completed",
      cls: "px-2.5 py-0.5 rounded-full text-xs font-medium",
    },
  };

  const entry = map[status] || { label: status, cls: "px-2.5 py-0.5 rounded-full text-xs font-medium" };

  const colorStyle =
    status === "Low concern"
      ? { background: "var(--badge-low)", color: "var(--badge-low-text)" }
      : status === "Review recommended" || status === "Overdue"
      ? { background: "var(--badge-review)", color: "var(--badge-review-text)" }
      : status === "Not screened" || status === "Pending"
      ? { background: "var(--badge-pending)", color: "var(--badge-pending-text)" }
      : status === "Completed"
      ? { background: "var(--badge-low)", color: "var(--badge-low-text)" }
      : { background: "var(--muted)", color: "var(--text-secondary)" };

  return (
    <span className={entry.cls} style={colorStyle}>
      {entry.label}
    </span>
  );
}

// ── Glass Card ────────────────────────────────────────────────────────────────
function GlassCard({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`glass-card rounded-[18px] ${className}`} style={style}>
      {children}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent: string;
}) {
  return (
    <div className="stat-card rounded-[18px] p-5 flex flex-col gap-3 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
        style={{ background: accent, transform: "translate(30%, -30%)" }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}18`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <div
          className="text-3xl font-bold"
          style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
        >
          {value}
        </div>
        <div className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({
  active,
  onNavigate,
  dark,
  onToggleDark,
}: {
  active: Screen;
  onNavigate: (s: Screen) => void;
  dark: boolean;
  onToggleDark: () => void;
}) {
  const [hovered, setHovered] = useState<Screen | null>(null);

  const navItems: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <Icon.Dashboard /> },
    { id: "new-screening", label: "New Screening", icon: <Icon.ClipboardCheck /> },
    { id: "people", label: "People", icon: <Icon.Users /> },
    { id: "follow-ups", label: "Follow-ups", icon: <Icon.Calendar /> },
    { id: "analytics", label: "Analytics", icon: <Icon.BarChart2 /> },
    { id: "settings", label: "Settings", icon: <Icon.Settings /> },
  ];

  return (
    <aside
      style={{
        width: 264,
        minWidth: 264,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "22px 14px",
        borderRadius: 24,
        background: dark
          ? "rgba(17, 24, 39, 0.58)"
          : "rgba(255, 255, 255, 0.48)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: dark
          ? "1px solid rgba(148, 163, 184, 0.15)"
          : "1px solid rgba(255, 255, 255, 0.70)",
        boxShadow: dark
          ? "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 8px 40px rgba(100,130,200,0.13), 0 1.5px 0 rgba(255,255,255,0.9) inset",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow behind glass */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: dark
            ? "radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(99,179,237,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: dark
            ? "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Branding ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 24, marginBottom: 4 }}>
        {/* Circular logo */}
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: dark
              ? "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)"
              : "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            boxShadow: dark
              ? "0 4px 20px rgba(13,148,136,0.35), 0 0 0 4px rgba(13,148,136,0.10)"
              : "0 4px 20px rgba(13,148,136,0.28), 0 0 0 4px rgba(13,148,136,0.08)",
            flexShrink: 0,
          }}
        >
          {/* Custom brain/diamond mark */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66z"/>
          </svg>
        </div>
        <div
          style={{
            fontFamily: "Manrope, sans-serif",
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: "0.06em",
            color: dark ? "#e2eaf4" : "#0f1d3b",
            lineHeight: 1.1,
          }}
        >
          BODHIX
        </div>
        <div
          style={{
            fontSize: 9,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            letterSpacing: "0.05em",
            color: dark ? "rgba(148,163,184,0.7)" : "rgba(90,106,138,0.75)",
            textAlign: "center",
            marginTop: 4,
            lineHeight: 1.4,
          }}
        >
          Cognitive Health Intelligence
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: dark ? "rgba(148,163,184,0.10)" : "rgba(15,29,59,0.07)", marginBottom: 16, marginLeft: 4, marginRight: 4 }} />

      {/* ── Nav label ─────────────────────────────────────────────────── */}
      <div
        style={{
          fontSize: 10,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.13em",
          textTransform: "uppercase",
          color: dark ? "rgba(148,163,184,0.50)" : "rgba(90,106,138,0.55)",
          paddingLeft: 10,
          marginBottom: 8,
        }}
      >
        Navigation
      </div>

      {/* ── Nav items ─────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const isActive = active === item.id;
          const isHov = hovered === item.id && !isActive;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "10px 12px",
                borderRadius: 13,
                border: isActive
                  ? `1px solid ${dark ? "rgba(45,212,191,0.28)" : "rgba(13,148,136,0.22)"}`
                  : "1px solid transparent",
                background: isActive
                  ? dark
                    ? "rgba(45,212,191,0.13)"
                    : "rgba(13,148,136,0.10)"
                  : isHov
                  ? dark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,255,255,0.55)"
                  : "transparent",
                boxShadow: isActive
                  ? dark
                    ? "0 2px 12px rgba(45,212,191,0.10), inset 0 1px 0 rgba(45,212,191,0.08)"
                    : "0 2px 12px rgba(13,148,136,0.08), inset 0 1px 0 rgba(255,255,255,0.6)"
                  : isHov
                  ? dark
                    ? "0 2px 8px rgba(0,0,0,0.15)"
                    : "0 2px 8px rgba(100,130,200,0.08)"
                  : "none",
                color: isActive
                  ? dark ? "#2dd4bf" : "#0d9488"
                  : isHov
                  ? dark ? "#c8d8ee" : "#1e3a5f"
                  : dark ? "rgba(148,163,184,0.75)" : "rgba(90,106,138,0.80)",
                fontFamily: "Inter, sans-serif",
                fontWeight: isActive ? 600 : 500,
                fontSize: 13.5,
                textAlign: "left",
                cursor: "pointer",
                transform: isHov && !isActive ? "translateX(3px)" : "translateX(0)",
                transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                width: "100%",
                position: "relative",
              }}
            >
              {/* Active left accent edge */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    height: "60%",
                    width: 3,
                    borderRadius: 999,
                    background: dark ? "#2dd4bf" : "#0d9488",
                    opacity: 0.9,
                  }}
                />
              )}
              <span
                style={{
                  display: "flex",
                  color: isActive
                    ? dark ? "#2dd4bf" : "#0d9488"
                    : isHov
                    ? dark ? "#a5c4e0" : "#0d9488"
                    : dark ? "rgba(148,163,184,0.6)" : "rgba(90,106,138,0.65)",
                  transition: "color 0.22s",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ── Disclaimer card ───────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 16,
          borderRadius: 14,
          padding: "10px 12px",
          background: dark
            ? "rgba(255,255,255,0.03)"
            : "rgba(255,255,255,0.50)",
          border: dark
            ? "1px solid rgba(148,163,184,0.10)"
            : "1px solid rgba(255,255,255,0.65)",
          backdropFilter: "blur(8px)",
          display: "flex",
          gap: 9,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flexShrink: 0, marginTop: 1 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={dark ? "rgba(148,163,184,0.5)" : "rgba(90,106,138,0.55)"} strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <p
          style={{
            fontSize: 10,
            lineHeight: 1.55,
            color: dark ? "rgba(148,163,184,0.55)" : "rgba(90,106,138,0.65)",
            fontFamily: "Inter, sans-serif",
            margin: 0,
          }}
        >
          Screening support only — not a diagnostic tool. Results require professional review.
        </p>
      </div>

      {/* ── Theme toggle ──────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 10,
          borderRadius: 14,
          padding: "5px",
          background: dark
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.45)",
          border: dark
            ? "1px solid rgba(148,163,184,0.12)"
            : "1px solid rgba(255,255,255,0.70)",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {[
          { label: "Light", icon: <Icon.Sun />, isDark: false },
          { label: "Dark", icon: <Icon.Moon />, isDark: true },
        ].map((opt) => {
          const chosen = dark === opt.isDark;
          return (
            <button
              key={opt.label}
              onClick={() => { if (dark !== opt.isDark) onToggleDark(); }}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "7px 0",
                borderRadius: 10,
                border: "none",
                background: chosen
                  ? dark
                    ? "rgba(45,212,191,0.12)"
                    : "rgba(13,148,136,0.10)"
                  : "transparent",
                color: chosen
                  ? dark ? "#2dd4bf" : "#0d9488"
                  : dark ? "rgba(148,163,184,0.5)" : "rgba(90,106,138,0.55)",
                fontFamily: "Inter, sans-serif",
                fontWeight: chosen ? 600 : 400,
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: chosen
                  ? dark
                    ? "0 1px 6px rgba(45,212,191,0.10)"
                    : "0 1px 6px rgba(13,148,136,0.08)"
                  : "none",
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({
  dark,
  onToggleDark,
}: {
  dark: boolean;
  onToggleDark: () => void;
}) {
  return (
    <header
      className="glass-nav flex items-center justify-between px-6"
      style={{ height: 60, flexShrink: 0 }}
    >
      {/* Online status */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "#10b981" }}
        />
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          Online
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Profile */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl" style={{ background: "var(--muted)" }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--primary)", color: "white", fontFamily: "Manrope, sans-serif" }}
          >
            PS
          </div>
          <div>
            <div className="text-xs font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
              Priya Sharma
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              Health Worker
            </div>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleDark}
          className="theme-toggle w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ color: "var(--text-secondary)" }}
          title={dark ? "Switch to light" : "Switch to dark"}
        >
          {dark ? <Icon.Sun /> : <Icon.Moon />}
        </button>

        {/* Logout */}
        <button
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-tertiary)",
            cursor: "pointer",
          }}
          title="Logout"
        >
          <Icon.LogOut />
        </button>
      </div>
    </header>
  );
}

// ── People data ───────────────────────────────────────────────────────────────
const PEOPLE = [
  { name: "Test Person", age: 70, location: "West District", lastScreening: "Not screened", status: "Not screened" },
  { name: "Meera Nair", age: 72, location: "West District", lastScreening: "01/06/2026", status: "Low concern" },
  { name: "Ram Prasad", age: 68, location: "West District", lastScreening: "02/06/2026", status: "Review recommended" },
  { name: "Kamla Devi", age: 74, location: "East District", lastScreening: "03/06/2026", status: "Low concern" },
  { name: "Suresh Kumar", age: 66, location: "North District", lastScreening: "28/05/2026", status: "Review recommended" },
  { name: "Anita Singh", age: 71, location: "South District", lastScreening: "25/05/2026", status: "Low concern" },
  { name: "Rajan Pillai", age: 69, location: "East District", lastScreening: "Not screened", status: "Not screened" },
  { name: "Parvati Rao", age: 73, location: "Central Zone", lastScreening: "15/05/2026", status: "Review recommended" },
];

// ── Screen: Dashboard ─────────────────────────────────────────────────────────
function ScreenDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="screen-content flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Overview of your cognitive health screening programme
          </p>
        </div>
        <button
          onClick={() => onNavigate("new-screening")}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Icon.Plus /> New Screening
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Icon.Users />} value={13} label="Total People Screened" accent="#0d9488" />
        <StatCard icon={<Icon.AlertCircle />} value={6} label="People Needing Review" accent="#ef4444" />
        <StatCard icon={<Icon.Clock />} value={5} label="Pending Follow-ups" accent="#f59e0b" />
        <StatCard icon={<Icon.CheckCircle />} value={13} label="Completed Screenings" accent="#10b981" />
      </div>

      {/* Recent people */}
      <GlassCard className="flex-1 overflow-hidden" style={{ display: "flex", flexDirection: "column" }}>
        <div className="flex items-center justify-between p-5 pb-0">
          <h2
            className="font-semibold text-base"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
          >
            Recently Registered People
          </h2>
          <button
            onClick={() => onNavigate("people")}
            className="text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)", cursor: "pointer" }}
          >
            View all <Icon.ChevronRight />
          </button>
        </div>

        <div className="overflow-auto flex-1 px-5 pb-5 mt-4">
          <table className="w-full">
            <thead>
              <tr>
                {["NAME", "AGE", "LOCATION", "LAST SCREENING", "STATUS"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold tracking-widest pb-3"
                    style={{ color: "var(--text-tertiary)", letterSpacing: "0.1em" }}
                  >
                    {h}
                  </th>
                ))}
                <th className="text-left text-[10px] font-semibold tracking-widest pb-3" style={{ color: "var(--text-tertiary)" }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {PEOPLE.slice(0, 6).map((p, i) => (
                <tr
                  key={i}
                  className="table-row border-t"
                  style={{ borderColor: "var(--glass-border)" }}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: "var(--secondary)", color: "var(--primary)" }}
                      >
                        {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.age}</td>
                  <td className="py-3 pr-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.location}</td>
                  <td className="py-3 pr-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.lastScreening}</td>
                  <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                        style={{ background: "var(--muted)", color: "var(--text-secondary)", cursor: "pointer" }}
                        title="View"
                      >
                        <Icon.Eye />
                      </button>
                      <button
                        onClick={() => onNavigate("new-screening")}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                        style={{ background: "var(--muted)", color: "var(--text-secondary)", cursor: "pointer" }}
                        title="New screening"
                      >
                        <Icon.FileText />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ── Screen: New Screening ─────────────────────────────────────────────────────
function ScreenNewScreening({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [form, setForm] = useState({
    name: "", age: "", gender: "", location: "", contact: "", notes: ""
  });

  return (
    <div className="screen-content flex flex-col gap-6 h-full">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
        >
          New Cognitive Screening
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Register or select a person to begin the screening session
        </p>
      </div>

      <div className="flex gap-5 flex-1 overflow-hidden">
        {/* Form */}
        <GlassCard className="flex-1 p-6 overflow-auto">
          <h2
            className="font-semibold text-base mb-5"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
          >
            Person Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Enter full name", span: 2 },
              { label: "Age", key: "age", type: "number", placeholder: "Years" },
              { label: "Gender", key: "gender", type: "select", options: ["Select gender", "Male", "Female", "Other"] },
              { label: "Location", key: "location", type: "text", placeholder: "District / Village / Town" },
              { label: "Contact Number", key: "contact", type: "tel", placeholder: "+91 XXXXX XXXXX" },
            ].map((field) =>
              field.type === "select" ? (
                <div key={field.key} className={field.span === 2 ? "col-span-2" : ""}>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {field.label}
                  </label>
                  <select
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-sm"
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-primary)" }}
                  >
                    {field.options!.map((o) => (
                      <option key={o} value={o === "Select gender" ? "" : o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div key={field.key} className={field.span === 2 ? "col-span-2" : ""}>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-sm"
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  />
                </div>
              )
            )}
            <div className="col-span-2">
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Notes
              </label>
              <textarea
                placeholder="Any relevant observations or context..."
                rows={3}
                className="glass-input w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => onNavigate("screening-questions")}
              className="btn-primary px-6 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <Icon.ClipboardCheck /> Start Screening
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className="btn-secondary px-4 py-3 rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>
        </GlassCard>

        {/* Sidebar info */}
        <div className="flex flex-col gap-4" style={{ width: 240, flexShrink: 0 }}>
          <GlassCard className="p-5">
            <h3
              className="font-semibold text-sm mb-3"
              style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
            >
              Screening Tools
            </h3>
            {[
              { name: "AD8", desc: "Informant/Self Interview", questions: 8 },
              { name: "RUDAS", desc: "Cognitive Assessment", questions: 6 },
              { name: "PFAQ", desc: "Functional Activities", questions: 10 },
            ].map((tool) => (
              <div
                key={tool.name}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: "var(--glass-border)" }}
              >
                <div>
                  <div className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                    {tool.name}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {tool.desc}
                  </div>
                </div>
                <div className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                  {tool.questions}Q
                </div>
              </div>
            ))}
          </GlassCard>

          <GlassCard className="p-5">
            <div
              className="text-xs font-semibold mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Recent People
            </div>
            {PEOPLE.slice(0, 4).map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 py-2 border-b last:border-0 cursor-pointer transition-opacity hover:opacity-70"
                style={{ borderColor: "var(--glass-border)" }}
                onClick={() => setForm({ ...form, name: p.name, age: String(p.age), location: p.location })}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: "var(--secondary)", color: "var(--primary)" }}
                >
                  {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                  <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{p.age} · {p.location}</div>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ── Screen: People ────────────────────────────────────────────────────────────
function ScreenPeople({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filters = ["All", "Needs Review", "Low Concern", "Not Screened"];

  const filtered = PEOPLE.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All" ||
      (filter === "Needs Review" && p.status === "Review recommended") ||
      (filter === "Low Concern" && p.status === "Low concern") ||
      (filter === "Not Screened" && p.status === "Not screened");
    return matchSearch && matchFilter;
  });

  return (
    <div className="screen-content flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
          >
            People
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {PEOPLE.length} registered individuals
          </p>
        </div>
        <button
          onClick={() => onNavigate("new-screening")}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Icon.Plus /> Add Person
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
            <Icon.Search />
          </div>
          <input
            type="text"
            placeholder="Search by name or location..."
            className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: filter === f ? "var(--primary)" : "var(--glass-bg)",
                color: filter === f ? "var(--primary-foreground)" : "var(--text-secondary)",
                border: `1px solid ${filter === f ? "var(--primary)" : "var(--glass-border)"}`,
                backdropFilter: "blur(8px)",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 p-5">
          <table className="w-full">
            <thead>
              <tr>
                {["NAME", "AGE", "LOCATION", "LAST SCREENING", "RISK STATUS", "ACTIONS"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold tracking-widest pb-3"
                    style={{ color: "var(--text-tertiary)", letterSpacing: "0.1em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="table-row border-t" style={{ borderColor: "var(--glass-border)" }}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: "var(--secondary)", color: "var(--primary)" }}
                      >
                        {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.age}</td>
                  <td className="py-3 pr-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.location}</td>
                  <td className="py-3 pr-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.lastScreening}</td>
                  <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:opacity-70"
                        style={{ background: "var(--muted)", color: "var(--text-secondary)", cursor: "pointer" }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => onNavigate("new-screening")}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:opacity-70"
                        style={{ background: "var(--secondary)", color: "var(--primary)", cursor: "pointer" }}
                      >
                        Screen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ── Screen: Screening Questions ───────────────────────────────────────────────
const AD8_QUESTIONS = [
  "Problems with judgement (e.g. falls for scams, makes bad financial decisions, buys gifts inappropriate for the occasion)?",
  "Less interest in hobbies / activities?",
  "Repeats the same things over and over (questions, stories, or statements)?",
  "Trouble learning how to use a tool, appliance, or gadget (e.g. computer, microwave, remote control)?",
  "Forgets correct month or year?",
  "Trouble handling complicated financial affairs (e.g. balancing accounts, income taxes)?",
  "Trouble remembering appointments?",
  "Daily problems with thinking or memory?",
];

function ScreenScreeningQuestions({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const progress = Math.round(((current) / AD8_QUESTIONS.length) * 100);

  const handleAnswer = (ans: string) => {
    setAnswers({ ...answers, [current]: ans });
  };

  const handleNext = () => {
    if (current < AD8_QUESTIONS.length - 1) setCurrent(current + 1);
    else onNavigate("screening-result");
  };

  return (
    <div className="screen-content flex flex-col gap-5 h-full items-center">
      {/* Header */}
      <div className="w-full max-w-2xl">
        <div className="text-center mb-2">
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--text-tertiary)", letterSpacing: "0.18em" }}
          >
            AD8 Informant / Self Interview
          </span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Question {current + 1} of {AD8_QUESTIONS.length}
          </span>
          <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
            {progress}%
          </span>
        </div>
        <div className="progress-bar-track h-1.5 w-full">
          <div className="progress-bar-fill h-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex items-center justify-center w-full max-w-2xl">
        <GlassCard className="w-full p-8 text-center" key={current}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "var(--secondary)", color: "var(--primary)" }}
          >
            <span className="text-sm font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              {current + 1}
            </span>
          </div>

          <p
            className="text-lg font-medium leading-relaxed mb-8"
            style={{
              fontFamily: "Manrope, sans-serif",
              color: "var(--text-primary)",
              maxWidth: 480,
              margin: "0 auto 2rem",
            }}
          >
            {AD8_QUESTIONS[current]}
          </p>

          <p className="text-xs mb-6" style={{ color: "var(--text-tertiary)" }}>
            Compared to a few years ago, has the person changed in this way?
          </p>

          <div className="flex gap-4 justify-center">
            {["No", "Yes"].map((ans) => (
              <button
                key={ans}
                onClick={() => handleAnswer(ans)}
                className={`answer-btn px-12 py-4 rounded-2xl text-base font-semibold ${
                  answers[current] === ans ? "selected" : ""
                }`}
                style={{
                  fontFamily: "Manrope, sans-serif",
                  color: answers[current] === ans ? "var(--primary)" : "var(--text-primary)",
                  minWidth: 130,
                }}
              >
                {ans}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <button
          onClick={() => current > 0 && setCurrent(current - 1)}
          className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          style={{ opacity: current === 0 ? 0.4 : 1 }}
          disabled={current === 0}
        >
          <Icon.ArrowLeft /> Back
        </button>
        <div className="flex gap-1.5">
          {AD8_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === current ? 20 : 6,
                height: 6,
                background: i === current
                  ? "var(--primary)"
                  : answers[i]
                  ? "rgba(13, 148, 136, 0.35)"
                  : "var(--glass-border)",
              }}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          style={{ opacity: !answers[current] ? 0.5 : 1 }}
        >
          {current === AD8_QUESTIONS.length - 1 ? "Finish" : "Next"}
          {current < AD8_QUESTIONS.length - 1 && <Icon.ChevronRight />}
        </button>
      </div>
    </div>
  );
}

// ── Screen: Screening Result ──────────────────────────────────────────────────
function ScreenScreeningResult({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const scores = [
    { label: "AD8", score: 8, max: 10, status: "Flagged" },
    { label: "RUDAS", score: 6, max: 30, status: "Flagged" },
    { label: "PFAQ", score: 12, max: 10, status: "Flagged" },
  ];

  return (
    <div className="screen-content flex flex-col gap-6 h-full items-center justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--text-tertiary)", letterSpacing: "0.18em" }}
          >
            Screening Completed
          </span>
        </div>

        {/* Main result */}
        <GlassCard className="p-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239, 68, 68, 0.10)", color: "#ef4444" }}
          >
            <Icon.AlertCircle />
          </div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
          >
            Review Recommended
          </h2>
          <p
            className="text-sm leading-relaxed max-w-md mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Further professional assessment may be appropriate. This is a screening result, not a diagnosis,
            and should be interpreted by an appropriately qualified healthcare professional.
          </p>
        </GlassCard>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-4">
          {scores.map((s) => {
            const pct = Math.min((s.score / s.max) * 100, 100);
            return (
              <GlassCard key={s.label} className="p-5 text-center">
                <div
                  className="text-xs font-bold tracking-widest mb-3"
                  style={{ color: "var(--text-tertiary)", letterSpacing: "0.1em" }}
                >
                  {s.label}
                </div>
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
                >
                  {s.score}
                  <span className="text-base font-normal" style={{ color: "var(--text-tertiary)" }}>
                    {" "}/ {s.max}
                  </span>
                </div>
                <div className="progress-bar-track h-1.5 my-3">
                  <div
                    className="progress-bar-fill h-full"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg, #ef4444, #f87171)",
                    }}
                  />
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: "var(--badge-review)", color: "var(--badge-review-text)" }}
                >
                  {s.status}
                </span>
              </GlassCard>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            className="btn-secondary px-4 py-2.5 rounded-xl text-sm"
          >
            View Details
          </button>
          <button
            className="btn-secondary px-4 py-2.5 rounded-xl text-sm"
          >
            Save &amp; Finish
          </button>
          <button
            onClick={() => onNavigate("follow-ups")}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            <Icon.Calendar /> Create Follow-up
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Follow-ups ────────────────────────────────────────────────────────
const FOLLOWUPS = {
  upcoming: [
    { person: "Meera Nair", date: "28 Aug 2026", reason: "6-month cognitive review", status: "Pending" },
    { person: "Kamla Devi", date: "02 Sep 2026", reason: "Post-assessment check", status: "Pending" },
    { person: "Suresh Kumar", date: "10 Sep 2026", reason: "Specialist referral follow-up", status: "Pending" },
  ],
  overdue: [
    { person: "Ram Prasad", date: "10 Jul 2026", reason: "3-month review", status: "Overdue" },
    { person: "Parvati Rao", date: "18 Jul 2026", reason: "Medication review", status: "Overdue" },
  ],
  completed: [
    { person: "Anita Singh", date: "15 Jun 2026", reason: "Initial follow-up", status: "Completed" },
    { person: "Rajan Pillai", date: "05 Jul 2026", reason: "Caregiver counselling", status: "Completed" },
  ],
};

function FollowUpCard({ item }: { item: (typeof FOLLOWUPS.upcoming)[0] }) {
  return (
    <div
      className="flex items-center justify-between py-3 px-4 rounded-xl transition-all hover:opacity-90"
      style={{ background: "var(--muted)", border: "1px solid var(--glass-border)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: "var(--secondary)", color: "var(--primary)" }}
        >
          {item.person.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.person}</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{item.reason}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{item.date}</div>
        </div>
        <StatusBadge status={item.status} />
        <button
          className="text-xs font-medium px-3 py-1 rounded-lg transition-all hover:opacity-70"
          style={{ background: "var(--secondary)", color: "var(--primary)", cursor: "pointer" }}
        >
          Reschedule
        </button>
      </div>
    </div>
  );
}

function ScreenFollowUps() {
  const sections = [
    { title: "Upcoming Follow-ups", items: FOLLOWUPS.upcoming },
    { title: "Overdue", items: FOLLOWUPS.overdue },
    { title: "Completed", items: FOLLOWUPS.completed },
  ];

  return (
    <div className="screen-content flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
          >
            Follow-ups
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Manage and track follow-up appointments
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Icon.Plus /> Schedule Follow-up
        </button>
      </div>

      <div className="flex-1 overflow-auto flex flex-col gap-5">
        {sections.map((section) => (
          <GlassCard key={section.title} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="font-semibold text-sm"
                style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
              >
                {section.title}
              </h2>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: "var(--muted)", color: "var(--text-tertiary)" }}
              >
                {section.items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {section.items.map((item, i) => (
                <FollowUpCard key={i} item={item} />
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Analytics ─────────────────────────────────────────────────────────
const chartData = [
  { month: "Feb", screenings: 2, flagged: 1 },
  { month: "Mar", screenings: 3, flagged: 2 },
  { month: "Apr", screenings: 4, flagged: 2 },
  { month: "May", screenings: 6, flagged: 3 },
  { month: "Jun", screenings: 5, flagged: 3 },
  { month: "Jul", screenings: 8, flagged: 4 },
  { month: "Aug", screenings: 13, flagged: 6 },
];

const riskData = [
  { name: "Low Concern", value: 7, color: "#0d9488" },
  { name: "Review Recommended", value: 6, color: "#ef4444" },
];

const followupData = [
  { label: "Completed", value: 2, color: "#0d9488" },
  { label: "Upcoming", value: 3, color: "#3b82f6" },
  { label: "Overdue", value: 2, color: "#ef4444" },
];

function ScreenAnalytics() {
  const tooltipStyle = {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: 12,
    color: "var(--text-primary)",
    fontSize: 12,
    backdropFilter: "blur(12px)",
  };

  return (
    <div className="screen-content flex flex-col gap-5 h-full">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
        >
          Analytics
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Screening trends and programme insights
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Icon.ClipboardCheck />} value={13} label="Total Screenings" accent="#0d9488" />
        <StatCard icon={<Icon.AlertCircle />} value={6} label="Flagged Screenings" accent="#ef4444" />
        <StatCard icon={<Icon.CheckCircle />} value={7} label="Low Concern" accent="#10b981" />
        <StatCard icon={<Icon.Clock />} value={5} label="Pending Follow-ups" accent="#f59e0b" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* Screenings over time */}
        <GlassCard className="col-span-2 p-5 flex flex-col">
          <h3
            className="font-semibold text-sm mb-4"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
          >
            Screenings Over Time
          </h3>
          <div className="flex-1" style={{ minHeight: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="screenings" stroke="#0d9488" strokeWidth={2} fill="url(#tealGrad)" name="Screenings" dot={false} />
                <Area type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={2} fill="url(#redGrad)" name="Flagged" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Risk distribution */}
        <GlassCard className="p-5 flex flex-col">
          <h3
            className="font-semibold text-sm mb-4"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
          >
            Risk Distribution
          </h3>
          <div className="flex-1 flex items-center justify-center" style={{ minHeight: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {riskData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {riskData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{d.name}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Follow-up completion */}
        <GlassCard className="col-span-3 p-5 flex flex-col">
          <h3
            className="font-semibold text-sm mb-4"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
          >
            Follow-up Completion
          </h3>
          <div style={{ minHeight: 100 }}>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={followupData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {followupData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ── Screen: Settings ──────────────────────────────────────────────────────────
function ScreenSettings({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifFollowup, setNotifFollowup] = useState(true);

  const sections = [
    { id: "profile", icon: <Icon.UserCheck />, label: "Profile" },
    { id: "appearance", icon: <Icon.Sun />, label: "Appearance" },
    { id: "notifications", icon: <Icon.Bell />, label: "Notifications" },
    { id: "screening", icon: <Icon.ClipboardCheck />, label: "Screening Preferences" },
    { id: "security", icon: <Icon.Shield />, label: "Security" },
  ];

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="relative rounded-full transition-all"
      style={{
        width: 40,
        height: 22,
        background: value ? "var(--primary)" : "var(--muted)",
        border: "1px solid var(--glass-border)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <div
        className="absolute rounded-full bg-white transition-all"
        style={{
          width: 16,
          height: 16,
          top: 2,
          left: value ? 20 : 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );

  return (
    <div className="screen-content flex flex-col gap-5 h-full">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
        >
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Manage your preferences and account settings
        </p>
      </div>

      <div className="flex gap-5 flex-1 overflow-hidden">
        {/* Section nav */}
        <GlassCard className="p-3 flex flex-col gap-1" style={{ width: 200, flexShrink: 0, alignSelf: "flex-start" }}>
          {sections.map((s) => (
            <button
              key={s.id}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all hover:opacity-80"
              style={{
                background: s.id === "appearance" ? "var(--secondary)" : "transparent",
                color: s.id === "appearance" ? "var(--primary)" : "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <span style={{ opacity: s.id === "appearance" ? 1 : 0.6 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </GlassCard>

        {/* Content */}
        <div className="flex-1 overflow-auto flex flex-col gap-4">
          {/* Profile */}
          <GlassCard className="p-6">
            <h2
              className="font-semibold text-base mb-4"
              style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
            >
              Profile
            </h2>
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold"
                style={{ background: "var(--primary)", color: "white", fontFamily: "Manrope, sans-serif" }}
              >
                PS
              </div>
              <div>
                <div className="font-semibold" style={{ color: "var(--text-primary)" }}>Priya Sharma</div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Health Worker · West District</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>priya.sharma@bodhix.health</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["Full Name", "Email", "District", "Phone"].map((f) => (
                <div key={f}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{f}</label>
                  <input
                    type="text"
                    placeholder={f}
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-sm"
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Appearance */}
          <GlassCard className="p-6">
            <h2
              className="font-semibold text-base mb-4"
              style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
            >
              Appearance
            </h2>
            <div className="flex gap-4">
              {[
                { label: "Light", preview: "#e8ecf5", card: "rgba(255,255,255,0.62)", isDark: false },
                { label: "Dark", preview: "#06091a", card: "rgba(15,25,55,0.72)", isDark: true },
              ].map((theme) => (
                <button
                  key={theme.label}
                  onClick={() => { if (theme.isDark !== dark) onToggleDark(); }}
                  className="flex flex-col items-center gap-2 transition-all hover:scale-105"
                  style={{ cursor: "pointer" }}
                >
                  {/* Mini preview */}
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      width: 120,
                      height: 80,
                      background: theme.preview,
                      border: dark === theme.isDark
                        ? "2px solid var(--primary)"
                        : "2px solid var(--glass-border)",
                      position: "relative",
                      padding: 8,
                    }}
                  >
                    <div
                      className="absolute left-2 top-2 bottom-2 rounded-xl"
                      style={{ width: 22, background: theme.card }}
                    />
                    <div
                      className="absolute left-6 top-2 right-2 h-3 rounded-lg"
                      style={{ background: theme.card }}
                    />
                    <div
                      className="absolute left-6 top-7 right-2 h-2 rounded-lg"
                      style={{ background: theme.card, opacity: 0.6 }}
                    />
                    <div
                      className="absolute left-6 top-11 right-2 h-2 rounded-lg"
                      style={{ background: theme.card, opacity: 0.4 }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: dark === theme.isDark ? "var(--primary)" : "var(--text-secondary)" }}
                  >
                    {theme.label}
                  </span>
                  {dark === theme.isDark && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />
                  )}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard className="p-6">
            <h2
              className="font-semibold text-base mb-4"
              style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}
            >
              Notifications
            </h2>
            <div className="flex flex-col gap-4">
              {[
                { label: "Email notifications", desc: "Receive screening summaries by email", value: notifEmail, onChange: () => setNotifEmail(!notifEmail) },
                { label: "SMS alerts", desc: "Follow-up reminders via SMS", value: notifSms, onChange: () => setNotifSms(!notifSms) },
                { label: "Follow-up reminders", desc: "Alerts for upcoming and overdue follow-ups", value: notifFollowup, onChange: () => setNotifFollowup(!notifFollowup) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{item.desc}</div>
                  </div>
                  <Toggle value={item.value} onChange={item.onChange} />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState<Screen>("dashboard");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":
        return <ScreenDashboard onNavigate={setScreen} />;
      case "new-screening":
        return <ScreenNewScreening onNavigate={setScreen} />;
      case "people":
        return <ScreenPeople onNavigate={setScreen} />;
      case "screening-questions":
        return <ScreenScreeningQuestions onNavigate={setScreen} />;
      case "screening-result":
        return <ScreenScreeningResult onNavigate={setScreen} />;
      case "follow-ups":
        return <ScreenFollowUps />;
      case "analytics":
        return <ScreenAnalytics />;
      case "settings":
        return <ScreenSettings dark={dark} onToggleDark={() => setDark(!dark)} />;
      default:
        return <ScreenDashboard onNavigate={setScreen} />;
    }
  };

  return (
    <div
      className="flex flex-col"
      style={{
        width: "100vw",
        height: "100vh",
        background: `radial-gradient(ellipse at 80% 10%, var(--ambient-1) 0%, transparent 60%),
                     radial-gradient(ellipse at 10% 80%, var(--ambient-2) 0%, transparent 55%),
                     linear-gradient(135deg, var(--bg-gradient-1) 0%, var(--bg-gradient-2) 100%)`,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Navbar */}
      <Navbar dark={dark} onToggleDark={() => setDark(!dark)} />

      {/* Body */}
      <div
        className="flex gap-4 flex-1 overflow-hidden"
        style={{ padding: "12px 16px 16px" }}
      >
        {/* Sidebar */}
        <Sidebar active={screen} onNavigate={setScreen} dark={dark} onToggleDark={() => setDark(!dark)} />

        {/* Main content */}
        <main
          className="flex-1 overflow-auto"
          style={{ minWidth: 0 }}
        >
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}
