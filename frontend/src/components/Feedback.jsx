// Shared, accessible feedback primitives: empty states, error states,
// loading skeletons and a lightweight tooltip/hint.
// All styling uses the existing BODHIX theme tokens (light + dark safe).

const T = {
  bg: 'var(--color-surface)',
  bg2: 'var(--color-surface-2)',
  border: 'var(--color-border)',
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  muted: 'var(--color-text-muted)',
}

export function EmptyState({ title, description, actionLabel, onAction, icon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center" style={{ borderColor: T.border, background: T.bg }}>
      {icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: T.bg2, color: T.muted }}>{icon}</span>
      )}
      <h3 className="text-base font-semibold" style={{ color: T.primary, fontFamily: 'Manrope, sans-serif' }}>{title}</h3>
      {description && <p className="max-w-md text-sm" style={{ color: T.secondary }}>{description}</p>}
      {actionLabel && onAction && (
        <button type="button" className="btn-primary mt-1 rounded-xl px-4 py-2.5 text-sm font-semibold" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  )
}

// Polished inline error message (keeps stack traces out of the UI). Developers
// can log details via console.error at the call site.
export function ErrorState({ title = 'Unable to load data', onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border px-6 py-10 text-center"
      style={{ borderColor: T.border, background: T.bg }}
      role="alert"
    >
      <span className="text-danger flex h-11 w-11 items-center justify-center rounded-full" style={{ background: 'rgba(190,44,61,.12)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
      </span>
      <div>
        <p className="text-sm font-semibold" style={{ color: T.primary }}>{title}</p>
        <p className="mt-1 text-sm" style={{ color: T.secondary }}>Please try again.</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold">Try again</button>
      )}
    </div>
  )
}

// Lightweight shimmer skeleton block. Mirrors the shape of a typical card.
export function Skeleton({ lines = 4, rows = 1 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.bg }}>
          <div className="skeleton-block mb-4 h-4 w-1/3 rounded" />
          {Array.from({ length: lines }, (_, i) => (
            <div key={i} className="skeleton-block mb-2 h-3 rounded" style={{ width: `${Math.max(40, 100 - i * 14)}%` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// Small accessible tooltip/hint: a button with aria-describedby pointing at a
// visually-hidden description that appears on hover/focus via CSS.
export function Hint({ label = 'What is this?', children }) {
  const id = 'hint-' + Math.random().toString(36).slice(2, 8)
  return (
    <span className="hint-wrap inline-flex items-center" style={{ position: 'relative' }}>
      <button
        type="button"
        className="hint-trigger inline-flex items-center gap-1 text-xs font-semibold"
        style={{ color: T.secondary, cursor: 'help' }}
        aria-describedby={id}
        title={label}
      >
        {label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" /></svg>
      </button>
      <span role="tooltip" id={id} className="hint-popover" style={{ display: 'none' }}>{children}</span>
    </span>
  )
}