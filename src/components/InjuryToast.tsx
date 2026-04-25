import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { rollExpression, matchTableEntry } from '../utils/dice'

type Rolled = { roll: number; text: string | null; tableName: string }

export default function InjuryToast() {
  const trigger = useStore((s) => s.lastTrigger)
  const clear = useStore((s) => s.clearTrigger)
  const tables = useStore((s) => s.tables)
  const [rolled, setRolled] = useState<Rolled | null>(null)

  useEffect(() => {
    setRolled(null)
  }, [trigger])

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
    setRolled({ roll: r.total, text: entry?.text ?? null, tableName: table.name })
  }

  const dismiss = () => {
    setRolled(null)
    clear()
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[26rem] max-w-[95vw] bg-app-surface border-2 border-warn rounded-lg shadow-2xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-2xl" aria-hidden>
          ⚠️
        </span>
        <div className="flex-1">
          <div className="font-bold text-warn-fg">
            Massive damage — {trigger.threshold}% threshold
          </div>
          <div className="text-sm text-app-fg-2 mt-1">
            <b>{trigger.combatantName}</b> took {trigger.damage} damage (
            {Math.round(trigger.pct)}% of max HP).
          </div>
          {table ? (
            <div className="text-xs text-app-muted mt-1">
              Have the player roll <b>{table.dice}</b> on "{table.name}", or click Roll.
            </div>
          ) : (
            <div className="text-xs text-danger mt-1">
              No injury table configured for {trigger.threshold}%.
            </div>
          )}
        </div>
      </div>
      {rolled && (
        <div className="rounded p-2 bg-warn-soft border border-warn text-sm">
          <div className="text-xs text-warn-fg">
            {rolled.tableName}: rolled <b>{rolled.roll}</b>
          </div>
          <div className="mt-1">
            {rolled.text ?? (
              <em className="text-app-subtle">No matching entry.</em>
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
        <button onClick={dismiss} className="btn">
          Dismiss
        </button>
      </div>
    </div>
  )
}
