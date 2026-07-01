import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { statblockAC, statblockHP } from '../utils/statblock'

export default function AddCombatantModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const add = useStore((s) => s.addCombatant)
  const statblocks = useStore((s) => s.statblocks)
  const [name, setName] = useState('')
  const [type, setType] = useState<'pc' | 'monster'>('monster')
  const [maxHP, setMaxHP] = useState<string>('10')
  const [AC, setAC] = useState<string>('10')
  const [pp, setPP] = useState<string>('10')
  const [init, setInit] = useState<string>('10')
  const [statblockId, setStatblockId] = useState<string>('')

  useEffect(() => {
    if (open) {
      setName('')
      setMaxHP('10')
      setAC('10')
      setPP('10')
      setInit('10')
      setStatblockId('')
    }
  }, [open])

  if (!open) return null

  // Picking a statblock links it and prefills name/HP/AC from it.
  const chooseStatblock = (id: string) => {
    setStatblockId(id)
    const sb = statblocks.find((s) => s.id === id)
    if (!sb) return
    setType('monster')
    if (sb.name) setName(sb.name)
    const hp = statblockHP(sb)
    if (hp != null) setMaxHP(String(hp))
    const ac = statblockAC(sb)
    if (ac != null) setAC(String(ac))
  }

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
      statblockId: statblockId || undefined,
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
        className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-[26rem] max-w-full space-y-3"
      >
        <h3 className="text-lg font-bold">Add Combatant</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('pc')}
            className={`flex-1 py-2 rounded ${
              type === 'pc' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            PC
          </button>
          <button
            type="button"
            onClick={() => setType('monster')}
            className={`flex-1 py-2 rounded ${
              type === 'monster' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Monster / NPC
          </button>
        </div>
        {statblocks.length > 0 && (
          <label className="block">
            <span className="text-xs text-slate-400">From statblock (optional)</span>
            <select
              value={statblockId}
              onChange={(e) => chooseStatblock(e.target.value)}
              className="input w-full"
            >
              <option value="">— none —</option>
              {statblocks.map((sb) => (
                <option key={sb.id} value={sb.id}>
                  {sb.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className="text-xs text-slate-400">Name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-slate-400">Initiative</span>
            <input
              type="number"
              value={init}
              onChange={(e) => setInit(e.target.value)}
              className="input w-full"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Max HP</span>
            <input
              type="number"
              value={maxHP}
              onChange={(e) => setMaxHP(e.target.value)}
              className="input w-full"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">AC</span>
            <input
              type="number"
              value={AC}
              onChange={(e) => setAC(e.target.value)}
              className="input w-full"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Passive Perception</span>
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
