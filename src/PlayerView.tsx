import { useStore } from './store'
import { CONDITIONS } from './data/conditions'
import { hpStatus, hpStatusColor } from './utils/hpStatus'
import Hourglass from './components/Hourglass'
import { useThemeAttribute } from './hooks/useThemeAttribute'

export default function PlayerView() {
  const combatants = useStore((s) => s.combatants)
  const currentIdx = useStore((s) => s.currentTurnIndex)
  const round = useStore((s) => s.round)
  const timerRemaining = useStore((s) => s.timerRemaining)
  const timerSeconds = useStore((s) => s.timerSeconds)
  const timerRunning = useStore((s) => s.timerRunning)
  const labelNames = useStore((s) => s.strategyLabelNames)

  useThemeAttribute()

  const danger = timerRemaining <= 10 && timerRunning

  return (
    <div className="min-h-screen bg-app-bg text-app-fg">
      <header className="flex items-center gap-6 px-8 py-4 border-b border-app-line bg-app-surface sticky top-0 z-10">
        <h1 className="text-3xl font-bold tracking-tight">⚔ The Breaking</h1>
        <div className="flex-1" />
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-app-muted">Round</div>
          <div className="text-6xl font-bold leading-none tabular-nums">{round}</div>
        </div>
        <div
          className={`flex items-center gap-5 rounded-lg px-6 py-3 transition-colors ${
            danger ? 'bg-npc-soft/60 animate-pulse' : 'bg-app-elev'
          }`}
        >
          <Hourglass
            remaining={timerRemaining}
            total={timerSeconds}
            danger={danger}
            running={timerRunning}
            size={140}
          />
          <div className="text-left">
            <div className="text-xs uppercase tracking-widest text-app-fg-2">
              Turn Timer
            </div>
            <div
              className={`font-mono font-black leading-none tabular-nums ${
                danger ? 'text-npc-fg' : 'text-app-fg'
              }`}
              style={{ fontSize: '7rem' }}
            >
              {timerRemaining}
              <span className="text-4xl text-app-muted font-normal ml-1">s</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        {combatants.length === 0 ? (
          <div className="text-center text-app-subtle text-xl py-24">
            Waiting for the DM…
          </div>
        ) : (
          <div className="space-y-2 max-w-5xl mx-auto">
            {combatants.map((c, i) => {
              const isCurrent = i === currentIdx
              const name = c.nameVisibleToPlayers ? c.name : '???'
              const status = hpStatus(c)
              return (
                <div
                  key={c.id}
                  className={`rounded-lg p-4 flex items-center gap-4 transition-all ${
                    isCurrent
                      ? 'bg-accent-soft/60 border-2 border-accent shadow-lg shadow-accent/20 scale-[1.01]'
                      : 'bg-app-surface border border-app-line'
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded flex flex-col items-center justify-center shrink-0 ${
                      isCurrent ? 'bg-accent-soft' : 'bg-app-elev'
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wide text-app-muted">INIT</div>
                    <div className="text-2xl font-bold leading-none">{c.initiative}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-2xl font-bold truncate">{name}</span>
                      <span
                        className={`text-sm font-semibold px-2 py-0.5 rounded ${hpStatusColor(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.conditions.map((cid) => {
                        const def = CONDITIONS.find((x) => x.id === cid)
                        return def ? (
                          <span
                            key={cid}
                            title={def.description}
                            className="text-xs px-2 py-1 rounded bg-condition-soft text-condition-fg"
                          >
                            {def.name}
                          </span>
                        ) : null
                      })}
                      {labelNames.map((n) => {
                        const count = c.strategyLabels[n]
                        return count && count > 0 ? (
                          <span
                            key={n}
                            className="text-xs px-2 py-1 rounded bg-strategy-solid text-white"
                          >
                            {n} {count}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                  {isCurrent && (
                    <div className="text-accent-fg text-lg font-bold whitespace-nowrap">
                      ◀ ACTIVE
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
