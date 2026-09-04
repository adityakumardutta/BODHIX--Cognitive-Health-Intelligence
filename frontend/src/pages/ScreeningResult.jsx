import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, CheckCircle2, ClipboardList, Download, Eye, Hash, Lightbulb, ShieldAlert, User, UserRound } from 'lucide-react'
import { api } from '../services/api.js'
import Button from '../components/Button.jsx'
import Badge from '../components/Badge.jsx'
import { useAuth } from '../services/authContext.jsx'
import { useTheme } from '../services/ThemeContext.jsx'
import AnimatedBackground from '../components/AnimatedBackground.jsx'

// Per-instrument presentation config. All scores come from the real backend
// result; these maps only drive colours, titles and interpretation wording
// that reflects the backend's flag state (single source of truth).
const INSTRUMENTS = {
  AD8: {
    title: 'AD8 – Informant Interview', accent: 'purple', max: 8,
    badge: (f) => (f ? 'Threshold Reached' : 'Below Threshold'),
    text: (f) => (f ? 'Concern identified — review recommended' : 'Low concern'),
  },
  RUDAS: {
    title: 'RUDAS – Cognitive Assessment', accent: 'blue', max: 30,
    badge: (f) => (f ? 'Below Normal Range' : 'Within Normal Range'),
    text: (f) => (f ? 'Possible impairment — further assessment' : 'Normal'),
  },
  PFAQ: {
    title: 'PFAQ – Functional Assessment', accent: 'orange', max: 30,
    badge: (f) => (f ? 'Assistance Needed' : 'Independent'),
    text: (f) => (f ? 'Functional limitation — support recommended' : 'Independent functioning'),
  },
}

const ACCENTS = {
  purple: { bg: 'linear-gradient(135deg, rgba(139,92,246,.10), rgba(168,85,247,.05))', border: '#c4b5fd', text: '#7c3aed', dot: '#8b5cf6' },
  blue: { bg: 'linear-gradient(135deg, rgba(59,130,246,.10), rgba(37,99,235,.05))', border: '#bfdbfe', text: '#2563eb', dot: '#3b82f6' },
  orange: { bg: 'linear-gradient(135deg, rgba(251,146,60,.10), rgba(249,115,22,.05))', border: '#fde68a', text: '#ea580c', dot: '#f97316' },
}

// Dark-mode accent variants: same hues, brighter text/borders for readability
const ACCENTS_DARK = {
  purple: { bg: 'linear-gradient(135deg, rgba(139,92,246,.16), rgba(168,85,247,.07))', border: 'rgba(196,181,253,.45)', text: '#c4b5fd', dot: '#a78bfa' },
  blue: { bg: 'linear-gradient(135deg, rgba(59,130,246,.16), rgba(37,99,235,.07))', border: 'rgba(191,219,254,.45)', text: '#93c5fd', dot: '#60a5fa' },
  orange: { bg: 'linear-gradient(135deg, rgba(251,146,60,.16), rgba(249,115,22,.07))', border: 'rgba(253,230,138,.45)', text: '#fdba74', dot: '#fb923c' },
}

function getAccents(isDark) {
  return isDark ? ACCENTS_DARK : ACCENTS
}

function Icon({ name = 'shield', size = 20, color = 'currentColor' }) {
  const p = {
    shield: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z',
    persons: 'M12 7a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM5 20a7 7 0 0 1 14 0',
    calendar: 'M3 5h18v16H3zM8 3v4M16 3v4M3 10h18',
    hash: 'M4 9h16M4 15h16M10 3L8 21M16 3l-2 18',
    user: 'M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    files: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
    download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z',
    bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 1 3 11.2c-.6.4-1 1-1 1.8h-4c0-.8-.4-1.4-1-1.8A6 6 0 0 1 12 3z',
    check: 'M4 12l5 5L20 6',
    x: 'M6 6l12 12M18 6L6 18',
    clipboard: 'M5 4h14v17H5zM9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 10h6M9 14h6',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={p[name] || p.shield} />
    </svg>
  )
}

function fmtDate(dt) {
  if (!dt) return '—'
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return String(dt)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtTime(dt) {
  if (!dt) return '—'
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function label(value) {
  return value ? String(value).replaceAll('_', ' ').toLowerCase() : ''
}

function InfoCell({ icon, labelText, value, sub }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-lg grid place-items-center flex-shrink-0" style={{ background: 'rgba(37,99,235,.10)', color: '#2563eb' }}>
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">{labelText}</p>
        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate" title={value}>{value || '—'}</p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

function RiskGauge({ isLow }) {
  const col = isLow ? '#0d9049' : '#be2c3b'
  const ring = isLow ? 'rgba(13,144,73,.15)' : 'rgba(190,44,61,.15)'
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 rounded-full grid place-items-center" style={{ background: ring }}>
        <span className="w-20 h-20 rounded-full grid place-items-center" style={{ background: 'var(--surface)', border: `2px solid ${col}` }}>
          <Icon name="shield" size={28} color={col} />
        </span>
      </div>
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Risk Level</p>
        <p className="text-sm font-bold" style={{ color: col }}>{isLow ? 'LOW' : 'ELEVATED'}</p>
      </div>
    </div>
  )
}

export default function ScreeningResult() {
  const { personId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const accents = getAccents(isDark)
  const result = location.state?.result

  const [person, setPerson] = useState(null)
  const [creatingFollowUp, setCreatingFollowUp] = useState(false)
  const [followUpCreated, setFollowUpCreated] = useState(false)
  const [error, setError] = useState('')
  const [showScoreCard, setShowScoreCard] = useState(false)
  const [emailState, setEmailState] = useState('idle') // idle | sending | success | error

  useEffect(() => {
    if (!personId) return
    api.get(`/persons/${personId}`).then(setPerson).catch(() => setPerson(null))
  }, [personId])

  if (!result) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <p className="text-muted">No result to display. This can happen after a page refresh.</p>
        <Button className="mt-4" onClick={() => navigate(`/persons/${personId}`)}>Go to person profile</Button>
      </div>
    )
  }

  const sections = result.sections || []
  const sec = {}
  sections.forEach((s) => { sec[s.sectionCode] = s })
  const isLow = result.overallStatus === 'LOW_CONCERN'

  const findings = [
    { ok: !sec.AD8?.flaggedForReview, okText: 'AD8 score below threshold', badText: 'AD8 score at/above threshold' },
    { ok: !sec.RUDAS?.flaggedForReview, okText: 'RUDAS score within normal range', badText: 'RUDAS score below normal range' },
    { ok: !sec.PFAQ?.flaggedForReview, okText: 'Independent functional status (PFAQ)', badText: 'PFAQ indicates functional concern' },
  ]

  const nextSteps = isLow
    ? ['Continue regular cognitive monitoring', 'Encourage a healthy lifestyle', 'Monitor changes over time', 'Seek assessment if concerns persist']
    : ['Share results with supervising clinician', 'Schedule follow-up assessment', 'Monitor cognitive changes over time', 'Provide caregiver support and education', 'Consider referral to specialist if needed']

  async function handleCreateFollowUp() {
    setCreatingFollowUp(true)
    setError('')
    try {
      await api.post('/followups', {
        personId: Number(personId),
        screeningId: result.screeningId,
        reason: result.overallStatus === 'REVIEW_RECOMMENDED'
          ? 'Recent screening requires professional review'
          : 'Routine follow-up',
      })
      setFollowUpCreated(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setCreatingFollowUp(false)
    }
  }

  // Isolated report/PDF function. No PDF generator exists in this project yet,
  // so it opens the real-data score card and triggers the browser print dialog.
  function downloadReport() {
    setShowScoreCard(true)
    setTimeout(() => { try { window.print() } catch (_) {} }, 250)
  }

  // Email Report: the REAL backend generates the report PDF from the stored
  // screening data and emails it to the current specialist's registered email.
  async function handleEmailReport() {
    if (emailState === 'sending') return
    setEmailState('sending')
    try {
      await api.post(`/screenings/${result.screeningId}/email-report`)
      setEmailState('success')
    } catch (e) {
      setEmailState('error')
    } finally {
      setTimeout(() => setEmailState((s) => (s === 'success' || s === 'error' ? 'idle' : s)), 4000)
    }
  }

  const screeningDate = result.completedAt || person?.lastScreeningDate

  return (
    <div className="result-page relative min-h-screen text-foreground">
      <AnimatedBackground />
      <main className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <header className="result-card result-hover flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between" style={{ background: 'var(--gradient-header)' }}>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-primary shadow-[var(--shadow-soft)]"><ClipboardList className="h-6 w-6" /></span>
              <div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Screening Result</h1><p className="text-sm text-muted-foreground">Comprehensive cognitive screening completed</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="result-btn-sheen inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-[var(--shadow-soft)]" onClick={() => setShowScoreCard(true)}><Eye className="h-4 w-4" /> View Score Card</button>
              <button className="result-btn-sheen inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary/90" onClick={downloadReport}><Download className="h-4 w-4" /> Download Report</button>
              <button
                className="result-btn-sheen inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-[var(--shadow-soft)] disabled:opacity-60"
                onClick={handleEmailReport}
                disabled={emailState === 'sending'}
                title="Emails this report to your registered email address"
              >
                {emailState === 'sending' ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
                )}
                {emailState === 'sending' ? 'Sending...' : 'Email Report'}
              </button>
            </div>
          </header>

          <section className="result-card result-hover grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: User, label: 'Person', value: person?.fullName || `Person #${personId}`, sub: person ? `${label(person.gender)}${person.age ? ` • ${person.age} years` : ''}` : '' },
              { icon: CalendarDays, label: 'Screening date', value: fmtDate(screeningDate), sub: fmtTime(screeningDate) },
              { icon: Hash, label: 'Screening ID', value: result.screeningId ? `#${result.screeningId}` : '—', sub: 'Recorded' },
              { icon: UserRound, label: 'Completed by', value: user?.fullName || 'Current user', sub: label(user?.role) },
            ].map((m) => <div key={m.label} className="result-list-row flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary"><m.icon className="h-5 w-5" /></span><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{m.label}</p><p className="truncate text-sm font-bold">{m.value}</p><p className="truncate text-xs text-muted-foreground">{m.sub}</p></div></div>)}
          </section>

          <section className="result-card result-hover grid grid-cols-1 items-center gap-6 p-7 md:grid-cols-[auto_1fr_auto]" style={{ background: 'var(--gradient-status)' }}>
            <div className="flex items-center gap-5"><span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--rose-soft)', color: 'var(--rose)' }}><ShieldAlert className="h-7 w-7" /><span className="sr-only">Risk status</span></span><div><p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Overall screening status</p><h2 className="mt-1 max-w-[10ch] text-3xl font-extrabold leading-tight" style={{ color: isLow ? 'var(--teal)' : 'var(--rose)' }}>{isLow ? 'Low Concern' : 'Review Recommended'}</h2><Badge tone={isLow ? 'low' : 'review'}>{isLow ? 'Low concern' : 'Review recommended'}</Badge></div></div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{isLow ? 'No major concern was identified by the completed screening instruments. This does not rule out cognitive impairment. Continue routine monitoring and seek professional assessment if concerns persist or worsen.' : 'The completed screening instruments identified one or more areas warranting follow-up. Further professional assessment may be appropriate and is strongly recommended.'}</p>
            <div className="flex flex-col items-center gap-2"><span className="relative flex h-16 w-16 items-center justify-center"><span className="result-ring-pulse absolute inset-0 rounded-full" style={{ background: `color-mix(in oklab, ${isLow ? 'var(--teal)' : 'var(--rose)'} 25%, transparent)` }} /><span className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 bg-card" style={{ borderColor: isLow ? 'var(--teal)' : 'var(--rose)', color: isLow ? 'var(--teal)' : 'var(--rose)' }}><ShieldAlert className="h-7 w-7" /></span></span><p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Risk level</p><p className="text-sm font-extrabold" style={{ color: isLow ? 'var(--teal)' : 'var(--rose)' }}>{isLow ? 'LOW' : 'ELEVATED'}</p></div>
          </section>

          <div className="mt-2 flex items-center justify-between px-1"><h3 className="text-lg font-bold tracking-tight">Assessment Summary</h3><button className="group text-sm font-semibold text-primary" onClick={() => setShowScoreCard(true)}>View detailed breakdown <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span></button></div>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Object.keys(INSTRUMENTS).map((code) => { const cfg = INSTRUMENTS[code]; const item = sec[code]; const accent = ACCENTS[cfg.accent]; const flagged = !!item?.flaggedForReview; return <article key={cfg.title} className="result-metric-card p-5" style={{ background: code === 'AD8' ? 'var(--violet-soft)' : code === 'RUDAS' ? 'var(--sky-soft)' : 'var(--amber-soft)' }}><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: accent.dot, boxShadow: `0 0 0 4px color-mix(in oklab, ${accent.dot} 18%, transparent)` }} /><p className="text-sm font-bold">{cfg.title}</p></div><div className="mt-4 flex items-end justify-between gap-3"><div className="flex items-baseline gap-1.5"><span className="text-3xl font-extrabold"><AnimatedScore value={Number(item?.rawScore ?? 0)} /></span><span className="text-sm font-semibold text-muted-foreground">/ {cfg.max}</span><span className="ml-1 text-xs text-muted-foreground">Score</span></div><Badge tone={flagged ? 'review' : 'low'}>{cfg.badge(flagged)}</Badge></div></article> })}
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <article className="result-card result-hover flex gap-4 p-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--sky-soft)', color: 'var(--sky)' }}><ClipboardList className="h-5 w-5" /></span><div><h4 className="text-sm font-bold">Recommendation &amp; Next Steps</h4><ul className="mt-3 space-y-2">{nextSteps.map((step) => <li key={step} className="result-list-row flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{step}</li>)}</ul>{result.recommendationText && <p className="mt-3 text-sm text-muted-foreground">{result.recommendationText}</p>}</div></article>
            <article className="result-card result-hover flex gap-4 p-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}><Lightbulb className="h-5 w-5" /></span><div><h4 className="text-sm font-bold">Key Findings</h4><ul className="mt-3 space-y-2">{findings.map((f, i) => <li key={i} className="result-list-row flex items-start gap-2 text-sm text-muted-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />{f.ok ? f.okText : f.badText}</li>)}</ul></div></article>
          </section>

          <footer className="result-card result-hover grid grid-cols-1 items-center gap-6 p-6 sm:grid-cols-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-primary-foreground" style={{ background: 'var(--teal)' }}>{(user?.fullName || 'CW').split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</span><div><p className="text-xs text-muted-foreground">Completed by</p><p className="text-sm font-bold">{user?.fullName || 'Current user'}</p><p className="text-xs text-muted-foreground">{label(user?.role)}</p></div></div><div className="sm:border-l sm:pl-6"><p className="text-xs text-muted-foreground">Signature</p><p className="font-script text-3xl leading-tight">{user?.fullName || 'Current user'}</p><p className="text-xs text-muted-foreground">{fmtDate(screeningDate)} • {fmtTime(screeningDate)}</p></div><div className="flex items-center sm:justify-end"><img src="/assets/bodhix-logo-official.png" alt="BODHIX — Cognitive Health Intelligence" style={{ height: 64, width: 'auto', maxWidth: 220, objectFit: 'contain' }} className="drop-shadow-[0_4px_14px_rgba(37,99,235,0.25)]" /></div></footer>
          <div className="rounded-2xl border border-dashed border-slate-400/25 bg-slate-500/5 p-4 text-center"><p className="text-xs text-muted-foreground">Screening support only — not a diagnostic tool. Results require professional review.</p></div>
          {error && <p className="text-sm text-warning">{error}</p>}{followUpCreated && <p className="text-sm text-success">Follow-up created.</p>}
          <div className="flex flex-wrap items-center gap-3"><Button variant="secondary" onClick={() => navigate(`/persons/${personId}`)}>View Details</Button><Button variant="secondary" onClick={() => navigate(`/persons/${personId}`)}>Save &amp; Finish</Button><Button onClick={handleCreateFollowUp} disabled={creatingFollowUp || followUpCreated}>{followUpCreated ? 'Follow-up created' : creatingFollowUp ? 'Creating…' : 'Create Follow-up'}</Button></div>
        </div>
      </main>
      {showScoreCard && <ScoreCardModal result={result} person={person} user={user} screeningDate={screeningDate} isDark={isDark} onClose={() => setShowScoreCard(false)} />}

      {/* Email Report result toast (real backend outcome only) */}
      {emailState === 'success' && (
        <div className="bodhix-toast" role="status">
          <span className="bodhix-toast-icon" style={{ background: 'rgba(16,185,129,.15)', color: '#10b981' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
          </span>
          Report sent successfully
        </div>
      )}
      {emailState === 'error' && (
        <div className="bodhix-toast" role="alert">
          <span className="bodhix-toast-icon" style={{ background: 'rgba(244,63,94,.15)', color: '#f43f5e' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
          </span>
          Unable to send the report. Please try again.
        </div>
      )}
    </div>
  )
}

/* ---------- Score Card (real data from GET /screenings/{id}/scorecard) ---------- */

function AnimatedScore({ value }) {
  const shown = useCountUp(value)
  return <span>{shown}</span>
}

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const n = Number(target) || 0
    if (reduced) { setValue(n); return }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(n * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function ScoreCardModal({ result, person, user, screeningDate, isDark, onClose }) {
  const [card, setCard] = useState(null)
  const [error, setError] = useState('')
  const accents = getAccents(isDark)

  useEffect(() => {
    api.get(`/screenings/${result.screeningId}/scorecard`)
      .then(setCard)
      .catch((e) => setError(e.message))
  }, [result.screeningId])

  // Print scoping: while the report is open, print ONLY the report.
  useEffect(() => {
    document.body.classList.add('bodhix-report-open')
    return () => document.body.classList.remove('bodhix-report-open')
  }, [])

  const sections = card?.sections || []
  const overall = sections.some((s) => s.flaggedForReview) ? 'REVIEW_RECOMMENDED' : 'LOW_CONCERN'

  function download() {
    window.print()
  }

  // Rendered via portal so print CSS can hide the app and show only the report.
  return createPortal(
    <div className="bodhix-print-overlay fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="bodhix-print-area mx-auto my-6 w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
        <div className="bodhix-no-print sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-200 bg-white/95 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-slate-900">Screening Score Card</h2>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={download}>
              <span className="inline-flex items-center gap-2"><Icon name="download" size={15} /> Download</span>
            </Button>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>
        <div className="px-6 py-6">
          {error && <p className="text-sm" style={{ color: '#be2c3b' }}>Could not load score card: {error}</p>}
          {!card && !error && <p className="py-10 text-center text-sm text-slate-500">Loading score card...</p>}
          {card && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 pb-4" style={{ borderColor: '#2563eb' }}>
                <div className="flex items-center gap-3">
                  <img src="/assets/bodhix-logo-official.png" alt="BODHIX — Cognitive Health Intelligence" style={{ height: 56, width: 'auto', maxWidth: 190, objectFit: 'contain' }} />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Screening Score Card</p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Screening ID: <span className="font-semibold text-slate-800">#{card.screeningId}</span></p>
                  <p>{fmtDate(card.completedAt || screeningDate)} · {fmtTime(card.completedAt || screeningDate)}</p>
                  <p>Completed by: <span className="font-semibold text-slate-800">{user?.fullName || '—'}</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-4">
                <ScoreCell labelText="Person" value={person?.fullName || `Person #${card.personId}`} />
                <ScoreCell labelText="Gender" value={person ? (label(person.gender) || '—') : '—'} />
                <ScoreCell labelText="Age" value={person?.age ? `${person.age} years` : '—'} />
                <ScoreCell labelText="Overall" value={overall === 'LOW_CONCERN' ? 'Low Concern' : 'Review Recommended'} />
              </div>
              {sections.map((s) => {
                const cfg = INSTRUMENTS[s.sectionCode] || { title: s.sectionName || s.sectionCode, accent: 'blue', badge: (f) => (f ? 'Flagged' : 'Normal'), text: (f) => (f ? 'Review recommended' : 'No concern') }
                const accent = accents[cfg.accent] || accents.blue
                return (
                  <div key={s.sectionCode} className="result-card result-hover rounded-2xl border p-5" style={{ borderColor: accent.border, background: accent.bg }}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-3 w-3 rounded-full" style={{ background: accent.dot }} />
                        <p className="text-sm font-bold" style={{ color: accent.text }}>{cfg.title}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">Total: {Number(s.rawScore)} <span className="font-normal text-slate-500">/ {Number(s.maxScore)}</span></p>
                    </div>
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                          <th className="py-1.5 pr-3 font-semibold">Item</th>
                          <th className="py-1.5 pr-3 font-semibold">Response</th>
                          <th className="py-1.5 text-right font-semibold">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(s.items || []).map((it, i) => (
                          <tr key={it.questionId ?? i} className="border-b border-slate-100 last:border-0">
                            <td className="py-1.5 pr-3 text-slate-700">{it.prompt}</td>
                            <td className="py-1.5 pr-3 font-medium text-slate-900">{it.response}</td>
                            <td className="py-1.5 text-right font-semibold text-slate-900">{Number(it.score)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="mt-3 text-sm font-medium" style={{ color: accent.text }}>Interpretation: {cfg.badge(s.flaggedForReview)} — {cfg.text(s.flaggedForReview)}</p>
                  </div>
                )
              })}
              <div className="rounded-2xl border p-5" style={{ borderColor: overall === 'LOW_CONCERN' ? 'rgba(13,144,73,.35)' : 'rgba(190,44,61,.35)', background: overall === 'LOW_CONCERN' ? 'rgba(13,144,73,.08)' : 'rgba(190,44,61,.08)' }}>
                <p className="text-xs uppercase tracking-widest text-slate-500">Overall Result &amp; Risk Level</p>
                <p className="text-xl font-bold" style={{ color: overall === 'LOW_CONCERN' ? '#0d9049' : '#be2c3b' }}>{overall === 'LOW_CONCERN' ? 'Low Concern · Risk: LOW' : 'Review Recommended · Risk: ELEVATED'}</p>
                <p className="mt-2 text-sm text-slate-600">{result.recommendationText}</p>
              </div>
              <p className="text-center text-[11px] text-slate-500">Screening support only — not a diagnostic tool. Results require professional review by a qualified healthcare professional.</p>

              {/* Signature / completed-by strip — real specialist from the authenticated session */}
              <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#2563eb,#0ea5e9)' }}>{(user?.fullName || 'CW').split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Completed by</p>
                    <p className="truncate text-sm font-bold text-slate-900">{user?.fullName || '—'}</p>
                    <p className="text-xs text-slate-500">{label(user?.role)}</p>
                  </div>
                </div>
                <div className="sm:border-l sm:border-slate-200 sm:pl-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Signature</p>
                  <p className="font-script text-3xl leading-tight text-slate-900" title="Signature representation">{user?.fullName || '—'}</p>
                  <p className="text-[10px] text-slate-400">Signature representation of the completing specialist</p>
                </div>
                <div className="sm:ml-auto text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Date</p>
                  <p className="text-sm font-bold text-slate-900">{fmtDate(card.completedAt || screeningDate)}</p>
                  <p className="text-xs text-slate-500">{fmtTime(card.completedAt || screeningDate)}</p>
                </div>
                <img src="/assets/bodhix-logo-official.png" alt="BODHIX — Cognitive Health Intelligence" style={{ height: 52, width: 'auto', maxWidth: 180, objectFit: 'contain' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

function ScoreCell({ labelText, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{labelText}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-900" title={value}>{value || '—'}</p>
    </div>
  )
}
