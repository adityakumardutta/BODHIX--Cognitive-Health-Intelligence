const VARIANTS = {
  primary: 'glass-btn-primary',
  secondary: 'glass-btn-secondary',
  success: 'glass-btn-success',
  danger: 'glass-btn-danger',
  icon: 'icon-btn',
  ghost: 'glass-btn-ghost',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const base = VARIANTS[variant] || VARIANTS.primary
  const sizeClass = size === 'sm' ? ' btn-sm' : size === 'lg' ? ' btn-lg' : ''
  return (
    <button className={`${base}${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  )
}
