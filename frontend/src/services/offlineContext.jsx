import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from './api'

// Offline-style data capture (Screen 13).
// Pending screenings are queued in localStorage under 'ds_pending_screenings'
// and only removed once the backend confirms it accepted them. Nothing is
// ever reported as "synced" client-side without a successful API response.

const OfflineContext = createContext(null)
const QUEUE_KEY = 'ds_pending_screenings'

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeQueue(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
}

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queue, setQueue] = useState(readQueue())
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const queueScreening = useCallback((payload) => {
    const entry = { localId: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`, payload }
    const next = [...readQueue(), entry]
    writeQueue(next)
    setQueue(next)
    return entry.localId
  }, [])

  const sync = useCallback(async () => {
    if (!navigator.onLine) return { synced: 0, failed: 0 }
    setSyncing(true)
    let current = readQueue()
    let synced = 0
    let failed = 0
    const remaining = []

    for (const entry of current) {
      try {
        await api.post('/screenings', entry.payload)
        synced += 1
      } catch {
        failed += 1
        remaining.push(entry)
      }
    }

    writeQueue(remaining)
    setQueue(remaining)
    setSyncing(false)
    return { synced, failed }
  }, [])

  return (
    <OfflineContext.Provider value={{ isOnline, pendingCount: queue.length, queueScreening, sync, syncing }}>
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const ctx = useContext(OfflineContext)
  // Safe fallback: components can render even if no provider is mounted.
  if (!ctx) {
    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingCount: 0,
      queueScreening: () => null,
      sync: async () => ({ synced: 0, failed: 0 }),
      syncing: false,
    }
  }
  return ctx
}
