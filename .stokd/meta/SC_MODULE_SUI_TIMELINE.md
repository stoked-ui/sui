# SC_MODULE_SUI_TIMELINE

> **Meta version:** 0.2.0 | **Generated:** 2026-03-21
> **Package:** `@stoked-ui/timeline` | **Location:** `packages/sui-timeline/`

---

## Module Name

`sui-timeline` — `@stoked-ui/timeline`

---

## Responsibility

`sui-timeline` is the core playback engine and timeline UI for the Stoked UI product suite. It provides:

- A **frame-accurate playback engine** (`Engine`) that advances time via `requestAnimationFrame`, dispatches controller lifecycle hooks (`enter`, `update`, `leave`, `start`, `stop`) on each active action, and supports canvas, media, and track-file playback modes.
- A **visual timeline editor** composed of modular MUI-styled React components: track rows, action clips, a time ruler, a drag cursor, snap controls, zoom controls, and a playback player bar.
- A **React context/reducer state machine** (`TimelineProvider` / `TimelineReducer`) that coordinates the engine, selected file, tracks, actions, flags, settings, and undo/redo command history.
- An **`IController` plug-in contract** that lets consumers supply custom renderers (video, audio, image, lottie, etc.) without modifying the core engine.
- A **`TimelineFile`** abstraction (`ITimelineFile`) that owns a list of tracks and is the serializable project document.

It is designed to run standalone (embedded in any React app via `TimelineProvider`) or as the rendering backbone inside `sui-editor`.

---

## Public Interfaces / Entry Points

### Main export barrel
`packages/sui-timeline/src/index.ts`

| Export | Kind | Purpose |
|--------|------|---------|
| `Timeline` (default) | React component | Root timeline UI wrapper |
| `TimelineFile` | Class | Serializable project document |
| `TimelineCursor` | React component | Playback-position drag cursor |
| `TimelineLabels` | React component | Left-side track label column |
| `TimelinePlayer` | React component | Play/pause/rate control bar |
| `TimelineScrollResizer` | React component | Horizontal scroll + resize handle |
| `TimelineTime` | React component | Top ruler / time scale |
| `TimelineTrack` | React component | Single track row with its action clips |
| `TimelineTrackArea` | React component | Scrolling area containing all tracks |
| `Engine` | Class | Playback engine (can run without UI) |
| `Controller` | Abstract class | Base class for custom action controllers |
| `TimelineContext` | React context | Raw context value (`{ state, dispatch }`) |
| `useTimeline` | Hook | Access `TimelineContextType` from any child |
| `TimelineReducer` | Function | Pure reducer; can be extended by consumers |
| `createTimelineState` | Function | Factory to produce initial `TimelineState` |
| `TimelineProvider` | Component | Context provider wrapping engine + reducer |

### Key type exports
`IEngine`, `IController`, `ITimelineFile`, `ITimelineTrack`, `ITimelineAction`, `ITimelineFileAction`, `TimelineState`, `TimelineStateAction`, `TimelineProviderProps`, `EngineState`, `PlaybackMode`, `EventTypes`, `DetailData`, `SelectionTypeName`

### Engine event bus (`Engine extends Emitter<EventTypes>`)
Events fired by the engine and subscribable via `engine.on(...)`:

| Event | Payload |
|-------|---------|
| `beforeSetTime` | `{ time, engine }` |
| `afterSetTime` | `{ time, engine }` |
| `setTimeByTick` | `{ time, engine }` |
| `beforeSetPlayRate` | `{ rate, engine }` |
| `afterSetPlayRate` | `{ rate, engine }` |
| `play` | `{ engine }` |
| `rewind` | `{ engine }` |
| `fastForward` | `{ engine }` |
| `pause` | `{ engine, previousState }` |
| `ended` | `{ engine }` |
| `setScrollLeft` | `{ left, engine }` |

### Controller plug-in interface (`IController`)
`packages/sui-timeline/src/Controller/Controller.types.ts`

```ts
interface IController {
  id: string;
  color?: string;
  colorSecondary?: string;
  logging: boolean;
  enter(params: ControllerParams): void;
  leave(params: ControllerParams): void;
  update(params: ControllerParams): void;
  start(params: ControllerParams): void;
  stop(params: ControllerParams): void;
  preload(params: PreloadParams): Promise<ITimelineAction>;
  getItem(params: GetItemParams): any;
  getActionStyle?(action, track, scaleWidth, scale, trackHeight): BackgroundImageStyle | null;
  viewerUpdate?(engine: any): void;
  destroy?(): void;
}
```

Controllers are keyed by string id in the `controllers` record passed to `TimelineProvider` and referenced from each `ITimelineTrack.controller`.

### Reducer dispatch actions (`TimelineStateAction`)
`packages/sui-timeline/src/TimelineProvider/TimelineProvider.types.ts`

| Action type | Effect |
|-------------|--------|
| `SELECT_ACTION` | Sets `selectedAction`, derives `selectedTrack` index |
| `SELECT_TRACK` | Sets `selectedTrack`, clears action |
| `SELECT_PROJECT` | Clears both selections |
| `SELECT_SETTINGS` | Sets selection type to `settings` |
| `SET_FILE` | Replaces whole file, sets tracks, transitions engine from LOADING → READY |
| `SET_TRACKS` | Rebuilds engine action map, recalculates height/scale |
| `CREATE_ACTION` | Appends new action to a track |
| `SET_SETTING` | Merges one key (or nested object) into `settings` |
| `SET_FLAGS` | Enables/disables named boolean flags |
| `UPDATE_ACTION_STYLE` | Updates `backgroundImageStyle` on a single action |
| `SET_COMPONENT` | Registers a DOM/React component ref into `state.components` |
| `DISCARD_FILE` | Clears file and engine tracks |
| `EXECUTE_COMMAND` | Runs command pattern, pushes to `commandHistory` |
| `UNDO` | Pops `commandHistory`, calls `command.undo()` |
| `REDO` | Shifts `undoStack`, calls `command.execute()` |

### Feature flags (set via `SET_FLAGS` or `createTimelineState`)
`isMobile`, `showViewControls`, `noLabels`, `fileView`, `noTrackControls`, `noSnapControls`, `localDb`, `noSaveControls`, `record`, `noResizer`, `collapsed`, `allControls`, `fullscreen`, `newTrack`, `detailMode`, `minimal`

---

## Products

No dedicated product docs files are listed in the prompt scope for this module. However, this module is referenced in:

- **`docs/src/components/home/TimelineShowcase.tsx`** — live showcase used on the Timeline product page (view 1.2)
- **`packages/sui-editor/`** — depends on `@stoked-ui/timeline` as a peer; the editor extends `Engine`, `Controller`, `TimelineFile`, `TimelineProvider`, and all track/action types

---

## Views

From `SC_VIEWS.md`:

| View | Role of sui-timeline |
|------|---------------------|
| **1.1 Home Page** — `TimelineShowcase` in `ProductsPreviews` | Renders a live `Timeline` instance inside `HeroFlux` / `TimelineShowcase.tsx` |
| **1.2 Product Showcase — Timeline** (`/products/timeline/`) | Primary showcase; `TimelineShowcase` is the hero component |
| **1.3 Product Documentation Pages** — timeline docs | API tables and embedded demos exercise `Timeline`, `TimelinePlayer`, `TimelineTrack`, etc. |
| **1.5 Editor PWA** | `sui-editor` embeds `TimelineProvider` + `Engine`; this module renders the track/action editing surface within the full editor view |

---

## Integration Points

### Upstream dependencies

| Dependency | Contract |
|------------|---------|
| `@stoked-ui/common` | `namedId`, `createProviderState`, `ProviderState`, `FlagData`, `SortedList`, `IMimeType`, `LocalDbProps`, `Settings`, `compositeColors` |
| `@stoked-ui/media` | `IMediaFile`, `IAppFile`, `IAppFileProps`, `IAppFileData`, `App`, `Screenshot`, `ScreenshotQueue`, `Command` |
| `@stoked-ui/file-explorer` | Peer dependency; file model used by track `.file` field |
| `@mui/material` + `@mui/system` | All visual components use MUI theming, `styled`, `SxProps` |
| `interactjs` / `@interactjs/*` | Drag-and-drop / resize of action clips in `TimelineTrack` and `TimelineTrackArea` |
| `react-virtualized` | Virtualized rendering of track rows in `TimelineTrackArea` |
| `sorted-btree` | `BTree` used in `Engine._activeIds` for efficient O(log n) active-action tracking |
| `react-device-detect` | `isMobile` drives `DEFAULT_MOBILE_TRACK_HEIGHT` and `noLabels` default flag |

### Downstream consumers

| Consumer | How it uses sui-timeline |
|----------|--------------------------|
| `@stoked-ui/editor` (`sui-editor`) | Extends `Engine`, `Controller`, `TimelineFile`, `TimelineProvider`; adds video rendering, screenshot extraction, IDB persistence, recording |
| `@stoked-ui/github` | Uses `@stoked-ui/timeline` as a peer dep (file-based playback context) |
| `docs` app | Imports `Timeline`, `TimelinePlayer`, `TimelineProvider` for showcase demos and documentation examples |
| `@stoked-ui/docs` (`sui-docs`) | Peer dep; reuses theme and doc components alongside timeline |

---

## Key Source Files

| File | Why it matters |
|------|---------------|
| `src/Engine/Engine.ts` | Core playback loop. `requestAnimationFrame` tick, `_dealEnter`/`_dealLeave` manage active actions via `BTree`, delegates to `IController` lifecycle methods. Supports `CANVAS`, `MEDIA`, `TRACK_FILE` playback modes. |
| `src/Engine/Engine.types.ts` | `IEngine` interface, `EngineState` enum (`LOADING`, `READY`, `PLAYING`, `PAUSED`, `PREVIEW`), `PlaybackMode` enum, `EngineOptions` |
| `src/Engine/events.ts` | `Events` class (default handler registry) + `EventTypes` interface — the typed event bus contract |
| `src/Engine/emitter.ts` | `Emitter<T>` base class used by `Engine`; provides `on`, `off`, `offAll`, `trigger` |
| `src/TimelineProvider/TimelineProvider.types.ts` | `TimelineState`, `TimelineStateAction` union, `TimelineProviderProps`, `createTimelineState`, `TimelineReducer`, `TimelineReducerBase`, `updateSelection` — the entire state model |
| `src/TimelineProvider/TimelineProviderFunctions.ts` | Pure functions for cursor positioning (`setCursor`), horizontal scroll (`setHorizontalScroll`, `deltaScrollLeft`), scale calculation (`fitScaleData`, `setScaleCount`), track/action height calculation (`getTrackHeight`, `getActionHeight`, `getHeightScaleData`), dim state computation (`refreshActionState`, `refreshTrackState`) |
| `src/TimelineProvider/TimelineDetail.ts` | Detail panel data extraction: `getProjectDetail`, `getTrackDetail`, `getActionDetail`, `getFileDetail`, `getDetail`; Yup validation schemas for form-bound detail views |
| `src/Controller/Controller.ts` | Abstract `Controller<T>` base class with `cacheMap`, volume helpers (`getVol`, `getVolumeUpdate`), `getActionTime` utility; forces subclasses to implement `enter`, `leave`, `update`, `getItem` |
| `src/Controller/Controller.types.ts` | `IController` interface — the plug-in contract every media controller must satisfy |
| `src/Controller/AudioController.ts` | Built-in audio controller; drives Web Audio or Howler playback for audio-backed tracks |
| `src/TimelineAction/TimelineAction.types.ts` | `ITimelineAction`, `ITimelineFileAction`, action state flags (`selected`, `flexible`, `movable`, `disabled`, `muted`, `locked`), `BackgroundImageStyle`, handler prop interfaces, `initTimelineAction` |
| `src/TimelineTrack/TimelineTrack.types.ts` | `ITimelineTrack`, `getTrackBackgroundColor`, `TrackColorAlpha` — color/alpha scheme for all 4 track states (normal, hover, selected, hoverSelect) across light/dark mode |
| `src/TimelineFile/TimelineFile.ts` | `TimelineFile` concrete class — owns `tracks[]`, implements `preload`, `loadUrls`, `data` serialization |
| `src/TimelineFile/TimelineFile.types.ts` | `ITimelineFile`, `ITimelineFileData`, `OutputBlob`, `FileState`, `SaveOptions` |
| `src/TimelineFile/Commands/RemoveActionCommand.ts` | Command pattern: undo/redo for action removal |
| `src/TimelineFile/Commands/RemoveTrackCommand.ts` | Command pattern: undo/redo for track removal |
| `src/interface/const.ts` | All module-level defaults: `DEFAULT_SCALE`, `DEFAULT_TRACK_HEIGHT` (36px), `DEFAULT_MOBILE_TRACK_HEIGHT` (60px), `NEW_ACTION_DURATION` (2s), `MIN_SCALE_COUNT` (40), `DEFAULT_ADSORPTION_DISTANCE` (8px) |
| `src/Timeline/Timeline.types.ts` | `TimelineProps` — the root component's public prop surface including slots, callbacks, and style overrides |
| `src/TimelinePlayer/TimelinePlayer.tsx` | Self-contained play bar; subscribes to `engine.on('afterSetTime')` and `engine.on('setTimeByTick')` via `useTimeline()`, drives auto-scroll |
| `src/TimelineTrackArea/TimelineTrackArea.tsx` | Scroll-synchronized area rendering all tracks via `react-virtualized`; hosts drag lines |
| `src/TimelineTrackArea/useDragLine.ts` | Hook for the ghost drag-line alignment guide during action moves |
| `src/TimelineTrack/useAutoScroll.ts` | Auto-scroll hook that nudges horizontal scroll during action drag when cursor approaches edges |

---

## Change Impact

### Engine changes (`Engine.ts`, `Engine.types.ts`, `events.ts`)
- Any change to the tick loop, state transitions, or event names **ripples to all controllers** in `sui-editor` and any custom consumer.
- Adding/removing event types from `EventTypes` requires updating `Events` constructor defaults and all `engine.on(...)` call sites.
- Changing `EngineState` values breaks switch statements in `TimelineReducer` and any editor-level state machines.

### Controller contract (`Controller.types.ts`, `Controller.ts`)
- Adding required methods to `IController` **breaks all existing controllers** (video, audio, image, lottie in `sui-editor`).
- Changing `ControllerParams` shape affects every `enter`/`leave`/`update`/`start`/`stop` implementation across all packages.

### TimelineProvider / Reducer (`TimelineProvider.types.ts`)
- Adding a new `TimelineStateAction` type is additive but requires a case in `TimelineReducerBase`.
- Changing `TimelineState` fields (especially `settings` keys) affects `TimelineProviderFunctions.ts`, detail panel forms, and all editor state extensions.
- Changing flag names in `createTimelineState` breaks any consumer checking `flags.flagName`.

### TimelineAction / TimelineTrack types
- Adding required fields to `ITimelineAction` or `ITimelineTrack` breaks all serialized file formats and requires migration of persisted IDB data in `sui-editor`.
- Changing `getTrackBackgroundColor` or `TrackColorAlpha` constants changes the visual appearance of all tracks across all modes — validate in both dark and light themes.

### Scale / layout constants (`interface/const.ts`)
- `DEFAULT_TRACK_HEIGHT` and `DEFAULT_MOBILE_TRACK_HEIGHT` are used in height calculations throughout `TimelineProviderFunctions.ts` and affect all downstream virtual list sizing.

### Validation to run on any change
1. Timeline renders with no file loaded (empty state).
2. Timeline renders with a multi-track file and playback advances frame-by-frame.
3. Action drag (move + resize) works with snap enabled and disabled.
4. Play / pause / rewind / fast-forward cycle completes without leaving engine in PLAYING state.
5. `sui-editor` builds without type errors (it extends core types from this module).
6. TimelineShowcase renders in the docs app at `localhost:5199`.
