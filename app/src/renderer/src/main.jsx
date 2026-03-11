import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MiniApp from './MiniApp'
import './index.css'

// Apply saved theme before React mounts to avoid flash
const savedTheme = localStorage.getItem('veil:theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  document.documentElement.classList.add('dark')
}

const isMini = window.location.hash === '#mini'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isMini ? <MiniApp /> : <App />}
  </React.StrictMode>
)
