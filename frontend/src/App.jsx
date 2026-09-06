import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import MasterAuth from './components/auth/MasterAuth.jsx'
import RequireAuth from './pages/RequireAuth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import People from './pages/People.jsx'
import NewPerson from './pages/NewPerson.jsx'
import ScreeningIntro from './pages/ScreeningIntro.jsx'
import Screening from './pages/Screening.jsx'
import ScreeningResult from './pages/ScreeningResult.jsx'
import PersonProfile from './pages/PersonProfile.jsx'
import ProgressHistory from './pages/ProgressHistory.jsx'
import FollowUps from './pages/FollowUps.jsx'
import Analytics from './pages/Analytics.jsx'
import ClinicalEvidence from './pages/ClinicalEvidence.jsx'
import Settings from './pages/Settings.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const location = useLocation()
  return (
    <div className="page-enter page-enter-active">
      {/* Living glass background — shared by every screen */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
        <div className="neural-lines" />
        <div className="particles">
          {[
            { left: '8%', top: '70%', dur: '26s', delay: '0s' },
            { left: '22%', top: '85%', dur: '30s', delay: '6s' },
            { left: '45%', top: '92%', dur: '24s', delay: '12s' },
            { left: '68%', top: '88%', dur: '32s', delay: '3s' },
            { left: '84%', top: '78%', dur: '28s', delay: '9s' },
            { left: '93%', top: '60%', dur: '34s', delay: '15s' },
          ].map((p, i) => (
            <span key={i} style={{ left: p.left, top: p.top, '--dur': p.dur, '--delay': p.delay }} />
          ))}
        </div>
      </div>
    <Routes>
      <Route path="/login" element={<MasterAuth />} />

      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/persons" element={<RequireAuth><People /></RequireAuth>} />
      <Route path="/persons/new" element={<RequireAuth><NewPerson /></RequireAuth>} />
      <Route path="/persons/:id" element={<RequireAuth><PersonProfile /></RequireAuth>} />
      <Route path="/persons/:id/progress" element={<RequireAuth><ProgressHistory /></RequireAuth>} />

      <Route path="/screening/:personId/intro" element={<RequireAuth><ScreeningIntro /></RequireAuth>} />
      <Route path="/screening/:personId/run" element={<RequireAuth><Screening /></RequireAuth>} />
      <Route path="/screening/:personId/result" element={<RequireAuth><ScreeningResult /></RequireAuth>} />

      <Route path="/followups" element={<RequireAuth><FollowUps /></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
      <Route path="/clinical-evidence" element={<RequireAuth><ClinicalEvidence /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </div>
  )
}
