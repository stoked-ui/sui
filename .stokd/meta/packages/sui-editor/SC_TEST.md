# Testing Strategy: `@stoked-ui/editor`

> **Generated:** 2026-05-21 | **Re-verified against current source:** 2026-06-06 | **Meta version:** 0.4.0
> **Package:** `packages/sui-editor` (`@stoked-ui/editor` v0.1.2)
> **Priority:** Medium
> **Source entry:** `packages/sui-editor/src/index.ts`
> **Companion docs:** `.stokd/meta/packages/sui-editor/SC_MODULE.md`, `packages/sui-editor/.axioms.md`

`@stoked-ui/editor` is the **integration layer** that ties together `@stoked-ui/timeline`
(engine), `@stoked-ui/file-explorer` (asset tabs), `@stoked-ui/media` (file
abstractions), `@stoked-ui/common` (LocalDb / mime / ids), and the optional
`@stoked-ui/video-renderer-wasm` compositor. Bugs here surface immediately in the docs
editor on `localhost:5199` and are hard to reproduce because the hot path is `<canvas>` /
`MediaRecorder` / `AudioContext` / IndexedDB — none of which JSDOM implements well.
**Testing investment must concentrate on the logic that runs headlessly:** pure helpers
(`actionToWasmLayer`, `calculateFitTransform`, `getTracksFromMediaFiles`, the `EditorState`
selectors), `EditorFile` persistence, the `Controllers` deterministic methods, and
`EditorEngine` state / `_actionMap` / event wiring. Leave canvas blits, recording, and WASM
`render_frame` to manual verification on port 5199.

Every concrete claim below was checked against the source on 2026-06-06. Where the source
contradicts an obvious-but-wrong assumption, §0 calls it out explicitly.

---

## 0. Source-verified facts that constrain the strategy

These are easy to get wrong; all were confirmed against the current tree.

1. **`EditorFile.createBlob` / `EditorFile.readBlob` do not exist.** Not on `EditorFile`
   (`src/EditorFile/EditorFile.ts`) and not on its parent `TimelineFile`. The real
   persistence/serialization surface is the **static factories**
   `EditorFile.fromUrl(url, Ctor)` (`EditorFile.ts:170`) and
   `EditorFile.fromLocalFile(blob, Ctor)` (`EditorFile.ts:266`), the instance method
   `updateStore()` (`EditorFile.ts:162`), and the module-level caches
   `editorFileCache` (`EditorFile.ts:23`) and `EditorFile.fileCache` (`EditorFile.ts:272`).
   The existing `EditorFile.test.tsx` references the removed API and is why its body is
   commented out. **Do not "uncomment the blob line" — rewrite the test against
   `fromLocalFile` / `fromUrl` / `updateStore`.**
2. **`mapBlendMode` is NOT exported.** `src/WasmPreview/actionMapper.ts` exports only
   `calculateFitTransform` (line 58) and `actionToWasmLayer` (line 116). `mapBlendMode`
   (line 19) is a module-private helper invoked inside `actionToWasmLayer` (line 209). A
   unit test **cannot import `mapBlendMode` directly** — assert blend-mode mapping
   *through* `actionToWasmLayer` output. (This corrects earlier drafts that listed it as a
   standalone target.)
3. **The `Controllers` map registers only `audio`, `video`, `image`, `compositor`**
   (`src/Controllers/Controllers.ts`). `AnimationController` is commented out of the map;
   `WebController` is not imported at all. **Do not write `AnimationController.test.ts` /
   `WebController.test.ts` as ship-blocking coverage** — they are dead paths until
   re-registered.
4. **The three plugin tests are verbatim forks from `@stoked-ui/file-explorer`.**
   `useEditor.test.tsx`, `useEditorMetadata.test.tsx`, and `useEditorKeyboard.test.tsx`
   assert a tree / `treeitem` / checkbox selection DOM contract (`getItemRoot`,
   `isItemExpanded`, `checkboxSelection`, `role="editor"`) and reference components
   (`EditorBasic`, `EditorComponent`) and a harness (`test/utils/editor-view/describeEditor`)
   that **do not exist in this package** — verified: there is no `describeEditor*` file
   anywhere in the repo, and `packages/sui-editor/test/utils/` does not exist. `useEditor.test.tsx`
   additionally has a duplicate-identifier destructure (`{ … EditorComponent, EditorComponent }`)
   that will not compile under strict TS. See §7 step 1 — this is a governed decision, not a
   delete-on-sight.
5. **No per-package `test` script.** `packages/sui-editor/package.json` has `typescript`,
   `build*`, `watch*`, `dev*` — no `test`. Editor tests run only from the repo root glob.
6. **Node version is a hard blocker.** The active runtime in this workspace breaks the Mocha
   runner; tests must run under Node 20 (`nvm use v20.20.0`). See §3.

---

## 1. Current State

| Item | Status |
|---|---|
| Test runner | Mocha 10 (root `.mocharc.js`) — `extension: [js, mjs, ts, tsx]`, `reporter: 'dot'`, JSDOM |
| Setup (require hooks) | `@stoked-ui/internal-test-utils/setupBabel`, `@stoked-ui/internal-test-utils/setupJSDOM` (from `.mocharc.js`) |
| Assertions | `chai` (`expect`, dev dep); `sinon` (`spy`/`stub`, transitive via internal-test-utils) |
| React helpers | `createRenderer`, `act`, `fireEvent`, `ErrorBoundary`, `toErrorDev` from `@stoked-ui/internal-test-utils` |
| Root runner scripts | `pnpm test:unit` (`mocha 'packages/**/*.test.{js,ts,tsx}' 'docs/**/*.test.{js,ts,tsx}'`), `pnpm test:coverage` (`nyc` + same glob) |
| Per-package script | **None** — runs only from repo root. |
| Glob | `packages/**/*.test.{js,ts,tsx}` |
| Coverage | `nyc` over `packages/sui*/src/**/*.{js,ts,tsx}`, excludes `**/*.test.*` |
| Conformance helper | `packages/sui-editor/test/describeConformance.ts` exists, **unused** by any test |
| Repo test utils | `test/utils/` has `describeConformance.ts`, `describeSlotsConformance.tsx`, `file-explorer/`, `setupBabel.js`, `setupJSDOM.js`, `mochaHooks.js`, `init.ts` — **no `editor-view/`** |
| CI gating | Rolls into umbrella `test:repo:no-docs` (turbo) — no editor-specific gate |
| Runnable editor tests today | **Zero.** All four runtime test files are broken (see below). |

### Existing test files (and why each is currently non-functional)

- `src/EditorFile/EditorFile.test.tsx` — Blob round-trip. **Broken three ways:**
  (a) the blob-creation line is commented out so it asserts on an `undefined` blob;
  (b) it calls `EditorExample.createBlob(true)` / `EditorFile.readBlob(...)` which **do not
  exist** (§0.1); (c) it does `import { describe, it } from 'node:test'`, which shadows
  Mocha's globals and breaks chai integration under the Mocha runner.
- `src/internals/useEditor/useEditor.test.tsx` — imports the missing `describeEditor`
  harness; has a duplicate-identifier destructure that won't compile under strict TS.
- `src/internals/plugins/useEditorMetadata/useEditorMetadata.test.tsx` — imports the missing
  `describeEditor`; asserts a file-explorer tree-selection contract.
- `src/internals/plugins/useEditorKeyboard/useEditorKeyboard.test.tsx` — imports the missing
  `describeEditor`; ~30 keyboard cases copied verbatim from file-explorer.
- `src/themeAugmentation/themeAugmentation.spec.ts` — type-only (`tsc`, not Mocha).
- `test/typescript/*.spec.tsx`, `test/typescript/moduleAugmentation/*` — type-only MUI-fork
  leftovers, validated by `tsc`.
- `test/integration/*` — eight files (`Menu`, `MenuList`, `Select`, `TableCell`, `TableRow`,
  `Dialog`, `NestedMenu`, `PopperChildrenLayout`). **MUI snapshots, not editor tests** —
  leftover scaffolding from the package fork. Delete or quarantine.

### The harness gap

`describeEditor` is imported as `test/utils/editor-view/describeEditor` but no such file
exists (verified: zero `describeEditor*` matches in the package; `packages/sui-editor/test/utils/`
is absent). Only `test/utils/file-explorer/` exists at the repo root. Per axiom
**AX-MOD-SUI-EDITOR-005**, the correct response to the failing plugin tests is to build the
harness or open a governed task — **not** to `.skip` or delete them silently. But the harness
alone is insufficient: the assertions target a `role`/`treeitem` DOM contract the editor does
not render (it renders a timeline/canvas). See §7 step 1.

---

## 2. What Should Be Tested

Ranked by ROI for a Medium-priority, canvas-heavy package. **Tier 1A is fully headless and
should be written first** — it needs no harness and no browser API.

### Tier 1A — Pure functions (headless, highest ROI, zero infra)

| Target | File | Why it matters |
|---|---|---|
| `actionToWasmLayer`, `calculateFitTransform` (+ blend mapping *through* `actionToWasmLayer`) | `src/WasmPreview/actionMapper.ts` | Pure `IEditorAction → CompositorLayer` mapping (camel→snake, fit math, blend-mode enum). No WASM instance needed. Wrong math here = misplaced/wrong-blended layers. Guards **AX-MOD-SUI-EDITOR-003** (the mapper must keep working regardless of WASM availability). |
| `getTrackFromMediaFile`, `getTracksFromMediaFiles` | `src/EditorTrack/EditorTrack.ts` (lines 46, 79) | Turns `IMediaFile[]` into editor tracks/actions with default `currentTime`/`duration`/`index`. Pure, deterministic, drives every drag-drop ingest. |
| `getActionSelectionData`, `refreshActionState`, `refreshTrackState` | `src/EditorProvider/EditorState.ts` (lines 19, 35, 41) | Selection-index lookup and the `track.hidden → action.dim` fold. Pure given a state object; a rename here silently desyncs the detail view (see **AX-MOD-SUI-EDITOR-002** change-impact). |

### Tier 1B — Critical stateful logic (needs stubs, not a full browser)

| Target | File | What to cover |
|---|---|---|
| `EditorFile` persistence | `src/EditorFile/EditorFile.ts` | `fromLocalFile(blob)` / `fromUrl(url)` reconstruct a file with correct `props` (id/name/version/tracks/actions); `updateStore()` writes through the injected `LocalDb`; `editorFileCache` / `EditorFile.fileCache` hit/miss. Round-trip a 2-track project. Corrupt-buffer input rejects. Guards **AX-MOD-SUI-EDITOR-004** (IDB schema is versioned) — assert the on-disk shape of `IEditorFileData` / `IEditorTrackData` survives. |
| `Controllers` deterministic methods | `src/Controllers/{Audio,Video,Image,Compositor}Controller.ts` | Each extends timeline `Controller` with a `cacheMap`. Test: `getItem(params)` populates `cacheMap[track.id]` and reuses the cached entry on a second call (`VideoController.ts:40`); `preload(params)` resolves an `ITimelineAction` (`VideoController.ts:74`); `preload` with missing `track.file` resolves the action unchanged. **Skip** `enter` / `leave` / `draw` — they touch `<video>` decode, `Howl` playback, `AudioContext`, and `engine.renderCtx.drawImage`. |
| `EditorEngine` state + wiring | `src/EditorEngine/EditorEngine.ts` (~516 LOC) | Constructor builds an `EditorEvents` emitter when none passed (`EditorEngine.ts:73–75`); `_useWasm` defaults to `false` (line 67); `_actionMap` (line 62) populates from a track list; setters store refs; `initWasmRenderer()` returns `false` (does not throw) when `!_useWasm || !_compositorController` (line 121–122). Spy `events.emit` for state transitions. **Exclude** the recorder and the real WASM branch. |
| `StokedUiEditorApp` mime registration | `src/Editor/StokedUiEditorApp.ts` | `getInstance()` is a singleton (line 47); registers exactly `.sue` / `.suvid` / `.sua` (lines 22/28/34); `defaultInputFileType` is `.sue` (line 20). Guards **AX-MOD-SUI-EDITOR-007**. |

### Tier 2 — Component render / integration (needs a render harness)

| Target | File | Coverage goal |
|---|---|---|
| `EditorProvider` glue | `src/EditorProvider/*` | Renders children; mount→unmount emits no `console.error`; constructs a default `EditorEngine`; assigns `TimelineFile.Controllers = Controllers` **before** file deserialization (**AX-MOD-SUI-EDITOR-002**). |
| `Editor` styled root | `src/Editor/Editor.tsx` | One conformance run via `test/describeConformance.ts` (`refForwarding`, `themeDefaultProps`, `themeStyleOverrides`). |
| `EditorView` | `src/EditorView/EditorView.tsx` | Smoke render — renderer `<canvas>` and screener `<video>` refs wire into the engine (`_renderer`, `_screener`, `_stage`). |
| `EditorControls` | `src/EditorControls/EditorControls.tsx` | Play/pause/stop/seek buttons dispatch against a stub engine; `Volume` value binding. |
| `EditorFileTabs` | `src/EditorFileTabs/EditorFileTabs.tsx` | Active-tab state. |
| `useEditorApiRef` | `src/hooks/useEditorApiRef.tsx` | Returns a stable ref across renders. |

### Tier 3 — Light / smoke coverage

| Target | File | Goal |
|---|---|---|
| `DetailView` | `src/DetailView/*` | Render with a mock `file.media`; document the `createSettings` Proxy footgun (§8) in-test. |
| `EditorScreener` | `src/EditorScreener/*` | Render snapshot. |
| `WasmPreview` (UI) | `src/WasmPreview/WasmPreviewDemo.tsx`, `useWasmRenderer.ts` | Render with WASM disabled → asserts the 2D-canvas fallback path is taken (**AX-MOD-SUI-EDITOR-003**). |
| `Loader`, `SizeSlider`, `Zoom`, `ContextMenu` | `src/Editor/*.tsx` | Smoke render only. |

### Out of scope

- WASM `render_frame` / `clear` / `get_metrics` — covered by `cargo test` in
  `packages/sui-video-renderer` (root `video-renderer:test`).
- `MediaRecorder` recording (`_recorder`, `_recordedChunks`) — not in JSDOM; verify on 5199.
- `AudioContext` mixing through one `destination` — not in JSDOM; manual.
- `Howl` (howler) playback inside `AudioController` — third-party; manual.
- `plyr-react` in `Editor/AudioPlayer.tsx` — third-party.
- `AnimationController` / `WebController` — disabled (not in the map, §0.3); no ship-blocking
  tests until re-registered.
- `test/integration/*` MUI specs and `test/typescript/*` — not editor tests.

---

## 3. Tooling

The toolchain is correct as-is. **Do not introduce Jest, Vitest, or RTL `jest-dom`
matchers** — that diverges from `sui-timeline` / `sui-file-explorer` and breaks the umbrella
Mocha glob (a Jest-only assertion in a publishable package poisons `packages/**/*.test.*`;
cf. the dual-test-stacks note in project memory).

- **Runner:** Mocha 10 via root `pnpm test:unit` (or `pnpm test:coverage` for `nyc`).
  Single file: `pnpm mocha packages/sui-editor/src/EditorTrack/EditorTrack.test.ts`.
- **DOM:** JSDOM via `@stoked-ui/internal-test-utils/setupJSDOM` (auto-required by `.mocharc.js`).
- **Compilation:** Babel via `@stoked-ui/internal-test-utils/setupBabel`.
- **Assertions:** `chai` `expect`. Mocks: `sinon` `spy` / `stub` / `fake` / `replace`.
- **Render:** `createRenderer()` from `@stoked-ui/internal-test-utils`; `act`, `fireEvent`,
  `ErrorBoundary`, `toErrorDev` from the same. **Use Mocha's global `describe` / `it`** —
  never `import { describe, it } from 'node:test'` (this is bug §0 in the existing file).
- **Conformance:** wire `packages/sui-editor/test/describeConformance.ts` into a future
  `Editor.conformance.test.tsx`.

### ⚠️ Node version (blocker)

The active runtime in this workspace breaks Mocha. Before running any test:

```bash
nvm use v20.20.0   # or: nvm install 20 && nvm use 20
node -v            # must print v20.x
```

(Per project memory `node-version-for-tests`. The docs `tsc` also has pre-existing
`sui-editor` / `sui-timeline` failures unrelated to this package's tests — see SC_MODULE §7
TypeScript baseline: the `ReadableStream<Uint8Array<ArrayBufferLike>>` vs `<ArrayBuffer>`
divergence rooted in `sui-media`, not a `sui-editor`-local fault.)

### Add a per-package script

`packages/sui-editor/package.json` has no `test` script. Add one so
`turbo run test --filter=@stoked-ui/editor` works:

```jsonc
"scripts": {
  "test": "cross-env NODE_ENV=test mocha 'src/**/*.test.{ts,tsx}'",
  "test:watch": "pnpm test -- --watch"
}
```

This is a structural change (no behavior) and does not itself require a TDD cycle, but it
must not break the root glob.

---

## 4. Test File Organization & Naming

Match the existing co-located convention — do **not** centralize under `__tests__/`:

- **Pure helpers / unit:** `src/<area>/<file>.test.ts` next to the source
  (e.g. `src/WasmPreview/actionMapper.test.ts`, `src/EditorTrack/EditorTrack.test.ts`).
- **Component tests:** `src/<Component>/<Component>.test.tsx`.
- **Plugin tests:** `src/internals/plugins/<plugin>/<plugin>.test.tsx`.
- **Hook tests:** `src/internals/<hook>/<hook>.test.tsx`.
- **Type-only specs:** `*.spec.ts` / `*.spec.tsx` (validated by `tsc`, excluded from the
  build via `tsconfig.build.json` and from Mocha by intent).
- **Conformance:** `src/<Component>/<Component>.conformance.test.tsx` importing
  `packages/sui-editor/test/describeConformance.ts`.
- **Shared harness (if built):** `packages/sui-editor/test/utils/editor-view/describeEditor.tsx`
  (sibling of `test/utils/file-explorer/`).

Naming inside files:

```ts
describe('<ComponentOrFunction>', () => {
  describe('<feature>', () => {
    it('should <expected behavior> when <condition>', () => { /* ... */ });
  });
});
```

---

## 5. Mock & Stub Strategy

Stub at the boundary, not deep in the engine. The editor pulls in browser APIs JSDOM either
lacks or implements partially.

| Dependency / API | Mock approach |
|---|---|
| `HTMLCanvasElement.getContext('2d')` | Use the internal-test-utils JSDOM canvas polyfill. To assert draw calls: `sinon.stub(ctx, 'drawImage')`. Prefer testing the data feeding `draw` over `draw` itself. |
| `HTMLVideoElement` (`duration`, `videoWidth`, `videoHeight`) | `Object.defineProperty(video, 'duration', { get: () => 12.3 })` — mirrors the DOM-fallback the editor already uses (§8). |
| `MediaRecorder` | Not in JSDOM. Inject a fake `_recorder` onto the engine; never drive a test through it. |
| `AudioContext` / `createMediaElementSource` / `Howl` | Stub the constructor at module scope, or `if (typeof AudioContext === 'undefined') return this.skip()`. `AudioController` wraps `Howl` (howler) — stub `Howl` to a no-op with `duration()`. |
| IndexedDB / `LocalDb` / `openDB` / `getOrFetchVideo` (`@stoked-ui/common`) | **Inject a stub `LocalDb`** through the constructor / `EditorFile` props rather than touching real IDB. `fake-indexeddb` only if a test genuinely needs the store. Clear `editorFileCache` and `EditorFile.fileCache` in `beforeEach`. |
| `@stoked-ui/video-renderer-wasm` | It's an `optionalDependency`. Default tests run with `_useWasm = false` so the dynamic import never fires. If you must exercise the WASM path, stub a minimal `{ PreviewRenderer, render_frame, clear, get_metrics, free }`. |
| `react-router-dom` | Wrap renders in `MemoryRouter`. |
| `plyr-react` | Stub to `<div data-testid="plyr-stub" />`. |
| `react-hook-form` + `yup` | Render real — do not mock; that's the contract under test in `DetailView`. |
| Network (`fetch`, `getOrFetchVideo`) | `sinon.replace(global, 'fetch', sinon.fake.resolves(new Response(...)))`. |

**Module-level shared state must be reset in `beforeEach`** or tests after the first see
stale data:
- `editorFileCache` — `src/EditorFile/EditorFile.ts:23`.
- `EditorFile.fileCache` — `src/EditorFile/EditorFile.ts:272`.
- The MIME registry behind `StokedUiEditorApp.getInstance()` (singleton, `StokedUiEditorApp.ts:47`).
- The `Controllers` map and `TimelineFile.Controllers` static assignment.

---

## 6. Coverage Targets

Medium priority, ~50% of the surface is canvas / IDB / recorder that can't run in JSDOM.
Target lines on the headlessly-testable code; accept low numbers on the rest.

| Layer | Target line coverage |
|---|---|
| `src/WasmPreview/actionMapper.ts` (pure) | **90%** |
| `src/EditorTrack/EditorTrack.ts` (pure) | **85%** |
| `src/EditorProvider/EditorState.ts` (pure selectors) | **80%** |
| `src/EditorFile/**` | **75%** — persistence-critical (`fromLocalFile`/`fromUrl`/`updateStore`/caches) |
| `src/Controllers/**` (deterministic methods only) | **55%** — exclude `enter`/`leave`/`draw`/playback |
| `src/EditorEngine/EditorEngine.ts` | **45%** — exclude WASM + recorder branches |
| `src/Editor/**`, `src/EditorView/**`, `src/EditorControls/**` | **45%** — render + conformance |
| `src/DetailView/**`, `src/EditorScreener/**`, `src/WasmPreview/*Demo*` | **30%** — smoke render |
| Package overall | **50–55% lines / 45% branches** |

Track via `pnpm test:coverage` from root (`nyc` already includes `packages/sui*/src/**`).
These are realistic floors, not aspirations — raise them once the harness question (§7.1) is
resolved.

---

## 7. Specific Test Cases to Implement First

Each step is one PR. **Follow TDD (axiom 5): write the test, watch it go red, then make it
green.** Steps 2–5 are pure / near-pure and need no harness — start there, not with the
harness.

1. **DECISION FIRST — what to do about the three forked plugin tests.**
   They assert a file-explorer tree contract the editor doesn't render, and reference
   non-existent `EditorBasic` / `EditorComponent` + the missing `describeEditor` harness. Two
   governed options (surface to the maintainer per axiom 6.2):
   - **(A) Rebuild for the real surface** — render `<Editor>` with `EditorExample`
     (`src/EditorFile/EditorFile.example.tsx`) and rewrite assertions against the timeline
     track/action DOM and engine state. Build the harness at
     `packages/sui-editor/test/utils/editor-view/describeEditor.tsx`. Higher value, more work.
   - **(B) Quarantine** — move the forked tests to `*.fileexplorer-fork.test.tsx.skip` with a
     TODO, since they duplicate `sui-file-explorer` coverage and the editor's plugins are
     themselves forks. Do **not** delete silently (AX-MOD-SUI-EDITOR-005).
   Recommended default: **(B) now, (A) later** — don't block Tier-1A coverage on it.

2. **`actionMapper` pure tests.** New: `src/WasmPreview/actionMapper.test.ts`.
   - Blend mapping *through* `actionToWasmLayer`: each `BlendMode` produces its snake_case
     WASM counterpart in the returned layer; `undefined` blend → the documented `'normal'`
     default (`actionMapper.ts:43`). **Note: `mapBlendMode` is not exported — assert via the
     `actionToWasmLayer` output, not a direct import (§0.2).**
   - `calculateFitTransform` for `cover` / `contain` / `fill` against known w/h.
   - `actionToWasmLayer` produces snake_case keys and copies x/y/scale/opacity.
   *Red:* assert exact output in the test's expectations before any change.

3. **`EditorTrack` pure tests.** New: `src/EditorTrack/EditorTrack.test.ts`.
   - `getTrackFromMediaFile(mediaFile)` returns a track with default `duration`/index and a
     single action; `undefined` media → `undefined` (`EditorTrack.ts:46`).
   - `getTracksFromMediaFiles([...])` preserves order and appends to `existingTracks`
     (`EditorTrack.ts:79`).

4. **`EditorState` selector tests.** New: `src/EditorProvider/EditorState.test.ts`.
   - `getActionSelectionData(actionId, state)` finds the track/action and returns the right
     `selectedTrackIndex` / `selectedActionIndex`; unknown id → empty/undefined.
   - `refreshActionState` folds `track.hidden` into `action.dim`.

5. **`EditorFile` persistence tests.** New (replace the broken file):
   `src/EditorFile/EditorFile.test.tsx`.
   - `beforeEach` clears `editorFileCache` + `EditorFile.fileCache`; remove the `node:test`
     import (use Mocha globals); stub `LocalDb`.
   - Round-trip: build a 2-track `EditorFile`, serialize via the **real** path, read back with
     `EditorFile.fromLocalFile(blob, EditorFile)` (or `fromUrl`), assert `props`
     (id/name/version) and tracks/actions deep-match.
   - `updateStore()` calls through the injected `LocalDb` with the right store name.
   - Corrupt/empty buffer → `fromLocalFile` rejects.

6. **`EditorEngine` unit tests.** New: `src/EditorEngine/EditorEngine.test.ts`.
   - No `events` arg → constructs an `EditorEvents` emitter (`EditorEngine.ts:73–75`).
   - `_useWasm` defaults `false`; `initWasmRenderer()` resolves `false` (no throw) when WASM
     is off / no `_compositorController` (`EditorEngine.ts:121–122`).
   - `_actionMap` populates from a track list; setters store refs.
   - State transition emits on `events` (spy `events.emit`).

7. **Controller `getItem` / `preload` tests.** New: `src/Controllers/VideoController.test.ts`
   (+ `Audio`, `Image`, `Compositor`).
   - `getItem` populates `cacheMap[track.id]` and a second call reuses the cache
     (`VideoController.ts:40`).
   - `preload` with missing `track.file` resolves the action unchanged; `preload` resolves an
     `ITimelineAction` (`VideoController.ts:74`).
   - **Do not** test `enter` / `leave` / `draw` / playback.

8. **`StokedUiEditorApp` registration test.** New: `src/Editor/StokedUiEditorApp.test.ts` —
   `getInstance()` is a singleton; `.sue` / `.suvid` / `.sua` registered;
   `defaultInputFileType === .sue` (AX-MOD-SUI-EDITOR-007).

9. **`EditorProvider` mount/unmount + conformance** (needs harness/RTL).
   `src/EditorProvider/EditorProvider.test.tsx` (renders children; clean unmount; stable
   `useEditorApiRef`; asserts `TimelineFile.Controllers` is wired before deserialization) and
   `src/Editor/Editor.conformance.test.tsx` wiring `test/describeConformance.ts`.

10. **Housekeeping.** Add the per-package `test` script (§3); delete or quarantine
    `test/integration/*` MUI specs so coverage tooling stops crediting them.

---

## 8. Known Gotchas (bake regressions for these)

Recurring failure modes from project memory and source — write a guarding test so a future
fix doesn't silently regress:

- **`createSettings` Proxy** — `file.media` is a `createSettings` Proxy from
  `@stoked-ui/common`. Properties set via `Object.assign` don't reliably propagate through
  React state; `DetailView` reads `duration` / `width` / `height` straight off the DOM
  `<video>` as a fallback. Tests that mutate `file.media` must use the setter, not
  `Object.assign`.
- **`extractVideoMetadata` / empty `ScreenshotStore`** — previously created an empty store
  that blocked thumbnail generation (fixed by checking `count > 0`). Add a regression: calling
  it on a fresh DB does not throw and only creates a store when frames are actually captured.
- **IDB `saveVideo` before a version entry exists** — the fix creates the version entry on
  demand. Test the fresh-vs-existing-DB branch.
- **Multi-track audio mix** — all sources route through one `AudioContext.destination`. JSDOM
  can't verify; document and `this.skip()`.
- **Canvas at `t=0` after playback shows only one track's frame** — open bug. A test asserting
  multi-track composition at `t=0` will fail today; mark `it.skip` with a TODO referencing the
  bug, do **not** delete.
- **`Controllers` / `TimelineFile.Controllers` ordering** — `EditorProvider` must assign
  `TimelineFile.Controllers = Controllers` before any file deserialization
  (AX-MOD-SUI-EDITOR-002). A provider test that deserializes a file proves the wiring.
- **Node 26 vs Mocha** — see §3; not a product bug but the #1 reason "the tests don't run" on
  a fresh shell.
