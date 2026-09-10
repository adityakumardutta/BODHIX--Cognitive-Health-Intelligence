import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

// Single-flight guard: collapse duplicate concurrent login / guest-login
// attempts (e.g. double-clicking Sign In or "Continue as Guest") so each emits
// exactly ONE request. This guarantees invalid credentials produce a single 401
// (no retry/effect loop) and ensures Guest Login uses ONLY POST /auth/guest,
// never /api/auth/login. It does not alter JWT/auth architecture or backend
// behavior; it only prevents the client from firing the same request twice.
const inFlight = new Map()
function once(key, fn) {
  const pending = inFlight.get(key)
  if (pending) return pending
  const p = fn()
  inFlight.set(key, p)
  return p.finally(() => inFlight.delete(key))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('ds_user')
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        localStorage.removeItem('ds_user')
      }
    }
    setLoading(false)
  }, [])

    async function login(email, password) {
    // `once` guarantees a single in-flight POST /auth/login per credential set.
    return once('login:' + email, async () => {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('ds_token', res.token)
    // Guest accounts are recognized by having NO email in the auth response
    // (the backend returns email: null for the guest session) — never by name.
        const userInfo = { id: res.userId, fullName: res.fullName, email: res.email, role: res.role, isGuest: !res.email }
    localStorage.setItem('ds_user', JSON.stringify(userInfo))
    setUser(userInfo)
    return userInfo
    })
  }

  // Saves specialist details (name required, specialization optional) on the
  // authenticated user profile and refreshes the local session identity.
  async function updateProfile(payload) {
    const res = await api.patch('/profile', payload)
    setUser((prev) => {
      const next = {
        ...(prev || {}),
        id: res.userId,
        fullName: res.fullName,
        // Preserve the guest identity: a guest session never gains an email,
        // even after a profile update on the shared guest account.
        email: prev?.isGuest ? null : res.email,
        role: res.role,
        specialization: res.specialization,
        isGuest: !!prev?.isGuest,
      }
      localStorage.setItem('ds_user', JSON.stringify(next))
      return next
    })
    return res
  }

  // Guest Login: asks the real backend for a guest session. The backend
  // authenticates its dedicated guest/demo account server-side and returns
  // the NORMAL BODHIX JWT — same token, same role claims, same authorization
  // as email/password login. No token or password is hardcoded client-side.
    async function guestLogin() {
    // Single-flight: exactly one POST /auth/guest per attempt.
    return once('guest', async () => {
      const res = await api.post('/auth/guest')
      localStorage.setItem('ds_token', res.token)
      // Guest session: the backend returns fullName "Guest" and NO email
      // (email: null) — the guest has no usable email address by design.
      const userInfo = { id: res.userId, fullName: res.fullName, email: res.email, role: res.role, isGuest: true }
      localStorage.setItem('ds_user', JSON.stringify(userInfo))
      setUser(userInfo)
      return userInfo
    })
  }

  function logout() {
    localStorage.removeItem('ds_token')
    localStorage.removeItem('ds_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, guestLogin, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
