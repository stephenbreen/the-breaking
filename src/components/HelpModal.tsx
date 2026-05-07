import { useEffect } from 'react'

export default function HelpModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
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
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-[48rem] max-w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 px-6 py-4 border-b border-slate-800">
          <h2 className="text-xl font-bold">How to use The Breaking</h2>
          <div className="flex-1" />
          <button onClick={onClose} className="btn" aria-label="Close help">
            ✕
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm text-slate-300 leading-relaxed">
          <section>
            <h3 className="text-base font-semibold text-white mb-1">What this is</h3>
            <p>
              A two-window initiative tracker for tabletop RPG sessions. The
              window you're in is the <b>DM panel</b> — you add combatants,
              drive turns, apply damage, and consult tables. The{' '}
              <b>player view</b> is a read-only popout you drag onto a second
              monitor or TV so the players can see initiative order, active
              turn, and the turn timer.
            </p>
            <p className="mt-2">
              The two windows stay in sync through your browser only — no
              server, no accounts. Everything auto-saves to this browser's
              local storage.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">
              Opening the player view
            </h3>
            <p>
              Click <b>Player View ↗</b> in the header. If a popup is blocked,
              allow popups for this site. Drag the popup to your second
              monitor and leave it there for the session.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">
              Adding combatants
            </h3>
            <p>
              <b>+ Add Combatant</b> opens a dialog. Pick PC or Monster/NPC,
              enter name + initiative + max HP + AC + passive perception.
              The list auto-sorts by initiative. <b>Add &amp; another</b>{' '}
              keeps the dialog open for rapid entry of a monster pack.
            </p>
            <p className="mt-2">
              Combatants default to <em>name visible to players</em> for PCs
              and <em>hidden</em> for monsters. Players see <code>???</code>{' '}
              until you flip the toggle in the expanded card — useful when you
              want to reveal a boss at the right dramatic moment.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">
              Running turns
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <b>Next ▶</b> advances; <b>◀ Prev</b> goes back. The round
                counter increments when wrapping around.
              </li>
              <li>
                The turn timer is configurable — default 60 seconds. Click{' '}
                <b>▶</b> to start, <b>⏸</b> to pause, <b>↺</b> to reset to
                full.
              </li>
              <li>
                At 10 s remaining the timer flashes red. At 0 s it
                auto-advances to the next combatant and pauses there,
                waiting for you to start the next turn.
              </li>
              <li>
                The player view shows a huge countdown number and an
                animated hourglass so the whole table can see the time.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">
              Damage and healing
            </h3>
            <p>
              Every row has a quick input with <b>Dmg</b> and <b>Heal</b>{' '}
              buttons. Type a number and hit the button, or press{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">
                Enter
              </kbd>{' '}
              to apply damage. Click the row to expand for full editing of
              HP, AC, PP, initiative, notes, and name.
            </p>
            <p className="mt-2">
              The player view never shows numeric HP. Instead it shows a word
              status —{' '}
              <span className="text-emerald-300">Healthy</span>,{' '}
              <span className="text-lime-300">Hurt</span>,{' '}
              <span className="text-amber-300">Bloodied</span>,{' '}
              <span className="text-orange-300">Dire</span>,{' '}
              <span className="text-red-300">Dying</span>, or{' '}
              <span className="text-slate-400">Dead</span> if you've
              flagged them.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">
              Massive damage → injury tables
            </h3>
            <p>
              When a single hit deals ≥ a threshold percent of max HP, a
              toast prompts you to roll on the matching injury table. Default
              thresholds are 25 % and 50 %, configurable in the{' '}
              <b>settings</b> tab. Only the highest matching threshold fires.
            </p>
            <p className="mt-2">
              Each combatant triggers at most{' '}
              <b>once per turn</b>. If the same combatant takes two hits on
              the same turn, only the first fires. Turn counters reset
              automatically on every turn advance — manual reset lives in
              <b> Settings</b> or the <b>Encounter ▾</b> menu.
            </p>
            <p className="mt-2">
              Players typically roll the injury die physically. The toast
              also has a <b>Roll</b> button for the DM to preview the result.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">
              Conditions
            </h3>
            <p>
              Expand a combatant's card to toggle standard 5e conditions
              (including Exhaustion 1–6). Hover any condition chip for its
              rules blurb. Conditions show up in both the DM and player
              views.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">
              Strategy labels
            </h3>
            <p>
              Stackable tactical tags you define in <b>Settings</b> (default:{' '}
              <b>Surrounded</b>). Use the <b>+</b> / <b>−</b> buttons on each
              combatant to stack them — e.g. Surrounded 1/2/3. Purely
              informational, visible to players.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">
              Tables
            </h3>
            <p>
              The <b>tables</b> tab has Injury 25 % and Injury 50 % seeded
              with editable starter entries. Add your own tables (treasure,
              complications, wild magic…), edit ranges and results in place,
              and roll directly. Import / export individual tables as JSON.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">Dice</h3>
            <p>
              The <b>dice</b> tab has preset buttons (d4 – d100) and a
              freeform expression field that accepts things like{' '}
              <code>2d6+3</code>, <code>3d4+2d6+1</code>, or <code>d20-1</code>.
              History shows the last 30 rolls.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">
              Keyboard shortcuts
            </h3>
            <p className="mb-2">
              Active in the DM panel. They pause while you're typing into a
              field or while a dialog is open.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">Space</kbd>{' '}
                /{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">→</kbd>{' '}
                /{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">N</kbd>{' '}
                — next turn
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">←</kbd>{' '}
                /{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">P</kbd>{' '}
                — previous turn
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">A</kbd>{' '}
                — add combatant
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">T</kbd>{' '}
                — start / pause turn timer
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">R</kbd>{' '}
                — reset turn timer
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">H</kbd>{' '}
                — jump to the active combatant's HP field. Then{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">↑</kbd>/
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">↓</kbd>{' '}
                step the value,{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">Enter</kbd>{' '}
                applies damage,{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">Shift+Enter</kbd>{' '}
                heals, and{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">Esc</kbd>{' '}
                clears and unfocuses.
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">?</kbd>{' '}
                — open this help. <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">Esc</kbd> closes it.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-1">
              Save, import, reset
            </h3>
            <p>
              State auto-saves to this browser's local storage — close the
              tab and come back later, nothing is lost. Under{' '}
              <b>Encounter ▾</b>:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>
                <b>New encounter</b> — clears combatants, keeps your tables,
                settings, and strategy labels.
              </li>
              <li>
                <b>Reset injury triggers</b> — manual clear (they reset on
                turn advance anyway).
              </li>
              <li>
                <b>Export / Import encounter JSON</b> — prep fights ahead of
                time and load them at the table.
              </li>
            </ul>
          </section>
        </div>

        <footer className="px-6 py-3 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-3">
          <span>
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Esc</kbd> to
            close.
          </span>
          <div className="flex-1" />
          <a
            href="https://github.com/stephenbreen/the-breaking"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Source on GitHub
          </a>
        </footer>
      </div>
    </div>
  )
}
