# Testing Strategy: `@stoked-ui/timeline`

> **Generated:** 2026-05-21 | **Refreshed:** 2026-06-06 | **Re-verified:** 2026-07-02 (re-read source against this doc; confirmed the package still has ZERO runtime tests and no `test` script; **updated the Node ground truth** — this worktree now runs Node v24.18.0 and the Mocha runner boots cleanly (verified by executing the timeline glob: setupBabel/setupJSDOM loaded, "No test files found" reported), so the prior Node-26 `yargs` breakage note is historical; re-confirmed `deal_data.ts` exports, `interface/const.ts` defaults, Engine line refs (guard `Engine.ts:78–80`, `setPlayRate:206`, `setTime:275`, `time:307`, `duration:124`, `canvasDuration:132`, `rewind:315`, `fastForward:324`), and TimelineFile refs (volume warn `:59`, `volumeIndex:66`, action-id backfill `:69`, controller resolution `:90–97`, track-id backfill `:108`); documented the `setTime(…, isTick)` veto-bypass semantics) | **Meta version:** 0.6.0
> **Package:** `packages/sui-timeline` (`@stoked-ui/timeline` v0.1.3)
> **Priority:** Medium
> **Source entry:** `packages/sui-timeline/src/index.ts`
> **Sibling docs:** `.stokd/meta/packages/sui-timeline/SC_MODULE.md`, `packages/sui-timeline/.axioms.md`

`@stoked-ui/timeline` is a hybrid package: a **headless playback engine + data
model** (`Engine`, `Controller`, `TimelineFile`, pure pixel/time math in
`utils/deal_data.ts`) plus a **DOM / interactjs / react-virtualized UI surface**
(`Timeline`, `TimelineTrack`, `TimelineCursor`, `TimelineProvider`). The two
halves have very different testability profiles and must be tested with
different strategies. The headless half is high-leverage and trivially
unit-testable today; the UI half needs JSDOM stubs for `requestAnimationFrame`,
`interactjs`, `react-virtualized`'s `AutoSizer`, and Howler.

This package is consumed by `@stoked-ui/editor` (which `extends`
`Engine`/`TimelineFile`/`TimelineProvider`/`TimelineState`), by `docs/`, and by
any external integrator. A regression in `Engine._tick`, `setTime`, or
`_dealEnter`/`_dealLeave` silently corrupts the editor playhead, so **engine and
pixel-math tests are ship-blocking**.

---

## 0. Ground Truth (verified 2026-07-02 — do not skip)

These are established facts about the toolchain as it actually behaves, not
aspirations. They override any optimistic "the suite runs" claim.

1. **There are currently ZERO Mocha tests in this package.** The only checked-in
   spec is `src/themeAugmentation/themeAugmentation.spec.ts`, and it is a
   **`.spec.ts`, not a `.test.*`**. The repo Mocha glob is
   `packages/**/*.test.{js,ts,tsx}` (see root `package.json` →
   `test:unit` / `test:coverage`). `.spec.ts` files are **never picked up by
   Mocha** — that file is a *type-check-only* fixture compiled by
   `tsc -p tsconfig.json` (`pnpm --filter @stoked-ui/timeline typescript`). It
   asserts the MUI theme-augmentation contract (`MuiTimeline` /
   `MuiTimelineAction` slots) compiles; it executes no runtime assertions.
   → Net: the package has **no runtime test coverage at all today.**

2. **The package has no `test` script and is not in the Turbo test pipeline.**
   `packages/sui-timeline/package.json#scripts` has `typescript` and `build`
   but no `test`. `turbo run test --filter=!stokedui-com` (root
   `test:repo:no-docs`) therefore does **not** exercise this package. Tests you
   add run only via the **repo-root** Mocha globs (`pnpm test:unit`,
   `pnpm test:coverage`), which already match `packages/**/*.test.{js,ts,tsx}`.
   No per-package wiring is required to be picked up — just name files
   `*.test.ts(x)`.

3. **Node version is load-bearing — this worktree runs Node v24.18.0 and the
   runner boots.** Verified 2026-07-02 by executing
   `NODE_ENV=test npx mocha 'packages/sui-timeline/src/**/*.test.{js,ts,tsx}'`:
   both setup hooks loaded (JSDOM banner printed) and Mocha correctly reported
   `No test files found` — i.e. the harness works end-to-end under 24.18.0;
   only test files are missing. Historical caveat: under **Node 26** the runner
   previously failed to boot (`yargs@16` → `ReferenceError: require is not
   defined in ES module scope`, recorded 2026-06-22). Known-good versions:
   **20.20.0 and 24.18.0**. If Mocha won't boot, check `node -v` first:
   ```bash
   unset npm_config_prefix
   export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20.20.0
   ```
   **"TypeScript is green" ≠ "tests run."** `pnpm --filter @stoked-ui/timeline
   typescript` can pass while Mocha cannot even boot under the wrong Node.
   Gate on both independently. Note also `cross-env` is not on the shell PATH
   in this worktree — invoke via the root pnpm scripts or plain
   `NODE_ENV=test npx mocha …`.

4. **The shared harness is `@stoked-ui/internal-test-utils`**, required globally
   in root `.mocharc.js`:
   ```js
   require: ['@stoked-ui/internal-test-utils/setupBabel',
             '@stoked-ui/internal-test-utils/setupJSDOM']
   ```
   `setupBabel` lets Mocha load `.ts`/`.tsx` directly; `setupJSDOM` provides
   `window`/`document`. `createRenderer` / `describeConformance` /
   `addChaiAssertions` live in `test/utils/` at repo root and are mirrored under
   `node_modules/@stoked-ui/internal-test-utils/`. Sibling reference suites:
   `packages/sui-file-explorer/src/**/*.test.tsx`,
   `packages/sui-common/src/**/__tests__/*.test.tsx`.

5. **`strict: false` in `tsconfig.json`** (`noImplicitAny: false`). Tests can be
   loose on typing, but production bugs (null actions, `undefined` controllers,
   dropped `startLeft`) are NOT caught by the type-checker — they must be caught
   by runtime tests. This raises the value of the engine/data tests below.

### Commands of record
```bash
# type-only contract (compiles themeAugmentation.spec.ts + all src):
pnpm --filter @stoked-ui/timeline typescript

# run runtime tests once you add *.test.ts(x):
pnpm test:unit:no-docs          # all packages, no docs
# or scope to one file while iterating:
NODE_ENV=test npx mocha 'packages/sui-timeline/src/utils/deal_data.test.ts'

# coverage:
pnpm test:coverage:no-docs
```

---

## 1. What To Test (by leverage)

### Tier 1 — Pure functions, ship-blocking, trivial to test (DO THESE FIRST)

`src/utils/deal_data.ts` is the **single source of truth for all pixel↔time
math** (axiom **AX-MOD-TIMELINE-003**). Every cursor, ruler tick, and action
block in the editor and docs derives its screen position here. These are pure,
synchronous, dependency-free functions — there is no excuse for them to be
untested. Exported via `src/utils/index.ts` (`export * from './deal_data'`).

| Function | Contract to pin | Edge cases |
|---|---|---|
| `parserTimeToPixel(data, {startLeft, scale, scaleWidth})` | `startLeft + (data/scale)*scaleWidth` | `data=0` → returns `startLeft` (NOT 0 — the off-by-`startLeft` trap) |
| `parserPixelToTime(data, param)` | inverse: `((data-startLeft)/scaleWidth)*scale` | round-trip; `data < startLeft` → negative time |
| `parserTimeToTransform({start,end}, param)` | `{left, width}`, `width = pixel(end)-pixel(start)` | `start===end` → `width===0`; width must NOT carry `startLeft` |
| `parserTransformToTime({left,width}, param)` | inverse of `parserTimeToTransform` | round-trip both directions |
| `getScaleCountByRows(tracks, {scale})` | `ceil(maxActionEnd/scale) + 2` | empty/`undefined` tracks → `2` (optional chaining); largest `action.end` wins |
| `getScaleCountByPixel(data, {startLeft, scaleWidth, scaleCount})` | `max(ceil((data-startLeft)/scaleWidth) + ADD_SCALE_COUNT(=5), scaleCount)` | clamps to `scaleCount` floor |
| `parserActionsToPositions(actions, param)` | flat `[start0,end0,start1,end1,...]` pixels | empty `[]` → `[]`; preserves order |

**Defaults that must round-trip** (`src/interface/const.ts`): `DEFAULT_SCALE=1`,
`DEFAULT_SCALE_WIDTH=100`, `DEFAULT_START_LEFT=7`, `ADD_SCALE_COUNT=5`,
`MIN_SCALE_COUNT=40`, `NEW_ACTION_DURATION=2`. **Use `startLeft=7` in fixtures
specifically** — a test that uses `startLeft=0` passes even when the offset is
dropped, and would not catch the playhead-drift class of bug the axiom warns of.

### Tier 1 — Engine invariants (ship-blocking)

`src/Engine/Engine.ts`:

- **Constructor guard (AX-MOD-TIMELINE-001):** `new Engine({})` (options without
  a non-empty `controllers`) **throws** `Error: No controllers set!`
  (`Engine.ts:78–80`; the check is `!params?.controllers`, so the no-arg
  `new Engine()` throws too). `new Engine({ controllers: { x: fakeController } })`
  does NOT throw. This is the canonical first engine test — it is the axiom's
  acceptance check.
- `isPlayMode(mode | mode[])` (`Engine.ts:83`) — array and scalar forms agree.
- `setPlayRate(rate)` (`Engine.ts:206`) — returns `false` and does NOT mutate
  `_playRate` when a `beforeSetPlayRate` listener vetoes (trigger returns falsy);
  returns `true` and fires `afterSetPlayRate` otherwise. `getPlayRate()` reflects
  the set value.
- `setTime(time, isTick?)` / `get time` (`Engine.ts:275,307`) — round-trips;
  respects the `beforeSetTime` veto **only when `isTick` is falsy** —
  `isTick=true` short-circuits the veto entirely (`isTick || this.trigger(...)`)
  and fires `setTimeByTick` instead of `afterSetTime`. Pin both event paths.
  `CANVAS` mode runs `_dealLeave`/`_dealEnter`; `TRACK_FILE`/`MEDIA` with media
  writes `media.currentTime` (offset by `playbackCurrentTimespans[0]`).
- `get duration` / `get canvasDuration` (`Engine.ts:124,132`) — `canvasDuration`
  = max `action.end` across actions; `duration` switches on playmode + media.
- `getAction(id)` / `getActionTrack(id)` / `getSelectedActions()`
  (`Engine.ts:143,150,154`) — return `undefined` for missing ids; selected-only.
- `rewind`/`fastForward` playRate sign-flip guards (`Engine.ts:315–338`):
  `rewind` snaps a non-negative rate to `-1` then decrements; `fastForward`
  snaps a non-positive rate to `1.5` then increments.

### Tier 2 — TimelineFile data model (`src/TimelineFile/TimelineFile.ts`)

- **Volume validation:** the `actionInitializer` (constructor,
  `TimelineFile.ts:50–72`) emits `console.info` (`:59`) when any volume part
  resolves outside `[0,1]` via `Controller.getVol`; sets `volumeIndex = -2`
  when the action has no volume parts, `-1` when parts exist but are unassigned
  (`:66`). Spy `console.info` — it must warn and continue, never throw.
- **Id backfill:** actions without `id` get `namedId('action')`
  (`TimelineFile.ts:69`); tracks without `id` get `namedId('track')` (`:108`).
- **Controller resolution order** (`TimelineFile.ts:90–97`): explicit
  `track.controller` > `track.controllerName` →
  `TimelineFile.Controllers[name]` > `track.file.mediaType` →
  `TimelineFile.Controllers[mediaType]`.
- `static newTrack()`, `static getTrackColor(track)` (muted → distinct color;
  `alpha(controller.color ?? '#666', 0.11)`), `static collapsedTrack(tracks)`.
- `getName(props)` precedence: `props.name` > first named track > generated.
- Async: `static fromActions`, `static fromUrl`, `static fromLocalFile`,
  `loadUrls`, `preload` — mock `MediaFile.fromUrl` and network.

### Tier 3 — UI surface (JSDOM, lower priority for medium tier)

`Timeline`, `TimelineTrack`, `TimelineCursor`, `TimelineProvider`,
`TimelineScrollResizer`. These need `createRenderer()` plus stubs (see §4). For a
medium-priority package, a **single smoke render per top-level component**
(mounts without throwing, exposes the expected root class from
`timelineClasses`) is sufficient initial coverage; deep interaction tests (drag,
resize via interactjs) are explicitly deferred.

---

## 2. Recommended Framework & Tooling

**Use the existing repo stack — do not introduce Jest/Vitest.**

- **Runner:** Mocha (root `.mocharc.js`), assertions via Chai (`expect`) +
  `@stoked-ui/internal-test-utils/addChaiAssertions`.
- **DOM:** JSDOM via `setupJSDOM`; React rendering via `createRenderer()` /
  `@testing-library/react` re-exported through the harness (same pattern as
  `sui-file-explorer`).
- **Spies/stubs:** `sinon` (already used across the repo) for `console.info`,
  `requestAnimationFrame`, and controller methods.
- **TS/JSX:** loaded directly by `setupBabel` — no build step before tests.
- **Coverage:** `nyc` via `pnpm test:coverage:no-docs`.

Do **not** add a per-package `test` script unless you also want it in the Turbo
pipeline; the root globs already collect `packages/sui-timeline/**/*.test.ts(x)`.

---

## 3. File Organization & Naming

- **Co-locate** test files next to source, mirroring sibling packages:
  `src/utils/deal_data.test.ts`, `src/Engine/Engine.test.ts`,
  `src/TimelineFile/TimelineFile.test.ts`,
  `src/TimelineCursor/TimelineCursor.test.tsx`.
- **Name `*.test.ts` / `*.test.tsx`** — the ONLY pattern the Mocha glob matches.
  **Never `*.spec.ts`** for runtime tests (it silently will not run, exactly as
  `themeAugmentation.spec.ts` does not).
- Reserve `.spec.ts` strictly for **tsc-only type-contract fixtures** (the
  existing theme-augmentation pattern). `tsconfig.json` already excludes
  `**/*.test.tsx`; note it does NOT exclude `*.test.ts`, so the build pipeline's
  test ignores keep runtime `.test.ts` out of the publishable `build/`.
- Component tests may use `__tests__/` (as `sui-common` does) — either layout is
  accepted; prefer co-location for consistency with engine/util tests.

---

## 4. Mock / Stub Strategy

| Dependency | Where used | Strategy |
|---|---|---|
| `requestAnimationFrame` / `cancelAnimationFrame` | `Engine.run`/`_tick`/`pause` | `sinon.useFakeTimers({toFake:['requestAnimationFrame','cancelAnimationFrame']})`; drive ticks deterministically. Never assert on wall-clock. |
| `IController` implementations | `Engine.controllers`, `tickAction`, `_dealEnter`/`_dealLeave` | Hand-roll a fake `{ id, start, stop, enter, leave, update }` with `sinon.spy()` methods. Assert the engine dispatches to the right hook. |
| `interactjs` | `TimelineTrack`/`TimelineAction` drag/resize | Stub the `interact()` factory; assert handlers register, not real pointer physics. |
| `react-virtualized` `AutoSizer` | `TimelineTrackArea` | Provide fixed `width`/`height` via a stub so children render (AutoSizer measures `0×0` in JSDOM otherwise). |
| `howler` / `AudioController` | `src/Controller/AudioController.ts` | Mock the `Howl` constructor; assert play/seek/volume calls, no real audio. |
| `MediaFile.fromUrl` / network | `TimelineFile.fromUrl`/`loadUrls`/`preload` | Stub `@stoked-ui/media` `MediaFile.fromUrl` to return a fixture; never hit the network. |
| `console.info` | volume range warning in `TimelineFile`; `setTime` media branch also logs | `sinon.spy(console, 'info')`; restore in `afterEach`. |

Keep mocks minimal: Tier-1 pure-math and the Engine constructor guard need **no
mocks at all** — that is exactly why they are the first tests.

---

## 5. Coverage Targets (Medium priority)

Phased, not a single blanket number:

- **`src/utils/deal_data.ts`: 100% lines/branches.** Pure, tiny, ship-blocking —
  no reason to accept less.
- **`src/Engine/Engine.ts`: ≥ 70% lines**, with the constructor guard,
  `setTime`, `setPlayRate`, `duration`/`canvasDuration`, and action-lookup
  getters fully covered. The deep `_tick` playback loop may trail initially.
- **`src/TimelineFile/TimelineFile.ts`: ≥ 60% lines** — constructor/initializer
  and static factories first.
- **UI components: smoke-render only (~30%)** — one render-without-throw per
  top-level export.
- **Package aggregate target: ~60% lines**, weighted toward the headless half.

Track outcomes per **AX-5.3**: record red→green per behavioral criterion, and
preserve any rejected acceptance criterion with its reason.

---

## 6. First Tests To Implement (in order)

Each is a TDD red→green cycle. Items 1–3 require no mocks and no DOM.

1. **`src/utils/deal_data.test.ts` — pixel/time round-trip.**
   - `parserTimeToPixel(0, {startLeft:7, scale:1, scaleWidth:100})` → `7`
     (pins the `startLeft` offset; would have caught playhead drift).
   - `parserTimeToPixel(5, {startLeft:7, scale:1, scaleWidth:100})` → `507`.
   - `parserPixelToTime(parserTimeToPixel(t, p), p) ≈ t` for several `t`.
   - `parserTimeToTransform({start:2,end:5}, p).width` independent of `startLeft`.
   - `getScaleCountByRows([], {scale:1})` → `2`; with one action `end:30` → `32`.
   - `getScaleCountByPixel` clamps to the `scaleCount` floor.
   - `parserActionsToPositions([], p)` → `[]`.

2. **`src/Engine/Engine.test.ts` — constructor guard (AX-MOD-TIMELINE-001).**
   - `expect(() => new Engine({})).to.throw('No controllers set')` (RED first —
     write before trusting the guard).
   - `new Engine({ controllers: { test: fakeController } })` does not throw and
     `engine.controllers.test` is the fake.

3. **`src/Engine/Engine.test.ts` — `setPlayRate` veto semantics.**
   - With a `beforeSetPlayRate` listener returning falsy: `setPlayRate(2)` →
     `false`, `getPlayRate()` unchanged.
   - With no veto: `setPlayRate(2)` → `true`, `getPlayRate()` → `2`,
     `afterSetPlayRate` fired once (spy).
   - `setTime(t, true)` bypasses a vetoing `beforeSetTime` listener and fires
     `setTimeByTick` (not `afterSetTime`); `setTime(t)` respects the veto.

4. **`src/TimelineFile/TimelineFile.test.ts` — volume range warning + id backfill.**
   - Action with `volume` out of `[0,1]` triggers one `console.info` (spy).
   - Action/track without `id` get a generated `namedId(...)` value.
   - Controller resolution: `controllerName` resolves against
     `TimelineFile.Controllers`.

5. **`src/Engine/Engine.test.ts` — `canvasDuration` / action getters.**
   - `canvasDuration` equals the max `action.end` across all tracks' actions.
   - `getAction('missing')` → `undefined`; `getSelectedActions()` returns only
     `selected` actions.

6. **(DOM, after 1–5) `src/Timeline/Timeline.test.tsx` — smoke render.**
   - `createRenderer()` mounts `<Timeline />` with a minimal provider; root has
     `timelineClasses.root`; no throw. Use AutoSizer + interactjs stubs (§4).

---

## 7. TDD Bug Ledger / Watch-list (write the failing test first)

These are the loose-typing landmines (`strict:false`) the type-checker will not
catch — each is a candidate regression test:

- **`startLeft` dropped** in any new component that bypasses `deal_data.ts`
  (AX-MOD-TIMELINE-003). Guard with the `data=0 → startLeft` assertion.
- **`getScaleCountByRows` on `undefined`/null tracks** — relies on optional
  chaining; a refactor that removes it would NPE. Pin the empty/undefined path.
- **Engine constructed without controllers** silently no-ops playback if the
  guard is ever softened — keep test #2 as the tripwire.
- **Volume validation regressing to a throw** instead of a warning — pin that it
  only `console.info`s and continues (it must not break file load).
- **`setTime(…, isTick=true)` regressing to fire `afterSetTime`** (or to honor
  the veto) — the tick path is what the playback loop uses (`Engine.ts:485`);
  listeners distinguish user seeks from ticks by event name.

---

## 8. Cross-References

- Module map: `.stokd/meta/packages/sui-timeline/SC_MODULE.md`
- Module axioms: `packages/sui-timeline/.axioms.md`
  (`AX-MOD-TIMELINE-001..004`)
- Repo pixel-math candidate axiom: `AX-CANDIDATE-REPO-TIMELINE-PIXEL-MATH`
  (`.stokd/meta/SC_AXIOMS.md`)
- Harness: `@stoked-ui/internal-test-utils`, root `.mocharc.js`, `test/utils/`
- Reference suites: `packages/sui-file-explorer/src/**/*.test.tsx`,
  `packages/sui-common/src/**/__tests__/*.test.tsx`
