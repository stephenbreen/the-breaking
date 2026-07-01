import { useStore } from '../store'

export default function PlayerInjuryBanner() {
  const results = useStore((s) => s.triggerResults)
  const combatants = useStore((s) => s.combatants)

  // Players only see injury-type reveals. DM-facing events (combatant added,
  // plain notifications) stay on the DM panel and never spoil the table.
  const visible = results.filter(
    (r) => r.eventKind === 'massiveDamage' || r.eventKind === 'hpReachedZero'
  )
  if (visible.length === 0) return null

  const r = visible[visible.length - 1]

  // Re-key the banner so the entrance animation replays whenever a fresh
  // result appears (and again when its rolls land).
  const triggerKey = `${r.id}:${r.rolls.length}`

  const combatant = combatants.find((c) => c.id === r.combatantId)
  const displayName =
    combatant && !combatant.nameVisibleToPlayers
      ? '???'
      : combatant?.name ?? r.combatantName

  const severe = r.eventKind === 'hpReachedZero' || (r.percentThreshold ?? 0) >= 50
  const tone = severe
    ? {
        ring: 'border-red-500',
        bg: 'bg-red-950/95',
        accent: 'text-red-300',
        chip: 'bg-red-800 text-red-50',
        label: r.eventKind === 'hpReachedZero' ? 'DOWN' : 'GRIEVOUS WOUND',
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
              {r.eventKind === 'hpReachedZero' ? (
                <>dropped to <b>0 HP</b></>
              ) : (
                <>
                  took <b>{r.damage}</b> damage —{' '}
                  <span className={`px-2 py-0.5 rounded ${tone.chip} font-semibold`}>
                    {r.percentThreshold}%+ of max HP
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {r.rolls.length > 0 && (
          <div
            key={`${triggerKey}:rolls`}
            className="mt-4 rounded-lg bg-black/40 border border-white/10 p-4 space-y-3 animate-[injury-enter_0.4s_ease-out_both]"
          >
            {r.rolls.map((roll, i) => (
              <div key={i}>
                <div className={`text-xs uppercase tracking-widest ${tone.accent}`}>
                  {r.tableName}
                  {r.rolls.length > 1 ? ` — roll ${i + 1}` : ''} — rolled {r.dice} →{' '}
                  <span className="text-white font-bold text-sm">{roll.roll}</span>
                </div>
                <div className="text-xl font-semibold mt-1">
                  {roll.text ?? (
                    <em className="text-slate-400 text-base">No matching entry.</em>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
