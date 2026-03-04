# SC_TEST — @stoked-ui/timeline Testing Strategy

**Package:** `@stoked-ui/timeline`
**Priority:** Medium
**Current Coverage:** Near zero (1 spec file: `themeAugmentation.spec.ts` — type check only)
**LOC (src):** ~4,500 across 100+ files
**Internal Deps:** `@stoked-ui/common`, `@stoked-ui/media`, `@stoked-ui/file-explorer`

---

## 1. Test Framework & Tooling

### Framework: Jest + ts-jest (matching monorepo convention)

The monorepo uses Jest in `sui-media` (with a vitest shim for imports). Adopt the same stack.

**Required devDependencies:**
```
@testing-library/jest-dom
@testing-library/react
@types/jest
jest
ts-jest
identity-obj-proxy
```

**`jest.config.js`** — Based on `packages/sui-media/jest.config.js`:
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: 'commonjs',
        moduleResolution: 'node',
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterSetup: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
    '!src/**/*.types.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(sorted-btree)/)',
  ],
};
```

**`package.json` script additions:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 2. Test File Organization

```
src/
├── __tests__/
│   ├── setup.ts                                 # Jest setup (DOM mocks, RAF mock)
│   └── fixtures/
│       ├── actions.ts                           # ITimelineAction factory
│       ├── tracks.ts                            # ITimelineTrack factory
│       ├── controllers.ts                       # Mock IController implementations
│       └── engine.ts                            # Engine factory with defaults
│
├── Engine/
│   └── __tests__/
│       ├── Engine.state.test.ts                 # State machine transitions
│       ├── Engine.timing.test.ts                # Time calculations, tick logic
│       ├── Engine.actions.test.ts               # Action enter/leave/update lifecycle
│       ├── Engine.events.test.ts                # Event emission & handler wiring
│       └── emitter.test.ts                      # Emitter on/off/trigger/bind
│
├── utils/
│   └── __tests__/
│       └── deal_data.test.ts                    # Pure function conversions
│
├── Controller/
│   └── __tests__/
│       ├── Controller.test.ts                   # Base class behavior
│       └── Controller.volume.test.ts            # getVolumeUpdate, getVol, getActionTime
│
├── TimelineFile/
│   └── __tests__/
│       ├── TimelineFile.test.ts                 # Static methods & constructor logic
│       └── Commands/
│           ├── RemoveActionCommand.test.ts       # Execute & undo
│           └── RemoveTrackCommand.test.ts        # Execute & undo
│
├── TimelineProvider/
│   └── __tests__/
│       └── TimelineProviderFunctions.test.ts    # setCursor, fitScaleData, height calcs, dim logic
│
└── themeAugmentation/
    └── themeAugmentation.spec.ts                # (existing) Type checks
```

**Naming convention:** `<Module>.test.ts` for unit tests, `<Module>.integration.test.ts` for integration tests. Colocated in `__tests__/` directories beside the source.

---

## 3. What to Test — Critical Paths

### Tier 1: Critical (implement first)

Pure logic modules with zero React dependency — easiest to test, highest value.

#### 3.1 Time/Pixel Conversion Utilities (`src/utils/deal_data.ts`)

Pure functions — simplest and most deterministic tests. These underpin all rendering math.

| Test Case | Description |
|-----------|-------------|
| **parserTimeToPixel: time=0** | Returns `startLeft` (default 7) |
| **parserTimeToPixel: time=scale** | Returns `startLeft + scaleWidth` |
| **parserTimeToPixel: fractional** | `time=0.5, scale=1, scaleWidth=100` → `57` |
| **parserPixelToTime** | Inverse of `parserTimeToPixel` |
| **Roundtrip** | `parserPixelToTime(parserTimeToPixel(t, p), p) === t` for any `t` |
| **parserTransformToTime** | Converts `{left, width}` to `{start, end}` |
| **parserTimeToTransform** | Converts `{start, end}` to `{left, width}` |
| **Transform roundtrip** | Bidirectional consistency |
| **getScaleCountByRows** | Returns `ceil(maxEnd / scale) + 2` |
| **getScaleCountByRows: empty tracks** | Returns `2` for empty or no tracks |
| **getScaleCountByPixel** | Returns `max(ceil((data - startLeft) / scaleWidth) + ADD_SCALE_COUNT, scaleCount)` |
| **parserActionsToPositions** | Returns flat array of alternating start/end pixel positions |

```typescript
// Example: deal_data.test.ts
import {
  parserTimeToPixel, parserPixelToTime,
  parserTransformToTime, parserTimeToTransform,
  getScaleCountByRows, parserActionsToPositions,
} from '../deal_data';

const params = { startLeft: 7, scale: 1, scaleWidth: 100 };

describe('parserTimeToPixel', () => {
  it('converts time 0 to startLeft', () => {
    expect(parserTimeToPixel(0, params)).toBe(7);
  });

  it('converts time=scale to startLeft+scaleWidth', () => {
    expect(parserTimeToPixel(1, params)).toBe(107);
  });

  it('handles fractional times', () => {
    expect(parserTimeToPixel(0.5, params)).toBe(57);
  });
});

describe('roundtrip', () => {
  it.each([0, 0.5, 1, 2.5, 10])('time %s survives roundtrip', (time) => {
    const pixel = parserTimeToPixel(time, params);
    expect(parserPixelToTime(pixel, params)).toBeCloseTo(time);
  });
});
```

#### 3.2 Emitter (`src/Engine/emitter.ts`)

Event system used by the entire engine — 64 LOC, must be reliable.

| Test Case | Description |
|-----------|-------------|
| **on / trigger** | Registered handler receives correct payload |
| **on: multiple handlers** | All handlers fire in registration order |
| **trigger: returns false** | Returns `false` if any handler returns `false` |
| **trigger: returns true** | Returns `true` when all handlers return truthy/void |
| **off: specific handler** | Removes only the specified handler |
| **off: no handler arg** | Clears all handlers for the event |
| **offAll** | Clears all handlers for all events |
| **on: unknown event** | Throws `'The event X does not exist'` |
| **trigger: unknown event** | Throws `'The event X cannot be triggered'` |
| **bind** | Creates a new event name |
| **bind: duplicate** | Throws `'The event X is already bound'` |
| **exist** | Returns `true` for registered events, `false` otherwise |
| **on: array of names** | Registers handler for multiple events at once |

#### 3.3 Engine State Machine (`src/Engine/Engine.ts`)

The engine is the central piece of the package — 666 LOC managing playback state, action lifecycle, and timing.

| Test Case | Description |
|-----------|-------------|
| **Constructor: no controllers** | Throws `'Error: No controllers set!'` |
| **Constructor: with controllers** | Initializes with `LOADING` state |
| **setTracks: LOADING→READY** | Transitions state to `READY` |
| **setTracks: already READY** | Stays `READY`, re-processes data |
| **play: READY→PLAYING** | Returns `true`, state becomes `PLAYING` |
| **play: while PLAYING** | Returns `false`, state unchanged |
| **play: PAUSED→PLAYING** | Returns `true` on resume |
| **pause: PLAYING→PAUSED** | State becomes `PAUSED` |
| **pause: not playing** | Cancels RAF but doesn't change state |
| **setTime: manual** | Fires `beforeSetTime` + `afterSetTime`, updates `_currentTime` |
| **setTime: tick** | Fires `setTimeByTick` only (not before/after) |
| **setTime: blocked** | Returns `false` when `beforeSetTime` handler returns `false` |
| **setPlayRate** | Updates rate, fires `beforeSetPlayRate` + `afterSetPlayRate` |
| **setPlayRate: blocked** | Returns `false` when handler returns `false` |
| **duration: CANVAS mode** | Returns max action `end` across all actions |
| **duration: TRACK_FILE mode** | Returns `media.duration` |
| **canvasDuration: no actions** | Returns `0` |
| **isPlaying/isPaused/isReady/isLoading** | Correct for each state |
| **rewind** | Sets negative play rate, calls `run()` |
| **rewind: at boundary** | Does not decrease below `-10` |
| **fastForward** | Sets >1 play rate, calls `run()` |
| **fastForward: at boundary** | Does not increase above `10` |
| **getAction** | Returns `{ action, track }` for valid ID |
| **getSelectedActions** | Returns only actions with `selected === true` |
| **setScrollLeft** | Triggers `setScrollLeft` event |
| **reRender: while playing** | Returns early (no-op) |
| **reRender: while paused** | Calls `tickAction` |

```typescript
// Example: Engine.state.test.ts
import Engine from '../Engine';
import { Events } from '../events';
import { EngineState } from '../Engine.types';

const mockController = {
  id: 'test', logging: false, color: '#fff', colorSecondary: '#000',
  start: jest.fn(), stop: jest.fn(),
  enter: jest.fn(), leave: jest.fn(),
  update: jest.fn(), preload: jest.fn(),
  getItem: jest.fn(),
};

describe('Engine state machine', () => {
  let engine: Engine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new Engine({ controllers: { test: mockController } });
  });

  it('starts in LOADING state', () => {
    expect(engine.state).toBe(EngineState.LOADING);
  });

  it('throws without controllers', () => {
    expect(() => new Engine({} as any)).toThrow('No controllers set');
  });

  it('transitions to READY on setTracks', () => {
    engine.setTracks([{
      id: 't1', name: 'Track 1', controller: mockController,
      actions: [{ id: 'a1', name: 'Act 1', start: 0, end: 5 }],
    }] as any);
    expect(engine.state).toBe(EngineState.READY);
  });
});
```

#### 3.4 Command Pattern (`src/TimelineFile/Commands/`)

##### RemoveActionCommand (`RemoveActionCommand.ts`)

| Test Case | Description |
|-----------|-------------|
| **execute** | Removes action from track's actions array |
| **execute: stores state** | `removedAction` and `removedActionIndex` preserved |
| **execute: missing ID** | Does not throw, logs warning |
| **undo** | Restores action at original index |
| **undo: without execute** | Logs warning, no crash |
| **execute→undo roundtrip** | Track actions identical before/after |
| **multi-track: correct track** | Only removes from the track containing the action |

##### RemoveTrackCommand (`RemoveTrackCommand.ts`)

| Test Case | Description |
|-----------|-------------|
| **execute** | Removes track from `timelineFile.tracks` |
| **execute: stores index** | `removedTrackIndex` stored correctly |
| **execute: missing ID** | Does not throw |
| **undo** | Restores track at original index |
| **roundtrip** | `tracks` array identical after execute → undo |

**Known Bug:** In `RemoveActionCommand.execute()`, `this.trackIndex = index` stores the *action* index within a track, not the *track* index across tracks. If the target action is in the second track, `undo()` will splice into the wrong track. Tests must exercise multi-track scenarios to catch this.

```typescript
// Example: RemoveActionCommand.test.ts
import { RemoveActionCommand } from '../RemoveActionCommand';

describe('RemoveActionCommand', () => {
  const makeFile = () => ({
    tracks: [
      {
        id: 't1', name: 'Track 1',
        actions: [
          { id: 'a1', name: 'Action 1', start: 0, end: 2 },
          { id: 'a2', name: 'Action 2', start: 3, end: 5 },
        ],
      },
      {
        id: 't2', name: 'Track 2',
        actions: [{ id: 'a3', name: 'Action 3', start: 0, end: 4 }],
      },
    ],
  });

  it('removes the action by ID', () => {
    const file = makeFile();
    const cmd = new RemoveActionCommand(file as any, 'a1');
    cmd.execute();
    expect(file.tracks[0].actions).toHaveLength(1);
    expect(file.tracks[0].actions[0].id).toBe('a2');
  });

  it('restores the action on undo at original index', () => {
    const file = makeFile();
    const cmd = new RemoveActionCommand(file as any, 'a1');
    cmd.execute();
    cmd.undo();
    expect(file.tracks[0].actions).toHaveLength(2);
    expect(file.tracks[0].actions[0].id).toBe('a1');
  });

  it('does not crash when action ID does not exist', () => {
    const file = makeFile();
    const cmd = new RemoveActionCommand(file as any, 'nonexistent');
    expect(() => cmd.execute()).not.toThrow();
  });
});
```

### Tier 2: High Priority

#### 3.5 Controller Static Methods (`src/Controller/Controller.ts`)

| Test Case | Description |
|-----------|-------------|
| **getVol** | Parses tuple `[volume, start?, end?]` → `{ volume, start, end }` |
| **getVol: only volume** | Returns `{ volume: 0.8, start: undefined, end: undefined }` |
| **getActionTime: no duration** | Returns `trimStart` or `0` |
| **getActionTime: with duration** | Returns `(time - start + trimStart) % duration` |
| **getActionTime: wrapping** | Correctly wraps via modulo for looping clips |
| **getVolumeUpdate: volumeIndex=-2** | Returns `undefined` (no volume data) |
| **getVolumeUpdate: active section expired** | Returns `{ volume: 1.0, volumeIndex: -1 }` |
| **getVolumeUpdate: finds new section** | Returns matching `{ volume, volumeIndex }` |
| **getVolumeUpdate: no match** | Returns `undefined` |
| **getVolumeUpdate: volumeIndex=-1 with overlapping ranges** | Returns first matching section |

```typescript
// Example: Controller.volume.test.ts
import Controller from '../Controller';

describe('Controller.getVol', () => {
  it('parses full volume tuple', () => {
    expect(Controller.getVol([0.5, 2, 8])).toEqual({ volume: 0.5, start: 2, end: 8 });
  });

  it('handles volume-only tuple', () => {
    expect(Controller.getVol([0.8])).toEqual({ volume: 0.8, start: undefined, end: undefined });
  });
});

describe('Controller.getActionTime', () => {
  it('returns trimStart when no duration', () => {
    const params = { action: { trimStart: 1.5, duration: undefined, start: 0 }, time: 5 } as any;
    expect(Controller.getActionTime(params)).toBe(1.5);
  });

  it('computes modular time with duration', () => {
    const params = { action: { start: 2, trimStart: 0, duration: 3 }, time: 7 } as any;
    // (7 - 2 + 0) % 3 = 5 % 3 = 2
    expect(Controller.getActionTime(params)).toBe(2);
  });
});

describe('Controller.getVolumeUpdate', () => {
  it('returns undefined for volumeIndex -2', () => {
    const params = { action: { volumeIndex: -2, volume: [[0.5, 0, 10]] } } as any;
    expect(Controller.getVolumeUpdate(params, 5)).toBeUndefined();
  });

  it('detects when current volume section has expired', () => {
    const params = { action: { volumeIndex: 0, volume: [[0.5, 0, 3]] } } as any;
    const result = Controller.getVolumeUpdate(params, 5);
    expect(result).toEqual({ volume: 1.0, volumeIndex: -1 });
  });
});
```

#### 3.6 Engine Action Lifecycle (`src/Engine/Engine.ts`: `_dealEnter`, `_dealLeave`, `_dealData`, `_dealClear`)

| Test Case | Description |
|-----------|-------------|
| **_dealData: sorts by start** | Actions sorted ascending by `start` time |
| **_dealData: builds actionMap** | All actions indexed by ID |
| **_dealData: builds actionTrackMap** | Each action ID maps to its parent track |
| **_dealData: multi-track** | Handles multiple tracks with interleaved action times |
| **_dealEnter: at time=0** | Enters actions with `start <= 0 < end` |
| **_dealEnter: skips disabled** | `action.disabled === true` actions not entered |
| **_dealEnter: skips dimmed tracks** | Actions on `track.dim === true` tracks not entered |
| **_dealEnter: calls controller.enter** | Controller `enter()` called with `{action, track, time, engine}` |
| **_dealLeave: time past end** | Removes actions where `action.end < time` |
| **_dealLeave: time before start** | Removes actions where `action.start > time` |
| **_dealLeave: calls controller.leave** | Controller `leave()` called on exit |
| **_dealClear** | Empties all active IDs, calls `leave` on each, resets `_next` |

#### 3.7 TimelineProviderFunctions (`src/TimelineProvider/TimelineProviderFunctions.ts`)

These are exported utility functions used throughout the UI. Testing them in isolation (with mock state) is high-value.

| Test Case | Description |
|-----------|-------------|
| **getHeightScaleData** | Computes `shrinkScale`, `growScale`, `growContainerScale`, `growUnselectedScale` from state |
| **getTrackHeight: no detailMode** | Returns `settings.trackHeight` |
| **getTrackHeight: detailMode, selected** | Returns `scaleData.growScale` |
| **getTrackHeight: detailMode, unselected** | Returns `scaleData.growUnselectedScale` |
| **getActionHeight: no detailMode, selected** | Returns `settings.trackHeight` |
| **getActionHeight: no detailMode, unselected** | Returns `scaleData.shrinkScale` |
| **getActionHeight: detailMode, selected** | Returns `scaleData.growScale` |
| **refreshActionState: disabled action** | Sets `dim = true` |
| **refreshActionState: detailMode, different action selected** | Sets `dim = true` |
| **refreshActionState: detailMode, same action selected** | Sets `dim = false` |
| **refreshActionState: detailMode, same track selected, no action selected** | Sets `dim = false` |
| **refreshTrackState: detailMode, different track selected** | Sets `dim = true` |
| **refreshTrackState: detailMode, same track selected** | Sets `dim = false` |
| **refreshTrackState: no detailMode** | Sets `dim = false` regardless |
| **setScaleCount** | Clamps value between `minScaleCount` and `maxScaleCount` |

```typescript
// Example: TimelineProviderFunctions.test.ts
import { getHeightScaleData, getTrackHeight, refreshActionState, refreshTrackState } from '../TimelineProviderFunctions';

describe('getTrackHeight', () => {
  const mockState = (detailMode: boolean, selectedTrackId?: string) => ({
    flags: { detailMode },
    selectedTrack: selectedTrackId ? { id: selectedTrackId } : null,
    settings: {
      trackHeight: 36,
      shrinkScalar: 0.3,
      growScalar: 0.5,
      getHeightScaleData: (s: any) => getHeightScaleData(s),
    },
    file: { tracks: [{ id: 't1' }, { id: 't2' }, { id: 't3' }] },
  });

  it('returns trackHeight when not in detailMode', () => {
    const state = mockState(false) as any;
    expect(getTrackHeight({ id: 't1' } as any, state)).toBe(36);
  });

  it('returns growScale for selected track in detailMode', () => {
    const state = mockState(true, 't1') as any;
    const height = getTrackHeight({ id: 't1' } as any, state);
    expect(height).toBeGreaterThan(36);
  });

  it('returns growUnselectedScale for unselected track in detailMode', () => {
    const state = mockState(true, 't1') as any;
    const height = getTrackHeight({ id: 't2' } as any, state);
    expect(height).toBeLessThan(36);
  });
});

describe('refreshActionState (dim logic)', () => {
  it('dims a disabled action', () => {
    const action = { id: 'a1', disabled: true } as any;
    const track = { id: 't1', dim: false } as any;
    const state = { flags: { detailMode: false }, selectedTrack: null, selectedAction: null } as any;
    refreshActionState(action, track, state);
    expect(action.dim).toBe(true);
  });

  it('dims action on a dimmed track', () => {
    const action = { id: 'a1', disabled: false } as any;
    const track = { id: 't1', dim: true } as any;
    const state = { flags: { detailMode: false }, selectedTrack: null, selectedAction: null } as any;
    refreshActionState(action, track, state);
    expect(action.dim).toBe(true);
  });

  it('does not dim action outside detailMode', () => {
    const action = { id: 'a1', disabled: false } as any;
    const track = { id: 't1', dim: false } as any;
    const state = { flags: { detailMode: false }, selectedTrack: null, selectedAction: null } as any;
    refreshActionState(action, track, state);
    expect(action.dim).toBe(false);
  });
});
```

#### 3.8 TimelineFile Static Methods (`src/TimelineFile/TimelineFile.ts`)

| Test Case | Description |
|-----------|-------------|
| **getName: explicit name** | Returns `props.name` |
| **getName: from tracks** | Returns first track's name when no explicit name |
| **getName: fallback** | Returns `'new video'` when no name or tracks |
| **newTrack** | Returns array with single track `{ id: 'newTrack', ... }` |
| **getTrackColor: muted** | Returns composite of controller color + red overlay |
| **getTrackColor: unmuted with controller** | Returns alpha'd controller color |
| **getTrackColor: no controller** | Returns `'#00000011'` |
| **collapsedTrack: empty** | Returns `{ actionTrackMap: {}, track: { id: 'collapsedTrack', actions: [] } }` |
| **collapsedTrack: flattens** | All actions from all tracks merged into single actions array |
| **collapsedTrack: actionTrackMap** | Each action ID maps to its original track |
| **tracks setter: filters newTrack** | Setting tracks filters out `id === 'newTrack'` |
| **data getter** | Returns serializable data with `controllerName` and `fileId` instead of object refs |

### Tier 3: Medium Priority

#### 3.9 Engine Tick Logic (`src/Engine/Engine.ts`: `_tick`)

Requires mocking `requestAnimationFrame`. Use a manual RAF mock.

| Test Case | Description |
|-----------|-------------|
| **_tick: advances time** | `time` increases by `(now - prev) / 1000 * playRate` |
| **_tick: 2x playRate** | Time advances at double speed |
| **_tick: negative playRate** | Time decreases (rewind) |
| **_tick: auto-end** | Calls `_end()` when all actions complete and `_activeIds` empty |
| **_tick: toTime limit** | Stops at `toTime` boundary |
| **_tick: clamps delta to 1000ms** | `Math.min(1000, now - this._prev)` caps single frame |
| **_tick: exits on PAUSED** | No further RAF scheduled |
| **_tick: exits on LOADING** | Returns immediately |
| **_tick: forwards past canvasDuration** | Triggers `_end()` |
| **_tick: rewind past time=0** | Triggers `_end()` |

```typescript
// RAF mock for setup.ts
let rafId = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();
global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
  rafId += 1;
  rafCallbacks.set(rafId, cb);
  return rafId;
});
global.cancelAnimationFrame = jest.fn((id: number) => {
  rafCallbacks.delete(id);
});

// Helper to advance one frame
export function advanceFrame(time: number) {
  const entries = [...rafCallbacks.entries()];
  rafCallbacks.clear();
  entries.forEach(([, cb]) => cb(time));
}
```

#### 3.10 Engine Integration Tests

Full play-through scenarios combining multiple subsystems.

| Test Case | Description |
|-----------|-------------|
| **Full playback cycle** | `setTracks` → `play` → tick frames → auto-end → `ended` event |
| **Pause and resume** | `play` → frames → `pause` → `play` → frames → end |
| **Seek during pause** | `setTime` while paused updates position correctly |
| **Speed change during play** | `setPlayRate` mid-playback changes advancement rate |
| **Multi-track lifecycle** | Multiple tracks with overlapping actions trigger correct enter/leave calls |
| **Controller callbacks called in order** | `enter` → `update` (n times) → `leave` for each action |

---

## 4. Mock/Stub Strategy

### 4.1 Mock Controllers

```typescript
// src/__tests__/fixtures/controllers.ts
export function createMockController(overrides = {}) {
  return {
    id: 'mock',
    name: 'Mock Controller',
    color: '#666',
    colorSecondary: '#999',
    logging: false,
    start: jest.fn(),
    stop: jest.fn(),
    enter: jest.fn(),
    leave: jest.fn(),
    update: jest.fn(),
    preload: jest.fn().mockResolvedValue({}),
    getItem: jest.fn(),
    isValid: jest.fn().mockReturnValue(true),
    destroy: jest.fn(),
    getActionStyle: jest.fn().mockReturnValue(null),
    ...overrides,
  };
}
```

### 4.2 Mock Actions & Tracks

```typescript
// src/__tests__/fixtures/actions.ts
import { ITimelineAction } from '../../TimelineAction/TimelineAction.types';

let actionCounter = 0;
export function createAction(overrides: Partial<ITimelineAction> = {}): ITimelineAction {
  actionCounter += 1;
  return {
    id: `action-${actionCounter}`,
    name: `Action ${actionCounter}`,
    start: 0,
    end: 5,
    selected: false,
    disabled: false,
    volumeIndex: -2,
    ...overrides,
  } as ITimelineAction;
}

// Reset counter between tests
export function resetActionCounter() { actionCounter = 0; }

// src/__tests__/fixtures/tracks.ts
import { ITimelineTrack } from '../../TimelineTrack/TimelineTrack.types';
import { createAction } from './actions';
import { createMockController } from './controllers';

let trackCounter = 0;
export function createTrack(overrides: Partial<ITimelineTrack> = {}): ITimelineTrack {
  trackCounter += 1;
  return {
    id: `track-${trackCounter}`,
    name: `Track ${trackCounter}`,
    actions: [createAction()],
    controller: createMockController(),
    dim: false,
    muted: false,
    locked: false,
    ...overrides,
  } as unknown as ITimelineTrack;
}

export function resetTrackCounter() { trackCounter = 0; }
```

### 4.3 Mock Engine Factory

```typescript
// src/__tests__/fixtures/engine.ts
import Engine from '../../Engine/Engine';
import { Events } from '../../Engine/events';
import { createMockController } from './controllers';
import { createTrack } from './tracks';

export function createEngine(options: { trackCount?: number; actions?: any[] } = {}) {
  const controller = createMockController();
  const engine = new Engine({
    controllers: { mock: controller },
    events: new Events(),
  });

  const tracks = Array.from({ length: options.trackCount ?? 1 }, (_, i) =>
    createTrack({
      controller,
      actions: options.actions ?? [{ id: `a${i}`, name: `Act ${i}`, start: i, end: i + 3 }],
    })
  );
  engine.setTracks(tracks as any);

  return { engine, controller, tracks };
}
```

### 4.4 Browser API Mocks (`src/__tests__/setup.ts`)

```typescript
import '@testing-library/jest-dom';

// Mock requestAnimationFrame
let rafId = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();
global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
  rafId += 1;
  rafCallbacks.set(rafId, cb);
  return rafId;
});
global.cancelAnimationFrame = jest.fn((id: number) => {
  rafCallbacks.delete(id);
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: jest.fn(), removeListener: jest.fn(),
    addEventListener: jest.fn(), removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class {
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock HTMLMediaElement
window.HTMLMediaElement.prototype.load = () => {};
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};
```

### 4.5 External Dependency Mock Strategy

| Dependency | Mock Strategy |
|-----------|---------------|
| `sorted-btree` | **Use real library** — pure JS, fast, deterministic |
| `interactjs` | Mock for component tests; not needed for Engine/util tests |
| `react-virtualized` | Mock `ScrollSync`, `Grid` for TrackArea tests |
| `react-device-detect` | Mock `isMobile` flag |
| `@stoked-ui/media` | Mock `MediaFile`, `AppFile`, `WebFile`, `ScreenshotQueue`, `Command` |
| `@stoked-ui/common` | Mock `namedId()` → predictable IDs; `compositeColors()` → identity |
| `@mui/material/styles` | Mock `alpha()` for `getTrackColor` tests |

---

## 5. Coverage Targets

For a **medium priority** package with complex state logic:

| Metric | Target |
|--------|--------|
| **Statements** | 60% |
| **Branches** | 55% |
| **Functions** | 65% |
| **Lines** | 60% |

### Per-module breakdown:

| Module | Target | Rationale |
|--------|--------|-----------|
| `Engine/Engine.ts` | 75% | Core playback logic, high bug risk, 666 LOC |
| `Engine/emitter.ts` | 90% | Small (64 LOC), pure, fully coverable |
| `utils/deal_data.ts` | 95% | Pure functions, rendering accuracy depends on them |
| `Controller/Controller.ts` | 70% | Static methods critical; abstract methods excluded |
| `TimelineFile/Commands/*` | 85% | Small, self-contained command pattern |
| `TimelineProvider/TimelineProviderFunctions.ts` | 70% | Pure functions extractable from React context |
| `TimelineFile/TimelineFile.ts` | 50% | Static methods testable; constructor needs heavy mocking |
| `TimelineProvider/` (reducer) | 40% | Reducer logic testable; React integration harder |
| UI components (`Timeline/`, `TimelineTrack/`, etc.) | 20% | Defer to integration/E2E tests |

---

## 6. Implementation Plan — Ordered by Priority

### Phase 1: Infrastructure + Pure Logic (implement first)

1. **Create `jest.config.js`** — Copy from `sui-media`, adjust `transformIgnorePatterns` for `sorted-btree`
2. **Create `src/__tests__/setup.ts`** — RAF mock, browser API mocks
3. **Create test fixtures** — `controllers.ts`, `actions.ts`, `tracks.ts`, `engine.ts`
4. **`src/utils/__tests__/deal_data.test.ts`** — 12 test cases (pure functions, immediate wins)
5. **`src/Engine/__tests__/emitter.test.ts`** — 13 test cases (pure event system)

### Phase 2: Engine Core

6. **`src/Engine/__tests__/Engine.state.test.ts`** — State transitions (27 cases)
7. **`src/Engine/__tests__/Engine.actions.test.ts`** — `_dealEnter`, `_dealLeave`, `_dealClear`, `_dealData` (12 cases)
8. **`src/Engine/__tests__/Engine.events.test.ts`** — Event emission during play/pause/setTime

### Phase 3: Commands, Controllers & Provider Functions

9. **`src/TimelineFile/__tests__/Commands/RemoveActionCommand.test.ts`** — 7 cases
10. **`src/TimelineFile/__tests__/Commands/RemoveTrackCommand.test.ts`** — 5 cases
11. **`src/Controller/__tests__/Controller.volume.test.ts`** — 10 cases
12. **`src/TimelineProvider/__tests__/TimelineProviderFunctions.test.ts`** — 15 cases
13. **`src/TimelineFile/__tests__/TimelineFile.test.ts`** — Static methods (12 cases)

### Phase 4: Timing & Integration

14. **`src/Engine/__tests__/Engine.timing.test.ts`** — `_tick` with mocked RAF (10 cases)
15. **`src/Engine/__tests__/Engine.integration.test.ts`** — Full playback scenarios (6 cases)

### Phase 5 (future): React Components

16. **`src/Timeline/__tests__/Timeline.test.tsx`** — Render, basic interactions
17. **`src/TimelineTrack/__tests__/TimelineTrack.test.tsx`** — Track rendering
18. **`src/Interactable/__tests__/Interactable.test.tsx`** — Drag/resize callbacks

---

## 7. Edge Cases to Cover

### Engine
- Play with zero-duration actions (`start === end`)
- Overlapping actions on the same track
- Empty tracks (no actions)
- `setTracks([])` — empty array
- Calling `play()` before `setTracks()` (while `LOADING`)
- `_tick` with very large delta (> 1000ms cap)
- Negative play rates hitting `time < 0`
- `rewind` at speed boundary (`playRate` already at `-10`)
- `fastForward` at speed boundary (`playRate` already at `10`)
- `run()` with `toTime <= currentTime` (returns false immediately)

### Utilities
- `parserTimeToPixel` with `scale = 0` (division by zero → Infinity)
- `parserPixelToTime` with `scaleWidth = 0` (division by zero)
- `getScaleCountByRows` with null/undefined tracks
- Negative time values
- Very large time values (floating point precision)

### Commands
- Execute command twice without undo
- Undo without prior execute
- Remove action from multi-action track (verify other actions untouched)
- Remove action when action ID doesn't exist in any track
- **Multi-track undo correctness** — `RemoveActionCommand` has a bug where `trackIndex` stores action index not track index

### Controller
- `getVolumeUpdate` with empty volume array
- `getVolumeUpdate` with undefined volume sections
- `getActionTime` with zero duration (modulo by zero → NaN)
- `getActionTime` with undefined `trimStart` (fallback to 0)

### TimelineProviderFunctions
- `getHeightScaleData` with only 1 track (division by zero risk in `shrinkScalar / (length - 1)`)
- `refreshActionState` with null `selectedTrack` and `selectedAction`
- `setScaleCount` clamping at both boundaries

---

## 8. Key Files Reference

| File | LOC | Test Priority | Testable Without DOM |
|------|-----|---------------|---------------------|
| `src/Engine/Engine.ts` | 666 | Critical | Yes (with RAF mock) |
| `src/Engine/emitter.ts` | 64 | Critical | Yes |
| `src/Engine/events.ts` | 89 | N/A (types + constructor) | N/A |
| `src/utils/deal_data.ts` | 119 | Critical | Yes |
| `src/Controller/Controller.ts` | 116 | High | Yes (static methods) |
| `src/TimelineFile/Commands/RemoveActionCommand.ts` | 49 | High | Yes |
| `src/TimelineFile/Commands/RemoveTrackCommand.ts` | 41 | High | Yes |
| `src/TimelineProvider/TimelineProviderFunctions.ts` | 251 | High | Partially (pure functions) |
| `src/TimelineFile/TimelineFile.ts` | 373 | Medium | Partially |
| `src/interface/const.ts` | 35 | N/A (constants) | N/A |
| `src/Timeline/Timeline.tsx` | ~400 | Low (UI) | No |
| `src/TimelineTrack/TimelineTrack.tsx` | ~300 | Low (UI) | No |
| `src/TimelineTrackArea/TimelineTrackArea.tsx` | ~300 | Low (UI) | No |

---

## 9. Bugs to Validate via Tests

Based on code review, these patterns are worth specifically targeting:

1. **`RemoveActionCommand.trackIndex` bug** (`src/TimelineFile/Commands/RemoveActionCommand.ts:28`) — `this.trackIndex = index` stores the *action's index within its track*, not the *track's index* in the tracks array. In `undo()`, it uses `this.timelineFile.tracks[this.trackIndex!]` which will splice into the wrong track for multi-track files.

2. **`_dealLeave` BTree iteration order** (`src/Engine/Engine.ts:622`) — The callback signature `(key, value)` may have reversed parameter order compared to `BTree.forEach((value, key) => ...)`. The code uses `key` as the action ID but BTree's `forEach` passes `(value, key)`. Test with multiple active actions to verify correct behavior.

3. **`_dealEnter` duplicate prevention** (`src/Engine/Engine.ts:606`) — Uses `active.indexOf(actionId)` on a snapshot array. If `_dealLeave` runs after `_dealEnter` in the same `tickAction()` call, and an action is re-entered, the snapshot won't reflect the removal.

4. **Engine `_tick` clamp** (`src/Engine/Engine.ts:469`) — `Math.min(1000, now - this._prev)` clamps at 1 second, but negative deltas (if clock goes backwards) produce `Math.min(1000, negative)` which is negative, causing time to jump backwards unexpectedly.

5. **`setTime` in MEDIA mode** (`src/Engine/Engine.ts:290`) — Accesses `this.playbackCurrentTimespans[0]` without checking if the array is non-empty. If timespans are empty, this will throw a TypeError.

6. **`getHeightScaleData` division by zero** (`src/TimelineProvider/TimelineProviderFunctions.ts:150`) — When `file?.tracks?.length ?? 2` resolves to `1`, the formula `shrinkScalar / (1 - 1)` divides by zero. The `?? 2` fallback only activates when tracks is null/undefined, not when length is 1.

---

## 10. Running Tests

```bash
# Run all tests
cd packages/sui-timeline && pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test -- --testPathPattern="Engine.state"

# Run in watch mode
pnpm test:watch

# Run a single describe block
pnpm test -- --testPathPattern="deal_data" --testNamePattern="roundtrip"
```
