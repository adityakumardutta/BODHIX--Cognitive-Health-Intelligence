import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'ds_theme'

// BODHIX is light-theme only: theme is fixed to 'light' and any previously
// stored dark preference is ignored/cleared.
export function ThemeProvider({ children }) {
  const [theme] = useState(() => 'light')

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Kept for API compatibility with existing consumers; light-only, no-op.
  const toggleTheme = useCallback(() => {}, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
