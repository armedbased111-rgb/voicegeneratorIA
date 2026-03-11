import { useState } from 'react'

export default function ApiKeyModal({ onSaved }) {
  const [key, setKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    const trimmed = key.trim()
    if (!trimmed) { setError('Please enter your API key'); return }
    if (!trimmed.startsWith('sk_')) { setError('ElevenLabs keys start with sk_'); return }
    setSaving(true)
    await window.api.setApiKey(trimmed)
    setSaving(false)
    onSaved()
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#F3F3F3]/80 backdrop-blur-sm">
      <div className="bg-white border border-[#E4E4E4] rounded-2xl p-6 w-[320px] flex flex-col gap-4 shadow-lg">

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-[#111] tracking-widest uppercase">ElevenLabs API Key</span>
          <span className="text-[10px] text-[#A0A0A0] leading-relaxed">
            Your key is saved locally and never leaves your device.
            Get it at elevenlabs.io → Profile → API Keys.
          </span>
        </div>

        <input
          type="password"
          value={key}
          onChange={e => { setKey(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="sk_••••••••••••••••••••••"
          className="w-full bg-[#F3F3F3] border border-[#E4E4E4] rounded-lg px-3 py-2 text-[11px] font-mono text-[#111] outline-none focus:border-[#AECBE8] transition-colors placeholder:text-[#C0C0C0]"
          autoFocus
        />

        {error && (
          <span className="text-[10px] text-red-400/80">{error}</span>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !key.trim()}
          className="bg-[#D8EAFF] hover:bg-[#AECBE8] disabled:opacity-40 text-[#111] text-[10px] tracking-widest uppercase font-medium rounded-lg py-2 transition-colors"
        >
          {saving ? 'saving…' : 'save key'}
        </button>
      </div>
    </div>
  )
}
