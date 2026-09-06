import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../services/authContext.jsx'
import GlassCard from '../components/GlassCard.jsx'
import StatCard from '../components/StatCard.jsx'
import { StatusBadge } from '../components/Badge.jsx'
import { Icons } from '../components/Icons.jsx'
import { Skeleton } from '../components/Feedback.jsx'

// Defensive field mapping � works with the real /persons API shape
function personName(p) { return p.name || p.fullName || 'Unnamed' }
function personAge(p) { return p.age ?? p.ageYears ?? '�' }
function personLocation(p) { return p.location || p.district || p.region || '�' }
function personLastScreening(p) {
  const v = p.lastScreening || p.lastScreeningDate || p.lastScreenedAt
  return v ? String(v).slice(0, 10) : 'Not screened'
}
function personStatus(p) { return p.status || p.riskStatus || p.resultSummary || 'Not screened' }

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/dashboard/statistics'), api.get('/persons')])
      .then(([s, people]) => { setStats(s); setRecent(people.slice(0, 5)) })
      .catch((e) => setError(e.message))
    .finally(() => setLoading(false))
  }, [])

  return (
    <div className="screen-content flex flex-col gap-6 h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
            Welcome back{user?.fullName ? ', ' + user.fullName.split(' ')[0] : ''}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Overview of your cognitive health screening programme
          </p>
        </div>
        <Link to="/persons/new" className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Icons.Plus /> New Screening
        </Link>
      </div>

      {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}

      {!loading && (
        <div className="flex flex-col gap-1 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Built around established screening instruments</p>
          <div className="flex flex-wrap items-center gap-3">
            {['AD8', 'RUDAS', 'PFAQ'].map((c) => <span key={c} className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: 'var(--color-border)', color: 'var(--text-primary)' }}>{c}</span>)}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Transparent scoring • Evidence references • Professional review</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Icons.Users />} value={stats?.totalPeopleScreened} label="Total People Screened" accent="#0d9488" />
        <StatCard icon={<Icons.AlertCircle />} value={stats?.peopleNeedingReview} label="People Needing Review" accent="#ef4444" />
        <StatCard icon={<Icons.Clock />} value={stats?.pendingFollowUps} label="Pending Follow-ups" accent="#f59e0b" />
        <StatCard icon={<Icons.CheckCircle />} value={stats?.completedScreenings} label="Completed Screenings" accent="#10b981" />
      </div>

      {/* Recent people */}
      <GlassCard className="flex-1 overflow-hidden" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="font-semibold text-base" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
            Recently Registered People
          </h2>
          <Link
            to="/persons"
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-70"
            style={{ background: 'var(--secondary)', color: 'var(--primary)' }}
          >
            View all
          </Link>
        </div>
        <div className="overflow-auto flex-1 p-5">
          <table className="w-full">
            <thead>
              <tr>
                {['NAME', 'AGE', 'LOCATION', 'LAST SCREENING', 'RISK STATUS', 'ACTIONS'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold tracking-widest pb-3" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id} className="table-row border-t" style={{ borderColor: 'var(--glass-border)' }}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
                        {personName(p).split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{personName(p)}</div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{personAge(p)}</td>
                  <td className="py-3 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{personLocation(p)}</td>
                  <td className="py-3 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{personLastScreening(p)}</td>
                  <td className="py-3 pr-4"><StatusBadge status={personStatus(p)} /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/persons/${p.id}`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:opacity-70"
                        style={{ background: 'var(--muted)', color: 'var(--text-secondary)' }}
                      >
                        View
                      </Link>
                      <Link
                        to={`/screening/${p.id}/intro`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:opacity-70"
                        style={{ background: 'var(--secondary)', color: 'var(--primary)' }}
                      >
                        Screen
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>No people registered yet — use "New Screening" to add someone.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
