import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Firebase Google sign-in uses signInWithPopup. For the popup window to
    // communicate with the opener (window.closed / postMessage), this page
    // must be served with COOP "same-origin-allow-popups". Without it Chrome
    // logs "Cross-Origin-Opener-Policy policy would block the window.closed
    // call" for every popup check. Production serves the same header from
    // Spring Security (SecurityConfig -> CrossOriginOpenerPolicy
    // SAME_ORIGIN_ALLOW_POPUPS). This only ADDS the header — nothing is
    // weakened and the popup flow is unchanged.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
