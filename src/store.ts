import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Combatant, EncounterState, RollTable, RolledInjury } from './types'
import { buildDefaultEncounter } from './data/defaultState'
import { newId } from './utils/id'

type Actions = {
  addCombatant: (c: Partial<Combatant>) => void
  updateCombatant: (id: string, patch: Partial<Combatant>) => void
  removeCombatant: (id: string) => void
  applyDamage: (id: string, amount: number) => void
  applyHeal: (id: string, amount: number) => void
  nextTurn: () => void
  previousTurn: () => void
  toggleCondition: (id: string, conditionId: string) => void
  addStrategyLabel: (name: string) => void
  removeStrategyLabel: (name: string) => void
  setStrategyStack: (id: string, name: string, n: number) => void
  setTimerSeconds: (seconds: number) => void
  setTimerRunning: (running: boolean) => void
  tickTimer: () => void
  resetTimer: () => void
  setThresholds: (thresholds: number[]) => void
  replaceState: (state: Partial<EncounterState>) => void
  resetEncounter: () => void
  clearFiredThresholds: () => void
  addTable: (t: Omit<RollTable, 'id'>) => void
  updateTable: (id: string, patch: Partial<RollTable>) => void
  removeTable: (id: string) => void
  clearTrigger: () => void
  setTriggerRoll: (roll: RolledInjury | null) => void
}

export type Store = EncounterState & Actions

const sortByInit = (combatants: Combatant[]) =>
  [...combatants].sort((a, b) => b.initiative - a.initiative)

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...buildDefaultEncounter(),

      addCombatant: (c) =>
        set((s) => {
          const newCombatant: Combatant = {
            id: newId(),
            name: c.name ?? 'Unnamed',
            type: c.type ?? 'monster',
            maxHP: c.maxHP ?? 10,
            currentHP: c.currentHP ?? c.maxHP ?? 10,
            AC: c.AC ?? 10,
            passivePerception: c.passivePerception ?? 10,
            initiative: c.initiative ?? 10,
            conditions: [],
            strategyLabels: {},
            notes: '',
            nameVisibleToPlayers: c.nameVisibleToPlayers ?? (c.type === 'pc'),
            isDead: false,
            firedThresholds: [],
          }
          return { combatants: sortByInit([...s.combatants, newCombatant]) }
        }),

      updateCombatant: (id, patch) =>
        set((s) => ({
          combatants: sortByInit(
            s.combatants.map((c) => (c.id === id ? { ...c, ...patch } : c))
          ),
        })),

      removeCombatant: (id) =>
        set((s) => {
          const combatants = s.combatants.filter((c) => c.id !== id)
          const currentTurnIndex = Math.min(
            s.currentTurnIndex,
            Math.max(0, combatants.length - 1)
          )
          return { combatants, currentTurnIndex }
        }),

      applyDamage: (id, amount) => {
        if (amount <= 0) return
        const s = get()
        const c = s.combatants.find((x) => x.id === id)
        if (!c) return

        const pct = (amount / c.maxHP) * 100
        const thresholds = [...s.thresholds].sort((a, b) => b - a) // highest first
        let triggered: number | null = null
        for (const t of thresholds) {
          if (pct >= t && !c.firedThresholds.includes(t)) {
            triggered = t
            break
          }
        }

        set({
          combatants: s.combatants.map((x) =>
            x.id === id
              ? {
                  ...x,
                  currentHP: Math.max(0, x.currentHP - amount),
                  firedThresholds:
                    triggered != null
                      ? [...x.firedThresholds, triggered]
                      : x.firedThresholds,
                }
              : x
          ),
          lastTrigger:
            triggered != null
              ? {
                  combatantId: c.id,
                  combatantName: c.name,
                  threshold: triggered,
                  damage: amount,
                  pct,
                }
              : s.lastTrigger,
          triggerRoll: triggered != null ? null : s.triggerRoll,
        })
      },

      applyHeal: (id, amount) => {
        if (amount <= 0) return
        set((s) => ({
          combatants: s.combatants.map((c) =>
            c.id === id
              ? {
                  ...c,
                  currentHP: Math.min(c.maxHP, c.currentHP + amount),
                  isDead: c.currentHP + amount > 0 ? false : c.isDead,
                }
              : c
          ),
        }))
      },

      nextTurn: () =>
        set((s) => {
          if (s.combatants.length === 0) return s
          const next = (s.currentTurnIndex + 1) % s.combatants.length
          const round = next === 0 ? s.round + 1 : s.round
          return {
            currentTurnIndex: next,
            round,
            timerRemaining: s.timerSeconds,
            timerRunning: false,
          }
        }),

      previousTurn: () =>
        set((s) => {
          if (s.combatants.length === 0) return s
          const prev =
            s.currentTurnIndex === 0
              ? s.combatants.length - 1
              : s.currentTurnIndex - 1
          const round = s.currentTurnIndex === 0 ? Math.max(1, s.round - 1) : s.round
          return {
            currentTurnIndex: prev,
            round,
            timerRemaining: s.timerSeconds,
            timerRunning: false,
          }
        }),

      toggleCondition: (id, conditionId) =>
        set((s) => ({
          combatants: s.combatants.map((c) =>
            c.id === id
              ? {
                  ...c,
                  conditions: c.conditions.includes(conditionId)
                    ? c.conditions.filter((x) => x !== conditionId)
                    : [...c.conditions, conditionId],
                }
              : c
          ),
        })),

      addStrategyLabel: (name) =>
        set((s) =>
          s.strategyLabelNames.includes(name)
            ? s
            : { strategyLabelNames: [...s.strategyLabelNames, name] }
        ),

      removeStrategyLabel: (name) =>
        set((s) => ({
          strategyLabelNames: s.strategyLabelNames.filter((n) => n !== name),
          combatants: s.combatants.map((c) => {
            const labels = { ...c.strategyLabels }
            delete labels[name]
            return { ...c, strategyLabels: labels }
          }),
        })),

      setStrategyStack: (id, name, n) =>
        set((s) => ({
          combatants: s.combatants.map((c) => {
            if (c.id !== id) return c
            const labels = { ...c.strategyLabels }
            if (n <= 0) delete labels[name]
            else labels[name] = n
            return { ...c, strategyLabels: labels }
          }),
        })),

      setTimerSeconds: (seconds) =>
        set((s) => ({
          timerSeconds: seconds,
          timerRemaining: s.timerRunning ? s.timerRemaining : seconds,
        })),

      setTimerRunning: (running) => set({ timerRunning: running }),

      tickTimer: () =>
        set((s) => {
          if (!s.timerRunning) return s
          const remaining = s.timerRemaining - 1
          if (remaining <= 0) {
            if (s.combatants.length === 0) {
              return { timerRemaining: s.timerSeconds, timerRunning: false }
            }
            const next = (s.currentTurnIndex + 1) % s.combatants.length
            const round = next === 0 ? s.round + 1 : s.round
            return {
              currentTurnIndex: next,
              round,
              timerRemaining: s.timerSeconds,
              timerRunning: false,
            }
          }
          return { timerRemaining: remaining }
        }),

      resetTimer: () =>
        set((s) => ({ timerRemaining: s.timerSeconds, timerRunning: false })),

      setThresholds: (thresholds) =>
        set({ thresholds: [...thresholds].sort((a, b) => a - b) }),

      replaceState: (partial) => set(partial as Store),

      resetEncounter: () =>
        set((s) => {
          const fresh = buildDefaultEncounter()
          return {
            ...fresh,
            tables: s.tables,
            strategyLabelNames: s.strategyLabelNames,
            thresholds: s.thresholds,
            timerSeconds: s.timerSeconds,
            timerRemaining: s.timerSeconds,
          }
        }),

      clearFiredThresholds: () =>
        set((s) => ({
          combatants: s.combatants.map((c) => ({ ...c, firedThresholds: [] })),
        })),

      addTable: (t) =>
        set((s) => ({
          tables: [...s.tables, { ...t, id: newId() }],
        })),

      updateTable: (id, patch) =>
        set((s) => ({
          tables: s.tables.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      removeTable: (id) =>
        set((s) => ({ tables: s.tables.filter((t) => t.id !== id) })),

      clearTrigger: () => set({ lastTrigger: null, triggerRoll: null }),

      setTriggerRoll: (roll) => set({ triggerRoll: roll }),
    }),
    {
      name: 'the-breaking-encounter',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const {
          combatants,
          currentTurnIndex,
          round,
          timerSeconds,
          timerRemaining,
          timerRunning,
          thresholds,
          strategyLabelNames,
          tables,
        } = state
        return {
          combatants,
          currentTurnIndex,
          round,
          timerSeconds,
          timerRemaining,
          timerRunning,
          thresholds,
          strategyLabelNames,
          tables,
        } as unknown as EncounterState
      },
    }
  )
)

// ---------- Cross-window sync ----------
// DM panel and player popout run in separate windows of the same browser.
// We sync their state by broadcasting a snapshot after every store change
// and applying received snapshots locally. A `receiving` flag prevents loops.

type Snapshot = EncounterState

function snapshot(s: EncounterState): Snapshot {
  const {
    combatants,
    currentTurnIndex,
    round,
    timerSeconds,
    timerRemaining,
    timerRunning,
    thresholds,
    strategyLabelNames,
    tables,
    lastTrigger,
    triggerRoll,
  } = s
  return {
    combatants,
    currentTurnIndex,
    round,
    timerSeconds,
    timerRemaining,
    timerRunning,
    thresholds,
    strategyLabelNames,
    tables,
    lastTrigger,
    triggerRoll,
  }
}

if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  const channel = new BroadcastChannel('the-breaking-sync')
  let receiving = false
  let lastSerialized = JSON.stringify(snapshot(useStore.getState()))

  channel.onmessage = (event) => {
    const data = event.data
    if (!data || typeof data !== 'object') return
    if (data.type === 'state' && data.snapshot) {
      const incoming = JSON.stringify(data.snapshot)
      if (incoming === lastSerialized) return
      receiving = true
      lastSerialized = incoming
      useStore.setState(data.snapshot as Partial<Store>)
      receiving = false
    } else if (data.type === 'request') {
      channel.postMessage({
        type: 'state',
        snapshot: snapshot(useStore.getState()),
      })
    }
  }

  useStore.subscribe((state) => {
    if (receiving) return
    const snap = snapshot(state)
    const ser = JSON.stringify(snap)
    if (ser === lastSerialized) return
    lastSerialized = ser
    channel.postMessage({ type: 'state', snapshot: snap })
  })

  // Give popout windows a chance to announce themselves; either side calling
  // 'request' triggers the other to respond with its current snapshot.
  setTimeout(() => channel.postMessage({ type: 'request' }), 100)
}
