import { useEffect, useState } from 'react'
import { useStore } from '../store'

export default function SettingsPanel() {
  const thresholds = useStore((s) => s.thresholds)
  const setThresholds = useStore((s) => s.setThresholds)
  const labelNames = useStore((s) => s.strategyLabelNames)
  const addLabel = useStore((s) => s.addStrategyLabel)
  const removeLabel = useStore((s) => s.removeStrategyLabel)
  const clearFired = useStore((s) => s.clearFiredThresholds)

  const [t1, setT1] = useState(String(thresholds[0] ?? 25))
  const [t2, setT2] = useState(String(thresholds[1] ?? 50))
  const [newLabel, setNewLabel] = useState('')

  useEffect(() => {
    setT1(String(thresholds[0] ?? 25))
    setT2(String(thresholds[1] ?? 50))
  }, [thresholds])

  const commitThresholds = () => {
    const nums = [t1, t2]
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n) && n > 0 && n < 100)
    if (nums.length > 0) setThresholds(nums)
  }

  return (
    <div className="p-4 space-y-6">
      <section>
        <h3 className="font-semibold mb-1">Massive damage thresholds</h3>
        <p className="text-xs text-slate-400 mb-2">
          A single hit dealing this percentage of max HP triggers the matching
          injury table. When multiple thresholds apply, only the highest fires.
          Each threshold fires at most once per combatant per encounter.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={t1}
            onChange={(e) => setT1(e.target.value)}
            onBlur={commitThresholds}
            className="input w-20"
          />
          <span className="text-slate-400">%</span>
          <input
            type="number"
            value={t2}
            onChange={(e) => setT2(e.target.value)}
            onBlur={commitThresholds}
            className="input w-20"
          />
          <span className="text-slate-400">%</span>
        </div>
        <button onClick={clearFired} className="btn mt-2 text-xs">
          Reset triggers for this encounter
        </button>
      </section>

      <section>
        <h3 className="font-semibold mb-1">Strategy labels</h3>
        <p className="text-xs text-slate-400 mb-2">
          Stackable tactical labels the DM applies to combatants (e.g., Surrounded 1/2/3).
          Visible to players.
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {labelNames.length === 0 && (
            <div className="text-xs text-slate-500 italic">No labels defined.</div>
          )}
          {labelNames.map((n) => (
            <div
              key={n}
              className="flex items-center bg-slate-800 rounded overflow-hidden text-sm"
            >
              <span className="px-2 py-1">{n}</span>
              <button
                onClick={() => {
                  if (confirm(`Remove "${n}" label and clear it from all combatants?`))
                    removeLabel(n)
                }}
                className="px-2 py-1 hover:bg-red-900 text-red-400"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const v = newLabel.trim()
            if (v) {
              addLabel(v)
              setNewLabel('')
            }
          }}
          className="flex gap-2"
        >
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="e.g. Flanked"
            className="input flex-1"
          />
          <button type="submit" className="btn">
            Add
          </button>
        </form>
      </section>

      <section className="text-xs text-slate-500 pt-4 border-t border-slate-800">
        <div>💾 State auto-saves to this browser's localStorage.</div>
        <div>🔗 Player view syncs via BroadcastChannel.</div>
      </section>
    </div>
  )
}
