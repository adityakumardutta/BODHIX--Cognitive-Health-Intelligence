import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import GlassCard from '../components/GlassCard.jsx'
import StatusBadge from '../components/Badge.jsx'
import PriorityList from '../components/PriorityList.jsx'
import FollowUpCard from '../components/FollowUpCard.jsx'
import { EmptyState } from '../components/Feedback.jsx'

export default function FollowUps() {
  const [priority, setPriority] = useState([])
  const [followUps, setFollowUps] = useState([])
  const [error, setError] = useState('')

  // The backend wraps list responses in a { value: [...], Count } envelope.
  const asArr = (d) => (Array.isArray(d) ? d : Array.isArray(d?.value) ? d.value : [])

  function load() {
    Promise.all([api.get('/followups/priority'), api.get('/followups')])
      .then(([p, f]) => { setPriority(asArr(p)); setFollowUps(asArr(f)) })
      .catch((e) => setError(e.message))
  }

  useEffect(load, [])

  async function updateStatus(id, status) {
    try {
      await api.patch(`/followups/${id}/status`, { status })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  const byLevel = { HIGH: [], MEDIUM: [], LOW: [] }
  priority.forEach((p) => byLevel[p.priorityLevel]?.push(p))

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-semibold text-primary">Priority & Follow-up</h1>
      {error && <p className="text-sm text-warning">{error}</p>}

      {byLevel.HIGH.length > 0 && (
        <GlassCard className="p-4 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-primary">High priority ({byLevel.HIGH.length})</h3>
            <StatusBadge status="Pending" />
          </div>
          <PriorityList items={byLevel.HIGH} />
        </GlassCard>
      )}

      {byLevel.MEDIUM.length > 0 && (
        <GlassCard className="p-4 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-primary">Medium priority ({byLevel.MEDIUM.length})</h3>
            <StatusBadge status="Pending" />
          </div>
          <PriorityList items={byLevel.MEDIUM} />
        </GlassCard>
      )}

      {byLevel.LOW.length > 0 && (
        <GlassCard className="p-4 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-primary">Low priority ({byLevel.LOW.length})</h3>
            <StatusBadge status="Pending" />
          </div>
          <PriorityList items={byLevel.LOW} />
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="font-semibold text-sm mb-3">All follow-up records</h3>
        <div className="space-y-2">
          {followUps.map((f) => (
            <FollowUpCard key={f.id} followUp={f} onUpdateStatus={updateStatus} />
          ))}
          {followUps.length === 0 && (
            <EmptyState title="No follow-ups yet." description="Follow-ups appear here after a screening that recommends professional review." />
          )}
        </div>
      </GlassCard>
    </div>
  )
}