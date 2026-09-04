export default function GlassCard({ className = '', style, children }) {
  return (
    <div className={`glass-card rounded-2xl ${className}`} style={style}>
      {children}
    </div>
  )
}