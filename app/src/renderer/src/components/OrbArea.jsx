import { Orb } from '@/components/ui/ui/orb'
import LiveWaveform from './LiveWaveform'
import { useContainerSize } from '../hooks/useContainerSize'

const ORB_COLORS = ["#D8EAFF", "#AECBE8"]

export default function OrbArea({ orbState, status, lastPath, onPlay, playing, freqData, colorsRef, settingsRef }) {
  const [containerRef, { width, height }] = useContainerSize()

  const isGenerating  = orbState === 'talking'
  const activeOrbState = playing ? 'talking' : orbState

  const orbSize  = Math.min(
    height > 0 ? height * 0.55 : 220,
    width  > 0 ? width  * 0.62 : 220,
    300
  )
  const glowSize   = orbSize * 1.23
  const waveHeight = Math.max(40, Math.min(64, height * 0.12))

  return (
    <div ref={containerRef} className="flex-1 flex flex-col items-center justify-center gap-3 select-none min-h-0">

      {/* Orb + glow */}
      <div className="relative flex items-center justify-center">

        {/* Glow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: glowSize,
            height: glowSize,
            background: 'radial-gradient(circle, rgba(216,234,255,0.50) 0%, rgba(174,203,232,0.22) 50%, transparent 75%)',
            filter: `blur(${playing ? 32 : isGenerating ? 28 : 22}px)`,
            transform: `scale(${playing ? 1.14 : isGenerating ? 1.12 : 1})`,
            transition: 'filter 0.8s ease, transform 0.8s ease',
          }}
        />

        {/* Orb */}
        <div
          style={{
            width: orbSize,
            height: orbSize,
            opacity: playing ? 0.88 : isGenerating ? 0.84 : 0.78,
            filter: `drop-shadow(0 6px ${playing ? 36 : isGenerating ? 32 : 20}px rgba(174,203,232,${playing ? 0.45 : isGenerating ? 0.38 : 0.25}))`,
            transform: `scale(${playing ? 1.04 : isGenerating ? 1.06 : 1})`,
            transition: 'opacity 0.8s ease, filter 0.8s ease, transform 1s ease',
          }}
        >
          <Orb
            agentState={activeOrbState}
            colors={ORB_COLORS}
            colorsRef={colorsRef}
            settingsRef={settingsRef}
          />
        </div>
      </div>

      {/* Live waveform */}
      <div
        className="w-full px-6"
        style={{
          opacity: playing ? 1 : 0,
          transform: playing ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          pointerEvents: playing ? 'auto' : 'none',
        }}
      >
        <LiveWaveform freqData={freqData} height={waveHeight} />
      </div>

      {/* Status / actions */}
      <div className="flex flex-col items-center gap-2 min-h-[36px]">
        {status.state === 'loading' && (
          <span className="text-[10px] text-muted/60 tracking-widest uppercase animate-pulse">
            generating…
          </span>
        )}

        {status.state === 'success' && !playing && (
          <div className="flex gap-4">
            <button
              onClick={() => onPlay(lastPath)}
              className="text-[10px] text-ink/40 hover:text-ink tracking-widest uppercase transition-colors"
            >
              ▶ play
            </button>
            <button
              onClick={() => window.api.openOutput()}
              className="text-[10px] text-ink/40 hover:text-ink tracking-widest uppercase transition-colors"
            >
              folder ↗
            </button>
          </div>
        )}

        {status.state === 'success' && playing && (
          <button
            onClick={() => onPlay(null)}
            className="text-[10px] text-ink/40 hover:text-ink tracking-widest uppercase transition-colors"
          >
            ■ stop
          </button>
        )}

        {status.state === 'error' && (
          <span className="text-[10px] text-red-400/70 font-mono max-w-[280px] text-center leading-relaxed">
            {status.message}
          </span>
        )}
      </div>
    </div>
  )
}
