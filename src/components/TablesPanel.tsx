import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { newId } from '../utils/id'
import { rollExpression, matchTableEntry } from '../utils/dice'
import type { RollTable, TableEntry } from '../types'

export default function TablesPanel() {
  const tables = useStore((s) => s.tables)
  const addTable = useStore((s) => s.addTable)
  const removeTable = useStore((s) => s.removeTable)
  const [selectedId, setSelectedId] = useState<string | null>(tables[0]?.id ?? null)

  useEffect(() => {
    if (selectedId && !tables.find((t) => t.id === selectedId)) {
      setSelectedId(tables[0]?.id ?? null)
    }
    if (!selectedId && tables[0]) {
      setSelectedId(tables[0].id)
    }
  }, [tables, selectedId])

  const selected = tables.find((t) => t.id === selectedId)

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return
      try {
        const txt = await file.text()
        const data = JSON.parse(txt)
        const records = Array.isArray(data) ? data : [data]
        for (const t of records) {
          const entries: TableEntry[] = Array.isArray(t.entries)
            ? t.entries.map((e: { range?: string; text?: string }) => ({
                id: newId(),
                range: String(e.range ?? ''),
                text: String(e.text ?? ''),
              }))
            : []
          addTable({
            name: String(t.name ?? 'Imported Table'),
            dice: String(t.dice ?? 'd20'),
            entries,
          })
        }
      } catch (err) {
        alert('Failed to import: ' + (err as Error).message)
      }
    }
    input.click()
  }

  return (
    <div className="flex flex-col sm:flex-row h-full min-h-0">
      {/* Mobile: horizontal scrolling list of tables. Desktop: vertical sidebar. */}
      <div className="sm:w-44 border-b sm:border-b-0 sm:border-r border-slate-800 flex sm:flex-col shrink-0">
        <div className="flex sm:flex-col flex-1 overflow-x-auto sm:overflow-x-hidden sm:overflow-y-auto">
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`text-left px-3 py-2 text-sm sm:border-b border-slate-800 truncate shrink-0 sm:w-full whitespace-nowrap ${
                selectedId === t.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
              title={t.name}
            >
              {t.name}
              {t.builtIn && (
                <span className="ml-1 text-[9px] text-indigo-400">★</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex sm:block gap-1 p-2 sm:space-y-1 border-l sm:border-l-0 sm:border-t border-slate-800 shrink-0">
          <button
            onClick={() => {
              const name = prompt('New table name:')
              if (name?.trim()) {
                addTable({ name: name.trim(), dice: 'd20', entries: [] })
              }
            }}
            className="btn sm:w-full text-xs whitespace-nowrap"
          >
            + New
          </button>
          <button onClick={handleImport} className="btn sm:w-full text-xs whitespace-nowrap">
            Import
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-w-0">
        {selected ? (
          <TableEditor
            table={selected}
            onDelete={() => removeTable(selected.id)}
          />
        ) : (
          <div className="p-6 text-slate-500 text-sm">
            Select or create a table.
          </div>
        )}
      </div>
    </div>
  )
}

function TableEditor({ table, onDelete }: { table: RollTable; onDelete: () => void }) {
  const update = useStore((s) => s.updateTable)
  const [lastRoll, setLastRoll] = useState<{ roll: number; entry: TableEntry | null } | null>(null)

  const roll = () => {
    const r = rollExpression(table.dice)
    if (!r) {
      alert('Invalid dice expression: ' + table.dice)
      return
    }
    const entry = matchTableEntry(table.entries, r.total)
    setLastRoll({ roll: r.total, entry })
  }

  const addEntry = () => {
    update(table.id, {
      entries: [...table.entries, { id: newId(), range: '', text: '' }],
    })
  }

  const updateEntry = (id: string, patch: Partial<TableEntry>) => {
    update(table.id, {
      entries: table.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })
  }

  const removeEntry = (id: string) => {
    update(table.id, { entries: table.entries.filter((e) => e.id !== id) })
  }

  const exportJson = () => {
    const payload = {
      name: table.name,
      dice: table.dice,
      entries: table.entries.map(({ range, text }) => ({ range, text })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${table.name.replace(/\W+/g, '-').toLowerCase() || 'table'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={table.name}
          onChange={(e) => update(table.id, { name: e.target.value })}
          className="input flex-1 font-semibold"
        />
        <input
          value={table.dice}
          onChange={(e) => update(table.id, { dice: e.target.value })}
          className="input w-20 font-mono"
          placeholder="d20"
        />
        <button onClick={roll} className="btn-primary">
          Roll
        </button>
      </div>
      {lastRoll && (
        <div className="rounded p-3 bg-amber-900/40 border border-amber-700">
          <div className="text-xs text-amber-300">
            Rolled {table.dice} → <b>{lastRoll.roll}</b>
          </div>
          <div className="text-sm mt-1">
            {lastRoll.entry?.text ?? (
              <em className="text-slate-500">No matching entry for this roll.</em>
            )}
          </div>
        </div>
      )}
      <div className="space-y-1">
        {table.entries.map((e) => (
          <div key={e.id} className="flex gap-2 items-start">
            <input
              value={e.range}
              placeholder="1-5"
              onChange={(ev) => updateEntry(e.id, { range: ev.target.value })}
              className="input w-20 font-mono"
            />
            <input
              value={e.text}
              placeholder="Result text"
              onChange={(ev) => updateEntry(e.id, { text: ev.target.value })}
              className="input flex-1"
            />
            <button
              onClick={() => removeEntry(e.id)}
              className="btn text-red-400"
              title="Remove entry"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={addEntry} className="btn">
          + Entry
        </button>
        <button onClick={exportJson} className="btn">
          Export JSON
        </button>
        <div className="flex-1" />
        {!table.builtIn && (
          <button
            onClick={() => {
              if (confirm(`Delete table "${table.name}"?`)) onDelete()
            }}
            className="btn-danger"
          >
            Delete Table
          </button>
        )}
      </div>
    </div>
  )
}
