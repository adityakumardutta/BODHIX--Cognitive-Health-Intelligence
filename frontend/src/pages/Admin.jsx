import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import Card from '../components/Card.jsx'
import { BarChartCard } from '../components/ChartCard.jsx'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/dashboard/statistics'), api.get('/analytics')])
      .then(([s, a]) => { setStats(s); setAnalytics(a) })
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="text-warning">{error}</p>
  if (!stats || !analytics) return <p className="text-muted">Loading…</p>

  const byMonth = Object.entries(analytics.screeningsByMonth).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-semibold text-primary">Admin overview</h1>
      <p className="text-xs text-muted">Anonymized, aggregate statistics only.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total people" value={stats.totalPeopleScreened} />
        <Stat label="Needing review" value={stats.peopleNeedingReview} />
        <Stat label="Pending follow-ups" value={stats.pendingFollowUps} />
        <Stat label="Completed screenings" value={stats.completedScreenings} />
      </div>

      <BarChartCard title="Screening activity by month" data={byMonth} />

      <Card title="Notes">
        <p className="text-sm text-accent">
          Health-worker management (add/deactivate accounts) is planned for a future iteration; account creation currently
          happens directly via the database seed/admin scripts described in the README.
        </p>
      </Card>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="glass-stat rounded-xl p-5 shadow-surface">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-display font-bold text-primary">{value}</p>
    </div>
  )
}
