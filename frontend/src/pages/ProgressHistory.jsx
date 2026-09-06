import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { api } from '../services/api.js'
import Card from '../components/Card.jsx'
import { Skeleton, EmptyState } from '../components/Feedback.jsx'

const asArr = (d) => (Array.isArray(d) ? d : Array.isArray(d?.value) ? d.value : [])

export default function ProgressHistory() {
  const { id } = useParams()
  const [history, setHistory] = useState([])
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get(`/persons/${id}`).catch(() => null),
      api.get(`/persons/${id}/history`).catch(() => []),
    ]).then(([p, h]) => { if (!cancelled) { setPerson(p); setHistory(asArr(h)) } })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><Skeleton lines={6} /></div>
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><EmptyState title="Unable to load progress history" /></div>

  const chartData = history.map((h) => ({
    date: h.date, AD8: h.ad8Score, RUDAS: h.rudasScore, PFAQ: h.pfaqScore,
  }))
  const prev = history.length > 1 ? history[history.length - 2] : null
  const latest = history[history.length - 1]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-semibold text-primary">
          Progress history {person && `— ${person.fullName}`}
        </h1>
        <Link to={`/screening/${person?.id || id}/intro`} className="text-sm font-semibold text-accent hover:underline">Start New Screening</Link>
      </div>

      {history.length === 0 ? (
        <EmptyState
          title="No screenings recorded yet."
          description="Progress history will appear here after the first completed screening."
          actionLabel="Start New Screening"
          onAction={() => window.location.assign(`/screening/${person?.id || id}/intro`)}
        />
      ) : (
        <>
          <Card title="Scores over time">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="AD8" stroke="#c96a3e" strokeWidth={2} />
                  <Line type="monotone" dataKey="RUDAS" stroke="var(--color-accent)" strokeWidth={2} />
                  <Line type="monotone" dataKey="PFAQ" stroke="#5f9d99" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-muted">
              This timeline shows how screening scores have changed over time. It does not represent a medical diagnosis or a prediction of future decline.
            </p>
          </Card>

          {prev && latest && (
            <Card title="Change over time (previous → current)">
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                {[['AD8', prev.ad8Score, latest.ad8Score], ['RUDAS', prev.rudasScore, latest.rudasScore], ['PFAQ', prev.pfaqScore, latest.pfaqScore]].map(([code, p, c]) => (
                  <div key={code} className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{code}</p>
                    <p className="mt-1 font-semibold" style={{ color: 'var(--text-primary)' }}>{p ?? '—'} → {c ?? '—'}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Only real recorded history is shown; trends require professional interpretation.</p>
            </Card>
          )}

          <Card title="Screening timeline">
            <ol className="relative border-l border-default pl-6 space-y-6">
              {history.map((h) => (
                <li key={h.screeningId}>
                  <div className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-accent" />
                  <p className="text-sm font-medium text-primary">{h.date}</p>
                  <p className="text-xs text-muted">
                    AD8 {h.ad8Score ?? '—'} · RUDAS {h.rudasScore ?? '—'} · PFAQ {h.pfaqScore ?? '—'} ·{' '}
                    {h.overallStatus === 'LOW_CONCERN' ? 'Low concern' : 'Review recommended'}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </>
      )}
    </div>
  )
}