export default function ProgressBar({ value, max, label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div>
      {label && <div className="flex justify-between text-xs text-muted mb-1"><span>{label}</span><span>{pct}%</span></div>}
      <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
