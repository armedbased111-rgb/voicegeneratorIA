import { useState, useEffect } from 'react'

function formatDate(ts) {
  try {
    const d = new Date(ts)
    return (
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) +
      ' ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    )
  } catch {
    return ts
  }
}

export default function HistoryPanel() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.getHistory().then((res) => {
      if (res.ok) setEntries(res.entries)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col flex-1 min-h-0 px-4 pt-2 pb-4">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <span className="text-[10px] font-medium text-ink/40 tracking-widest uppercase">
          Recent generations
        </span>
        <button
          onClick={() => window.api.openOutput()}
          className="text-[10px] text-muted/50 hover:text-ink/60 transition-colors font-mono"
        >
          open folder ↗
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5">
        {loading && (
          <div className="text-[10px] text-muted/40 font-mono py-8 text-center tracking-widest uppercase">
            loading…
          </div>
        )}
        {!loading && entries.length === 0 && (
          <div className="text-[10px] text-muted/40 font-mono py-8 text-center tracking-widest uppercase">
            no history yet
          </div>
        )}
        {entries.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2.5"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                {entry.preset && (
                  <span className="text-[9px] font-medium bg-ink/5 text-ink/40 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    {entry.preset}
                  </span>
                )}
                <span className="text-[9px] text-muted/50 font-mono">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
              <p className="text-[11px] text-ink/70 font-mono truncate leading-relaxed">{entry.text}</p>
            </div>
            {entry.file && (
              <button
                onClick={() => window.api.playFile(entry.file)}
                className="flex-shrink-0 w-6 h-6 rounded-full bg-ink/5 text-ink/40 flex items-center justify-center hover:bg-ink hover:text-white transition-all"
                title="Play"
              >
                <svg width="6" height="7" viewBox="0 0 8 9" fill="currentColor">
                  <path d="M0 0.5L8 4.5L0 8.5V0.5Z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
