import { useNavigate } from 'react-router-dom'

// ---------------------------------------------------------------------------
// Static, verified clinical source information for BODHIX's screening
// instruments. These are the originator publications for the three
// established instruments. We do NOT invent validation statistics or
// clinical claims.
// ---------------------------------------------------------------------------
const INSTRUMENTS = [
  {
    code: 'AD8',
    name: 'AD8 — Ascertain Dementia 8',
    badge: 'Evidence-based screening instrument',
    source: 'Galvin JE, Roe CM, Powlishta KK, et al. "The AD8: a brief informant interview to detect dementia." Neurology. 2005;65(4):559–564.',
    reference: 'PubMed PMID: 16116116 · doi:10.1212/01.wnl.0000172958.95282.2a',
    link: 'https://pubmed.ncbi.nlm.nih.gov/16116116/',
    domain: 'Cognitive screening',
    plain: 'The AD8 is a short eight-item informant/self report used to detect changes in memory, orientation and everyday function that may signal possible dementia. Eight questions probe whether a person has shown new difficulties in recent years in areas such as remembering appointments, handling money, and learning new things.',
  },
  {
    code: 'RUDAS',
    name: 'RUDAS — Rowland Universal Dementia Assessment Scale',
    badge: 'Evidence-based cognitive screening instrument',
    source: 'Storey JE, Rowland JT, Conforti DA, Dickson HG. "The Rowland Universal Dementia Assessment Scale (RUDAS): a multicultural cognitive assessment scale." Int Psychogeriatr. 2004;16(1):13–31.',
    reference: 'PubMed PMID: 15190995 · doi:10.1017/S1041610204000043',
    link: 'https://pubmed.ncbi.nlm.nih.gov/15190995/',
    domain: 'Cognitive assessment',
    plain: 'RUDAS is a six-item cognitive assessment designed to be relatively independent of language and culture. It covers memory, visuo-spatial orientation, praxis, visuo-constructional ability, judgment and language, and is scored out of 30.',
  },
  {
    code: 'PFAQ',
    name: 'PFAQ — Pfeffer Functional Activities Questionnaire',
    badge: 'Evidence-based functional assessment',
    source: 'Pfeffer RI, Kurosaki TT, Harrah CH Jr, Chance JM, Filos S. "Measurement of functional activities in older adults in the community." J Gerontol. 1982;37(3):323–329.',
    reference: 'PubMed PMID: 7069159 · doi:10.1093/geronj/37.3.323',
    link: 'https://pubmed.ncbi.nlm.nih.gov/7069159/',
    domain: 'Functional assessment',
    plain: 'The PFAQ measures everyday functional abilities of an older adult by asking about the ability to perform routine activities such as preparing a meal, handling money, and using the telephone, as reported by the person or a reliable informant.',
  },
]

// AI usage transparency — reflects the ACTUAL implementation. Assessment
// content, scoring and result calculation are deterministic and do NOT use AI.
// The only AI usage is the optional assistant chat helper on the screening
// pages that answers general questions about how to use the application.
const AI_FOUR = [
  { title: 'Assessment Content', value: 'Established instruments', detail: 'The AD8, RUDAS and PFAQ questions are configured, predefined items. They are never generated or rewritten by AI.' },
  { title: 'Scoring', value: 'Predefined scoring rules', detail: 'Each response maps to a predefined score via options_json. Section totals and thresholds use the configured review cutoffs in the database.' },
  { title: 'Result', value: 'Calculated from recorded responses', detail: 'The result, flags and overall status are computed from the recorded answers using the predefined rules. No AI decides a result.' },
  { title: 'AI', value: 'One helper only', detail: 'A generative-AI helper answers general questions about how to use the app and the screening process. It does not evaluate responses, score, or diagnose.' },
]

const ARROW = 'M7 17L17 7M7 7h10v10'
function EvidenceCard({ ins }) {
  return (
    <article className="rounded-2xl border p-6 md:p-7" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)' }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold" style={{ background: 'var(--color-surface-2)', color: 'var(--color-accent)' }}>{ins.code}</span>
          <div>
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>{ins.name}</h2>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold" style={{ borderColor: 'var(--color-border)', color: 'var(--text-secondary)', background: 'var(--color-surface-2)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              {ins.badge}
            </span>
          </div>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>{ins.domain}</span>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>What it is</h3>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{ins.plain}</p>
        </div>
        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>Source &amp; original publication</h3>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ins.source}</p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>{ins.reference}</p>
          <a href={ins.link} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:opacity-70" style={{ color: 'var(--color-accent)' }}>
            View source
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={ARROW} /></svg>
          </a>
        </div>
      </div>
    </article>
  )
}

export default function ClinicalEvidence() {
  const navigate = useNavigate()
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--color-surface-2)', color: 'var(--text-secondary)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" /><path d="M20 17v5" /></svg>
          Instrument provenance &amp; transparency
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>Clinical Evidence &amp; Validation</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Understand where BODHIX’s screening instruments come from and how results are calculated.
        </p>
      </header>

      <section className="space-y-5" aria-label="Screening instruments">
        {INSTRUMENTS.map((ins) => <EvidenceCard key={ins.code} ins={ins} />)}
      </section>
<section className="info-panel mt-8 rounded-2xl p-6" role="region" aria-label="Why BODHIX does not randomly generate assessment questions">
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          <h2 className="text-base font-semibold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>Why BODHIX does not randomly generate assessment questions</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          BODHIX uses established assessment instruments rather than randomly generated clinical questions. The assessment content is kept separate from generative AI so that screening responses are evaluated using the predefined instrument and scoring rules.
        </p>
      </section>

      <section className="mt-8" aria-label="AI usage transparency">
        <h2 className="text-xl font-semibold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>AI Usage Transparency</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>A clear picture of where and how AI is used within this application.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AI_FOUR.map((block) => (
            <div key={block.title} className="rounded-2xl border p-5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}>{block.title}</p>
              <p className="mt-2 font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>{block.value}</p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{block.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)' }}>
        <p className="text-base font-semibold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>Built around established screening instruments</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          {['AD8', 'RUDAS', 'PFAQ'].map((c) => (
            <span key={c} className="rounded-full border px-4 py-1.5 text-sm font-semibold" style={{ borderColor: 'var(--color-border)', color: 'var(--text-primary)', background: 'var(--color-surface-2)' }}>{c}</span>
          ))}
        </div>
        <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Transparent scoring • Evidence references • Professional review</p>
      </section>

      <div className="mt-8 flex justify-start">
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">Back</button>
      </div>
    </div>
  )
}