export default function FilenameInput({ value, onChange }) {
  return (
    <input
      type="text"
      className="w-full bg-white border border-border rounded-md px-3 py-1.5 text-xs font-mono text-ink/70 focus:outline-none focus:ring-1 focus:ring-ink/20 placeholder:text-muted/40 flex-shrink-0"
      placeholder="filename (optional)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ userSelect: 'text' }}
      spellCheck={false}
    />
  )
}
