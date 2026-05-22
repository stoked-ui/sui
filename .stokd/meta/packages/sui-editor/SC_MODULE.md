# Module: @stoked-ui/editor

> **Generated:** 2026-05-21 (upgraded 0.3.0 → 0.4.0) | **Meta version:** 0.4.0
> **Package location:** `packages/sui-editor`
> **NPM name:** `@stoked-ui/editor` (v0.1.2)
> **Source entry:** `packages/sui-editor/src/index.ts`
> **Build artifacts:** `packages/sui-editor/build/` (modern + node + stable + types)
> **Companion axiom file:** `packages/sui-editor/.axioms.md` (directory-scoped invariants — read before mutating this module)

---

## 1. Responsibility

`@stoked-ui/editor` is the **non-linear video composition editor** for the Stoked UI suite. Its design intent:

1. **Compose the editor surface** by combining four sibling packages — `@stoked-ui/timeline` (engine, scrubber, track UI), `@stoked-ui/file-explorer` (asset tabs), `@stoked-ui/media` (file abstractions, players, screenshots), and `@stoked-ui/common` (LocalDb, settings, mime, ids).
2. **Extend the timeline `Engine`** into an `EditorEngine` that drives a 2-canvas viewer pipeline (renderer + detail), records to `MediaRecorder`, and optionally swaps in a Rust/WASM compositor via `@stoked-ui/video-renderer-wasm`.
3. **Provide controllers** that bind timeline actions to media element types (video, audio, image, web, animation, compositor) so the engine can preload, draw, mute, seek, and screenshot heterogeneous tracks frame-by-frame.
4. **Persist projects to IndexedDB** via `LocalDb` (store name `editor`) with versioning and screenshots, plus export to `.sue` / `.suvid` / `.sua` MIME types registered through `StokedUiEditorApp`.
5. **Render the inspector / detail-view modal** for project, track, action, and settings editing using `react-hook-form` + `yup`, including controlled inputs for color, coordinates, CSS, blend mode, and volume span.
6. **Expose plugins** (`useEditorMetadata`, `useEditorKeyboard`) that layer SEO/metadata and full keyboard navigation onto the timeline runtime, and an imperative `useEditorApiRef` hook for parent apps.

It is *not* a media player (that lives in `@stoked-ui/media`), *not* a timeline engine (that lives in `@stoked-ui/timeline`), and *not* an asset browser (that lives in `@stoked-ui/file-explorer`). It is the integration layer that orchestrates them.

---

## 2. Public Interfaces / Entry Points

The single public entry is `src/index.ts`. Re-exports surface the editor by category:

```ts
// packages/sui-editor/src/index.ts
export default Editor;
export { Editor, EditorFile, Controllers, EditorEngine, EditorView, EditorProvider };
export * from './EditorFile';
export * from './EditorProvider';
export * from './EditorView';
export * from './Editor';
export * from './EditorControls';
export * from './models';
export * from './hooks';
export * from './Controllers';
export * from './EditorAction';
export * from './EditorTrack';

export function createEditorFile(props: IEditorFileProps): EditorFile;
export const EditorVideoExampleProps: IEditorFileProps;
export { EditorExample };
```

### Public surface by category

| Surface | Exports | Source |
|---|---|---|
| Top-level component | `Editor` (default), `EditorProps`, `EditorSlots`, `EditorSlotProps`, `EditorApiRef`, `getEditorUtilityClass`, `editorClasses` | `src/Editor/Editor.tsx`, `Editor.types.ts`, `editorClasses.ts` |
| Provider / context | `EditorProvider`, `useEditorContext`, `EditorState`, `EditorReducer`, `EditorStateAction`, `getActionSelectionData`, `refreshActionState`, `refreshTrackState` | `src/EditorProvider/EditorProvider.tsx`, `EditorContext.tsx`, `EditorState.ts`, `EditorProvider.types.ts` |
| Engine | `EditorEngine` (default), `IEditorEngine`, `EditorEngineState`, `EngineStateEx`, `EditorEngineOptions`, `WasmRendererConfig`, `DrawData`, `ViewMode`, `EditorEvents`, `EditorEventTypes` | `src/EditorEngine/EditorEngine.ts`, `EditorEngine.types.ts`, `events.ts` |
| Stage / viewer | `EditorView`, `EditorViewProps`, `EditorViewActions`, `getEditorViewUtilityClass` | `src/EditorView/EditorView.tsx`, `EditorView.types.ts`, `EditorViewActions.tsx` |
| Transport controls | `EditorControls`, `EditorControlsProps`, `Volume`, `editorControlsClasses` | `src/EditorControls/EditorControls.tsx`, `Volume.tsx` |
| File model | `EditorFile` (class + default export), `IEditorFile`, `IEditorFileProps`, `IEditorFileData`, `IEditorTrackData`, `SUVideoFile`, `editorFileCache`, `createEditorFile`, `EditorVideoExampleProps`, `EditorExample` | `src/EditorFile/EditorFile.ts`, `EditorFile.example.tsx` |
| Tracks | `IEditorTrack`, `IEditorFileTrack`, `getTracksFromMediaFiles`, `EditorTrackActions` | `src/EditorTrack/EditorTrack.ts`, `EditorTrackActions.tsx` |
| Actions | `IEditorAction`, `IEditorFileAction`, `BlendMode`, `Fit` | `src/EditorAction/EditorAction.ts` |
| Controllers (timeline `IController` map) | `Controllers` (default), `AudioController`, `VideoController`, `ImageController`, `WebController`, `CompositorController`, `AnimationController`, `EditorControllerParams`, `EditorPreloadParams` | `src/Controllers/Controllers.ts` and siblings |
| Detail view | `DetailModal` / `DetailView` (root), sub-views (`DetailCombined`, `DetailAction`, `DetailTrack`, `DetailProject`, `DetailSettings`, `DetailBreadcrumbs`), controlled inputs (`ControlledText`, `ControlledColor`, `ControlledCss`, `ControlledCheckbox`, `ControlledCoordinates`, `ControlledSelect`, `ControlledVolumeSpan`, `BlendModeSelect`, `DesSelect`, `StokedSelect`), `getEditorDetail`, `detailViewClasses` | `src/DetailView/*` |
| File explorer integration | `EditorFileTabs` | `src/EditorFileTabs/EditorFileTabs.tsx` |
| Screener (fullscreen `<video>` overlay) | `EditorScreener`, `EditorScreenerProps` | `src/EditorScreener/EditorScreener.tsx` |
| Hooks | `useEditorApiRef` | `src/hooks/useEditorApiRef.tsx` |
| WASM preview integration | `WasmPreviewDemo`, `useWasmRenderer`, `actionMapper`, `WasmTransform`, `LayerType`, `BlendMode`, `CompositorLayer`, `LayerTransform`, `RenderMetrics` | `src/WasmPreview/*` |
| Editor app singleton | `StokedUiEditorApp` (registers `.sue` / `.suvid` / `.sua` mime types) | `src/Editor/StokedUiEditorApp.ts` |
| Plugins (internal but composed by `Editor`) | `useEditorMetadata`, `useEditorKeyboard`, `VIDEO_EDITOR_PLUGINS`, `EditorPluginSignatures` | `src/Editor/Editor.plugins.ts`, `src/internals/plugins/*` |
| Misc models | `models/items.ts` re-exports | `src/models/index.ts` |
| Theme augmentation | MUI `MuiEditor` / `MuiEditorView` / `MuiEditorControls` / `MuiDetailView` slot/class augmentation | `src/themeAugmentation/*` |

The package is **library-only**: no NestJS controllers, no CLI commands, no Next.js routes. Runtime entry is the `<Editor />` React component (root), the `<EditorProvider />` context, and the `EditorEngine` class for headless or detached use.

---

## 3. Products

This module is consumed by the single product documented in this repo:

- **SC_PRODUCT_STOKED_UI_SUI.md** — `@stoked-ui/sui`. The editor is one of the marquee components in the suite. It powers the `/products/editor/` showcase, the `editor` MDX docs section under `docs/data/editor/`, and the homepage `HeroEditor` demo.

Non-publishable consumers inside this repo:

- `docs/src/components/showcase/HeroEditor.tsx`, `EditorBackendProcessingDemo.tsx`, `EditorHero.tsx`, `EditorFileTest*.tsx`, `ExampleShowcaseFiles.tsx`
- `docs/src/components/home/EditorShowcase.tsx`, `EditorSandbox.tsx`
- `docs/data/editor/components/editor/BasicEditor.js`, `EditorWithContent.js`, `MinimalEditor.js`, `EditorUsage.js`
- `docs/data/editor/docs/overview/CoreDemo.tsx`, `getting-started.md`, `backend-processing.md`

There is no other product doc; the module participates in only this one.

---

## 4. Views

From `SC_VIEWS.md` §9 ("Editor Package Views — `@stoked-ui/editor`"), this module **directly renders or owns** the following views:

| View | File | Notes |
|---|---|---|
| §9.1 Editor (Root) | `src/Editor/Editor.tsx` | Grid layout — `viewer` / `controls` / `timeline` (+ optional `explorer-tabs`, overlay `detail`). Composes `EditorView`, `EditorControls`, `Timeline`, `EditorFileTabs`, `DetailView`. States: loading, ready, fullscreen, detail-mode, file-view, minimal, record, no-labels, no-track-controls, no-snap-controls. |
| §9.2 EditorView (Stage) | `src/EditorView/EditorView.tsx` | Holds the `renderer` `<canvas>`, the `screener` `<video>`, a shadow-DOM `stage` div, and a hover-revealed `viewControls` overlay. States: idle, hover, playing, paused, previewing, error. |
| §9.3 EditorControls | `src/EditorControls/EditorControls.tsx` | Play/pause/stop, rate dropdown, time display/input, `Volume`, view mode toggle, version selector. States: playing, paused, recording, disabled, loading. |
| §9.4 DetailView (Inspector Modal) | `src/DetailView/DetailView.tsx` | Sub-views: `DetailCombined`, `DetailAction`, `DetailTrack`, `DetailProject`, `DetailSettings`, `DetailBreadcrumbs`. Powered by `react-hook-form` + `yup`. States: open/closed, selected-type, editing, dirty, saving, validation-error. |
| §9.5 EditorFileTabs (Asset Browser) | `src/EditorFileTabs/EditorFileTabs.tsx` | Tab strip + embedded `FileExplorer` + `FileDropzone`. States: active-tab, loading, empty, drag-over, expanded, collapsed. |
| §9.6 EditorScreener (Version Selector) | `src/EditorScreener/EditorScreener.tsx` | Version dropdown over recorded outputs. States: loading, versioned, unversioned. |

This module also **materially shapes** every showcase / docs view that embeds the editor (`HeroEditor`, `EditorShowcase`, `CoreDemo`, etc. — see §3 Products) by supplying the runtime they render.

---

## 5. Integration Points

### Upstream (this module depends on)

| Dependency | Where used | Contract |
|---|---|---|
| `@stoked-ui/timeline` | Re-exports `Timeline`, `Engine`, `TimelineProvider`, `TimelineFile`, `TimelineState`, `IController`, `EngineState`, `PlaybackMode`. `EditorEngine extends Engine`; `EditorProvider` wraps `TimelineProvider`; `EditorFile extends TimelineFile`; `EditorState extends TimelineState`; `Controllers` map satisfies the `IController` contract. | Hard peer dep; editor breaks if timeline `Engine` API changes. |
| `@stoked-ui/file-explorer` | Embedded inside `EditorFileTabs` for asset browsing and drag-drop ingest. `FileExplorerProps` / `FileExplorerTabsProps` flow through `EditorProps`. | Hard peer dep. |
| `@stoked-ui/media` | `IMediaFile` / `MediaFile`, `Stage`, `ScreenshotStore`, `Screenshot`, `App`, `AppFile`, `AppFileFactory`, `AppOutputFile`, `AppOutputFileFactory`. Controllers consume `file.media.element` (HTMLVideoElement, etc.) and screenshot stores. `StokedUiEditorApp extends App`. | Hard peer dep. |
| `@stoked-ui/common` | `LocalDb`, `openDB`, `getOrFetchVideo`, `namedId`, `createSettings`, `IMimeType`, `SUIMime`, `Constructor`. Engine ID generation, IndexedDB persistence, settings/flags, mime registration. | Hard peer dep. |
| `@stoked-ui/video-renderer-wasm` (optional) | `EditorEngine` lazy-imports the WASM compositor (`PreviewRenderer`) when `_useWasm` is flipped on; `WasmPreview/useWasmRenderer.ts` wraps the renderer; `actionMapper.ts` translates `IEditorAction` into compositor layers. | Optional dep; resolved from `packages/sui-video-renderer/pkg`. Editor falls back to canvas drawing if absent. |
| `@mui/material`, `@mui/base`, `@mui/system`, `@mui/utils`, `@mui/icons-material` | Styled root, `Box`, `Fade`, slot props, theme augmentation, icons in detail-view forms and controls. | Peer deps. |
| `react-hook-form` + `@hookform/resolvers` + `@hookform/error-message` + `yup` | Detail-view inspector forms (project, track, action, settings) with schema validation. | Bundled deps. |
| `react-router-dom` | Used inside detail / preview navigation flows. | Bundled dep. |
| `react-json-view` | Settings/debug detail panels for raw object inspection. | Bundled dep. |
| `plyr-react` | Audio/video preview surface inside `Editor/AudioPlayer.tsx`. | Bundled dep. |
| `@tempfix/idb` (via `db/init.ts`) | Opens the `editor` IndexedDB database (store name supplied by caller). | Browser-only. |

### Downstream (consumers of this module)

| Consumer | What they import | Why |
|---|---|---|
| `docs/` Next.js site (showcase pages, MDX demos) | `Editor`, `EditorProvider`, `createEditorFile`, `EditorVideoExampleProps`, `EditorExample` | Live-embedded editor demos and homepage hero. |
| Apps building on `@stoked-ui/sui` | Same as docs, plus `EditorEngine` for headless rendering, `Controllers` for custom action types, `useEditorApiRef` for imperative control. | Library consumers. |

### External services / resources

- **IndexedDB:** database `editor`, opened by `db/init.ts`; project files persisted via `LocalDb` from `@stoked-ui/common` (see `EditorFile.updateStore()`).
- **MediaRecorder API:** `EditorEngine._recorder` records the renderer canvas + audio destination for export; chunks accumulate in `_recordedChunks`.
- **Web Audio API:** `EditorEngine` wires audio controllers through a shared `AudioContext` destination so multiple audio tracks mix into the recording (see project memory note).
- **Canvas 2D API:** `_renderCtx` and `_renderDetailCtx` for primary + detail canvases.
- **WebAssembly:** `@stoked-ui/video-renderer-wasm` runtime (Rust-compiled compositor) loaded dynamically by `EditorEngine`.
- **File System Access API:** types in `@types/wicg-file-system-access` for save/open of `.sue` projects.

---

## 6. Key Source Files

### Engine + provider (the runtime spine)

- **`src/EditorEngine/EditorEngine.ts`** — Core class extending timeline `Engine<State, EmitterEvents>`. Owns `_viewer`, `_renderer` (canvas), `_renderCtx`, `_rendererDetail`, `_screener` (`<video>`), `_stage`, `_recorder`, `_actionMap`, `_actionTrackMap`, `_useWasm`, `_compositorController`, `_wasmRendererConfig`. Handles preload, frame loop, draw dispatch to controllers, recording lifecycle, WASM enable/disable.
- **`src/EditorEngine/EditorEngine.types.ts`** — `IEditorEngine`, `EditorEngineOptions`, `EditorEngineState` (string union of `EngineState | EngineStateEx`), `EngineStateEx` (extra states like preview/recording), `WasmRendererConfig`, `DrawData`, `ViewMode = 'Renderer' | 'Screener' | 'Edit'`.
- **`src/EditorEngine/events.ts`** — `EditorEvents` emitter and `EditorEventTypes` extending timeline event types.
- **`src/EditorProvider/EditorProvider.tsx`** — Wraps `TimelineProvider`. Constructs the default `EditorEngine` if none passed, wires `Controllers` (and assigns to `TimelineFile.Controllers`), supplies `refreshActionState`, `refreshTrackState`, `getEditorDetail` as `initialSettings`, hooks `LocalDb` via `getDbProps(state.app.defaultInputFileType, props.localDb)`.
- **`src/EditorProvider/EditorState.ts`** — `EditorState extends TimelineState`. `getActionSelectionData` (locates an action in tracks and updates `settings.selectedTrackIndex`/`selectedActionIndex`), `refreshActionState` (folds `track.hidden` into `action.dim`), `refreshTrackState`.
- **`src/EditorProvider/EditorContext.tsx`** — `useEditorContext` consumer hook.

### Top-level component

- **`src/Editor/Editor.tsx`** — Root component. Reads context via `useEditorContext`, runs `useEditor` with `VIDEO_EDITOR_PLUGINS`, renders the grid (`viewer` / `controls` / `timeline` + optional `explorer-tabs` and overlay `DetailModal`). Handles `fullscreen`, `detailMode`, `fileView`, `trackCount`-driven height, `allControls` / `noSaveControls` / `noTrackControls` / `noSnapControls` toggles.
- **`src/Editor/Editor.types.ts`** — `EditorProps`, `EditorPropsBase`, `EditorSlots`, `EditorSlotProps`, `EditorApiRef`. Slots: `root`, `editorView`, `controls`, `timeline`, `fileExplorerTabs`, `fileExplorer`.
- **`src/Editor/Editor.plugins.ts`** — `VIDEO_EDITOR_PLUGINS = [useEditorMetadata, useEditorKeyboard]`; converts to `EditorPluginSignatures` for type inference.
- **`src/Editor/StokedUiEditorApp.ts`** — `App` singleton registering `.sue` (project), `.suvid` (video), `.sua` (audio) mime types via `SUIMime.make` plus input/output `AppFileFactory`s.
- **`src/Editor/AudioPlayer.tsx`**, **`Loader.tsx`**, **`Zoom.tsx`**, **`SizeSlider.tsx`**, **`ContextMenu.tsx`**, **`ExampleForm.tsx`** — Supporting chrome for the root component.

### Stage and transport

- **`src/EditorView/EditorView.tsx`** — Stage that mounts the renderer canvas, screener video, and a Shadow-DOM stage div. Wires forks into engine (`_renderer`, `_screener`, `_stage`) via refs.
- **`src/EditorControls/EditorControls.tsx`** + **`Volume.tsx`** — Transport bar (play/pause/stop, rate, time, volume, view-mode toggle, version selector).

### Asset / file integration

- **`src/EditorFileTabs/EditorFileTabs.tsx`** — Tab strip + embedded `FileExplorer` + drop zone for ingesting media into the project.
- **`src/EditorScreener/EditorScreener.tsx`** — Version selector for recorded outputs replayed against the `<video>` screener element.

### Domain model

- **`src/EditorFile/EditorFile.ts`** — `EditorFile extends TimelineFile`. Adds `width`, `height`, `backgroundColor`, `image`, `video`, `blendMode`, `fit`, `updateStore()`. `IEditorFile`, `IEditorFileData`, `IEditorTrackData`, `SUVideoFile extends AppOutputFile`, `editorFileCache` map.
- **`src/EditorFile/EditorFile.example.tsx`** — `EditorExample` ready-to-render demo project (also exported from package root as `EditorExample`).
- **`src/EditorTrack/EditorTrack.ts`** — `IEditorTrack`, `IEditorFileTrack`, `getTracksFromMediaFiles` (turns `IMediaFile[]` into editor tracks).
- **`src/EditorTrack/EditorTrackActions.tsx`** — Track-row action buttons (lock/mute/solo/hide/delete).
- **`src/EditorAction/EditorAction.ts`** — `IEditorAction`, `IEditorFileAction`, `BlendMode` enum, `Fit` enum.

### Controllers (timeline `IController` impls)

- **`src/Controllers/Controllers.ts`** — Map `{ audio, video, image, compositor }` (animation commented out). Supplied to `EditorEngine` and to `TimelineFile.Controllers` static.
- **`src/Controllers/VideoController.ts`** — `Controller<HTMLVideoElement>`. Caches per-track `HTMLVideoElement`, screenshot map, frame-sync cache; drives `getDrawData` for canvas blits.
- **`src/Controllers/AudioController.ts`** — Routes audio through shared `AudioContext` so multiple tracks mix into the recorder (see project memory).
- **`src/Controllers/ImageController.ts`** — Canvas drawing for static image tracks.
- **`src/Controllers/WebController.ts`** — Renders web/HTML tracks into the shadow-DOM stage.
- **`src/Controllers/CompositorController.ts`** — Bridges to the WASM compositor when WASM mode is active.
- **`src/Controllers/AnimationController.ts`** — (currently disabled in `Controllers.ts`).
- **`src/Controllers/EditorControllerParams.ts`** — `EditorControllerParams`, `EditorPreloadParams` shared by all controllers.

### Detail view (inspector)

- **`src/DetailView/DetailView.tsx`** — Modal wrapper, drives `react-hook-form` resolver and renders the active sub-detail.
- **`src/DetailView/Detail.types.ts`** — `getEditorDetail` selector wired into provider `initialSettings`.
- **`src/DetailView/DetailCombined.tsx` / `DetailAction.tsx` / `DetailTrack.tsx` / `DetailProject.tsx` / `DetailSettings.tsx` / `DetailBreadcrumbs.tsx`** — One per inspector tab.
- **`src/DetailView/Controlled*.tsx`** — Controlled form inputs (`Text`, `Color`, `Coordinates`, `Css`, `Checkbox`, `Select`, `VolumeSpan`).
- **`src/DetailView/BlendModeSelect.tsx`**, **`DesSelect.tsx`**, **`StokedSelect.tsx`** — Domain-specific selects.
- **`src/DetailView/useOptions.tsx`** — Options memo hook for selects.

### Persistence

- **`src/db/init.ts`** — Opens IndexedDB database `editor` v1 with the supplied `storeName` via `@tempfix/idb`.
- **`src/db/get.ts`** — Read helpers.

### WASM preview

- **`src/WasmPreview/useWasmRenderer.ts`** — React hook wrapping `PreviewRenderer` (Rust/WASM). Tracks extended `RenderMetrics` (`droppedFrames`, `totalFramesRendered`, `averageFrameTime`, `wasmAvailable`). Camel/snake-case mapping for WASM bindings.
- **`src/WasmPreview/actionMapper.ts`** — Maps `IEditorAction` → `CompositorLayer` (snake_case for Rust).
- **`src/WasmPreview/types.ts`** — `RenderMetrics`, `LayerType`, `BlendMode`, `CompositorLayer`, `LayerTransform`.
- **`src/WasmPreview/wasm-module.d.ts`** — Type defs for the dynamically-imported WASM module.
- **`src/WasmPreview/WasmPreviewDemo.tsx`** — Standalone demo of the WASM renderer.

### Plugins / internals

- **`src/internals/useEditor/useEditor.ts`** — Plugin-aware hook the root `Editor` component calls; merges plugin signatures, instantiates engine + state, returns instance + slots.
- **`src/internals/useEditor/extractPluginParamsFromProps.ts`** — Splits `EditorProps` into per-plugin parameter buckets.
- **`src/internals/plugins/useEditorMetadata/useEditorMetadata.ts`** — Selection-model + metadata plugin (file/project metadata, expansion, selection).
- **`src/internals/plugins/useEditorKeyboard/useEditorKeyboard.ts`** — Keyboard navigation plugin (~30+ shortcuts in tests).
- **`src/internals/corePlugins/useEditorInstanceEvents/`** — Instance event bus plugin.

### Models / theme

- **`src/models/items.ts`** — Shared item model types.
- **`src/themeAugmentation/`** — MUI theme augmentation for `MuiEditor*` and `MuiDetailView` slot/class names.

### Hooks

- **`src/hooks/useEditorApiRef.tsx`** — Strongly-typed `React.MutableRefObject<EditorPublicAPI<TSignatures>>`.

---

## 7. Change Impact

### When you touch the engine (`EditorEngine.ts` / `EditorEngine.types.ts` / `events.ts`)

- **Re-validate timeline integration** — `EditorEngine extends Engine`; any new state in `EngineStateEx` or new emitter event must round-trip through `TimelineProvider`.
- **Re-validate every controller** (`Audio`, `Video`, `Image`, `Web`, `Compositor`, `Animation`) — they consume `_renderCtx`, `_actionMap`, and `DrawData`. Adding/removing a `_render*` field breaks all controllers.
- **Re-validate WASM mode** — `_useWasm`, `_compositorController`, and `_wasmRendererConfig` are toggle-driven. Confirm both code paths (canvas fallback and WASM) still render via the docs `HeroEditor` / `WasmPreviewDemo`.
- **Re-validate recording** — `MediaRecorder` setup, `_recordedChunks`, audio context plumbing. Mute/unmute and multi-track audio mix should still survive (see Editor Issues memory).
- Run docs locally on **port 5199** (`pnpm docs:dev`) and exercise the `/products/editor/` showcase.

### When you touch the provider / state (`EditorProvider.tsx` / `EditorState.ts`)

- Re-confirm `TimelineFile.Controllers = Controllers` runs before any file deserialization.
- Re-confirm `getDbProps(state.app.defaultInputFileType, props.localDb)` still resolves the right IDB store (`StokedUiEditorApp` provides `.sue`).
- `refreshActionState` / `refreshTrackState` / `getActionSelectionData` flow into reducer — any rename breaks the detail view selection sync.
- Selection sync — `selectedTrackIndex` / `selectedActionIndex` mutations must remain inside the reducer to avoid drift.

### When you touch a controller (`Controllers/*.ts`)

- Update `Controllers.ts` map if you add/remove one.
- Re-export through `src/Controllers/index.ts` if it's part of the public API.
- Verify the matching action `type` field in `IEditorAction` still resolves to a controller (lookup is by string key).
- For `VideoController`: validate frame-sync cache (`cacheFrameSync`) under seek + scrub. For `AudioController`: validate the shared `AudioContext` destination still mixes correctly into recordings.

### When you touch `EditorFile` / `EditorTrack` / `EditorAction`

- Project files in IndexedDB persist with the on-disk shape. **Bumping the file format requires a versioned IDB upgrade path** (current `editor` DB is at version 1; see `db/init.ts`).
- `editorFileCache` is a process-local cache — invalidate it when changing serialization.
- Per the project memory: `file.media` uses `createSettings` Proxy; properties set via `Object.assign` may not propagate through React state. Detail views currently fall back to direct DOM video element reads for `duration`/`width`/`height`.

### When you touch the detail view

- `react-hook-form` + `yup` schemas drive validation per sub-detail. Adding a new field requires updating both the schema and the corresponding `Controlled*` input.
- `getEditorDetail` is wired into provider `initialSettings` — renaming it breaks the detail mount.

### When you touch the WASM integration

- `EditorEngine` `import()`s the WASM module dynamically. Auto-detection of bundler-target vs web-target is in `EditorEngine.ts`.
- The WASM artifact lives at `packages/sui-video-renderer/wasm-preview/pkg/` (built with `wasm-pack build --target bundler --out-dir pkg`). `next.config.mjs` sets `experiments.asyncWebAssembly = true` and aliases `@stoked-ui/video-renderer-wasm` to that path; **a Next.js config change requires a dev-server restart** (per project memory).
- `WasmPreview/types.ts` mirrors the Rust struct; if the Rust enum (`LayerType`, `BlendMode`) changes, both `types.ts` and `actionMapper.ts` must be updated, and the WASM artifact rebuilt.

### When you touch the public surface (`src/index.ts`)

- Bump the package patch version in `package.json` (`@stoked-ui/editor`).
- Verify docs MDX (`docs/data/editor/components/editor/*.js`, `docs/data/editor/docs/overview/CoreDemo.tsx`) still imports cleanly — these are the user-facing examples.
- Run `pnpm typescript` from the package to catch downstream type breaks (peer deps include workspace `^` versions).
- Re-run `pnpm build` (modern + node + stable + types + copy-files) before publishing.

### Tests (caveat)

Per `.stokd/meta/packages/sui-editor/SC_TEST.md`: there are currently **zero passing editor-specific runtime tests**. The three plugin test files require a `describeEditor` test utility at `test/utils/editor-view/describeEditor.tsx` that does not yet exist. Until that's built, expect to validate behavior manually through the docs `HeroEditor` showcase and the `EditorExample` demo at `src/EditorFile/EditorFile.example.tsx`.

### CI / build

- The package is built via `node ../../scripts/build.mjs {modern,node,stable}` plus `buildTypes.mjs` and `copyFiles.mjs`. `prebuild` clears `build/` and `tsconfig.build.tsbuildinfo`. Watching uses Babel with `--extensions '.js,.ts,.tsx'` against `./src`.
- `sst-env.d.ts` is present (SST infrastructure types) — leave it untouched unless restructuring deployment.
