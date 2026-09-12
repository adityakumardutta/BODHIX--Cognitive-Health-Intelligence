import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

// Screens that render without the top navbar (full-height focused flows).
const NO_NAVBAR_ROUTES = ['/persons/new']

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const hideNavbar = NO_NAVBAR_ROUTES.some((r) => location.pathname.startsWith(r))

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — floating glass panel */}
      <div className="hidden md:block p-3 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 p-3">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile top bar with menu trigger */}
        <button
          className="md:hidden glass-nav w-full flex items-center px-4 py-3 text-sm font-medium"
          style={{ color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer' }}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
                    <img src="/assets/bodhix-logo-full.png" alt="BODHIX" width="39" height="26" loading="eager" fetchpriority="high" style={{ height: 26, width: 'auto', objectFit: 'contain' }} className="ml-3" />
        </button>

        {!hideNavbar && <Navbar />}

        <main className="flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}