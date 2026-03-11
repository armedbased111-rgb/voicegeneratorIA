import { useRef } from 'react'

export default function ChatInput({ value, onChange, onGenerate, loading, disabled }) {
  const textareaRef = useRef(null)

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.name.endsWith('.txt')) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsText(file)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && !loading) onGenerate()
    }
  }

  return (
    <div
      className="relative bg-surface border border-border rounded-xl overflow-hidden transition-colors focus-within:border-ink/20"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="enter text… ↵ generate  shift+↵ new line"
        className="w-full bg-transparent text-ink text-sm resize-none px-4 pt-3 pb-10 min-h-[88px] max-h-[160px] outline-none placeholder:text-muted/40 font-mono leading-relaxed"
        spellCheck={false}
      />
      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
        {value.length > 0 && (
          <span className="text-[10px] font-mono text-muted/50 tabular-nums">
            {value.length}
          </span>
        )}
        <button
          onClick={onGenerate}
          disabled={disabled || loading}
          className="flex items-center gap-1.5 bg-ink text-white text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-lg disabled:opacity-25 hover:enabled:bg-ink/80 transition-all"
        >
          {loading ? (
            <span className="inline-block w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          {loading ? 'gen…' : '▶ generate'}
        </button>
      </div>
    </div>
  )
}
