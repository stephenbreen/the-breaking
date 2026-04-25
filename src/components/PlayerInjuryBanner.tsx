import { useStore } from '../store'

export default function PlayerInjuryBanner() {
  const trigger = useStore((s) => s.lastTrigger)
  const rolled = useStore((s) => s.triggerRoll)
  const combatants = useStore((s) => s.combatants)

  if (!trigger) return null

  // Re-key the banner so the entrance animation replays whenever a fresh
  // trigger fires (different combatant / threshold / damage).
  const triggerKey = `${trigger.combatantId}:${trigger.threshold}:${trigger.damage}`

  const combatant = combatants.find((c) => c.id === trigger.combatantId)
  const displayName =
    combatant && !combatant.nameVisibleToPlayers
      ? '???'
      : combatant?.name ?? trigger.combatantName

  const tone =
    trigger.threshold >= 50
      ? {
          ring: 'border-red-500',
          bg: 'bg-red-950/95',
          accent: 'text-red-300',
          chip: 'bg-red-800 text-red-50',
          label: 'GRIEVOUS WOUND',
        }
      : {
          ring: 'border-amber-400',
          bg: 'bg-amber-950/95',
          accent: 'text-amber-200',
          chip: 'bg-amber-700 text-amber-50',
          label: 'INJURY',
        }

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none px-4 pt-6">
      <div
        key={triggerKey}
        className={`pointer-events-auto w-full max-w-3xl rounded-2xl border-4 ${tone.ring} ${tone.bg} shadow-2xl shadow-black/60 px-8 py-6 animate-[injury-enter_0.55s_ease-out_both,injury-shake_0.45s_ease-in-out_0.55s_2]`}
      >
        <div className="flex items-center gap-4">
          <span className="text-5xl drop-shadow" aria-hidden>
            ⚔️
          </span>
          <div className="flex-1 min-w-0">
            <div className={`text-xs uppercase tracking-[0.3em] ${tone.accent}`}>
              {tone.label}
            </div>
            <div className="text-4xl font-black leading-tight truncate">
              {displayName}
            </div>
            <div className="text-base text-slate-200 mt-1">
              took <b>{trigger.damage}</b> damage —{' '}
              <span className={`px-2 py-0.5 rounded ${tone.chip} font-semibold`}>
                {trigger.threshold}%+ of max HP
              </span>
            </div>
          </div>
        </div>

        {rolled && (
          <div
            key={`${triggerKey}:${rolled.roll}:${rolled.tableName}`}
            className="mt-4 rounded-lg bg-black/40 border border-white/10 p-4 animate-[injury-enter_0.4s_ease-out_both]"
          >
            <div className={`text-xs uppercase tracking-widest ${tone.accent}`}>
              {rolled.tableName} — rolled {rolled.diceExpression} →{' '}
              <span className="text-white font-bold text-sm">{rolled.roll}</span>
            </div>
            <div className="text-xl font-semibold mt-1">
              {rolled.text ?? (
                <em className="text-slate-400 text-base">No matching entry.</em>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
