export default function TitleBar({ showHistory, onToggleHistory, onSettings, onOrbSettings, showOrbSettings, dark, onToggleTheme }) {
  return (
    <div
      className="flex items-center justify-between px-4 h-11 flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <span
        onClick={onOrbSettings}
        style={{ WebkitAppRegion: 'no-drag' }}
        className={`text-[10px] font-medium tracking-widest uppercase cursor-pointer transition-colors ${
          showOrbSettings ? 'text-ink/70' : 'text-ink/30 hover:text-ink/60'
        }`}
        title="Orb settings"
      >
        VEIL
      </span>

      <div
        className="flex items-center gap-3"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button
          onClick={onToggleTheme}
          className="text-[10px] font-medium tracking-widest uppercase text-muted/50 hover:text-ink/60 transition-colors"
          title={dark ? 'Switch to light' : 'Switch to dark'}
        >
          {dark ? 'light' : 'dark'}
        </button>
        <button
          onClick={onSettings}
          className="text-[10px] font-medium tracking-widest uppercase text-muted/40 hover:text-ink/40 transition-colors"
          title="API Key settings"
        >
          key
        </button>
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
