import type { PlayerClassId } from '../types'

export const PLAYER_CLASSES: { id: PlayerClassId; name: string }[] = [
  { id: 'none', name: 'Adventurer' },
  { id: 'barbarian', name: 'Barbarian' },
  { id: 'bard', name: 'Bard' },
  { id: 'cleric', name: 'Cleric' },
  { id: 'druid', name: 'Druid' },
  { id: 'fighter', name: 'Fighter' },
  { id: 'monk', name: 'Monk' },
  { id: 'paladin', name: 'Paladin' },
  { id: 'ranger', name: 'Ranger' },
  { id: 'rogue', name: 'Rogue' },
  { id: 'sorcerer', name: 'Sorcerer' },
  { id: 'warlock', name: 'Warlock' },
  { id: 'wizard', name: 'Wizard' },
]

export function classLabel(id: PlayerClassId | undefined): string {
  const found = PLAYER_CLASSES.find((c) => c.id === (id ?? 'none'))
  return found?.name ?? 'Adventurer'
}
