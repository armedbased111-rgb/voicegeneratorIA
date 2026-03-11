function StatusDot({ state }) {
  const colors = {
    idle: 'bg-muted/40',
    loading: 'bg-yellow-400 animate-pulse',
    success: 'bg-green-400',
    error: 'bg-red-400',
  }
  return (
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors[state] || colors.idle}`} />
  )
}

export default function StatusBar({ status, quota, lastPath }) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-t border-border text-xs text-muted flex-shrink-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <StatusDot state={status.state} />
        <span className="truncate font-mono">{status.message || 'ready'}</span>
        {lastPath && status.state === 'success' && (
          <>
            <button
              onClick={() => window.api.playFile(lastPath)}
              className="flex-shrink-0 w-5 h-5 rounded-full bg-ink text-white flex items-center justify-center hover:bg-ink/70 transition-all"
              title="Play"
            >
              <svg width="8" height="9" viewBox="0 0 8 9" fill="currentColor">
                <path d="M0 0.5L8 4.5L0 8.5V0.5Z" />
              </svg>
            </button>
            <button
              onClick={() => window.api.openOutput()}
              className="flex-shrink-0 w-5 h-5 rounded-full bg-border text-ink/50 flex items-center justify-center hover:bg-ink/10 hover:text-ink transition-all"
              title="Open output folder"
            >
              <svg width="9" height="8" viewBox="0 0 10 9" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M0.5 8V3H3.5L4.5 1.5H9.5V8H0.5Z" />
              </svg>
            </button>
          </>
        )}
      </div>
      <span className="flex-shrink-0 ml-3 font-mono tabular-nums">
        {quota ? `${quota.remaining?.toLocaleString()} chars` : '—'}
      </span>
    </div>
  )
}
