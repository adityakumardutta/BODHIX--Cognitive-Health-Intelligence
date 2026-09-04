import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Disclaimer from '../components/Disclaimer.jsx'

export default function ScreeningIntro() {
  const { personId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="glass-pop rounded-2xl p-6 shadow-glow">
        <h1 className="font-display text-xl font-semibold text-primary mb-3">Before we begin</h1>
        <ul className="space-y-3 text-sm text-accent">
          <li><span className="font-medium text-primary">What this is:</span> a structured screening covering three validated instruments (AD8, RUDAS, PFAQ) that takes about 20–30 minutes.</li>
          <li><span className="font-medium text-primary">What it is not:</span> a diagnosis. It flags whether further professional assessment may be appropriate.</li>
          <li><span className="font-medium text-primary">Who should interpret it:</span> an appropriately qualified healthcare professional should review the result.</li>
        </ul>
        <div className="mt-5">
          <Disclaimer />
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => navigate(`/screening/${personId}/run`)}>Begin Screening</Button>
        </div>
      </div>
    </div>
  )
}
