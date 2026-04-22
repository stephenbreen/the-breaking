# The Breaking

A two-panel, browser-only initiative tracker for tabletop RPG dungeon masters.
One laptop, two windows: the DM drives from the primary window and a read-only
player view is popped out onto a second monitor or TV.

No backend, no accounts, no SRD data. The DM types in the combatants they care
about, the players see what they should see, and the two views stay in sync
via `BroadcastChannel` in the same browser.

> Inspired by the layout of [Kobold+](https://koboldplus.club/), but stripped
> of SRD content and extended with per-turn timers, configurable massive-damage
> triggers, and DM-authored roll tables.

---

## Features

### Initiative and turn flow
- Add combatants (PC or monster/NPC) with the stats that matter at the table:
  name, max HP, current HP, AC, passive perception, initiative.
- Auto-sorted turn order; `Prev` / `Next` cycle turns and bump the round
  counter when wrapping.
- Current turn is highlighted on both the DM and the player panels.

### Per-turn countdown timer
- Configurable seconds-per-turn (default 60).
- Pause, resume, reset.
- At ≤10 seconds the timer flashes red.
- When it hits zero it auto-advances to the next combatant and pauses there.
- The player view shows a giant countdown number alongside an animated SVG
  hourglass that drains from the top bulb into the bottom bulb, so players at
  the far end of the table can see how much time they have left at a glance.

### HP bookkeeping
- Separate `Damage` and `Heal` inputs on each combatant card.
- HP bar and a status word (`Healthy`, `Hurt`, `Bloodied`, `Dire`, `Dying`,
  `Dead`). Players see only the status word, never numeric HP.

### Massive-damage triggers (injury tables)
- A single hit dealing ≥ *threshold* % of max HP fires an injury-table prompt
  to the DM.
- Default thresholds are **25 %** and **50 %**, configurable in the Settings
  tab. If both apply to one hit, only the higher fires.
- Each threshold fires at most once per combatant per encounter.
  ("Reset triggers" from the Encounter menu clears them — e.g. after a long
  rest in-fiction.)
- The toast points the DM at the matching table. Players physically roll their
  injury die; a `Roll` button also exists for the DM to preview the result.

### DM-authored roll tables
- Injury 25 % and Injury 50 % are seeded with editable starter entries.
- Add new tables (treasure, complications, wild magic, whatever). Each table
  has a name, a dice expression, and a list of `range → text` entries.
- Import / export individual tables as JSON.

### Conditions and strategy labels
- Standard 5e conditions (including Exhaustion 1–6) as toggleable chips.
- DM-defined stackable **strategy labels** (e.g. `Surrounded 1`, `Surrounded 2`,
  `Surrounded 3`) that are visible on both the DM and player views. Purely
  informational — they do not apply mechanics automatically.

### Player-view visibility controls
- Per-combatant `Show name to players` toggle. When off, players see `???`
  instead of the real name.
- Players never see numeric HP, AC, passive perception, or DM notes — only
  the HP status word, conditions, strategy labels, and initiative order.

### Dice roller
- Preset dice buttons (`d4` – `d100` and `2d6`) plus a freeform expression
  field (`2d6+3`, `1d20-1`, `3d4+2d6+1`).
- Rolling history (last 30) with per-die results and modifier breakdown.

### Encounter persistence
- State auto-saves to `localStorage` on every change. Refreshing either window
  resumes exactly where you left off.
- `Encounter ▾` menu exports the entire encounter as JSON and imports one
  back. Good for prepping fights ahead of time.

---

## Getting started

```bash
git clone git@github.com:stephenbreen/the-breaking.git
cd the-breaking
npm install
npm run dev
# open http://localhost:5173/
```

Once the DM window is up, click **Player View ↗** in the header. A popup opens
at `?view=player` — drag it to your second monitor or TV and leave it there
for the session.

### Scripts

| Script             | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Vite dev server with HMR                       |
| `npm run build`    | Typecheck + production build into `dist/`      |
| `npm run preview`  | Serve the built bundle locally                 |
| `npm run typecheck`| Just `tsc --noEmit`                            |

---

## Architecture

The goal was a no-server, zero-auth app that runs on one laptop and keeps two
windows in lockstep. Everything below falls out of that constraint.

### 1. Stack

- **Vite + React 18 + TypeScript** — fast dev loop, no SSR, no routing library.
- **Tailwind CSS** — all styling is utility-classes, no design system
  dependency.
- **Zustand** with the `persist` middleware — single global store, actions live
  next to state, automatic `localStorage` mirroring.
- **BroadcastChannel** — browser-native cross-window messaging, no polyfill.

Total runtime dependencies: `react`, `react-dom`, `zustand`. That's it.

### 2. Two views, one bundle

The app ships as a single HTML/JS bundle served by Vite. `src/main.tsx`
inspects the URL at boot:

```ts
const isPlayerView =
  new URLSearchParams(location.search).get('view') === 'player' ||
  location.hash === '#player'
```

If `view=player`, it mounts `<PlayerView />`. Otherwise it mounts `<App />`
(the DM panel). The DM's **Player View ↗** button opens a new window at
`?view=player`, which the OS / browser lets you drag to a second monitor.

Keeping it one bundle means one dev server, one deploy target, and one source
of truth for the store definition.

### 3. State: single Zustand store

`src/store.ts` defines one store that owns the entire encounter:

```
EncounterState = {
  combatants: Combatant[]
  currentTurnIndex, round
  timerSeconds, timerRemaining, timerRunning
  thresholds: number[]               // e.g. [25, 50]
  strategyLabelNames: string[]       // e.g. ['Surrounded']
  tables: RollTable[]
  lastTrigger: TriggerInfo | null    // drives the injury-toast UI
}
```

All mutations go through named actions (`applyDamage`, `nextTurn`,
`toggleCondition`, …) colocated with the state. Components subscribe with
selectors (`useStore(s => s.combatants)`) so re-renders are surgical.

`lastTrigger` is intentionally **not** broadcast to the player window — it is
a DM-only UI signal that pops a toast when a massive-damage threshold fires.

### 4. Persistence: Zustand's `persist` middleware

Every state change is mirrored into `localStorage` under
`the-breaking-encounter`. The `partialize` function strips `lastTrigger`
before serialising, so the DM never reopens into a stale toast.

On startup, Zustand rehydrates synchronously from `localStorage`, so the UI
renders the last known state before anything else touches the network.

### 5. Cross-window sync: `BroadcastChannel`

A module-level block at the bottom of `src/store.ts` wires up a channel
called `the-breaking-sync` and subscribes to the store.

**Broadcast path (DM → player):**

```
DM action  →  zustand set()  →  subscribe() fires  →  snapshot the data
                                                  →  postMessage on channel
                                                  →  player's onmessage
                                                  →  useStore.setState(snapshot)
                                                  →  player UI re-renders
```

Three subtleties worth knowing about:

1. **Who owns the clock.** Only the DM window mounts `<Timer />`, which holds
   the `setInterval` that ticks `timerRemaining` down each second. The player
   window just displays whatever it receives. One clock, no drift, no "whose
   `setInterval` wins" race.
2. **No echo loop.** When the player receives a message and calls
   `setState`, a `receiving` flag is set first so the player's own subscribe
   callback doesn't immediately re-broadcast what it just got.
3. **Late joiners.** When a new window (e.g. the popup) opens, it posts
   `{ type: 'request' }` 100 ms after load. Any other window responds with its
   current snapshot. Combined with `localStorage` rehydration, this means the
   player view always catches up — even if it opens mid-combat.

The hourglass animates smoothly between integer-second ticks via CSS
transitions on the SVG `<rect>` `y` and `height` attributes (1 s linear), so
the sand drain looks continuous despite the state updating once per second.

### 6. Massive-damage trigger flow

When the DM clicks `Damage` with an amount `d` on a combatant with `maxHP m`:

1. `applyDamage(id, d)` computes `pct = d / m * 100`.
2. It scans `state.thresholds` highest-first; the first threshold `t` where
   `pct ≥ t` **and** `t` has not already fired for this combatant is the
   winner.
3. The combatant's HP is reduced and `t` is appended to
   `firedThresholds` so the same threshold cannot re-fire later in the
   encounter.
4. `state.lastTrigger` is set, which renders `<InjuryToast />`.
5. The toast finds the table whose `builtIn` matches `injury25` or
   `injury50` (falling back to a name-based match) and offers a `Roll` button
   that evaluates the table's dice expression and looks up the matching range.
6. `Encounter ▾ → Reset injury triggers` clears the `firedThresholds` array
   for every combatant — useful after a long rest.

### 7. File layout

```
src/
├── main.tsx              URL router → App or PlayerView
├── App.tsx               DM shell (header + split panel)
├── PlayerView.tsx        Read-only player popout
├── store.ts              Zustand store + persist + BroadcastChannel sync
├── types.ts              Combatant, RollTable, EncounterState, TriggerInfo
├── data/
│   ├── conditions.ts     Standard 5e conditions list
│   └── defaultState.ts   Starter tables + empty encounter
├── utils/
│   ├── dice.ts           rollExpression + matchTableEntry
│   ├── hpStatus.ts       HP → word status + colour class
│   └── id.ts             Opaque ids for combatants / entries / tables
└── components/
    ├── Timer.tsx                  DM-side countdown with pause / reset
    ├── Hourglass.tsx              SVG hourglass used on player view
    ├── InitiativeList.tsx         Renders the ordered list of cards
    ├── CombatantCard.tsx          Expandable card: damage, heal, conditions, …
    ├── AddCombatantModal.tsx      Dialog for adding a PC / monster
    ├── DiceRoller.tsx             Preset buttons + freeform expression
    ├── TablesPanel.tsx            List + editor for roll tables
    ├── InjuryToast.tsx            Toast shown when a threshold fires
    ├── EncounterMenu.tsx          New / Reset triggers / Import / Export
    └── SettingsPanel.tsx          Thresholds + strategy label management
```

### 8. Explicit non-goals (for v1)

- **Multi-device / hosted play.** BroadcastChannel is same-origin,
  same-browser only. Two devices would need a tiny Node/WebSocket server.
- **Per-player views.** The popout is a single shared player screen, not one
  view per player.
- **SRD / monster library.** Intentional — the DM types in the combatants
  they care about.
- **Condition duration tracking.** Conditions are simple on/off toggles; the
  DM remembers duration.
- **Undo.** Save / export encounter JSON instead.

---

## License

MIT — see [LICENSE](LICENSE).
