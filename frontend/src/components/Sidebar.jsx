import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../services/authContext.jsx'
import { Icons } from './Icons.jsx'

const navItems = [
  { id: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: <Icons.Dashboard /> },
  { id: 'new-screening', to: '/persons/new', label: 'New Screening', icon: <Icons.Plus width={18} height={18} /> },
  { id: 'people', to: '/persons', label: 'People', icon: <Icons.Users /> },
  { id: 'follow-ups', to: '/followups', label: 'Follow-ups', icon: <Icons.Calendar /> },
  { id: 'analytics', to: '/analytics', label: 'Analytics', icon: <Icons.BarChart2 /> },
  { id: 'clinical-evidence', to: '/clinical-evidence', label: 'Clinical Evidence', icon: <Icons.BookOpen /> },
  { id: 'settings', to: '/settings', label: 'Settings', icon: <Icons.Settings /> },
]

const linkClass = `nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left`

// Route-based active detection: exactly ONE item active at a time.
// /persons/new → New Screening only; /persons and /persons/:id → People.
function getActiveId(pathname) {
  if (pathname.startsWith('/persons/new')) return 'new-screening'
  if (pathname === '/persons' || pathname.startsWith('/persons/')) return 'people'
  const item = navItems.find((n) => n.to !== '/persons' && pathname.startsWith(n.to))
  return item ? item.id : null
}

export default function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const activeId = getActiveId(location.pathname)

  return (
    <aside className="glass-sidebar flex flex-col flex-shrink-0 h-full" style={{ width: 248, padding: 18 }}>
      {/* Branding — the logo image already contains BODHIX + tagline, no text below */}
      <div className="flex flex-col items-center text-center px-1 pb-2">
        <img
          src="/assets/bodhix-logo-full.png"
          alt="BODHIX — Cognitive Health Intelligence"
          className="brand-logo-emblem"
          style={{ height: 132, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Navigation — comfortable intentional spacing below branding */}
      <nav className="flex-col gap-1 flex-1 overflow-y-auto mt-5">
        <div className="text-[10px] font-semibold uppercase px-3 mb-2" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.12em' }}>
          Navigation
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={() => `${linkClass} ${activeId === item.id ? 'active' : ''}`}
            style={{ color: activeId === item.id ? undefined : 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}
          >
            <span style={{ opacity: 0.9 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={() => `${linkClass} ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
            style={{ color: location.pathname.startsWith('/admin') ? undefined : 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}
          >
            <span style={{ opacity: 0.9 }}><Icons.ClipboardCheck /></span>
            Admin
          </NavLink>
        )}
      </nav>

      {/* Disclaimer card */}
      <div className="info-panel p-3 mt-4">
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Screening support only — not a diagnostic tool. Results require professional review.
        </p>
      </div>
    </aside>
  )
}