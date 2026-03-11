export default function GenerateButton({ onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex-shrink-0 bg-ink text-white text-sm font-medium py-3 rounded-lg transition-all disabled:opacity-40 hover:enabled:bg-ink/80 active:enabled:scale-[0.99]"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
          generating...
        </span>
      ) : (
        'generate'
      )}
    </button>
  )
}
