import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck, BadgeCheck, ArrowRight, Layers, Clock, Stethoscope,
  BookOpen, Brain, ClipboardList, UserRound, Settings as SettingsIcon,
  BarChart2, Info, ExternalLink, TriangleAlert,
} from 'lucide-react'
import brainImg from '../assets/brain.png'
import Disclaimer from '../components/Disclaimer.jsx'

const ASSESSMENTS = [
  {
    code: 'AD8',
    name: 'Ascertain Dementia 8',
    body: 'Informant-based cognitive screening',
    purpose: 'Eight-item informant/self interview that detects possible dementia-related changes in memory, orientation and everyday function.',
    source: 'Galvin JE et al., Neurology 2005.',
  },
  {
    code: 'RUDAS',
    name: 'Rowland Universal Dementia Assessment Scale',
    body: 'Structured cognitive assessment',
    purpose: 'Six-item cognitive assessment scored out of 30, designed to be relatively independent of language and culture.',
    source: 'Storey JE et al., Int Psychogeriatr 2004.',
  },
  {
    code: 'PFAQ',
    name: 'Pfeffer Functional Activities Questionnaire',
    body: 'Functional activity assessment',
    purpose: 'Measures an older adult’s everyday functional activities such as preparing meals, handling money and using the telephone.',
    source: 'Pfeffer RI et al., J Gerontol 1982.',
  },
]

const STATS = [
  { icon: Layers, title: '3', label: 'Assessments', note: 'AD8 • RUDAS • PFAQ', tint: 'var(--color-accent-2)' },
  { icon: Clock, title: '20–30 min', label: 'Estimated time', note: 'Depends on the person', tint: 'var(--color-accent)' },
  { icon: Stethoscope, title: 'Professional', label: 'Review Required', note: 'Results need clinical interpretation', tint: 'var(--color-accent-2)' },
]

const STEPS = [
  { n: 1, icon: UserRound, title: 'Patient Responses', note: 'Recorded answers' },
  { n: 2, icon: ClipboardList, title: 'Established Assessment', note: 'AD8, RUDAS, PFAQ' },
  { n: 3, icon: SettingsIcon, title: 'Predefined Scoring', note: 'Standard rules applied' },
  { n: 4, icon: BarChart2, title: 'Result', note: 'Screening outcome' },
  { n: 5, icon: Stethoscope, title: 'Professional Review', note: 'Qualified clinician interprets' },
]

export default function ScreeningIntro() {
  const { personId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* HERO */}
      <section className="glass-pop relative overflow-hidden rounded-3xl p-6 sm:p-9" aria-label="Screening preparation">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-accent-2)' }}
            >
              <ShieldCheck size={14} /> Screening Preparation
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Prepare for{' '}
              <span
                style={{
                  background: 'linear-gradient(100deg, var(--color-accent-2), var(--color-accent))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Screening
              </span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              A structured cognitive and functional screening using established assessment instruments.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {STATS.map((s) => (
                <div key={s.label} className="glass-pop rounded-2xl p-4">
                  <span
                    className="mb-3 inline-flex size-9 items-center justify-center rounded-xl"
                    style={{ background: 'var(--color-surface-2)', color: s.tint }}
                  >
                    <s.icon size={18} />
                  </span>
                  <p className="text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', opacity: 0.75 }}>{s.label}</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{s.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(`/screening/${personId}/run`)}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 active:translate-y-0 active:scale-[0.98]"
                style={{ background: 'linear-gradient(100deg, var(--color-accent-2), var(--color-accent))' }}
              >
                <Brain size={18} /> Begin Screening <ArrowRight size={16} />
              </button>
              <Link
                to="/clinical-evidence"
                className="glass-btn-secondary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2"
              >
                <BookOpen size={18} /> View Clinical Evidence
              </Link>
            </div>
          </div>

          <div
            className="relative hidden items-center justify-center rounded-2xl p-4 lg:flex"
            style={{ background: 'linear-gradient(135deg, var(--color-surface-2), transparent)' }}
          >
            <img
              src={brainImg}
              alt="Illustration of a human brain representing cognitive screening"
              width={1024}
              height={1024}
              className="w-56 max-w-full sm:w-64"
              style={{ filter: 'drop-shadow(0 18px 40px rgba(90, 80, 220, 0.25))' }}
            />
            <div className="absolute bottom-4 left-4">
              <p className="text-lg font-bold leading-tight" style={{ color: 'var(--color-accent-2)' }}>
                Better<br />Screening<br />Brighter<br />Tomorrows
              </p>
              <p className="pt-3 text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Evidence · People · Better Care
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="glass-pop flex flex-wrap items-center gap-4 rounded-2xl p-5" aria-label="Evidence-based screening">
        <ShieldCheck size={36} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
        <div className="min-w-56 flex-1">
          <p className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
            Evidence-based screening — not random AI-generated questions
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            BODHIX uses established assessment instruments with predefined scoring rules. Assessment
            questions are not randomly generated by AI.
          </p>
        </div>
        <Link
          to="/clinical-evidence"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}
        >
          <Info size={16} /> Learn More
        </Link>
      </section>

      {/* ASSESSMENT INSTRUMENTS */}
      <section aria-label="Assessment instruments">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Assessment Instruments</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Three established, evidence-based instruments used in this screening.
            </p>
          </div>
          <Link to="/clinical-evidence" className="group inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--color-accent-2)' }}>
            View all clinical evidence
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ASSESSMENTS.map((a) => (
            <article key={a.code} className="glass-pop rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <span
                  className="inline-flex size-11 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-accent-2)' }}
                >
                  <ClipboardList size={20} />
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-accent)' }}
                >
                  <BadgeCheck size={12} /> Evidence-Based
                </span>
              </div>
              <p className="mt-4 text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{a.code}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', opacity: 0.75 }}>{a.name}</p>
              <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{a.body}</p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a.purpose}</p>
              <p className="mt-2 text-[11px]" style={{ color: 'var(--text-secondary)', opacity: 0.85 }}>Evidence source: {a.source}</p>
              <Link
                to="/clinical-evidence"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent-2)' }}
              >
                <ExternalLink size={14} /> View Source
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section aria-label="How it works">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>How It Works</h2>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>A simple and transparent process</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s) => (
            <div key={s.n} className="glass-pop rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex size-7 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(100deg, var(--color-accent-2), var(--color-accent))' }}
                >
                  {s.n}
                </span>
                <s.icon size={18} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <p className="mt-3 text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DISCLAIMER — slim professional bar */}
      <section
        className="glass-pop flex items-center gap-3 rounded-2xl p-4"
        style={{ borderColor: 'rgba(217, 119, 6, 0.35)', background: 'rgba(217, 119, 6, 0.07)' }}
        aria-label="Disclaimer"
      >
        <TriangleAlert size={20} className="shrink-0" style={{ color: '#d97706' }} />
        <Disclaimer compact />
      </section>
    </div>
  )
}
