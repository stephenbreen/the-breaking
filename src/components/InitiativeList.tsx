import { useState } from 'react'
import { useStore } from '../store'
import CombatantCard from './CombatantCard'

export default function InitiativeList() {
  const combatants = useStore((s) => s.combatants)
  const currentIdx = useStore((s) => s.currentTurnIndex)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (combatants.length === 0) {
    return (
      <div className="text-slate-500 text-sm p-6 border border-dashed border-slate-700 rounded text-center">
        No combatants yet. Click <b className="text-slate-300">+ Add</b> to start an encounter.
      </div>
    )
  }

  return (
    <div>
      {combatants.map((c, i) => (
        <CombatantCard
          key={c.id}
          c={c}
          isCurrent={i === currentIdx}
          expanded={expandedId === c.id}
          onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
        />
      ))}
    </div>
  )
}
