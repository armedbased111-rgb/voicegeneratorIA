import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar'
import TextArea from './components/TextArea'
import PresetPills from './components/PresetPills'
import FilenameInput from './components/FilenameInput'
import GenerateButton from './components/GenerateButton'
import StatusBar from './components/StatusBar'
import HistoryPanel from './components/HistoryPanel'
import PresetEditor from './components/PresetEditor'

export default function App() {
  const [text, setText] = useState('')
  const [preset, setPreset] = useState('default')
  const [filename, setFilename] = useState('')
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [quota, setQuota] = useState(null)
  const [lastPath, setLastPath] = useState(null)
  const [presets, setPresets] = useState({})
  const [showHistory, setShowHistory] = useState(false)
  const [editingPreset, setEditingPreset] = useState(null) // null | preset key | '__new__'

  useEffect(() => {
    window.api.getQuota().then((res) => {
      if (res.ok) setQuota(res)
    })
    loadPresets()
  }, [])

  function loadPresets() {
    window.api.getPresets().then((res) => {
      if (res.ok) setPresets(res.presets)
    })
  }

  async function handleGenerate() {
    if (!text.trim()) return
    setStatus({ state: 'loading', message: 'generating...' })

    const res = await window.api.generate({
      text: text.trim(),
      preset,
      name: filename.trim() || undefined,
    })

    if (res.ok) {
      setStatus({ state: 'success', message: `saved → ${res.path}` })
      setLastPath(res.path)
      window.api.getQuota().then((q) => { if (q.ok) setQuota(q) })
    } else {
      const msg = res.error?.split('\n').pop()?.trim() || 'generation failed'
      setStatus({ state: 'error', message: msg })
    }
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

  return (
    <div className="flex flex-col h-screen bg-surface font-geist relative">
      <TitleBar showHistory={showHistory} onToggleHistory={() => setShowHistory(!showHistory)} />
      <div className="flex flex-col flex-1 px-5 pb-4 gap-3 overflow-hidden">
        {showHistory ? (
          <HistoryPanel />
        ) : (
          <>
            <TextArea value={text} onChange={setText} quota={quota} />
            <PresetPills
              presets={presets}
              selected={preset}
              onChange={setPreset}
              onEdit={(key) => setEditingPreset(key)}
              onNew={() => setEditingPreset('__new__')}
            />
            <FilenameInput value={filename} onChange={setFilename} />
            <GenerateButton
              onClick={handleGenerate}
              disabled={status.state === 'loading' || !text.trim()}
              loading={status.state === 'loading'}
            />
          </>
        )}
      </div>
      <StatusBar status={status} quota={quota} lastPath={lastPath} />

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
