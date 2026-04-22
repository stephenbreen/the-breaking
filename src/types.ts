export type CombatantType = 'pc' | 'monster'

export type Combatant = {
  id: string
  name: string
  type: CombatantType
  maxHP: number
  currentHP: number
  AC: number
  passivePerception: number
  initiative: number
  conditions: string[]
  strategyLabels: Record<string, number>
  notes: string
  nameVisibleToPlayers: boolean
  isDead: boolean
  firedThresholds: number[]
}

export type TableEntry = {
  id: string
  range: string
  text: string
}

export type RollTable = {
  id: string
  name: string
  dice: string
  entries: TableEntry[]
  builtIn?: 'injury25' | 'injury50'
}

export type TriggerInfo = {
  combatantId: string
  combatantName: string
  threshold: number
  damage: number
  pct: number
}

export type EncounterState = {
  combatants: Combatant[]
  currentTurnIndex: number
  round: number
  timerSeconds: number
  timerRemaining: number
  timerRunning: boolean
  thresholds: number[]
  strategyLabelNames: string[]
  tables: RollTable[]
  lastTrigger: TriggerInfo | null
}
