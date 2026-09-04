const TONES = {
  neutral: 'bg-surface-2/70 text-muted border border-default',
  low: 'bg-success/15 text-success border border-success/40',
  review: 'bg-warning/15 text-warning border border-warning/40',
  high: 'bg-danger/15 text-danger border border-danger/40',
  medium: 'bg-warning/15 text-warning border border-warning/40',
  pending: 'bg-warning/15 text-warning border border-warning/40',
  overdue: 'bg-danger/15 text-danger border border-danger/40',
  completed: 'bg-success/15 text-success border border-success/40',
  scheduled: 'bg-surface-2/60 text-muted border border-default',
}

// StatusBadge — exact Animation project visual treatment:
// maps human-readable status strings onto the theme badge tokens
// (--badge-low / --badge-review / --badge-pending etc.)
const STATUS_TONES = {
  'low concern': 'low',
  'review recommended': 'review',
  'not screened': 'neutral',
  pending: 'pending',
  overdue: 'overdue',
  completed: 'completed',
}

export function StatusBadge({ status }) {
  const tone = STATUS_TONES[String(status || '').toLowerCase()] || 'neutral'
  const STYLE = {
    low: { background: 'var(--badge-low)', color: 'var(--badge-low-text)' },
    review: { background: 'var(--badge-review)', color: 'var(--badge-review-text)' },
    pending: { background: 'var(--badge-pending)', color: 'var(--badge-pending-text)' },
    overdue: { background: 'var(--badge-review)', color: 'var(--badge-review-text)' },
    completed: { background: 'var(--badge-low)', color: 'var(--badge-low-text)' },
    neutral: { background: 'var(--muted)', color: 'var(--text-secondary)' },
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={STYLE[tone]}
    >
      {status}
    </span>
  )
}

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + (TONES[tone] || TONES.neutral)}>
      {children}
    </span>
  )
}
