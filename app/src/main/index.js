import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { spawn } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'

// In dev:  PROJECT_ROOT = repo root
// In prod: static assets in process.resourcesPath, writable data in userData
const IS_WIN = process.platform === 'win32'
const DEV_ROOT = join(app.getAppPath(), '..')
const RES_ROOT = process.resourcesPath // only valid when packaged

const VOICE_PY    = app.isPackaged ? join(RES_ROOT, 'voice.py')    : join(DEV_ROOT, 'voice.py')
const PRESETS_JSON= app.isPackaged ? join(RES_ROOT, 'presets.json'): join(DEV_ROOT, 'presets.json')
const OUTPUT_DIR  = app.isPackaged ? join(app.getPath('userData'), 'output') : join(DEV_ROOT, 'output')
const HISTORY_LOG = app.isPackaged ? join(app.getPath('userData'), 'history.log') : join(DEV_ROOT, 'history.log')
const CWD         = app.isPackaged ? RES_ROOT : DEV_ROOT

const PYTHON = app.isPackaged
  ? join(RES_ROOT, '.venv', IS_WIN ? join('Scripts', 'python.exe') : join('bin', 'python3'))
  : join(DEV_ROOT, '.venv', IS_WIN ? join('Scripts', 'python.exe') : join('bin', 'python3'))

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 600,
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

function runPython(args) {
  return new Promise((resolve) => {
    const py = spawn(PYTHON, [VOICE_PY, ...args], {
      cwd: CWD,
      env: { ...process.env, OUTPUT_DIR },
    })

    let stdout = ''
    let stderr = ''

    py.stdout.on('data', (d) => (stdout += d.toString()))
    py.stderr.on('data', (d) => (stderr += d.toString()))

    py.on('close', (code) => resolve({ code, stdout, stderr }))
  })
}

// ── Generate ──────────────────────────────────────────────────────────────────

ipcMain.handle('generate', async (_, { text, preset, name }) => {
  const args = ['generate', text]
  if (preset) args.push('--preset', preset)
  if (name) args.push('--name', name)

  const { code, stdout, stderr } = await runPython(args)

  if (code !== 0) {
    return { ok: false, error: (stderr || stdout).trim() }
  }

  const match = stdout.match(/\[OK\]\s+(.+\.mp3)/)
  const path = match ? match[1].trim() : null
  return { ok: true, path }
})

// ── Quota ─────────────────────────────────────────────────────────────────────

ipcMain.handle('get-quota', async () => {
  const { code, stdout, stderr } = await runPython(['quota'])

  if (code !== 0) {
    return { ok: false, error: (stderr || stdout).trim() }
  }

  const usedMatch = stdout.match(/Utilisés\s*:\s*([\d,\s]+)\s*\/\s*([\d,\s]+)/)
  const remainMatch = stdout.match(/Restants\s*:\s*([\d,\s]+)/)
  const tierMatch = stdout.match(/Plan\s*:\s*(\S+)/)

  if (!usedMatch) return { ok: false, error: 'Failed to parse quota' }

  const parse = (s) => parseInt(s.replace(/[,\s]/g, ''))
  const used = parse(usedMatch[1])
  const limit = parse(usedMatch[2])
  const remaining = remainMatch ? parse(remainMatch[1]) : limit - used
  const tier = tierMatch ? tierMatch[1] : 'unknown'

  return { ok: true, used, limit, remaining, tier }
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
      const tsMatch = line.match(/^([^|]+)\|/)
      const voiceMatch = line.match(/voice=([^|]+)\|/)
      const presetMatch = line.match(/preset=([^|]+)\|/)
      const fileMatch = line.match(/file=([^|]+)\|/)
      const textMatch = line.match(/\| text=(.+)$/)
      return {
        timestamp: tsMatch ? tsMatch[1].trim() : '',
        voice: voiceMatch ? voiceMatch[1].trim() : '',
        preset: presetMatch ? presetMatch[1].trim() : null,
        file: fileMatch ? fileMatch[1].trim() : '',
        text: textMatch ? textMatch[1].trim() : '',
      }
    })
    return { ok: true, entries }
  } catch (e) {
    return { ok: true, entries: [] }
  }
})

// ── Voices ────────────────────────────────────────────────────────────────────

ipcMain.handle('list-voices', async () => {
  const { code, stdout } = await runPython(['list-voices'])
  if (code !== 0) return { ok: false, voices: [] }
  // voice.py outputs fixed-width columns: NOM(30) VOICE_ID(30) CATEGORIE
  const lines = stdout.trim().split('\n').slice(2).filter(Boolean)
  const voices = lines
    .map((line) => ({
      name: line.slice(0, 30).trim(),
      id: line.slice(30, 60).trim(),
      category: line.slice(60).trim(),
    }))
    .filter((v) => v.name && v.id)
  return { ok: true, voices }
})

// ── Output folder ─────────────────────────────────────────────────────────────

ipcMain.handle('open-output', async () => {
  const { mkdirSync } = await import('fs')
  mkdirSync(OUTPUT_DIR, { recursive: true })
  shell.openPath(OUTPUT_DIR)
  return { ok: true }
})

// ── Audio playback (cross-platform) ──────────────────────────────────────────

ipcMain.handle('play-file', async (_, filePath) => {
  // filePath may be absolute (packaged) or relative (dev)
  const absPath = filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath)
    ? filePath
    : join(CWD, filePath)
  if (process.platform === 'darwin') {
    spawn('afplay', [absPath], { detached: true }).unref()
  } else if (process.platform === 'win32') {
    shell.openPath(absPath) // opens with default media player
  } else {
    spawn('mpv', ['--no-video', absPath], { detached: true }).unref()
  }
  return { ok: true }
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
