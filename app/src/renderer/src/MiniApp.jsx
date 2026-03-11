import { useState } from 'react'
import { Orb } from './components/ui/ui/orb'
import LiveWaveform from './components/LiveWaveform'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useOrbSettings } from './hooks/useOrbSettings'
import { useTheme } from './hooks/useTheme'

export default function MiniApp() {
  const [text, setText]     = useState('')
  const [status, setStatus] = useState({ state: 'idle' })
  const { play, stop, playing, freqData } = useAudioPlayer()
  const { settings, colorsRef, settingsRef } = useOrbSettings()
  useTheme() // sync theme from localStorage/storage events

  const activeState = playing ? 'talking'
    : status.state === 'loading' ? 'talking'
    : status.state === 'success' ? 'thinking'
    : null

  async function handleGenerate() {
    if (!text.trim() || status.state === 'loading') return
    stop()
    setStatus({ state: 'loading' })
    const res = await window.api.generate({ text: text.trim(), preset: 'default' })
    if (res.ok) {
      setStatus({ state: 'success' })
      play(res.path)
    } else {
      setStatus({ state: 'error', message: res.error?.split('\n').pop() || 'error' })
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div
      className="flex flex-col h-screen bg-bg font-geist select-none overflow-hidden transition-colors duration-200"
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 pt-2.5 pb-1 flex-shrink-0"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <span className="text-[9px] font-medium text-ink/30 tracking-widest uppercase">VEIL</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.api.openMain()}
            className="text-[9px] text-muted/40 hover:text-ink/50 tracking-widest uppercase transition-colors"
            title="Open main window"
          >
            expand ↗
          </button>
          <button
            onClick={() => window.api.close()}
            className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all"
            title="Close"
          />
        </div>
      </div>

      {/* Mini orb */}
      <div className="flex items-center justify-center flex-shrink-0" style={{ height: 72 }}>
        <div style={{ width: 64, height: 64 }}>
          <Orb agentState={activeState} colors={[settings.color1, settings.color2]} colorsRef={colorsRef} settingsRef={settingsRef} />
        </div>
      </div>

      {/* Waveform */}
      <div
        className="px-3 flex-shrink-0"
        style={{
          height: playing ? 32 : 0,
          opacity: playing ? 1 : 0,
          transition: 'height 0.3s ease, opacity 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <LiveWaveform freqData={freqData} height={28} />
      </div>

      {/* Input + button */}
      <div
        className="flex-1 px-3 pb-3 flex flex-col gap-1.5 min-h-0"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type lyrics… ⌘↵ to generate"
          className="flex-1 w-full bg-surface border border-border rounded-xl px-3 pt-2 text-[11px] font-mono text-ink resize-none outline-none placeholder:text-muted/40 leading-relaxed min-h-0 focus:border-muted transition-colors"
          spellCheck={false}
        />
        {status.state === 'error' && (
          <span className="text-[9px] text-red-400/70 font-mono truncate">{status.message}</span>
        )}
        <button
          onClick={playing ? stop : handleGenerate}
          disabled={!playing && (!text.trim() || status.state === 'loading')}
          className="w-full bg-[#111] text-white text-[9px] font-medium tracking-widest uppercase py-1.5 rounded-lg disabled:opacity-25 hover:enabled:bg-[#333] transition-all"
        >
          {status.state === 'loading' ? (
            <span className="inline-flex items-center justify-center gap-1.5">
              <span className="inline-block w-2 h-2 border border-white/30 border-t-white rounded-full animate-spin" />
              generating…
            </span>
          ) : playing ? '■ stop' : '▶ generate'}
        </button>
      </div>
    </div>
  )
}
