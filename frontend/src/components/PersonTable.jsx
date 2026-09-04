import { Link } from 'react-router-dom'
import Badge from './Badge.jsx'

export default function PersonTable({ people }) {
  return (
    <div className="glass rounded-xl overflow-hidden shadow-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2/50 backdrop-blur-sm">

            <tr>
              <th className="text-left px-4 py-3 text-muted uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-muted uppercase tracking-wide">Age</th>
              <th className="text-left px-4 py-3 text-muted uppercase tracking-wide">Location</th>
              <th className="text-left px-4 py-3 text-muted uppercase tracking-wide">Last screening</th>
              <th className="text-left px-4 py-3 text-muted uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default">
            {people.map((p) => (
              <tr key={p.id} className="hover:bg-surface-2/60 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/persons/${p.id}`} className="font-medium text-accent hover:underline">{p.fullName}</Link>
                </td>
                <td className="px-4 py-3 text-muted">{p.age}</td>
                <td className="px-4 py-3 text-muted">{p.location || '—'}</td>
                <td className="px-4 py-3 text-muted">
                  {p.lastScreeningDate ? new Date(p.lastScreeningDate).toLocaleDateString() : 'Not screened'}
                </td>
                <td className="px-4 py-3">
                  {p.lastScreeningStatus
                    ? <Badge tone={p.lastScreeningStatus === 'LOW_CONCERN' ? 'low' : 'review'}>
                        {p.lastScreeningStatus === 'LOW_CONCERN' ? 'Low concern' : 'Review recommended'}
                      </Badge>
                    : <Badge>Not screened</Badge>}
                </td>
              </tr>
            ))}
            {people.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted/70">No people registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

