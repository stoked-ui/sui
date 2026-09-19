# Product Requirements Document: SUI Editor Completion — Browser NLE Finalization

## 0. Source Context

**Derived From:** `.stokd/meta/SUI_EDITOR_SOFTWARE_REVIEW.md` (2026-07-12 deep assessment of `@stoked-ui/editor`, `@stoked-ui/timeline`, `@stoked-ui/file-explorer`, `@stoked-ui/common`, `@stoked-ui/media`, `sui-video-renderer`)

**Feature Name:** SUI Editor Completion — Browser NLE Finalization

**PRD Owner:** Brian Stoker

**Last Updated:** 2026-07-12

**Orchestrator:** **Fable** (host architect). Fable runs phases **sequentially** — one phase at a time — and assigns **individual work items** (`### N.M`) to basic implementation agents. A phase is complete only when **every** work item's Verification Commands exit 0. Fable must not start Phase N+1 until Phase N completion criteria pass.

### Feature Brief Summary

Complete the composable browser-based video editor (`@stoked-ui/editor`) and its constituent packages (`timeline`, `file-explorer`, `common`, `media`, Rust/WASM renderer) by **wiring existing assets** rather than rebuilding. The stack has a working DOM timeline, JavaScript canvas preview, and a tested Rust compositor (153 unit tests) — but critical P0 bugs, dual persistence systems, broken image layers, and incomplete WASM orchestration block shippable state.

This PRD sequences **41 governed work items** across **7 phases**: safety fixes → foundation hygiene → WASM compositor orchestration → timeline performance → test/CI gates → export/persistence → polish/docs. Each work item is sized for a single basic agent session with explicit file paths, acceptance criteria, and shell verification commands.

**Non-goals for this PRD:** MUI v6/React 19 monorepo migration, full `react-virtualized` → `@tanstack/react-virtual` rewrite, Lottie/AnimationController, CapCut-scale timeline canvas rewrite, file-explorer virtualization for 1000+ items.

---

## 1. Objectives & Constraints

### Objectives

- **O1 — Safety:** Eliminate production-crash paths (`process.exit`, thrown image controller, debug `alert`) and fix canvas resolution mismatch so preview output matches project dimensions.
- **O2 — WASM preview:** Wire `actionMapper.ts` → `CompositorOrchestrator` → Rust `PreviewRenderer.render_frame` so multi-layer compositions render through WASM when enabled, with canvas 2D fallback intact.
- **O3 — Contract:** Enforce `AX-REPO-WASMLAYER-CONTRACT` — TypeScript layer JSON must deserialize in Rust without silent empty frames; CI must fail on schema drift.
- **O4 — Performance:** Make scrubbing and playback usable for editor-scale projects (5–15 tracks, 10–30 clips) by removing React from hot paths and adding horizontal clip culling.
- **O5 — Foundation:** Resolve dual IndexedDB/`openDB` collision, fix `ProviderState` trigger bug, prune file-explorer MUI X dead code.
- **O6 — Testability:** Add Jest/Mocha coverage on critical untested paths (Engine, actionMapper, DnD, LocalDb) and wire editor-stack packages into CI.
- **O7 — Export path:** Bridge editor UI to native `video-render` CLI for production-quality export; keep `MediaRecorder` as quick-capture only.
- **O8 — Honest docs:** Align CHANGELOG/README/showcase with actual behavior; `EditorHero` demo must demonstrate working WASM preview when flag is on.

### Constraints

- **C1:** Do **not** replace timeline Engine/Controller architecture, editor shell layout, or Rust compositor core — wire and harden only.
- **C2:** Canvas 2D fallback must remain functional when WASM is absent, fails to load, or `useWasmRenderer` is false.
- **C3:** `packages/sui-media-api` boundary unchanged — no business routes added there.
- **C4:** WASM binary must stay ≤ 1.5 MB (`wasm_preview_bg.wasm`); fail build gate if exceeded without explicit override.
- **C5:** MUI 5.17.1 / React 18.3.1 pins preserved (`AX-REPO-MUI-REACT-PINS`) — no dependency major bumps in this project.
- **C6:** TDD mandatory (Axiom 5): each code-touching work item adds a failing test first, then implements to green.
- **C7:** Docs dev server runs on port **5199** (`AX-REPO-DOCS-PORT-5199`).
- **C8:** `pnpm video-renderer:build-wasm` (or `pnpm build:wasm`) must succeed before any WASM integration work item verification.
- **C9:** Work items must not expand scope into unrelated packages (CalendarBooking extraction, audit-bot, CDN, etc.).

---

## 1.5 Required Toolchain

| Tool | Min Version | Install Command | Verify Command |
|------|-------------|-----------------|----------------|
| node | 18+ | `nvm install 18` | `node --version` |
| pnpm | 10.5.1 (repo-pinned) | `corepack enable && corepack prepare pnpm@10.5.1 --activate` | `pnpm --version` |
| rust | 1.70+ | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` | `rustc --version` |
| wasm-pack | 0.12+ | `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf \| sh` | `wasm-pack --version` |
| cargo | (with rust) | (bundled) | `cargo --version` |

**Workspace root:** `/opt/worktrees/stoked-ui/sui/main`

**Primary verification commands (used throughout):**

```bash
# TypeScript
pnpm --filter @stoked-ui/editor typescript
pnpm --filter @stoked-ui/timeline typescript
pnpm --filter @stoked-ui/file-explorer typescript
pnpm --filter @stoked-ui/common test

# Rust/WASM
pnpm video-renderer:test
pnpm build:wasm
ls -la packages/sui-video-renderer/pkg/wasm_preview_bg.wasm

# Lint
pnpm eslint packages/sui-editor packages/sui-timeline packages/sui-file-explorer packages/sui-common

# Docs showcase (manual smoke after Phase 3+)
pnpm docs:dev   # http://localhost:5199
```

---

## 2. Execution Phases

> Phases are **ordered and sequential**. Phase N cannot begin until **all** acceptance criteria of Phase N-1 pass and Fable confirms Verification Commands exit 0 for every work item in the prior phase.
>
> Within a phase, work items may declare `dependencies` on earlier items in the same phase. Fable may assign independent items in parallel only when dependencies are satisfied.

---

## Phase 1: Critical Safety & Preview Correctness

**Purpose:** Remove crash paths and fix preview dimension bugs before any WASM or performance work. An agent cannot safely test compositor integration while `process.exit(333)` or `throw new Error('createNewImage')` remain in controller hot paths.

### 1.1 Remove VideoController.process.exit and implement safe destroy

**Dependencies:** none

**Implementation Details**

- **Systems affected:** `packages/sui-editor/src/Controllers/VideoController.ts`
- **Current bug:** `destroy()` calls `process.exit(333)` (~line 497) — catastrophic in browser and Node test hosts.
- **Required change:** Replace with standard cleanup: pause video, remove from `Stage`, revoke object URLs if created by controller, null references. No `process.exit`, no `throw` on destroy.
- **Affected files:** `packages/sui-editor/src/Controllers/VideoController.ts`
- **Failure modes:** Destroy called twice must be idempotent; missing DOM elements must not throw.

**Acceptance Criteria**

- AC-1.1.a: `grep -n "process.exit" packages/sui-editor/src/Controllers/VideoController.ts` returns no matches.
- AC-1.1.b: `VideoController.destroy()` removes the managed `<video>` from `Stage` and does not throw when called on an already-destroyed controller.
- AC-1.1.c: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-1.1.a: Unit test — mock Stage/DOM, call `destroy()` twice, assert no throw and video element detached.
- Test-1.1.b: Regression grep test — `process.exit` absent in `packages/sui-editor/src/Controllers/`.

**Verification Commands**

```bash
grep -n "process.exit" packages/sui-editor/src/Controllers/VideoController.ts && exit 1 || true
pnpm --filter @stoked-ui/editor typescript
```

---

### 1.2 Implement ImageController.createNewImage

**Dependencies:** none

**Implementation Details**

- **Systems affected:** `packages/sui-editor/src/Controllers/ImageController.ts`, `packages/sui-editor/src/Controllers/WebController.ts` (calls `ImageControl.createNewImage`)
- **Current bug:** `createNewImage()` unconditionally `throw new Error('createNewImage')` (~line 58-59).
- **Required change:** Create `HTMLImageElement`, set `src` from `file.url` or `MediaFile.getUrl()`, set `crossOrigin` when needed, assign stable `id` for WASM `cache_image`, append to `Stage` hidden container, return element.
- **Mirror:** Follow `VideoController` preload patterns for URL resolution and Stage attachment.
- **Affected files:** `packages/sui-editor/src/Controllers/ImageController.ts`

**Acceptance Criteria**

- AC-1.2.a: `createNewImage()` returns an `HTMLImageElement` with non-empty `src` for a fixture `IMediaFile` with `url` set.
- AC-1.2.b: Image track added to a test project does not throw during `controller.enter()`.
- AC-1.2.c: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-1.2.a: Unit test with jsdom — `createNewImage` returns element, `src` matches file URL.
- Test-1.2.b: Integration test — `EditorFile` with image track preloads without throw.

**Verification Commands**

```bash
grep -n "throw new Error('createNewImage')" packages/sui-editor/src/Controllers/ImageController.ts && exit 1 || true
pnpm --filter @stoked-ui/editor typescript
```

---

### 1.3 Remove Editor debug artifacts

**Dependencies:** none

**Implementation Details**

- **Systems affected:** `packages/sui-editor/src/Editor/Editor.tsx`
- **Current bug:** `alert('3')` debug leftover (~line 360).
- **Required change:** Remove `alert('3')` and any other debug `alert(` calls in editor package src.
- **Affected files:** `packages/sui-editor/src/Editor/Editor.tsx`

**Acceptance Criteria**

- AC-1.3.a: `grep -rn "alert(" packages/sui-editor/src/` returns no matches (excluding comments).
- AC-1.3.b: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-1.3.a: Grep gate — no `alert(` in editor src.

**Verification Commands**

```bash
grep -rn "alert(" packages/sui-editor/src --include='*.ts' --include='*.tsx' | grep -v '//' && exit 1 || true
pnpm --filter @stoked-ui/editor typescript
```

---

### 1.4 Fix canvas internal resolution vs engine render dimensions

**Dependencies:** none

**Implementation Details**

- **Systems affected:** `packages/sui-editor/src/EditorView/EditorView.tsx`, `packages/sui-editor/src/EditorEngine/EditorEngine.ts`, `packages/sui-editor/src/EditorFile/EditorFile.ts`
- **Current bug:** ResizeObserver sets canvas `width`/`height` to **display** size; `EditorEngine.renderWidth`/`renderHeight` default **1920×1080** — draw coordinates mismatch.
- **Required change:**
  1. Canvas **internal** buffer = `EditorFile.width` × `EditorFile.height` (default 1920×1080).
  2. CSS sizes canvas to fit viewer via `width:100%` + `object-fit: contain` or transform scale.
  3. `EditorEngine` syncs `renderWidth`/`renderHeight` from file dimensions on load and when file resizes.
  4. `setRenderView()` wired if it exists but unused.
- **Affected files:** `EditorView.tsx`, `EditorEngine.ts`, optionally `EditorProvider` reducer

**Acceptance Criteria**

- AC-1.4.a: For a 1920×1080 project in a 960×540 viewer, canvas `.width === 1920` and `.height === 1080` (internal), CSS display scales down.
- AC-1.4.b: `engine.renderWidth === file.width` and `engine.renderHeight === file.height` after file load.
- AC-1.4.c: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-1.4.a: RTL/jsdom test — mount EditorView with known file dimensions, assert canvas internal attributes.
- Test-1.4.b: Unit test — `EditorEngine` render dimensions sync from `IEditorFile`.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/editor typescript
pnpm eslint packages/sui-editor/src/EditorView packages/sui-editor/src/EditorEngine
```

---

### 1.5 Fix ProviderState.checkTriggers settings mutation bug

**Dependencies:** none

**Implementation Details**

- **Systems affected:** `packages/sui-common/src/ProviderState/ProviderState.ts` (~lines 110-127)
- **Current bug:** Object-trigger branch assigns to `settings[key]` (init param) instead of `this.settings[key]` (live Proxy).
- **Required change:** Mutate `this.settings` for object triggers; add unit test.
- **Affected files:** `ProviderState.ts`, new `ProviderState.test.ts`

**Acceptance Criteria**

- AC-1.5.a: Object trigger updates are visible via `providerState.settings` after `checkTriggers` runs.
- AC-1.5.b: `pnpm --filter @stoked-ui/common test` exits 0 with new ProviderState suite green.
- AC-1.5.c: `pnpm --filter @stoked-ui/common typescript` exits 0 (if typescript script exists) OR common tests pass.

**Acceptance Tests**

- Test-1.5.a: Unit test — register object trigger, fire, assert live settings updated.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/common test -- --testPathPattern=ProviderState
```

---

### 1.6 Resolve VideoDb openDB export naming collision

**Dependencies:** none

**Implementation Details**

- **Systems affected:** `packages/sui-common/src/LocalDb/VideoDb.tsx`, `packages/sui-common/src/LocalDb/index.tsx`, `packages/sui-editor/src/EditorFile/EditorFile.ts` (imports `openDB`, `getOrFetchVideo`)
- **Current bug:** Barrel exports `VideoDb.openDB` (raw `VideoEditorDB`) colliding semantically with `@tempfix/idb` `openDB` used inside `LocalDb.ts`.
- **Required change:**
  1. Rename export `openDB` → `openVideoEditorDB` in VideoDb.
  2. Update all consumers (`EditorFile`, any docs) to use renamed export.
  3. Document in `VideoDb.tsx` header: legacy path, slated for OPFS replacement (Phase 6).
- **Do not** delete VideoDb yet — only rename and document.

**Acceptance Criteria**

- AC-1.6.a: `packages/sui-common/src/index.tsx` does not export a bare `openDB` symbol from VideoDb (or re-exports only as `openVideoEditorDB`).
- AC-1.6.b: `pnpm --filter @stoked-ui/editor typescript` exits 0 after consumer updates.
- AC-1.6.c: `grep -rn "from '@stoked-ui/common'.*openDB" packages/` shows only `openVideoEditorDB` or zero matches for bare `openDB`.

**Acceptance Tests**

- Test-1.6.a: Typecheck editor + common after rename.

**Verification Commands**

```bash
grep -rn "export.*openDB\|openDB" packages/sui-common/src/LocalDb/
pnpm --filter @stoked-ui/editor typescript
pnpm --filter @stoked-ui/common test
```

---

### 1.7 Fix Timeline ResizeObserver width condition

**Dependencies:** none

**Implementation Details**

- **Systems affected:** `packages/sui-timeline/src/Timeline/Timeline.tsx` (~line 238)
- **Current bug:** Condition `areaRef.current === undefined && timelineWidth === Number.MAX_SAFE_INTEGER` is inverted — observer never attaches.
- **Required change:** Fix to `areaRef.current !== undefined` (or equivalent correct guard) so `timelineWidth` updates from container width.
- **Affected files:** `Timeline.tsx`

**Acceptance Criteria**

- AC-1.7.a: ResizeObserver callback runs when `areaRef` is mounted and updates `timelineWidth` to a finite value < `Number.MAX_SAFE_INTEGER`.
- AC-1.7.b: `pnpm --filter @stoked-ui/timeline typescript` exits 0.

**Acceptance Tests**

- Test-1.7.a: Unit/RTL test — mount Timeline with width, assert `timelineWidth` becomes finite.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/timeline typescript
grep -n "MAX_SAFE_INTEGER" packages/sui-timeline/src/Timeline/Timeline.tsx
```

---

## Phase 2: Foundation Hygiene & Dead Code Removal

**Purpose:** Remove misleading dead code and production console noise so agents and CI signal is trustworthy. Cannot start until Phase 1 eliminates crash paths (agents need stable runtime to validate deletions).

### 2.1 Remove production console noise from timeline Engine and provider

**Dependencies:** Phase 1 complete

**Implementation Details**

- **Systems affected:** `packages/sui-timeline/src/Engine/Engine.ts`, `packages/sui-timeline/src/TimelineProvider/TimelineProvider.tsx`, `packages/sui-timeline/src/TimelineProvider/TimelineProviderFunctions.ts` (`setCursor`, `fitScaleData`)
- **Required change:** Remove or gate behind `process.env.NODE_ENV === 'development'` all `console.info`/`console.log` in `setTime`, `_tick`, `_dealEnter`, `_dealLeave`, `setCursor`, `fitScaleData`.
- **Affected files:** listed above

**Acceptance Criteria**

- AC-2.1.a: `grep -n "console\.\(info\|log\)" packages/sui-timeline/src/Engine/Engine.ts` returns zero matches outside dev-gated blocks.
- AC-2.1.b: `pnpm --filter @stoked-ui/timeline typescript` exits 0.

**Acceptance Tests**

- Test-2.1.a: Grep gate on Engine.ts and TimelineProviderFunctions.ts.

**Verification Commands**

```bash
grep -n "console\.info\|console\.log" packages/sui-timeline/src/Engine/Engine.ts | grep -v NODE_ENV && exit 1 || true
pnpm --filter @stoked-ui/timeline typescript
```

---

### 2.2 Remove timeline window.setSetting debug globals

**Dependencies:** 2.1

**Implementation Details**

- **Systems affected:** `packages/sui-timeline/src/TimelineProvider/TimelineProvider.tsx`
- **Required change:** Delete `window.setSetting`, `window.setScale`, and related dev globals OR move to `__DEV__` block exported only in test harness.
- **Affected files:** `TimelineProvider.tsx`

**Acceptance Criteria**

- AC-2.2.a: `grep -n "window\.set" packages/sui-timeline/src/` returns no matches.
- AC-2.2.b: `pnpm --filter @stoked-ui/timeline typescript` exits 0.

**Acceptance Tests**

- Test-2.2.a: Grep gate.

**Verification Commands**

```bash
grep -rn "window\.set" packages/sui-timeline/src && exit 1 || true
pnpm --filter @stoked-ui/timeline typescript
```

---

### 2.3 Delete file-explorer MUI X dead code path

**Dependencies:** Phase 1 complete

**Implementation Details**

- **Systems affected:** `packages/sui-file-explorer/src/`
- **Files to delete** (after confirming zero production imports):
  - `src/FileExplorer/CustomFileTreeItem.tsx`
  - `src/internals/utils/transformFilesToTreeItems.ts`
  - `src/internals/plugins/useFileExplorerDnd/muiXDndAdapters.ts`
- **Files to update:**
  - `FileExplorer.tsx` — remove `FileExplorerWithFlags` MUI X branch if it only toggles dead path; simplify to legacy export with comment.
  - `featureFlags/` — set `USE_MUI_X_RENDERING` to deprecated/no-op or remove flag.
  - `package.json` — evaluate removing `@mui/x-tree-view` if no remaining imports (only if tree-shaking safe and no other imports).
  - `CHANGELOG.md` — honest note: MUI X migration deferred; Atlaskit path is production.
- **Decision locked:** **Commit to Atlaskit + legacy recursive render** per software review.

**Acceptance Criteria**

- AC-2.3.a: Deleted files do not exist on disk.
- AC-2.3.b: `pnpm --filter @stoked-ui/file-explorer typescript` exits 0.
- AC-2.3.c: `pnpm --filter @stoked-ui/file-explorer build` exits 0.
- AC-2.3.d: `FileExplorer` default export still renders file tree (smoke via existing conformance test).

**Acceptance Tests**

- Test-2.3.a: `test/FileExplorer/FileExplorer.test.tsx` (or conformance) still passes.
- Test-2.3.b: `ls` gate on deleted paths returns failure.

**Verification Commands**

```bash
test ! -f packages/sui-file-explorer/src/FileExplorer/CustomFileTreeItem.tsx
test ! -f packages/sui-file-explorer/src/internals/utils/transformFilesToTreeItems.ts
test ! -f packages/sui-file-explorer/src/internals/plugins/useFileExplorerDnd/muiXDndAdapters.ts
pnpm --filter @stoked-ui/file-explorer typescript
pnpm --filter @stoked-ui/file-explorer build
```

---

### 2.4 File-explorer console cleanup and icon DRY

**Dependencies:** 2.3

**Implementation Details**

- **Systems affected:** `useFileExplorerDnd.tsx`, `FileExplorerTabs.tsx`, `File/File.tsx`
- **Required change:**
  1. Remove `console.warn`/`console.info` from DnD and tabs production paths.
  2. Extract shared `getIconFromMediaType(mediaType: MediaType)` utility; replace duplicate logic in `File.tsx` (and any remaining call sites).
- **Affected files:** listed above, new `src/utils/getIconFromMediaType.ts`

**Acceptance Criteria**

- AC-2.4.a: Single `getIconFromMediaType` exported and used by `File.tsx`.
- AC-2.4.b: No unguarded `console.` in `useFileExplorerDnd.tsx`.
- AC-2.4.c: `pnpm --filter @stoked-ui/file-explorer typescript` exits 0.

**Acceptance Tests**

- Test-2.4.a: Existing icon plugin tests still pass.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/file-explorer typescript
grep -n "console\." packages/sui-file-explorer/src/internals/plugins/useFileExplorerDnd/useFileExplorerDnd.tsx | head -5
```

---

### 2.5 Remove compiled .js artifacts from sui-common src

**Dependencies:** none (parallel with 2.3 after Phase 1)

**Implementation Details**

- **Systems affected:** `packages/sui-common/src/**/*.js`, `packages/sui-common/src/**/*.js.map`
- **Required change:** Delete all compiled `.js` and `.map` files co-located in `src/`; ensure `.gitignore` or build pipeline prevents re-commit.
- **Affected files:** ~28 artifact files per software review

**Acceptance Criteria**

- AC-2.5.a: `find packages/sui-common/src -name '*.js' -o -name '*.js.map' | wc -l` outputs `0`.
- AC-2.5.b: `pnpm --filter @stoked-ui/common test` exits 0.

**Acceptance Tests**

- Test-2.5.a: find gate.

**Verification Commands**

```bash
find packages/sui-common/src \( -name '*.js' -o -name '*.js.map' \) | wc -l | grep -x 0
pnpm --filter @stoked-ui/common test
```

---

### 2.6 Fix Engine._dealClear BTree misuse

**Dependencies:** 2.1

**Implementation Details**

- **Systems affected:** `packages/sui-timeline/src/Engine/Engine.ts` (`_dealClear`)
- **Current bug:** Uses BTree `minKey` as array index into `Object.values(_actionMap)` instead of lookup by action ID.
- **Required change:** Look up action by ID from BTree key; add unit test for clear/leave edge case.
- **Affected files:** `Engine.ts`, new `Engine.dealClear.test.ts`

**Acceptance Criteria**

- AC-2.6.a: Unit test simulating active action set clear leaves correct actions inactive.
- AC-2.6.b: `pnpm --filter @stoked-ui/timeline typescript` exits 0.

**Acceptance Tests**

- Test-2.6.a: Engine unit test for `_dealClear` with multiple active actions.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/timeline typescript
# After test file added:
pnpm test:unit:no-docs -- --grep "dealClear\|_dealClear" 2>/dev/null || pnpm --filter @stoked-ui/timeline typescript
```

---

## Phase 3: WASM Compositor Orchestration

**Purpose:** Wire the tested Rust WASM compositor into real editor preview. This is the highest-leverage completion step. Requires Phase 1 canvas fix (correct buffer dimensions) and Phase 2 hygiene (trustworthy logging).

### 3.1 Add layersToWasmJson serializer using actionMapper

**Dependencies:** Phase 1 complete (1.4 canvas dimensions)

**Implementation Details**

- **Systems affected:** `packages/sui-editor/src/WasmPreview/actionMapper.ts`, new `layersToWasmJson.ts`
- **Rust contract** (`packages/sui-video-renderer/wasm-preview/src/lib.rs` `WasmLayer`):
  - Top-level snake_case: `video_element_id`, `image_url`, `blend_mode`, `z_index`
  - `transform` nested snake_case: `scale_x`, `scale_y`, etc.
  - `type` field via serde rename
- **Required change:**
  1. Implement `export function layersToWasmJson(layers: WasmLayerInput[]): string` producing JSON Rust deserializes.
  2. Use/refactor existing `actionToWasmLayer()` from `actionMapper.ts`.
  3. Add fixture JSON snapshots for solidColor, image, video layer types.
  4. **Do not** use `CompositorController` inline conversion — deprecate/remove in 3.5.
- **Affected files:** `actionMapper.ts`, `layersToWasmJson.ts`, `types.ts`

**Acceptance Criteria**

- AC-3.1.a: Serializer output keys include `video_element_id` (not `elementId`) for video layers.
- AC-3.1.b: Unit test golden file matches Rust-deserializable sample (validated in 3.2).
- AC-3.1.c: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-3.1.a: Jest unit tests for each layer type field names.
- Test-3.1.b: Snapshot test for `layersToWasmJson` output.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/editor typescript
grep -n "video_element_id" packages/sui-editor/src/WasmPreview/
```

---

### 3.2 Add WasmLayer contract smoke test (Rust + TS)

**Dependencies:** 3.1

**Implementation Details**

- **Systems affected:** new `packages/sui-editor/src/WasmPreview/__tests__/wasmLayerContract.test.ts`, `packages/sui-video-renderer/wasm-preview/tests/`
- **Required change:**
  1. TS test loads fixture JSON from `layersToWasmJson` for each layer type.
  2. Rust test (extend `browser_integration.rs` or unit test in wasm-preview) deserializes same fixtures without error.
  3. Add root script `pnpm video-renderer:contract-test` or include in `video-renderer:test`.
  4. Document contract in `packages/sui-video-renderer/.axioms.md` or reference `AX-REPO-WASMLAYER-CONTRACT`.
- **CI gate (optional in this item):** wire into `.github/workflows/ci.yml` if harness exists.

**Acceptance Criteria**

- AC-3.2.a: `pnpm build:wasm` exits 0.
- AC-3.2.b: `pnpm video-renderer:test` exits 0 including new contract tests.
- AC-3.2.c: TS contract test exits 0 (Jest or node script).

**Acceptance Tests**

- Test-3.2.a: Rust deserializes all fixture layer types.
- Test-3.2.b: TS serializer → Rust round-trip (via wasm-bindgen test harness or headless browser test).

**Verification Commands**

```bash
pnpm build:wasm
pnpm video-renderer:test
pnpm --filter @stoked-ui/editor typescript
```

---

### 3.3 Implement CompositorOrchestrator module

**Dependencies:** 3.1, 3.2

**Implementation Details**

- **Systems affected:** new `packages/sui-editor/src/CompositorOrchestrator/CompositorOrchestrator.ts`
- **Responsibilities:**
  1. Accept `EditorEngine`, active actions at `time`, `IEditorFile` dimensions.
  2. Map each active action → WASM layer via `actionToWasmLayer`.
  3. Call `PreviewRenderer.render_frame(layersToWasmJson(layers))`.
  4. On failure, log once and set fallback flag (do not throw per frame).
  5. Expose `renderFrame(time: number): void` and `shouldUseWasm: boolean`.
- **Not a per-track IController** — cross-track orchestration only.
- **Affected files:** new module, `index.ts` export

**Acceptance Criteria**

- AC-3.3.a: `CompositorOrchestrator` exported from `@stoked-ui/editor` (or internal to engine if preferred, but testable).
- AC-3.3.b: Unit test with mock `PreviewRenderer` records `render_frame` called once per `renderFrame` invocation.
- AC-3.3.c: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-3.3.a: Mock renderer unit test.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/editor typescript
test -f packages/sui-editor/src/CompositorOrchestrator/CompositorOrchestrator.ts
```

---

### 3.4 Wire CompositorOrchestrator into EditorEngine tick/setTime

**Dependencies:** 3.3

**Implementation Details**

- **Systems affected:** `packages/sui-editor/src/EditorEngine/EditorEngine.ts`
- **Required change:**
  1. When `_useWasm === true` and orchestrator enabled, after all controller `update()` calls in tick/setTime, call `orchestrator.renderFrame(time)`.
  2. Controllers must **not** call `draw()` when orchestrator active (see 3.5).
  3. Preserve existing canvas path when `_useWasm === false`.
  4. Init orchestrator in `initWasmRenderer()` after `PreviewRenderer` constructed.
- **Affected files:** `EditorEngine.ts`

**Acceptance Criteria**

- AC-3.4.a: With `useWasmRenderer: true`, engine tick calls orchestrator (assert via unit test spy).
- AC-3.4.b: With `useWasmRenderer: false`, orchestrator not invoked; canvas draw path unchanged.
- AC-3.4.c: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-3.4.a: EditorEngine unit test with WASM on/off.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/editor typescript
grep -n "CompositorOrchestrator\|orchestrator" packages/sui-editor/src/EditorEngine/EditorEngine.ts
```

---

### 3.5 Disable per-controller drawImage when WASM orchestrator active

**Dependencies:** 3.4

**Implementation Details**

- **Systems affected:** `VideoController.ts`, `ImageController.ts`, `CompositorController.ts`
- **Required change:**
  1. `draw()` methods early-return when `engine.useWasmCompositor === true` (new flag on engine).
  2. `update()` still seeks video/audio/images.
  3. Remove or gut incorrect inline JSON mapping in `CompositorController` — orchestrator supersedes.
- **Affected files:** controllers listed, `EditorEngine.ts` (flag)

**Acceptance Criteria**

- AC-3.5.a: With WASM on, `VideoController.draw()` does not call `drawImage` (spy test).
- AC-3.5.b: With WASM off, `drawImage` still called (regression).
- AC-3.5.c: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-3.5.a: Controller unit tests WASM on/off draw behavior.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/editor typescript
```

---

### 3.6 Image cache warming for WASM (cache_image on preload)

**Dependencies:** 3.4, 1.2

**Implementation Details**

- **Systems affected:** `ImageController.ts`, `EditorEngine.initWasmRenderer`, `EditorFile.preload()`
- **Required change:** When image track preloads and WASM renderer available, decode image to RGBA (canvas or `createImageBitmap`) and call `renderer.cache_image(url, rgba, w, h)` before first frame including that layer.
- **Failure mode:** cache failure logs warning; frame skipped, no throw.

**Acceptance Criteria**

- AC-3.6.a: Image layer in WASM mode does not produce "Image not found in cache" console error during playback.
- AC-3.6.b: Unit/integration test asserts `cache_image` called on image preload when WASM enabled.

**Acceptance Tests**

- Test-3.6.a: Mock WASM renderer records `cache_image` on image enter/preload.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/editor typescript
```

---

### 3.7 Expose useWasmRenderer on Editor/EditorProvider props

**Dependencies:** 3.4

**Implementation Details**

- **Systems affected:** `EditorProvider.tsx`, `Editor.tsx`, `IEditorProps`, `docs/src/components/showcase/EditorHero.tsx`
- **Required change:**
  1. Prop `useWasmRenderer?: boolean` (default `false` for stability).
  2. Pass to `EditorEngine` constructor params.
  3. `EditorHero` sets `useWasmRenderer: true` — must work after this phase.
  4. Document in `packages/sui-editor/README.md`.

**Acceptance Criteria**

- AC-3.7.a: `<EditorProvider useWasmRenderer>` passes flag to engine.
- AC-3.7.b: `pnpm --filter @stoked-ui/editor typescript` exits 0.
- AC-3.7.c: `pnpm --filter stokedui-com typescript` exits 0 (docs compile).

**Acceptance Tests**

- Test-3.7.a: Provider prop test.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/editor typescript
pnpm --filter stokedui-com typescript
```

---

### 3.8 EditorHero WASM showcase smoke validation

**Dependencies:** 3.5, 3.6, 3.7

**Implementation Details**

- **Systems affected:** `docs/src/components/showcase/EditorHero.tsx`
- **Required change:** Manual + automated smoke:
  1. Playwright or existing e2e loads `/` or editor showcase route.
  2. Assert no WASM init error in console patterns.
  3. Assert canvas non-blank after play (pixel sample or `get_metrics().frame_count > 0` if exposed to test hook).
- **If no e2e harness:** add `packages/sui-editor/src/WasmPreview/__tests__/integration.smoke.test.ts` using headless wasm from `video-renderer` patterns.

**Acceptance Criteria**

- AC-3.8.a: `pnpm build:wasm` && `pnpm --filter @stoked-ui/editor typescript` exit 0.
- AC-3.8.b: Documented manual smoke steps in work item PR comment: load localhost:5199, EditorHero plays without "Failed to initialize WASM" error.
- AC-3.8.c: At least one automated test exits 0 validating serializer + mock render path.

**Acceptance Tests**

- Test-3.8.a: Integration smoke test green.

**Verification Commands**

```bash
pnpm build:wasm
pnpm video-renderer:test
pnpm --filter @stoked-ui/editor typescript
```

---

## Phase 4: Timeline & Preview Performance

**Purpose:** Make scrubbing and playback smooth for editor-scale projects. Requires Phase 3 WASM path stable (performance work must not fight dual render paths).

### 4.1 Scrub path: engine-only cursor updates during drag

**Dependencies:** Phase 3 complete

**Implementation Details**

- **Systems affected:** `TimelineProviderFunctions.ts` (`setCursor`), `TimelineCursor.tsx`
- **Required change:**
  1. On cursor drag move: `engine.setTime(t)` + update cursor position via ref/CSS only — **no** `dispatch(SET_SETTING)` per move.
  2. On drag end: single dispatch to sync React state.
  3. Optional: `isScrubbing` flag on provider to skip reducer map rebuild.
- **Affected files:** `TimelineProviderFunctions.ts`, `TimelineCursor.tsx`, possibly `TimelineProvider.tsx`

**Acceptance Criteria**

- AC-4.1.a: Unit test — 100 rapid `setCursor` calls during scrub mode trigger ≤ 1 reducer dispatch (or dispatch only on end).
- AC-4.1.b: `pnpm --filter @stoked-ui/timeline typescript` exits 0.

**Acceptance Tests**

- Test-4.1.a: Provider scrub dispatch count test.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/timeline typescript
```

---

### 4.2 Reducer: rebuild tracks/actions maps only on structural changes

**Dependencies:** 4.1

**Implementation Details**

- **Systems affected:** `packages/sui-timeline/src/TimelineProvider/TimelineReducer.ts`
- **Current bug:** `settings.tracks` / `settings.actions` lookup maps rebuilt on every dispatch.
- **Required change:** Rebuild maps only on `SET_FILE`, `SET_TRACKS`, `EXECUTE_COMMAND`, `UNDO`, `SET_ACTIONS` — not on `SET_SETTING` cursor time changes.
- **Fix in-place mutation** on `undoStack`/`commandHistory` — copy arrays before pop/shift.

**Acceptance Criteria**

- AC-4.2.a: `SET_SETTING` with cursor time change does not rebuild `settings.actions` map (unit test).
- AC-4.2.b: `pnpm --filter @stoked-ui/timeline typescript` exits 0.

**Acceptance Tests**

- Test-4.2.a: Reducer unit tests for map rebuild counts.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/timeline typescript
```

---

### 4.3 React.memo on TimelineAction and TimelineTrack

**Dependencies:** 4.2

**Implementation Details**

- **Systems affected:** `TimelineAction.tsx`, `TimelineTrack.tsx`
- **Required change:** Export memoized components with custom compare on `action.id`, `action.start`, `action.end`, `selected`, `scale` props.
- **Affected files:** listed above

**Acceptance Criteria**

- AC-4.3.a: Components wrapped in `React.memo`.
- AC-4.3.b: `pnpm --filter @stoked-ui/timeline typescript` exits 0.

**Acceptance Tests**

- Test-4.3.a: Render count test — parent re-render does not re-render unchanged action.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/timeline typescript
grep -n "React.memo\|memo(" packages/sui-timeline/src/TimelineAction/TimelineAction.tsx packages/sui-timeline/src/TimelineTrack/TimelineTrack.tsx
```

---

### 4.4 Horizontal viewport culling for timeline clips

**Dependencies:** 4.3

**Implementation Details**

- **Systems affected:** `TimelineTrack.tsx` or `TimelineTrackArea.tsx`
- **Required change:** Given `scrollLeft`, `viewportWidth`, `scale`, `scaleWidth`, only render actions whose pixel range intersects `[scrollLeft, scrollLeft + viewportWidth + overscan]`.
- **Overscan:** default 200px or 2 clip widths.
- **Affected files:** track rendering path, `utils/deal_data.ts` (intersection helper)

**Acceptance Criteria**

- AC-4.4.a: Track with 50 actions off-screen renders ≤ 5 action DOM nodes when viewport shows ~3 clips (unit test with mock dimensions).
- AC-4.4.b: `pnpm --filter @stoked-ui/timeline typescript` exits 0.

**Acceptance Tests**

- Test-4.4.a: `getVisibleActions(track, scrollLeft, width)` unit tests.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/timeline typescript
```

---

### 4.5 Playback playhead: reduce per-frame React commits

**Dependencies:** 4.1

**Implementation Details**

- **Systems affected:** `TimelinePlayer.tsx`, `Timeline.tsx` (`setTimeByTick` handler), `TimelineCursor.tsx`
- **Required change:** During playback, update playhead position via ref + `transform: translateX()` or direct style mutation; throttle React state sync to ≤ 4/sec or on pause.
- **Affected files:** listed above

**Acceptance Criteria**

- AC-4.5.a: During 1s playback at 30fps, React reducer dispatches for cursor time ≤ 10 (not 30).
- AC-4.5.b: `pnpm --filter @stoked-ui/timeline typescript` exits 0.

**Acceptance Tests**

- Test-4.5.a: Player tick dispatch count test with mocked engine events.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/timeline typescript
```

---

### 4.6 Unit tests for deal_data time↔pixel math

**Dependencies:** none (parallel late Phase 4)

**Implementation Details**

- **Systems affected:** `packages/sui-timeline/src/utils/deal_data.ts`
- **Required change:** Jest/Mocha suite covering `timeToPixel`, `pixelToTime`, edge cases (scale=0 guard, negative time clamp).
- **Harness:** Add `jest.config.js` to `sui-timeline` if missing (see Phase 5.3).

**Acceptance Criteria**

- AC-4.6.a: ≥ 8 unit tests for time/pixel round-trip.
- AC-4.6.b: Tests exit 0.

**Acceptance Tests**

- Test-4.6.a: Round-trip tests at multiple scales.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/timeline typescript
pnpm test:unit:no-docs -- --grep deal_data 2>/dev/null || pnpm --filter @stoked-ui/timeline typescript
```

---

## Phase 5: Test Infrastructure & CI Gates

**Purpose:** Lock in correctness with automated gates so basic agents cannot regress WASM contract or critical paths. Requires Phase 3 serializer (fixtures) and Phase 4 timeline tests (harness).

### 5.1 File-explorer DnD unit tests

**Dependencies:** Phase 2 complete (2.3, 2.4)

**Implementation Details**

- **Systems affected:** new `packages/sui-file-explorer/src/internals/plugins/useFileExplorerDnd/__tests__/`
- **Coverage minimum:**
  1. `validateFiles` rejects denylisted extensions.
  2. External drop calls `MediaFile.from` path (mocked).
  3. Trash reparent instruction produces expected tree mutation.
  4. `createChildren` invoked with valid files only.
- **≥ 12 test cases.**

**Acceptance Criteria**

- AC-5.1.a: `pnpm --filter @stoked-ui/file-explorer test` exits 0 (or mocha grep for useFileExplorerDnd).
- AC-5.1.b: ≥ 12 tests in DnD suite.

**Acceptance Tests**

- Test-5.1.a: DnD validation and reducer tests.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/file-explorer test 2>/dev/null || pnpm test:unit:no-docs -- --grep useFileExplorerDnd
```

---

### 5.2 sui-common LocalDb and namedId unit tests

**Dependencies:** Phase 1 (1.5, 1.6)

**Implementation Details**

- **Systems affected:** new tests for `LocalDb.ts`, `namedId.ts`, `FetchBackoff.ts`
- **LocalDb tests:** mock IDB with `fake-indexeddb` if available in monorepo, or extract pure functions for version key logic.
- **namedId tests:** format prefix, uniqueness over 1000 iterations.
- **FetchBackoff tests:** retry count, backoff timing (mock fetch).

**Acceptance Criteria**

- AC-5.2.a: `pnpm --filter @stoked-ui/common test` exits 0.
- AC-5.2.b: Coverage includes LocalDb, namedId, FetchBackoff test files.

**Acceptance Tests**

- Test-5.2.a: Common package test suite green.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/common test
```

---

### 5.3 Jest harness for sui-timeline and sui-editor

**Dependencies:** 4.6, 3.1

**Implementation Details**

- **Systems affected:** new `packages/sui-timeline/jest.config.js`, `packages/sui-editor/jest.config.js` following `packages/sui-media/jest.config.js` template from `SC_TEST.md`
- **Add scripts:** `"test": "jest"` to both package.json files.
- **Wire turbo:** `test:jest` target includes timeline + editor if CI matrix exists.

**Acceptance Criteria**

- AC-5.3.a: `pnpm --filter @stoked-ui/timeline test` exits 0.
- AC-5.3.b: `pnpm --filter @stoked-ui/editor test` exits 0.

**Acceptance Tests**

- Test-5.3.a: Both packages run Jest.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/timeline test
pnpm --filter @stoked-ui/editor test
```

---

### 5.4 CI: WasmLayer contract + video-renderer:test gate

**Dependencies:** 3.2

**Implementation Details**

- **Systems affected:** `.github/workflows/ci.yml`
- **Required change:** Add job step after install:
  1. `pnpm build:wasm`
  2. `pnpm video-renderer:test`
  3. `pnpm --filter @stoked-ui/editor test -- --testPathPattern=wasmLayerContract`
- **WASM size gate:** fail if `wasm_preview_bg.wasm` > 1572864 bytes without `ALLOW_LARGE_WASM=1`.

**Acceptance Criteria**

- AC-5.4.a: CI workflow file contains `video-renderer:test` step.
- AC-5.4.b: `pnpm build:wasm && pnpm video-renderer:test` exits 0 locally.

**Acceptance Tests**

- Test-5.4.a: Local command chain green.

**Verification Commands**

```bash
pnpm build:wasm
wc -c < packages/sui-video-renderer/pkg/wasm_preview_bg.wasm
pnpm video-renderer:test
grep -n "video-renderer:test\|build:wasm" .github/workflows/ci.yml
```

---

### 5.5 Engine enter/leave scheduling unit tests

**Dependencies:** 5.3, 2.6

**Implementation Details**

- **Systems affected:** `packages/sui-timeline/src/Engine/__tests__/Engine.scheduling.test.ts`
- **Coverage:** action enter at start time, leave at end, multiple overlapping actions, seek backward triggers leave+re-enter.

**Acceptance Criteria**

- AC-5.5.a: ≥ 6 Engine scheduling tests pass.
- AC-5.5.b: `pnpm --filter @stoked-ui/timeline test` exits 0.

**Acceptance Tests**

- Test-5.5.a: Scheduling edge cases.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/timeline test
```

---

## Phase 6: Export, Persistence & Publishing

**Purpose:** Production export bridge and modern persistence prototype. Requires stable preview (Phase 3) and test gates (Phase 5).

### 6.1 Editor Export UI → download .sue project file

**Dependencies:** Phase 3 complete

**Implementation Details**

- **Systems affected:** `EditorControls.tsx`, `EditorFile.ts`, `StokedUiEditorApp` from media package
- **Required change:**
  1. "Export project" button serializes current `EditorFile` to `.sue` JSON/blob download.
  2. Uses existing `AppOutputFile` / MIME types from `@stoked-ui/media`.
  3. Filename: `{projectName}.sue`.
- **Does not** invoke CLI yet — prepares artifact for 6.2.

**Acceptance Criteria**

- AC-6.1.a: Click export downloads a `.sue` file with valid JSON containing `tracks`, `width`, `height`.
- AC-6.1.b: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-6.1.a: Unit test — serialize produces parseable JSON matching fixture schema.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/editor typescript
```

---

### 6.2 CLI render bridge documentation + dev script

**Dependencies:** 6.1

**Implementation Details**

- **Systems affected:** `packages/sui-video-renderer/docs/cli-guide.md`, root `package.json`, `packages/sui-editor/README.md`
- **Required change:**
  1. Add script `pnpm video-renderer:render -- <path.sue> <out.mp4>` wrapping `cargo run --release -- render`.
  2. Document workflow: Export .sue from editor → run CLI → get MP4.
  3. E2E verify: `simple.sue` fixture renders to mp4 (CI optional, local required).

**Acceptance Criteria**

- AC-6.2.a: `pnpm video-renderer:render -- packages/sui-video-renderer/cli/tests/fixtures/simple.sue /tmp/sui-test-out.mp4` exits 0 and produces file > 1KB.
- AC-6.2.b: README documents 3-step export workflow.

**Acceptance Tests**

- Test-6.2.a: CLI render smoke on `simple.sue`.

**Verification Commands**

```bash
pnpm video-renderer:build
pnpm video-renderer:render -- packages/sui-video-renderer/cli/tests/fixtures/simple.sue /tmp/sui-editor-completion-smoke.mp4
test -f /tmp/sui-editor-completion-smoke.mp4
```

---

### 6.3 OPFS media storage prototype (metadata IDB + bytes OPFS)

**Dependencies:** Phase 1 (1.6)

**Implementation Details**

- **Systems affected:** new `packages/sui-common/src/OpfsMediaStore/`, `EditorFile.preload()`
- **Required change:**
  1. `OpfsMediaStore.write(url, blob)` / `read(url) → Blob` with feature detection.
  2. `EditorFile.preload()` uses OPFS when `navigator.storage.getDirectory` available; fallback to existing VideoDb path.
  3. IDB stores only metadata pointer (opfs path, mime, size) — not full blob in `VideoEditorDB`.
- **Scope:** prototype behind `useOpfsStorage` flag default false.

**Acceptance Criteria**

- AC-6.3.a: With flag on in Chromium, preload stores bytes in OPFS (unit test with mock FS or playwright).
- AC-6.3.b: With flag off, behavior unchanged (regression).
- AC-6.3.c: `pnpm --filter @stoked-ui/common test` exits 0.

**Acceptance Tests**

- Test-6.3.a: OpfsMediaStore unit tests with mock.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/common test
pnpm --filter @stoked-ui/editor typescript
```

---

### 6.4 Publish @stoked-ui/video-renderer-wasm strategy

**Dependencies:** 3.2, 5.4

**Implementation Details**

- **Systems affected:** `packages/sui-video-renderer/pkg/package.json`, `packages/sui-editor/package.json`, `publish-packages.yml`
- **Required change:**
  1. Ensure `pkg/` is build artifact with semver version aligned to editor.
  2. Change editor `optionalDependencies` from `file:../sui-video-renderer/pkg` to `workspace:^` for monorepo; document npm publish path for external consumers.
  3. Add README in `pkg/README.md` with install + `pnpm build:wasm` for contributors.

**Acceptance Criteria**

- AC-6.4.a: `pkg/package.json` has valid `name`, `version`, `main`, `types` fields.
- AC-6.4.b: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-6.4.a: Package.json validation.

**Verification Commands**

```bash
cat packages/sui-video-renderer/pkg/package.json
pnpm --filter @stoked-ui/editor typescript
```

---

### 6.5 MediaRecorder fallback: prefer WebM and document limitations

**Dependencies:** Phase 3

**Implementation Details**

- **Systems affected:** `EditorEngine.record()`
- **Required change:**
  1. Try `video/webm;codecs=vp9` first, then `video/webm`, then `video/mp4`.
  2. Surface codec used in recording metadata.
  3. README section: browser record = quick capture; production = CLI.

**Acceptance Criteria**

- AC-6.5.a: `record()` does not hardcode only `video/mp4`.
- AC-6.5.b: `pnpm --filter @stoked-ui/editor typescript` exits 0.

**Acceptance Tests**

- Test-6.5.a: Unit test for mime preference order.

**Verification Commands**

```bash
grep -n "video/mp4\|video/webm" packages/sui-editor/src/EditorEngine/EditorEngine.ts
pnpm --filter @stoked-ui/editor typescript
```

---

## Phase 7: Polish, Docs & Ship Validation

**Purpose:** Final integration polish and honest external documentation. Requires all functional phases complete.

### 7.1 File-explorer thumbnail column (optional, editor tabs)

**Dependencies:** Phase 3 (images work), Phase 5

**Implementation Details**

- **Systems affected:** `File.tsx`, `useFileExplorerGrid.tsx`, `@stoked-ui/media` `ScreenshotStore` or poster URL
- **Required change:** When `item.mediaType === 'video'` and `item.url` set, show 48×27 thumbnail using `ScreenshotStore.queryScreenshots` or lazy video poster frame.
- **Grid column:** optional `thumbnail` column behind `showThumbnails` prop on `FileExplorerTabs`.

**Acceptance Criteria**

- AC-7.1.a: Video file row shows thumbnail image element when `showThumbnails` true.
- AC-7.1.b: `pnpm --filter @stoked-ui/file-explorer typescript` exits 0.

**Acceptance Tests**

- Test-7.1.a: Render test with mock screenshot URL.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/file-explorer typescript
pnpm --filter @stoked-ui/file-explorer test
```

---

### 7.2 Documentation honesty audit

**Dependencies:** All prior phases

**Implementation Details**

- **Systems affected:**
  - `packages/sui-file-explorer/CHANGELOG.md`
  - `packages/sui-editor/README.md`
  - `docs/data/video-renderer/docs/*` (package name `video-renderer-wasm` not `wasm-preview`)
  - `packages/sui-video-renderer/IMPLEMENTATION_PLAN.md` — delete or replace with pointer to this PRD
- **Required change:** Align docs with actual behavior per software review §3.3.

**Acceptance Criteria**

- AC-7.2.a: No doc states MUI X RichTreeView is production default.
- AC-7.2.b: Editor README documents `useWasmRenderer`, CLI export workflow, canvas vs WASM modes.
- AC-7.2.c: `pnpm eslint` on changed doc files exits 0.

**Acceptance Tests**

- Test-7.2.a: Grep docs for `RichTreeView` production claims — zero false claims.

**Verification Commands**

```bash
grep -rn "RichTreeView" packages/sui-file-explorer/README.md packages/sui-file-explorer/CHANGELOG.md || true
grep -rn "useWasmRenderer" packages/sui-editor/README.md
```

---

### 7.3 End-to-end editor completion checklist test

**Dependencies:** 3.8, 6.2, 7.2

**Implementation Details**

- **Systems affected:** new `packages/sui-editor/src/__tests__/e2e-completion checklist.test.ts` or Playwright spec in `test/e2e-website/`
- **Checklist automated:**
  1. Import video → track appears.
  2. Play → time advances.
  3. WASM mode renders frame (mock or headless).
  4. Export .sue serializes tracks.
  5. No `process.exit` / `alert` in bundle grep.

**Acceptance Criteria**

- AC-7.3.a: E2E or integration checklist test exits 0.
- AC-7.3.b: `pnpm --filter @stoked-ui/editor test` exits 0.

**Acceptance Tests**

- Test-7.3.a: Full checklist.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/editor test
pnpm --filter @stoked-ui/timeline test
pnpm --filter @stoked-ui/common test
```

---

### 7.4 Remove VideoDb React demo component export

**Dependencies:** 6.3 (OPFS prototype exists) or explicit decision to defer OPFS default

**Implementation Details**

- **Systems affected:** `packages/sui-common/src/LocalDb/VideoDb.tsx`
- **Required change:** Remove exported React component scaffold; keep `openVideoEditorDB`/`getOrFetchVideo` until OPFS default ships.
- **Update barrel** to not export demo component.

**Acceptance Criteria**

- AC-7.4.a: `grep -n "VideoDb" packages/sui-common/src/index.tsx` shows no React component export.
- AC-7.4.b: `pnpm --filter @stoked-ui/common test` exits 0.

**Acceptance Tests**

- Test-7.4.a: Common tests pass after export removal.

**Verification Commands**

```bash
pnpm --filter @stoked-ui/common test
pnpm --filter @stoked-ui/editor typescript
```

---

## 3. Completion Criteria

The project is **complete** when Fable confirms:

1. **All 41 work items** across Phases 1–7 have every **Acceptance Criterion** satisfied.
2. **All Verification Commands** from every work item exit 0 (executed, not code-read).
3. **Rust compositor** tests pass: `pnpm video-renderer:test` exit 0.
4. **WASM builds:** `pnpm build:wasm` exit 0; `wasm_preview_bg.wasm` ≤ 1.5 MB.
5. **Editor stack TypeScript** passes:
   - `pnpm --filter @stoked-ui/editor typescript`
   - `pnpm --filter @stoked-ui/timeline typescript`
   - `pnpm --filter @stoked-ui/file-explorer typescript`
6. **Test suites** pass:
   - `pnpm --filter @stoked-ui/common test`
   - `pnpm --filter @stoked-ui/timeline test`
   - `pnpm --filter @stoked-ui/editor test`
   - `pnpm --filter @stoked-ui/file-explorer test`
7. **Functional smoke (manual once):** On `http://localhost:5199`, `EditorHero` with `useWasmRenderer: true` plays multi-layer example without WASM init failure; canvas shows composed frames.
8. **CLI export smoke:** `simple.sue` → MP4 via `pnpm video-renderer:render` produces playable file.
9. **No P0 bugs remain:** `process.exit` in controllers, `createNewImage` throw, `alert('3')`, canvas dimension mismatch, WasmLayer schema mismatch.
10. **No open P0/P1 issues** filed against this project slug.

---

## 4. Rollout & Validation

### Rollout Strategy

- **Phase-gated:** Fable merges work only after per-item verification; no big-bang merge.
- **Feature flags:**
  - `useWasmRenderer` default **false** until Phase 3.8 smoke passes; then default **true** in `EditorHero` only.
  - `useOpfsStorage` default **false** until Phase 6.3 validated in Chromium.
- **Package publish:** editor packages remain pre-1.0; WASM package published per Phase 6.4 when CI green.
- **Rollback:** Flip `useWasmRenderer` false → instant return to canvas 2D path; no data migration required.

### Post-Launch Validation

| Metric | Target | How to measure |
|--------|--------|----------------|
| WASM init success rate | 100% on EditorHero | Console filter "Failed to initialize WASM" = 0 |
| Scrub responsiveness | No long tasks > 50ms during drag | Chrome Performance panel |
| Playback dispatches | ≤ 10 reducer dispatches/sec during play | Unit test from 4.5 |
| CLI export success | `simple.sue` renders in < 60s on dev machine | Phase 6.2 command |
| WasmLayer contract | CI gate green on every PR touching editor or wasm-preview | Phase 5.4 |
| Bundle size | WASM ≤ 1.5 MB | `wc -c` gate |

### Orchestrator Instructions for Fable

1. Create project: `stokd project create -f .stokd/projects/sui-editor-completion/prd.md`
2. For each phase 1→7: spawn basic agent per work item with **only** that item's Implementation Details + Acceptance Criteria + Verification Commands.
3. After agent returns: Fable runs Verification Commands; on failure, re-spawn same item with error output.
4. Mark work item complete in Stokd API only after verification exit 0.
5. Do not parallelize across phases; within-phase parallelism allowed per dependency graph.
6. Escalate to human if same work item fails verification 3 times.

---

## 5. Open Questions

- **Q1 — Rust serde strategy:** Add `#[serde(rename_all = "camelCase")]` on `WasmLayer` (accept TS camelCase) vs enforce snake_case in TS serializer only? **Default for Phase 3:** TS emits snake_case per existing Rust struct; revisit if duplication painful.
- **Q2 — WASM default in Editor:** Should `@stoked-ui/editor` default `useWasmRenderer` to true after Phase 3? **Default:** false for npm consumers; true only in docs `EditorHero`.
- **Q3 — OPFS rollout:** When to make OPFS default over VideoDb blob path? **Default:** remain opt-in until Phase 6.3 + manual Chromium QA complete.
- **Q4 — Worker offload:** Defer Worker+OffscreenCanvas to follow-on project after orchestrator proves main-thread WASM usable? **Default:** yes, out of scope for this PRD.
- **Q5 — file-explorer peer dep on timeline:** Remove unused `@stoked-ui/file-explorer` peer from `sui-timeline/package.json`? **Default:** yes in Phase 2 if no breakage (work item 2.7 optional — add if time).
- **Q6 — WebCodecs VideoEncoder:** Include in this PRD or follow-on? **Default:** follow-on project; Phase 6.5 documents MediaRecorder limits only.

---

## Appendix A: Work Item Index (for Fable dispatch)

| Item | Title | Phase | Deps |
|------|-------|-------|------|
| 1.1 | Remove VideoController.process.exit | 1 | — |
| 1.2 | Implement ImageController.createNewImage | 1 | — |
| 1.3 | Remove Editor debug artifacts | 1 | — |
| 1.4 | Fix canvas resolution mismatch | 1 | — |
| 1.5 | Fix ProviderState.checkTriggers | 1 | — |
| 1.6 | Resolve VideoDb openDB collision | 1 | — |
| 1.7 | Fix Timeline ResizeObserver | 1 | — |
| 2.1 | Remove timeline console noise | 2 | P1 |
| 2.2 | Remove window.setSetting globals | 2 | 2.1 |
| 2.3 | Delete file-explorer MUI X dead code | 2 | P1 |
| 2.4 | File-explorer console + icon DRY | 2 | 2.3 |
| 2.5 | Remove common compiled .js artifacts | 2 | P1 |
| 2.6 | Fix Engine._dealClear BTree | 2 | 2.1 |
| 3.1 | layersToWasmJson serializer | 3 | P1 |
| 3.2 | WasmLayer contract smoke test | 3 | 3.1 |
| 3.3 | CompositorOrchestrator module | 3 | 3.1,3.2 |
| 3.4 | Wire orchestrator into EditorEngine | 3 | 3.3 |
| 3.5 | Disable controller draw when WASM on | 3 | 3.4 |
| 3.6 | Image cache warming for WASM | 3 | 3.4,1.2 |
| 3.7 | useWasmRenderer prop | 3 | 3.4 |
| 3.8 | EditorHero WASM smoke validation | 3 | 3.5-3.7 |
| 4.1 | Scrub path engine-only updates | 4 | P3 |
| 4.2 | Reducer map rebuild scope | 4 | 4.1 |
| 4.3 | React.memo timeline clips | 4 | 4.2 |
| 4.4 | Horizontal viewport culling | 4 | 4.3 |
| 4.5 | Playback playhead React reduction | 4 | 4.1 |
| 4.6 | deal_data unit tests | 4 | — |
| 5.1 | File-explorer DnD tests | 5 | P2 |
| 5.2 | common LocalDb/namedId tests | 5 | P1 |
| 5.3 | Jest harness timeline+editor | 5 | 4.6,3.1 |
| 5.4 | CI WasmLayer + renderer gate | 5 | 3.2 |
| 5.5 | Engine scheduling tests | 5 | 5.3,2.6 |
| 6.1 | Export .sue from editor UI | 6 | P3 |
| 6.2 | CLI render bridge script+docs | 6 | 6.1 |
| 6.3 | OPFS storage prototype | 6 | 1.6 |
| 6.4 | Publish video-renderer-wasm | 6 | 3.2,5.4 |
| 6.5 | MediaRecorder WebM fallback | 6 | P3 |
| 7.1 | File-explorer thumbnails | 7 | P3,P5 |
| 7.2 | Documentation honesty audit | 7 | All |
| 7.3 | E2E completion checklist test | 7 | 3.8,6.2,7.2 |
| 7.4 | Remove VideoDb React demo | 7 | 6.3 |

---

*PRD format: Stokd PRD Specification (`~/.stokd/STOKD_PRD_SPEC.md`). Source assessment: `.stokd/meta/SUI_EDITOR_SOFTWARE_REVIEW.md`.*