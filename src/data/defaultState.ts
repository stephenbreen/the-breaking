import { newId } from '../utils/id'
import type { EncounterState, RollTable } from '../types'

export const buildDefaultTables = (): RollTable[] => [
  {
    id: newId(),
    name: 'Injury 25%',
    dice: 'd20',
    builtIn: 'injury25',
    entries: [
      { id: newId(), range: '1-5', text: 'Wind knocked out — lose your next reaction.' },
      { id: newId(), range: '6-12', text: 'Shallow wound — -1 to next attack roll this round.' },
      { id: newId(), range: '13-18', text: 'Bleeding — 1 damage at the start of each turn until healed.' },
      { id: newId(), range: '19-20', text: 'Ugly gash — disadvantage on next social check until long rest.' },
    ],
  },
  {
    id: newId(),
    name: 'Injury 50%',
    dice: 'd20',
    builtIn: 'injury50',
    entries: [
      { id: newId(), range: '1-4', text: 'Stunned until end of your next turn.' },
      { id: newId(), range: '5-10', text: 'Broken rib — disadvantage on STR checks until long rest.' },
      { id: newId(), range: '11-15', text: 'Concussion — disadvantage on CON saves until short rest.' },
      { id: newId(), range: '16-19', text: 'Maimed limb — speed halved until healed.' },
      { id: newId(), range: '20', text: 'Grievous wound — permanent scar; roll a Lingering Injury when you next long rest.' },
    ],
  },
]

export const buildDefaultEncounter = (): EncounterState => ({
  combatants: [],
  currentTurnIndex: 0,
  round: 1,
  timerSeconds: 60,
  timerRemaining: 60,
  timerRunning: false,
  thresholds: [25, 50],
  strategyLabelNames: ['Surrounded'],
  tables: buildDefaultTables(),
  lastTrigger: null,
  triggerRoll: null,
})
