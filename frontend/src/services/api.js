// Thin wrapper around fetch for the DementiaScreen REST API.
// Reads the JWT from sessionStorage (set by authContext on login) and attaches
// it to every request. Throws a normalized Error with a friendly message on
// non-2xx responses so components can show it directly to the user.

// Single-deployment: production builds are served by Spring Boot itself, so
// the API is SAME-ORIGIN (/api) — no cross-origin URL, no CORS involved.
// Local development (vite dev server) keeps the direct backend.
// An explicit VITE_API_URL still wins if ever needed (no secrets here —
// it is a public path/URL, never credentials).
const BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? '/api' : 'http://localhost:8081/api')

function getToken() {
  return sessionStorage.getItem('ds_token')
}

function clearStaleSession() {
  try {
    sessionStorage.removeItem('ds_token')
    sessionStorage.removeItem('ds_user')
  } catch (e) {
    /* ignore storage errors */
  }
}

// Redirect to a real login when the stored JWT is absent/invalid/expired.
// This is the client-side recovery for a stale session; it never punts to
// unauthenticated access and never touches Spring Security rules.
function redirectToLogin() {
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login'
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${BASE_URL}${path}`
  if (params) {
    const qs = new URLSearchParams(params).toString()
    if (qs) url += `?${qs}`
  }

  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (networkError) {
    const err = new Error('Cannot reach the server. Check your connection.')
    err.isNetworkError = true
    throw err
  }

  if (response.status === 204) return null

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    // A 401/403 on a protected endpoint usually means an invalid/expired JWT.
    // Clear the stale session and let the user re-authenticate. The login
    // endpoint is excluded so invalid credentials still surface the normal
    // form error instead of bouncing back to /login.
    if ((response.status === 401 || response.status === 403) && !path.startsWith('/auth/')) {
      clearStaleSession()
      redirectToLogin()
    }
    const message = data?.message || `Request failed (${response.status})`
    const err = new Error(message)
    err.status = response.status
    throw err
  }

  return data
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}
