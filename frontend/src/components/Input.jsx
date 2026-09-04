export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="label-text">{label}</label>}
      <input className="input-field" {...props} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
