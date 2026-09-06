import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { api } from '../services/api.js'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import { Skeleton, ErrorState, EmptyState } from '../components/Feedback.jsx'

const asArr = (d) => (Array.isArray(d) ? d : Array.isArray(d?.value) ? d.value : [])

export default function PersonProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [person, setPerson] = useState(null)
  const [history, setHistory] = useState([])
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get(`/persons/${id}`).catch(() => null),
      api.get(`/persons/${id}/history`).catch(() => []),
      api.get('/followups').catch(() => []),
    ]).then(([p, h, f]) => {
      if (cancelled) return
      setPerson(p)
      setHistory(asArr(h))
      setFollowUps(asArr(f).filter((fu) => Number(fu.personId) === Number(id)))
    }).catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><Skeleton lines={5} /></div>
  if (error) return <div className="max-w-3xl mx-auto px-4 py-8"><ErrorState title="Unable to load person" /></div>
  if (!person) return <div className="max-w-3xl mx-auto px-4 py-8"><ErrorState title="Unable to load person" /></div>

  const latest = history[history.length - 1]
  const previous = history.length > 1 ? history[history.length - 2] : null
  const hasHistory = history.length > 0
  const allOpenFollowUps = followUps.filter((f) => f.status !== 'COMPLETED')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {location.state?.offlineQueued && (
        <div className="rounded-md border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          You're offline — this screening was saved locally and will sync automatically once you're back online.
        </div>
      )}

      {/* Patient summary */}
      <div className="glass-pop rounded-2xl p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-primary">{person.fullName}</h1>
            <p className="text-sm text-muted">{person.age} years · {String(person.gender || '').replaceAll('_', ' ').toLowerCase()} · {person.location || 'No location on file'}</p>
          </div>
          <Link to={`/screening/${person.id}/intro`}><Button>New Screening</Button></Link>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
          {(person.phone || person.location) && (
            <p>{person.phone ? `Phone: ${person.phone}` : ''}{person.phone && person.location ? ' · ' : ''}{person.location ? `Location: ${person.location}` : ''}</p>
          )}
          <p>Emergency contact: {person.emergencyContactName || 'Not provided'}{person.emergencyContactPhone ? ` · ${person.emergencyContactPhone}` : ''}</p>
        </div>
      </div>

      {/* Current result */}
      <Card title="Current result">
        {latest ? (
          <div className="flex items-center gap-3">
            <Badge tone={latest.overallStatus === 'LOW_CONCERN' ? 'low' : 'review'}>
              {latest.overallStatus === 'LOW_CONCERN' ? 'Low concern' : 'Review recommended'}
            </Badge>
            <span className="text-sm text-muted">as of {latest.date}</span>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/screening/${person.id}/result`, { state: {} })}>View result</Button>
          </div>
        ) : (
          <p className="text-muted/70 text-sm">No screening completed yet.</p>
        )}
      </Card>

      {/* Follow-up status */}
      <Card title="Follow-up status">
        {followUps.length === 0 ? (
          <p className="text-muted/70 text-sm">No follow-ups recorded for this person.</p>
        ) : (
          <ul className="divide-y divide-default">
            {followUps.map((f) => (
              <li key={f.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-primary">{f.reason || 'Follow-up'}</span>
                <div className="flex items-center gap-2">
                  {f.scheduledDate && <span className="text-muted text-xs">Scheduled: {f.scheduledDate}</span>}
                  <Badge tone={f.status === 'COMPLETED' ? 'completed' : f.status === 'OVERDUE' ? 'overdue' : 'pending'}>{f.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
        {allOpenFollowUps.length > 0 && (
          <Link to="/followups" className="mt-2 inline-block text-sm text-accent hover:underline">View follow-ups</Link>
        )}
      </Card>
{/* Screening history with change over time */}
      <Card title="Screening history" action={history.length > 0 && (
        <Link to={`/persons/${id}/progress`} className="text-sm text-accent hover:underline">View Progress</Link>
      )}>
        {!hasHistory ? (
          <EmptyState
            title="No screenings recorded yet."
            description="Start a new screening to begin tracking this person's cognitive health."
            actionLabel="Start New Screening"
            onAction={() => navigate(`/screening/${person.id}/intro`)}
          />
        ) : (
          <>
            {previous && latest && (
              <div className="mb-4 rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Change over time</p>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                  {[['AD8', previous.ad8Score, latest.ad8Score], ['RUDAS', previous.rudasScore, latest.rudasScore], ['PFAQ', previous.pfaqScore, latest.pfaqScore]].map(([code, prev, curr]) => (
                    <div key={code} className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{code}</span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}><b>{prev ?? '—'}</b> → <b>{curr ?? '—'}</b></span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Shows only real, recorded screening history. Changes should be reviewed by a qualified professional.</p>
              </div>
            )}
            <ul className="divide-y divide-default">
              {[...history].reverse().map((h) => (
                <li key={h.screeningId} className="py-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-primary">{h.date}</span>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>AD8: {h.ad8Score ?? '—'}</span>
                    <span>RUDAS: {h.rudasScore ?? '—'}</span>
                    <span>PFAQ: {h.pfaqScore ?? '—'}</span>
                    <Badge tone={h.overallStatus === 'LOW_CONCERN' ? 'low' : 'review'}>
                      {h.overallStatus === 'LOW_CONCERN' ? 'Low concern' : 'Review recommended'}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  )
}