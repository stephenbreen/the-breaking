import type { Statblock, StatblockSection } from '../types'
import { abilityMod } from '../utils/statblock'

const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

const fmtMod = (n: number) => `${n >= 0 ? '+' : ''}${n}`

// Statblock accent (burgundy on parchment, gold on dark) — see --sb-heading.
const HEADING = 'text-[color:rgb(var(--sb-heading))]'

function Line({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="text-sm leading-snug">
      <span className={`font-semibold ${HEADING}`}>{label}</span>{' '}
      <span className="text-slate-100">{value}</span>
    </div>
  )
}

function Sections({ title, items }: { title?: string; items?: StatblockSection[] }) {
  if (!items || items.length === 0) return null
  return (
    <div className="space-y-1.5">
      {title && (
        <h4
          className={`${HEADING} font-bold uppercase text-xs tracking-wide border-b border-[color:rgb(var(--sb-heading)/0.5)] pb-0.5`}
        >
          {title}
        </h4>
      )}
      {items.map((s, i) => (
        <p key={i} className="text-sm leading-snug">
          {s.name && <span className="font-bold italic text-slate-100">{s.name}. </span>}
          <span className="text-slate-200">{s.desc}</span>
        </p>
      ))}
    </div>
  )
}

export default function StatblockView({
  sb,
  compact,
}: {
  sb: Statblock
  compact?: boolean
}) {
  const meta = [sb.size, sb.type, sb.subtype && `(${sb.subtype})`].filter(Boolean).join(' ')
  const hp = sb.hp && sb.hitDice ? `${sb.hp} (${sb.hitDice})` : sb.hp

  return (
    <div className="text-slate-100">
      <div className="border-b-2 border-[color:rgb(var(--sb-heading))] pb-1 mb-2">
        <div className={`text-xl font-bold leading-tight ${HEADING}`}>{sb.name}</div>
        {(meta || sb.alignment) && (
          <div className="text-xs italic text-slate-400">
            {[meta, sb.alignment].filter(Boolean).join(', ')}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <Line label="Armor Class" value={sb.ac} />
        <Line label="Hit Points" value={hp} />
        <Line label="Speed" value={sb.speed} />
      </div>

      {sb.stats && (
        <div className="grid grid-cols-6 gap-1 my-2 text-center">
          {sb.stats.slice(0, 6).map((score, i) => (
            <div key={i} className="bg-slate-800/50 rounded py-1">
              <div className={`text-[10px] font-bold ${HEADING}`}>{ABILITIES[i]}</div>
              <div className="text-sm tabular-nums text-slate-100">
                {score} ({fmtMod(abilityMod(score))})
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-0.5">
        <Line label="Saving Throws" value={sb.saves} />
        <Line label="Skills" value={sb.skillsaves} />
        <Line label="Damage Vulnerabilities" value={sb.damageVulnerabilities} />
        <Line label="Damage Resistances" value={sb.damageResistances} />
        <Line label="Damage Immunities" value={sb.damageImmunities} />
        <Line label="Condition Immunities" value={sb.conditionImmunities} />
        <Line label="Senses" value={sb.senses} />
        <Line label="Languages" value={sb.languages} />
        <Line label="Challenge" value={sb.cr} />
      </div>

      {!compact && (
        <div className="mt-3 space-y-3">
          <Sections items={sb.traits} />
          <Sections title="Actions" items={sb.actions} />
          <Sections title="Bonus Actions" items={sb.bonusActions} />
          <Sections title="Reactions" items={sb.reactions} />
          <Sections title="Legendary Actions" items={sb.legendaryActions} />
        </div>
      )}
      {sb.source && (
        <div className="text-[10px] text-slate-500 mt-2 italic">Source: {sb.source}</div>
      )}
    </div>
  )
}
