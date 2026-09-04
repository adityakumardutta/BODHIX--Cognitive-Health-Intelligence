import { Link } from 'react-router-dom'
import Badge from './Badge.jsx'
const TONE_BY_LEVEL = { HIGH: 'high', MEDIUM: 'medium', LOW: 'neutral' }

export default function PriorityList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.personId} className="glass-pop rounded-xl p-4 flex items-start justify-between gap-4 transition-all duration-200 hover:translate-y-[-1px]">
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/persons/${item.personId}`} className="font-medium text-accent hover:underline">{item.personName}</Link>
              <Badge tone={TONE_BY_LEVEL[item.priorityLevel]}>{item.priorityLevel} priority</Badge>
            </div>
            <ul className="mt-2 text-sm text-muted list-disc list-inside space-y-0.5">
              {item.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          <div className="text-right text-xs text-muted/70 whitespace-nowrap">
            <p>Last screening</p>
            <p className="text-accent">{item.lastScreeningDate}</p>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-muted/70 text-sm">No one currently requires follow-up attention.</p>}
    </div>
  )
}
