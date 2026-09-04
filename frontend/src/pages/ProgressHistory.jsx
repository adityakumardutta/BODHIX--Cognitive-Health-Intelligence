import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { api } from '../services/api.js'
import Card from '../components/Card.jsx'

export default function ProgressHistory() {
  const { id } = useParams()
  const [history, setHistory] = useState([])
  const [person, setPerson] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get(`/persons/${id}`), api.get(`/persons/${id}/history`)])
      .then(([p, h]) => { setPerson(p); setHistory(h) })
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="text-warning">{error}</p>

  const chartData = history.map((h) => ({
    date: h.date, AD8: h.ad8Score, RUDAS: h.rudasScore, PFAQ: h.pfaqScore,
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-xl font-semibold text-primary">
        Progress history {person && `— ${person.fullName}`}
      </h1>

      <Card title="Scores over time">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                labelStyle={{ color: 'var(--color-text)' }}
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
          {history.length === 0 && <p className="text-muted/70 text-sm">No history yet.</p>}
        </ol>
      </Card>
    </div>
  )
}
