import { useAuth } from '../services/authContext.jsx'
import { useOffline } from '../services/offlineContext.jsx'
import { useTheme } from '../services/ThemeContext.jsx'
import { Icons } from './Icons.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isOnline, pendingCount } = useOffline()
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'HW'

  return (
    <header className="glass-nav flex items-center justify-between px-6" style={{ height: 60, flexShrink: 0 }}>
      {/* Online status */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: isOnline ? '#10b981' : '#f59e0b' }}
        />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {isOnline ? 'Online' : 'Offline mode'}
          {pendingCount > 0 && (
            <span style={{ color: '#f59e0b' }} className="ml-2 font-semibold">
              · {pendingCount} pending sync
            </span>
          )}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Profile */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl" style={{ background: 'var(--muted)' }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Manrope, sans-serif' }}
          >
            {initials}
          </div>
          <div>
            <div className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {user?.fullName || 'Health Worker'}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              {user?.email || (user?.role === 'ADMIN' ? 'Administrator' : 'Health Worker')}
            </div>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="theme-toggle w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ color: 'var(--text-secondary)' }}
          title={dark ? 'Switch to light' : 'Switch to dark'}
          aria-label="Toggle theme"
        >
          {dark ? <Icons.Sun /> : <Icons.Moon />}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
          }}
          title="Logout"
          aria-label="Logout"
        >
          <Icons.LogOut />
        </button>
      </div>
    </header>
  )
}
