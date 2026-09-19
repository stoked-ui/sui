# Module: @stoked-ui/timeline

> **Generated:** 2026-05-05 (fresh, content) | **Updated:** 2026-07-02 (TIMED REFRESH — re-verified against source: package still v0.1.3; `'No controllers set!'` guard at `Engine.ts:79`; `scaleWidth *` grep still returns only the approved `TimelineProviderFunctions.ts:122` match; `themeAugmentation.spec.ts` remains the only spec; `RemoveActionCommand.trackIndex` bug still present; all four docs showcase consumers still exist. Only source changes since 2026-06-22: `package.json` `repository.url` now points at `stoked-ui/sui` with a `directory` field for npm provenance validation, and `.axioms.md` gained `### Enforcement` tiers) | **Meta version:** 0.6.0
> **Package location:** `packages/sui-timeline`
> **NPM name:** `@stoked-ui/timeline` (v0.1.3)
> **Source entry:** `packages/sui-timeline/src/index.ts`
> **Build artifacts:** `packages/sui-timeline/build/` (modern + node + stable + types)
> **Axioms:** `packages/sui-timeline/.axioms.md`

---

## 1. Responsibility

`@stoked-ui/timeline` is the **frame-oriented timeline UI and playback engine** that powers Stoked UI editors and standalone timeline integrations. Its design intent:

1. **Provide the timeline surface** — `<Timeline />` composes the labels rail, transport ruler, virtualized track grid, action blocks, playhead cursor, and scroll/resize affordances into a single React component.
2. **Own the playback loop** — the `Engine` class manages the `requestAnimationFrame` tick, current time, play rate, play/pause/rewind/fast-forward state, action enter/leave lifecycle, and event emission. It is intentionally headless (DOM-free aside from RAF and an optional `<video>` reference) so consumers can drive playback without rendering the UI.
3. **Define the controller contract** — `IController` (with the abstract `Controller<T>` base class) is the extension point that maps a track/action's `controller` reference to enter/update/leave/preload/start/stop callbacks per media kind. The bundled `AudioController` (Howler-backed) ships in-package; richer media controllers (video, image, web, compositor) are layered in by `@stoked-ui/editor`.
4. **Model the project** — `TimelineFile` (`extends AppFile` from `@stoked-ui/media`) holds tracks, actions, and metadata. Tracks/actions follow `ITimelineTrack` / `ITimelineAction` shapes with serializable `*FileTrack` / `*FileAction` counterparts. The Command pattern (`RemoveActionCommand`, `RemoveTrackCommand`) supplies undo/redo entries.
5. **Provide a state context** — `TimelineProvider` (reducer-backed) owns the file, selected project/track/action, settings (`scaleWidth`, `trackHeight`, etc.), flags (`detailMode`, `loop`, …), and the command/undo stacks. `useTimeline` exposes the typed dispatch + state pair to children.
6. **Handle drag, resize, and scrub interactions** — wraps `interactjs` via the internal `Interactable` component and `useDragLine`/`useAutoScroll` hooks; track rows render through `react-virtualized` for large project virtualization.
7. **Expose pixel/time math** — pure utilities in `utils/deal_data.ts` (`parserTimeToPixel`, `parserPixelToTime`, `parserTransformToTime`, `parserTimeToTransform`, `getScaleCountByRows`, `getScaleCountByPixel`, `parserActionsToPositions`) underpin every rendered position in the UI.
8. **Register a project mime type** — `StokedUiTimelineApp` (extends `App` from `@stoked-ui/media`) registers `.sut` (timeline project) and `.sua` (timeline audio) via `SUIMime`.

It is *not* a media renderer or compositor (those live in `@stoked-ui/editor`'s controllers and the `@stoked-ui/video-renderer-wasm` package). It is *not* a file/asset browser (that is `@stoked-ui/file-explorer`). It is *not* a media file abstraction (that is `@stoked-ui/media`). It is the timeline runtime: data model + engine + UI.

---

## 2. Public Interfaces / Entry Points

The single public entry is `src/index.ts`. Re-exports surface the timeline by category:

```ts
// packages/sui-timeline/src/index.ts
import Timeline from './Timeline';

export default Timeline;
export { default as TimelineFile } from './TimelineFile';
export { default as TimelineCursor } from './TimelineCursor';
export { default as TimelineLabels } from './TimelineLabels';
export { default as TimelinePlayer } from './TimelinePlayer';
export { default as TimelineScrollResizer } from './TimelineScrollResizer';
export { default as TimelineTime } from './TimelineTime';
export { default as TimelineTrack } from './TimelineTrack';
export { default as TimelineTrackArea } from './TimelineTrackArea';
export { default as Engine } from './Engine';
export { default as Controller } from './Controller';
export * from './Controller';
export * from './TimelineControls';
export * from './TimelineFile';
export * from './Timeline';
export * from './TimelineAction';
export * from './TimelineTime';
export * from './TimelineCursor';
export * from './TimelineLabels';
export * from './TimelinePlayer';
export * from './TimelineScrollResizer';
export * from './components';
export * from './TimelineTrack';
export * from './TimelineProvider';
export * from './TimelineTrackArea';
export * from './Engine';
export * from './interface/const';
export * from './utils';
```

> Note: the barrel above is the **only** public entry. `src/TimelineContext/TimelineContext.tsx` (a stray `ContextMenu` placeholder rendering lorem-ipsum) is **not** re-exported from `index.ts` — it is dead/example code, not part of the contract, and `src/TimelineContext/` has no `index.ts`. Mime registration (`.sut`/`.sua`) is performed as a side effect by `StokedUiTimelineApp` (exported via `./Timeline`), not by a separate entry point.

### Public surface by category

| Surface | Exports | Source |
|---|---|---|
| Top-level component | `Timeline` (default), `TimelineProps`, `TimelineComponent`, `TimelineControlProps`, `TimelineState` (component class with `setScrollLeft` etc.), `getTimelineUtilityClass`, `timelineClasses`, `KeyDownControls`, `AddTrackButton`, `StokedUiTimelineApp` | `src/Timeline/Timeline.tsx`, `Timeline.types.ts`, `TimelineControl.types.ts`, `TimelineControlProps.ts`, `TimelineState.ts`, `timelineClasses.ts`, `AddTrackButton.tsx`, `KeyDownControls.tsx`, `StokedUiTimelineApp.ts` |
| Provider / context | `TimelineProvider`, `TimelineContext`, `useTimeline`, `TimelineReducer`, `createTimelineState`, `TimelineState` (reducer state interface), `TimelineStateAction`, `TimelineProviderProps`, `getDbProps`, `Selection`, `setCursor`, `setHorizontalScroll`, `setScaleCount`, `fitScaleData`, `getHeightScaleData`, `getTrackHeight`, `getActionHeight`, `refreshActionState`, `refreshTrackState`, `createActionEvent`, `getDetail`, `DetailData`, `SelectionTypeName` | `src/TimelineProvider/TimelineProvider.tsx`, `TimelineProvider.types.ts`, `TimelineProviderFunctions.ts`, `TimelineDetail.ts` |
| Engine | `Engine` (default), `IEngine`, `EngineState`, `EngineOptions`, `PlaybackMode`, `Events`, `EventTypes`, `Emitter`, `SetAction`, `Dispatch` | `src/Engine/Engine.ts`, `Engine.types.ts`, `events.ts`, `emitter.ts` |
| Controller | `Controller` (abstract default), `AudioController`, `Controllers` (registry helper), `IController`, `ControllerParams`, `PreloadParams`, `GetItemParams`, `VolumeSection`, `VolumeSections` | `src/Controller/Controller.ts`, `AudioController.ts`, `Controllers.ts`, `Controller.types.ts`, `ControllerParams.ts` |
| File model | `TimelineFile` (default), `ITimelineFile`, `ITimelineFileProps`, `ITimelineFileData`, `FileState`, `RemoveActionCommand`, `RemoveTrackCommand` | `src/TimelineFile/TimelineFile.ts`, `TimelineFile.types.ts`, `Commands/*` |
| Track | `TimelineTrack`, `ControlledTrack`, `TimelineTrackDnd`, `useAutoScroll`, `ITimelineTrack`, `ITimelineFileTrack`, `ITimelineTrackData`, `timelineTrackClasses` | `src/TimelineTrack/*` |
| Action | `TimelineAction`, `ITimelineAction`, `ITimelineFileAction`, `BackgroundImageStyle`, `initTimelineAction`, `timelineActionClasses` | `src/TimelineAction/*` |
| Labels rail | `TimelineLabels`, `TimelineLabel`, `TimelineTrackActions`, `SnapControls`, `TimelineLabelsProps`, `timelineLabelsClasses` | `src/TimelineLabels/*` |
| Track area | `TimelineTrackArea`, `TimelineTrackAreaState`, `TimelineTrackAreaCollapsed`, `TimelineTrackAreaDragLines`, `ZoomControls`, `useDragLine`, `timelineTrackAreaClasses` | `src/TimelineTrackArea/*` |
| Cursor / ruler / resizer | `TimelineCursor`, `TimelineTime`, `TimelineScrollResizer` (each with `*Props` and `*Classes`) | `src/TimelineCursor/*`, `TimelineTime/*`, `TimelineScrollResizer/*` |
| Standalone player | `TimelinePlayer`, `TimelinePlayerProps`, `timelinePlayerClasses` | `src/TimelinePlayer/*` |
| Transport controls | `TimelineControls`, `TimelineControlsProps`, `timelineControlsClasses` | `src/TimelineControls/*` |
| Interaction primitive | `Interactable` (interactjs wrapper) | `src/Interactable/Interactable.tsx` |
| Components | `ToggleButtonGroupEx` (segmented control with overflow) | `src/components/ToggleButtonGroupEx/*` |
| Icons | `EdgeSnap`, `FeatureSnap`, `GridSnap`, `TimelineTrackIcon`, `TimelineView` | `src/icons/*` |
| Utilities | `parserTimeToPixel`, `parserPixelToTime`, `parserTimeToTransform`, `parserTransformToTime`, `getScaleCountByRows`, `getScaleCountByPixel`, `parserActionsToPositions`, `prefix`, `ConsoleLogger` | `src/utils/deal_data.ts`, `deal_class_prefix.ts`, `logger.ts` |
| Constants | `PREFIX`, `START_CURSOR_TIME`, `DEFAULT_SCALE`, `DEFAULT_SCALE_SPLIT_COUNT`, `DEFAULT_SCALE_COUNT`, `DEFAULT_SCALE_WIDTH`, `DEFAULT_START_LEFT`, `DEFAULT_MOVE_GRID`, `DEFAULT_ADSORPTION_DISTANCE`, `DEFAULT_TRACK_HEIGHT`, `DEFAULT_MOBILE_TRACK_HEIGHT`, `NEW_ACTION_DURATION`, `MIN_SCALE_COUNT`, `ADD_SCALE_COUNT`, `ERROR` | `src/interface/const.ts` |
| Theme augmentation | MUI `MuiTimeline*`, `MuiTimelineLabels`, `MuiTimelineTrack`, `MuiTimelineCursor`, `MuiTimelineTime`, `MuiTimelineControls`, `MuiTimelinePlayer`, `MuiTimelineScrollResizer` slot/class augmentation | `src/themeAugmentation/*` |

The package is **library-only**: no NestJS controllers, no CLI commands, no Next.js routes. Runtime entry is the `<Timeline />` React component (root), the `<TimelineProvider />` context, the `Engine` class for headless playback, and `TimelineFile` for project I/O.

---

## 3. Products

This module is consumed by the single product documented in this repo:

- **SC_PRODUCT_STOKED_UI_SUI.md** — `@stoked-ui/sui`. The timeline is one of the marquee components in the suite and a hard peer dependency of `@stoked-ui/editor`. It powers the `/products/timeline/` showcase (`docs/pages/products/timeline/`), the `timeline` MDX docs section authored under `docs/data/timeline/` and routed via `docs/pages/products/timeline/docs/`, and the homepage timeline hero.

Non-publishable consumers inside this repo (verified 2026-06-06):

- `docs/src/components/showcase/TimelineHero.tsx` — `import Timeline, { TimelineProvider } from '@stoked-ui/timeline'`; the actual `<Timeline />` mount used by the homepage hero.
- `docs/src/components/home/HeroTimeline.tsx` — homepage hero wrapper that `dynamic`-imports `../showcase/TimelineHero` (does not import `@stoked-ui/timeline` directly).
- `docs/src/components/home/TimelineShowcase.tsx` — embedded showcase demo importing from `@stoked-ui/timeline`.
- `docs/src/components/showcase/ThemeTimeline.tsx` — embedded theme demo importing `TimelineProvider`.
- `docs/data/timeline/**` (MDX + `FirstComponent` examples) routed through `docs/pages/products/timeline/docs/**` — documentation tree. There is no `docs/pages/timeline/` directory; the timeline docs live under `docs/pages/products/timeline/`.
- `@stoked-ui/editor` — extends `Engine`, `TimelineFile`, `TimelineProvider`, `TimelineState`, `IController`, `EngineState`, `PlaybackMode`, `ITimelineAction`, `ITimelineTrack`. Re-exports `Timeline` as the editor's timeline pane.

There is no other product doc; the module participates in only this one.

---

## 4. Views

From `SC_VIEWS.md` §10 ("Timeline Package Views — `@stoked-ui/timeline`"), this module **directly renders or owns** the following views:

| View | File | Notes |
|---|---|---|
| §10.1 Timeline (Root) | `src/Timeline/Timeline.tsx` | Composes `TimelineLabels` (track rail) · `TimelineControls` (transport) · `TimelineTrackArea` (scrollable virtualized grid) · `TimelineCursor` (playhead overlay) · `TimelineTime` (ruler) · empty-state notice. States: loaded, empty, playing, paused, drag-active, edit-mode, multi-selected. |
| §10.2 TimelinePlayer | `src/TimelinePlayer/TimelinePlayer.tsx` | Standalone transport: play/pause/stop · skip prev/next · 0.2×–2.0× rate · MM:SS time · track navigator. States: playing, paused, seeking, loading. |
| §10.3 TimelineLabels (Track Rail) | `src/TimelineLabels/TimelineLabels.tsx`, `TimelineLabel.tsx`, `TimelineTrackActions.tsx`, `SnapControls.tsx` | Track row labels + per-track lock/mute/solo/delete/rename buttons + snap mode controls + `AddTrackButton`. States: selected, locked, muted, solo, hovered, drag-source. |
| §10.4 TimelineTrackArea | `src/TimelineTrackArea/TimelineTrackArea.tsx`, `TimelineTrackAreaCollapsed.tsx`, `TimelineTrackAreaDragLines.tsx`, `ZoomControls.tsx` | Virtualized scrollable grid of track rows, drag guide overlay, collapsed (single-row) variant, zoom controls. States: expanded, collapsed, drag-active, drop-zone. |
| §10.5 TimelineTrack & TimelineAction | `src/TimelineTrack/TimelineTrack.tsx`, `TimelineAction/TimelineAction.tsx` | Per-row action blocks with start/duration/preview, drag/resize via `interactjs`. Track states: selected, locked, muted, dragging, resizing, empty. Action states: selected, playing, hovered, dragging, resizing, error. |
| §10.6 TimelineCursor / TimelineTime / TimelineScrollResizer | `src/TimelineCursor/`, `TimelineTime/`, `TimelineScrollResizer/` | Vertical playhead, tick header ruler, horizontal+vertical scroll/resize handles. States: playing/paused/seekable, zoomed scale, dragging/idle. |

This module also **materially shapes** every view that embeds the editor or a timeline showcase: `§9.1 Editor (Root)` uses `Timeline` as its `timeline` slot; `§8 Embedded Showcase / Hero Components` includes `TimelineHero` (homepage hero mount, loaded via `HeroTimeline`), `TimelineShowcase`, and `ThemeTimeline`, all of which mount `<Timeline />` inside a `<TimelineProvider />`.

---

## 5. Integration Points

### Upstream (this module depends on)

| Dependency | Where used | Contract |
|---|---|---|
| `@stoked-ui/common` | `LocalDb`, `LocalDbProps`, `Settings`, `createSettings`, `MimeRegistry`, `SUIMime`, `IMimeType`, `FileSaveRequest`, `FlagData`, `SortedList`, `ProviderState`, `createProviderState`, `namedId`, `compositeColors`, `Constructor`. Used for IDB persistence, settings/flags state, mime type registration (`.sut`/`.sua`), color blending in `TimelineFile.getTrackColor`, ID generation, and the reducer-state base type. | Hard peer dep. |
| `@stoked-ui/media` | `App`, `IApp`, `AppFile` (parent of `TimelineFile`), `AppFileFactory`, `AppOutputFile`, `AppOutputFileFactory`, `IMediaFile`, `MediaFile`, `WebFile`, `Command` (interface backing `RemoveActionCommand`/`RemoveTrackCommand`), `Screenshot`, `ScreenshotQueue` (used by base `Controller`). | Hard peer dep. |
| `@stoked-ui/file-explorer` | Listed as peer dep; used downstream when timeline is embedded in editors. The timeline package itself does not import from it directly today. | Peer dep declared in `package.json`. |
| `interactjs` (+ `@interactjs/actions`, `@interactjs/core`, `@interactjs/types`) | `Interactable` wrapper, drag/resize affordances on action blocks and tracks, drag lines in `TimelineTrackArea`. | Bundled dep. |
| `react-virtualized` (+ `@types/react-virtualized`) | `ScrollSync` (used in `Timeline.tsx`) and the virtualized track grid in `TimelineTrackArea`. | Bundled dep. |
| `sorted-btree` | `BTree` is used inside `Engine` for ordered active-action / next-action lookup keyed by start time. Build/test must `transformIgnorePatterns: 'node_modules/(?!(sorted-btree)/)'` in Jest. | Bundled dep. |
| `react-device-detect` | `isMobile` used to pick `DEFAULT_MOBILE_TRACK_HEIGHT` vs `DEFAULT_TRACK_HEIGHT` in provider state. | Bundled dep. |
| `framework-utils` | Misc DOM/utility helpers used inside `Interactable` and track-area math. | Bundled dep. |
| `howler` (+ `@types/howler`) | `AudioController` plays/seeks audio actions through Howl instances; supports per-action mute, rate, time listeners. | Dev dep but ships bundled in audio controller. |
| `@mui/material`, `@mui/system`, `@mui/icons-material`, `@emotion/styled` | Styled root, theme, slot props, transport icons. | Peer deps. |
| `@types/wicg-file-system-access` | Types for `FileSaveRequest` flow when persisting `.sut` projects. | Dev dep. |

### Downstream (consumers of this module)

| Consumer | What they import | Why |
|---|---|---|
| `@stoked-ui/editor` (`packages/sui-editor`) | `Engine`, `EngineState`, `PlaybackMode`, `IEngine`, `TimelineProvider`, `TimelineState`, `TimelineFile`, `Timeline`, `IController`, `Controller`, `ITimelineAction`, `ITimelineTrack`, plus all utility types. `EditorEngine extends Engine`; `EditorProvider` wraps `TimelineProvider`; `EditorFile extends TimelineFile`; `EditorState extends TimelineState`. | Hard peer integration; the editor is a strict superset of the timeline runtime. |
| `docs/` Next.js site | `Timeline`, `TimelineProvider`, `TimelineFile`, `TimelinePlayer`, plus showcase wrappers. | Marketing showcases, MDX demos, homepage hero. |
| Apps building on `@stoked-ui/sui` | Any of the public exports above; typically `Timeline` + `TimelineProvider` + custom controllers. | Library consumers. |

### External services / resources

- **IndexedDB:** `LocalDb` from `@stoked-ui/common` persists `TimelineFile` instances; the database name and store are supplied via `getDbProps(state.app.defaultInputFileType, props.localDb)` (default mime is `.sut` from `StokedUiTimelineApp`).
- **Web Audio / Audio element:** `AudioController` uses Howler, which sits on top of the Web Audio API. (The editor extends this with a shared `AudioContext` destination so multi-track audio mixes into the recorder; the bare timeline does not own the recorder.)
- **`requestAnimationFrame`:** `Engine._timerId` drives the playback tick. Tests must mock `requestAnimationFrame` / `cancelAnimationFrame` — see `SC_TEST.md` §4.4.
- **File System Access API:** types only (`@types/wicg-file-system-access`); the actual save dialog is handled by `@stoked-ui/common`'s `LocalDb` / `FileSaveRequest`.
- **`window` globals (debug):** `TimelineProvider` declares `window.setSetting`, `setScaleWidth`, `setScale`, `setScaleSplitCount`, `setMinScaleCount`, `setMaxScaleCount`, `getSetting`, `getState`, `reRender`, `saveUrl` for in-browser debugging.

---

## 6. Key Source Files

### Engine + provider (the runtime spine)

- **`src/Engine/Engine.ts`** (~665 LOC) — Core class extending `Emitter<EventTypes>`. Owns `_currentTime`, `_state`, `_playRate`, `_timerId`, `_actionMap`, `_actionTrackMap`, `_controllers`, `playbackMode` (`PlaybackMode = TRACK_FILE | CANVAS | MEDIA`), `playbackTimespans`. The constructor throws `'Error: No controllers set!'` when no controllers are supplied (see `AX-MOD-TIMELINE-001`). Implements `play`, `pause`, `setTime`, `setPlayRate`, `rewind`, `fastForward`, `tickAction`, `reRender`, `setTracks`, `getAction`, `getActionTrack`, `getSelectedActions`, plus internal `_dealData` / `_dealEnter` / `_dealLeave` / `_dealClear` lifecycle.
- **`src/Engine/Engine.types.ts`** — `IEngine`, `EngineState` enum (`LOADING | PLAYING | PAUSED | READY | PREVIEW`), `EngineOptions` (`{ viewer?, controllers?, events? }`), `PlaybackMode` enum (`TRACK_FILE | CANVAS | MEDIA`), `Version`, `SetAction`, `Dispatch`.
- **`src/Engine/events.ts`** — `Events` emitter constructor and `EventTypes` union (`beforeSetTime`, `afterSetTime`, `setTimeByTick`, `beforeSetPlayRate`, `afterSetPlayRate`, `play`, `paused`, `ended`, `setScrollLeft`, …).
- **`src/Engine/emitter.ts`** (~64 LOC) — Generic `Emitter<T>` base class with `on`, `off`, `offAll`, `trigger`, `bind`, `exist`. Subscribers can return `false` from `before*` events to veto a state change.
- **`src/TimelineProvider/TimelineProvider.tsx`** — React context provider; instantiates default `Engine` if none passed, wires controllers, registers `StokedUiTimelineApp`, exposes the reducer-managed state via `TimelineContext`. Hangs debug helpers off `window`.
- **`src/TimelineProvider/TimelineProvider.types.ts`** — `TimelineState`, `TimelineProviderProps`, `TimelineStateAction`, `TimelineReducer`, `createTimelineState`, `getDbProps`, `Selection`. Settings include `scaleWidth`, `scale`, `scaleSplitCount`, `minScaleCount`, `maxScaleCount`, `startLeft`, `trackHeight`. Flags include `detailMode`, `loop`, `record`, `fullscreen`.
- **`src/TimelineProvider/TimelineProviderFunctions.ts`** (~251 LOC) — Pure-ish helpers: `setCursor`, `setHorizontalScroll`, `setScaleCount` (clamped), `fitScaleData`, `getHeightScaleData`, `getTrackHeight`, `getActionHeight`, `refreshActionState` (folds `disabled`/`detailMode` into `action.dim`), `refreshTrackState`, `createActionEvent`.
- **`src/TimelineProvider/TimelineDetail.ts`** — `DetailData`, `SelectionTypeName`, `getDetail` factory used by detail-view consumers (the editor's `DetailModal` overrides this with `getEditorDetail`).

### Top-level component

- **`src/Timeline/Timeline.tsx`** — Root component. Reads context via `useTimeline`, computes `getScaleCountByRows`, drives `ScrollSync` from `react-virtualized`, lays out labels rail · controls · time ruler · scrollable track area · cursor overlay. Controlled by `TimelineProps` (`labels`, `controls`, `noLabels`, `noTrackControls`, `noSnapControls`, `slots`, `slotProps`, `classes`, `controlSx`, etc.).
- **`src/Timeline/Timeline.types.ts`**, **`TimelineControl.types.ts`**, **`TimelineControlProps.ts`** — Component prop / slot types.
- **`src/Timeline/TimelineState.ts`** — `TimelineComponent` / `TimelineState` class that exposes imperative methods (`setScrollLeft`, `setScrollTop`, `reRender`).
- **`src/Timeline/timelineClasses.ts`** — `getTimelineUtilityClass`, `timelineClasses`.
- **`src/Timeline/StokedUiTimelineApp.ts`** — `App` singleton registering `.sut` (timeline project) and `.sua` (timeline audio) mime types via `SUIMime` plus `AppFileFactory` / `AppOutputFileFactory`.
- **`src/Timeline/AddTrackButton.tsx`**, **`KeyDownControls.tsx`** — Track-add affordance and global keyboard handler (space=play/pause, arrow scrub, etc.).

### Domain model

- **`src/TimelineFile/TimelineFile.ts`** (~371 LOC) — `TimelineFile extends AppFile`. Stores `_tracks`, applies `actionInitializer` to convert `ITimelineFileAction` → `ITimelineAction`. Static helpers: `getName`, `newTrack`, `getTrackColor` (composite controller color + alpha or red overlay if muted), `collapsedTrack` (flattens all actions across tracks), `Controllers` (static map plugged in by `TimelineProvider` / `EditorProvider`). Setter on `tracks` filters out the placeholder `id === 'newTrack'`. `data` getter returns serializable form with `controllerName` / `fileId` references instead of object refs.
- **`src/TimelineFile/TimelineFile.types.ts`** — `ITimelineFile`, `ITimelineFileProps`, `ITimelineFileData`, `FileState`.
- **`src/TimelineFile/Commands/RemoveActionCommand.ts`** (~49 LOC) — `Command` impl with `execute` / `undo`. **Known bug** (see `SC_TEST.md` §9.1): `this.trackIndex = index` stores the *action's index within a track* rather than the *track's index in `tracks`*; `undo()` then splices into the wrong track for multi-track files.
- **`src/TimelineFile/Commands/RemoveTrackCommand.ts`** (~41 LOC) — Track removal with index-preserving undo.

### Tracks, actions, labels, area

- **`src/TimelineTrack/TimelineTrack.tsx`** (~300 LOC) + **`TimelineTrack.types.ts`** + **`timelineTrackClasses.ts`** — Single track row rendering action blocks with drag/resize via `Interactable`.
- **`src/TimelineTrack/TimelineTrackDnd.tsx`**, **`TimelineTrackDnd.types.ts`** — Track-row drag-and-drop reorder.
- **`src/TimelineTrack/useAutoScroll.ts`** — Auto-scroll hook for dragging actions past the viewport edge.
- **`src/TimelineAction/TimelineAction.tsx`** + **`TimelineAction.types.ts`** + **`timelineActionClasses.ts`** — Single action block with start/end/duration, selection, dim state, `BackgroundImageStyle` for thumbnails, `initTimelineAction` factory.
- **`src/TimelineLabels/TimelineLabels.tsx`** + **`TimelineLabel.tsx`** + **`TimelineTrackActions.tsx`** + **`SnapControls.tsx`** — Left-rail label list, per-row track-action buttons (lock/mute/solo/delete/rename), snap-mode toggle (edge / feature / grid).
- **`src/TimelineTrackArea/TimelineTrackArea.tsx`** (~300 LOC) + **`TimelineTrackAreaCollapsed.tsx`** + **`TimelineTrackAreaDragLines.tsx`** + **`ZoomControls.tsx`** + **`useDragLine.ts`** — Virtualized scrollable track grid, collapsed single-row mode, drag-guide line overlay, zoom controls.

### Cursor, ruler, transport

- **`src/TimelineCursor/TimelineCursor.tsx`** + **`TimelineCursor.types.tsx`** + **`timelineCursorClasses.ts`** — Vertical playhead line; draggable for scrub.
- **`src/TimelineTime/TimelineTime.tsx`** + **`TimelineTime.types.ts`** + **`timelineTimeClasses.ts`** — Tick header / time ruler.
- **`src/TimelineScrollResizer/TimelineScrollResizer.tsx`** + types + classes — Horizontal + vertical scroll/resize handles.
- **`src/TimelineControls/TimelineControls.tsx`** + types + classes — Inline transport bar (used inside `Timeline`).
- **`src/TimelinePlayer/TimelinePlayer.tsx`** + types + classes — Standalone transport (used in showcases / docs without the full timeline).

### Controllers

- **`src/Controller/Controller.ts`** (~116 LOC) — Abstract `Controller<ControlType>` base class implementing `IController`. Holds `cacheMap`, `screenshotQueue`, `id`, `name`, `color`, `colorSecondary`, `logging`, `backgroundImage`. Static helpers: `getVol` (parses `[volume, start?, end?]` tuple), `getActionTime` (`(time - start + trimStart) % duration`), `getVolumeUpdate` (returns `{volume, volumeIndex}` for the active section). Abstract `getItem`. Per-method virtuals: `start`, `stop`, `enter`, `leave`, `update`, `preload`, `isValid`, `destroy`, `getActionStyle`, `viewerUpdate`, `updateMediaFile`.
- **`src/Controller/Controller.types.ts`** — `IController`, `VolumeSection`, `VolumeSections`.
- **`src/Controller/ControllerParams.ts`** — `ControllerParams`, `PreloadParams`, `GetItemParams`.
- **`src/Controller/AudioController.ts`** — `AudioControl extends Controller<Howl>`. Caches `Howl` instances per action, listens for engine `time`/`rate` events, applies `getVolumeUpdate` for volume automation segments.
- **`src/Controller/Controllers.ts`** — Convenience map (audio only in this package).

### Interaction primitives

- **`src/Interactable/Interactable.tsx`** — Wraps `interactjs` so children become draggable / resizable with React-friendly callbacks.
- **`src/components/ToggleButtonGroupEx/`** — Segmented control with overflow handling, used in snap and zoom controls.

### Utilities and constants

- **`src/utils/deal_data.ts`** (~118 LOC) — Pure pixel/time math used everywhere in the UI: `parserTimeToPixel`, `parserPixelToTime`, `parserTransformToTime`, `parserTimeToTransform`, `getScaleCountByRows`, `getScaleCountByPixel`, `parserActionsToPositions`. The single source of truth for ruler / action / cursor positioning.
- **`src/utils/deal_class_prefix.ts`** — `prefix(...)` helper for class-name composition.
- **`src/utils/logger.ts`** — `ConsoleLogger` (prefix-tagged) used by engine and controllers when `logging: true`.
- **`src/interface/const.ts`** — All shared defaults: `PREFIX = 'timeline'`, `DEFAULT_SCALE = 1`, `DEFAULT_SCALE_WIDTH = 100`, `DEFAULT_TRACK_HEIGHT = 36`, `DEFAULT_MOBILE_TRACK_HEIGHT = 60`, `MIN_SCALE_COUNT = 40`, `ADD_SCALE_COUNT = 5`, `NEW_ACTION_DURATION = 2`, `ERROR.{START_TIME_LESS_THEN_ZERO, END_TIME_LESS_THEN_START_TIME}`.

### Theme / icons / types

- **`src/themeAugmentation/`** — MUI augmentation for `MuiTimeline`, `MuiTimelineLabels`, `MuiTimelineTrack`, `MuiTimelineCursor`, `MuiTimelineTime`, `MuiTimelineControls`, `MuiTimelinePlayer`, `MuiTimelineScrollResizer`. (`themeAugmentation.spec.ts` is the package's only existing test — type-check only.)
- **`src/icons/`** — Snap-mode icons (`EdgeSnap`, `FeatureSnap`, `GridSnap`), `TimelineTrackIcon`, `TimelineView`.
- **`src/types/blob-fix.d.ts`**, **`interactjs-fix.d.ts`** — Local type shims.

---

## 7. Change Impact

### When you touch the engine (`Engine/Engine.ts`, `Engine.types.ts`, `events.ts`, `emitter.ts`)

- **Re-validate `@stoked-ui/editor`** — `EditorEngine extends Engine`, and every editor controller (`Audio`, `Video`, `Image`, `Web`, `Compositor`) consumes the engine's emitter and `_actionMap`. Adding/removing a state, event, or protected field cascades immediately into the editor build.
- **Validate emitter veto behavior** — `setTime` and `setPlayRate` honor `false` returns from `beforeSetTime` / `beforeSetPlayRate`. Tests in `SC_TEST.md` §3.3 exercise this.
- **Validate the `_tick` clamp** — `Math.min(1000, now - this._prev)` does not protect against negative deltas if the wall clock moves backwards (see `SC_TEST.md` §9.4). Touching the tick code is a good time to fix it.
- **Validate playback-mode branches** — `CANVAS` mode reads `duration` from action `end`s; `TRACK_FILE` mode reads `media.duration`. `MEDIA` paths in `setTime` access `playbackCurrentTimespans[0]` without a length check (see `SC_TEST.md` §9.5).
- Run docs locally on **port 5199** (`pnpm docs:dev`) and exercise both the `/products/timeline/` showcase and the `/products/editor/` showcase — the editor stresses many engine paths the bare timeline does not.

### When you touch the provider / state (`TimelineProvider.tsx`, `TimelineProvider.types.ts`, `TimelineProviderFunctions.ts`)

- `EditorProvider` wraps `TimelineProvider`; renaming or restructuring `TimelineState` will break `EditorState extends TimelineState`.
- `getHeightScaleData` divides by `(file.tracks.length - 1)` when the `?? 2` fallback is bypassed by a non-null length of 1 (see `SC_TEST.md` §9.6) — a single-track project triggers division by zero.
- Settings exposed on `window` (`setScaleWidth`, `setScale`, `setScaleSplitCount`, …) are part of the debug contract; renaming them silently breaks console-driven QA.
- `refreshActionState` / `refreshTrackState` mutate the `dim` flag on the action/track in place. The reducer relies on a re-render after dispatch — bypassing the reducer when changing these breaks selection sync.

### When you touch a controller (`Controller/*.ts`)

- The `id` string on a controller must match the `controller` field used on `ITimelineTrack` / `ITimelineAction`. Lookup is by string key into `engine.controllers`.
- Adding a new controller in this package goes through `Controllers.ts` and must be exported from `src/Controller/index.ts`.
- For `AudioController`: validate Howler caching across `play`/`pause`/`setTime`; validate the volume-section automation via `getVolumeUpdate`.
- Editor-supplied controllers (`Video`, `Image`, `Web`, `Compositor`) are registered via `TimelineFile.Controllers = …` before file deserialization — keep this hook intact.

### When you touch `TimelineFile` / `TimelineTrack` / `TimelineAction`

- `TimelineFile extends AppFile` from `@stoked-ui/media`; changes to the parent class shape require coordinated updates.
- The serialized `data` getter swaps controller refs for `controllerName` and media refs for `fileId`. Bumping the on-disk shape requires a versioned IDB migration (`getDbProps` in the provider).
- The `ITimelineFileAction → ITimelineAction` widening happens in `TimelineFile`'s `actionInitializer`; new fields default-initialized there propagate to all loaded files.
- The `RemoveActionCommand.trackIndex` bug (see §6) means multi-track undo is broken today — please add the failing test before fixing.

### When you touch the UI components (`Timeline/`, `TimelineTrack/`, `TimelineTrackArea/`, `TimelineLabels/`, etc.)

- `react-virtualized`'s `ScrollSync` is wired in `Timeline.tsx`; ripping it out would un-sync the labels rail from the track area.
- `interactjs` is wired through the `Interactable` wrapper; drag/resize behavior on actions and snap modes (`SnapControls`) all flow through it. Replacement requires touching `Interactable` plus every `Interactable` consumer.
- Style classes follow the `getTimelineUtilityClass` / `timeline*Classes.ts` pattern; renaming a slot also requires updating `themeAugmentation/components.d.ts`.

### When you touch utilities (`utils/deal_data.ts`)

- These are the **single source of truth** for pixel/time math in this package and the editor. A regression here distorts the entire UI silently.
- Watch for `scale=0` / `scaleWidth=0` division-by-zero (see `SC_TEST.md` §3.1 / §9). Round-trip property tests are the cheapest guard.
- `AX-MOD-TIMELINE-003`'s acceptance grep (`grep -rn "scaleWidth \* " src`) currently returns exactly one match outside `deal_data.ts`: `TimelineProvider/TimelineProviderFunctions.ts:122` inside `fitScaleData` (`scaleWidth: scaleWidth * newScale`). This is the one **approved call site** — it derives a new `scaleWidth` *setting* for zoom-to-fit, not a per-element screen position. Any new match the grep surfaces is a violation and should be folded back into a `deal_data.ts` helper.

### When you touch the public surface (`src/index.ts`)

- Bump the patch version in `package.json` (`@stoked-ui/timeline`).
- Verify `@stoked-ui/editor` still type-checks against the new exports — the editor imports from many sub-paths (`./Engine`, `./TimelineProvider`, `./TimelineFile`, etc.) and re-exports several types itself.
- Verify docs MDX (`docs/data/timeline/**` routed via `docs/pages/products/timeline/docs/**`) and the showcase mounts (`docs/src/components/showcase/TimelineHero.tsx`, `docs/src/components/home/TimelineShowcase.tsx`, `docs/src/components/showcase/ThemeTimeline.tsx`) still import cleanly.
- Run `pnpm typescript` from the package and `pnpm --filter @stoked-ui/editor typescript` after.
- Re-run `pnpm build` (modern + node + stable + types + copy-files) before publishing.

### Tests (caveat)

Per `.stokd/meta/packages/sui-timeline/SC_TEST.md`: there is currently **one spec file** in this package (`src/themeAugmentation/themeAugmentation.spec.ts`, type-check only). The Jest infrastructure (`jest.config.js`, fixtures, RAF mock) is documented in `SC_TEST.md` but not yet checked in. Until tests land, expect to validate engine and provider behavior manually through the docs `HeroTimeline` showcase and the editor's `HeroEditor` showcase.

### CI / build

- The package is built via `node ../../scripts/build.mjs {modern,node,stable}` plus `buildTypes.mjs` and `copyFiles.mjs`. `prebuild` clears `build/` and `tsconfig.build.tsbuildinfo`. Watching uses Babel with `--extensions '.js,.ts,.tsx'` against `./src`.
- `package.json#repository` points at `https://github.com/stoked-ui/sui.git` with `directory: packages/sui-timeline` (changed 2026-06 for npm trusted-publisher provenance validation — see `AX-REPO-PUBLISH-NO-HOL-BLOCKING`). Do not point it back at the legacy `stoked-ui/timeline` repo; publishes will fail provenance checks.
- `sst-env.d.ts` is present (SST infrastructure types) — leave it untouched unless restructuring deployment.
- Jest config (when added) needs `transformIgnorePatterns: ['node_modules/(?!(sorted-btree)/)']` because `sorted-btree` ships ESM.
