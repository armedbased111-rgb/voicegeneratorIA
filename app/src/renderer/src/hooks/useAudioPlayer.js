import { useState, useRef, useCallback } from 'react'

export function useAudioPlayer() {
  const [playing, setPlaying]   = useState(false)
  const [freqData, setFreqData] = useState(null)

  const volumeRef   = useRef(0)
  const ctxRef      = useRef(null)
  const sourceRef   = useRef(null)
  const analyserRef = useRef(null)
  const rafRef      = useRef(null)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    volumeRef.current = 0

    try { sourceRef.current?.stop() } catch (_) {}
    sourceRef.current = null

    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close().catch(() => {})
      ctxRef.current = null
    }
    analyserRef.current = null
    setPlaying(false)
    setFreqData(null)
  }, [])

  const play = useCallback(async (filePath) => {
    // Teardown previous
    cancelAnimationFrame(rafRef.current)
    volumeRef.current = 0
    try { sourceRef.current?.stop() } catch (_) {}
    sourceRef.current = null
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close().catch(() => {})
      ctxRef.current = null
    }
    analyserRef.current = null
    setFreqData(null)

    try {
      const absPath = await window.api.resolvePath(filePath)

      // Read via IPC — bypasses file:// CORS when renderer runs on http://localhost (dev)
      const ctx = new AudioContext()
      ctxRef.current = ctx
      await ctx.resume()

      const uint8 = await window.api.readFile(absPath)
      const arrayBuffer = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength)
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

      const source  = ctx.createBufferSource()
      source.buffer = audioBuffer
      sourceRef.current = source

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.50
      analyserRef.current = analyser

      source.connect(analyser)
      analyser.connect(ctx.destination)

      source.start(0)
      setPlaying(true)

      // RAF loop
      const bins    = analyser.frequencyBinCount
      const freqBuf = new Uint8Array(bins)
      const timeBuf = new Uint8Array(analyser.fftSize)

      const tick = () => {
        if (!analyserRef.current) return

        // Frequency → waveform bars
        analyserRef.current.getByteFrequencyData(freqBuf)
        setFreqData(Array.from(freqBuf, v => v / 255))

        // Time domain RMS → volumeRef for Orb shader (zero re-renders)
        analyserRef.current.getByteTimeDomainData(timeBuf)
        let sum = 0
        for (let i = 0; i < timeBuf.length; i++) {
          const s = (timeBuf[i] / 128) - 1
          sum += s * s
        }
        const rms = Math.sqrt(sum / timeBuf.length)
        volumeRef.current = Math.min(1, rms * 9)

        rafRef.current = requestAnimationFrame(tick)
      }
      tick()

      source.onended = stop

    } catch (err) {
      console.error('[AudioPlayer] error:', err)
      stop()
    }
  }, [stop])

  return { play, stop, playing, freqData, volumeRef }
}
