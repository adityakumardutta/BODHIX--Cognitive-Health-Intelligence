// StatCard — exact Animation project visual treatment
export default function StatCard({ icon, value, label, accent = '#0d9488' }) {
  return (
    <div
      className="stat-card rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-2xl font-bold"
            style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}
          >
            {value ?? '—'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accent + '18', color: accent }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}