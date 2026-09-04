export default function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <p className="text-xs text-muted">
        Screening support only — not a diagnostic tool. Results should be interpreted by an appropriately qualified healthcare professional.
      </p>
    )
  }
  return (
    <div className="glass rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
      <p className="font-medium mb-1">Screening support tool — not a diagnosis</p>
      <p>This application is intended for research and screening support only. It is not a diagnostic tool. Screening results should be interpreted by an appropriately qualified healthcare professional.</p>
    </div>
  )
}
