import { useState } from 'react'
import { rollExpression } from '../utils/dice'
import type { RollResult } from '../utils/dice'

const DICE = [4, 6, 8, 10, 12, 20, 100]

export default function DiceRoller() {
  const [expr, setExpr] = useState('')
  const [history, setHistory] = useState<RollResult[]>([])

  const roll = (e: string) => {
    const r = rollExpression(e)
    if (r) setHistory((h) => [r, ...h].slice(0, 30))
  }

  return (
    <div className="p-3 sm:p-4 space-y-3 h-full overflow-y-auto">
      <div className="grid grid-cols-4 gap-2">
        {DICE.map((d) => (
          <button key={d} onClick={() => roll(`d${d}`)} className="btn">
            d{d}
          </button>
        ))}
        <button onClick={() => roll('2d6')} className="btn">
          2d6
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (expr.trim()) {
            roll(expr)
            setExpr('')
          }
        }}
        className="flex gap-2"
      >
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder="e.g. 2d6+3"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary">
          Roll
        </button>
      </form>
      <div className="space-y-1">
        {history.length === 0 && (
          <div className="text-xs text-app-subtle italic">No rolls yet.</div>
        )}
        {history.map((r, i) => (
          <div
            key={i}
            className={`rounded px-3 py-2 ${
              i === 0 ? 'bg-accent-soft/40 border border-accent' : 'bg-app-elev'
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs text-app-muted">{r.expression}</span>
              <span className="text-2xl font-bold">{r.total}</span>
            </div>
            <div className="text-xs text-app-subtle font-mono truncate">
              [{r.rolls.map((x) => x.value).join(', ')}]
              {r.modifier ? ` ${r.modifier >= 0 ? '+' : ''}${r.modifier}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
