import Badge from './Badge.jsx'
// Interpretation notes use the validated cutoffs configured in the backend
// (assessment_sections.review_cutoff) — the backend is the single source of truth.
const INTERPRETATIONS = {
  AD8: { 0: 'No reported change in the last two years', 1: 'Minimal reported change', 2: '2+ reported changes — further evaluation is warranted' },
  RUDAS: { 0: 'Low concern based on screening responses', 1: 'Score at or below cutoff — professional review is appropriate' },
  PFAQ: { 0: 'Functional activities within normal range', 1: 'Score of 9+ indicates impaired functional status — review recommended' },
}

function interpretation(code, flagged) {
  const map = INTERPRETATIONS[code]
  if (!map) return flagged ? 'Flagged for review' : 'Within range'
  return flagged ? map[1] || map[0] : map[0]
}

export default function ResultCard({ result }) {
  const isLow = result.overallStatus === 'LOW_CONCERN'
  return (
    <div className="glass-pop rounded-2xl p-6 shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Screening completed</p>
          <h2 className={`mt-1 text-2xl font-display font-bold ${isLow ? 'text-success' : 'text-warning'}`}>
            {isLow ? 'Low Concern' : 'Review Recommended'}
          </h2>
        </div>
        <Badge tone={isLow ? 'low' : 'review'}>{isLow ? 'Low concern' : 'Review recommended'}</Badge>
      </div>
      <p className="mt-4 text-sm text-muted">{result.recommendationText}</p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {result.sections.map((s) => (
          <div key={s.sectionCode} className="glass rounded-xl border border-default p-4">
            <p className="text-xs uppercase tracking-wide text-muted">{s.sectionName || s.sectionCode}</p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {s.rawScore} <span className="text-sm font-normal text-muted/70">/ {s.maxScore}</span>
            </p>
            <div className="mt-2"><Badge tone={s.flaggedForReview ? 'review' : 'low'}>{s.flaggedForReview ? 'Flagged for review' : 'Within range'}</Badge></div>
            <p className="mt-2 text-xs text-muted leading-snug">{interpretation(s.sectionCode, s.flaggedForReview)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
