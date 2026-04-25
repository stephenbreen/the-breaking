import { useEffect, useState } from 'react'
import { useStore } from '../store'

export default function AddCombatantModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const add = useStore((s) => s.addCombatant)
  const [name, setName] = useState('')
  const [type, setType] = useState<'pc' | 'monster'>('monster')
  const [maxHP, setMaxHP] = useState<string>('10')
  const [AC, setAC] = useState<string>('10')
  const [pp, setPP] = useState<string>('10')
  const [init, setInit] = useState<string>('10')

  useEffect(() => {
    if (open) {
      setName('')
      setMaxHP('10')
      setAC('10')
      setPP('10')
      setInit('10')
    }
  }, [open])

  if (!open) return null

  const submit = (addAnother: boolean) => {
    if (!name.trim()) return
    const mh = Math.max(1, parseInt(maxHP, 10) || 1)
    add({
      name: name.trim(),
      type,
      maxHP: mh,
      currentHP: mh,
      AC: parseInt(AC, 10) || 10,
      passivePerception: parseInt(pp, 10) || 10,
      initiative: parseInt(init, 10) || 10,
      nameVisibleToPlayers: type === 'pc',
    })
    if (addAnother) {
      setName('')
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(false)
        }}
        onClick={(e) => e.stopPropagation()}
        className="bg-app-surface border border-app-line-2 rounded-lg p-6 w-[26rem] max-w-full space-y-3"
      >
        <h3 className="text-lg font-bold">Add Combatant</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('pc')}
            className={`flex-1 py-2 rounded ${
              type === 'pc' ? 'bg-pc-solid text-white' : 'bg-app-elev text-app-muted'
            }`}
          >
            PC
          </button>
          <button
            type="button"
            onClick={() => setType('monster')}
            className={`flex-1 py-2 rounded ${
              type === 'monster' ? 'bg-npc-solid text-white' : 'bg-app-elev text-app-muted'
            }`}
          >
            Monster / NPC
          </button>
        </div>
        <label className="block">
          <span className="text-xs text-app-muted">Name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-app-muted">Initiative</span>
            <input
              type="number"
              value={init}
              onChange={(e) => setInit(e.target.value)}
              className="input w-full"
            />
          </label>
          <label className="block">
            <span className="text-xs text-app-muted">Max HP</span>
            <input
              type="number"
              value={maxHP}
              onChange={(e) => setMaxHP(e.target.value)}
              className="input w-full"
            />
          </label>
          <label className="block">
            <span className="text-xs text-app-muted">AC</span>
            <input
              type="number"
              value={AC}
              onChange={(e) => setAC(e.target.value)}
              className="input w-full"
            />
          </label>
          <label className="block">
            <span className="text-xs text-app-muted">Passive Perception</span>
            <input
              type="number"
              value={pp}
              onChange={(e) => setPP(e.target.value)}
              className="input w-full"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn">
            Cancel
          </button>
          <button type="button" onClick={() => submit(true)} className="btn" disabled={!name.trim()}>
            Add &amp; another
          </button>
          <button type="submit" className="btn-primary" disabled={!name.trim()}>
            Add
          </button>
        </div>
      </form>
    </div>
  )
}
