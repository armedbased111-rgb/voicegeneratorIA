export default function TitleBar({ showHistory, onToggleHistory }) {
  return (
    <div
      className="flex items-center justify-between px-4 h-11 flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <span className="text-[10px] font-medium text-ink/30 tracking-widest uppercase">
        VEIL
      </span>
      <div
        className="flex items-center gap-3"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button
          onClick={onToggleHistory}
          className={`text-[10px] font-medium tracking-widest uppercase transition-colors ${
            showHistory ? 'text-ink/70' : 'text-muted/40 hover:text-ink/40'
          }`}
          title="Toggle history"
        >
          history
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={() => window.api.minimize()}
            className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-90 transition-all"
            title="Minimize"
          />
          <button
            onClick={() => window.api.close()}
            className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all"
            title="Close"
          />
        </div>
      </div>
    </div>
  )
}
