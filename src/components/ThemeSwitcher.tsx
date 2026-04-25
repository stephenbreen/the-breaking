import { useState } from 'react'
import { useStore } from '../store'
import { THEMES } from '../types'

export default function ThemeSwitcher() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const [open, setOpen] = useState(false)

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn"
        title="Change theme"
        aria-label="Change theme"
      >
        🎨 <span className="hidden sm:inline">{current.label}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-app-surface border border-app-line-2 rounded shadow-xl w-64 py-1">
            {THEMES.map((t) => {
              const active = t.id === theme
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-app-elev ${
                    active ? 'bg-app-elev' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block w-4 h-4 rounded border border-app-line-2"
                      style={{ background: themeSwatch(t.id) }}
                    />
                    <span className="font-semibold text-app-fg">{t.label}</span>
                    {active && (
                      <span className="ml-auto text-accent-fg text-xs">●</span>
                    )}
                  </div>
                  <div className="text-xs text-app-muted mt-0.5">
                    {t.description}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function themeSwatch(id: string): string {
  switch (id) {
    case 'midnight':
      return 'linear-gradient(135deg, #020617 0%, #1e293b 100%)'
    case 'dusk':
      return 'linear-gradient(135deg, #334155 0%, #64748b 100%)'
    case 'parchment':
      return 'linear-gradient(135deg, #f5ecd9 0%, #d6c69e 100%)'
    default:
      return '#000'
  }
}
