export type ConditionDef = {
  id: string
  name: string
  description: string
}

export const CONDITIONS: ConditionDef[] = [
  { id: 'blinded', name: 'Blinded', description: "Can't see. Auto-fails sight checks. Attacks have disadvantage; attacks against have advantage." },
  { id: 'charmed', name: 'Charmed', description: "Can't attack the charmer. Charmer has advantage on social checks." },
  { id: 'deafened', name: 'Deafened', description: "Can't hear. Auto-fails hearing-based checks." },
  { id: 'frightened', name: 'Frightened', description: 'Disadvantage on checks/attacks while source is in sight. Cannot move closer to source.' },
  { id: 'grappled', name: 'Grappled', description: 'Speed 0. Ends if grappler is incapacitated or moved away.' },
  { id: 'incapacitated', name: 'Incapacitated', description: 'No actions or reactions.' },
  { id: 'invisible', name: 'Invisible', description: 'Heavily obscured. Attacks have advantage; attacks against have disadvantage.' },
  { id: 'paralyzed', name: 'Paralyzed', description: "Incapacitated, can't move/speak. Auto-fail STR/DEX saves. Attacks have advantage; within 5 ft = crit." },
  { id: 'petrified', name: 'Petrified', description: 'Turned to stone. Incapacitated, unaware, resistant to all damage, immune to poison/disease.' },
  { id: 'poisoned', name: 'Poisoned', description: 'Disadvantage on attacks and ability checks.' },
  { id: 'prone', name: 'Prone', description: "Can only crawl. Disadvantage on attacks. Melee attacks against have advantage, ranged disadvantage." },
  { id: 'restrained', name: 'Restrained', description: 'Speed 0. Disadvantage on attacks and DEX saves. Attacks against have advantage.' },
  { id: 'stunned', name: 'Stunned', description: 'Incapacitated. Auto-fail STR/DEX saves. Attacks against have advantage.' },
  { id: 'unconscious', name: 'Unconscious', description: 'Incapacitated, prone, drops items. Auto-fail STR/DEX saves. Attacks have advantage; within 5 ft = crit.' },
  { id: 'exhaustion-1', name: 'Exhaustion 1', description: 'Disadvantage on ability checks.' },
  { id: 'exhaustion-2', name: 'Exhaustion 2', description: 'Speed halved.' },
  { id: 'exhaustion-3', name: 'Exhaustion 3', description: 'Disadvantage on attacks and saves.' },
  { id: 'exhaustion-4', name: 'Exhaustion 4', description: 'HP maximum halved.' },
  { id: 'exhaustion-5', name: 'Exhaustion 5', description: 'Speed reduced to 0.' },
  { id: 'exhaustion-6', name: 'Exhaustion 6', description: 'Death.' },
]
