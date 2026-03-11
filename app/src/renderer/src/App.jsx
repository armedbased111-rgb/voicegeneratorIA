import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar'
import OrbArea from './components/OrbArea'
import ChatInput from './components/ChatInput'
import PresetPills from './components/PresetPills'
import FilenameInput from './components/FilenameInput'
import HistoryPanel from './components/HistoryPanel'
import PresetEditor from './components/PresetEditor'
import { useAudioPlayer } from './hooks/useAudioPlayer'

export default function App() {
  const [text, setText] = useState('')
  const [preset, setPreset] = useState('default')
  const [filename, setFilename] = useState('')
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [quota, setQuota] = useState(null)
  const [lastPath, setLastPath] = useState(null)
  const [presets, setPresets] = useState({})
  const [showHistory, setShowHistory] = useState(false)
  const [editingPreset, setEditingPreset] = useState(null)

  const { play, stop, playing, freqData, volumeRef } = useAudioPlayer()

  useEffect(() => {
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
      play(res.path) // autoplay
    } else {
      const msg = res.error?.split('\n').pop()?.trim() || 'generation failed'
      setStatus({ state: 'error', message: msg })
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
    <div className="flex flex-col h-screen bg-[#F3F3F3] font-geist relative">
      <TitleBar showHistory={showHistory} onToggleHistory={() => setShowHistory(!showHistory)} />

      <div className="flex-1 flex flex-col overflow-hidden">
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
              volumeRef={volumeRef}
            />

            <div className="px-4 pb-4 flex flex-col gap-2">
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
