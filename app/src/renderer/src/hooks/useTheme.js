import { useState, useEffect } from 'react'

const LS_KEY = 'veil:theme'

function getInitial() {
  const saved = localStorage.getItem(LS_KEY)
  if (saved) return saved === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme() {
  const [dark, setDark] = useState(getInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(LS_KEY, dark ? 'dark' : 'light')
  }, [dark])

  // Sync between main window and mini tray
  useEffect(() => {
    function onStorage(e) {
      if (e.key === LS_KEY) setDark(e.newValue === 'dark')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { dark, toggle: () => setDark(v => !v) }
}
