import { useState } from 'react'
import { useStore } from './store'
import Timer from './components/Timer'
import InitiativeList from './components/InitiativeList'
import DiceRoller from './components/DiceRoller'
import TablesPanel from './components/TablesPanel'
import InjuryToast from './components/InjuryToast'
import EncounterMenu from './components/EncounterMenu'
import SettingsPanel from './components/SettingsPanel'
import AddCombatantModal from './components/AddCombatantModal'

type Tab = 'dice' | 'tables' | 'settings'

export default function App() {
  const round = useStore((s) => s.round)
  const combatants = useStore((s) => s.combatants)
  const currentIdx = useStore((s) => s.currentTurnIndex)
  const nextTurn = useStore((s) => s.nextTurn)
  const previousTurn = useStore((s) => s.previousTurn)
  const [addOpen, setAddOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('dice')

  const current = combatants[currentIdx]

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

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-slate-800 bg-slate-900 flex-wrap">
        <h1 className="text-xl font-bold tracking-tight">
          ⚔ The Breaking
        </h1>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 px-1.5 py-0.5 border border-slate-700 rounded">
          DM
        </span>
        <div className="flex-1 min-w-4" />
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 leading-none">Round</div>
            <div className="text-xl font-bold leading-tight">{round}</div>
          </div>
          {current && (
            <div className="text-left px-2 border-l border-slate-700">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 leading-none">On turn</div>
              <div className="text-sm font-semibold text-indigo-300 leading-tight">
                {current.name}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={previousTurn} className="btn" disabled={combatants.length === 0}>
            ◀ Prev
          </button>
          <button onClick={nextTurn} className="btn-primary" disabled={combatants.length === 0}>
            Next ▶
          </button>
        </div>
        <Timer />
        <button onClick={openPlayerView} className="btn">
          Player View ↗
        </button>
        <EncounterMenu />
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold">Initiative</h2>
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              + Add Combatant
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <InitiativeList />
          </div>
        </div>

        <div className="w-[32rem] flex flex-col min-w-0">
          <div className="flex border-b border-slate-800">
            {(['dice', 'tables', 'settings'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 capitalize text-sm font-medium transition ${
                  tab === t
                    ? 'bg-slate-800 text-white border-b-2 border-indigo-400 -mb-px'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {tab === 'dice' && <DiceRoller />}
            {tab === 'tables' && <TablesPanel />}
            {tab === 'settings' && <SettingsPanel />}
          </div>
        </div>
      </div>

      <AddCombatantModal open={addOpen} onClose={() => setAddOpen(false)} />
      <InjuryToast />
    </div>
  )
}
