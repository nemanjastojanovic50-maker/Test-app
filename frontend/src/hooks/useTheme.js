import { useState, useEffect } from 'react'

const STORAGE_KEY = 'app-theme'
const DEFAULT = 'light'

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT
    } catch {
      return DEFAULT
    }
  })

  useEffect(() => {
    const value = theme === 'dark' ? 'dark' : 'light'
    document.documentElement.dataset.theme = value
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch (_) {}
  }, [theme])

  const setTheme = (next) => {
    setThemeState(next === 'dark' ? 'dark' : 'light')
  }

  return [theme, setTheme]
}
