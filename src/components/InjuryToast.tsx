import { useStore } from '../store'
import { rollExpression, matchTableEntry } from '../utils/dice'

export default function InjuryToast() {
  const trigger = useStore((s) => s.lastTrigger)
  const rolled = useStore((s) => s.triggerRoll)
  const setRoll = useStore((s) => s.setTriggerRoll)
  const clear = useStore((s) => s.clearTrigger)
  const tables = useStore((s) => s.tables)

  if (!trigger) return null

  const tableKey = trigger.threshold <= 25 ? 'injury25' : 'injury50'
  const table =
    tables.find((t) => t.builtIn === tableKey) ??
    tables.find((t) =>
      t.name.toLowerCase().includes(`injury ${trigger.threshold}`)
    )

  const doRoll = () => {
    if (!table) return
    const r = rollExpression(table.dice)
    if (!r) return
    const entry = matchTableEntry(table.entries, r.total)
    setRoll({
      tableName: table.name,
      diceExpression: table.dice,
      roll: r.total,
      text: entry?.text ?? null,
    })
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[26rem] max-w-[95vw] bg-slate-900 border-2 border-amber-500 rounded-lg shadow-2xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-2xl" aria-hidden>
          ⚠️
        </span>
        <div className="flex-1">
          <div className="font-bold text-amber-300">
            Massive damage — {trigger.threshold}% threshold
          </div>
          <div className="text-sm text-slate-300 mt-1">
            <b>{trigger.combatantName}</b> took {trigger.damage} damage (
            {Math.round(trigger.pct)}% of max HP).
          </div>
          {table ? (
            <div className="text-xs text-slate-400 mt-1">
              Have the player roll <b>{table.dice}</b> on "{table.name}", or click Roll.
            </div>
          ) : (
            <div className="text-xs text-red-400 mt-1">
              No injury table configured for {trigger.threshold}%.
            </div>
          )}
        </div>
      </div>
      {rolled && (
        <div className="rounded p-2 bg-amber-950 border border-amber-700 text-sm">
          <div className="text-xs text-amber-400">
            {rolled.tableName}: rolled <b>{rolled.roll}</b>
          </div>
          <div className="mt-1">
            {rolled.text ?? (
              <em className="text-slate-500">No matching entry.</em>
            )}
          </div>
        </div>
      )}
      <div className="flex gap-2 justify-end">
        {table && !rolled && (
          <button onClick={doRoll} className="btn-primary">
            Roll {table.dice}
          </button>
        )}
        <button onClick={clear} className="btn">
          Dismiss
        </button>
      </div>
    </div>
  )
}
