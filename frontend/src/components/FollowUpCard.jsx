import Badge from './Badge.jsx'
import Button from './Button.jsx'
const TONE = { PENDING: 'pending', SCHEDULED: 'scheduled', COMPLETED: 'completed', OVERDUE: 'overdue' }

export default function FollowUpCard({ followUp, onUpdateStatus }) {
  return (
    <div className="glass-pop rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-200 hover:translate-y-[-1px]">
      <div>
        <p className="font-medium text-primary">{followUp.personName}</p>
        <p className="text-sm text-muted">{followUp.reason || 'Follow-up'}</p>
        {followUp.scheduledDate && <p className="text-xs text-muted/70 mt-1">Scheduled: {followUp.scheduledDate}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={TONE[followUp.status]}>{followUp.status}</Badge>
        {followUp.status !== 'COMPLETED' && (
          <Button variant="secondary" onClick={() => onUpdateStatus(followUp.id, 'COMPLETED')}>Mark done</Button>
        )}
      </div>
    </div>
  )
}
