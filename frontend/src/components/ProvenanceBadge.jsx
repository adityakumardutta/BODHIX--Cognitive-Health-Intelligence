import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Question provenance badge shown on AD8 / RUDAS / PFAQ screening items.
// It clarifies the origin of the assessment WITHOUT altering the clinical
// question wording and WITHOUT implying BODHIX validated individual items.
const INSTRUMENT_INFO = {
  AD8: {
    name: 'AD8 — Ascertain Dementia 8',
    purpose: 'A short, evidence-based eight-item informant/self interview that screens for possible dementia by asking whether a person has noticed memory-, orientation- or everyday-function changes over recent years.',
    source: 'Galvin JE, et al. Neurology. 2005;65(4):559–564.',
  },
  RUDAS: {
    name: 'RUDAS — Rowland Universal Dementia Assessment Scale',
    purpose: 'A six-item cognitive assessment covering memory, visuo-spatial orientation, praxis, visuo-constructional ability, judgment and language, scored out of 30.',
    source: 'Storey JE, et al. Int Psychogeriatr. 2004;16(1):13–31.',
  },
  PFAQ: {
    name: 'PFAQ — Pfeffer Functional Activities Questionnaire',
    purpose: 'A functional assessment that measures an older adult’s ability to perform routine everyday activities such as preparing a meal, handling money and using the telephone.',
    source: 'Pfeffer RI, et al. J Gerontol. 1982;37(3):323–329.',
  },
}

function AboutModal({ instrument, onClose }) {
  const info = INSTRUMENT_INFO[instrument] || INSTRUMENT_INFO.AD8
  const closeRef = useRef(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="provenance-title"
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        className="floating-modal relative w-full max-w-md rounded-2xl border p-5 sm:p-6"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-md)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 id="provenance-title" className="text-base font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
            About this assessment
          </h3>
          <button type="button" ref={closeRef} aria-label="Close" onClick={onClose} className="icon-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>{info.name}</p>
        <div className="mt-4 space-y-3 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          <p><span className="font-semibold">Purpose / domain: </span>{info.purpose}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><span className="font-semibold">Source: </span>{info.source}</p>
          <p className="rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--text-secondary)' }}>
            This is an established assessment instrument. Responses are evaluated using the predefined instrument scoring rules. Questions are not randomly generated, and individual items were not independently validated by BODHIX.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function ProvenanceBadge({ instrument, sectionName }) {
  const [open, setOpen] = useState(false)
  const info = INSTRUMENT_INFO[instrument] || INSTRUMENT_INFO.AD8
  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)', background: 'var(--color-surface-2)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          Evidence-Based Instrument
        </span>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs font-semibold transition-all hover:opacity-70" style={{ color: 'var(--color-accent)', cursor: 'pointer' }} aria-haspopup="dialog">
          Why this question?
        </button>
      </div>
      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        Instrument: {instrument} · Question Source: Established assessment instrument
      </p>
      {sectionName && <p className="mb-2" aria-hidden="true" />}
      {open && <AboutModal instrument={instrument} onClose={() => setOpen(false)} />}
    </>
  )
}