# Testing Strategy: `@stoked-ui/editor`

> **Generated:** 2026-05-21 | **Meta version:** 0.3.1
> **Package:** `packages/sui-editor` (`@stoked-ui/editor` v0.1.2)
> **Priority:** Medium
> **Source entry:** `packages/sui-editor/src/index.ts`

`@stoked-ui/editor` is the user-visible composition layer that ties together
`@stoked-ui/timeline`, `@stoked-ui/file-explorer`, `@stoked-ui/media`, and the
`@stoked-ui/video-renderer-wasm` engine. Bugs here surface immediately in the
docs site editor and are notoriously hard to reproduce because the surface is
heavily DOM/canvas/IDB driven. Testing investment should focus on logic that
can be exercised without a real browser — `EditorFile` serialization, the
plugin hooks, and the per-controller lifecycle — and leave the canvas/recorder
paths to manual verification on `localhost:5199` until a Karma path is wired
up.

---

## 1. Current State

| Item | Status |
|---|---|
| Test runner | Mocha 10 (root `.mocharc.js`) — Babel + JSDOM |
| Setup | `@stoked-ui/internal-test-utils/setupBabel`, `@stoked-ui/internal-test-utils/setupJSDOM` |
| Assertions | `chai` (declared in `devDependencies`), `sinon` (transitively for `spy`) |
| Per-package script | None — `package.json` has no `test` entry. Runs from root via `pnpm test` / `pnpm test:coverage`. |
| Conformance helper | `packages/sui-editor/test/describeConformance.ts` (wraps `@mui-internal/test-utils`) — currently unused by any test file. |
| Karma / browser tests | Configured at the repo level (`test/karma.conf.js`) but no `sui-editor` specs feed it. |
| CI gating | None for this package specifically; rolls into the umbrella `test:repo:no-docs` turbo task. |

### Existing test files

- `src/EditorFile/EditorFile.test.tsx` — Blob round-trip for `EditorFile`/`EditorExample`. **The body that builds the blob is commented out** (`// createdBlob = await EditorExample.createBlob(true);`), so the test currently asserts on an `undefined` blob and would throw on the first `expect`. Treat this as broken-and-skipped, not as coverage.
- `src/internals/useEditor/useEditor.test.tsx` — Smoke tests for the `useEditor` hook driven through `describeEditor`. References a destructured arg `{ … EditorComponent, EditorComponent }` (duplicate identifier) that will not compile under strict TS.
- `src/internals/plugins/useEditorMetadata/useEditorMetadata.test.tsx` — Selection model tests through `describeEditor`.
- `src/internals/plugins/useEditorKeyboard/useEditorKeyboard.test.tsx` — ArrowDown / focus navigation through `describeEditor`.
- `src/themeAugmentation/themeAugmentation.spec.ts` — Type-only spec.
- `test/typescript/*.spec.tsx`, `test/typescript/moduleAugmentation/*` — Type-only specs (verified by `tsc`, not Mocha).
- `test/integration/*` — Eight files (`Menu`, `MenuList`, `Select`, `TableCell`, `TableRow`, `Dialog`, `NestedMenu`, `PopperChildrenLayout`). These are **MUI snapshots, not editor tests**, and look like leftover scaffolding from the package fork. They should either be deleted or rewritten against editor components.

### Critical gap

`describeEditor` is imported as `test/utils/editor-view/describeEditor` but **that file does not exist** in the repo. `test/utils/file-explorer/describeFileExplorer` exists; the editor-view sibling was never ported. Every plugin test in `src/internals/plugins/**` and `src/internals/useEditor/useEditor.test.tsx` is therefore unrunnable today. Restoring this harness is the single highest-leverage thing you can do for editor test coverage.

---

## 2. What Should Be Tested

### Tier 1 — Critical, ship-blocking (write or restore first)

| Module | File | Why it matters |
|---|---|---|
| `EditorFile` blob I/O | `src/EditorFile/EditorFile.ts` | `createBlob` / `readBlob` round-trip is how projects persist. The existing test (`EditorFile.test.tsx`) is the right shape but commented out. Restore it and add coverage for: missing tracks, unknown controller IDs, version mismatch, and the `editorFileCache` hit/miss paths. |
| `useEditorMetadata` | `src/internals/plugins/useEditorMetadata/useEditorMetadata.ts` | Drives selection state used by every consumer of the editor. Restore `useEditorMetadata.test.tsx` by porting `describeEditor` from `test/utils/file-explorer/describeFileExplorer`. |
| `useEditorKeyboard` | `src/internals/plugins/useEditorKeyboard/useEditorKeyboard.ts` | Owns keyboard a11y. Same blocker — restore the harness, then expand beyond ArrowDown to ArrowUp/Home/End/Space and the modifier-shift selection range cases. |
| `useEditor` hook | `src/internals/useEditor/useEditor.tsx` | Root composition for plugins. Test currently has a duplicate-identifier bug; once fixed, add a render-with-no-plugins smoke and a `getRoot()` role assertion. |
| `EditorEngine` lifecycle | `src/EditorEngine/EditorEngine.ts` (516 LOC) | Owns the play/pause/seek state machine and the WASM-vs-canvas branch (`_useWasm`, `_wasmRendererConfig`, `_compositorController`). Cover at minimum: `setRenderer` / `setStage` setters, `_actionMap` population on track changes, and the event emission in `EditorEvents`. The recorder/canvas paths can stay manual. |
| Controllers' `preload` / `enter` / `leave` | `src/Controllers/{Animation,Audio,Compositor,Image,Video,Web}Controller.ts` | Each controller is the integration seam between editor actions and a media element. Test the deterministic helpers: `preload` returning an action with `duration`, controller `cacheMap` keying, `getItem` parameter shape. Skip anything that touches `<video>` decode or `AudioContext.createMediaElementSource`. |

### Tier 2 — Important utilities

| Module | File | Why |
|---|---|---|
| `EditorProvider` glue | `src/EditorProvider/*`, `src/internals/EditorProvider/*` | Renders the engine + plugins. RTL render-and-unmount tests catch effect-cleanup regressions. |
| `EditorView` rendering | `src/EditorView/*` | Smoke render with `items: [{ id }]` to ensure the slot wiring is intact. |
| `EditorControls` | `src/EditorControls/*` | Play/pause/seek button wiring against a stub engine. |
| `EditorFileTabs` | `src/EditorFileTabs/*` | Active tab selection state. |
| `db` helpers | `src/db/get.ts`, `src/db/init.ts` | Thin wrappers over `@stoked-ui/common` `LocalDb`. Verify they call through with the right store names; do not retest IDB itself. |
| `useEditorApiRef` | `src/hooks/useEditorApiRef.tsx` | Imperative API ref — must be stable across renders. |
| `Editor` styled root | `src/Editor/Editor.tsx`, `src/Editor/Editor.styled.tsx` | One conformance test using `packages/sui-editor/test/describeConformance.ts` (currently unused). |

### Tier 3 — Light coverage

| Module | File | Coverage goal |
|---|---|---|
| `EditorScreener` | `src/EditorScreener/*` | Render snapshot. |
| `DetailView` | `src/DetailView/*` | Render with mock `file.media`; document the `createSettings` Proxy footgun (see `MEMORY.md`) in a comment. |
| `Loader`, `SizeSlider`, `Zoom`, `ContextMenu` | `src/Editor/*.tsx` | Smoke render only. |
| `WasmPreview` | `src/WasmPreview/*` | Render with WASM disabled — assert it falls back to the 2D canvas path. |

### Out of scope

- The actual WASM `render_frame` / `clear` / `get_metrics` calls in `EditorEngine.ts` — covered by `cargo test` in `packages/sui-video-renderer` (see root `video-renderer:test` script).
- `MediaRecorder`-driven recording (`_recorder`, `_recordedChunks`) — JSDOM does not implement it; verify on `localhost:5199`.
- `Plyr` integration in `Editor/AudioPlayer.tsx` — third-party, behind a peer dep.
- `test/integration/*` legacy MUI specs — delete rather than maintain.
- `test/typescript/*` — kept for `tsc`-time checks, not Mocha.
- `Editor/Test.tsx`, `Editor/ExampleForm.tsx` — demo-only.

---

## 3. Tooling

The current toolchain is correct. **Do not introduce Jest, Vitest, or RTL `jest-dom` matchers** — that diverges from `sui-timeline`, `sui-file-explorer`, and the rest of the umbrella runner.

- **Runner:** Mocha 10 via root `pnpm test` and `pnpm test:coverage` (`nyc` + `mocha 'packages/**/*.test.{js,ts,tsx}'`).
- **DOM:** JSDOM via `@stoked-ui/internal-test-utils/setupJSDOM`.
- **Compilation:** Babel via `@stoked-ui/internal-test-utils/setupBabel`. The root `.mocharc.js` already wires both.
- **Assertions:** `chai` `expect` (already a dev dep). Use `sinon` `spy` / `stub` for mocks — already used in the keyboard plugin test.
- **React testing:** `act`, `fireEvent`, and the `render` helper exposed by `describeEditor` (re-exports from `@stoked-ui/internal-test-utils`).
- **Conformance:** `packages/sui-editor/test/describeConformance.ts` — wire it into `Editor.test.tsx` and `EditorView.test.tsx` once they exist.
- **Karma (browser):** Optional. The repo has `test/karma.conf.js`; only opt in if a future suite needs real `<canvas>` / `MediaRecorder`.

### Add a per-package script

`package.json` is missing a test script. Add:

```jsonc
"scripts": {
  "test": "cross-env NODE_ENV=test mocha 'src/**/*.test.{ts,tsx}'",
  "test:watch": "pnpm test -- --watch"
}
```

This lets `turbo run test --filter=@stoked-ui/editor` work without going through the root.

---

## 4. Test File Organization & Naming

Match the existing co-located pattern — do not centralize tests under a top-level `__tests__/`:

- **Unit/component tests:** `src/<Component>/<Component>.test.tsx` next to the source (mirrors `src/EditorFile/EditorFile.test.tsx`).
- **Plugin tests:** `src/internals/plugins/<plugin>/<plugin>.test.tsx`.
- **Hook tests:** `src/internals/<hook>/<hook>.test.tsx`.
- **Type-only specs:** `*.spec.ts` / `*.spec.tsx` under `src/themeAugmentation/` or `test/typescript/` — these are validated by `tsc`, not Mocha (excluded via `tsconfig.build.json`).
- **Shared editor harness:** `test/utils/editor-view/describeEditor.tsx` (sibling of the existing `test/utils/file-explorer/describeFileExplorer/`). Port the file-explorer version, swap the component + plugin signatures.
- **Conformance:** `src/<Component>/<Component>.conformance.test.tsx`, importing `packages/sui-editor/test/describeConformance.ts`.

Naming conventions, in order of preference:

```
describe('<ComponentName>', () => {
  describe('<feature>', () => {
    it('should <expected behavior> when <condition>', ...)
  })
})
```

For plugin tests use `describeEditor<[…signatures]>('<pluginName>', …)` so the harness can render against both `EditorBasic` and the full `Editor` composition.

---

## 5. Mock & Stub Strategy

The editor pulls in heavy browser APIs that JSDOM either doesn't provide or implements incompletely. Stub at the boundary, not deep inside the engine.

| API | Mock approach |
|---|---|
| `HTMLCanvasElement.getContext('2d')` | Use `@stoked-ui/internal-test-utils` JSDOM canvas polyfill. If a test asserts draw calls, `sinon.stub(ctx, 'drawImage')`. |
| `HTMLVideoElement` (`duration`, `videoWidth`, `videoHeight`) | Stub the element via `Object.defineProperty(video, 'duration', { get: () => 12.3 })`. Mirrors the DOM-fallback pattern noted in `MEMORY.md`. |
| `MediaRecorder` | Not in JSDOM. Inject a fake `_recorder` onto `EditorEngine` — do not test through it. |
| `AudioContext` / `createMediaElementSource` | Stub the constructor at module scope or skip the test under JSDOM (`if (typeof AudioContext === 'undefined') return this.skip()`). |
| `IndexedDB` (`@stoked-ui/common` `LocalDb`, `openDB`, `getOrFetchVideo`) | Use `fake-indexeddb` if needed; otherwise inject a stub `LocalDb` via the constructor. The `editorFileCache` `Record` in `EditorFile.ts` makes this easy — clear it in `beforeEach`. |
| `@stoked-ui/video-renderer-wasm` | Module is `optionalDependencies`. Mock with a minimal `{ render_frame, clear, get_metrics, free }` object as a `__mocks__` or a `proxyquire` stub. Default tests should run with `_useWasm = false`. |
| `react-router-dom` | Wrap renders in a `MemoryRouter` from the test util. |
| `plyr-react` | Stub to a `<div data-testid="plyr-stub" />` — no value testing the third-party player. |
| `react-hook-form` | Render real, do not mock. |
| Network (`fetch`, `getOrFetchVideo`) | `sinon.replace(global, 'fetch', sinon.fake.resolves(new Response(...)))`. |

**Module-level static state** — `editorFileCache` (`src/EditorFile/EditorFile.ts:24`), the `MimeRegistry`, and the `Controllers` map all persist between tests. Add a `beforeEach` that clears them, or every test after the first sees stale entries.

---

## 6. Coverage Targets

This package is `Medium` priority and ~50% UI/canvas. Aim for:

| Layer | Target line coverage |
|---|---|
| `src/EditorFile/**` | **80%** — pure logic, persistence-critical |
| `src/internals/plugins/**` | **75%** — covered by `describeEditor` once the harness is restored |
| `src/internals/useEditor/**` | **75%** |
| `src/Controllers/**` (deterministic methods only) | **60%** — exclude lines that touch `play()` / `pause()` / canvas |
| `src/EditorEngine/EditorEngine.ts` | **50%** — exclude WASM and recorder branches |
| `src/Editor/**`, `src/EditorView/**`, `src/EditorControls/**` | **50%** — render + slot conformance |
| `src/DetailView/**`, `src/EditorScreener/**`, `src/WasmPreview/**` | **30%** — smoke render only |
| Package overall | **55–60% lines / 50% branches** |

These are reasonable for a `Medium`-priority package whose hot path is canvas/IDB. Track via `pnpm test:coverage` (root) — it already includes `packages/**/*.test.{js,ts,tsx}`.

---

## 7. Specific Test Cases to Implement First

In order. Each is small enough to ship in one PR.

1. **Restore `describeEditor` harness.**
   New file: `test/utils/editor-view/describeEditor.tsx`. Mirror `test/utils/file-explorer/describeFileExplorer/describeFileExplorer.tsx`, swap the slot/component signatures to `Editor` / `EditorView`. Export the `DescribeEditorRendererUtils` type referenced in `useEditor.test.tsx`.

2. **Fix and de-skip `src/EditorFile/EditorFile.test.tsx`.**
   - Uncomment line 16 (`createdBlob = await EditorExample.createBlob(true);`).
   - Add `beforeEach` that clears `editorFileCache`.
   - Add cases: (a) round-trip with two tracks, (b) `readBlob` on a corrupt buffer rejects, (c) `version` field round-trips correctly.

3. **Fix `src/internals/useEditor/useEditor.test.tsx`.**
   The destructure on line 8 has duplicate `EditorComponent`. Rename the second to `EditorItemComponent` (or whatever the harness exports). Confirm both `editorViewComponentName === 'EditorBasic'` and the slot-driven branch render.

4. **Add `EditorEngine` unit tests.**
   New file: `src/EditorEngine/EditorEngine.test.ts`.
   - Constructor with `events: undefined` constructs an `EditorEvents`.
   - `_actionMap` populates from a track list.
   - `_useWasm = false` is the default; flipping `_wasmRendererConfig` does not throw without a real instance.
   - State transitions emit events on the `EditorEvents` emitter (use `sinon.spy` on `events.emit`).

5. **Add Controller `preload` tests.**
   New file: `src/Controllers/AnimationController.test.ts` (and one each for `Audio`, `Image`, `Video`, `Web`, `Compositor`).
   - `preload` with a missing `track.file` resolves to the unchanged action (already a code path in `AnimationController.ts:30`).
   - `preload` populates `action.duration` from `getItem(...).getDuration()` using a stubbed item.
   - `cacheMap` reuses existing entries.

6. **Wire conformance for `Editor`.**
   New file: `src/Editor/Editor.conformance.test.tsx`. Import `describeConformance` from `packages/sui-editor/test/describeConformance.ts`. Cover `refForwarding`, `themeDefaultProps`, `themeStyleOverrides`, `slotPropsCallback`. Skip `componentsProp` until slots are documented.

7. **`EditorProvider` mount/unmount.**
   New file: `src/EditorProvider/EditorProvider.test.tsx`.
   - Renders children.
   - On unmount, no warnings are emitted (catch via `sinon.stub(console, 'error')`).
   - `useEditorApiRef()` returns the same ref instance across renders.

8. **`useEditorKeyboard` — expand navigation matrix.**
   In the existing `useEditorKeyboard.test.tsx`, add ArrowUp, Home, End, Shift+Arrow range selection, and Space-to-toggle.

9. **Delete or rename the legacy `test/integration/*` MUI specs.**
   They report green only because they're testing MUI's internals, not the editor. Either remove (preferred) or move under `test/integration/legacy-mui/` so coverage tooling doesn't credit them.

10. **Add a per-package `test` script** as described in §3.

---

## 8. Known Gotchas (carry into tests)

These are recurring failure modes documented in the project memory and visible in the source. Bake regression tests for them so a future fix doesn't silently regress:

- `file.media` uses a `createSettings` Proxy from `@stoked-ui/common`. Properties set via `Object.assign` don't always propagate through React state. `DetailView` reads duration/width/height directly from the DOM video as a fallback. Tests that mutate `file.media` should mutate via the setter, not `Object.assign`.
- `extractVideoMetadata` previously created an empty `ScreenshotStore` that blocked thumbnail generation. Fix is in place; add a regression test that calling it on a fresh DB does not throw and creates the store with `count > 0` only when frames are actually captured.
- IDB `saveVideo` may be called before its version entry exists — the fix creates it on demand. Test the pre-existing-vs-fresh-DB branch.
- Recording audio mix: all sources route through one `AudioContext.destination`. JSDOM can't verify this; document and skip.
- Canvas at `t=0` after playback shows only one track's frame — open bug. A test that asserts multi-track composition at `t=0` will fail today and should be marked `it.skip` with a TODO referencing the issue, not deleted.
