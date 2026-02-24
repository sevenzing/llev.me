# Task Plan: Leaderboard

## Goal
Add a local-only Leaderboard UI to the left of the game, store entries in browser storage, and support sorting, renaming, deleting, hiding, and full reset. The Leaderboard is hidden when the Code section is open.

## Scope Summary
- New Leaderboard section in the main layout, positioned left of the game view.
- Local-only data persisted between sessions using `localStorage`.
- Entries created when a run finishes with fields: difficulty, meters, coins, manual/auto mode, and timestamp (date + minutes).
- Default entry name is `random adjective + animal`, editable inline.
- Sort by meters (default), with optional sort by coins.
- Leaderboard can be hidden with a UI toggle even when Code section is closed.
- Each entry can be deleted via a low-visibility action to reduce UI clutter.
- Ability to fully remove all leaderboard data.

## Project Context
- UI root is `src/components/CarGame.tsx` with split layout (Game vs Code Editor).
- Main game state and run lifecycle lives in `src/hooks/useGameLogic.ts`.
- Existing localStorage helpers exist in `src/utils/codePersistence.ts`; mirror style or add a new helper for leaderboard storage.
- The app uses Tailwind v4 + CSS modules.

## Implementation Plan

1. Locate game end trigger and data source.
- Inspect `src/hooks/useGameLogic.ts` for the run end condition and final score data.
- Identify exact values for meters, coins, difficulty, mode (manual/auto), and run end timestamp.
- Ensure “game done” refers to existing end-of-run event, not just pause.

2. Define data model and storage.
- Create a new type `LeaderboardEntry` in `src/types` or a local type in the new component.
- Fields:
  - `id`: string (uuid or timestamp-based).
  - `name`: string (default generated).
  - `difficulty`: string or enum matching game difficulty values.
  - `meters`: number.
  - `coins`: number.
  - `mode`: "manual" | "auto".
  - `createdAt`: number (ms since epoch).
- Add a small storage utility in `src/utils/leaderboardPersistence.ts`.
  - `loadLeaderboard(): LeaderboardEntry[]`.
  - `saveLeaderboard(entries: LeaderboardEntry[]): void`.
  - `clearLeaderboard(): void`.
- Storage key name, e.g. `car-game:leaderboard:v1`.
- On load, validate/guard against malformed data.

3. Add name generator.
- Create `src/utils/nameGenerator.ts` or inline in component.
- Provide two lists: adjectives + animals.
- Randomly select, combine into `"Brave Fox"` style.
- If a generated name already exists, allow duplicates or loop with a max retry to avoid duplicates.

4. Create Leaderboard component.
- New file `src/components/Leaderboard.tsx`.
- Props:
  - `entries`, `onRename`, `onDelete`, `onClear`, `sortBy`, `onSortChange`, `hidden`, `onToggleHidden`.
- UI elements:
  - Header: `Leaderboard` title, hide toggle, small sort control (Meters/Coins).
  - Each entry has TWO lines:
    - **Top:** rank, score meters (white bold `6m`), coins (yellow `🪙0`), difficulty badge, mode badge.
    - **Bottom:** name (click-to-edit inline), `latest` badge (on most-recent entry only), date.
  - Most recently added entry highlighted with a left accent border + “latest” badge.
  - Delete action appears on row hover (low-visibility ✕ button, right side).
  - “Clear All” button behind a `confirm()`.

5. Integrate into layout.
- Render Leaderboard with `position: fixed` so it does NOT affect the game's layout or position.
- Position it centered in the free space to the left of the game:
  `left: calc(25vw - 100px); transform: translate(-50%, -50%); top: 50%`
  (game canvas = 400 px wide, centered at 50 vw; left free-space center ≈ 25 vw - 100 px).
- Max height = canvas height (500 px). Overflow-y scrollable.
- When Code Editor is open, hide Leaderboard entirely (do NOT render it).
- When Code Editor is closed, allow manual hide/show with a toggle button.
- Keep the existing split-pane behavior; game position must NOT shift when Leaderboard shows/hides.

6. Wire run completion to Leaderboard entry creation.
- In `useGameLogic.ts`, on run end, call a callback passed from `CarGame.tsx` like `onGameComplete`.
- Define `onGameComplete` in `CarGame.tsx` to append a new entry.
- Ensure it only fires once per completed run.
- Use `createdAt = Date.now()` and display as local date + minutes in the UI.

7. Sorting logic.
- Sorting state kept in `CarGame.tsx` or `Leaderboard.tsx`.
- Default to sort by meters descending.
- If sort by coins is selected, sort by coins descending.
- Sorting should not mutate stored data ordering unless intended.

8. Hidden state logic.
- Keep a local UI-only `isLeaderboardHidden` state in `CarGame.tsx`.
- Do not store hidden state unless explicitly desired.
- If Code Editor is open, force hide regardless of toggle.

9. Delete and clear actions.
- Single entry delete updates state and persisted data.
- Clear all removes all entries and calls `clearLeaderboard()`.
- Make delete UI unobtrusive, e.g., show on hover or inside row actions menu.

10. Styling.
- Use Tailwind or CSS module consistent with existing design.
- Keep list compact, readable, and avoid visually dominating the game.
- Ensure Leaderboard collapses gracefully on small screens.

## UI Behavior Details
- Leaderboard is visible only when Code section is closed and user has not hidden it.
- Entries are always sorted by the active sort.
- Name editing is inline (bottom line); if empty, revert to previous name.
- Date display format: `23 Feb, 14:35` (custom formatter, NOT toLocaleString).
- The most recently added entry (highest `createdAt`) shows a `latest` badge on its bottom line
  and a left-side accent border in `--primary-color`.
- Max height = 500 px (matches canvas height); list scrolls when there are many entries.

## Acceptance Checklist
- Leaderboard appears to the left of the game.
- Hidden whenever Code section is open.
- New entry created on game completion with all required fields.
- Default name is random adjective + animal.
- Name can be edited inline.
- Sorting by meters or coins works.
- Leaderboard can be toggled hidden when Code is closed.
- Entries can be deleted via low-visibility UI action.
- Leaderboard persists across reloads.
- Clear all fully removes data.

## Files Likely Touched
- `src/components/CarGame.tsx`
- `src/components/Leaderboard.tsx` (new)
- `src/hooks/useGameLogic.ts`
- `src/utils/leaderboardPersistence.ts` (new)
- `src/utils/nameGenerator.ts` (optional new)
- `src/types/leaderboard.ts` (optional new)

## Open Questions for Reviewer
- Confirm exact criteria for “game done” (loss, win, or manual stop).
  ANSWER: loss, win — manual STOP button must NOT record an entry.
- Confirm whether manual hide state should persist across sessions.
  ANSWER: yes
- Confirm desired date format for the entry display.
  ANSWER: 23 Feb, 14:35

## Implementation Notes (lessons from first attempt)

### Bug: double entry created on game-over (React StrictMode)
- **Root cause:** `endGame(true)` was called _inside_ a `setGameState(prev => { ... })` updater
  function. React StrictMode double-invokes state updaters in development to catch side effects,
  so the callback fires twice and two entries are created with different names.
- **Fix A:** Move `endGame(true)` _outside_ the `setGameState` call. After `setGameState`
  completes, read `gameStateRef.current.lives` (which is set inside the updater via
  `gameStateRef.current = newState`) and call `endGame(true)` if `lives <= 0`.
- **Fix B (belt-and-suspenders):** Add a `gameEndCallbackFiredRef = useRef(false)` that is reset
  to `false` in `startGame` and set to `true` the first time `endGame` fires the callback.
  Guard the callback with `!gameEndCallbackFiredRef.current` so it can never fire twice.

### Bug: manual STOP (or "press play after loss") still records a result
- **Root cause A:** Async `executeUserCode` promises (from the old run) can resolve AFTER the user
  presses STOP and then Play. At that point `gameEndCallbackFiredRef` was reset by `startGame`,
  so `handleCodeError` → `endGame(true)` fires for the new run.
- **Root cause B:** `handleCodeError` doesn't check whether the game is still running before
  calling `endGame(true)`, so any late-arriving async error triggers a recording.
- **Fix:**
  1. Add `isGameRunningRef = useRef(false)`. Set `true` in `startGame`, `false` in `endGame`
     (synchronously, BEFORE the callback guard check, so `wasRunning` captures the right value).
  2. Also set `gameStateRef.current.isRunning = false` synchronously in `endGame` so that
     stale game-loop frames that slip through see the correct state.
  3. Add `if (!isGameRunningRef.current) return;` at the top of `handleCodeError`.
  4. Add `runIdRef = useRef(0)`, increment in `startGame`. Capture it before each async
     `executeUserCode` call; in `.then`/`.catch` callbacks, `if (runIdRef.current !== capturedRunId) return;`
     to discard stale executions from an old run that resolved after `startGame` was called.
  5. Add `if (!gameStateRef.current.isRunning) return;` at the start of the `gameLoop` body
     (in addition to the stale-closure `gameState.isRunning` check) as a belt-and-suspenders guard.

### Bug: leaderboard shifts game position
- **Root cause:** Leaderboard rendered as a flex sibling pushes the game column to the right.
- **Fix:** Use `position: fixed; left: …; top: 50%; transform: translateY(-50%);` for the
  leaderboard container. Fixed-position elements are removed from document flow, so the game
  layout is unaffected. On screens < 900 px hide it (already done via media query).

### Design: card style, not sidebar style
- The leaderboard must look like a **floating card** (rounded corners, box-shadow, compact width)
  placed beside the game, NOT as a full-height sidebar/menu attached to the viewport edge.

### Theming: transparent mode + mainColor
- New UI panels (like the leaderboard) should use CSS custom properties for all colors so they
  automatically react to the `?background=transparent` and `?mainColor=…` URL params.
- Define defaults in `:root` (e.g., `--panel-bg`, `--panel-bg-header`, `--panel-border`).
- In `CarGame.tsx`, extend the existing Twitch-stream style injection to also override these
  panel variables when `background=transparent` is active.
- Components use `var(--panel-bg, fallback)` in their CSS modules — no component-specific
  override code required.
