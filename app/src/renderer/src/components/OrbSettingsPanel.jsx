import { useCallback } from 'react'
import { PALETTES } from '../hooks/useOrbSettings'

const PALETTE_LABELS = {
  'ice blue': 'Ice',
  'gold':     'Gold',
  'violet':   'Violet',
  'mono':     'Mono',
}

function Swatch({ name, active, onClick }) {
  const [c1, c2] = PALETTES[name]
  return (
    <button
      onClick={onClick}
      title={name}
      className="flex flex-col items-center gap-1.5 group"
    >
      <div
        className={`w-8 h-8 rounded-full transition-all duration-200 ${
          active ? 'ring-2 ring-offset-2 ring-ink/30 scale-110' : 'hover:scale-105'
        }`}
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      />
      <span className={`text-[8px] tracking-wider uppercase transition-colors ${
        active ? 'text-ink/60' : 'text-ink/25 group-hover:text-ink/40'
      }`}>
        {PALETTE_LABELS[name]}
      </span>
    </button>
  )
}

function Section({ label, children }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[8px] font-medium text-ink/25 tracking-[0.15em] uppercase">{label}</span>
      {children}
    </div>
  )
}

function SliderRow({ label, value, min, max, step, onChange, displayFn }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] text-ink/35 font-mono w-12 flex-shrink-0">{label}</span>
      <div className="flex-1 relative h-4 flex items-center">
        <div className="absolute inset-x-0 h-px bg-ink/10 rounded-full" />
        <div
          className="absolute left-0 h-px bg-ink/30 rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute w-3 h-3 rounded-full bg-white border border-ink/20 shadow-sm pointer-events-none transition-transform hover:scale-110"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <span className="text-[9px] font-mono text-ink/30 w-6 text-right tabular-nums">
        {displayFn ? displayFn(value) : value.toFixed(1)}
      </span>
    </div>
  )
}

export default function OrbSettingsPanel({ open, settings, onUpdate, onClose }) {
  const applyPalette = useCallback((name) => {
    const [c1, c2] = PALETTES[name]
    onUpdate({ palette: name, color1: c1, color2: c2 })
  }, [onUpdate])

  return (
    <>
      {/* Backdrop — click to close */}
      {open && (
        <div
          className="absolute inset-0 z-30 top-11"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className="absolute top-11 left-0 bottom-0 w-[210px] z-40 flex flex-col
                   bg-bg border-r border-border"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.32, 0, 0.12, 1)',
          pointerEvents: open ? 'auto' : 'none',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <span className="text-[10px] font-medium text-ink/50 tracking-widest uppercase">Orb</span>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full flex items-center justify-center text-ink/25 hover:text-ink/50 hover:bg-ink/5 transition-all text-[10px]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">

          {/* Palette */}
          <Section label="Palette">
            <div className="flex justify-between">
              {Object.keys(PALETTES).map(name => (
                <Swatch
                  key={name}
                  name={name}
                  active={settings.palette === name}
                  onClick={() => applyPalette(name)}
                />
              ))}
            </div>
          </Section>

          {/* Custom colors */}
          <Section label="Custom">
            <div className="flex flex-col gap-2.5">
              {[
                { key: 'color1', label: 'Primary' },
                { key: 'color2', label: 'Secondary' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[9px] text-ink/35 font-mono">{label}</span>
                  <label className="relative cursor-pointer group">
                    <div
                      className="w-7 h-7 rounded-full border border-border group-hover:border-ink/20 transition-colors shadow-sm"
                      style={{ background: settings[key] }}
                    />
                    <input
                      type="color"
                      value={settings[key]}
                      onChange={e => onUpdate({ [key]: e.target.value, palette: 'custom' })}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
              ))}
            </div>
          </Section>

          {/* Animation */}
          <Section label="Animation">
            <div className="flex flex-col gap-3">
              <SliderRow
                label="Speed"
                value={settings.speedMult}
                min={0.2} max={2.5} step={0.1}
                onChange={v => onUpdate({ speedMult: v })}
              />
              <SliderRow
                label="Energy"
                value={settings.intensity}
                min={0.1} max={2.0} step={0.1}
                onChange={v => onUpdate({ intensity: v })}
              />
            </div>
          </Section>

          {/* Reset */}
          <button
            onClick={() => onUpdate({ palette: 'ice blue', color1: '#D8EAFF', color2: '#AECBE8', speedMult: 1.0, intensity: 1.0 })}
            className="text-[8px] text-ink/20 hover:text-ink/40 tracking-widest uppercase transition-colors self-start"
          >
            reset defaults
          </button>

        </div>
      </div>
    </>
  )
}
