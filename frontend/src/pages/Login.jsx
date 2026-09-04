import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../services/authContext.jsx'
import Input from '../components/Input.jsx'
import Button from '../components/Button.jsx'
import Disclaimer from '../components/Disclaimer.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <img
            src="/assets/bodhix-logo-full.png"
            alt="BODHIX — Cognitive Health Intelligence"
            style={{ height: 96, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
          />
        </div>

        <form onSubmit={handleSubmit} className="glass-pop rounded-2xl p-6 space-y-4 shadow-glow">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="worker1@dementiascreen.demo" />
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p className="text-sm text-warning">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</Button>
          <button type="button" className="glass-btn-ghost w-full text-center text-sm">Forgot password</button>
        </form>

        <div className="mt-6">
          <Disclaimer compact />
        </div>
      </div>
    </div>
  )
}
