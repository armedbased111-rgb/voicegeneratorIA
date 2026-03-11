import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  generate: (params) => ipcRenderer.invoke('generate', params),
  getQuota: () => ipcRenderer.invoke('get-quota'),
  getPresets: () => ipcRenderer.invoke('get-presets'),
  savePreset: (name, preset) => ipcRenderer.invoke('save-preset', { name, preset }),
  deletePreset: (name) => ipcRenderer.invoke('delete-preset', name),
  getHistory: () => ipcRenderer.invoke('get-history'),
  listVoices: () => ipcRenderer.invoke('list-voices'),
  playFile: (path) => ipcRenderer.invoke('play-file', path),
  resolvePath: (path) => ipcRenderer.invoke('resolve-path', path),
  openOutput: () => ipcRenderer.invoke('open-output'),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (key) => ipcRenderer.invoke('set-api-key', key),
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
})
