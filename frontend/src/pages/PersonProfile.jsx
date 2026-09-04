import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { api } from '../services/api.js'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'

export default function PersonProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [person, setPerson] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get(`/persons/${id}`), api.get(`/persons/${id}/history`)])
      .then(([p, h]) => { setPerson(p); setHistory(h) })
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="text-warning">{error}</p>
  if (!person) return <p className="text-muted">Loading…</p>

  const latest = history[history.length - 1]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {location.state?.offlineQueued && (
        <div className="rounded-md border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          You're offline — this screening was saved locally and will sync automatically once you're back online.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-primary">{person.fullName}</h1>
          <p className="text-sm text-muted">{person.age} years · {person.gender.replaceAll('_', ' ').toLowerCase()} · {person.location || 'No location on file'}</p>
        </div>
        <Link to={`/screening/${person.id}/intro`}><Button>New Screening</Button></Link>
      </div>

      <Card title="Current result">
        {latest ? (
          <div className="flex items-center gap-3">
            <Badge tone={latest.overallStatus === 'LOW_CONCERN' ? 'low' : 'review'}>
              {latest.overallStatus === 'LOW_CONCERN' ? 'Low concern' : 'Review recommended'}
            </Badge>
            <span className="text-sm text-muted">as of {latest.date}</span>
          </div>
        ) : (
          <p className="text-muted/70 text-sm">No screening completed yet.</p>
        )}
      </Card>

      <Card title="Screening history" action={history.length > 0 && (
        <Link to={`/persons/${id}/progress`} className="text-sm text-accent hover:underline">View Progress</Link>
      )}>
        {history.length === 0 ? (
          <p className="text-muted/70 text-sm">No screenings recorded yet.</p>
        ) : (
          <ul className="divide-y divide-default">
            {[...history].reverse().map((h) => (
              <li key={h.screeningId} className="py-3 flex items-center justify-between">
                <span className="text-sm text-primary">{h.date}</span>
                <div className="flex items-center gap-3 text-xs text-muted">
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
        )}
      </Card>

      <Card title="Emergency / follow-up contact">
        <p className="text-sm text-accent">{person.emergencyContactName || 'Not provided'} {person.emergencyContactPhone ? `· ${person.emergencyContactPhone}` : ''}</p>
      </Card>
    </div>
  )
}
