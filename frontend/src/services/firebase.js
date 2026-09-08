// Firebase Web SDK (modular). Web config only — NO Admin/service-account
// credentials or private keys are ever placed here or in VITE variables.
//
// ────────────────────────────────────────────────────────────────────────────
// FIREBASE AUTHORIZED DOMAINS (OAuth "This domain isn't authorized" error)
// ────────────────────────────────────────────────────────────────────────────
// Google/OAuth sign-in requires every domain the browser runs on to be listed
// under Firebase Console → Project settings (BODHIX) → Your apps → «Authorized
// domains». This is a Firebase console setting, NOT code — do not put domain
// values or secrets here.
//
// Required production entry (add this exact origin to Authorized domains):
//   https://bodhix-cognitive-health-intelligence-faca-ljqqykkav.vercel.app
//
// Keep the local/preview development origins registered too, e.g.:
//   http://localhost:5173
//   http://localhost:5174
//
// If Google sign-in returns "This domain (…) isn't authorized for Firebase
// OAuth", the current origin is missing from Authorized domains in the console.
// ────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
    : {}),
}

// Development-time validation: fail fast with a CLEAR, non-secret message
// instead of an opaque Firebase runtime exception (e.g. auth/invalid-api-key)
// that would otherwise leave the page unusable.
const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]
const missing = requiredKeys.filter(
  (k) => !firebaseConfig[k] || !String(firebaseConfig[k]).trim(),
)

let app = null
let auth = null
let googleProvider = null

if (missing.length > 0) {
  console.error(
    `Firebase configuration is incomplete. Check frontend/.env.local — missing: ${missing.join(', ')}`,
  )
} else {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
  } catch (err) {
    console.error(
      'Firebase failed to initialize. Check frontend/.env.local — verify the values exactly match Firebase Console → Project Settings → Web app config.',
    )
  }
}

export { app, auth, googleProvider }
