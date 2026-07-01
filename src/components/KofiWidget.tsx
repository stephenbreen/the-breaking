import { useEffect } from 'react'

// Ko-fi "Buy me a coffee" floating widget. Rendered only from the DM view
// (App), never PlayerView, so the players' screen stays clean. The button is
// themed to the app's burgundy and lifted above the mobile bottom bar via CSS
// in index.css (targets Ko-fi's .floatingchat-container-wrap classes).

const KOFI_USERNAME = 'stephen91117'
const SCRIPT_SRC = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js'

declare global {
  interface Window {
    kofiWidgetOverlay?: {
      draw: (username: string, config: Record<string, string>) => void
    }
  }
}

// Draw at most once per page load (StrictMode runs effects twice in dev, and
// the widget appends a fixed button to <body> that we don't want duplicated).
let widgetDrawn = false

export default function KofiWidget() {
  useEffect(() => {
    const draw = () => {
      if (widgetDrawn || !window.kofiWidgetOverlay) return
      widgetDrawn = true
      window.kofiWidgetOverlay.draw(KOFI_USERNAME, {
        type: 'floating-chat',
        'floating-chat.donateButton.text': 'Buy me a coffee',
        'floating-chat.donateButton.background-color': '#7c1d1d',
        'floating-chat.donateButton.text-color': '#fdf6e3',
      })
    }

    if (window.kofiWidgetOverlay) {
      draw()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    )
    if (existing) {
      existing.addEventListener('load', draw)
      return () => existing.removeEventListener('load', draw)
    }

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.addEventListener('load', draw)
    document.body.appendChild(script)
  }, [])

  return null
}
