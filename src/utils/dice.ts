export type RollResult = {
  expression: string
  total: number
  rolls: { die: number; value: number }[]
  modifier: number
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

// Parses things like "d20", "2d6+3", "1d20-1", "3d4+2d6+1"
export function rollExpression(expr: string): RollResult | null {
  const cleaned = expr.replace(/\s+/g, '').toLowerCase()
  if (!cleaned) return null
  const re = /([+-]?)(\d*)d(\d+)|([+-]?\d+)/g
  const rolls: { die: number; value: number }[] = []
  let modifier = 0
  let matched = false
  let m: RegExpExecArray | null
  while ((m = re.exec(cleaned))) {
    matched = true
    if (m[3]) {
      const sign = m[1] === '-' ? -1 : 1
      const count = m[2] ? parseInt(m[2], 10) : 1
      const sides = parseInt(m[3], 10)
      if (!sides || count > 1000 || sides > 10000) return null
      for (let i = 0; i < count; i++) {
        const v = rollDie(sides) * sign
        rolls.push({ die: sides, value: v })
      }
    } else if (m[4]) {
      modifier += parseInt(m[4], 10)
    }
  }
  if (!matched) return null
  const total = rolls.reduce((s, r) => s + r.value, 0) + modifier
  return { expression: expr, total, rolls, modifier }
}

export function matchTableEntry<T extends { range: string }>(entries: T[], roll: number): T | null {
  for (const e of entries) {
    const r = e.range.trim()
    if (r.includes('-')) {
      const [a, b] = r.split('-').map((n) => parseInt(n.trim(), 10))
      if (!isNaN(a) && !isNaN(b) && roll >= Math.min(a, b) && roll <= Math.max(a, b)) return e
    } else {
      const n = parseInt(r, 10)
      if (!isNaN(n) && n === roll) return e
    }
  }
  return null
}
