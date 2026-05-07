import type { Combatant, PlayerClassId } from '../types'

type Props = {
  c: Combatant
  size?: number
  className?: string
  title?: string
}

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function paths(c: Combatant) {
  if (c.type === 'monster') {
    // skull
    return (
      <>
        <path d="M5 11a7 7 0 0 1 14 0v3.2a2 2 0 0 1-1.2 1.8L17 16.5V20h-2v-2h-2v2h-2v-2H9v2H7v-3.5l-.8-.5A2 2 0 0 1 5 14.2V11z" />
        <circle cx="9" cy="11.5" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="15" cy="11.5" r="1.6" fill="currentColor" stroke="none" />
        <path d="M11 14.5h2" />
      </>
    )
  }
  const klass: PlayerClassId = c.playerClass ?? 'none'
  switch (klass) {
    case 'barbarian':
      // battle axe
      return (
        <>
          <path d="M14 3l7 7-3 3-2-2-9 9-3-3 9-9-2-2 3-3z" />
          <path d="M5 19l-2 2" />
        </>
      )
    case 'bard':
      // eighth note
      return (
        <>
          <path d="M9 17V5l10-2v3L9 8" />
          <ellipse cx="7" cy="17" rx="2.4" ry="1.9" />
          <ellipse cx="17" cy="14" rx="2.4" ry="1.9" />
        </>
      )
    case 'cleric':
      // sun with rays
      return (
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </>
      )
    case 'druid':
      // leaf
      return (
        <>
          <path d="M20 4c-9 0-15 5-15 14 0 .7 0 1 .1 2 .3-9 6-15 14.9-16z" />
          <path d="M5.3 19.7C9 19 14 16 17 12" />
        </>
      )
    case 'fighter':
      // crossed swords
      return (
        <>
          <path d="M4 4l11 11M20 4L9 15" />
          <path d="M15 15l3 3-1 1-3-3M9 15l-3 3 1 1 3-3" />
          <path d="M3 4h2M19 4h2" />
        </>
      )
    case 'monk':
      // yin-yang
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9" />
          <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
        </>
      )
    case 'paladin':
      // shield with cross
      return (
        <>
          <path d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z" />
          <path d="M12 8v8M9 12h6" />
        </>
      )
    case 'ranger':
      // bow & arrow
      return (
        <>
          <path d="M5 4c0 8 7 16 14 16" />
          <path d="M5 4c2 8 9 14 14 14" />
          <path d="M3 21l5-5M14 11l4-1-1 4" />
        </>
      )
    case 'rogue':
      // dagger
      return (
        <>
          <path d="M12 3l3 6-3 8-3-8 3-6z" />
          <path d="M9 17h6M10 19h4" />
        </>
      )
    case 'sorcerer':
      // flame
      return (
        <>
          <path d="M12 3c1 4-5 5-5 10a5 5 0 0 0 10 0c0-2-1-3-2-4 0 2-1 3-2 3 0-3 1-5-1-9z" />
        </>
      )
    case 'warlock':
      // eye
      return (
        <>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
        </>
      )
    case 'wizard':
      // pointed hat with stars
      return (
        <>
          <path d="M12 3l-5 14h10L12 3z" />
          <path d="M5 18h14" />
          <circle cx="12" cy="9" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="10" cy="13" r="0.6" fill="currentColor" stroke="none" />
        </>
      )
    case 'none':
    default:
      // adventurer: sword
      return (
        <>
          <path d="M12 3v13" />
          <path d="M9 16h6l-3 5-3-5z" />
          <path d="M8 5h8" />
        </>
      )
  }
}

export default function CombatantIcon({ c, size = 24, className, title }: Props) {
  return (
    <svg
      {...STROKE}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {paths(c)}
    </svg>
  )
}
