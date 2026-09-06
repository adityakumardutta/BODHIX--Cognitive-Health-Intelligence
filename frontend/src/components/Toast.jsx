import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react'

/**
 * Toast notification component for success/error messages.
 * Appears at top-right of screen with auto-dismiss.
 */
export function Toast({ message, subMessage, type = 'success', duration = 5000, onClose, isVisible }) {
  const [visible, setVisible] = useState(false)
  const onCloseRef = useRef(onClose)
  const timerRef = useRef(null)

  // Keep onClose ref updated without triggering effect
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    // Cleanup previous timer if any
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (isVisible) {
      setVisible(true)
      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          setVisible(false)
          // Use ref to call onClose to avoid dependency issues
          setTimeout(() => onCloseRef.current?.(), 300)
        }, duration)
      }
    } else {
      setVisible(false)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isVisible, duration])

  const handleManualClose = useCallback(() => {
    setVisible(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setTimeout(() => onCloseRef.current?.(), 300)
  }, [])

  if (!isVisible && !visible) return null

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />,
  }

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }

  return createPortal(
    <div
      className={`fixed right-4 top-4 z-[100] max-w-sm transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`rounded-xl border p-4 shadow-lg ${bgColors[type] || bgColors.success}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">{icons[type]}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">{message}</p>
            {subMessage && <p className="mt-1 text-sm text-slate-600">{subMessage}</p>}
          </div>
          <button
            onClick={handleManualClose}
            className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/**
 * Hook for managing toast state.
 */
export function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '', subMessage: '', type: 'success' })

  const showToast = useCallback((message, subMessage = '', type = 'success') => {
    setToast({ visible: true, message, subMessage, type })
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  return { toast, showToast, hideToast }
}
