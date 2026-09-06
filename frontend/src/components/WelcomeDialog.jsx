import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowRight, ClipboardCheck, FileText, Users, BarChart3, CheckCircle, Stethoscope } from 'lucide-react'

/**
 * Compact Welcome Dialog for new BODHIX users with no screening history.
 * Shows once per user (persisted in localStorage) with option to dismiss.
 */
export default function WelcomeDialog({ isOpen, onClose, onStartScreening, onExplore }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(10, 25, 50, 0.28)', backdropFilter: 'blur(2px)' }}
      onClick={handleClose}
    >
      <div
        className={`relative w-full rounded-3xl border border-blue-100 bg-white shadow-xl transition-all duration-200 ${
          visible ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0'
        }`}
        style={{ maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
              <ClipboardCheck size={20} className="text-teal-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Welcome to BODHIX</h2>
              <p className="text-xs text-slate-500">Evidence-based cognitive screening support for healthcare professionals.</p>
            </div>
          </div>
        </div>

        {/* Trust Message Card */}
        <div className="mx-6 mb-4 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs leading-relaxed text-slate-600">
            BODHIX uses established assessment instruments such as <span className="font-semibold text-slate-700">AD8</span>, <span className="font-semibold text-slate-700">RUDAS</span> and <span className="font-semibold text-slate-700">PFAQ</span>.
            Questions are sourced from established instruments and results use predefined scoring rules.
          </p>
        </div>

        {/* How It Works - Compact Horizontal Flow */}
        <div className="mx-6 mb-5">
          <div className="flex items-center justify-between gap-1 rounded-xl border border-slate-100 bg-white px-3 py-3">
            {[
              { icon: <FileText size={13} />, label: 'Assessment' },
              { icon: <Users size={13} />, label: 'Responses' },
              { icon: <BarChart3 size={13} />, label: 'Scoring' },
              { icon: <CheckCircle size={13} />, label: 'Result' },
              { icon: <Stethoscope size={13} />, label: 'Review' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    {step.icon}
                  </div>
                  <span className="text-[9px] font-medium text-slate-500">{step.label}</span>
                </div>
                {i < 4 && (
                  <ArrowRight size={10} className="mb-3 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ready Message */}
        <div className="mx-6 mb-5 text-center">
          <h3 className="text-sm font-semibold text-slate-700">Ready for your first screening?</h3>
          <p className="mt-1 text-xs text-slate-500">Register a person and begin a structured screening in a few simple steps.</p>
        </div>

        {/* Action Buttons */}
        <div className="mx-6 mb-5 flex flex-col gap-2">
          <button
            onClick={() => { handleClose(); onStartScreening?.() }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-teal-700 hover:to-blue-700"
          >
            Start Your First Screening
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => { handleClose(); onExplore?.() }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Explore Clinical Evidence
          </button>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-slate-100 px-6 py-3">
          <p className="text-center text-[10px] leading-relaxed text-slate-400">
            Screening support only — not a diagnostic tool. Results require professional review.
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
