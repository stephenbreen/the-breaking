import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import PlayerView from './PlayerView'
import { applyTheme, getStoredTheme } from './theme'

// Apply the saved theme before first paint to avoid a flash.
applyTheme(getStoredTheme())

const params = new URLSearchParams(window.location.search)
const isPlayerView =
  params.get('view') === 'player' || window.location.hash === '#player'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isPlayerView ? <PlayerView /> : <App />}
  </React.StrictMode>
)
