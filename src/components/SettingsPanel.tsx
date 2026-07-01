import { useState } from 'react'
import { useStore } from '../store'
import type { RollTable, Trigger, TriggerDedupe, TriggerEventKind } from '../types'

const EVENT_OPTIONS: { value: TriggerEventKind; label: string }[] = [
  { value: 'massiveDamage', label: 'Single hit ≥ % of max HP' },
  { value: 'hpReachedZero', label: 'Combatant drops to 0 HP' },
  { value: 'combatantAdded', label: 'Combatant is added' },
]

const SCOPE_OPTIONS: { value: Trigger['scope']; label: string }[] = [
  { value: 'any', label: 'All combatants' },
  { value: 'pc', label: 'PCs only' },
  { value: 'monster', label: 'Monsters / NPCs only' },
]

const DEDUPE_OPTIONS: { value: TriggerDedupe; label: string }[] = [
  { value: 'always', label: 'Every time' },
  { value: 'perTurn', label: 'Once per turn' },
  { value: 'perRound', label: 'Once per round' },
]

const DEDUPE_LABEL: Record<TriggerDedupe, string> = {
  always: 'every time',
  perTurn: 'once per turn',
  perRound: 'once per round',
}

function describe(t: Trigger, tables: RollTable[]): string {
  let when: string
  if (t.event.kind === 'massiveDamage')
    when = `a single hit deals ≥ ${t.event.percentOfMax}% of max HP`
  else if (t.event.kind === 'hpReachedZero') when = 'a combatant drops to 0 HP'
  else when = 'a combatant is added'

  const scope =
    t.scope === 'any' ? '' : ` (${t.scope === 'pc' ? 'PCs' : 'monsters'} only)`

  let then: string
  if (t.action.kind === 'rollTable') {
    const action = t.action
    const table = tables.find((x) => x.id === action.tableId)
    then = `roll ${table ? `"${table.name}"` : '(no table)'}${
      action.rolls > 1 ? ` ×${action.rolls}` : ''
    }`
  } else {
    then = 'show a note'
  }
  // Cadence only applies to per-combatant events.
  const cadence =
    t.event.kind === 'combatantAdded' || t.dedupe === 'always'
      ? ''
      : ` (${DEDUPE_LABEL[t.dedupe]})`
  return `When ${when}${scope} → ${then}${cadence}.`
}

export default function SettingsPanel() {
  const triggers = useStore((s) => s.triggers)
  const tables = useStore((s) => s.tables)
  const addTrigger = useStore((s) => s.addTrigger)
  const clearFired = useStore((s) => s.clearFiredTriggers)
  const labelNames = useStore((s) => s.strategyLabelNames)
  const addLabel = useStore((s) => s.addStrategyLabel)
  const removeLabel = useStore((s) => s.removeStrategyLabel)

  const [newLabel, setNewLabel] = useState('')

  const handleAddTrigger = () => {
    addTrigger({
      name: 'New trigger',
      enabled: true,
      scope: 'any',
      dedupe: 'perTurn',
      event: { kind: 'massiveDamage', percentOfMax: 25 },
      action: { kind: 'rollTable', tableId: tables[0]?.id ?? null, rolls: 1 },
    })
  }

  return (
    <div className="p-3 sm:p-4 space-y-6 h-full overflow-y-auto">
      <section>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold">Triggers</h3>
          <button onClick={handleAddTrigger} className="btn text-xs">
            + Add trigger
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Rules that fire when something happens in combat — "when EVENT → roll a
          table." The injury rule is two triggers: a single hit dealing ≥ 25 % of
          max HP rolls the injury table once; ≥ 50 % rolls the <em>same</em> table
          twice. When several massive-damage triggers match one hit, only the
          highest fires. <code>Once per turn</code> triggers fire at most once per
          combatant per turn and reset on every turn advance.
        </p>

        <div className="space-y-2">
          {triggers.length === 0 && (
            <div className="text-xs text-slate-500 italic">
              No triggers. Add one to start.
            </div>
          )}
          {triggers.map((t) => (
            <TriggerEditor key={t.id} trigger={t} tables={tables} />
          ))}
        </div>

        <button
          onClick={clearFired}
          className="btn mt-3 text-xs"
          title="Manually clear fired triggers (also resets on every turn advance)"
        >
          Reset fired triggers now
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

function TriggerEditor({ trigger: t, tables }: { trigger: Trigger; tables: RollTable[] }) {
  const update = useStore((s) => s.updateTrigger)
  const remove = useStore((s) => s.removeTrigger)

  const setEventKind = (kind: TriggerEventKind) => {
    if (kind === 'massiveDamage')
      update(t.id, { event: { kind, percentOfMax: 25 } })
    else update(t.id, { event: { kind } })
  }

  const setActionKind = (kind: 'rollTable' | 'notify') => {
    if (kind === 'rollTable')
      update(t.id, {
        action: { kind, tableId: tables[0]?.id ?? null, rolls: 1 },
      })
    else update(t.id, { action: { kind, text: '' } })
  }

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 ${
        t.enabled ? 'border-slate-700 bg-slate-900' : 'border-slate-800 bg-slate-900/40'
      }`}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={t.enabled}
          onChange={(e) => update(t.id, { enabled: e.target.checked })}
          title={t.enabled ? 'Enabled' : 'Disabled'}
        />
        <input
          value={t.name}
          onChange={(e) => update(t.id, { name: e.target.value })}
          className="input flex-1 font-semibold"
        />
        <button
          onClick={() => {
            if (confirm(`Delete trigger "${t.name}"?`)) remove(t.id)
          }}
          className="btn text-red-400"
          title="Delete trigger"
        >
          ×
        </button>
      </div>

      <div className="text-[11px] text-slate-400 italic">{describe(t, tables)}</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-slate-500">When</span>
          <select
            value={t.event.kind}
            onChange={(e) => setEventKind(e.target.value as TriggerEventKind)}
            className="input"
          >
            {EVENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {t.event.kind === 'massiveDamage' && (
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              Threshold %
            </span>
            <input
              type="number"
              min={1}
              max={100}
              value={t.event.percentOfMax}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                if (!isNaN(n) && n > 0 && n <= 100)
                  update(t.id, { event: { kind: 'massiveDamage', percentOfMax: n } })
              }}
              className="input w-24"
            />
          </label>
        )}

        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-slate-500">
            Applies to
          </span>
          <select
            value={t.scope}
            onChange={(e) => update(t.id, { scope: e.target.value as Trigger['scope'] })}
            className="input"
          >
            {SCOPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-slate-500">Then</span>
          <select
            value={t.action.kind}
            onChange={(e) => setActionKind(e.target.value as 'rollTable' | 'notify')}
            className="input"
          >
            <option value="rollTable">Roll a table</option>
            <option value="notify">Show a note</option>
          </select>
        </label>

        {t.action.kind === 'rollTable' ? (
          <>
            <label className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Table
              </span>
              <select
                value={t.action.tableId ?? ''}
                onChange={(e) =>
                  update(t.id, {
                    action: {
                      kind: 'rollTable',
                      tableId: e.target.value || null,
                      rolls: t.action.kind === 'rollTable' ? t.action.rolls : 1,
                    },
                  })
                }
                className="input"
              >
                <option value="">— none —</option>
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.id}>
                    {tbl.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Roll count
              </span>
              <input
                type="number"
                min={1}
                max={20}
                value={t.action.rolls}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10)
                  update(t.id, {
                    action: {
                      kind: 'rollTable',
                      tableId: t.action.kind === 'rollTable' ? t.action.tableId : null,
                      rolls: !isNaN(n) && n > 0 ? n : 1,
                    },
                  })
                }}
                className="input w-24"
              />
            </label>
          </>
        ) : (
          <label className="flex flex-col gap-0.5 sm:col-span-2">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              Note to show the DM
            </span>
            <input
              value={t.action.kind === 'notify' ? t.action.text : ''}
              onChange={(e) =>
                update(t.id, { action: { kind: 'notify', text: e.target.value } })
              }
              className="input"
              placeholder="e.g. Remind the player to make a CON save"
            />
          </label>
        )}
      </div>

      {t.event.kind !== 'combatantAdded' && (
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-[10px] uppercase tracking-wide text-slate-500">
            Fire at most
          </span>
          <select
            value={t.dedupe}
            onChange={(e) => update(t.id, { dedupe: e.target.value as TriggerDedupe })}
            className="input"
            title="How often this trigger may fire for the same combatant"
          >
            {DEDUPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="text-slate-500">per combatant</span>
        </label>
      )}
    </div>
  )
}
