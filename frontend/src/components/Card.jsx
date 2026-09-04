export default function Card({ title, action, className = '', children }) {
  return (
    <div className={`glass rounded-xl p-5 shadow-surface ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-display font-semibold text-primary">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
