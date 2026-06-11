# Testing Strategy: `@stoked-ui/timeline`

> **Generated:** 2026-05-21 | **Refreshed:** 2026-06-06 (verified line-by-line against source; corrected test-layout convention, `getScaleCountByRows`/event counts, added a TDD red-first bug ledger) | **Meta version:** 0.4.0
> **Package:** `packages/sui-timeline` (`@stoked-ui/timeline` v0.1.3)
> **Priority:** Medium
> **Source entry:** `packages/sui-timeline/src/index.ts`
> **Sibling docs:** `.stokd/meta/packages/sui-timeline/SC_MODULE.md`, `packages/sui-timeline/.axioms.md`

`@stoked-ui/timeline` is a hybrid package: a **headless playback engine + data model** (`Engine`, `Controller`, `TimelineFile`, pure pixel/time math) plus a **DOM / interactjs / react-virtualized UI surface** (`Timeline`, `TimelineTrack`, `TimelineCursor`, `TimelineProvider`). The two halves have very different testability profiles and must be tested with different strategies. The headless half is high-leverage and trivially unit-testable today; the UI half needs JSDOM stubs for `requestAnimationFrame`, `interactjs`, `react-virtualized`'s `AutoSizer`, and Howler.

This package is consumed by `@stoked-ui/editor` (which `extends` `Engine`/`TimelineFile`/`TimelineProvider`/`TimelineState`), by `docs/`, and by any external integrator. A regression in `Engine._tick`, `setTime`, or `_dealEnter`/`_dealLeave` silently corrupts the editor playhead, so **engine tests are ship-blocking**.

---

## 1. Current State

| Item | Status |
|---|---|
| Test runner | **Mocha 10** via root `.mocharc.js` (`extension: ['js','mjs','ts','tsx']`, JSDOM) |
| Glob (how specs are discovered) | Root scripts run `mocha 'packages/**/*.test.{js,ts,tsx}'` — **co-located** `*.test.ts(x)` files, picked up automatically. No `__tests__/` directory convention. |
| Setup hooks | `@stoked-ui/internal-test-utils/setupBabel`, `@stoked-ui/internal-test-utils/setupJSDOM` (declared in `.mocharc.js#require`) |
| Assertions / spies | `chai` `expect` + `sinon` (repo convention; see `sui-editor`, `sui-file-explorer`) |
| React rendering | `createRenderer` / `renderHook` from `@stoked-ui/internal-test-utils` (MUI-style harness) |
| Coverage tool | **nyc** (`pnpm test:coverage` → `nyc --reporter=text mocha …`), **not** Jest coverage |
| Per-package script | None — `packages/sui-timeline/package.json` has no `test` entry. Runs from repo root. |
| CI gating | Rolls into the umbrella turbo task `test:repo:no-docs`; no timeline-specific gate yet. |
| Browser harness | Repo-level Karma (`test/karma.conf.js`) exists but no timeline specs feed it. |

### Existing test files

- `src/themeAugmentation/themeAugmentation.spec.ts` — **type-only** spec (validates `MuiTimeline*` slot augmentation of the MUI theme). Verified by `tsc`, not executed by Mocha. **This is the only test in the package.** Guarded by `AX-MOD-TIMELINE-004`.

### Critical gap

There is effectively **zero runtime test coverage** across ~4,500 LOC / 100+ files. The single most consequential class — `Engine` (`src/Engine/Engine.ts`, 665 LOC) — is wholly untested despite owning the RAF loop, the state machine, the action enter/leave lifecycle, and the event emitter that every consumer subscribes to.

> **Framework decision (locked):** target **Mocha + chai + sinon**, co-located `*.test.ts(x)`. Do **not** introduce Jest/ts-jest here — `sui-media`/`sui-common` are the repo's only Jest outliers and a Jest file in a publishable package breaks the umbrella mocha glob (see project memory: "Dual test stacks"). Run tests under **Node 20.20.0** (`nvm use 20.20.0`); Node 26 breaks the mocha toolchain in this repo (project memory: "Node version for tests").

---

## 2. What Should Be Tested

### Tier 1 — Critical, ship-blocking (write first)

#### 2.1 `Engine` headless playback logic — `src/Engine/Engine.ts`

Highest-leverage target. Every method below is pure or isolatable with a stub controller; a regression breaks every editor.

- **Construction guard** (`AX-MOD-TIMELINE-001`)
  - `new Engine({})` (no `controllers` key) throws `Error: No controllers set!` (lines 78–80).
  - ⚠️ **Behavior vs. axiom intent:** the guard is `if (!params?.controllers)`. `new Engine({ controllers: {} })` passes an empty-but-truthy object and **does not throw**, despite the axiom's stated "non-empty map" intent. Test *actual* behavior and flag the gap (candidate to tighten the guard to `Object.keys(controllers).length === 0`).
- **State machine** (`get isLoading` 170, `isReady` 166, `isPlaying` 175, `isPaused` 180)
  - `setTracks` (193) runs `_dealData → _dealClear → _dealEnter` and transitions `LOADING → READY` (197–199); a second call keeps state `READY`.
  - `pause()` only mutates state when `isPlaying` (401), but **always** calls `cancelAnimationFrame(this._timerId)` (410) — assert both halves.
  - `run({ toTime })` returns `false` when already playing **or** when `toTime <= currentTime` (349); otherwise sets `PLAYING` and schedules the first RAF (374).
  - `play()` forces `_playRate = 1` then delegates to `run()` (388, 393).
- **Time math**
  - `setTime(time)` sets `_next = 0` and `_currentTime = time`, fires `beforeSetTime` (cancelable) then `afterSetTime` (276, 281–283, 297).
  - `setTime(time, true)` (tick path) **skips** the `beforeSetTime` veto (`isTick || trigger(...)`, line 276) and fires `setTimeByTick`, **not** `afterSetTime` (293–298).
  - In `CANVAS` mode `setTime` runs `_dealLeave` then `_dealEnter` (285–287); in `MEDIA` mode it writes `media.currentTime` (288–291).
  - `get duration` returns `media.duration` in `TRACK_FILE`/`MEDIA` modes when `media` is set, else `canvasDuration` (124–130).
  - `canvasDuration` returns max `action.end` across `_actionMap`, `0` when empty (132–141).
- **Play rate**
  - `setPlayRate(rate)` returns `false` and does not mutate when `beforeSetPlayRate` returns `false` (206–210); otherwise sets `_playRate` and fires `afterSetPlayRate`, returns `true`.
  - `rewind(delta)`: snaps to `-1` when `_playRate > 0` or `<= -10`, else decrements by `delta`; then `run({ autoEnd: true })` (315–322).
  - `fastForward(delta)`: snaps to `1.5` when `_playRate < 0`, `=== 1`, or `>= 10`, else increments by `delta` (324–331).
- **Action lifecycle** (`_dealEnter` 591, `_dealLeave` 621, `_dealClear` 568, `tickAction` 538)
  - `_dealEnter`: actions with `disabled: true` are skipped; iteration **breaks** at the first `action.start > time` (601–603); `track.dim` actions are not entered (606); entered actions call `controller.enter` and are stored in the `_activeIds` BTree keyed by `_next` (613).
  - `_dealLeave`: active actions where `start > time || end < time` get `controller.leave` and are deleted from `_activeIds` (630–638).
  - `_dealClear`: drains the BTree min-key first, calls `controller.leave` on each, resets `_next = 0` (568–588).
  - `tickAction` is a no-op while `isLoading` (539); otherwise `_dealEnter → _dealLeave → controller.update` on every active id (538–560).
  - `reRender()` is a no-op while `isPlaying`, else calls `tickAction(_currentTime)` (230–235).
- **Event emission** — `src/Engine/emitter.ts`
  - `on(name, h)` throws `The event <name> does not exist` for an unbound event (17–19); accepts space-delimited or array names (14).
  - `trigger(name, p)` throws for an unknown name (27–29); returns `false` if **any** handler returns `false`, `true` otherwise (31). This is the veto primitive.
  - `off(name)` with no handler clears all listeners; with a handler splices that one (46–58). `bind(name)` throws if already bound (34–40). `offAll()` empties every list (61–63).
- **`_tick` integration** (the loop, 459–535)
  - With faked RAF, `Engine` driven via `run({ toTime })` advances `_currentTime` and lands exactly on `toTime` (479–483, 519).
  - `autoEnd` path calls `_end()` once `_next >= _actionSortIds.length && _activeIds.length === 0` (503–506).
  - Forward overrun (`initialTime > canvasDuration`, 507) and reverse underrun (`!forwards && initialTime < 0`, 512) both `_end()`.
  - `_end()` → `pause()` + `setStart()` + `ended` event (414–420).

#### 2.2 `Controller` base class — `src/Controller/Controller.ts`

All static; pure; no mocks.

- `Controller.getActionTime({ action, time })`: returns `trimStart || 0` when `action.duration === undefined` (81–83); else `(time - start + (trimStart||0)) % duration` — verify the modulo loop wrap (84).
- `Controller.getVol([v,s?,e?])` → `{ volume, start, end }` (67–69).
- `Controller.getVolumeUpdate(params, actionTime)`:
  - returns `undefined` when `action.volumeIndex === -2` (90–92).
  - when `volumeIndex >= 0` and `actionTime < start` or `>= end`, returns reset `{ volume: 1.0, volumeIndex: -1 }` (94–99).
  - when `volumeIndex === -1`, scans `action.volume` and returns the first window matching `actionTime` (102–109).
  - returns `undefined` when nothing matches (111).
- `isValid(engine, track)` returns `!track.dim` (40–42).

#### 2.3 Pixel/time utilities — `src/utils/deal_data.ts` (`AX-MOD-TIMELINE-003`)

Pure math, no mocks. These underpin every rendered position; a regression silently misaligns every action block, the ruler, and the playhead.

- `parserTimeToPixel(t, { startLeft, scale, scaleWidth })` = `startLeft + (t/scale)*scaleWidth` (7–17).
- `parserPixelToTime(px, …)` = `((px-startLeft)/scaleWidth)*scale` (20–30). **Round-trip property:** `parserPixelToTime(parserTimeToPixel(t)) ≈ t` to float precision.
- `parserTransformToTime({ left, width }, …)` → `{ start, end }` (33–51); inverse of `parserTimeToTransform({ start, end }, …)` → `{ left, width }` (54–72).
- `getScaleCountByRows(tracks, { scale })` = `Math.ceil(maxEnd/scale) + 2` (74–85). **Empty tracks → `2`** (literal `+2`, *not* `ADD_SCALE_COUNT`). Handles `tracks?` null, tracks with empty `actions`, and multi-track max.
- `getScaleCountByPixel(px, { startLeft, scaleWidth, scaleCount })` = `Math.max(ceil((px-startLeft)/scaleWidth) + ADD_SCALE_COUNT, scaleCount)` (88–99) — **never returns less than `scaleCount`**; `ADD_SCALE_COUNT = 5`.
- `parserActionsToPositions(actions, …)` → interleaved `[start_px, end_px, …]` in action order (102–117).
- **Edge cases worth a row each:** `scale = 0` and `scaleWidth = 0` (division by zero → `Infinity`/`NaN`); negative `time`; `startLeft` offset preserved across the round trip.

### Tier 2 — High value, write next

#### 2.4 `TimelineFile` model — `src/TimelineFile/TimelineFile.ts`

- Constructor without `props.tracks` → `_tracks = []` and early return (77–80).
- `actionInitializer.setVolumeIndex`: `-2` when `action.volume` absent (52–53), `-1` when present (62); out-of-range volumes log but still resolve to `-1` (58–60).
- Missing `action.id` → `namedId('action')` (68–70); missing `track.id` → `namedId('track')` (108).
- Controller resolution priority (only when `!track.controller`): `track.controllerName` → `track.file.mediaType` (91–97).
- `tracks` setter filters out the placeholder `id === 'newTrack'` (197–198); `newTrack()` static returns that placeholder shape (235–237).
- `mediaFiles` getter returns `track.file` per track in order (115–116).
- `data` getter swaps controller refs for `controllerName` strings and media refs for `fileId` (201–206) — `AX-MOD-TIMELINE-005`. Assert a controller round-trips by `id` string.

#### 2.5 `AudioController` — `src/Controller/AudioController.ts`

Howler is the heavy external dep. Stub `Howl` at the module boundary (see §4). `AudioController` is the **singleton instance**; `AudioControl` is the class (158–160).

- `getItem({ track })`: returns the cached `Howl` for `track.id`, else constructs one from `track.file.url` and caches it (145–154).
- `start`: `item.rate(engine.getPlayRate())`, `item.seek(Controller.getActionTime(params))`, calls `item.play()` **only** when `engine.isPlaying` (65–75); registers `afterSetTime` + `afterSetPlayRate` listeners and records them in `listenerMap[action.id]` (85–92).
- `stop`: `item.stop()` + `item.mute()`, then `engine.off(...)` both listeners and `delete listenerMap[action.id]` (107–124).
- `update`: applies `getVolumeUpdate(params, item.seek())` results to `item.volume(...)` and writes back `action.volumeIndex` (96–105).
- `getActionStyle`: returns `null` when `action.backgroundImage` absent; else computes `backgroundPosition`/`backgroundSize` from `scaleWidth/scale` × `trimStart`/`duration` (132–143) — note this uses *division* (`scaleWidth/scale`), so it is not an `AX-MOD-TIMELINE-003` violation.
- ⚠️ **Known bug** (capture as a failing test, §9): `preload` (38–57) never calls `resolve` on the success path — the returned Promise stays pending forever once the `Howl` is cached.

#### 2.6 `TimelineProvider` reducer — `src/TimelineProvider/TimelineProvider.tsx` + `TimelineProviderFunctions.ts`

Source of truth for selected project/track/action, settings, and the command/undo stacks. Test with `renderHook` + the provider and a fixture `TimelineFile`.

- Initial state matches `createTimelineState` defaults (settings: `scaleWidth`, `scale`, `scaleSplitCount`, `minScaleCount`, `maxScaleCount`, `startLeft`, `trackHeight`; flags: `detailMode`, `loop`, `record`, `fullscreen`).
- `SET_FILE` replaces the file and resets selection; `SELECT_ACTION`/`SELECT_TRACK`/`SELECT_PROJECT` are mutually clearing.
- `EXECUTE_COMMAND` pushes onto the undo stack and clears the redo stack; `UNDO`/`REDO` round-trip a `RemoveActionCommand` to identical file state (see §9.1 caveat — the round-trip is currently broken for multi-track files).
- Pure helpers in `TimelineProviderFunctions.ts`: `setScaleCount` (clamped to `[minScaleCount, maxScaleCount]`), `fitScaleData` (zoom-to-fit — the one approved `scaleWidth *` site, line 122), `getTrackHeight`/`getActionHeight` (detail-mode branches), `refreshActionState` (folds `disabled`/`detailMode` into `action.dim`).

### Tier 3 — Defer (manual / Karma)

Require a real browser or heavy JSDOM scaffolding. Manual smoke on `localhost:5199` (`pnpm docs:dev`, port **5199** only) until Karma is wired for this package.

- `Timeline.tsx` full render — `react-virtualized` `ScrollSync` + `AutoSizer` need DOM measurement; covered indirectly via `sui-editor`.
- `TimelineTrack.tsx` / `TimelineAction.tsx` drag/resize via `interactjs` (`Interactable/`).
- `useAutoScroll` (`src/TimelineTrack/useAutoScroll.ts`) and `useDragLine` (`src/TimelineTrackArea/useDragLine.ts`) — RAF + scroll measurement.
- `TimelineCursor` drag-scrub; `TimelineScrollResizer` handle drag.
- `StokedUiTimelineApp` mime registration (`.sut`/`.sua`) — exercised by docs build.

---

## 3. Test File Organization

**Co-locate** each spec next to the code it exercises, matching the verified repo convention (`sui-editor/src/EditorFile/EditorFile.test.tsx`, `sui-file-explorer/src/File/File.test.tsx`). The root mocha glob `packages/**/*.test.{js,ts,tsx}` picks them up automatically — **do not** nest them under `__tests__/`.

```
packages/sui-timeline/src/
├── Engine/
│   ├── Engine.ts
│   ├── Engine.state.test.ts        # construction guard, isReady/isPlaying/isPaused, setTracks
│   ├── Engine.time.test.ts         # setTime/tick-path, duration, canvasDuration, setPlayRate veto
│   ├── Engine.lifecycle.test.ts    # _dealEnter/_dealLeave/_dealClear/tickAction with stub controller
│   ├── Engine.tick.test.ts         # RAF loop via sinon.useFakeTimers
│   └── emitter.test.ts             # on/off/trigger/bind/exist/offAll + veto reduce
├── Controller/
│   ├── Controller.test.ts          # getActionTime, getVol, getVolumeUpdate, isValid
│   └── AudioController.test.ts      # getItem/start/stop/update/getActionStyle with stubbed Howl
├── TimelineFile/
│   ├── TimelineFile.test.ts        # construction, actionInitializer, controller resolution, data getter
│   └── Commands/
│       └── Commands.test.ts        # RemoveAction/RemoveTrack execute+undo round-trip (incl. §9.1 red)
├── TimelineProvider/
│   ├── TimelineProvider.test.tsx   # reducer + hook via renderHook
│   └── TimelineProviderFunctions.test.ts  # setScaleCount clamp, getHeightScaleData (incl. §9.6 red)
├── utils/
│   └── deal_data.test.ts           # pure pixel/time math + round-trip property
└── test/
    └── fixtures/
        ├── actions.ts              # buildAction({ start, end, ... }): ITimelineAction
        ├── tracks.ts               # buildTrack({ actions, controller }): ITimelineTrack
        ├── controllers.ts          # createStubController(): IController w/ sinon spies
        └── engine.ts               # createEngine({ tracks }): Engine w/ stub controller registered
```

**Naming:** `.test.ts` / `.test.tsx` for executable specs (the only kind mocha runs). Reserve `.spec.ts` for type-only checks (matching the existing `themeAugmentation.spec.ts`).

---

## 4. Mock & Stub Strategy

| External dep | Strategy |
|---|---|
| `requestAnimationFrame` / `cancelAnimationFrame` | `sinon.useFakeTimers({ toFake: ['requestAnimationFrame','cancelAnimationFrame'] })`; advance `_tick` with `clock.tick(ms)`. Set `engine._prev` explicitly so the first delta is deterministic. |
| `howler` (`Howl`) in `AudioController` | Stub at the module boundary — `sinon.replace` on the imported `Howl`, or a Babel module-name-mapper to `test/__mocks__/howler.ts`. The fake exposes `seek`, `rate`, `play`, `stop`, `mute`, `volume`, `duration` as `sinon.spy()`s. **No test may import `Howl` from `howler` directly.** |
| `interactjs` (`@interactjs/*`) in `Interactable` | Not needed for Tier 1/2. When testing `Interactable`, stub the default `interact` export to a no-op chainable and assert the call surface — the wrapper is thin. |
| `react-virtualized` `AutoSizer` | Not exercised in Tier 1/2. When unavoidable, wrap the component under test in a parent that forwards explicit `width`/`height`, bypassing `AutoSizer` measurement. |
| `@stoked-ui/media` (`MediaFile`, `AppFile`, `ScreenshotQueue`, `Command`) | Use the real workspace implementations. For `TimelineFile` tests build `MediaFile` from `Blob` fixtures rather than fetching URLs. |
| `@stoked-ui/common` (`namedId`, `compositeColors`, `createSettings`) | Real implementations — pure. |
| `HTMLMediaElement` (Engine `media`) | Hand-rolled stub: `{ play: spy, pause: spy, currentTime: 0, duration: 30, style: {} }`. JSDOM's `<video>` does not implement playback — do not rely on it. |
| `console.info` / `console.log` noise (Engine 289, 350, 508–524; commands; `fitScaleData` 98) | `sinon.stub(console, 'info')` / `'log'` in `beforeEach`, restore in `afterEach`. Keep `engine.logging = false` (default). |

**Fixture builders, not literals.** `ITimelineAction` has 15+ optional fields. Every spec that needs one should call `buildAction({ start: 0, end: 5 })` / `buildTrack({ actions: [...] })` so a type change touches one file.

**Stub controller for Engine tests.** Use `createStubController()` (sinon spies on `enter`/`leave`/`update`/`start`/`stop`/`getItem`). Keep `Engine` tests offline and Howler-free — only `AudioController.test.ts` pulls in the Howler stub.

---

## 5. Coverage Targets

Priority is **Medium**, but the engine and `deal_data` are load-bearing. Tier the targets (measured by `nyc`):

| Module | Target line coverage | Rationale |
|---|---|---|
| `src/utils/deal_data.ts` | **95 %** | Pure math, no excuses. Single source of truth for layout. |
| `src/Controller/Controller.ts` + `Controllers.ts` | **90 %** | Tiny, all-static helpers — near-total. |
| `src/Engine/**` (`Engine.ts`, `emitter.ts`, `events.ts`) | **80 %** | Headless, testable, regressions are silent and consumer-visible. |
| `src/Controller/AudioController.ts` | **70 %** | Stubbed Howler covers getItem/start/stop/update/getActionStyle; full audio integration stays manual. |
| `src/TimelineFile/**` | **70 %** | Construction + command pattern testable; URL loading is integration territory. |
| `src/TimelineProvider/**` | **60 %** | Reducer + helper coverage; full provider tree partial. |
| `src/Timeline/**`, `TimelineTrack/**`, `TimelineAction/**`, `TimelineCursor/**`, `TimelineLabels/**`, `TimelinePlayer/**`, `TimelineScrollResizer/**`, `TimelineTrackArea/**`, `Interactable/**` | **30 %** smoke renders only | DOM/virtualized/interactjs-bound — defer to Karma / manual. |
| `src/**/*.types.ts`, `*.types.d.ts`, `*.types.tsx`, `**/index.ts`, `themeAugmentation/**`, `icons/**` | **excluded** | Types, barrels, static SVG. |

**Aggregate package target: 55 % lines / 50 % branches.** Treat the `Engine` and `deal_data` thresholds as ratcheted minimums in any future CI gate; treat the UI numbers as informational until a browser harness exists.

---

## 6. Order of Implementation (first PRs)

Land the highest-confidence headless tests before touching the DOM surface. Each row is one PR; each follows the Axiom 5 red→green cycle (write the test, observe it fail/behave, then assert).

| # | PR | Files added | Why this order |
|---|---|---|---|
| 1 | **Fixture harness** | `src/test/fixtures/{actions,tracks,controllers,engine}.ts` | Every later spec depends on these factories; risk-free to land alone. |
| 2 | **`deal_data` pure math** | `src/utils/deal_data.test.ts` | Zero mocks; immediate coverage; locks the round-trip property and `scale=0`/`scaleWidth=0` edges. |
| 3 | **`Emitter` + `Events`** | `src/Engine/emitter.test.ts` | Foundation for every Engine event/veto assertion. |
| 4 | **`Controller` statics** | `src/Controller/Controller.test.ts` | Pure; covers the volume-curve logic that is impossible to verify by reading. |
| 5 | **`Engine` state + time** | `src/Engine/Engine.state.test.ts`, `Engine.time.test.ts` | Locks construction guard, `setTime`/tick-path, `setPlayRate` veto, state machine, event payloads. |
| 6 | **`Engine` lifecycle** | `src/Engine/Engine.lifecycle.test.ts` | `_dealEnter`/`_dealLeave`/`_dealClear` with stub controller — the most complex contract in the package. |
| 7 | **`Engine` tick loop** | `src/Engine/Engine.tick.test.ts` | `sinon.useFakeTimers` drives `_tick`; depends on (5) + (6) green. Capture the §9.4 negative-delta red first. |
| 8 | **`TimelineFile`** | `src/TimelineFile/TimelineFile.test.ts` | Construction, `actionInitializer`, controller resolution, `data` getter round-trip. |
| 9 | **`Commands`** | `src/TimelineFile/Commands/Commands.test.ts` | Multi-track `execute`/`undo` — **write the §9.1 failing test first**, then fix `trackIndex`. |
| 10 | **`AudioController`** | `src/Controller/AudioController.test.ts` | First module-stub test (Howler); cleanest after the engine baseline is green. Capture the §9.5b preload-never-resolves red. |
| 11 | **`TimelineProvider` reducer + functions** | `src/TimelineProvider/TimelineProvider.test.tsx`, `TimelineProviderFunctions.test.ts` | First React test; selection + undo/redo state machine. Capture the §9.6 single-track div-by-zero red. |

After PR 11 the package sits at ~50–55 % line coverage concentrated on load-bearing logic. UI rendering (Timeline, TimelineTrack, Interactable, scroll/resize) is a separate workstream contingent on Karma being wired for `sui-timeline` and is explicitly out of scope for the initial push.

---

## 7. Specific Test Cases To Implement First

A concrete starter set — write these exactly:

1. `deal_data` — `parserPixelToTime(parserTimeToPixel(t, p), p)` ≈ `t` for `t ∈ {0, 0.5, 3.333, 120}` across `{scale:1,scaleWidth:100,startLeft:20}` and `{scale:5,scaleWidth:60,startLeft:0}`.
2. `deal_data` — `getScaleCountByRows([], {scale:1})` === `2`; one track with `action.end = 9.4`, `scale=1` → `Math.ceil(9.4)+2 = 12`.
3. `emitter` — `trigger` returns `false` when one of three handlers returns `false`, `true` when all return non-false; `on('nope', fn)` throws.
4. `Engine` — `new Engine({})` throws `No controllers set`; **and** document that `new Engine({ controllers: {} })` does **not** throw (the §2.1 gap).
5. `Engine` — `setTime(5, true)` fires `setTimeByTick` and not `afterSetTime`, and is not vetoable; `setTime(5)` fires `beforeSetTime`+`afterSetTime` and a `beforeSetTime` handler returning `false` aborts the mutation (returns `false`, `_currentTime` unchanged).
6. `Engine` — `setPlayRate` returns `false` and leaves `_playRate` unchanged when a `beforeSetPlayRate` handler returns `false`.
7. `Engine.lifecycle` — given actions `[{start:0,end:2},{start:5,end:7}]` and a stub controller, `_dealEnter(1)` calls `enter` once for the first action only (iteration breaks at `start:5 > 1`); `_dealLeave(3)` calls `leave` for the first action and empties `_activeIds`; a `disabled:true` action is never entered.
8. `Engine.tick` — with faked RAF, `run({ toTime: 2 })` then `clock.tick(...)` lands `_currentTime` on `2` and fires `ended` exactly once.
9. `Controller.getActionTime` — no `duration` → `trimStart||0`; `{start:1, duration:4, trimStart:0}` at `time:7` → `(7-1)%4 = 2`.
10. `Controller.getVolumeUpdate` — `volumeIndex:-2` → `undefined`; `volumeIndex:-1` with `volume:[[0.5,0,3]]` at `actionTime:1` → `{volume:0.5, volumeIndex:0}`; same at `actionTime:5` → `undefined`.
11. `TimelineFile` — constructed without `tracks` → `tracks` is `[]`; an action without `volume` gets `volumeIndex === -2`; an action without `id` gets a generated `namedId('action')`.
12. `Commands` — `RemoveActionCommand` on a **two-track** file: remove an action from track 2, `undo()`, assert the action returns to **track 2** (this is the §9.1 red — it currently lands in the wrong track).

---

## 8. Acceptance Checks

Any change to this file or to the test scaffolding must satisfy:

- `pnpm --filter @stoked-ui/timeline typescript` exits 0 (types compile, incl. `themeAugmentation.spec.ts` — `AX-MOD-TIMELINE-004`).
- Under Node 20.20.0: `cross-env NODE_ENV=test npx mocha 'packages/sui-timeline/**/*.test.{ts,tsx}'` runs the new specs through Mocha + JSDOM and exits 0. (Scope by **file glob**, not `--grep`; `--grep` filters by test *name*.)
- `pnpm --filter @stoked-ui/editor typescript` exits 0 after any barrel/export change (`AX-MOD-TIMELINE-002`).
- No test imports `Howl` from `howler` directly — all audio paths go through a stub or `test/__mocks__/howler.ts`.
- No test relies on real RAF timing — every tick-driven test uses `sinon.useFakeTimers`.
- New specs are **co-located** (`Foo/Foo.test.ts`), not under `__tests__/`; the only non-`.test` test dir is `src/test/fixtures/`.
- Each behavioral spec demonstrates a red→green cycle (Axiom 5); the §9 known bugs are captured as failing tests **before** their fixes land.

---

## 9. Known Bugs — Capture As Failing Tests First (TDD red→green)

These are confirmed defects in the current source. Per Axiom 5, the regression test must reproduce the bug (**red**) before the fix turns it green. Do **not** weaken the test to make the code look done.

### 9.1 `RemoveActionCommand.trackIndex` stores the wrong index (multi-track undo broken)

`src/TimelineFile/Commands/RemoveActionCommand.ts:28` — `execute()` sets `this.trackIndex = index`, where `index` is the **action's position within its track**, not the **track's position in `tracks`**. `undo()` (line 43) then splices into `this.timelineFile.tracks[this.trackIndex]`. For a single-track file (or an action at track index 0) it happens to work; for any multi-track file the undone action reappears in the wrong track — or throws if `trackIndex` exceeds `tracks.length`. **Red:** §7 case 12. **Fix:** capture the enclosing track index in the outer `forEach`.

### 9.2 `getHeightScaleData` divides by zero for a single-track project

`src/TimelineProvider/TimelineProviderFunctions.ts:150` & `:153` — `(file?.tracks?.length ?? 2) - 1`. The `?? 2` fallback only fires when `tracks` is null/undefined; when `length === 1` the expression is `0`, so `shrinkScale`/`growUnselectedScale` become `(1 - x/0) * trackHeight = -Infinity`. **Red:** assert `getHeightScaleData` returns finite numbers for a file with exactly one track. **Fix:** guard the denominator (`Math.max(1, length - 1)`).

### 9.3 `Engine._tick` clamp does not guard negative deltas

`src/Engine/Engine.ts:469` — `Math.min(1000, now - this._prev)` caps large positive deltas but not negative ones. If the RAF timestamp ever moves backward (`now < _prev`), `currentTime` jumps backward by `delta * _playRate`. **Red:** drive `_tick` with `now < _prev` under faked timers and assert time does not regress. **Fix:** `Math.max(0, Math.min(1000, now - this._prev))`.

### 9.4 `setTime` MEDIA path dereferences `playbackCurrentTimespans[0]` with no length check

`src/Engine/Engine.ts:290` — in the `else if (this.media)` branch, `this.playbackCurrentTimespans[0].fileTimespan.start` throws when `playbackCurrentTimespans` is empty (e.g. a `MEDIA`-mode engine whose timespans were drained). **Red:** call `setTime(1)` in MEDIA mode with `playbackCurrentTimespans = []` and assert a graceful no-op rather than a `TypeError`. **Fix:** length guard before the index.

### 9.5 `AudioController.preload` never resolves on success

`src/Controller/AudioController.ts:38–57` — the returned `Promise` only ever calls `reject` (on construction error). On the happy path the `Howl` is cached and the executor returns without `resolve(...)`, so `await controller.preload(params)` hangs forever. **Red:** assert `preload` resolves (with a timeout) after the stubbed `Howl` `onload` fires. **Fix:** call `resolve(action)` from `onload` (and ensure `onloaderror`→`reject`).

### 9.6 Engine empty-controllers map slips past the construction guard

`src/Engine/Engine.ts:74–80` — `if (!params?.controllers)` treats `{}` as valid, contradicting `AX-MOD-TIMELINE-001`'s "non-empty map" intent. Action lookups then silently no-op at first play. **Red:** assert `new Engine({ controllers: {} })` throws `No controllers set`. **Fix:** `if (!params?.controllers || Object.keys(params.controllers).length === 0)`. (Coordinate with editor controllers before tightening — `EditorEngine` must still register at least one.)

> Each fix above is a behavior change to a shared contract and should land as its own governed `stokd task` with the failing test recorded as the acceptance criterion (red), then green. Preserve any planner/reviewer rejection of the criterion per Axiom 5.3.
