import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar'
import OrbArea from './components/OrbArea'
import OrbSettingsPanel from './components/OrbSettingsPanel'
import ChatInput from './components/ChatInput'
import PresetPills from './components/PresetPills'
import FilenameInput from './components/FilenameInput'
import HistoryPanel from './components/HistoryPanel'
import PresetEditor from './components/PresetEditor'
import ApiKeyModal from './components/ApiKeyModal'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useOrbSettings } from './hooks/useOrbSettings'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const [text, setText]               = useState('')
  const [preset, setPreset]           = useState('default')
  const [filename, setFilename]       = useState('')
  const [status, setStatus]           = useState({ state: 'idle', message: '' })
  const [quota, setQuota]             = useState(null)
  const [lastPath, setLastPath]       = useState(null)
  const [presets, setPresets]         = useState({})
  const [showHistory, setShowHistory] = useState(false)
  const [editingPreset, setEditingPreset] = useState(null)
  const [showApiKey, setShowApiKey]   = useState(false)
  const [showOrbSettings, setShowOrbSettings] = useState(false)

  const { play, stop, playing, freqData } = useAudioPlayer()
  const { settings, update, colorsRef, settingsRef } = useOrbSettings()
  const { dark, toggle: toggleTheme } = useTheme()

  useEffect(() => {
    window.api.getApiKey().then((res) => { if (!res.hasKey) setShowApiKey(true) })
    window.api.getQuota().then((res) => { if (res.ok) setQuota(res) })
    loadPresets()
  }, [])

  function loadPresets() {
    window.api.getPresets().then((res) => { if (res.ok) setPresets(res.presets) })
  }

  async function handleGenerate() {
    if (!text.trim()) return
    stop()
    setStatus({ state: 'loading', message: '' })

    const res = await window.api.generate({
      text: text.trim(),
      preset,
      name: filename.trim() || undefined,
    })

    if (res.ok) {
      setStatus({ state: 'success', message: '' })
      setLastPath(res.path)
      window.api.getQuota().then((q) => { if (q.ok) setQuota(q) })
      play(res.path)
    } else {
      const msg = res.error?.split('\n').pop()?.trim() || 'generation failed'
      setStatus({ state: 'error', message: msg })
      if (res.error?.toLowerCase().includes('api_key') || res.error?.toLowerCase().includes('api key') || res.error?.toLowerCase().includes('unauthorized')) {
        setShowApiKey(true)
      }
    }
  }

  function handlePlay(path) {
    if (!path) { stop(); return }
    play(path)
  }

  async function handleSavePreset(name, presetData) {
    await window.api.savePreset(name, presetData)
    loadPresets()
    setEditingPreset(null)
  }

  async function handleDeletePreset(name) {
    await window.api.deletePreset(name)
    if (preset === name) setPreset(Object.keys(presets)[0] || 'default')
    loadPresets()
    setEditingPreset(null)
  }

  const orbState = status.state === 'loading' ? 'talking'
    : status.state === 'success' ? 'thinking'
    : null

  return (
    <div className="flex flex-col h-screen bg-bg font-geist relative overflow-hidden transition-colors duration-200">
      <TitleBar
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onSettings={() => setShowApiKey(true)}
        onOrbSettings={() => setShowOrbSettings(v => !v)}
        showOrbSettings={showOrbSettings}
        dark={dark}
        onToggleTheme={toggleTheme}
      />

      {/* Orb settings slide-in panel */}
      <OrbSettingsPanel
        open={showOrbSettings}
        settings={settings}
        onUpdate={update}
        onClose={() => setShowOrbSettings(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {showHistory ? (
          <HistoryPanel />
        ) : (
          <>
            <OrbArea
              orbState={orbState}
              status={status}
              lastPath={lastPath}
              onPlay={handlePlay}
              playing={playing}
              freqData={freqData}
              colorsRef={colorsRef}
              settingsRef={settingsRef}
            />

            <div className="px-4 pb-4 flex flex-col gap-2 w-full max-w-2xl mx-auto">
              <PresetPills
                presets={presets}
                selected={preset}
                onChange={setPreset}
                onEdit={(key) => setEditingPreset(key)}
                onNew={() => setEditingPreset('__new__')}
              />
              <ChatInput
                value={text}
                onChange={setText}
                onGenerate={handleGenerate}
                loading={status.state === 'loading'}
                disabled={status.state === 'loading' || !text.trim()}
              />
              <div className="flex items-center justify-between px-1">
                <FilenameInput value={filename} onChange={setFilename} />
                {quota && (
                  <span className="text-[10px] font-mono text-muted/50 tabular-nums flex-shrink-0">
                    {quota.remaining.toLocaleString()} ch.
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showApiKey && (
        <ApiKeyModal onSaved={() => {
          setShowApiKey(false)
          window.api.getQuota().then((res) => { if (res.ok) setQuota(res) })
        }} />
      )}

      {editingPreset !== null && (
        <PresetEditor
          presetKey={editingPreset === '__new__' ? '' : editingPreset}
          presetData={editingPreset === '__new__' ? null : presets[editingPreset]}
          onSave={handleSavePreset}
          onDelete={editingPreset !== '__new__' ? () => handleDeletePreset(editingPreset) : null}
          onClose={() => setEditingPreset(null)}
        />
      )}
    </div>
  )
}
