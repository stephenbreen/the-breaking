import { useStore } from '../store'
import CombatantCard from './CombatantCard'
import type { FocusTarget } from '../App'

export default function InitiativeList({
  expandedId,
  setExpandedId,
  pendingFocus,
  clearPendingFocus,
}: {
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  pendingFocus: FocusTarget
  clearPendingFocus: () => void
}) {
  const combatants = useStore((s) => s.combatants)
  const currentIdx = useStore((s) => s.currentTurnIndex)

  if (combatants.length === 0) {
    return (
      <div className="text-app-subtle text-sm p-6 border border-dashed border-app-line-2 rounded text-center">
        No combatants yet. Click <b className="text-app-fg-2">+ Add</b> to start an encounter.
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
          pendingFocus={pendingFocus}
          clearPendingFocus={clearPendingFocus}
        />
      ))}
    </div>
  )
}
