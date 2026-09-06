import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import GlassCard from '../components/GlassCard.jsx'
import { StatusBadge } from '../components/Badge.jsx'
import { Icons } from '../components/Icons.jsx'

function personName(p) { return p.name || p.fullName || 'Unnamed' }
function personAge(p) { return p.age ?? p.ageYears ?? '�' }
function personLocation(p) { return p.location || p.district || p.region || '�' }
function personLastScreening(p) {
  const v = p.lastScreening || p.lastScreeningDate || p.lastScreenedAt
  return v ? String(v).slice(0, 10) : 'Not screened'
}
function personStatus(p) { return p.status || p.riskStatus || p.resultSummary || 'Not screened' }

const FILTERS = ['All', 'Needs Review', 'Low Concern', 'Not Screened']

export default function People() {
  const [people, setPeople] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')

  useEffect(() => {
    const handle = setTimeout(() => {
      api.get('/persons', query ? { q: query } : undefined)
        .then(setPeople)
        .catch((e) => setError(e.message))
    }, 250)
    return () => clearTimeout(handle)
  }, [query])

  const filtered = people.filter((p) => {
    const status = String(personStatus(p)).toLowerCase()
    return (
      filter === 'All' ||
      (filter === 'Needs Review' && status === 'review recommended') ||
      (filter === 'Low Concern' && status === 'low concern') ||
      (filter === 'Not Screened' && status === 'not screened')
    )
  })

  return (
    <div className="screen-content flex flex-col gap-5 h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
            People
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {people.length} registered individuals
          </p>
        </div>
        <Link to="/persons/new" className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Icons.Plus /> Add Person
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
            <Icons.Search />
          </div>
          <input
            type="text"
            placeholder="Search by name or location..."
            className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: filter === f ? 'var(--primary)' : 'var(--glass-bg)',
                color: filter === f ? 'var(--primary-foreground)' : 'var(--text-secondary)',
                border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--glass-border)'}`,
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}
      </div>

      {/* Table */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col" style={{ padding: 0 }}>
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
              {filtered.map((p) => (
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
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{people.length === 0 ? 'No screenings recorded yet.' : 'No matching people for this search.'}</p>
                    {people.length === 0 && (
                      <Link to="/persons/new" className="btn-primary inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl text-sm font-semibold"><Icons.Plus /> Start New Screening</Link>
                    )}
                  </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
