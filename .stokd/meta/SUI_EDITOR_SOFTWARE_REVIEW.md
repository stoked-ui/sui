# SUI Editor — Software Review & Completion Assessment

> **Generated:** 2026-07-12  
> **Scope:** `@stoked-ui/common`, `@stoked-ui/timeline`, `@stoked-ui/file-explorer`, `@stoked-ui/media` (supporting), `@stoked-ui/editor`, `sui-video-renderer` (Rust/WASM/CLI)  
> **Purpose:** Deep assessment of what was built, what is wrong by 2026 standards, what to keep, fix, defer, or discard — and how to make the editor run well in the browser.

---

## Executive Summary

The sui-editor stack is a **real, composable NLE-style web editor** — not a prototype shell. The architectural bet from a few years ago was sound: separate timeline engine, media abstraction, file explorer, and editor shell, with an optional Rust compositor for preview and a native CLI for export. That separation is still the right shape.

What blocks completion today is not missing UI — it is **integration debt, persistence choices from 2020, and a WASM path that is 70% built but not wired**:

| Layer | Verdict | Completion estimate |
|-------|---------|---------------------|
| `@stoked-ui/timeline` | **Keep & harden** — Engine/controller model is the core asset | ~75% |
| `@stoked-ui/file-explorer` | **Keep & prune** — plugin architecture is solid; dead MUI X path must go | ~70% |
| `@stoked-ui/common` | **Keep types/utils; replace persistence** | ~60% (foundation OK, media storage wrong) |
| `@stoked-ui/media` | **Keep** — `MediaFile`, `Stage`, `ScreenshotStore` are load-bearing | ~80% |
| `@stoked-ui/editor` | **Keep & wire** — shell works; critical bugs and WASM glue missing | ~65% |
| `sui-video-renderer` (Rust) | **Keep & invest** — 153 compositor tests pass; this is valuable IP | ~85% Rust, ~30% browser integration |

**Bottom line:** Do not restart the editor. Restart only the **persistence layer**, the **WASM integration glue**, and the **half-finished MUI X migration scaffolding** in file-explorer. Everything else is incremental hardening toward a shippable browser NLE.

---

## 1. System Architecture

### 1.1 Composition model

```
┌─────────────────────────────────────────────────────────────────┐
│  @stoked-ui/editor                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ EditorView   │  │ EditorControls│  │ FileExplorerTabs       │ │
│  │ canvas/video │  │ play/record  │  │ (@stoked-ui/file-explorer)│
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘ │
│         │                 │                       │              │
│  ┌──────▼─────────────────▼───────────────────────▼────────────┐ │
│  │ EditorProvider → TimelineProvider → EditorEngine            │ │
│  │   extends Timeline Engine + Controllers (video/audio/image) │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
  @stoked-ui/timeline   @stoked-ui/media    @stoked-ui/common
  Engine, controllers,  MediaFile, Stage,   LocalDb, Mime,
  Timeline UI           ScreenshotStore      namedId, settings
```

### 1.2 Data flow (editing session)

1. User imports media via file explorer → `MediaFile.from()` → track created via `getTrackFromMediaFile()`
2. Project persisted as `.sue` (`StokedUiEditorApp`) via `LocalDb` (IndexedDB)
3. `EditorFile.preload()` downloads full video blobs into IndexedDB (`VideoDb` path)
4. Playback: Timeline `Engine._tick` → per-track `controller.update()` → `VideoController.drawImage()` on canvas
5. Export (browser): `canvas.captureStream()` + `MediaRecorder` (prototype quality)
6. Export (native): `video-render` CLI reads `.sue` → frame-by-frame Rust compositor → FFmpeg (production quality)

### 1.3 Package dependency graph (editor-relevant)

```
@stoked-ui/editor
  ├── @stoked-ui/timeline
  │     ├── @stoked-ui/common
  │     ├── @stoked-ui/media
  │     └── @stoked-ui/file-explorer (peer only — zero imports in timeline src)
  ├── @stoked-ui/file-explorer
  │     ├── @stoked-ui/common
  │     └── @stoked-ui/media
  ├── @stoked-ui/media
  │     └── @stoked-ui/common
  ├── @stoked-ui/common
  └── @stoked-ui/video-renderer-wasm (optional, file: dep)
```

---

## 2. Package Assessments

### 2.1 `@stoked-ui/common` (v0.2.2)

**Role:** Foundation — IDs, MIME registry, IndexedDB persistence, settings/flags, small MUI components, shared API types.

#### What works

- Correct position at the root of the dependency DAG (no internal `@stoked-ui/*` deps)
- `LocalDb` versioning model (project files + version history + URL index) is a reasonable browser persistence abstraction
- `MimeRegistry` / `SUIMime` extensibility for proprietary formats (`application/stoked-ui-*`)
- `interfaces/` cleanly shares upload/auth DTOs between browser and NestJS API packages
- `SortedList`, `Settings` Proxy, `FetchBackoff` are thoughtful primitives

#### What was done incorrectly (2026 lens)

| Issue | Severity | Detail |
|-------|----------|--------|
| Dual IndexedDB systems | **Critical** | `VideoDb` exports raw `openDB` for `VideoEditorDB`; `LocalDb` uses `@tempfix/idb` separately. Editor imports `openDB` from common and hits the **wrong** DB. |
| Full video blobs in IDB | **Critical** | `storeVideo` fetches entire URLs into Blobs. Wrong tier for 2026: no OPFS, no streaming, quota pressure, preload blocks editing |
| `ProviderState.checkTriggers` bug | **High** | Object-trigger branches write to init `settings` param, not `this.settings` — flag triggers silently fail |
| `useResizeWindow` Rules-of-Hooks violation | **High** | Early return before `useState` on SSR path |
| `GrokLoader` hooks in JSX | **Medium** | `useTransform()` called inside style prop objects |
| Compiled `.js` artifacts in `src/` | **Medium** | 28 JS files alongside TS — ambiguous source of truth |
| `CalendarBooking` in foundation package | **Low** | ~784 LOC of consulting-specific UI coupled to unrelated consumers |
| `sideEffects: false` + `Array.prototype.mergeWith` | **Low** | Global prototype mutation contradicts tree-shaking contract |

#### Test coverage

4 Jest suites, 80 tests — but **only `SocialLinks` and `CalendarBooking` are covered**. `LocalDb`, `FetchBackoff`, `namedId`, `ProviderState`, MIME registry: **0%**.

#### Verdict

| Action | Items |
|--------|-------|
| **Keep** | `interfaces/`, `MimeType`, `namedId`, `SortedList`, `FetchBackoff`, `ProviderState` (after bug fix) |
| **Replace** | `VideoDb` blob caching → OPFS or metadata-only IDB + URL/OPFS bytes |
| **Throw away** | `VideoDb` React demo component, compiled `src/**/*.js`, `Dialog.types.ts` (unexported dead types) |
| **Extract later** | `CalendarBooking` → `@stoked-ui/calendar` or docs-only module |

---

### 2.2 `@stoked-ui/timeline` (v0.1.3)

**Role:** NLE timeline UI + playback engine. ~105 files, ~11k LOC.

#### What works (the asset worth preserving)

The **Engine / Controller / Provider** split is the strongest part of the entire stack:

- `Engine` runs a decoupled rAF loop with action enter/update/leave scheduling
- `Controller` lifecycle maps cleanly to media types (video, audio, image)
- `TimelineFile extends AppFile` integrates command undo/redo from `@stoked-ui/media`
- Vertical virtualization via `react-virtualized` helps many-track projects
- Screenshot filmstrips via `ScreenshotStore` are good UX
- `@stoked-ui/editor` extends `Engine`, `TimelineFile`, `TimelineProvider` without forking — proof the extension model works

#### What was done incorrectly (2026 lens)

| Issue | Severity | Detail |
|-------|----------|--------|
| React on scrub/playback hot path | **Critical** | `setCursor` dispatches full reducer on every drag event; `settings.tracks/actions` maps rebuilt O(n) per dispatch |
| No horizontal virtualization | **High** | All clips in visible rows are full DOM nodes + interact.js bindings |
| `react-virtualized` | **High** | Unmaintained; poor Concurrent React story; `@tanstack/react-virtual` is the 2026 default |
| `PlaybackMode.CANVAS` naming confusion | **Medium** | Means preview compositor drives time — timeline chrome is still DOM, not canvas |
| Dead peer dep `@stoked-ui/file-explorer` | **Low** | Listed in package.json; zero imports in timeline `src/` |
| ResizeObserver bug in `Timeline.tsx` | **Medium** | Condition uses `=== undefined` inverted — width may never update |
| `Engine._dealClear` BTree misuse | **Medium** | Uses `minKey` as array index instead of action ID lookup |
| Reducer in-place mutation | **Medium** | `UNDO`/`EXECUTE_COMMAND` mutates arrays attached to state |
| Debug `console.info` in Engine hot paths | **Low** | Scrub/playback noise in production |
| `window.setSetting` globals in provider | **Low** | Dev shortcuts leaked to production |

#### Rendering approach

**DOM + CSS + interact.js** — not canvas. This is a mid-2010s web NLE pattern. Fine for editor-scale projects (5–15 tracks, 10–30 clips). Not CapCut/Descript scale.

#### Test coverage

Effectively **untested**: one `themeAugmentation.spec.ts` that calls `createTheme()` without assertions. No tests for Engine tick math, reducer, DnD, scrubbing.

#### Verdict

| Action | Items |
|--------|-------|
| **Keep** | Engine, Controller model, TimelineFile, command integration, vertical virt |
| **Fix (easy)** | Scrub path (engine-only during drag, dispatch on end), reducer map rebuild scope, ResizeObserver, console removal, memoization |
| **Fix (medium)** | Horizontal viewport culling for clips; migrate `react-virtualized` → `@tanstack/react-virtual` |
| **Not worth it now** | Full canvas/WebGL timeline rewrite; replace interact.js; custom state manager |
| **Throw away** | `window.setSetting` globals, `framework-utils` dep (one `prefixNames` call), misleading debug styles |

---

### 2.3 `@stoked-ui/file-explorer` (v0.1.2)

**Role:** Tree/grid file panel with DnD, selection, keyboard nav. ~176 files, ~19k LOC.

#### What works

- **Plugin architecture** modeled after MUI X DataGrid — extensible, well-typed, documented in `.axioms.md`
- Keyboard/a11y plugins thoroughly tested (selection: 71 cases, keyboard: 99 cases)
- **Atlaskit pragmatic-drag-and-drop** — mature hitbox instructions, folder auto-expand, drag preview portal
- External drop security via `fileValidation.ts` (denylist, MIME allowlist, 10MB cap)
- `MediaFile.from(dropEvent)` integration for OS file import
- Feature-flag rollback design (`FileExplorerLegacy` preserved)

#### What was done incorrectly (2026 lens)

| Issue | Severity | Detail |
|-------|----------|--------|
| MUI X migration not wired | **Critical** | `FileExplorer` always renders `FileExplorerLegacy`; CHANGELOG overstates completion |
| Dual DnD stacks | **High** | Atlaskit (active) + MUI X adapters (dead) = maintenance burden |
| No DnD tests | **High** | ~800 LOC `useFileExplorerDnd.tsx` with zero test coverage |
| No virtualization | **High** | Recursive React tree; ~500–1000 items = jank; benchmark notes ~450ms render |
| No thumbnails | **Medium** | Despite `@stoked-ui/media` peer dep, only MIME → icon mapping; `media` field unused visually |
| `media?: any` | **Medium** | Loses cross-package type contract |
| Trash node auto-injection | **Low** | Silently mutates `props.items` when DnD+trash enabled |
| Version mismatch | **Low** | package `0.1.2` vs CHANGELOG claims `v1.0.0` |

#### Media integration depth

**Ingestion only.** `MediaFile.from()` on external drop + `MediaType` for icons. No `ScreenshotStore`, no waveform, no `getUrl()` in UI. For a video editor asset panel, this is thin.

#### Verdict

| Action | Items |
|--------|-------|
| **Keep** | Plugin engine, Atlaskit DnD, selection/keyboard/grid plugins, `FileExplorerTabs` |
| **Decide now** | Commit to legacy+Atlaskit **OR** finish RichTreeView wiring — not both |
| **Throw away** | `CustomFileTreeItem.tsx`, `transformFilesToTreeItems.ts`, `muiXDndAdapters.ts`, `handleFileDrop` stub, estimated benchmark metrics |
| **Add** | DnD unit tests; optional thumbnail column via `@stoked-ui/media` screenshots |
| **Defer** | Full virtualization (only needed for 1000+ asset libraries) |

---

### 2.4 `@stoked-ui/media` (supporting layer, v0.1.0-alpha.5)

**Role:** Framework-agnostic media core — not assessed in full here, but load-bearing for the editor.

#### Editor-critical surfaces

| Primitive | Editor usage |
|-----------|--------------|
| `MediaFile` / `IMediaFile` | Track file references, import, metadata |
| `Stage.getStage(editorId)` | Hidden off-screen DOM host for `<video>` elements |
| `ScreenshotStore` | Timeline filmstrip thumbnails (seek + canvas capture, localStorage cache) |
| `StokedUiEditorApp` | `.sue` project MIME type |
| `Command` / undo-redo | Timeline command history |

#### Gaps affecting editor completion

- `MediaFile.fromUrl()` retry/backoff — no dedicated test despite ~1000 LOC module
- Image layers broken at controller level (see editor section), not media layer
- Server/API surfaces (`MediaGallery`, upload handlers) are out of editor scope

**Verdict:** Keep. Invest in `MediaFile` tests and tighter typing on the `media` field shared with file-explorer.

---

### 2.5 `@stoked-ui/editor` (v0.1.2)

**Role:** Flagship composition editor — timeline + file explorer + canvas preview + optional WASM.

#### What works

- Clean grid layout: `EditorView` (canvas + screener + stage), `EditorControls`, `Timeline`, `FileExplorerTabs`
- `EditorProvider` wraps `TimelineProvider` with `EditorEngine` and editor reducer
- Controller registry (`video`, `audio`, `image`, `compositor`) with extension points
- Dual preview modes: `CANVAS` (multi-track) vs `TRACK_FILE`/`MEDIA` (single-file screener)
- `ScreenshotStore` filmstrip integration
- Graceful WASM fallback when package absent or load fails
- `MediaRecorder` + `AudioContext` mixing architecture for browser recording is directionally correct
- README and package exports are accurate

#### What was done incorrectly (2026 lens)

| Issue | Severity | Detail |
|-------|----------|--------|
| `VideoController.destroy()` → `process.exit(333)` | **P0** | Would kill browser/Node host — copy-paste error |
| `ImageController.createNewImage()` unconditionally throws | **P0** | Image tracks unusable |
| `alert('3')` in `Editor.tsx` | **P0** | Debug leftover in production path |
| Canvas resolution mismatch | **P0** | `EditorView` sets canvas internal size to display size; `EditorEngine` renders at 1920×1080 — scaling/quality bug |
| WASM not orchestrated | **P0** | `CompositorController` never assigned to tracks; dual canvas+WASM render paths conflict |
| JSON schema mismatch TS ↔ Rust | **P0** | `CompositorController` emits camelCase nested JSON; Rust `WasmLayer` expects flat snake_case. `actionMapper.ts` exists but is unused |
| Browser export quality | **P1** | `MediaRecorder` with `video/mp4` (often unsupported); no frame-accurate offline path |
| No browser → CLI bridge | **P1** | Production export requires separate `video-render` CLI invocation |
| `AnimationController` commented out | **P2** | Lottie path non-functional |
| TypeScript build failures | **P2** | Documented in `validation-state.json` (Blob types, plyr types) |
| Docs import name drift | **P2** | `@stoked-ui/sui-editor` vs `@stoked-ui/editor`; `wasm-preview` vs `video-renderer-wasm` |

#### Current preview pipeline (what actually runs today)

```
Timeline tick
  → VideoController.update() → seek video
  → VideoController.draw() → engine.renderCtx.drawImage(videoElement, ...)
  → (WASM path: initialized but not driving output)
```

#### Verdict

| Action | Items |
|--------|-------|
| **Keep** | Editor shell, provider/engine extension, controller registry, dual preview modes, recording architecture |
| **Fix immediately** | `process.exit`, `createNewImage`, `alert`, canvas resolution sync |
| **Wire (highest leverage)** | `CompositorOrchestrator` in `EditorEngine` using `actionMapper.ts` with Rust-compatible JSON |
| **Throw away** | Inline layer conversion in `CompositorController`; stale `IMPLEMENTATION_PLAN.md` checkboxes; `CompositorController` as per-track `IController` (wrong abstraction) |
| **Defer** | Lottie/AnimationController until core NLE path ships |

---

### 2.6 `sui-video-renderer` (Rust workspace)

**Role:** Native compositor + WASM preview + CLI export. **Not a published npm package** — outputs `@stoked-ui/video-renderer-wasm` via `file:` dep.

#### Crate structure

```
compositor (video-compositor)     ← shared lib, 153 unit tests
    ↑
wasm-preview                      ← wasm-bindgen → ~930KB WASM
    ↑
cli (video-render)                ← native .sue → .mp4 via FFmpeg
```

#### What works (this is real, not a half-hearted stub)

| Component | Evidence |
|-----------|----------|
| Multi-layer composition | 16+ blend modes, transforms, opacity, z-order |
| Text rendering | fontdue-based |
| Effects + keyframes | 45+ effect validation tests |
| Frame cache + prefetch | Implemented in compositor |
| WASM solid-color render | 12 headless browser integration tests |
| CLI pipeline | E2E fixtures: `simple.sue`, `multilayer.sue`, `animated.sue` |
| Blend/transform accuracy | Dedicated integration test suites |

#### What was done incorrectly / incompletely

| Issue | Severity | Detail |
|-------|----------|--------|
| Editor ↔ WASM wire format | **P0** | Schema mismatch; renders fail silently or produce empty frames |
| Video in WASM = canvas round-trip | **P1** | `capture_video_frame` via temp canvas + `getImageData` — expensive at 1080p/60fps |
| No WebCodecs in WASM path | **P1** | 2026 browsers expose `VideoFrame`; not used |
| Image layers need JS pre-cache | **P1** | No async URL fetch in WASM; `cache_image()` must be called from JS |
| Text layers missing in WASM `convert_layer` | **P2** | No `"text"` branch |
| No Worker offload | **P2** | WASM runs on main thread |
| `benchmark/compositor-comparison` broken | **P2** | References non-existent `sui-video-renderer-rust`; `compare-results.js` missing |
| Published package strategy | **P2** | `file:../sui-video-renderer/pkg` breaks npm consumers outside monorepo |

#### Verdict on the Rust effort

**Do not throw away.** The compositor is the most complete subsystem in the entire product. The "half-hearted" part was the **JavaScript glue**, not the Rust. Invest in wiring, not rewriting.

| Action | Items |
|--------|-------|
| **Keep & invest** | `compositor` crate, CLI, WASM `PreviewRenderer` |
| **Wire** | `actionMapper.ts` → `CompositorOrchestrator` → single `render_frame` per tick |
| **Fix or delete** | `benchmark/compositor-comparison` (paths broken); stale `IMPLEMENTATION_PLAN.md` |
| **Publish** | `@stoked-ui/video-renderer-wasm` to npm with semver, not `file:` link |
| **Future** | WebCodecs `VideoFrame` → WASM shared buffer; Worker + `OffscreenCanvas` |

---

## 3. Cross-Cutting Issues

### 3.1 Technology stack age

| Technology | Current pin | 2026 mainstream | Risk |
|------------|-------------|-----------------|------|
| React | 18.3.1 | 19.x | Manageable; monorepo-wide bump needed |
| MUI | 5.17.1 | 6.x/7.x | Maintenance mode; theme migration cost |
| `react-virtualized` | in timeline | `@tanstack/react-virtual` | Unmaintained |
| IndexedDB full blobs | common + editor | OPFS + metadata-only IDB | **Architectural debt** |
| Canvas 2D preview | editor default | WebCodecs + WASM compositor | Performance ceiling |
| TypeScript target | ES2015 (common) | ES2022+ | Missing modern APIs |

### 3.2 Testing posture (editor stack)

| Package | Unit tests | Critical gaps |
|---------|------------|---------------|
| `sui-common` | 80 tests (2 modules only) | LocalDb, MIME, ProviderState |
| `sui-timeline` | ~0 real tests | Engine, reducer, scrub math |
| `sui-file-explorer` | ~60% plugin coverage | DnD (0%), integration |
| `sui-editor` | Minimal (via editor file test) | Controllers, WASM wire, recording |
| `sui-video-renderer` | 153+ Rust tests | TS integration contract test |

### 3.3 Documentation honesty

Several packages overstate completion in CHANGELOG/README relative to actual render paths:
- File-explorer MUI X migration documented but not wired
- Editor WASM documented as optional capability but schema-incompatible with Rust
- `IMPLEMENTATION_PLAN.md` in video-renderer is stale vs actual code state

---

## 4. What to Throw Away vs. Keep vs. Restart

### 4.1 Throw away (delete, do not incrementally fix)

| Item | Package | Reason |
|------|---------|--------|
| `VideoDb` React component + raw IDB helpers | common | Unused demo; wrong persistence model |
| MUI X dead path (`CustomFileTreeItem`, adapters, transforms) | file-explorer | Orphaned scaffolding inflating deps |
| `CompositorController` inline JSON mapping | editor | Wrong schema; superseded by `actionMapper.ts` |
| `benchmark/compositor-comparison` (as-is) | repo root | Broken script paths; use `cargo bench` instead |
| `window.setSetting` globals | timeline | Debug leaked to production |
| `process.exit(333)` in VideoController | editor | Catastrophic if ever called |
| Stale `IMPLEMENTATION_PLAN.md` checkboxes | video-renderer | Misleading; rewrite or delete |
| Compiled `.js` in `sui-common/src/` | common | Not source; noisy diffs |

### 4.2 Keep and harden (core IP)

| Item | Why |
|------|-----|
| Timeline `Engine` + `Controller` lifecycle | Best abstraction in the stack; editor extends cleanly |
| Timeline DOM UI + interact.js | Works for target scale; not worth canvas rewrite |
| File-explorer plugin engine + Atlaskit DnD | Solid foundation; just prune dead path |
| `MediaFile`, `Stage`, `ScreenshotStore` | Load-bearing for preview and filmstrips |
| Editor shell (grid, provider, dual preview modes) | Composition model is correct |
| Rust `compositor` + CLI | 153 tests, blend modes, text, effects — valuable |
| WASM `PreviewRenderer` | Compiles, tests pass — needs glue only |
| `LocalDb` versioning concept | Right idea; wrong byte storage tier |
| `actionMapper.ts` | Correct bridge design; just needs to be called |

### 4.3 Start over (scoped restarts only)

| Scope | What to rebuild | What to preserve |
|-------|-----------------|------------------|
| **Media persistence** | OPFS for bytes + IDB for metadata/versions only | `LocalDb` API surface, `.sue` format |
| **WASM integration glue** | `CompositorOrchestrator` pattern | Rust compositor, `actionMapper.ts`, Engine tick |
| **Browser export v2** | WebCodecs `VideoEncoder` or CLI bridge | `MediaRecorder` for quick capture only |

**Do NOT restart:** timeline UI, file-explorer plugins, editor layout, Rust compositor core.

---

## 5. How to Make It Run Super Well in the Browser

### 5.1 Target architecture (preview)

```
Timeline tick (rAF)
  │
  ├─ VideoController.update()  → seek video, NO drawImage
  ├─ AudioController.update()  → Howler volume/seek
  ├─ ImageController.update()  → ensure cached (when fixed)
  │
  └─ CompositorOrchestrator.renderFrame(time)
         ├─ actionToWasmLayer() for each active action
         ├─ PreviewRenderer.render_frame(wasmJson)  [WASM]
         │     OR fallback: single-pass canvas 2D composite [JS]
         └─ blit to display canvas (fixed 1920×1080 buffer, CSS scale)
```

### 5.2 Performance checklist (ordered by ROI)

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| 1 | Remove debug code (`process.exit`, `alert`, console spam) | Hours | Stability |
| 2 | Fix canvas: fixed project-resolution buffer + CSS `transform: scale()` | 1 day | Correct output |
| 3 | Scrub path: engine-only cursor updates during drag; React dispatch on drag end | 1–2 days | Scrub smoothness |
| 4 | `React.memo` on `TimelineAction`/`TimelineTrack`; stop reducer map rebuild every dispatch | 1–2 days | Fewer re-renders |
| 5 | Wire `CompositorOrchestrator` + `actionMapper` with Rust JSON schema | 2–3 days | WASM preview works |
| 6 | Single compositor pass per frame (disable per-controller `drawImage` when WASM on) | 2–3 days | Eliminates double render |
| 7 | Horizontal viewport culling for timeline clips | 2–3 days | Long timeline perf |
| 8 | `cache_image()` on image preload | 1 day | Image layers in WASM |
| 9 | `requestVideoFrameCallback` for playhead sync (already partial) | 1 day | Playback accuracy |
| 10 | Worker + `OffscreenCanvas` for WASM compositor | 1–2 weeks | Main thread free |
| 11 | WebCodecs `VideoFrame` → WASM memory (zero-copy) | 2–4 weeks | 1080p/60fps viable |
| 12 | OPFS persistence replacing IDB blobs | 2–4 weeks | Load time + quota |

### 5.3 Realistic performance expectations

| Scenario | Today | After Phase 1 (items 1–6) | After Phase 2 (items 7–12) |
|----------|-------|----------------------------|---------------------------|
| 1 video layer 1080p preview | OK (HW decode + drawImage) | Similar | Similar |
| 3+ layers + blend modes | Limited (canvas 2D blend) | WASM wins | WASM + Worker smooth |
| 10+ layers 1080p | Janky | Usable with frame drop | Good |
| Rapid scrub with filmstrips | Janky (React per move) | Much better | Good |
| 50 tracks × 20 clips | Poor (no horiz culling) | Better | Good |
| Export quality | MediaRecorder (poor) | MediaRecorder | CLI or WebCodecs (good) |

### 5.4 Pragmatic WASM strategy

- **Default:** Canvas 2D for simple 1–2 layer preview (low overhead)
- **Opt-in:** WASM compositor for 3+ layers, blend modes, effects
- **Do not force WASM** for single-video playback until WebCodecs zero-copy exists
- **Export:** CLI (`video-render`) for production; browser export is "quick share" only until WebCodecs encoder ships

---

## 6. Easy Wins (days, high ROI)

### All packages

| Action | Package | Effort |
|--------|---------|--------|
| Fix `ProviderState.checkTriggers` bug | common | 5 min |
| Rename `VideoDb.openDB` → `openVideoEditorDB` | common | 30 min |
| Remove/gate `console.*` in Engine + provider | timeline | Hours |
| Fix ResizeObserver condition | timeline | Minutes |
| `React.memo` on timeline clips | timeline | 1 day |
| Remove `console.*` from DnD/tabs | file-explorer | 30 min |
| Extract shared `getIconFromMediaType()` | file-explorer | 1 hr |
| Remove `process.exit`, `alert`, fix `createNewImage` | editor | Hours |
| Sync canvas internal resolution to engine render dims | editor | 1 day |
| Wire `actionMapper.ts` + Rust-compatible JSON serializer | editor | 1–2 days |
| Add `CompositorOrchestrator` in `EditorEngine` | editor | 2–3 days |
| Publish `@stoked-ui/video-renderer-wasm` or document monorepo-only | video-renderer | Hours |
| Add WasmLayer contract smoke test (post-`build:wasm`) | CI | 1 day |
| Delete MUI X dead path OR finish wiring — pick one | file-explorer | 1–2 days |

---

## 7. Worth Doing But Not Now (weeks, defer)

| Item | Why defer |
|------|-----------|
| Full MUI v6 + React 19 migration | Monorepo-wide cascade; do as governed project |
| `react-virtualized` → `@tanstack/react-virtual` | Works today; migrate after scrub path fixed |
| OPFS persistence rewrite | Large; belongs in dedicated epic after editor wires |
| WebCodecs `VideoFrame` → WASM | High value but needs orchestrator first |
| Worker + OffscreenCanvas WASM | After orchestrator proves WASM path |
| Timeline canvas/WebGL rewrite | DOM+DnD sufficient for target scale |
| File-explorer virtualization | Only needed for 1000+ asset libraries |
| Lottie/AnimationController | Core NLE must ship first |
| Extract `CalendarBooking` from common | Correct long-term; low runtime impact |
| Finish MUI X RichTreeView migration | Only if Atlaskit path proves insufficient |

---

## 8. Recommended Completion Roadmap

### Phase 0: Stop the bleeding (1 week)

- [ ] Remove `process.exit(333)`, `alert('3')`, implement `ImageController.createNewImage`
- [ ] Fix canvas resolution mismatch
- [ ] Fix `ProviderState` bug + `openDB` naming collision
- [ ] Remove production `console.*` from hot paths
- [ ] Delete or quarantine MUI X dead code in file-explorer
- [ ] Add WasmLayer contract test in CI

### Phase 1: Make preview correct (2–3 weeks)

- [ ] Implement `CompositorOrchestrator` in `EditorEngine`
- [ ] Wire `actionMapper.ts` with Rust snake_case JSON output
- [ ] Disable per-controller `drawImage` when WASM orchestrator active
- [ ] `cache_image()` on image track preload
- [ ] Timeline scrub path optimization (engine-only during drag)
- [ ] `React.memo` + reducer map rebuild scope fix
- [ ] Unit tests: `deal_data.ts`, Engine enter/leave, `actionMapper`

### Phase 2: Make preview fast (3–4 weeks)

- [ ] Horizontal viewport culling for timeline clips
- [ ] Playback cursor via ref/CSS transform, not full tree commit per frame
- [ ] Worker + OffscreenCanvas for WASM (optional feature flag)
- [ ] DnD test coverage in file-explorer
- [ ] Jest harness for timeline + editor packages in CI
- [ ] Publish `@stoked-ui/video-renderer-wasm` to npm

### Phase 3: Make export real (4–6 weeks)

- [ ] "Export" button → serialize `.sue` → invoke CLI (Tauri/Electron) or server render
- [ ] WebCodecs `VideoEncoder` prototype for browser export
- [ ] OPFS persistence: metadata in IDB, bytes in OPFS
- [ ] WebCodecs `VideoFrame` pipeline for WASM video layers

### Phase 4: Polish & ship (ongoing)

- [ ] Thumbnail column in file-explorer via `ScreenshotStore`
- [ ] React 19 + MUI 6 coordinated migration
- [ ] `react-virtualized` migration
- [ ] Animation/Lottie controller (if product requires)
- [ ] Documentation audit: align CHANGELOG with actual behavior

---

## 9. Competitive Positioning (2026)

| Dimension | sui-editor today | Remotion | CapCut Web / Descript-class |
|-----------|------------------|----------|----------------------------|
| Model | Tracks + time ranges (NLE) | Frame-centric React tree | Consumer NLE + GPU |
| Timeline rendering | DOM clips + virt rows | DOM; preview via React | Canvas/WebGL at scale |
| Preview compositor | Canvas 2D (WASM ready) | React render tree | WASM decode + GPU |
| Extension model | MUI slots + controller plugins | React components | Closed |
| Export | MediaRecorder (browser) + CLI (native) | Lambda/server render | Proprietary cloud |
| Open source compositor | Rust WASM (153 tests) | N/A (JS) | N/A |

**Positioning:** sui-editor is a **composable, embeddable NLE component suite** — not a consumer SaaS competitor. The Rust compositor is a differentiator for multi-layer blend/effects preview. The DOM timeline is fine for embed scenarios; don't chase CapCut scale.

---

## 10. Priority Matrix

```
                    HIGH IMPACT
                        │
    Wire WASM           │  Fix critical bugs
    orchestrator        │  (process.exit, images,
    + actionMapper      │   canvas resolution)
                        │
  ──────────────────────┼────────────────────── EFFORT
                        │
    OPFS persistence    │  Delete MUI X dead code
    WebCodecs pipeline  │  Remove console/debug
                        │  Add DnD tests
                        │
                    LOW IMPACT
```

**Do first (upper-right, low effort):** critical bug fixes, debug removal, schema wiring.  
**Do second (upper-left):** CompositorOrchestrator — unlocks the Rust investment.  
**Do third (lower-left):** OPFS, WebCodecs — scale enablers.  
**Skip (lower-right):** benchmark package fixes, CalendarBooking extraction — unless blocked.

---

## 11. Final Verdict

The work from a couple years ago was **architecturally ahead of its time** in the right ways: composable packages, a decoupled timeline engine, a real Rust compositor, and a clean editor shell. What aged poorly is **browser media storage** (full blobs in IDB), **React on hot paths** (scrub/playback), **half-finished migrations** (MUI X file-explorer, WASM editor glue), and **debug code left in production paths**.

**Complete the editor by wiring what exists, not by rebuilding.**

The single highest-leverage action is a **`CompositorOrchestrator` in `EditorEngine`** that calls the already-written `actionMapper.ts` against the already-tested Rust WASM compositor, while fixing the five P0 bugs that make the current build unsafe or incomplete.

The Rust renderer was not a failed experiment — it was a **successful compositor with incomplete JavaScript plumbing**. Finish the plumbing.

---

## Appendix: Key File References

| Concern | Path |
|---------|------|
| Editor entry | `packages/sui-editor/src/index.ts` |
| Engine extension | `packages/sui-editor/src/EditorEngine/EditorEngine.ts` |
| WASM action mapping | `packages/sui-editor/src/WasmPreview/actionMapper.ts` |
| Video controller bug | `packages/sui-editor/src/Controllers/VideoController.ts:497` |
| Image controller bug | `packages/sui-editor/src/Controllers/ImageController.ts:58-59` |
| Timeline engine | `packages/sui-timeline/src/Engine/Engine.ts` |
| Timeline reducer | `packages/sui-timeline/src/TimelineProvider/TimelineReducer.ts` |
| File-explorer plugins | `packages/sui-file-explorer/src/internals/plugins/` |
| Dual IDB | `packages/sui-common/src/LocalDb/VideoDb.tsx` + `LocalDb.ts` |
| Rust compositor | `packages/sui-video-renderer/compositor/src/` |
| WASM bindings | `packages/sui-video-renderer/wasm-preview/src/lib.rs` |
| CLI export | `packages/sui-video-renderer/cli/src/render.rs` |
| Product context | `.stokd/meta/SC_PRODUCT_STOKED_UI_SUI.md` |
| Existing recs | `.stokd/meta/SC_RECOMMENDATIONS.md` |

---

*This document should be read alongside `SC_RECOMMENDATIONS.md` (repo-wide) and `SC_PRODUCT_STOKED_UI_SUI.md` (product scope). For governed implementation, dispatch work via Stokd project phases aligned to Section 8.*