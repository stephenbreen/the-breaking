import type { Combatant } from '../types'

export type HpStatus = 'Healthy' | 'Hurt' | 'Bloodied' | 'Dire' | 'Dying' | 'Dead'

export function hpStatus(c: Combatant): HpStatus {
  if (c.isDead) return 'Dead'
  if (c.currentHP <= 0) return 'Dying'
  if (c.maxHP <= 0) return 'Hurt'
  const pct = (c.currentHP / c.maxHP) * 100
  if (pct >= 100) return 'Healthy'
  if (pct > 50) return 'Hurt'
  if (pct > 25) return 'Bloodied'
  return 'Dire'
}

export function hpStatusColor(s: HpStatus): string {
  switch (s) {
    case 'Healthy':
      return 'bg-emerald-500 text-emerald-950'
    case 'Hurt':
      return 'bg-lime-500 text-lime-950'
    case 'Bloodied':
      return 'bg-amber-500 text-amber-950'
    case 'Dire':
      return 'bg-orange-600 text-orange-50'
    case 'Dying':
      return 'bg-red-600 text-red-50'
    case 'Dead':
      return 'bg-slate-700 text-slate-300 line-through'
  }
}
