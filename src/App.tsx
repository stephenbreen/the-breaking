import { useCallback, useEffect, useState } from 'react'
import { useStore } from './store'
import Timer from './components/Timer'
import InitiativeList from './components/InitiativeList'
import DiceRoller from './components/DiceRoller'
import TablesPanel from './components/TablesPanel'
import InjuryToast from './components/InjuryToast'
import EncounterMenu from './components/EncounterMenu'
import SettingsPanel from './components/SettingsPanel'
import AddCombatantModal from './components/AddCombatantModal'
import ThemeSwitcher from './components/ThemeSwitcher'
import { useThemeAttribute } from './hooks/useThemeAttribute'

type Tab = 'initiative' | 'dice' | 'tables' | 'settings'
export type FocusTarget = 'heal' | 'damage' | null

export default function App() {
  const round = useStore((s) => s.round)
  const combatants = useStore((s) => s.combatants)
  const currentIdx = useStore((s) => s.currentTurnIndex)
  const nextTurn = useStore((s) => s.nextTurn)
  const previousTurn = useStore((s) => s.previousTurn)
  const [addOpen, setAddOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('initiative')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pendingFocus, setPendingFocus] = useState<FocusTarget>(null)

  useThemeAttribute()

  const current = combatants[currentIdx]

  const clearPendingFocus = useCallback(() => setPendingFocus(null), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          return
        }
      }
      if (combatants.length === 0) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        previousTurn()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextTurn()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const cur = combatants[currentIdx]
        if (!cur) return
        e.preventDefault()
        setTab('initiative')
        setExpandedId(cur.id)
        setPendingFocus(e.key === 'ArrowUp' ? 'heal' : 'damage')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [combatants, currentIdx, nextTurn, previousTurn])

  const openPlayerView = () => {
    const url = window.location.pathname + '?view=player'
    const win = window.open(
      url,
      'the-breaking-player',
      'width=1100,height=780,menubar=no,toolbar=no'
    )
    if (!win) {
      alert(
        'Popup blocked — allow popups for this page. Or open this URL manually in a second window:\n\n' +
          window.location.origin +
          url
      )
    }
  }

  // For desktop right panel, treat 'initiative' as defaulting to 'dice'.
  const sideTab: Exclude<Tab, 'initiative'> = tab === 'initiative' ? 'dice' : tab

  const renderPanel = (t: Exclude<Tab, 'initiative'>) => {
    if (t === 'dice') return <DiceRoller />
    if (t === 'tables') return <TablesPanel />
    return <SettingsPanel />
  }

  return (
    <div className="h-screen flex flex-col bg-app-bg text-app-fg">
      <header className="flex items-center gap-2 px-2 sm:px-4 py-2 border-b border-app-line bg-app-surface flex-wrap">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">
          ⚔ The Breaking
        </h1>
        <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-app-subtle px-1.5 py-0.5 border border-app-line-2 rounded">
          DM
        </span>
        <div className="flex-1 min-w-2" />
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-app-subtle leading-none">Round</div>
            <div className="text-lg sm:text-xl font-bold leading-tight">{round}</div>
          </div>
          {current && (
            <div className="text-left px-2 border-l border-app-line-2 max-w-[8rem] sm:max-w-none">
              <div className="text-[10px] uppercase tracking-widest text-app-subtle leading-none">On turn</div>
              <div className="text-sm font-semibold text-accent-fg leading-tight truncate">
                {current.name}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={previousTurn} className="btn" disabled={combatants.length === 0}>
            <span className="sm:hidden">◀</span>
            <span className="hidden sm:inline">◀ Prev</span>
          </button>
          <button onClick={nextTurn} className="btn-primary" disabled={combatants.length === 0}>
            <span className="sm:hidden">▶</span>
            <span className="hidden sm:inline">Next ▶</span>
          </button>
        </div>
        <Timer />
        <button
          onClick={openPlayerView}
          className="btn hidden sm:inline-flex"
          title="Open player view in a new window"
        >
          Player View ↗
        </button>
        <ThemeSwitcher />
        <EncounterMenu />
      </header>

      {/* Mobile tab bar */}
      <div className="sm:hidden flex border-b border-app-line bg-app-surface">
        {(['initiative', 'dice', 'tables', 'settings'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 capitalize text-xs font-medium transition ${
              tab === t
                ? 'bg-app-elev text-app-fg border-b-2 border-accent -mb-px'
                : 'text-app-muted hover:bg-app-surface'
            }`}
          >
            {t === 'initiative' ? 'Init' : t}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Initiative panel: always visible on desktop, only when tab='initiative' on mobile */}
        <div
          className={`flex-1 flex-col min-w-0 sm:border-r sm:border-app-line sm:flex ${
            tab === 'initiative' ? 'flex' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-app-line">
            <h2 className="text-base sm:text-lg font-semibold">Initiative</h2>
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              + Add<span className="hidden sm:inline"> Combatant</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            <InitiativeList
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              pendingFocus={pendingFocus}
              clearPendingFocus={clearPendingFocus}
            />
          </div>
        </div>

        {/* Right panel: fixed-width on desktop, full-width on mobile when a non-initiative tab is active */}
        <div
          className={`flex-1 sm:flex-none sm:w-[32rem] flex-col min-w-0 sm:flex ${
            tab !== 'initiative' ? 'flex' : 'hidden'
          }`}
        >
          {/* Desktop sub-tabs (dice/tables/settings) */}
          <div className="hidden sm:flex border-b border-app-line">
            {(['dice', 'tables', 'settings'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 capitalize text-sm font-medium transition ${
                  sideTab === t
                    ? 'bg-app-elev text-app-fg border-b-2 border-accent -mb-px'
                    : 'text-app-muted hover:bg-app-surface'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">{renderPanel(sideTab)}</div>
        </div>
      </div>

      <AddCombatantModal open={addOpen} onClose={() => setAddOpen(false)} />
      <InjuryToast />
    </div>
  )
}
