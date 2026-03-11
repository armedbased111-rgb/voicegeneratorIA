import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { spawn } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { ElevenLabsClient } from 'elevenlabs'

const CONFIG_JSON  = join(app.getPath('userData'), 'config.json')
const DEV_ROOT     = join(app.getAppPath(), '..')
const RES_ROOT     = process.resourcesPath
const PRESETS_JSON = app.isPackaged ? join(RES_ROOT, 'presets.json') : join(DEV_ROOT, 'presets.json')
const OUTPUT_DIR   = app.isPackaged ? join(app.getPath('userData'), 'output') : join(DEV_ROOT, 'output')
const HISTORY_LOG  = app.isPackaged ? join(app.getPath('userData'), 'history.log') : join(DEV_ROOT, 'history.log')

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 680,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: '#F3F3F3',
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function readConfig() {
  try { return JSON.parse(readFileSync(CONFIG_JSON, 'utf-8')) } catch { return {} }
}
function writeConfig(data) {
  mkdirSync(app.getPath('userData'), { recursive: true })
  writeFileSync(CONFIG_JSON, JSON.stringify(data, null, 2))
}

function getClient() {
  const cfg = readConfig()
  const apiKey = cfg.apiKey || process.env.ELEVENLABS_API_KEY || ''
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY manquante')
  return new ElevenLabsClient({ apiKey })
}

// ── Generate ──────────────────────────────────────────────────────────────────

ipcMain.handle('generate', async (_, { text, preset, name }) => {
  try {
    const client = getClient()

    let voiceId = 'JBFqnCBsd6RMkjVDRZzb', stability = 0.40, similarity = 0.05, style = 0.05, speed = 1.0
    if (preset) {
      try {
        const presets = JSON.parse(readFileSync(PRESETS_JSON, 'utf-8'))
        const p = presets[preset] || {}
        voiceId    = p.voice_id   || voiceId
        stability  = p.stability  ?? stability
        similarity = p.similarity ?? similarity
        style      = p.style      ?? style
        speed      = p.speed      ?? speed
      } catch { /* use defaults */ }
    }

    mkdirSync(OUTPUT_DIR, { recursive: true })
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 15)
    const slug = text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 30)
    const outputPath = join(OUTPUT_DIR, `${name || timestamp + '_' + slug}.mp3`)

    const audio = await client.textToSpeech.convert(voiceId, {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability, similarity_boost: similarity, style, use_speaker_boost: false, speed },
    })

    await pipeline(audio, createWriteStream(outputPath))

    const ts = new Date().toISOString()
    appendFileSync(HISTORY_LOG, `${ts} | voice=${voiceId} | preset=${preset || ''} | file=${outputPath} | text=${text}\n`)

    return { ok: true, path: outputPath }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// ── Quota ─────────────────────────────────────────────────────────────────────

ipcMain.handle('get-quota', async () => {
  try {
    const client = getClient()
    const user = await client.user.get()
    const sub = user.subscription
    const used = sub.character_count
    const limit = sub.character_limit
    return { ok: true, used, limit, remaining: limit - used, tier: sub.tier }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// ── Presets ───────────────────────────────────────────────────────────────────

ipcMain.handle('get-presets', async () => {
  try {
    const data = JSON.parse(readFileSync(PRESETS_JSON, 'utf-8'))
    return { ok: true, presets: data }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('save-preset', async (_, { name, preset }) => {
  try {
    const data = JSON.parse(readFileSync(PRESETS_JSON, 'utf-8'))
    data[name] = preset
    writeFileSync(PRESETS_JSON, JSON.stringify(data, null, 2))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('delete-preset', async (_, name) => {
  try {
    const data = JSON.parse(readFileSync(PRESETS_JSON, 'utf-8'))
    delete data[name]
    writeFileSync(PRESETS_JSON, JSON.stringify(data, null, 2))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// ── History ───────────────────────────────────────────────────────────────────

ipcMain.handle('get-history', async () => {
  try {
    if (!existsSync(HISTORY_LOG)) return { ok: true, entries: [] }
    const content = readFileSync(HISTORY_LOG, 'utf-8')
    const lines = content.trim().split('\n').filter(Boolean).reverse().slice(0, 50)
    const entries = lines.map((line) => {
      const tsMatch     = line.match(/^([^|]+)\|/)
      const voiceMatch  = line.match(/voice=([^|]+)\|/)
      const presetMatch = line.match(/preset=([^|]+)\|/)
      const fileMatch   = line.match(/file=([^|]+)\|/)
      const textMatch   = line.match(/\| text=(.+)$/)
      return {
        timestamp: tsMatch     ? tsMatch[1].trim()     : '',
        voice:     voiceMatch  ? voiceMatch[1].trim()  : '',
        preset:    presetMatch ? presetMatch[1].trim()  : null,
        file:      fileMatch   ? fileMatch[1].trim()   : '',
        text:      textMatch   ? textMatch[1].trim()   : '',
      }
    })
    return { ok: true, entries }
  } catch {
    return { ok: true, entries: [] }
  }
})

// ── Voices ────────────────────────────────────────────────────────────────────

ipcMain.handle('list-voices', async () => {
  try {
    const client = getClient()
    const { voices } = await client.voices.getAll()
    return { ok: true, voices: voices.map(v => ({ name: v.name, id: v.voiceId, category: v.category })) }
  } catch (e) {
    return { ok: false, voices: [], error: e.message }
  }
})

// ── Read file (for renderer-side Web Audio — bypasses file:// CORS in dev) ───

ipcMain.handle('read-file', (_, filePath) => {
  return readFileSync(filePath) // Buffer → serialized as Uint8Array to renderer
})

// ── Output folder ─────────────────────────────────────────────────────────────

ipcMain.handle('open-output', async () => {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  shell.openPath(OUTPUT_DIR)
  return { ok: true }
})

// ── Resolve absolute path (for renderer-side Web Audio playback) ─────────────

ipcMain.handle('resolve-path', (_, filePath) => {
  return filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath)
    ? filePath
    : join(OUTPUT_DIR, filePath)
})

// ── Audio playback (cross-platform) ──────────────────────────────────────────

ipcMain.handle('play-file', async (_, filePath) => {
  const absPath = filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath)
    ? filePath
    : join(OUTPUT_DIR, filePath)
  if (process.platform === 'darwin') {
    spawn('afplay', [absPath], { detached: true }).unref()
  } else if (process.platform === 'win32') {
    shell.openPath(absPath)
  } else {
    spawn('mpv', ['--no-video', absPath], { detached: true }).unref()
  }
  return { ok: true }
})

// ── API Key ───────────────────────────────────────────────────────────────────

ipcMain.handle('get-api-key', () => {
  const cfg = readConfig()
  return { ok: true, hasKey: !!(cfg.apiKey || process.env.ELEVENLABS_API_KEY) }
})

ipcMain.handle('set-api-key', (_, key) => {
  const cfg = readConfig()
  cfg.apiKey = key.trim()
  writeConfig(cfg)
  return { ok: true }
})

ipcMain.handle('verify-key', async (_, key) => {
  try {
    const client = new ElevenLabsClient({ apiKey: key.trim() })
    const user = await client.user.get()
    const sub = user.subscription
    return { ok: true, tier: sub.tier, remaining: sub.character_limit - sub.character_count }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// ── Window controls ───────────────────────────────────────────────────────────

ipcMain.on('window-minimize', () => {
  BrowserWindow.getFocusedWindow()?.minimize()
})

ipcMain.on('window-close', () => {
  BrowserWindow.getFocusedWindow()?.close()
})

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
