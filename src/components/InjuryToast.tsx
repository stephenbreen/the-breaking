import { useStore } from '../store'
import type { TriggerResult } from '../types'

// Headline for the toast, by event kind.
function headline(r: TriggerResult): { title: string; detail: string } {
  const name = r.combatantName || 'A combatant'
  switch (r.eventKind) {
    case 'massiveDamage':
      return {
        title: `Massive damage — ${r.percentThreshold}% threshold`,
        detail:
          r.damage != null
            ? `${name} took ${r.damage} damage (${Math.round(r.pct ?? 0)}% of max HP).`
            : `${name} took massive damage.`,
      }
    case 'hpReachedZero':
      return { title: 'Down!', detail: `${name} dropped to 0 HP.` }
    case 'combatantAdded':
      return { title: r.triggerName, detail: `${name} joined the encounter.` }
  }
}

export default function InjuryToast() {
  const results = useStore((s) => s.triggerResults)
  const roll = useStore((s) => s.rollTriggerResult)
  const dismiss = useStore((s) => s.dismissTriggerResult)

  if (results.length === 0) return null

  // Show the most recent result; dismissing reveals the one behind it.
  const r = results[results.length - 1]
  const behind = results.length - 1
  const { title, detail } = headline(r)
  const isRollTable = r.tableId != null
  const rolled = r.rolls.length > 0

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[26rem] max-w-[95vw] bg-slate-900 border-2 border-amber-500 rounded-lg shadow-2xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-2xl" aria-hidden>
          ⚠️
        </span>
        <div className="flex-1">
          <div className="font-bold text-amber-300">{title}</div>
          <div className="text-sm text-slate-300 mt-1">{detail}</div>
          {isRollTable ? (
            r.tableName ? (
              <div className="text-xs text-slate-400 mt-1">
                Roll <b>{r.dice}</b> on "{r.tableName}"
                {r.rollsRequested > 1 ? <> <b>×{r.rollsRequested}</b></> : null}, or
                click Roll.
              </div>
            ) : (
              <div className="text-xs text-red-400 mt-1">
                This trigger's table was deleted — point it at another in Settings.
              </div>
            )
          ) : r.notifyText ? (
            <div className="text-sm text-amber-100 mt-2 italic">{r.notifyText}</div>
          ) : null}
        </div>
      </div>

      {rolled && (
        <div className="rounded p-2 bg-amber-950 border border-amber-700 text-sm space-y-1.5">
          {r.rolls.map((roll, i) => (
            <div key={i}>
              <div className="text-xs text-amber-400">
                {r.rolls.length > 1 ? `Roll ${i + 1} — ` : ''}
                {r.tableName}: rolled <b>{roll.roll}</b>
              </div>
              <div className="mt-0.5">
                {roll.text ?? <em className="text-slate-500">No matching entry.</em>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 justify-end">
        {behind > 0 && (
          <span className="text-[11px] text-slate-500 mr-auto">+{behind} more</span>
        )}
        {isRollTable && r.tableName && !rolled && (
          <button onClick={() => roll(r.id)} className="btn-primary">
            Roll {r.dice}
            {r.rollsRequested > 1 ? ` ×${r.rollsRequested}` : ''}
          </button>
        )}
        <button onClick={() => dismiss(r.id)} className="btn">
          Dismiss
        </button>
      </div>
    </div>
  )
}
