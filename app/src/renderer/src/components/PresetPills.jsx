export default function PresetPills({ presets, selected, onChange, onEdit, onNew }) {
  const keys = Object.keys(presets)

  return (
    <div className="flex gap-2 flex-shrink-0 flex-wrap items-center">
      {keys.map((key) => (
        <div key={key} className="relative group">
          <button
            onClick={() => onChange(key)}
            title={presets[key]?.description || key}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selected === key
                ? 'bg-ink text-white pr-6'
                : 'bg-border text-ink/60 hover:bg-ink/10 pr-6'
            }`}
          >
            {key}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(key) }}
            title="Edit preset"
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
              selected === key ? 'text-white/50 hover:text-white' : 'text-ink/25 hover:text-ink/60'
            }`}
          >
            <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 7.5L7.5 1M6 0.5L9.5 4L2.5 9.5H0.5V7.5L6 0.5Z" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={onNew}
        title="New preset"
        className="w-6 h-6 rounded-full bg-border text-ink/40 hover:bg-ink/10 hover:text-ink flex items-center justify-center text-sm leading-none transition-all"
      >
        +
      </button>
    </div>
  )
}
