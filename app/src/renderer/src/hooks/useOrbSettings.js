import { useState, useRef, useEffect, useCallback } from 'react'

const LS_KEY = 'veil:orb-settings'

export const PALETTES = {
  'ice blue': ['#D8EAFF', '#AECBE8'],
  'gold':     ['#FFE8A0', '#D4A847'],
  'violet':   ['#E8D4FF', '#A87DC8'],
  'mono':     ['#E0E0E0', '#909090'],
}

const DEFAULTS = {
  palette:   'ice blue',
  color1:    '#D8EAFF',
  color2:    '#AECBE8',
  speedMult: 1.0,
  intensity: 1.0,
}

export function useOrbSettings() {
  const [settings, setSettings] = useState(() => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(LS_KEY)) } }
    catch { return DEFAULTS }
  })

  const colorsRef   = useRef([settings.color1, settings.color2])
  const settingsRef = useRef(settings)

  useEffect(() => {
    colorsRef.current   = [settings.color1, settings.color2]
    settingsRef.current = settings
  }, [settings])

  // Sync changes from other windows (main ↔ mini tray)
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== LS_KEY) return
      try { setSettings({ ...DEFAULTS, ...JSON.parse(e.newValue) }) } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { settings, update, colorsRef, settingsRef }
}
