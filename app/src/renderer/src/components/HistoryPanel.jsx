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
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <span className="text-[10px] font-medium text-ink/40 tracking-widest uppercase">
          Recent generations
        </span>
        <button
          onClick={() => window.api.openOutput()}
          className="text-[10px] text-muted/50 hover:text-ink/50 transition-colors font-mono"
        >
          open folder ↗
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5">
        {loading && (
          <div className="text-xs text-muted/50 font-mono py-6 text-center">loading…</div>
        )}
        {!loading && entries.length === 0 && (
          <div className="text-xs text-muted/50 font-mono py-6 text-center">no history yet</div>
        )}
        {entries.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                {entry.preset && (
                  <span className="text-[9px] font-medium bg-ink/10 text-ink/50 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    {entry.preset}
                  </span>
                )}
                <span className="text-[10px] text-muted/60 font-mono">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
              <p className="text-xs text-ink/70 font-mono truncate">{entry.text}</p>
            </div>
            {entry.file && (
              <button
                onClick={() => window.api.playFile(entry.file)}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-ink text-white flex items-center justify-center hover:bg-ink/70 transition-all"
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
