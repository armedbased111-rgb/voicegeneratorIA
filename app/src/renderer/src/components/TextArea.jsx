export default function TextArea({ value, onChange, quota }) {
  const charCount = value.length
  const isNearLimit = quota && charCount > quota.remaining * 0.8
  const isOverLimit = quota && charCount > quota.remaining

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.name.endsWith('.txt')) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsText(file, 'utf-8')
  }

  return (
    <div className="flex-1 relative min-h-0">
      <textarea
        className="w-full h-full bg-white border border-border rounded-lg px-4 py-3 pb-6 font-mono text-sm text-ink resize-none focus:outline-none focus:ring-1 focus:ring-ink/20 placeholder:text-muted/50"
        placeholder="enter text… or drop a .txt file"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ userSelect: 'text' }}
        spellCheck={false}
      />
      {charCount > 0 && (
        <span
          className={`absolute bottom-2 right-3 text-[10px] font-mono tabular-nums pointer-events-none ${
            isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-500' : 'text-muted/40'
          }`}
        >
          {charCount.toLocaleString()}
          {quota ? ` / ${quota.remaining.toLocaleString()}` : ''}
        </span>
      )}
    </div>
  )
}
