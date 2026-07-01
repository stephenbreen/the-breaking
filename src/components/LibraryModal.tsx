import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { newId } from '../utils/id'
import { blankRosterEntry } from '../data/encounter'
import { parseStatblocks, statblockAC, statblockHP, statblockInitMod } from '../utils/statblock'
import type {
  CombatantType,
  EncounterTemplate,
  InitiativeMode,
  RosterEntry,
  Scene,
  Statblock,
} from '../types'
import StatblockView from './StatblockView'

const INIT_MODES: { value: InitiativeMode; label: string }[] = [
  { value: 'roll-each', label: 'Roll each' },
  { value: 'roll-group', label: 'Roll as group' },
  { value: 'static', label: 'Static value' },
  { value: 'manual', label: 'Manual (enter live)' },
]

const referencedStatblocks = (scene: Scene, all: Statblock[]): Statblock[] => {
  const ids = new Set<string>()
  scene.encounters.forEach((e) =>
    e.roster.forEach((r) => r.statblockId && ids.add(r.statblockId))
  )
  return all.filter((sb) => ids.has(sb.id))
}

export default function LibraryModal({
  open,
  onClose,
  onLoaded,
}: {
  open: boolean
  onClose: () => void
  onLoaded: () => void
}) {
  const [tab, setTab] = useState<'scenes' | 'statblocks'>('scenes')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-[64rem] max-w-full h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-slate-800">
          <h2 className="text-lg font-bold">Library</h2>
          <div className="flex rounded overflow-hidden border border-slate-700 text-sm">
            {(['scenes', 'statblocks'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 capitalize transition ${
                  tab === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <button onClick={onClose} className="btn" aria-label="Close library">
            ✕
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          {tab === 'scenes' ? (
            <ScenesTab onLoaded={onLoaded} />
          ) : (
            <StatblocksTab />
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------- Scenes ----------------

function ScenesTab({ onLoaded }: { onLoaded: () => void }) {
  const scenes = useStore((s) => s.scenes)
  const addScene = useStore((s) => s.addScene)
  const importScene = useStore((s) => s.importScene)
  const statblocks = useStore((s) => s.statblocks)
  const [selectedId, setSelectedId] = useState<string | null>(scenes[0]?.id ?? null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if ((!selectedId || !scenes.find((s) => s.id === selectedId)) && scenes[0]) {
      setSelectedId(scenes[0].id)
    }
  }, [scenes, selectedId])

  const selected = scenes.find((s) => s.id === selectedId)

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      importScene(data)
    } catch (err) {
      alert('Import failed: ' + (err as Error).message)
    }
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="w-44 sm:w-52 border-r border-slate-800 flex flex-col shrink-0">
        <div className="flex-1 overflow-y-auto">
          {scenes.length === 0 && (
            <div className="p-3 text-xs text-slate-500 italic">No scenes yet.</div>
          )}
          {scenes.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`w-full text-left px-3 py-2 text-sm border-b border-slate-800 truncate ${
                selectedId === s.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'
              }`}
              title={s.name}
            >
              {s.name}
              <span className="text-[10px] text-slate-500 ml-1">
                ({s.encounters.length})
              </span>
            </button>
          ))}
        </div>
        <div className="p-2 space-y-1 border-t border-slate-800">
          <button
            onClick={() => setSelectedId(addScene())}
            className="btn w-full text-xs"
          >
            + New Scene
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn w-full text-xs">
            Import Scene
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={onImportFile}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-w-0">
        {selected ? (
          <SceneEditor scene={selected} statblocks={statblocks} onLoaded={onLoaded} />
        ) : (
          <div className="p-6 text-sm text-slate-500">
            Create or import a scene to get started.
          </div>
        )}
      </div>
    </div>
  )
}

function SceneEditor({
  scene,
  statblocks,
  onLoaded,
}: {
  scene: Scene
  statblocks: Statblock[]
  onLoaded: () => void
}) {
  const updateScene = useStore((s) => s.updateScene)
  const removeScene = useStore((s) => s.removeScene)
  const saveCurrent = useStore((s) => s.saveCurrentAsEncounter)
  const combatants = useStore((s) => s.combatants)

  const setEncounters = (encounters: EncounterTemplate[]) =>
    updateScene(scene.id, { encounters })

  const addEncounter = () =>
    setEncounters([
      ...scene.encounters,
      { id: newId(), name: 'New Encounter', roster: [] },
    ])

  const updateEncounter = (id: string, patch: Partial<EncounterTemplate>) =>
    setEncounters(scene.encounters.map((e) => (e.id === id ? { ...e, ...patch } : e)))

  const removeEncounter = (id: string) =>
    setEncounters(scene.encounters.filter((e) => e.id !== id))

  const exportScene = () => {
    const payload = { scene, statblocks: referencedStatblocks(scene, statblocks) }
    downloadJson(payload, `scene-${slug(scene.name)}.json`)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={scene.name}
          onChange={(e) => updateScene(scene.id, { name: e.target.value })}
          className="input flex-1 font-semibold text-base"
        />
        <button onClick={exportScene} className="btn text-xs">
          Export
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete scene "${scene.name}" and its encounters?`))
              removeScene(scene.id)
          }}
          className="btn-danger text-xs"
        >
          Delete
        </button>
      </div>
      <textarea
        value={scene.notes ?? ''}
        onChange={(e) => updateScene(scene.id, { notes: e.target.value })}
        placeholder="Scene notes…"
        className="input w-full text-sm"
        rows={2}
      />

      <div className="space-y-3">
        {scene.encounters.map((enc) => (
          <EncounterEditor
            key={enc.id}
            encounter={enc}
            statblocks={statblocks}
            onChange={(patch) => updateEncounter(enc.id, patch)}
            onRemove={() => removeEncounter(enc.id)}
            sceneId={scene.id}
            onLoaded={onLoaded}
          />
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={addEncounter} className="btn">
          + Add Encounter
        </button>
        <button
          onClick={() => {
            if (combatants.length === 0) {
              alert('No combatants in the current fight to save.')
              return
            }
            const name = prompt('Save the current fight as a new encounter named:')
            if (name?.trim()) saveCurrent(scene.id, name.trim())
          }}
          className="btn"
          title="Capture the current live combatants as a new encounter in this scene"
        >
          Save current fight here
        </button>
      </div>
    </div>
  )
}

function EncounterEditor({
  encounter: enc,
  statblocks,
  onChange,
  onRemove,
  sceneId,
  onLoaded,
}: {
  encounter: EncounterTemplate
  statblocks: Statblock[]
  onChange: (patch: Partial<EncounterTemplate>) => void
  onRemove: () => void
  sceneId: string
  onLoaded: () => void
}) {
  const loadEncounter = useStore((s) => s.loadEncounter)
  const combatants = useStore((s) => s.combatants)

  const setRoster = (roster: RosterEntry[]) => onChange({ roster })
  const addEntry = () => setRoster([...enc.roster, blankRosterEntry()])
  const updateEntry = (id: string, patch: Partial<RosterEntry>) =>
    setRoster(enc.roster.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const removeEntry = (id: string) => setRoster(enc.roster.filter((r) => r.id !== id))

  const total = enc.roster.reduce((n, r) => n + Math.max(1, r.quantity), 0)

  const load = () => {
    const proceed =
      combatants.length === 0 ||
      confirm(
        `Load "${enc.name}"? This replaces the current ${combatants.length} combatant(s).`
      )
    if (!proceed) return
    loadEncounter(sceneId, enc.id)
    onLoaded()
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60">
      <div className="flex items-center gap-2 p-2 border-b border-slate-800">
        <input
          value={enc.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="input flex-1 font-semibold"
        />
        <span className="text-[11px] text-slate-500 whitespace-nowrap">
          {total} combatant{total === 1 ? '' : 's'}
        </span>
        <button onClick={load} className="btn-primary text-xs whitespace-nowrap">
          Load ▶
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete encounter "${enc.name}"?`)) onRemove()
          }}
          className="btn text-red-400"
          title="Delete encounter"
        >
          ×
        </button>
      </div>

      <input
        value={enc.notes ?? ''}
        onChange={(e) => onChange({ notes: e.target.value })}
        placeholder="Encounter notes…"
        className="input w-full text-xs rounded-none border-x-0 border-t-0"
      />

      <div className="p-2 space-y-2">
        {enc.roster.length === 0 && (
          <div className="text-xs text-slate-500 italic">
            No creatures yet — add one, or link a statblock.
          </div>
        )}
        {enc.roster.map((r) => (
          <RosterRow
            key={r.id}
            entry={r}
            statblocks={statblocks}
            onChange={(patch) => updateEntry(r.id, patch)}
            onRemove={() => removeEntry(r.id)}
          />
        ))}
        <button onClick={addEntry} className="btn text-xs">
          + Add creature
        </button>
      </div>
    </div>
  )
}

function RosterRow({
  entry: r,
  statblocks,
  onChange,
  onRemove,
}: {
  entry: RosterEntry
  statblocks: Statblock[]
  onChange: (patch: Partial<RosterEntry>) => void
  onRemove: () => void
}) {
  const num = (v: string, min = 0) => Math.max(min, parseInt(v, 10) || 0)

  // Selecting a statblock links it and prefills stats from it.
  const linkStatblock = (id: string) => {
    if (!id) {
      onChange({ statblockId: undefined })
      return
    }
    const sb = statblocks.find((x) => x.id === id)
    if (!sb) return
    onChange({
      statblockId: id,
      name: sb.name || r.name,
      maxHP: statblockHP(sb) ?? r.maxHP,
      AC: statblockAC(sb) ?? r.AC,
      initiativeMod: statblockInitMod(sb),
    })
  }

  const rolls = r.initiativeMode === 'roll-each' || r.initiativeMode === 'roll-group'

  return (
    <div className="rounded border border-slate-800 bg-slate-950/50 p-2 space-y-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <input
          value={r.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="input flex-1 min-w-[7rem]"
          placeholder="Name"
        />
        <select
          value={r.type}
          onChange={(e) => onChange({ type: e.target.value as CombatantType })}
          className="input"
        >
          <option value="monster">NPC</option>
          <option value="pc">PC</option>
        </select>
        <label className="text-[11px] text-slate-400 flex items-center gap-1">
          ×
          <input
            type="number"
            min={1}
            value={r.quantity}
            onChange={(e) => onChange({ quantity: num(e.target.value, 1) })}
            className="input w-14"
          />
        </label>
        <button onClick={onRemove} className="btn text-red-400" title="Remove creature">
          ×
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
        <label className="flex items-center gap-1">
          HP
          <input
            type="number"
            value={r.maxHP}
            onChange={(e) => onChange({ maxHP: num(e.target.value, 1) })}
            className="input w-16"
          />
        </label>
        <label className="flex items-center gap-1">
          AC
          <input
            type="number"
            value={r.AC}
            onChange={(e) => onChange({ AC: num(e.target.value) })}
            className="input w-14"
          />
        </label>
        <label className="flex items-center gap-1">
          PP
          <input
            type="number"
            value={r.passivePerception}
            onChange={(e) => onChange({ passivePerception: num(e.target.value) })}
            className="input w-14"
          />
        </label>
        <span className="mx-1 text-slate-700">|</span>
        <label className="flex items-center gap-1">
          Init
          <select
            value={r.initiativeMode}
            onChange={(e) => onChange({ initiativeMode: e.target.value as InitiativeMode })}
            className="input"
          >
            {INIT_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        {rolls ? (
          <label className="flex items-center gap-1">
            mod
            <input
              type="number"
              value={r.initiativeMod}
              onChange={(e) =>
                onChange({ initiativeMod: parseInt(e.target.value, 10) || 0 })
              }
              className="input w-14"
            />
          </label>
        ) : (
          <label className="flex items-center gap-1">
            value
            <input
              type="number"
              value={r.initiative}
              onChange={(e) => onChange({ initiative: parseInt(e.target.value, 10) || 0 })}
              className="input w-14"
            />
          </label>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
        <label className="flex items-center gap-1 flex-1 min-w-[10rem]">
          Statblock
          <select
            value={r.statblockId ?? ''}
            onChange={(e) => linkStatblock(e.target.value)}
            className="input flex-1"
          >
            <option value="">— none —</option>
            {statblocks.map((sb) => (
              <option key={sb.id} value={sb.id}>
                {sb.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={r.nameVisibleToPlayers}
            onChange={(e) => onChange({ nameVisibleToPlayers: e.target.checked })}
          />
          Show name
        </label>
      </div>
    </div>
  )
}

// ---------------- Statblocks ----------------

function StatblocksTab() {
  const statblocks = useStore((s) => s.statblocks)
  const addStatblocks = useStore((s) => s.addStatblocks)
  const removeStatblock = useStore((s) => s.removeStatblock)
  const [selectedId, setSelectedId] = useState<string | null>(statblocks[0]?.id ?? null)
  const [paste, setPaste] = useState('')
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if ((!selectedId || !statblocks.find((s) => s.id === selectedId)) && statblocks[0]) {
      setSelectedId(statblocks[0].id)
    }
  }, [statblocks, selectedId])

  const selected = statblocks.find((s) => s.id === selectedId)

  const doImport = (text: string) => {
    try {
      const parsed = parseStatblocks(text)
      if (parsed.length === 0) {
        alert('No statblocks found in that text.')
        return
      }
      addStatblocks(parsed)
      setSelectedId(parsed[0].id)
      setPaste('')
      setImporting(false)
    } catch (err) {
      alert('Could not parse statblock: ' + (err as Error).message)
    }
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    doImport(await file.text())
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="w-44 sm:w-52 border-r border-slate-800 flex flex-col shrink-0">
        <div className="flex-1 overflow-y-auto">
          {statblocks.length === 0 && (
            <div className="p-3 text-xs text-slate-500 italic">No statblocks yet.</div>
          )}
          {statblocks.map((sb) => (
            <button
              key={sb.id}
              onClick={() => {
                setSelectedId(sb.id)
                setImporting(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm border-b border-slate-800 truncate ${
                selectedId === sb.id && !importing
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
              title={sb.name}
            >
              {sb.name}
              {sb.cr && <span className="text-[10px] text-slate-500 ml-1">CR {sb.cr}</span>}
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={() => setImporting(true)}
            className="btn w-full text-xs"
          >
            + Import statblock
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-w-0 p-4">
        {importing ? (
          <div className="space-y-3 max-w-xl">
            <h3 className="font-semibold">Import a statblock</h3>
            <p className="text-xs text-slate-400">
              Paste a{' '}
              <a
                href="https://plugins.javalent.com/statblocks/readme/code-block"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Fantasy Statblocks
              </a>{' '}
              YAML block (with or without the <code>```statblock</code> fence), or{' '}
              <b>5etools / 5e.tools bestiary JSON</b> — a single monster, a JSON
              array, or a <code>{'{ "monster": [ … ] }'}</code> file. Multiple
              statblocks and YAML <code>---</code> multi-docs are supported.
            </p>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={12}
              placeholder={'name: Goblin\nac: 15\nhp: 7 (2d6)\nstats: [8, 14, 10, 10, 8, 8]\n...'}
              className="input w-full font-mono text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={() => doImport(paste)}
                className="btn-primary"
                disabled={!paste.trim()}
              >
                Add
              </button>
              <button onClick={() => fileRef.current?.click()} className="btn">
                Upload file…
              </button>
              <button onClick={() => setImporting(false)} className="btn">
                Cancel
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".yaml,.yml,.json,.md,.txt"
                hidden
                onChange={onFile}
              />
            </div>
          </div>
        ) : selected ? (
          <div className="max-w-xl space-y-3">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (confirm(`Delete statblock "${selected.name}"?`))
                    removeStatblock(selected.id)
                }}
                className="btn-danger text-xs"
              >
                Delete
              </button>
            </div>
            <div className="rounded-lg border-2 border-[color:rgb(var(--sb-heading)/0.4)] bg-slate-950/40 p-4">
              <StatblockView sb={selected} />
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            Import a statblock to view it here.
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------- helpers ----------------

const slug = (s: string) => s.replace(/\W+/g, '-').toLowerCase() || 'scene'

function downloadJson(payload: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
