import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

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
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('ds_token', res.token)
    const userInfo = { id: res.userId, fullName: res.fullName, email: res.email, role: res.role }
    localStorage.setItem('ds_user', JSON.stringify(userInfo))
    setUser(userInfo)
    return userInfo
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
        email: res.email,
        role: res.role,
        specialization: res.specialization,
      }
      localStorage.setItem('ds_user', JSON.stringify(next))
      return next
    })
    return res
  }

  function logout() {
    localStorage.removeItem('ds_token')
    localStorage.removeItem('ds_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
