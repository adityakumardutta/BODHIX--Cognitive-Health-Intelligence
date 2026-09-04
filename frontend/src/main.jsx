import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import BodhixIntro from './components/BodhixIntro.jsx'
import { AuthProvider } from './services/authContext.jsx'
import { ThemeProvider } from './services/ThemeContext.jsx'
import { OfflineProvider } from './services/offlineContext.jsx'
import './index.css'

/**
 * Root gate: plays the BODHIX intro animation once, then reveals the app.
 */
function Root() {
  const [showIntro, setShowIntro] = useState(true)

  if (showIntro) {
    return <BodhixIntro onComplete={() => setShowIntro(false)} />
  }

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <OfflineProvider>
            <Root />
          </OfflineProvider>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)