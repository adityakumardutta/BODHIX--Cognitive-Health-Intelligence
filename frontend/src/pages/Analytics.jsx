import { useEffect, useMemo, useRef, useState } from "react"
import { api } from "../services/api.js"
import StatCard from "../components/StatCard.jsx"
import { Icons } from "../components/Icons.jsx"
import { Skeleton, ErrorState } from "../components/Feedback.jsx"

/* ── helpers ─────────────────────────────────────────────── */
const asArr = (d) => (Array.isArray(d) ? d : Array.isArray(d?.value) ? d.value : [])

function useReducedMotion() {
  const [r, setR] = useState(false)
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)")
    setR(m.matches)
    const fn = (e) => setR(e.matches)
    m.addEventListener?.("change", fn)
    return () => m.removeEventListener?.("change", fn)
  }, [])
  return r
}

/* Count-up: eases to the real final value, then locks it. */
function CountUp({ value, delay = 550, duration = 900 }) {
  const reduced = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (reduced || value == null) { setN(value); return }
    let raf, start
    const tick = (t) => {
      if (start === undefined) start = t + delay
      const p = Math.min(1, Math.max(0, (t - start) / duration))
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, delay, duration, reduced])
  return n ?? "—"
}

/* Catmull-Rom → cubic bezier smoothing for the trend line */
function smoothPath(pts) {
  if (pts.length < 2) return ""
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

/* ── Screenings Over Time: SVG line drawn LEFT → RIGHT ───── */
function LineChartCard({ data, delay = 500 }) {
  const reduced = useReducedMotion()
  const pathRef = useRef(null)
  const [len, setLen] = useState(0)
  const [hover, setHover] = useState(null)

  const W = 640, H = 240, P = { t: 18, r: 16, b: 30, l: 34 }
  const hasFlagged = data.length > 0 && data.every((d) => Number.isFinite(d.flagged))
  const max = Math.max(1, ...data.flatMap((d) => [d.screenings, hasFlagged ? d.flagged : 0]))
  const pts = useMemo(() => {
    if (!data.length) return []
    const step = data.length > 1 ? (W - P.l - P.r) / (data.length - 1) : 0
    return data.map((d, i) => ({
      ...d,
      x: P.l + i * step,
      y: H - P.b - (d.screenings / max) * (H - P.t - P.b),
      flaggedY: hasFlagged ? H - P.b - (d.flagged / max) * (H - P.t - P.b) : null,
    }))
  }, [data, max, hasFlagged])
  const line = useMemo(() => smoothPath(pts), [pts])
  const flaggedLine = useMemo(() => hasFlagged ? smoothPath(pts.map((p) => ({ x: p.x, y: p.flaggedY }))) : "", [pts, hasFlagged])
  const area = pts.length ? `${line} L ${pts[pts.length - 1].x} ${H - P.b} L ${pts[0].x} ${H - P.b} Z` : ""

  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()) }, [line])
  return (
    <div className="chart-card an-card p-5 flex flex-col min-w-0 lg:col-span-2" style={{ ["--an-delay"]: `${delay}ms` }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-sm" style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}>Screenings Over Time</h3>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-teal-500" />Total Screened</span>
          {hasFlagged && <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-red-500" />Flagged for Review</span>}
        </div>
      </div>
      <div className="an-chart-body" style={{ minHeight: 220 }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="none" style={{ overflow: "visible" }} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="anTeal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="anRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
            <clipPath id="anReveal"><rect className="an-area-clip" x="0" y="0" height={H} width={W} /></clipPath>
          </defs>

          <g className="an-grid">
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <line key={f} x1={P.l} x2={W - P.r} y1={P.t + f * (H - P.t - P.b)} y2={P.t + f * (H - P.t - P.b)} stroke="var(--border)" strokeOpacity="0.5" strokeDasharray="3 4" />
            ))}
            <line x1={P.l} x2={P.l} y1={P.t} y2={H - P.b} stroke="var(--text-tertiary)" strokeOpacity="0.4" />
            <line x1={P.l} x2={W - P.r} y1={H - P.b} y2={H - P.b} stroke="var(--text-tertiary)" strokeOpacity="0.4" />
            {pts.map((p, i) => (<text key={i} x={p.x} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">{p.month}</text>))}
            <text x={P.l - 8} y={P.t + 4} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">{max}</text>
            <text x={P.l - 8} y={H - P.b} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">0</text>
          </g>

          <g clipPath="url(#anReveal)">
            <path d={area} fill="url(#anTeal)" className="an-area-fill" />
            {hasFlagged && <path d={`${flaggedLine} L ${pts[pts.length - 1].x} ${H - P.b} L ${pts[0].x} ${H - P.b} Z`} fill="url(#anRed)" className="an-area-fill" />}
          </g>

          <path ref={pathRef} d={line} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round"
            className="an-line"
            style={len ? { strokeDasharray: reduced ? "none" : `${len} ${len}`, ["--an-len"]: len, ["--an-dur"]: "1300ms", ["--an-delay"]: "900ms" } : { opacity: 0 }} />
          {hasFlagged && <path d={flaggedLine} fill="none" stroke="#ef4444" strokeWidth="2.25" strokeLinecap="round" className="an-line an-line-secondary" />}

          {pts.map((p, i) => (
            <g key={i}>
              {hover === i && <circle className="an-active-glow" cx={p.x} cy={p.y} r="11" fill="#0d9488" />}
              <circle className={`an-dot ${hover === i ? "is-active" : ""}`} cx={p.x} cy={p.y} r={hover === i ? 5 : 3.5}
                fill="#0d9488" stroke="var(--glass-bg)" strokeWidth="1.5"
              style={{ transition: "r 160ms ease-out", ["--an-delay"]: `${900 + 1300 * ((p.x - P.l) / Math.max(1, W - P.l - P.r)) - 120}ms` }} />
              {hasFlagged && <circle className={`an-dot an-dot-secondary ${hover === i ? "is-active" : ""}`} cx={p.x} cy={p.flaggedY} r={hover === i ? 5 : 3.5} fill="#ef4444" stroke="var(--glass-bg)" strokeWidth="1.5" />}
            </g>
          ))}

          {pts.map((p, i) => {
            const half = (pts[1]?.x - pts[0]?.x || W) / 2
            return <rect key={`h${i}`} x={p.x - half} y={0} width={half * 2} height={H} fill="transparent"
              onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }} />
          })}
        </svg>
        {hover != null && pts[hover] && (
          <div className="an-tooltip an-line-tooltip" style={{ left: `${Math.min(86, Math.max(14, (pts[hover].x / W) * 100))}%`, top: `${Math.max(18, (pts[hover].y / H) * 100)}%` }}>
            <span className="an-tooltip-label">{pts[hover].month}</span>
            <span className="an-tooltip-row"><i className="bg-teal-500" />Total Screened: <b>{pts[hover].screenings}</b></span>
            {hasFlagged && <span className="an-tooltip-row"><i className="bg-red-500" />Flagged for Review: <b>{pts[hover].flagged}</b></span>}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Risk Distribution: donut arc sweep ──────────────────── */
function DonutCard({ data, delay = 560 }) {
  const reduced = useReducedMotion()
  const [sweep, setSweep] = useState(false)
  const [hover, setHover] = useState(null)
  useEffect(() => { const t = setTimeout(() => setSweep(true), 600); return () => clearTimeout(t) }, [])
  const R = 58, C = 2 * Math.PI * R
  const total = data.reduce((s, d) => s + d.value, 0)
  let acc = 0
  const segs = data.map((d) => { const frac = total ? d.value / total : 0; const s = { ...d, len: frac * C, offset: acc }; acc += frac * C; return s })

  return (
    <div className="chart-card an-card p-5 flex flex-col min-w-0" style={{ ["--an-delay"]: `${delay}ms` }}>
      <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}>Risk Distribution</h3>
      <div className="relative flex items-center justify-center" style={{ minHeight: 150 }}>
        <svg viewBox="0 0 150 150" style={{ width: 150, height: 150 }} onMouseLeave={() => setHover(null)}>
          <circle cx="75" cy="75" r={R} fill="none" stroke="var(--border)" strokeOpacity="0.6" strokeWidth="16" />
          {segs.map((s, i) => (
            <circle key={i} cx="75" cy="75" r={R} fill="none" stroke={s.color} strokeOpacity="0.88" strokeWidth="16"
              transform="rotate(-90 75 75)"
              strokeDasharray={sweep || reduced ? `${Math.max(0, s.len - 2)} ${C - Math.max(0, s.len - 2)}` : `0 ${C}`}
              strokeDashoffset={-s.offset}
              onMouseEnter={() => setHover(i)}
              style={{ transition: `stroke-dasharray ${reduced ? 0 : 1100}ms cubic-bezier(0.22, 1, 0.36, 1) ${reduced ? 0 : i * 140}ms, transform 180ms ease-out, filter 180ms ease-out`, transformOrigin: "75px 75px", transform: hover === i ? "rotate(-90deg) scale(1.07)" : "rotate(-90deg) scale(1)", filter: hover === i ? `drop-shadow(0 0 7px ${s.color})` : "none", cursor: "pointer" }} />
          ))}
          <text x="75" y="72" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text-primary)">{total}</text>
          <text x="75" y="88" textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">TOTAL</text>
        </svg>
        {hover != null && segs[hover] && (
          <div className="an-tooltip an-donut-tooltip">
            <span className="an-tooltip-label">{segs[hover].name}</span>
            <span className="an-tooltip-value">{segs[hover].value} <small>({total ? Math.round((segs[hover].value / total) * 100) : 0}%)</small></span>
          </div>
        )}
      </div>
      <div className="an-legend flex flex-col gap-2 mt-3">
        {data.map((d, i) => (
          <div key={d.name} className="an-legend-row flex items-center justify-between" style={{ ["--an-delay"]: `${1750 + i * 120}ms` }}>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} /><span className="text-xs" style={{ color: "var(--text-secondary)" }}>{d.name}</span></div>
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Follow-up Completion: bars grow from 0 ──────────────── */
function BarsCard({ data, delay = 620 }) {
  const reduced = useReducedMotion()
  const [grow, setGrow] = useState(false)
  const [hover, setHover] = useState(null)
  useEffect(() => { const t = setTimeout(() => setGrow(true), 650); return () => clearTimeout(t) }, [])
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="chart-card an-card p-5 flex flex-col min-w-0 lg:col-span-3" style={{ ["--an-delay"]: `${delay}ms` }}>
      <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}>Follow-up Completion</h3>
      <div className="flex flex-col gap-3.5 pb-1">
        {data.map((d, i) => (
          <div key={d.label} className="an-bar-row flex items-center gap-3" style={{ ["--an-delay"]: `${700 + i * 120}ms` }}>
            <span className="text-xs w-24 flex-shrink-0" style={{ color: "var(--text-secondary)" }}>{d.label}</span>
            <div className="an-bar-track flex-1" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <div className={`an-bar-fill ${hover === i ? "is-active" : ""}`} style={{ background: d.color, width: grow || reduced ? `${(d.value / max) * 100}%` : "0%", transitionDelay: `${i * 120}ms` }} />
            </div>
            <span className="an-bar-value text-xs font-semibold w-7 text-right" style={{ color: "var(--text-primary)" }}>{d.value}</span>
            {hover === i && <div className="an-tooltip an-bar-tooltip"><span className="an-tooltip-label">{d.label}</span><span className="an-tooltip-value">Value: {d.value}</span></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Analytics() {
  const [data, setData] = useState(null)
  const [followUps, setFollowUps] = useState([])
  const [error, setError] = useState("")
  useEffect(() => { Promise.all([api.get("/analytics"), api.get("/followups")]).then(([a, f]) => { setData(a); setFollowUps(asArr(f)) }).catch((e) => setError(e.message)) }, [])

  const chartData = useMemo(() => { const byMonth = data?.screeningsByMonth || {}; return Object.entries(byMonth).map(([label, screenings]) => ({ month: label.split(" ")[0], _sort: new Date("1 " + label).getTime() || 0, screenings })).sort((a, b) => a._sort - b._sort) }, [data])
  const riskData = useMemo(() => { const dist = data?.resultDistribution || {}; return [{ name: "Low Concern", value: dist.LOW_CONCERN ?? 0, color: "#0d9488" }, { name: "Review Recommended", value: dist.REVIEW_RECOMMENDED ?? 0, color: "#ef4444" }] }, [data])
  const followupData = useMemo(() => { const count = (s) => followUps.filter((f) => f.status === s).length; return [{ label: "Completed", value: count("COMPLETED"), color: "#0d9488" }, { label: "Upcoming", value: count("PENDING"), color: "#3b82f6" }, { label: "Overdue", value: count("OVERDUE"), color: "#ef4444" }] }, [followUps])

  if (error) return <div className="an-page p-6"><ErrorState title="Unable to load analytics" onRetry={() => window.location.reload()} /></div>
  if (!data) return <div className="an-page p-6"><Skeleton lines={6} /></div>
  const flaggedTotal = riskData[1].value

  return (
    <div className="screen-content an-page flex flex-col gap-5 h-full">
      {/* ambient background — barely noticeable drift */}
      <div className="an-ambient" aria-hidden="true">
        <div className="an-orb an-orb-1" /><div className="an-orb an-orb-2" /><div className="an-orb an-orb-3" />
        <div className="an-particles">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="an-particle" style={{ left: `${8 + i * 11}%`, animationDelay: `${i * 2.3}s`, animationDuration: `${18 + (i % 3) * 6}s` }} />
          ))}
        </div>
      </div>

      <div className="an-heading" style={{ ["--an-delay"]: "100ms" }}>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Manrope, sans-serif", color: "var(--text-primary)" }}>Analytics</h1>
      </div>
      <div className="an-subtitle" style={{ ["--an-delay"]: "150ms" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Screening trends and programme insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 an-kpis">
        {[
          { icon: <Icons.ClipboardCheck />, v: data.totalScreenings ?? 0, l: "Total Screenings", a: "#0d9488" },
          { icon: <Icons.AlertCircle />, v: flaggedTotal, l: "Flagged Screenings", a: "#ef4444" },
          { icon: <Icons.CheckCircle />, v: riskData[0].value, l: "Low Concern", a: "#10b981" },
          { icon: <Icons.Clock />, v: data.pendingFollowUps ?? 0, l: "Pending Follow-ups", a: "#f59e0b" },
        ].map((k, i) => (
          <div key={k.l} className="an-kpi" style={{ ["--an-delay"]: `${200 + i * 60}ms` }}>
            <StatCard icon={k.icon} value={<CountUp value={k.v} delay={550 + i * 60} />} label={k.l} accent={k.a} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LineChartCard data={chartData} delay={500} />
        <DonutCard data={riskData} delay={560} />
        <BarsCard data={followupData} delay={620} />
      </div>
    </div>
  )
}