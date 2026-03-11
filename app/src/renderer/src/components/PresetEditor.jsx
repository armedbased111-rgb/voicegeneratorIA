import { useState, useEffect } from 'react'

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-muted/70 font-mono w-16 flex-shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-px accent-ink cursor-pointer"
      />
      <span className="text-[10px] font-mono text-ink/50 w-8 text-right tabular-nums">
        {value.toFixed(2)}
      </span>
    </div>
  )
}

export default function PresetEditor({ presetKey, presetData, onSave, onDelete, onClose }) {
  const isNew = !presetData
  const [name, setName] = useState(presetKey || '')
  const [voices, setVoices] = useState([])
  const [loadingVoices, setLoadingVoices] = useState(true)
  const [form, setForm] = useState({
    voice_id: presetData?.voice_id || '',
    stability: presetData?.stability ?? 0.40,
    similarity: presetData?.similarity ?? 0.05,
    style: presetData?.style ?? 0.0,
    speed: presetData?.speed ?? 1.0,
    description: presetData?.description || '',
  })

  useEffect(() => {
    window.api.listVoices().then((res) => {
      if (res.ok) setVoices(res.voices)
      setLoadingVoices(false)
    })
  }, [])

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  const canSave = name.trim() && form.voice_id

  return (
    <div
      className="flex flex-col z-50 px-5 py-4 gap-3"
      style={{ position: 'fixed', inset: 0, background: 'var(--bg)' }}
    >
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-medium text-ink/40 tracking-widest uppercase">
          {isNew ? 'New preset' : 'Edit preset'}
        </span>
        <button onClick={onClose} className="text-muted/50 hover:text-ink transition-colors text-base leading-none">
          ✕
        </button>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="preset name"
        readOnly={!isNew}
        className={`w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:border-ink/20 placeholder:text-muted/40 flex-shrink-0 ${
          !isNew ? 'opacity-50 cursor-default' : ''
        }`}
        spellCheck={false}
      />

      <div className="flex-shrink-0">
        <label className="text-[10px] text-muted/60 font-mono mb-1.5 block tracking-widest uppercase">voice</label>
        {loadingVoices ? (
          <div className="text-[10px] text-muted/40 font-mono py-1">loading…</div>
        ) : (
          <select
            value={form.voice_id}
            onChange={(e) => set('voice_id', e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:border-ink/20"
          >
            <option value="">— select voice —</option>
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.category})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-5 justify-center">
        <Slider label="stability" value={form.stability} min={0} max={1} step={0.01} onChange={(v) => set('stability', v)} />
        <Slider label="similarity" value={form.similarity} min={0} max={1} step={0.01} onChange={(v) => set('similarity', v)} />
        <Slider label="style"      value={form.style}      min={0} max={1} step={0.01} onChange={(v) => set('style', v)} />
        <Slider label="speed"      value={form.speed}      min={0.7} max={1.2} step={0.01} onChange={(v) => set('speed', v)} />
      </div>

      <input
        type="text"
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        placeholder="description (optional)"
        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-mono text-ink/60 focus:outline-none focus:border-ink/20 placeholder:text-muted/40 flex-shrink-0"
        spellCheck={false}
      />

      <div className="flex gap-2 flex-shrink-0">
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded-xl text-xs font-medium text-red-400 border border-red-200 hover:bg-red-50 transition-all"
          >
            delete
          </button>
        )}
        <button
          onClick={() => onSave(name.trim(), form)}
          disabled={!canSave}
          className="flex-1 bg-ink text-white text-xs font-medium py-2 rounded-xl transition-all disabled:opacity-30 hover:enabled:bg-ink/80"
        >
          save
        </button>
      </div>
    </div>
  )
}
