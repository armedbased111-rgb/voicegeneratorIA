import { useState } from 'react'

export default function ApiKeyModal({ onSaved }) {
  const [key, setKey]       = useState('')
  const [status, setStatus] = useState('idle') // idle | verifying | valid | error
  const [error, setError]   = useState('')
  const [info, setInfo]     = useState(null)   // { tier, remaining }

  async function handleSave() {
    const trimmed = key.trim()
    if (!trimmed) { setError('Please enter your API key'); return }
    if (!trimmed.startsWith('sk_')) { setError('ElevenLabs keys start with sk_'); return }

    setStatus('verifying')
    setError('')
    setInfo(null)

    const res = await window.api.verifyKey(trimmed)

    if (!res.ok) {
      setStatus('error')
      setError(res.error?.includes('401') || res.error?.includes('unauthorized')
        ? 'Invalid key — check your ElevenLabs account'
        : res.error || 'Could not verify key')
      return
    }

    setStatus('valid')
    setInfo({ tier: res.tier, remaining: res.remaining })

    await window.api.setApiKey(trimmed)
    setTimeout(() => onSaved(), 800)
  }

  const label =
    status === 'verifying' ? 'verifying…' :
    status === 'valid'     ? '✓ key valid — saving…' :
    'verify & save'

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
          onChange={e => { setKey(e.target.value); setError(''); setStatus('idle'); setInfo(null) }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="sk_••••••••••••••••••••••"
          className="w-full bg-[#F3F3F3] border border-[#E4E4E4] rounded-lg px-3 py-2 text-[11px] font-mono text-[#111] outline-none focus:border-[#AECBE8] transition-colors placeholder:text-[#C0C0C0]"
          autoFocus
          disabled={status === 'verifying' || status === 'valid'}
        />

        {error && (
          <span className="text-[10px] text-red-400/80">{error}</span>
        )}

        {info && (
          <span className="text-[10px] text-green-600/70 font-mono">
            plan: {info.tier} · {info.remaining.toLocaleString()} chars remaining
          </span>
        )}

        <button
          onClick={handleSave}
          disabled={status === 'verifying' || status === 'valid' || !key.trim()}
          className={`text-[#111] text-[10px] tracking-widest uppercase font-medium rounded-lg py-2 transition-colors disabled:opacity-40
            ${status === 'valid' ? 'bg-green-100' : 'bg-[#D8EAFF] hover:bg-[#AECBE8]'}`}
        >
          {label}
        </button>
      </div>
    </div>
  )
}
