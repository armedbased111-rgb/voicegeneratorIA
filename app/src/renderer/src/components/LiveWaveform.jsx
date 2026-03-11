import { useEffect, useRef, useCallback } from 'react'

const BAR_W      = 3
const BAR_GAP    = 2
const BAR_RADIUS = 2
const COLOR      = 'rgba(160, 185, 209, 0.85)'
const FADE_PX    = 36

export default function LiveWaveform({ freqData, height = 56 }) {
  const canvasRef    = useRef(null)
  const containerRef = useRef(null)
  const freqRef      = useRef(freqData)

  useEffect(() => { freqRef.current = freqData }, [freqData])

  const redraw = useCallback(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr  = window.devicePixelRatio || 1
    const rect  = container.getBoundingClientRect()
    const w     = rect.width
    const h     = height

    canvas.width        = w * dpr
    canvas.height       = h * dpr
    canvas.style.width  = `${w}px`
    canvas.style.height = `${h}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    const data = freqRef.current
    if (!data || data.length === 0) return

    const barCount = Math.floor(w / (BAR_W + BAR_GAP))
    const cx       = h / 2

    for (let i = 0; i < barCount; i++) {
      const idx = Math.floor((i / barCount) * data.length)
      const val = data[idx] || 0
      const bh  = Math.max(2, val * h * 0.9)
      const x   = i * (BAR_W + BAR_GAP)
      const y   = cx - bh / 2

      ctx.fillStyle   = COLOR
      ctx.globalAlpha = 0.25 + val * 0.75
      ctx.beginPath()
      ctx.roundRect(x, y, BAR_W, bh, BAR_RADIUS)
      ctx.fill()
    }

    // Fade edges — read RGB tuple CSS variable and convert to rgba()
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '243 243 243'
    const bgSolid = `rgb(${raw})`
    const bgClear = `rgba(${raw.replace(/ /g, ',')},0)`
    const fadeL = ctx.createLinearGradient(0, 0, FADE_PX, 0)
    fadeL.addColorStop(0, bgSolid)
    fadeL.addColorStop(1, bgClear)
    const fadeR = ctx.createLinearGradient(w - FADE_PX, 0, w, 0)
    fadeR.addColorStop(0, bgClear)
    fadeR.addColorStop(1, bgSolid)

    ctx.globalAlpha = 1
    ctx.fillStyle = fadeL
    ctx.fillRect(0, 0, FADE_PX, h)
    ctx.fillStyle = fadeR
    ctx.fillRect(w - FADE_PX, 0, FADE_PX, h)
  }, [height])

  // Redraw on data change
  useEffect(() => { redraw() }, [freqData, redraw])

  // Redraw on container resize
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(() => redraw())
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [redraw])

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
