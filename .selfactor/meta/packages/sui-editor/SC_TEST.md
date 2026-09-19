# Testing Strategy: `@stoked-ui/editor`

**Package:** `packages/sui-editor`
**Priority:** Medium
**Date:** 2026-03-03

---

## 1. Current State

### Existing Tests

| File | Status | Notes |
|------|--------|-------|
| `src/EditorFile/EditorFile.test.tsx` | Broken | `createBlob` call commented out (line 15); `createdBlob` is always undefined |
| `src/internals/useEditor/useEditor.test.tsx` | Broken | Imports `describeEditor` from `test/utils/editor-view/describeEditor` — directory does not exist |
| `src/internals/plugins/useEditorKeyboard/useEditorKeyboard.test.tsx` | Broken | Same missing `describeEditor` dependency; 53KB of comprehensive keyboard nav tests |
| `src/internals/plugins/useEditorMetadata/useEditorMetadata.test.tsx` | Broken | Same missing `describeEditor` dependency; covers selection model with ~30 test cases |
| `test/integration/*.test.js` (7 files) | Irrelevant | Upstream MUI integration tests (Menu, Select, TableCell, etc.) — not editor-specific |
| `test/typescript/*.spec.tsx` (~25 files) | TypeScript-only | Type compilation checks for MUI theme augmentation — no runtime tests |
| `src/themeAugmentation/themeAugmentation.spec.ts` | TypeScript-only | Theme type extension checks |

**Net effect:** Zero passing editor-specific runtime tests. All 4 source test files are broken due to missing `describeEditor` infrastructure or commented-out code.

### Test Infrastructure

- **Runner:** Mocha (root `.mocharc.js`), glob: `packages/**/*.test.{js,ts,tsx}`
- **Assertions:** Chai (`expect().to.equal()`) with custom matchers from `@stoked-ui/internal-test-utils`
- **DOM:** JSDOM via `@stoked-ui/internal-test-utils/setupJSDOM`
- **Rendering:** `createRenderer()` wraps `@testing-library/react` with Emotion cache + sinon timers
- **Coverage:** NYC/Istanbul via `pnpm test:coverage`
- **Analog pattern:** `describeFileExplorer` at `test/utils/file-explorer/` — `describeEditor` should follow this

---

## 2. Test Framework & Tooling

### Recommended: Mocha + Chai (monorepo standard)

Align with the existing monorepo infrastructure. Do **not** introduce Jest/Vitest for this package.

```
Runner:       Mocha (via root .mocharc.js)
Assertions:   Chai + @stoked-ui/internal-test-utils matchers
DOM:          JSDOM (via setupJSDOM)
Rendering:    @testing-library/react (via createRenderer)
Spies/stubs:  Sinon
Coverage:     NYC/Istanbul (root pnpm test:coverage)
```

> Note: `packages/sui-media/jest.config.js` exists as a Jest config for a sibling package, but the monorepo standard is Mocha. The existing test files in sui-editor use Mocha/Chai.

### Required Infrastructure Work

**Priority 0 — Create `describeEditor` test utility:**

Path: `test/utils/editor-view/describeEditor.tsx`

Follow the `describeFileExplorer` pattern:
1. Call `createRenderer()` once at suite setup
2. Build DOM query helpers (`getRoot`, `getCanvas`, `getControls`, `getTimeline`, etc.)
3. Create a renderer factory that wraps `<EditorProvider>` + `<Editor>` with minimal props
4. Export via `createDescribe('describeEditor', innerDescribeEditor)`

This unblocks all 3 existing plugin test files (~80+ test cases already written).

---

## 3. Test File Organization

```
packages/sui-editor/
├── src/
│   ├── __test-utils__/
│   │   ├── fixtures.ts                         # Shared mock factories
│   │   ├── mocks.ts                            # Browser API mocks (Canvas, Video, etc.)
│   │   └── setup.ts                            # Test setup for JSDOM globals
│   ├── Controllers/
│   │   ├── VideoController.test.ts             # Unit: lifecycle, frame sync, getDrawData
│   │   ├── ImageController.test.ts             # Unit: canvas drawing
│   │   ├── AudioController.test.ts             # Unit: Howl lifecycle
│   │   └── CompositorController.test.ts        # Unit: layer management, renderComposite
│   ├── EditorEngine/
│   │   └── EditorEngine.test.ts                # Unit: setTime, parseCoord, record, WASM init
│   ├── EditorFile/
│   │   └── EditorFile.test.tsx                 # Unit: serialization, preload, cleanup (FIX)
│   ├── EditorAction/
│   │   └── EditorAction.test.ts                # Unit: initEditorAction defaults
│   ├── EditorProvider/
│   │   ├── EditorReducer.test.ts               # Unit: all reducer cases
│   │   └── EditorState.test.ts                 # Unit: refreshActionState, refreshTrackState
│   ├── WasmPreview/
│   │   └── types.test.ts                       # Unit: createDefaultTransform, createDefaultLayer, keyframe helpers
│   ├── EditorControls/
│   │   └── EditorControls.test.tsx             # Component: render, button interactions
│   ├── Editor/
│   │   └── Editor.test.tsx                     # Component: mount, layout, file loading
│   ├── internals/
│   │   ├── useEditor/
│   │   │   └── useEditor.test.tsx              # Hook: plugin composition (FIX)
│   │   └── plugins/
│   │       ├── useEditorKeyboard/
│   │       │   └── useEditorKeyboard.test.tsx   # Plugin: keyboard nav (FIX)
│   │       └── useEditorMetadata/
│   │           └── useEditorMetadata.test.tsx    # Plugin: selection model (FIX)
│   └── DetailView/
│       └── DetailView.test.tsx                 # Component: form rendering, validation
├── test/
│   └── utils/
│       └── editor-view/
│           └── describeEditor.tsx              # NEW: test harness (Priority 0)
```

**Naming convention:** `<ModuleName>.test.ts` (pure logic) or `<ComponentName>.test.tsx` (React components). Co-located with source files.

---

## 4. What to Test

### Tier 1 — Pure Logic (highest ROI, no DOM needed)

These are testable immediately with zero infrastructure work.

#### 4.1 `WasmPreview/types.ts` helper functions

File: `src/WasmPreview/types.ts`

All pure functions, perfect unit test candidates:

| Function | Line | Test Cases |
|----------|------|------------|
| `createDefaultTransform()` | :324 | Returns identity transform: x=0, y=0, scaleX=1, scaleY=1, rotation=0, opacity=1, anchor=(0.5,0.5), skew=(0,0) |
| `createDefaultLayer(type, id?)` | :346 | `'solidColor'` → white RGBA content; `'image'` → empty URL; `'video'` → empty elementId; `'text'` → defaults (system-ui, 16px, white) |
| `createDefaultLayer(type)` | :346 | Omitting `id` → auto-generates random ID |
| `createLinearKeyframe(timeMs, value)` | :401 | Correct timeMs/value, easing='linear' |
| `createEaseInOutKeyframe(timeMs, value)` | :416 | easing='easeInOut' |
| `createCubicBezierKeyframe(...)` | :435 | Stores all 4 control points in `cubicBezierParams` |
| `createStepsKeyframe(...)` | :460 | Stores stepCount and stepPosition; default stepPosition='end' |

**~15 test cases, estimated effort: 30 minutes**

#### 4.2 `initEditorAction` (`src/EditorAction/EditorAction.ts:78`)

```
initEditorAction(fileAction, trackIndex)
  - Sets z = trackIndex when not present
  - Sets width = 1920 when not present
  - Sets height = 1080 when not present
  - Sets fit = 'none' when not present
  - Preserves existing z, width, height, fit when already set
  - Delegates to initTimelineAction for base properties
```

**~8 test cases, estimated effort: 20 minutes**

#### 4.3 EditorEngine.parseCoord (`src/EditorEngine/EditorEngine.ts:391`)

Static method, no instance needed:

```
parseCoord(coord, coordContext, sceneContext)
  - Number input: 100 → 100
  - Pixel string: '100px' → 100
  - Percentage: '50%' with coordContext=200, sceneContext=600 → (600-200)*0.5 = 200
  - calc(): 'calc(100% - 20px)' → evaluates correctly
  - calc() with vw: '50vw' → converts relative to scene context
  - Unsupported format: throws Error('Unsupported format...')
  - NOTE: Uses eval() internally (line 407) — security concern to document
```

**~10 test cases, estimated effort: 25 minutes**

#### 4.4 EditorReducer (`src/EditorProvider/EditorProvider.types.ts`)

The state management core, 20+ action types:

| Test Case | Action Type | What to Verify |
|-----------|-------------|----------------|
| Select action updates selectedAction | `SELECT_ACTION` | `state.selectedAction` set, detail mode triggers screener |
| Select track updates selectedTrack | `SELECT_TRACK` | `state.selectedTrack` set |
| Select project in detail mode | `SELECT_PROJECT` | Dispatches `DISPLAY_CANVAS` when `flags.detailMode` |
| Create action appends to correct track | `CREATE_ACTION` | New action in track, `initEditorAction` called |
| Update action merges properties | `UPDATE_ACTION` | Shallow merge on selected action |
| Update track merges properties | `UPDATE_TRACK` | Track properties merged |
| Set blend mode on file/track/action | `SET_BLEND_MODE` | Correct scope based on contextId |
| Set fit on file/track/action | `SET_FIT` | Analogous to blend mode |
| Video created adds to settings | `VIDEO_CREATED` | `settings.videos` grows, chains to `VIDEO_DISPLAY` |
| Video display sets videoTrack | `VIDEO_DISPLAY` | `settings.videoTrack` set |
| Video close clears videoTrack | `VIDEO_CLOSE` | `settings.videoTrack` undefined |
| Close detail disables flag | `CLOSE_DETAIL` | `flags.detailOpen` false |
| Null file guard | all types | No crash when `state.file === null` |
| Unknown action delegates | unrecognized | Falls through to `TimelineReducer` |

**~30 test cases, estimated effort: 2 hours**

#### 4.5 EditorState helpers (`src/EditorProvider/EditorState.ts`)

```
refreshActionState(action, track, state)
  - Returns action with dim = true when track.hidden = true
  - Preserves action.dim when track.hidden = false
  - Merges TimelineActionState properties

refreshTrackState(track, state)
  - Returns track with dim = true when track.hidden = true
  - Sets element.style.display = 'none' when hidden + element exists
  - Maps all track.actions through refreshActionState

getActionSelectionData(actionId, state)
  - Finds action across all tracks, sets selectedTrackIndex/selectedActionIndex
  - Returns unchanged state when actionId not found
```

**~12 test cases, estimated effort: 45 minutes**

### Tier 2 — Controllers (requires DOM mocks)

#### 4.6 CompositorController (`src/Controllers/CompositorController.ts`)

Pure logic with minimal DOM dependency. High-value for WASM integration correctness.

```
constructor()
  - Sets id='compositor', name='Compositor', colors correct

setRenderer(renderer)
  - Stores renderer reference
  - setRenderer(null) clears renderer

getItem(params)
  - Returns cached layer from activeLayers Map when available
  - Creates new CompositorLayer via actionToCompositorLayer when not cached
  - Correctly infers layer type from track.file MIME ('video/*' → 'video', 'image/*' → 'image')
  - Defaults to 'solidColor' with gray [128,128,128,255] when no file

actionToCompositorLayer(params) [private, test via getItem]
  - Maps action.blendMode → layer.blendMode with fallback chain (action → track → 'normal')
  - Creates default transform from action x/y + optional scaleX/Y, rotation, opacity
  - Sets visible = !track.hidden
  - Sets zIndex from action.z or 0

enter(params)
  - Adds layer to activeLayers Map
  - Calls renderComposite()

update(params)
  - Updates existing layer transform properties
  - Updates visibility from track.hidden
  - Logs warning when layer not found in activeLayers

leave(params)
  - Removes layer from activeLayers Map
  - Calls renderComposite()

renderComposite() [private, test via enter/update/leave]
  - No-op when renderer is null (pre-initialization)
  - Sorts layers by zIndex before rendering
  - Serializes to JSON and calls renderer.render_frame()
  - Catches and logs render errors

destroy()
  - Clears activeLayers
  - Sets renderer to null
  - Clears cacheMap
```

**~25 test cases, estimated effort: 1.5 hours**

#### 4.7 VideoController (`src/Controllers/VideoController.ts`)

The most complex controller. Requires mocking HTMLVideoElement and Canvas2DContext.

```
constructor()
  - Sets id='video', name='Video'

getItem(params)
  - Returns cached element from cacheMap when available
  - Creates HTMLVideoElement from file.media.element when not cached
  - Creates new video element when file.media is null
  - Throws when track has no file (line 48)
  - Appends video to Stage

hasAudio(item) [static]
  - Returns false for elements without audio tracks
  - Returns true for elements with audioTracks.length > 0
  - Returns true for elements with webkitAudioDecodedByteCount > 0

preload(params)
  - Sets item.preload = 'auto'
  - Resolves with action after loadedmetadata event
  - Sets action.duration, width, height from video metadata
  - Creates ScreenshotStore and generates track thumbnails
  - Loads cached screenshots from localStorage first
  - Resolves even if screenshot generation fails (line 144)
  - Rejects on video error event

getDrawData(params) — critical rendering logic
  - fit='fill': dWidth=renderWidth, dHeight=renderHeight
  - fit='contain' landscape: dWidth=renderHeight*ratio, dHeight=renderHeight
  - fit='contain' portrait: dWidth=renderWidth, dHeight=renderWidth*rRatio
  - fit='cover' landscape: dWidth=renderWidth, dHeight=renderWidth*rRatio
  - fit='cover' portrait: dWidth=renderHeight*ratio, dHeight=renderHeight
  - fit='none': dWidth=action.width, dHeight=action.height

enter(params)
  - Validates track visibility
  - Sets video.playbackRate from engine.getPlayRate()
  - Calls canvasSync to start frame rendering
  - Calls start() if engine is playing, update() otherwise
  - Sets action.playCount from action.loop

start(params)
  - Sets video.currentTime to action time offset
  - Pauses video when engine play rate < 0 (rewind unsupported)
  - Applies action.playbackRate when > 0
  - Calls video.play() unless action.freeze is defined

update(params)
  - Syncs volume via Controller.getVolumeUpdate
  - Draws frame via getDrawData during playback
  - Seeks via currentTime during scrub

leave(params)
  - Hides video element when time outside action bounds
  - Cancels requestVideoFrameCallback
  - Pauses video

destroy()
  - BUG: calls process.exit(333) — line 475 — CRITICAL
  - Should only remove video elements and clear cacheMap
```

**~30 test cases, estimated effort: 2 hours**

#### 4.8 AudioController (`src/Controllers/AudioController.ts`)

```
preload(params)
  - Creates Howl instance with file.url
  - Sets action.duration from howl.duration()
  - Rejects with error message on load failure

enter(params) → delegates to start()

start(params)
  - Sets howl rate to engine.getPlayRate()
  - Seeks to action time offset
  - Plays howl when engine.isPlaying
  - Registers afterSetTime and afterSetPlayRate listeners

update(params)
  - Updates volume via Controller.getVolumeUpdate()
  - Sets action.volumeIndex from volumeUpdate

stop(params)
  - Stops and mutes howl
  - Removes engine event listeners
  - Cleans up listenerMap entry

leave(params) → delegates to stop()
```

**~15 test cases, estimated effort: 1 hour**

#### 4.9 EditorEngine (`src/EditorEngine/EditorEngine.ts`)

```
constructor(params)
  - Creates EditorEvents when params.events is null
  - Sets controllers from params or defaults to Controllers
  - Initializes state to EngineState.LOADING
  - Sets _useWasm=true when params.useWasmRenderer && config.enabled !== false
  - Applies default wasmRendererConfig values

setTime(time, isTick?)
  - Clears canvas via clearRect
  - Calls _dealLeave then _dealEnter
  - Triggers 'setTimeByTick' when isTick=true
  - Triggers 'afterSetTime' when isTick=false
  - Returns false when beforeSetTime event returns false
  - Updates _currentTime

_dealEnter(time) [protected]
  - Activates actions whose start <= time < end
  - Calls controller.enter() for each entering action
  - Skips disabled actions
  - Maintains _activeIds sorted by z-index

initWasmRenderer()
  - Returns false when _useWasm is false
  - Dynamically imports '@stoked-ui/video-renderer-wasm'
  - Creates PreviewRenderer with canvas + dimensions
  - Sets renderer on CompositorController
  - Falls back to Canvas mode when WASM import fails + fallbackToCanvas=true
  - Throws when WASM fails and fallbackToCanvas=false

record(params)
  - Returns false when already playing
  - Returns false when toTime <= currentTime
  - Sets state to RECORDING
  - Triggers 'record' event
  - Starts requestAnimationFrame tick loop
  - Calls recordVideo()

pause()
  - Stops MediaRecorder when recording
  - Delegates to super.pause()

finalizeRecording(name)
  - Creates Blob from recorded chunks
  - Triggers 'finishedRecording' event with blob
  - Clears _recordedChunks
  - Calls pause()
  - Clears _recorder

set viewer(viewer)
  - Queries canvas[role='renderer'], video[role='screener'], div[role='stage']
  - Sets canvas dimensions
  - Creates 2D context with alpha and willReadFrequently
  - Throws when renderer/viewer/renderCtx not found
  - Triggers async initWasmRenderer when _useWasm=true

get renderWidth/renderHeight
  - Defaults to 1920/1080 when not set
```

**~35 test cases, estimated effort: 2.5 hours**

#### 4.10 EditorFile (`src/EditorFile/EditorFile.ts`)

```
constructor(props)
  - Sets defaults: backgroundColor='transparent', width=1920, height=1080
  - Sets type to 'application/stoked-ui-editor-project'
  - Applies default blendMode='normal' and fit='none' to tracks and actions
  - Sets action.z = trackIndex

get data()
  - Returns IEditorFileData with all tracks mapped to include blendMode/fit defaults
  - Includes backgroundColor, width, height, blendMode

preload(editorId)
  - Opens IndexedDB
  - Collects video sources from tracks with valid source URLs
  - Loads/caches videos via getOrFetchVideo
  - Creates object URLs and assigns to track.source.cachedUrl
  - Sets _isVideoLoaded=true even on error (prevents UI stuck state)

cleanup()
  - Revokes all object URLs to prevent memory leaks
  - Clears _videoSources record

isVideoLoaded()
  - Returns _isVideoLoaded boolean

fromUrl(url, Constructor)
  - Checks LocalDb for cached version first
  - Falls back to TimelineFile.fromUrl
  - Calls updateStore() and save() on fresh load

fromLocalFile(file, Constructor)
  - Delegates to TimelineFile.fromLocalFile
  - Calls updateStore()
```

**~20 test cases, estimated effort: 1.5 hours**

### Tier 3 — Component Tests (requires describeEditor + JSDOM)

#### 4.11 Editor (`src/Editor/Editor.tsx`)

```
- Renders 4 grid areas: viewer, controls, timeline, explorer-tabs
- Loads file from props.file via file.preload()
- Loads file from props.fileUrl via EditorFile.fromUrl()
- Sets feature flags on mount (noLabels, fullscreen, detailMode, record)
- Shows context menu on timeline right-click
- BUG: alert('3') fires on propsFile change — test should verify removal
```

#### 4.12 EditorControls (`src/EditorControls/EditorControls.tsx`)

```
- Renders transport buttons (play, pause, rewind, fast-forward, skip)
- Record button visible only in PlaybackMode.CANVAS
- Rate selector changes engine playback rate
- Time display formats as MM:SS.cc
- Volume slider updates engine volume
```

#### 4.13 EditorView (`src/EditorView/EditorView.tsx`)

```
- Renders canvas[role='renderer'], video[role='screener'], div[role='stage']
- Canvas dimensions sync with container via ResizeObserver
- Loader shows during engine loading state
```

### Tier 4 — Integration Tests

#### 4.14 EditorFile serialization roundtrip

Fix the broken test at `src/EditorFile/EditorFile.test.tsx`:
```
- createBlob() → readBlob() → properties match (id, name, description, author, version)
- Track actions preserved through roundtrip
- blendMode, fit, width, height preserved
- Video sources handled (blob URL cleanup)
```

#### 4.15 Editor + EditorProvider full integration

```
- Full mount with EditorProvider wrapping Editor
- File load → tracks rendered in timeline → canvas initialized
- Dispatch SELECT_TRACK → detail view updates
- Add media file → new track created → correct controller assigned
- Play → engine time advances → canvas draws frames
```

---

## 5. Mock/Stub Strategy

### Browser APIs (stub in test setup)

```typescript
// src/__test-utils__/mocks.ts
import sinon from 'sinon';

// Canvas 2D context — used by EditorEngine.setTime, VideoController.draw
export const createMockCtx = () => ({
  drawImage: sinon.stub(),
  clearRect: sinon.stub(),
  globalCompositeOperation: 'source-over',
  save: sinon.stub(),
  restore: sinon.stub(),
});

export const createMockCanvas = (ctx = createMockCtx()) => ({
  getContext: sinon.stub().returns(ctx),
  width: 1920,
  height: 1080,
  style: {} as CSSStyleDeclaration,
  toDataURL: sinon.stub().returns('data:image/png;base64,'),
  captureStream: sinon.stub().returns(new MediaStream()),
  setAttribute: sinon.stub(),
});

// HTMLVideoElement — used by VideoController
export const createMockVideo = () => ({
  currentTime: 0,
  duration: 10,
  paused: true,
  readyState: 4,
  play: sinon.stub().resolves(),
  pause: sinon.stub(),
  requestVideoFrameCallback: sinon.stub(),
  cancelVideoFrameCallback: sinon.stub(),
  captureStream: sinon.stub().returns(new MediaStream()),
  src: '',
  style: { display: 'flex', aspectRatio: '', objectFit: '', mixBlendMode: '' },
  videoWidth: 1920,
  videoHeight: 1080,
  volume: 1,
  playbackRate: 1,
  loop: false,
  preload: '',
  autoplay: false,
  crossOrigin: '',
  id: '',
  remove: sinon.stub(),
  addEventListener: sinon.stub(),
});

// ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// MediaRecorder — used by EditorEngine.recordVideo
global.MediaRecorder = class {
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  start(_timeslice?: number) {}
  stop() { this.onstop?.(); }
} as any;

// MediaStream — used by recordVideo
global.MediaStream = class {
  getAudioTracks() { return []; }
  getVideoTracks() { return []; }
} as any;

// URL.createObjectURL / revokeObjectURL — used by EditorFile.preload
global.URL.createObjectURL = sinon.stub().returns('blob:test');
global.URL.revokeObjectURL = sinon.stub();

// requestAnimationFrame — used by EditorEngine tick loop
global.requestAnimationFrame = sinon.stub().returns(1);
global.cancelAnimationFrame = sinon.stub();
```

### WASM Renderer Mock

```typescript
// Mock for PreviewRendererInstance — used by CompositorController
export const createMockWasmRenderer = () => ({
  render_frame: sinon.stub(),
  clear: sinon.stub(),
  get_metrics: sinon.stub().returns(JSON.stringify({ width: 1920, height: 1080, ready: true })),
  free: sinon.stub(),
});
```

### Monorepo Dependencies (partial mocks)

```typescript
// @stoked-ui/timeline — Engine base class
import { PlaybackMode, EngineState } from '@stoked-ui/timeline';

export const createMockEngine = (overrides = {}) => ({
  time: 0,
  _currentTime: 0,
  duration: 10,
  isPlaying: false,
  isRecording: false,
  isLoading: false,
  playbackMode: PlaybackMode.CANVAS,
  renderer: createMockCanvas(),
  renderCtx: createMockCtx(),
  screener: createMockVideo(),
  stage: document.createElement('div'),
  viewer: document.createElement('div'),
  renderWidth: 1920,
  renderHeight: 1080,
  getPlayRate: sinon.stub().returns(1),
  setPlayRate: sinon.stub(),
  on: sinon.stub(),
  off: sinon.stub(),
  trigger: sinon.stub().returns(true),
  media: null,
  ...overrides,
});

// @stoked-ui/common — IndexedDB utilities
// Stub openDB and getOrFetchVideo for EditorFile.preload tests
import { openDB, getOrFetchVideo } from '@stoked-ui/common';
sinon.stub(openDB).resolves(fakeDb);
sinon.stub(getOrFetchVideo).resolves(new Blob(['test']));

// @stoked-ui/media — ScreenshotStore
// Stub to avoid localStorage / canvas operations in tests
```

### Audio Mock (Howler.js)

```typescript
// Mock Howl for AudioController tests
const mockHowl = {
  play: sinon.stub(),
  pause: sinon.stub(),
  stop: sinon.stub(),
  mute: sinon.stub(),
  seek: sinon.stub().returns(0),
  rate: sinon.stub(),
  volume: sinon.stub(),
  duration: sinon.stub().returns(10),
};
// Stub Howl constructor
sinon.stub(Howler, 'Howl').returns(mockHowl);
```

### Shared Test Fixtures

```typescript
// src/__test-utils__/fixtures.ts
import { BlendMode, Fit, IEditorAction, IEditorFileAction } from '../EditorAction/EditorAction';
import { IEditorTrack } from '../EditorTrack/EditorTrack';

export const createMockFileAction = (overrides: Partial<IEditorFileAction> = {}): IEditorFileAction => ({
  id: 'test-action-1',
  name: 'Test Action',
  start: 0,
  end: 5,
  controllerName: 'video',
  ...overrides,
});

export const createMockAction = (overrides: Partial<IEditorAction> = {}): IEditorAction => ({
  id: 'test-action-1',
  name: 'Test Action',
  start: 0,
  end: 5,
  width: 1920,
  height: 1080,
  z: 0,
  fit: 'none' as Fit,
  blendMode: 'normal' as BlendMode,
  ...overrides,
});

export const createMockTrack = (overrides: Partial<IEditorTrack> = {}): IEditorTrack => ({
  id: 'test-track-1',
  name: 'Test Track',
  actions: [createMockAction()],
  controller: { id: 'video', name: 'Video' },
  controllerName: 'video',
  blendMode: 'normal' as BlendMode,
  fit: 'none' as Fit,
  hidden: false,
  ...overrides,
});

export const createMockEditorFile = (overrides = {}) => ({
  id: 'test-file-1',
  name: 'Test Project',
  tracks: [createMockTrack()],
  width: 1920,
  height: 1080,
  blendMode: 'normal' as BlendMode,
  fit: 'none' as Fit,
  backgroundColor: '#000000',
  ...overrides,
});

export const createMockEditorState = (overrides = {}) => ({
  engine: createMockEngine(),
  file: createMockEditorFile(),
  settings: { selectedTrackIndex: -1, selectedActionIndex: -1 },
  flags: { detailMode: false, detailOpen: false },
  selected: null,
  selectedTrack: null,
  selectedAction: null,
  ...overrides,
});
```

---

## 6. Coverage Targets

For **medium priority**, target practical coverage focusing on high-impact modules.

| Category | Target | Rationale |
|----------|--------|-----------|
| WasmPreview/types helpers | 100% lines | Pure functions, small module, trivial to cover |
| initEditorAction | 100% lines | Pure function, ~20 lines |
| EditorEngine.parseCoord | 100% branches | Pure static method, critical for positioning |
| EditorReducer | 90% branches | State management core — bugs cascade everywhere |
| EditorState helpers | 95% lines | Pure functions |
| CompositorController | 85% lines | Layer management core for WASM integration |
| VideoController lifecycle | 70% lines | DOM-heavy, focus on enter/update/leave/getDrawData |
| AudioController lifecycle | 70% lines | Howler integration points |
| EditorEngine | 65% lines | Mix of pure logic and browser API interaction |
| EditorFile | 60% lines | Heavy I/O (IndexedDB, fetch), mock-intensive |
| React components | 50% lines | Focus on critical user interactions |
| Plugin hooks | 50% lines | Dependent on `describeEditor` infrastructure |
| **Overall package** | **65% lines** | Appropriate for medium priority; increase to 80% as package stabilizes |

---

## 7. Implementation Order

### Phase 1 — Quick Wins (no infrastructure needed, ~4 hours)

Tests for pure functions that require no DOM, no React rendering, and no complex mocks.

1. **`src/WasmPreview/types.test.ts`** — `createDefaultTransform`, `createDefaultLayer`, keyframe helpers. ~15 test cases.
2. **`src/EditorAction/EditorAction.test.ts`** — `initEditorAction` default values and preservation. ~8 test cases.
3. **`src/EditorEngine/EditorEngine.parseCoord.test.ts`** — Static method `parseCoord` with all input formats. ~10 test cases.
4. **`src/EditorProvider/EditorState.test.ts`** — `refreshActionState`, `refreshTrackState`, `getActionSelectionData`. ~12 test cases.
5. **`src/EditorProvider/EditorReducer.test.ts`** — All 20+ reducer action types with mock state. ~30 test cases.

### Phase 2 — Controller Unit Tests (~5 hours)

6. **`src/Controllers/CompositorController.test.ts`** — Layer management, type inference, render lifecycle. Needs WASM renderer mock only. ~25 test cases.
7. **`src/Controllers/VideoController.test.ts`** — getDrawData fit calculations (pure logic), lifecycle with DOM mocks. ~30 test cases.
8. **`src/Controllers/AudioController.test.ts`** — Howl lifecycle. ~15 test cases.

### Phase 3 — Fix Existing Tests (~3 hours)

9. **Fix `src/EditorFile/EditorFile.test.tsx`** — Uncomment `createBlob` or implement alternative path. Add `fake-indexeddb` for preload tests.
10. **Create `test/utils/editor-view/describeEditor.tsx`** — Follow `describeFileExplorer` pattern. Unblocks items 11-13.
11. **Fix `src/internals/useEditor/useEditor.test.tsx`** — Should pass once `describeEditor` exists.
12. **Fix `src/internals/plugins/useEditorKeyboard/useEditorKeyboard.test.tsx`** — Already comprehensive; just needs infrastructure.
13. **Fix `src/internals/plugins/useEditorMetadata/useEditorMetadata.test.tsx`** — Selection model tests.

### Phase 4 — EditorEngine & EditorFile Tests (~4 hours)

14. **`src/EditorEngine/EditorEngine.test.ts`** — setTime flow, WASM init/fallback, record flow, viewer setter. Needs Canvas + rAF mocks. ~35 test cases.
15. **`src/EditorFile/EditorFile.test.ts`** — Constructor defaults, data getter, preload with IndexedDB mock, cleanup. ~20 test cases.

### Phase 5 — Component Tests (~3 hours)

16. **`src/EditorControls/EditorControls.test.tsx`** — Transport buttons, rate selector, time display.
17. **`src/Editor/Editor.test.tsx`** — Grid layout, file loading, flag initialization.
18. **`src/DetailView/DetailView.test.tsx`** — Form rendering with react-hook-form/yup validation.

---

## 8. Known Bugs to Test-Document

Write tests asserting the correct behavior **after** these bugs are fixed. Until fixed, mark tests with a comment.

| Bug | Location | Severity | Test Strategy |
|-----|----------|----------|---------------|
| `process.exit(333)` in destroy | `src/Controllers/VideoController.ts:475` | **Critical** — crashes Node process in tests | Write test verifying `destroy()` only removes elements + clears cache. Currently blocks any test that calls `destroy()`. |
| `alert('3')` in production code | `src/Editor/Editor.tsx` | **High** — fires on every file change | Test that file change does not trigger `window.alert` |
| `throw new Error('createNewImage')` | `src/Controllers/ImageController.ts` | **Medium** — image creation non-functional | Document in test as expected failure; write test for correct behavior |
| `eval()` in parseCoord | `src/EditorEngine/EditorEngine.ts:407` | **Medium** — injection risk | Test with adversarial inputs to document behavior |
| `describeEditor` utility missing | `test/utils/editor-view/` | **Blocker** — 3 test suites (80+ tests) broken | Phase 3 creates this infrastructure |
| `EditorFile.test.tsx` createBlob commented | `src/EditorFile/EditorFile.test.tsx:15` | **Medium** — test always fails | Uncomment or implement alternative serialization |
| `hasAudio` using deprecated APIs | `src/Controllers/VideoController.ts:68` | **Low** — `mozHasAudio`, `webkitAudioDecodedByteCount` are non-standard | Document in test expectations |

---

## 9. Dev Dependencies to Add

```json
{
  "devDependencies": {
    "fake-indexeddb": "^6.0.0"
  }
}
```

All other dependencies (`chai`, `sinon`, `@testing-library/react`, `@stoked-ui/internal-test-utils`) are already available via the monorepo root or existing dev dependencies.

---

## 10. Running Tests

```bash
# All editor tests (from monorepo root)
pnpm test:unit -- --grep 'sui-editor'

# Specific test file
cross-env NODE_ENV=test mocha 'packages/sui-editor/src/WasmPreview/types.test.ts'

# With coverage
pnpm test:coverage -- --grep 'sui-editor'

# Type checking (already configured)
cd packages/sui-editor && pnpm typescript
```

---

## 11. Specific First Tests to Implement

### Immediate: `src/WasmPreview/types.test.ts`

This file provides the fastest path to working tests with maximum confidence gain:

```typescript
import { expect } from 'chai';
import {
  createDefaultTransform,
  createDefaultLayer,
  createLinearKeyframe,
  createEaseInOutKeyframe,
  createCubicBezierKeyframe,
  createStepsKeyframe,
} from './types';

describe('WasmPreview types helpers', () => {
  describe('createDefaultTransform', () => {
    it('should return identity transform', () => {
      const t = createDefaultTransform();
      expect(t.x).to.equal(0);
      expect(t.y).to.equal(0);
      expect(t.scaleX).to.equal(1);
      expect(t.scaleY).to.equal(1);
      expect(t.rotation).to.equal(0);
      expect(t.opacity).to.equal(1);
      expect(t.anchorX).to.equal(0.5);
      expect(t.anchorY).to.equal(0.5);
      expect(t.skewX).to.equal(0);
      expect(t.skewY).to.equal(0);
    });
  });

  describe('createDefaultLayer', () => {
    it('should create solidColor layer with white content', () => {
      const layer = createDefaultLayer('solidColor', 'test-id');
      expect(layer.type).to.equal('solidColor');
      expect(layer.id).to.equal('test-id');
      expect(layer.content).to.deep.equal({ type: 'solidColor', color: [255, 255, 255, 255] });
      expect(layer.blendMode).to.equal('normal');
      expect(layer.visible).to.equal(true);
      expect(layer.zIndex).to.equal(0);
    });

    it('should create video layer with empty elementId', () => {
      const layer = createDefaultLayer('video');
      expect(layer.content).to.deep.equal({ type: 'video', elementId: '' });
    });

    it('should create text layer with defaults', () => {
      const layer = createDefaultLayer('text');
      expect(layer.content.type).to.equal('text');
      expect((layer.content as any).fontFamily).to.equal('system-ui');
      expect((layer.content as any).fontSize).to.equal(16);
    });

    it('should auto-generate id when omitted', () => {
      const layer = createDefaultLayer('image');
      expect(layer.id).to.be.a('string').with.length.greaterThan(0);
    });
  });

  describe('createLinearKeyframe', () => {
    it('should create keyframe with linear easing', () => {
      const kf = createLinearKeyframe(1000, 42);
      expect(kf.timeMs).to.equal(1000);
      expect(kf.value).to.equal(42);
      expect(kf.easing).to.equal('linear');
    });
  });

  describe('createCubicBezierKeyframe', () => {
    it('should store all control points', () => {
      const kf = createCubicBezierKeyframe(500, 1.5, 0.25, 0.1, 0.25, 1.0);
      expect(kf.cubicBezierParams).to.deep.equal([0.25, 0.1, 0.25, 1.0]);
    });
  });

  describe('createStepsKeyframe', () => {
    it('should default stepPosition to end', () => {
      const kf = createStepsKeyframe(100, 5, 3);
      expect(kf.stepPosition).to.equal('end');
    });

    it('should accept explicit stepPosition', () => {
      const kf = createStepsKeyframe(100, 5, 3, 'start');
      expect(kf.stepPosition).to.equal('start');
    });
  });
});
```

### Immediate: `src/EditorAction/EditorAction.test.ts`

```typescript
import { expect } from 'chai';
import { initEditorAction } from './EditorAction';

describe('initEditorAction', () => {
  it('should set z to trackIndex when not present', () => {
    const result = initEditorAction({ id: 'a1', name: 'test', start: 0, end: 5 }, 3);
    expect(result.z).to.equal(3);
  });

  it('should default width to 1920', () => {
    const result = initEditorAction({ id: 'a1', name: 'test', start: 0, end: 5 }, 0);
    expect(result.width).to.equal(1920);
  });

  it('should default height to 1080', () => {
    const result = initEditorAction({ id: 'a1', name: 'test', start: 0, end: 5 }, 0);
    expect(result.height).to.equal(1080);
  });

  it('should default fit to none', () => {
    const result = initEditorAction({ id: 'a1', name: 'test', start: 0, end: 5 }, 0);
    expect(result.fit).to.equal('none');
  });

  it('should preserve existing values', () => {
    const result = initEditorAction(
      { id: 'a1', name: 'test', start: 0, end: 5, z: 7, width: 800, height: 600, fit: 'cover' },
      0
    );
    expect(result.z).to.equal(7);
    expect(result.width).to.equal(800);
    expect(result.height).to.equal(600);
    expect(result.fit).to.equal('cover');
  });
});
```
