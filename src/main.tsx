import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import PlayerView from './PlayerView'

const params = new URLSearchParams(window.location.search)
const isPlayerView =
  params.get('view') === 'player' || window.location.hash === '#player'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isPlayerView ? <PlayerView /> : <App />}
  </React.StrictMode>
)
