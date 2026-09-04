export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl glass shadow-lg">
        <div className="flex items-center justify-between border-b border-default px-5 py-4">
          <h3 className="font-display font-semibold text-primary">{title}</h3>
          <button onClick={onClose} className="icon-btn btn-sm" aria-label="Close">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="border-t border-default px-5 py-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
