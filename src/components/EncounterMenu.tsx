import { useRef, useState } from 'react'
import { useStore } from '../store'
import { migratePersisted } from '../data/migrate'
import type { EncounterState } from '../types'

export default function EncounterMenu({
  onOpenLibrary,
}: {
  onOpenLibrary: () => void
}) {
  const state = useStore()
  const replace = useStore((s) => s.replaceState)
  const reset = useStore((s) => s.resetEncounter)
  const clearFired = useStore((s) => s.clearFiredTriggers)
  const [open, setOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportJson = () => {
    const {
      combatants,
      round,
      currentTurnIndex,
      triggers,
      strategyLabelNames,
      tables,
      timerSeconds,
    } = state
    const payload = {
      combatants,
      round,
      currentTurnIndex,
      triggers,
      strategyLabelNames,
      tables,
      timerSeconds,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `the-breaking-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const importJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const txt = await file.text()
      const data = JSON.parse(txt)
      if (!confirm('Replace the current encounter with imported data?')) return
      // Normalise through the same migration as persisted state so older files
      // (thresholds / oncePerTurn) and combatants missing the fired-trigger
      // arrays are brought up to the current schema.
      const norm = migratePersisted(data) as Record<string, unknown>
      const combatants = Array.isArray(norm.combatants) ? norm.combatants : []
      const rawIndex =
        typeof norm.currentTurnIndex === 'number' ? norm.currentTurnIndex : 0
      const triggers = Array.isArray(norm.triggers) ? norm.triggers : []
      const next: Partial<EncounterState> = {
        combatants: combatants as EncounterState['combatants'],
        round: typeof norm.round === 'number' ? norm.round : 1,
        // Clamp the turn index so an imported file can't point past the end.
        currentTurnIndex: Math.min(Math.max(0, rawIndex), Math.max(0, combatants.length - 1)),
        triggers: (triggers.length
          ? triggers
          : state.triggers) as EncounterState['triggers'],
        strategyLabelNames: Array.isArray(norm.strategyLabelNames)
          ? (norm.strategyLabelNames as string[])
          : ['Surrounded'],
        tables: (Array.isArray(norm.tables)
          ? norm.tables
          : state.tables) as EncounterState['tables'],
        timerSeconds: typeof norm.timerSeconds === 'number' ? norm.timerSeconds : 60,
        timerRemaining: typeof norm.timerSeconds === 'number' ? norm.timerSeconds : 60,
        timerRunning: false,
        triggerResults: [],
      }
      replace(next)
      setOpen(false)
    } catch (err) {
      alert('Import failed: ' + (err as Error).message)
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="btn">
        Encounter ▾
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-slate-900 border border-slate-700 rounded shadow-xl w-60 py-1">
            <button
              onClick={() => {
                onOpenLibrary()
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-800 text-sm"
            >
              Library — scenes & statblocks…
            </button>
            <div className="border-t border-slate-700 my-1" />
            <button
              onClick={() => {
                if (confirm('Start a new encounter? Combatants will be cleared; tables kept.')) {
                  reset()
                  setOpen(false)
                }
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-800 text-sm"
            >
              New encounter
            </button>
            <button
              onClick={() => {
                clearFired()
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-800 text-sm"
            >
              Reset injury triggers
            </button>
            <div className="border-t border-slate-700 my-1" />
            <button
              onClick={exportJson}
              className="w-full text-left px-3 py-2 hover:bg-slate-800 text-sm"
            >
              Export encounter JSON…
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full text-left px-3 py-2 hover:bg-slate-800 text-sm"
            >
              Import encounter JSON…
            </button>
          </div>
        </>
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={importJson}
      />
    </div>
  )
}
