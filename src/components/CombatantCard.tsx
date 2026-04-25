import { useState } from 'react'
import { useStore } from '../store'
import type { Combatant } from '../types'
import { CONDITIONS } from '../data/conditions'
import { hpStatus, hpStatusColor } from '../utils/hpStatus'

export default function CombatantCard({
  c,
  isCurrent,
  expanded,
  onToggle,
}: {
  c: Combatant
  isCurrent: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const update = useStore((s) => s.updateCombatant)
  const remove = useStore((s) => s.removeCombatant)
  const damage = useStore((s) => s.applyDamage)
  const heal = useStore((s) => s.applyHeal)
  const toggleCondition = useStore((s) => s.toggleCondition)
  const labelNames = useStore((s) => s.strategyLabelNames)
  const setStrategyStack = useStore((s) => s.setStrategyStack)

  const [dmg, setDmg] = useState('')
  const [hl, setHl] = useState('')

  const pct = Math.max(0, Math.min(100, (c.currentHP / Math.max(1, c.maxHP)) * 100))
  const status = hpStatus(c)

  return (
    <div
      className={`mb-2 rounded-lg border transition-colors ${
        isCurrent
          ? 'border-indigo-400 bg-indigo-950/40 ring-2 ring-indigo-500/30'
          : 'border-slate-800 bg-slate-900'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-left hover:bg-white/5"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-slate-800 flex flex-col items-center justify-center text-xs shrink-0">
          <div className="text-slate-400 text-[9px] sm:text-[10px]">INIT</div>
          <div className="font-bold text-sm sm:text-base leading-none">{c.initiative}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold truncate">{c.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                c.type === 'pc' ? 'bg-emerald-900 text-emerald-200' : 'bg-red-900 text-red-200'
              }`}
            >
              {c.type === 'pc' ? 'PC' : 'NPC'}
            </span>
            {c.isDead && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                DEAD
              </span>
            )}
            {!c.nameVisibleToPlayers && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                title="Name is hidden from players (?)"
              >
                👁‍🗨 hidden
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-slate-800 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  pct > 50
                    ? 'bg-emerald-500'
                    : pct > 25
                    ? 'bg-amber-500'
                    : pct > 0
                    ? 'bg-red-500'
                    : 'bg-slate-700'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-mono whitespace-nowrap text-slate-200">
              {c.currentHP}/{c.maxHP}
            </span>
            <span className="text-[11px] text-slate-500 whitespace-nowrap">AC {c.AC}</span>
            <span className="hidden sm:inline text-[11px] text-slate-500 whitespace-nowrap">
              PP {c.passivePerception}
            </span>
          </div>
          {(c.conditions.length > 0 ||
            labelNames.some((n) => c.strategyLabels[n])) && (
            <div className="flex gap-1 flex-wrap mt-1.5">
              {c.conditions.map((cid) => {
                const def = CONDITIONS.find((x) => x.id === cid)
                if (!def) return null
                return (
                  <span
                    key={cid}
                    title={def.description}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200"
                  >
                    {def.name}
                  </span>
                )
              })}
              {labelNames.map((n) => {
                const count = c.strategyLabels[n]
                return count ? (
                  <span
                    key={n}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-100"
                  >
                    {n} {count}
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>
        <div className="text-slate-500 text-lg ml-1 shrink-0 self-center">
          {expanded ? '▾' : '▸'}
        </div>
      </button>

      {expanded && (
        <div className="px-2 sm:px-3 pb-3 pt-2 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 flex-1 min-w-0">
              <input
                type="number"
                placeholder="dmg"
                value={dmg}
                onChange={(e) => setDmg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const n = parseInt(dmg, 10)
                    if (n > 0) {
                      damage(c.id, n)
                      setDmg('')
                    }
                  }
                }}
                className="input w-16 sm:w-20"
              />
              <button
                onClick={() => {
                  const n = parseInt(dmg, 10)
                  if (n > 0) {
                    damage(c.id, n)
                    setDmg('')
                  }
                }}
                className="btn-danger"
              >
                Damage
              </button>
            </div>
            <div className="flex gap-1 flex-1 min-w-0">
              <input
                type="number"
                placeholder="heal"
                value={hl}
                onChange={(e) => setHl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const n = parseInt(hl, 10)
                    if (n > 0) {
                      heal(c.id, n)
                      setHl('')
                    }
                  }
                }}
                className="input w-16 sm:w-20"
              />
              <button
                onClick={() => {
                  const n = parseInt(hl, 10)
                  if (n > 0) {
                    heal(c.id, n)
                    setHl('')
                  }
                }}
                className="btn-primary"
              >
                Heal
              </button>
            </div>
            <span className="text-xs text-slate-400 ml-auto">
              Status{' '}
              <span className={`px-1.5 py-0.5 rounded ${hpStatusColor(status)} text-xs`}>
                {status}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                Initiative
              </span>
              <input
                type="number"
                value={c.initiative}
                onChange={(e) =>
                  update(c.id, { initiative: parseInt(e.target.value, 10) || 0 })
                }
                className="input"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                Max HP
              </span>
              <input
                type="number"
                value={c.maxHP}
                onChange={(e) =>
                  update(c.id, { maxHP: Math.max(1, parseInt(e.target.value, 10) || 1) })
                }
                className="input"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">AC</span>
              <input
                type="number"
                value={c.AC}
                onChange={(e) =>
                  update(c.id, { AC: parseInt(e.target.value, 10) || 0 })
                }
                className="input"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                Passive Perception
              </span>
              <input
                type="number"
                value={c.passivePerception}
                onChange={(e) =>
                  update(c.id, {
                    passivePerception: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="input"
              />
            </label>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">
              Conditions
            </div>
            <div className="flex flex-wrap gap-1">
              {CONDITIONS.map((cond) => {
                const active = c.conditions.includes(cond.id)
                return (
                  <button
                    key={cond.id}
                    title={cond.description}
                    onClick={() => toggleCondition(c.id, cond.id)}
                    className={`text-xs px-2 py-1 rounded transition ${
                      active
                        ? 'bg-purple-700 text-white hover:bg-purple-600'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {cond.name}
                  </button>
                )
              })}
            </div>
          </div>

          {labelNames.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">
                Strategy labels
              </div>
              <div className="flex flex-wrap gap-1">
                {labelNames.map((name) => {
                  const count = c.strategyLabels[name] ?? 0
                  return (
                    <div
                      key={name}
                      className={`flex items-center rounded overflow-hidden text-xs ${
                        count > 0
                          ? 'bg-amber-800 text-amber-50'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <button
                        onClick={() => setStrategyStack(c.id, name, count - 1)}
                        className="px-2 py-1 hover:bg-black/20"
                      >
                        −
                      </button>
                      <span className="px-2">
                        {name}
                        {count > 0 ? ` ${count}` : ''}
                      </span>
                      <button
                        onClick={() => setStrategyStack(c.id, name, count + 1)}
                        className="px-2 py-1 hover:bg-black/20"
                      >
                        +
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-wide text-slate-400 block mb-1">
              Notes
            </label>
            <textarea
              value={c.notes}
              onChange={(e) => update(c.id, { notes: e.target.value })}
              className="input w-full"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-800">
            <label className="flex items-center gap-1 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={c.nameVisibleToPlayers}
                onChange={(e) => update(c.id, { nameVisibleToPlayers: e.target.checked })}
              />
              Show name to players
            </label>
            <label className="flex items-center gap-1 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={c.isDead}
                onChange={(e) => update(c.id, { isDead: e.target.checked })}
              />
              Dead
            </label>
            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
              <input
                value={c.name}
                onChange={(e) => update(c.id, { name: e.target.value })}
                className="input flex-1 sm:w-40"
                title="Rename"
              />
              <button
                onClick={() => {
                  if (confirm(`Remove ${c.name} from the encounter?`)) remove(c.id)
                }}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
