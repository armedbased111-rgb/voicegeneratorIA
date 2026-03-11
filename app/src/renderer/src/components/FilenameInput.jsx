export default function FilenameInput({ value, onChange }) {
  return (
    <input
      type="text"
      className="flex-1 bg-transparent text-[10px] font-mono text-muted/60 focus:outline-none placeholder:text-muted/40 focus:text-ink/60 transition-colors"
      placeholder="filename (optional)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ userSelect: 'text' }}
      spellCheck={false}
    />
  )
}
