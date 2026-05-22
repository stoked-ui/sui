# Testing Strategy: `@stoked-ui/timeline`

> **Generated:** 2026-05-21 | **Meta version:** 0.4.0
> **Package:** `packages/sui-timeline` (`@stoked-ui/timeline` v0.1.3)
> **Priority:** Medium
> **Source entry:** `packages/sui-timeline/src/index.ts`

`@stoked-ui/timeline` is a hybrid package: a **headless playback engine** (`Engine`, `Controller`, `TimelineFile`, pure pixel/time math) plus a **DOM/interactjs/react-virtualized UI surface** (`Timeline`, `TimelineTrack`, `TimelineCursor`, `TimelineProvider`). The two halves have very different testability profiles and must be tested with different strategies. The headless half is high-leverage and easy to unit-test today; the UI half requires JSDOM stubs for `requestAnimationFrame`, `interactjs`, `react-virtualized`'s `AutoSizer`, and Howler.

This package is consumed by `@stoked-ui/editor`, `docs/`, and any external timeline integrator. A regression in `Engine.tick`, `setTime`, or `_dealEnter`/`_dealLeave` silently corrupts the editor playhead, so engine tests should be ship-blocking.

---

## 1. Current State

| Item | Status |
|---|---|
| Test runner | Mocha 10 (root `.mocharc.js`) — Babel + JSDOM |
| Setup | `@stoked-ui/internal-test-utils/setupBabel`, `@stoked-ui/internal-test-utils/setupJSDOM` |
| Assertions | `chai` + `sinon` (per repo convention; see `sui-editor`, `sui-file-explorer`) |
| Per-package script | None — `package.json` has no `test` entry. Runs from root via `pnpm test` / `pnpm test:coverage`. |
| Karma / browser tests | Repo-level config exists (`test/karma.conf.js`) but no timeline specs feed it. |
| CI gating | None for this package specifically; rolls into the umbrella `test:repo:no-docs` turbo task. |

### Existing test files

- `src/themeAugmentation/themeAugmentation.spec.ts` — Type-only spec (validates that `MuiTimeline` / `MuiTimelineAction` augment the MUI theme). Verified by `tsc`, not Mocha. **This is the only existing test in the package.**

### Critical gap

There is effectively zero runtime test coverage for ~4,500 LOC across 100+ files. The most consequential class — `Engine` (`src/Engine/Engine.ts`, 665 LOC) — is completely untested despite owning the RAF loop, state machine, action lifecycle, and event emission that every consumer depends on.

> **Note on framework choice:** an earlier version of this file recommended Jest + ts-jest. That recommendation is rescinded. The monorepo's canonical runner is Mocha (root `.mocharc.js`, used by `sui-editor`, `sui-file-explorer`, `sui-common-api`). `sui-media` is an outlier on Jest. **New timeline tests should target Mocha + chai + sinon** for consistency with the closest consumers (`sui-editor`) and to leverage the existing `@stoked-ui/internal-test-utils` setup.

---

## 2. What Should Be Tested

### Tier 1 — Critical, ship-blocking (write first)

#### 2.1 `Engine` headless playback logic — `src/Engine/Engine.ts`

This is the highest-leverage target in the package. Every method below is pure or easily isolated with a stub controller, and a regression breaks every editor.

- **State machine** (`get isLoading`, `isReady`, `isPlaying`, `isPaused`)
  - Constructor throws on missing `params.controllers` (line 78).
  - `setTracks` transitions `LOADING → READY` (line 197) and is idempotent on subsequent calls.
  - `pause()` only acts when `isPlaying` (line 401); `play()` calls `run()` and forces `_playRate = 1`.
  - `run()` returns `false` when already playing or when `toTime <= currentTime` (line 349).
- **Time math**
  - `setTime(time)` updates `_currentTime`, resets `_next = 0`, fires `beforeSetTime` (cancelable) and `afterSetTime`.
  - `setTime(time, true)` (tick path) fires `setTimeByTick`, **not** `afterSetTime`, and skips the `beforeSetTime` veto.
  - `get duration` returns `media.duration` in `TRACK_FILE`/`MEDIA` modes, else `canvasDuration`.
  - `canvasDuration` returns the max `action.end` across `_actionMap`.
- **Play rate**
  - `setPlayRate` is vetoed when `beforeSetPlayRate` returns `false` (line 208).
  - `rewind(delta)` clamps to negative range, `fastForward(delta)` clamps to positive range (lines 315–331).
- **Action lifecycle** (`_dealEnter`, `_dealLeave`, `_dealClear`, `tickAction`)
  - `_dealEnter`: actions with `disabled: true` are skipped; entry stops at first `action.start > time` (sorted iteration, line 601); `track.dim` actions are not entered.
  - `_dealLeave`: actions outside `[start, end]` window have `controller.leave` invoked and are removed from `_activeIds`.
  - `_dealClear`: drains the BTree and calls `controller.leave` on every active action; resets `_next = 0`.
  - `tickAction` is a no-op while `isLoading`.
- **Event emission**
  - `Emitter.on` / `off` / `trigger` (`src/Engine/emitter.ts`): `on` throws on unknown event; `trigger` returns `false` if **any** handler returns `false`; `off` with no handler clears all listeners.
  - All 11 events in `Events` (`src/Engine/events.ts`) fire with the documented `{ engine, … }` payload.
- **`_tick` integration** (the loop)
  - With faked `requestAnimationFrame`, an `Engine` driven through `run({ toTime })` advances `_currentTime` and stops at `toTime`.
  - `autoEnd` triggers `ended` once `_next >= _actionSortIds.length && _activeIds.length === 0`.
  - Reverse playback (`_playRate < 0`) ends when `initialTime < 0`.

#### 2.2 `Controller` base class — `src/Controller/Controller.ts`

- `Controller.getActionTime`: with no `action.duration`, returns `trimStart || 0`; with duration, returns `(time - start + trimStart) % duration` (looping).
- `Controller.getVol(volumePart)` destructures `[volume, start?, end?]`.
- `Controller.getVolumeUpdate`:
  - returns `undefined` when `volumeIndex === -2`.
  - returns reset `{ volume: 1.0, volumeIndex: -1 }` when the active window has ended (line 113–116 in Controller.ts).
  - returns the matching window when `volumeIndex === -1`.
- `isValid(engine, track)` returns `!track.dim`.

#### 2.3 Pixel/time utilities — `src/utils/deal_data.ts`

Pure functions, no mocks needed. These underpin every rendered position in the UI; a regression here misaligns every action block on screen.

- `parserTimeToPixel(time, { startLeft, scale, scaleWidth })`
- `parserPixelToTime(...)` — round-trips with `parserTimeToPixel` to within float precision.
- `parserTransformToTime({ left, width }, …)` returns `{ start, end }`.
- `parserTimeToTransform({ start, end }, …)` returns `{ left, width }`.
- `getScaleCountByRows(tracks, { scale })` — handles empty tracks (returns 2 = `0 + ADD_SCALE_COUNT`), tracks with empty `actions`, and single-action max.
- `getScaleCountByPixel(data, { startLeft, scaleWidth, scaleCount })` — never returns less than `scaleCount`.
- `parserActionsToPositions(actions, …)` returns interleaved `[start_px, end_px, …]`.

### Tier 2 — High value, write next

#### 2.4 `TimelineFile` model — `src/TimelineFile/TimelineFile.ts`

- Constructor without `props.tracks` yields `_tracks = []` (line 78–80).
- `actionInitializer` assigns `volumeIndex = -2` when `action.volume` is missing, `-1` when present.
- Missing `action.id` is filled via `namedId('action')`; missing `track.id` via `namedId('track')`.
- Controller resolution priority: explicit `track.controller` → `track.controllerName` → `track.file.mediaType` (lines 91–96).
- `mediaFiles` getter returns the `file` from each track in order.
- Command pattern: `RemoveActionCommand`, `RemoveTrackCommand` in `src/TimelineFile/Commands/` should round-trip (`execute` then `undo` returns identical state).

#### 2.5 `AudioController` — `src/Controller/AudioController.ts`

Howler is the heavy external dep here. Stub `Howl` at the module boundary (sinon `replace` on the import, or a `__mocks__/howler.ts` mapped via Babel config).

- `preload`: creates a `Howl` with `track.file.url`, sets `action.duration` from the (stubbed) `onload`.
- `start`: calls `item.rate`, `item.seek`, and `item.play` only when `engine.isPlaying`; registers `afterSetTime` + `afterSetPlayRate` listeners on the engine.
- `stop`: removes both listeners and calls `item.stop` + `item.mute`.
- `update`: applies `getVolumeUpdate` results to `item.volume` and writes back `action.volumeIndex`.
- `getActionStyle`: returns `null` when `action.backgroundImage` is missing; otherwise computes `backgroundPosition` / `backgroundSize` from `scaleWidth / scale` and `trimStart` / `duration`.

#### 2.6 `TimelineProvider` reducer — `src/TimelineProvider/TimelineProvider.tsx`

The reducer is the source of truth for selected project/track/action, settings, and the command/undo stacks. Test in isolation with `@testing-library/react`'s `renderHook` + the provider, using a fixture `TimelineFile`.

- Initial state matches `TimelineProviderProps.defaultState`.
- `SET_FILE` action replaces the file and resets selection.
- `SELECT_ACTION` / `SELECT_TRACK` / `SELECT_PROJECT` mutually clear.
- `EXECUTE_COMMAND` pushes onto the undo stack and clears the redo stack.
- `UNDO` / `REDO` round-trip a `RemoveActionCommand` to identical file state.

### Tier 3 — Defer (manual / Karma)

These paths require a real browser or substantial JSDOM scaffolding. Manual smoke on `localhost:5199` until Karma is wired up for this package.

- `Timeline.tsx` full render — `react-virtualized` + `AutoSizer` need DOM measurement; covered indirectly via `sui-editor` integration.
- `TimelineTrack.tsx` drag/drop and resize via `interactjs` (`Interactable/`).
- `useAutoScroll` (`src/TimelineTrack/useAutoScroll.ts`) — RAF + scroll measurement.
- `TimelineCursor` drag-scrub interaction.
- `StokedUiTimelineApp` mime registration (`src/Timeline/StokedUiTimelineApp.ts`) — exercised by docs build.

---

## 3. Test File Organization

Follow the repo's `__tests__/` convention (used in `sui-media`, `sui-common`, `sui-file-explorer`). Co-locate tests next to the code they exercise so a refactor moves them together.

```
packages/sui-timeline/src/
├── Engine/
│   ├── Engine.ts
│   ├── emitter.ts
│   ├── events.ts
│   └── __tests__/
│       ├── Engine.state.test.ts          # state machine, isReady/isPlaying/isPaused
│       ├── Engine.time.test.ts           # setTime, duration, canvasDuration, playRate
│       ├── Engine.lifecycle.test.ts      # _dealEnter, _dealLeave, _dealClear, tickAction
│       ├── Engine.tick.test.ts           # RAF loop with sinon.useFakeTimers
│       └── emitter.test.ts               # on/off/trigger/exist/bind/offAll
├── Controller/
│   └── __tests__/
│       ├── Controller.test.ts            # getActionTime, getVol, getVolumeUpdate, isValid
│       └── AudioController.test.ts       # preload/start/stop/update with stubbed Howl
├── TimelineFile/
│   └── __tests__/
│       ├── TimelineFile.test.ts          # construction, actionInitializer, controller resolution
│       └── Commands.test.ts              # RemoveAction/RemoveTrack execute+undo round-trip
├── TimelineProvider/
│   └── __tests__/
│       └── TimelineProvider.test.tsx     # reducer + hook smoke via renderHook
├── utils/
│   └── __tests__/
│       └── deal_data.test.ts             # pure pixel/time math
└── test/
    └── fixtures/
        ├── actions.ts                    # buildAction({ start, end, ... }): ITimelineAction
        ├── tracks.ts                     # buildTrack({ actions, controller }): ITimelineTrack
        ├── controllers.ts                # createStubController() with sinon spies on enter/leave/update
        └── engine.ts                     # createEngine({ tracks }) — factory with default controllers
```

**Naming:** match the existing `.test.ts` / `.test.tsx` convention used in `sui-editor` and `sui-media`. Reserve `.spec.ts` for type-only checks (matching `themeAugmentation.spec.ts`).

---

## 4. Mock & Stub Strategy

| External dep | Strategy |
|---|---|
| `requestAnimationFrame` / `cancelAnimationFrame` | `sinon.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })`. Drive `_tick` via `clock.tick(ms)`. |
| `howler` (`Howl`) in `AudioController` | Stub at module boundary. Either `sinon.replace(howlerModule, 'Howl', fakeHowl)` or a Babel module-name-mapper to a fake in `test/__mocks__/howler.ts`. The fake exposes `seek`, `rate`, `play`, `stop`, `mute`, `volume`, `duration` as `sinon.spy()`s. |
| `interactjs` (`@interactjs/*`) in `Interactable` | Not needed for Tier 1/2. When testing `Interactable`, stub the default `interact` export to a no-op chainable; the wrapper at `src/Interactable/` is thin enough that asserting the call surface is sufficient. |
| `react-virtualized` `AutoSizer` | Not exercised in Tier 1/2. When unavoidable, wrap the component under test in a parent that forwards explicit `width`/`height` props, bypassing `AutoSizer`. |
| `@stoked-ui/media` (`MediaFile`, `AppFile`, `ScreenshotQueue`) | Use real implementations — these are workspace deps with their own tests. For `TimelineFile` tests, build `MediaFile` instances from `Blob` fixtures rather than fetching URLs. |
| `@mui/material/styles` `alpha`, `compositeColors` | Use real implementations; both are pure. |
| `HTMLMediaElement` (Engine's `media`) | Hand-rolled stub: `{ play: spy, pause: spy, currentTime: 0, duration: 30, style: {} }`. Do not rely on JSDOM's `<video>` — it does not implement playback. |
| `console.info` noise (Engine logs lines 350, 508, 513, 520, 523; AudioController logs) | Wrap the Engine under test with `engine.logging = false` (the default), and silence stray `console.info` calls in `tick`/`_end` with `sinon.stub(console, 'info')` in `beforeEach`, restored in `afterEach`. |

**Fixture builders, not literals.** Every test that constructs an `ITimelineAction` or `ITimelineTrack` should use `buildAction({ start: 0, end: 5 })` / `buildTrack({ actions: [...] })` from `test/fixtures/`. The action shape has 15+ optional fields; literals scattered across files become a maintenance tax the first time the type changes.

**Stub controller.** Every Engine test should use a `createStubController()` that records `enter`/`leave`/`update`/`start`/`stop` calls as sinon spies. Do not pull in `AudioController` for Engine tests — keep Engine tests offline-friendly and independent of Howler.

---

## 5. Coverage Targets

Priority is **Medium**, but the engine is load-bearing. Tier the targets:

| Module | Target line coverage | Rationale |
|---|---|---|
| `src/Engine/**` | **80 %** | Headless, easy to test, regressions are silent and consumer-visible. |
| `src/Controller/Controller.ts` + `Controllers.ts` | **90 %** | Tiny surface, all pure static helpers — should be near-total. |
| `src/Controller/AudioController.ts` | **70 %** | Stubbed Howler lets us cover preload/start/stop/update; full integration is manual. |
| `src/utils/deal_data.ts` | **95 %** | Pure math, no excuses. |
| `src/TimelineFile/**` | **70 %** | Construction logic and command pattern are testable; URL loading is integration territory. |
| `src/TimelineProvider/**` | **60 %** | Reducer + hook coverage; rendered provider tree is partial. |
| `src/Timeline/**`, `src/TimelineTrack/**`, `src/TimelineCursor/**`, `src/Interactable/**`, `src/TimelineLabels/**`, `src/TimelinePlayer/**`, `src/TimelineScrollResizer/**`, `src/TimelineTrackArea/**` | **30 %** smoke renders only | DOM-heavy, virtualized, interactjs-bound — defer to Karma / manual. |
| `src/**/*.types.ts`, `src/**/*.types.d.ts`, `src/**/index.ts`, `src/themeAugmentation/**` | **excluded** | Types and barrels. |

**Aggregate package target: 55 % lines / 50 % branches.** Treat the Engine and `deal_data` thresholds as ratcheted minimums in any future CI gate; treat the UI numbers as informational until a browser harness exists.

---

## 6. Order of Implementation (first PRs)

The point of ordering is to get the highest-confidence headless tests landed before touching the DOM-heavy surface. Each row is a single PR.

| # | PR | Files added | Why first |
|---|---|---|---|
| 1 | **Fixture harness** | `test/fixtures/{actions,tracks,controllers,engine}.ts` | Every later test depends on these factories; landing them alone is risk-free. |
| 2 | **`deal_data` pure math** | `src/utils/__tests__/deal_data.test.ts` | Zero mocks, immediate coverage, validates the round-trip property `parserPixelToTime(parserTimeToPixel(t)) ≈ t`. |
| 3 | **`Emitter` + `Events`** | `src/Engine/__tests__/emitter.test.ts` | Foundation for every Engine event assertion. |
| 4 | **`Controller` static helpers** | `src/Controller/__tests__/Controller.test.ts` | Pure functions; covers volume-curve logic which is otherwise impossible to verify by reading. |
| 5 | **`Engine` state + time** | `src/Engine/__tests__/Engine.state.test.ts`, `Engine.time.test.ts` | Locks down `setTime`, `setPlayRate`, state machine, and event emission before touching the RAF loop. |
| 6 | **`Engine` lifecycle** | `src/Engine/__tests__/Engine.lifecycle.test.ts` | `_dealEnter` / `_dealLeave` / `_dealClear` with stub controllers — the most complex correctness contract in the package. |
| 7 | **`Engine` tick loop** | `src/Engine/__tests__/Engine.tick.test.ts` | Uses `sinon.useFakeTimers` to drive `_tick`; depends on (5) and (6) being green. |
| 8 | **`TimelineFile`** | `src/TimelineFile/__tests__/TimelineFile.test.ts` | Construction, `actionInitializer`, controller resolution priority. |
| 9 | **`Commands`** | `src/TimelineFile/__tests__/Commands.test.ts` | `execute` / `undo` round-trip for `RemoveActionCommand` and `RemoveTrackCommand`. |
| 10 | **`AudioController` with stubbed Howler** | `src/Controller/__tests__/AudioController.test.ts` | First test that mocks an external module — cleanest to land after the engine baseline is green. |
| 11 | **`TimelineProvider` reducer** | `src/TimelineProvider/__tests__/TimelineProvider.test.tsx` | First React test; verifies selection / undo-redo state machine. |

**After PR 11**, the package will have ~50–55 % line coverage concentrated on the load-bearing logic. UI rendering (Timeline, TimelineTrack, Interactable, scroll/resize) becomes a separate workstream contingent on Karma being wired up for `sui-timeline` and is explicitly out of scope for the initial push.

---

## 7. Acceptance Checks

Any change to this file or to the test scaffolding must satisfy:

- `pnpm --filter @stoked-ui/timeline tsc -p tsconfig.json` exits 0 (types still compile, including `themeAugmentation.spec.ts`).
- `pnpm test --grep "@stoked-ui/timeline"` from the repo root runs the new specs through Mocha + JSDOM.
- No test imports `Howl` directly from `howler` — all audio paths go through a stub or `test/__mocks__/howler.ts`.
- No test relies on real `requestAnimationFrame` timing — every tick-driven test uses `sinon.useFakeTimers`.
- New `__tests__/` directories sit next to the code under test; no orphaned `test/` siblings outside `test/fixtures/`.
