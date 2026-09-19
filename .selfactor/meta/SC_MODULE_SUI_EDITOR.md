# SC_MODULE_SUI_EDITOR

> **Generated:** 2026-03-21 | **Meta version:** 0.2.0
> **Package:** `@stoked-ui/editor` v0.1.2
> **Location:** `packages/sui-editor`
> **Repository:** `@stoked-ui/sui`

---

## Module Name

`@stoked-ui/editor` — Multi-layer video composition editor

---

## Responsibility

`sui-editor` is the top-level composition editor for Stoked UI. It assembles a full non-linear video editing UI from the constituent modules (`sui-timeline`, `sui-media`, `sui-file-explorer`, `sui-common`) and adds the canvas rendering pipeline, media type controllers, recording, and detail inspection panels.

**Primary responsibilities:**

- Provide `<Editor />`, a grid-layout React component that hosts viewer, controls, timeline, and file explorer
- Manage an `EditorEngine` that drives frame-by-frame canvas compositing across layered video/audio/image tracks
- Record canvas output as MP4 via `MediaRecorder` with mixed audio routing through a single `AudioContext`
- Persist and restore project files (`EditorFile`) using IndexedDB via `@stoked-ui/common`
- Bridge an optional Rust/WASM compositor (`@stoked-ui/video-renderer-wasm`) for hardware-accelerated preview rendering
- Expose a modal `DetailView` for editing properties of the selected project, track, or action
- Support three playback modes: `CANVAS` (composited canvas), `TRACK_FILE` (raw screener video), `MEDIA` (standalone media playback)

---

## Public Interfaces / Entry Points

### Components

| Export | File | Purpose |
|--------|------|---------|
| `Editor` (default) | `src/Editor/Editor.tsx` | Top-level editor component (`MuiEditor` theme key). Props: `file`, `fileUrl`, `mode`, `fullscreen`, `detailMode`, `record`, `localDb`, `noLabels`, `noTrackControls`, `noSnapControls`, `noResizer`, `allControls`, `minimal`, `slots`, `slotProps`, `sx` |
| `EditorProvider` | `src/EditorProvider/EditorProvider.tsx` | React context provider. Wraps `TimelineProvider` with `EditorEngine` + `EditorReducer`. Must be an ancestor of `<Editor />` |
| `EditorView` | `src/EditorView/EditorView.tsx` | Canvas viewport pane. Contains `<canvas role="renderer">`, `<video role="screener">`, `<div role="stage">`, and `<Loader />`. Connects itself as `engine.viewer` on mount |
| `EditorControls` | `src/EditorControls/EditorControls.tsx` | Transport bar: play/pause/record, rewind, fast-forward, skip to start/end, time display, playback rate selector, volume |

### Classes / Models

| Export | File | Purpose |
|--------|------|---------|
| `EditorEngine` | `src/EditorEngine/EditorEngine.ts` | Extends `Engine` from `@stoked-ui/timeline`. Adds: canvas drawing (`drawImage`), `record()`/`finalizeRecording()`, WASM init (`initWasmRenderer()`), `setTime()` override that clears canvas, `viewer` setter that discovers DOM elements |
| `EditorFile` | `src/EditorFile/EditorFile.ts` | Extends `TimelineFile`. Adds: `blendMode`, `fit`, `width`/`height`, `backgroundColor`. Implements `preload(editorId)` — fetches track videos into IDB and creates object URLs |
| `Controllers` | `src/Controllers/Controllers.ts` | `Record<string, IController>` mapping `{ audio, video, image, compositor }` to their singleton controller instances |

### Type Interfaces

| Export | File | Purpose |
|--------|------|---------|
| `IEditorAction` | `src/EditorAction/EditorAction.ts` | Extends `ITimelineAction`. Adds: `width`, `height`, `z`, `x`, `y`, `fit: Fit`, `blendMode: BlendMode`, `nextFrame?: DrawData` |
| `IEditorTrack` | `src/EditorTrack/EditorTrack.ts` | Extends `ITimelineTrack`. Adds: `hidden`, `blendMode`, `fit`, `image` |
| `IEditorFile` | `src/EditorFile/EditorFile.ts` | Extends `ITimelineFile`. Adds: `image`, `backgroundColor`, `width`, `height`, `video`, `blendMode`, `fit`, `updateStore()` |
| `IEditorEngine` | `src/EditorEngine/EditorEngine.types.ts` | Interface contract for `EditorEngine` |
| `BlendMode` | `src/EditorAction/EditorAction.ts` | CSS blend mode union: `normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion`, `hue`, `saturation`, `color`, `luminosity`, `plus-darker`, `plus-lighter` |
| `Fit` | `src/EditorAction/EditorAction.ts` | `fill` \| `cover` \| `contain` \| `none` |
| `EditorState` | `src/EditorProvider/EditorState.ts` | Extends `TimelineState` with editor engine/file/track/action type params |
| `EditorStateAction` | `src/EditorProvider/EditorProvider.types.ts` | Union of all reducer action types including editor-specific: `SELECT_ACTION`, `SELECT_TRACK`, `SELECT_PROJECT`, `DETAIL_OPEN`, `UPDATE_PROJECT`, `UPDATE_ACTION`, `UPDATE_TRACK`, `DISPLAY_CANVAS`, `DISPLAY_SCREENER`, `VIDEO_CREATED`, `SET_BLEND_MODE`, `SET_FIT`, etc. |

### Factory Functions & Hooks

| Export | File | Purpose |
|--------|------|---------|
| `createEditorFile(props)` | `src/index.ts` | Factory for `EditorFile` instances |
| `getTracksFromMediaFiles(files, time, existing)` | `src/EditorTrack/EditorTrack.ts` | Converts `IMediaFile[]` into `IEditorTrack[]` with default actions |
| `getTrackFromMediaFile(file, time, duration, index)` | `src/EditorTrack/EditorTrack.ts` | Builds a single `IEditorTrack` from a media file |
| `initEditorAction(fileAction, trackIndex)` | `src/EditorAction/EditorAction.ts` | Initializes an action with default editor fields (`z`, `width`, `height`, `fit`) |
| `useEditorApiRef()` | `src/hooks/useEditorApiRef.tsx` | Returns a ref object for imperative editor API access |
| `EditorVideoExampleProps` | `src/index.ts` | Preset `IEditorFileProps` for demo use |

### Controllers (Internal — registered in `Controllers.ts`)

| Key | Class | File | Purpose |
|-----|-------|------|---------|
| `video` | `VideoControl` | `src/Controllers/VideoController.ts` | Manages `HTMLVideoElement` lifecycle per track; canvas sync via `requestVideoFrameCallback`; screenshot generation and localStorage cache; CSS blend mode and fit calculation |
| `audio` | `AudioControl` | `src/Controllers/AudioController.ts` | Manages `Howl` instances via `howler`; syncs seek/rate to engine events; per-action volume keyframe support |
| `image` | `ImageControl` | `src/Controllers/ImageController.ts` | Static image drawing on canvas |
| `compositor` | `CompositorControl` | `src/Controllers/CompositorController.ts` | Bridges timeline lifecycle to WASM `PreviewRenderer`; maintains `activeLayers` map; calls `renderer.render_frame(layersJson)` on enter/update/leave |

### WasmPreview Sub-module

| Export | File | Purpose |
|--------|------|---------|
| `useWasmRenderer` | `src/WasmPreview/useWasmRenderer.ts` | Hook for direct WASM renderer use outside the editor |
| `actionToWasmLayer`, `calculateFitTransform` | `src/WasmPreview/actionMapper.ts` | Converts `IEditorAction` to `CompositorLayer` |
| `WasmPreviewDemo` | `src/WasmPreview/WasmPreviewDemo.tsx` | Demo component for WASM renderer |
| Type exports: `CompositorLayer`, `LayerTransform`, `BlendMode`, `LayerType`, `LayerContent`, etc. | `src/WasmPreview/types.ts` | WASM compositor type system |

### Plugins

| Plugin | File | Purpose |
|--------|------|---------|
| `useEditorMetadata` | `src/internals/plugins/useEditorMetadata/` | Attaches editor metadata to the plugin system |
| `useEditorKeyboard` | `src/internals/plugins/useEditorKeyboard/` | Registers keyboard shortcut handlers on the editor root element |

### Theme Augmentation

`src/themeAugmentation/` — extends MUI theme with `MuiEditor`, `MuiEditorView`, `MuiEditorControls` component slots, overrides, and props.

---

## Products

No product documentation files were listed to reference for this module.

From `SC_VIEWS.md` and `SC_FLOWS.md`, the `sui-editor` module is referenced in:
- Product showcase: **View 1.2** (Editor showcase at `/products/editor/`)
- Product documentation: **View 1.3** (docs at `/products/editor/docs/*`)
- PWA: **View 1.5** (standalone editor at `/products/editor/pwa`, `docs/pages/products/editor/pwa/`)
- Home hero: **View 1.1** (Editor picked as random showcase component)

---

## Views

| View ID | Name | Rendered By |
|---------|------|-------------|
| 1.1 | Home Page (Hero) | `EditorShowcase` in `docs/src/components/home/EditorShowcase.tsx` — embeds `<EditorProvider><Editor /></EditorProvider>` |
| 1.2 | Product Showcase Pages | `EditorShowcase` at `/products/editor/` |
| 1.3 | Product Documentation Pages | Live demos in markdown docs pages; demo components in `packages/sui-editor/docs/src/components/Editor/` (`BasicEditor.tsx`, `CustomEditor.tsx`, `EditorWithContent.tsx`) |
| 1.5 | Editor PWA | Full `<Editor />` embedded at `/products/editor/pwa` |

**Sub-views within the Editor UI:**

| Sub-view | Component | Purpose |
|----------|-----------|---------|
| Viewer pane | `EditorView` | 16:9 canvas composite output |
| Transport bar | `EditorControls` | Playback state and time |
| Timeline | `Timeline` (from `@stoked-ui/timeline`) | Track/action arrangement with `EditorTrackActions` slot |
| File Explorer tabs | `EditorFileTabs` | Drawer-mounted file browser |
| Detail modal | `DetailView` (`src/DetailView/DetailView.tsx`) | Project/track/action property editor |
| Loader overlay | `Loader` (`src/Editor/Loader.tsx`) | Shown during engine LOADING state |
| Context menus | `ContextMenu` | Right-click on tracks/actions/labels |

---

## Integration Points

### Upstream Dependencies

| Package | Contract |
|---------|----------|
| `@stoked-ui/timeline` | `Engine`, `TimelineProvider`, `TimelineFile`, `TimelineState`, `TimelineReducer`, `IController`, `Controller` base class, `PlaybackMode`, `EngineState`, `Timeline` component, `ITimelineTrack`, `ITimelineAction` |
| `@stoked-ui/media` | `MediaFile`, `IMediaFile`, `Stage`, `ScreenshotStore`, `Screenshot`, `AppOutputFile` |
| `@stoked-ui/common` | `namedId`, `LocalDb`, `openDB`, `getOrFetchVideo`, `createSettings`, `VideoSaveRequest`, `IMimeType` |
| `@stoked-ui/file-explorer` | Used via `EditorFileTabs` for file browsing (dev dependency) |
| `@stoked-ui/video-renderer-wasm` (optional) | `PreviewRenderer` WASM class; dynamically imported in `EditorEngine.initWasmRenderer()`. Falls back to canvas if unavailable |
| `howler` / `Howler` (via `howler` npm) | `AudioControl` uses `Howl` for audio playback; `Howler.ctx` / `Howler.masterGain` used in `recordVideo()` for audio mixing |
| `react-hook-form` + `yup` + `@hookform/resolvers` | `DetailView` form validation |
| MUI (`@mui/material`, `@mui/base`, `@mui/system`) | All UI components |

### Downstream Consumers

| Consumer | How |
|----------|-----|
| `docs` Next.js app | Embeds `EditorProvider + Editor` in PWA pages, showcase components, and documentation demos |
| Any external app | Installs `@stoked-ui/editor`, wraps with `EditorProvider`, renders `<Editor file={...} />` |

### State Contract with `@stoked-ui/timeline`

`EditorProvider` calls `createTimelineState()` and delegates to `TimelineProvider`. The `EditorReducer` extends `TimelineReducer` — unknown action types fall through to `TimelineReducer`. The reducer is the primary mutation gateway; components should only dispatch `EditorStateAction` types and never mutate state directly.

---

## Key Source Files

| File | Why It Matters |
|------|---------------|
| `src/index.ts` | Public API surface — all exported symbols |
| `src/Editor/Editor.tsx` | Orchestrates all sub-components via slots; manages flag dispatch, viewer ref, file preload, IDB auto-save, ResizeObserver |
| `src/Editor/Editor.plugins.ts` | Declares `VIDEO_EDITOR_PLUGINS` — the plugin list that drives `useEditor()` |
| `src/EditorEngine/EditorEngine.ts` | Core runtime: canvas compositing, WASM init, recording, `setTime()` override, `_dealEnter()` for controller lifecycle |
| `src/EditorProvider/EditorProvider.tsx` | Constructs `EditorEngine` and initial state, wires `EditorReducer` into `TimelineProvider` |
| `src/EditorProvider/EditorProvider.types.ts` | `EditorReducer` + all `EditorStateAction` types; controls all state transitions |
| `src/EditorProvider/EditorState.ts` | `refreshActionState`, `refreshTrackState` — called on every state update to sync hidden/dim flags and DOM video element visibility |
| `src/EditorFile/EditorFile.ts` | `preload(editorId)` — fetches videos via `getOrFetchVideo`, creates blob URLs, updates `track.source.cachedUrl`. Also `fromUrl()` with IDB lookup fallback |
| `src/EditorView/EditorView.tsx` | DOM structure that `EditorEngine` depends on: `canvas[role=renderer]`, `video[role=screener]`, `div[role=stage]` |
| `src/Controllers/VideoController.ts` | Most complex controller: canvas sync loop via `requestVideoFrameCallback`, fit/blend mode calculation, screenshot generation with localStorage cache |
| `src/Controllers/AudioController.ts` | `Howl` lifecycle; listens to `afterSetTime`/`afterSetPlayRate` engine events |
| `src/Controllers/CompositorController.ts` | WASM bridge: `activeLayers` map, `renderComposite()` serializes layers to JSON and calls `renderer.render_frame()` |
| `src/EditorAction/EditorAction.ts` | `BlendMode` and `Fit` type definitions used across the entire module |
| `src/DetailView/DetailView.tsx` | Modal that spawns a nested `EditorProvider` instance for isolated detail editing |
| `src/WasmPreview/types.ts` | `CompositorLayer`, `LayerTransform`, keyframe/easing types for the WASM compositor |
| `src/db/init.ts` | IDB schema initialization for editor-specific stores |
| `src/internals/useEditor/useEditor.ts` | Plugin system orchestrator; merges plugin-contributed props into the root component API |

---

## Change Impact

### High-Risk Changes

| Area | What Breaks |
|------|-------------|
| `EditorEngine.setTime()` | Canvas clear + controller enter/leave lifecycle. Regression: frames not clearing or not rendering at scrub position |
| `EditorEngine.viewer` setter | DOM element discovery for `renderer`, `screener`, `stage`. Breaks entire render pipeline if role attributes change in `EditorView` |
| `EditorView` DOM structure | Role attributes (`renderer`, `screener`, `stage`) are hard-coded lookups in `EditorEngine.viewer` setter — any rename breaks canvas binding |
| `EditorFile.preload()` | IDB video caching and blob URL lifecycle. Regression: tracks fail to load, or blob URLs leak (missing `cleanup()` call) |
| `EditorReducer` / `EditorStateAction` | All state transitions. Side effects in `DISPLAY_SCREENER` / `DISPLAY_CANVAS` toggle DOM visibility directly on `engine.renderer` and `engine.screener` |
| `VideoController.canvasSync()` | Frame sync loop. Regression: video frames stop updating on canvas during playback |
| `VideoController.preload()` | Screenshot generation; controls whether track thumbnails appear in the timeline |

### Medium-Risk Changes

| Area | What Breaks |
|------|-------------|
| `Controllers` registry keys | Keys (`video`, `audio`, `image`, `compositor`) must match `IMediaFile.mediaType`. Adding a new type requires a new controller entry |
| `IEditorAction` / `IEditorTrack` / `IEditorFile` interfaces | Any field addition/removal propagates to timeline rendering, detail forms, and reducer action handling |
| `EditorProvider` generic parameters | Mis-aligned type params between `EditorProvider` ↔ `TimelineProvider` break TypeScript compilation |
| `CompositorController` + WASM | Optional code path; changes must preserve graceful fallback when `_useWasm=false` |
| `DetailView` | Spawns its own nested `EditorProvider` — must stay in sync with outer state after `CLOSE_DETAIL` dispatch |

### Validation Checklist (after changes)

1. `EditorFile.preload()` — verify tracks load without hanging in LOADING state
2. Canvas rendering — play a multi-track project, confirm all layers composite correctly
3. Recording — start/stop record, confirm MP4 blob is created and saved to IDB via `LocalDb.saveVideo()`
4. Audio mixing — audio tracks play in sync and are included in recording
5. Detail modal — open for project, track, and action; save changes; confirm state updates
6. WASM path — if changed, test with `useWasmRenderer` flag enabled and disabled (fallback)
7. Run TypeScript checks: `pnpm typescript` in `packages/sui-editor`
8. Run tests: `src/internals/useEditor/useEditor.test.tsx`, `src/EditorFile/EditorFile.test.tsx`, `src/internals/plugins/useEditorMetadata/useEditorMetadata.test.tsx`, `src/internals/plugins/useEditorKeyboard/useEditorKeyboard.test.tsx`
