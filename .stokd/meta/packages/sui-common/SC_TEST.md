# Testing Strategy: @stoked-ui/common

**Package**: `packages/sui-common`
**Priority**: Medium
**Version**: 0.1.2
**Date**: 2026-03-03

---

## 1. Current State

### Existing Infrastructure
- **Framework**: Jest 29.7 + ts-jest 29.1, jsdom environment
- **Config**: `packages/sui-common/jest.config.js`
- **Setup**: `src/__tests__/setup.ts` — imports `@testing-library/jest-dom`
- **React testing**: `@testing-library/react` 16.x
- **CSS mocking**: `identity-obj-proxy`
- **Scripts**: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`

### Existing Tests (3 files, SocialLinks only)

| File | Cases | Module |
|------|-------|--------|
| `src/SocialLinks/__tests__/platformRegistry.test.ts` | ~10 | Registry data integrity, `getPlatformByKey` lookup |
| `src/SocialLinks/__tests__/SocialLinks.test.tsx` | ~12 | Controlled/uncontrolled, rendering, disabled/readOnly |
| `src/SocialLinks/__tests__/SocialLinkField.test.tsx` | ~8 | Per-platform rendering, prefix adornments, onChange |

**All other modules (12 of 14 top-level) have zero tests.**

### Test Patterns Established
- Co-located `__tests__/` directories alongside source
- `ThemeProvider` + `createTheme()` wrapper for MUI component tests
- `jest.fn()` for callback mocking
- `data-testid` attributes for component queries
- `it.each` for parameterized tests across platform registry

---

## 2. Module Inventory & Test Priority

| Module | Type | Lines | External Deps | Test Priority |
|---|---|---|---|---|
| `FetchBackoff/FetchBackoff.ts` | Pure async logic | 56 | `global.fetch` | **P0** |
| `ProviderState/ProviderState.ts` | Pure logic + closures | 136 | None | **P0** |
| `ProviderState/Settings.ts` | Pure logic (Proxy) | 48 | None | **P0** |
| `Colors/colors.ts` | Pure math | 61 | `@mui/material/styles` color fns | **P0** |
| `Types/SortedList` (in Types.ts) | Data structure | 101 | None | **P0** |
| `Types/mergeWith.ts` | Array prototype extension | 38 | None | **P0** |
| `Ids/namedId/namedId.ts` | Pure logic | 37 | None | **P1** |
| `Ids/useIncId/useIncId.ts` | React hook | 62 | React | **P1** |
| `MimeType/IMimeType.ts` | Registry + utility | 103 | None | **P1** |
| `MimeType/StokedUiMime.ts` | Singleton factory | 34 | IMimeType | **P1** |
| `interfaces/publicity.ts` | Constants + guards | 54 | None | **P2** |
| `interfaces/embed-visibility.ts` | Constants + guards | 42 | None | **P2** |
| `UserMenu/UserMenu.tsx` | React component | 79 | MUI | **P2** |
| `useResize/useResize.tsx` | React hook | 31 | DOM/window | **P2** |
| `useResizeWindow/useResizeWindow.tsx` | React hook | 29 | DOM/window | **P2** |
| `LocalDb/LocalDb.ts` | IndexedDB class | 546 | `@tempfix/idb` | **P3** |
| `LocalDb/VideoDb.tsx` | React + IDB | 104 | IDB + React | **P3** |
| `GrokLoader/GrokLoader.tsx` | Animated component | 140 | framer-motion | **P3** |
| `MimeType/MimeType.ts` | Static data map | 1206 | None | **P3** (spot-check) |
| `Types/Types.ts:setProperty` | Utility function | 16 | None | **P2** |

---

## 3. Test File Organization

```
src/
├── __tests__/
│   ├── setup.ts                            # (existing) global setup
│   └── utils.tsx                           # NEW: shared renderWithTheme helper
├── Colors/
│   └── __tests__/
│       └── colors.test.ts
├── FetchBackoff/
│   └── __tests__/
│       └── FetchBackoff.test.ts
├── ProviderState/
│   └── __tests__/
│       ├── ProviderState.test.ts
│       └── Settings.test.ts
├── Types/
│   └── __tests__/
│       ├── SortedList.test.ts
│       └── mergeWith.test.ts
├── Ids/
│   ├── namedId/
│   │   └── __tests__/
│   │       └── namedId.test.ts
│   └── useIncId/
│       └── __tests__/
│           └── useIncId.test.tsx
├── MimeType/
│   └── __tests__/
│       ├── IMimeType.test.ts
│       ├── StokedUiMime.test.ts
│       └── MimeType.test.ts
├── interfaces/
│   └── __tests__/
│       ├── publicity.test.ts
│       └── embed-visibility.test.ts
├── SocialLinks/
│   └── __tests__/                          # (existing — 3 files, complete)
├── UserMenu/
│   └── __tests__/
│       └── UserMenu.test.tsx
├── useResize/
│   └── __tests__/
│       └── useResize.test.tsx
├── useResizeWindow/
│   └── __tests__/
│       └── useResizeWindow.test.tsx
└── LocalDb/
    └── __tests__/
        └── LocalDb.test.ts
```

**Naming**: `<ModuleName>.test.ts` for pure logic, `.test.tsx` for React components/hooks.

---

## 4. P0 Tests — Implement First

### 4.1 FetchBackoff — `src/FetchBackoff/__tests__/FetchBackoff.test.ts`

**Source**: `src/FetchBackoff/FetchBackoff.ts` — async function with exponential retry logic.

**What to test:**
```
describe('FetchBackoff')
  ✓ returns response immediately on successful first fetch
  ✓ retries on network error and succeeds on subsequent attempt
  ✓ retries up to max retries then throws "Fetch failed after maximum retries."
  ✓ retries on non-OK response when retryCondition returns true
  ✓ does not retry when retryCondition returns false for error
  ✓ applies exponential backoff delay (500ms → 1000ms → 2000ms with defaults)
  ✓ custom retryCondition stops retrying early (e.g., only retry on 503)
  ✓ default options: 3 retries, factor 2, 500ms initial delay
  ✓ passes through fetch input and init options unchanged
  ✓ retries=0 attempts once then throws on failure
  ✓ custom backoffFactor changes delay progression
  ✓ custom initialDelay starts at specified value
```

**Mock strategy:**
```typescript
const mockFetch = jest.fn();
global.fetch = mockFetch;
jest.useFakeTimers();

beforeEach(() => {
  mockFetch.mockReset();
  jest.clearAllTimers();
});
```

**Key edge case**: The while loop exits after `retries + 1` total attempts (attempt 0 through `retries`). After the loop, it throws. Verify this boundary precisely — `retries: 3` means 4 total calls to `fetch` (initial + 3 retries).

**Timing verification**: Use `jest.advanceTimersByTime()` to verify backoff progression without real delays. After each failed attempt, advance by `initialDelay * backoffFactor^attempt`.

### 4.2 ProviderState — `src/ProviderState/__tests__/ProviderState.test.ts`

**Source**: `src/ProviderState/ProviderState.ts` — `createProviderState()` factory returning flag management object.

**What to test:**
```
describe('createProviderState')
  describe('initialization')
    ✓ initializes flags from FlagData[] with default values
    ✓ flags without defaultValue default to false
    ✓ flagConfigs are stored alongside flags
    ✓ settings proxy is initialized from input

  describe('toggleFlags')
    ✓ toggles a single flag from false to true
    ✓ toggles a single flag from true to false
    ✓ toggles multiple flags at once (array input)
    ✓ fires checkTriggers with new value after toggle

  describe('enableFlags')
    ✓ sets single flag to true
    ✓ sets multiple flags to true
    ✓ enabling already-true flag stays true

  describe('disableFlags')
    ✓ sets single flag to false
    ✓ sets multiple flags to false

  describe('removeFlags')
    ✓ deletes flag and its config
    ✓ throws Error for nonexistent flag

  describe('createFlags')
    ✓ adds new flags at runtime with defaults

  describe('checkTriggers — removeTriggers')
    ✓ disables linked flags when flag is enabled (value=true)
    ✓ string trigger disables single flag
    ✓ array trigger disables multiple flags
    ✓ object trigger sets settings values

  describe('checkTriggers — addTriggers')
    ✓ enables linked flags when flag is enabled (value=true)
    ✓ object trigger sets settings values

  describe('trigger cascading')
    ✓ flag A's addTrigger enables flag B, B's removeTrigger disables C
    ✓ no triggers fire when flag is disabled (value=false)
```

**Critical bug to document**: `checkTriggers` lines 111-112 and 125-126 reference the closure variable `settings` directly (the raw input object), NOT `this.settings` (the Proxy). Object triggers bypass the Settings proxy. Tests should verify both code paths and document this behavior.

### 4.3 Settings — `src/ProviderState/__tests__/Settings.test.ts`

**Source**: `src/ProviderState/Settings.ts` — `createSettings()` returns a Proxy with dot-path access.

**What to test:**
```
describe('createSettings')
  ✓ returns object with initial data accessible
  ✓ simple get: settings['key'] returns value
  ✓ simple set: settings['key'] = value stores it
  ✓ dot-path get: settings['user.name'] resolves nested object
  ✓ dot-path get: missing intermediate returns undefined (not throw)
  ✓ dot-path set: settings['user.preferences.theme'] = 'light' creates path
  ✓ dot-path set: creates intermediate objects when missing
  ✓ deep nesting: settings['a.b.c.d.e'] resolves 5 levels
  ✓ overwrite nested value preserves sibling keys
  ✓ non-dot key acts like normal object property
  ✓ empty initial data works
```

### 4.4 Colors — `src/Colors/__tests__/colors.test.ts`

**Source**: `src/Colors/colors.ts` — `compositeColors()` and internal `parseColorWithAlpha()`.

**What to test:**
```
describe('compositeColors')
  ✓ blends hex base with rgba overlay (alpha < 1)
  ✓ hex + hex (no alpha) returns overlay as hex
  ✓ hex + rgba alpha=0 returns base color
  ✓ hex + rgba alpha=1 returns overlay color
  ✓ known value: compositeColors('#3498db', 'rgba(255, 255, 255, 0.53)') matches expected
  ✓ rgb input format works (pass-through)
  ✓ hsl input format works (via hslToRgb)
  ✓ throws 'Unsupported color format' for invalid input (e.g., 'notacolor')
  ✓ output is always a hex string
```

**Mock strategy**: Import `hexToRgb`, `hslToRgb`, `rgbToHex` from `@mui/material/styles`. If import fails in test environment, mock:
```typescript
jest.mock('@mui/material/styles', () => ({
  hexToRgb: jest.fn((hex: string) => {
    // Minimal hex-to-rgb implementation for testing
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }),
  hslToRgb: jest.fn((hsl: string) => 'rgb(128, 128, 128)'),
  rgbToHex: jest.fn((rgb: string) => {
    const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return '#000000';
    return '#' + [m[1], m[2], m[3]].map(n =>
      parseInt(n).toString(16).padStart(2, '0')
    ).join('');
  }),
}));
```

### 4.5 SortedList — `src/Types/__tests__/SortedList.test.ts`

**Source**: `src/Types/Types.ts` — `SortedList<T>` class extending `Array<T>` with binary insert.

**What to test:**
```
describe('SortedList')
  describe('constructor')
    ✓ sorts initial items with provided comparator
    ✓ empty initialization works

  describe('push')
    ✓ inserts single item in sorted position
    ✓ inserts multiple items maintaining sort
    ✓ returns new length
    ✓ undefined items are skipped

  describe('unshift')
    ✓ inserts in sorted position (NOT at start)
    ✓ returns new length

  describe('splice')
    ✓ removes elements and re-sorts after insertion
    ✓ insertion-only splice maintains sort

  describe('concat')
    ✓ returns new SortedList with all items sorted
    ✓ original list is unchanged

  describe('sort')
    ✓ ignores external comparator, uses internal
    ✓ re-sorts with internal comparator

  describe('blocked methods')
    ✓ reverse() throws Error
    ✓ copyWithin() throws Error

  describe('toArray')
    ✓ returns plain Array copy

  describe('custom comparator')
    ✓ objects sorted by property value
    ✓ descending numeric sort
```

### 4.6 mergeWith — `src/Types/__tests__/mergeWith.test.ts`

**Source**: `src/Types/mergeWith.ts` — extends `Array.prototype.mergeWith`.

**What to test:**
```
describe('Array.prototype.mergeWith')
  ✓ merges two arrays by string key, second array wins on collision
  ✓ no overlap: produces union of both arrays
  ✓ empty first array: returns second array items
  ✓ empty second array: returns first array items
  ✓ both empty: returns empty array
  ✓ filters null/undefined from first array
  ✓ non-array otherArray: returns first array filtered of falsy
  ✓ preserves Map iteration order (first array items first, then new from second)
  ✓ works with numeric merge keys
```

**Critical note**: This modifies `Array.prototype` globally on import. Import the module once at the top of the test file. Be aware this affects all arrays in the test worker.

---

## 5. P1 Tests

### 5.1 namedId — `src/Ids/namedId/__tests__/namedId.test.ts`

**Source**: `src/Ids/namedId/namedId.ts` — ID generator with random hex suffix.

```
describe('namedId')
  ✓ no args: returns 'id-<7 hex chars>'
  ✓ string arg: namedId('myname') returns 'myname-<7 hex chars>'
  ✓ object with id: uses provided id
  ✓ object with length: controls hex portion length
  ✓ object with prefix: 'pre-id-<hex>'
  ✓ object with suffix: 'id-suf-<hex>'
  ✓ prefix + suffix: 'pre-id-suf-<hex>'
  ✓ each call returns unique output (10 calls, all different)

describe('randomBytes')
  ✓ returns hex string of specified length
  ✓ length=0 returns empty string
  ✓ only contains hex characters [0-9a-f]
```

### 5.2 useIncId — `src/Ids/useIncId/__tests__/useIncId.test.tsx`

**Source**: `src/Ids/useIncId/useIncId.ts` — deterministic auto-incrementing ID hook.

Use `renderHook` from `@testing-library/react`:

```
describe('useIncId')
  ✓ string arg: returns function generating 'myid-000', 'myid-001', ...
  ✓ object arg with prefix: 'p-x-000'
  ✓ custom length: zero-padded to specified length
  ✓ .by(step) skips counter by step amount
  ✓ counter persists across calls within same component lifecycle
  ✓ default length is 3
```

### 5.3 IMimeType — `src/MimeType/__tests__/IMimeType.test.ts`

**Source**: `src/MimeType/IMimeType.ts` — `MimeRegistry` static class + `getExtension()`.

```
describe('MimeRegistry')
  ✓ create() registers in exts, names, subtypes, and types maps
  ✓ created IMimeType has correct type getter ('application/sui-editor')
  ✓ created IMimeType has correct subType, name, ext, description, embedded
  ✓ accept getter returns { fullType: ext } shape
  ✓ typeObj getter returns { type: fullType }
  ✓ multiple creates don't overwrite each other (different exts)

describe('getExtension')
  ✓ 'https://example.com/file.mp4' returns '.mp4'
  ✓ 'https://example.com/file' returns ''
  ✓ handles query strings: 'https://example.com/file.mp4?v=1' returns '.mp4'
  ✓ handles paths with dots: 'https://a.b.com/dir.name/file.txt' returns '.txt'
```

### 5.4 StokedUiMime — `src/MimeType/__tests__/StokedUiMime.test.ts`

**Source**: `src/MimeType/StokedUiMime.ts` — singleton extending `MimeRegistry`.

```
describe('SUIMime')
  ✓ getInstance() returns same instance on repeated calls
  ✓ after getInstance(), standard types registered (png, mp4, mp3 in MimeRegistry)
  ✓ make() creates mime type with 'stoked-ui' application prefix
  ✓ make() result is findable in MimeRegistry.exts
```

**Note**: `MimeRegistry` uses static state. Tests should be aware of pollution from `SUIMime.getInstance()` registering standard types. Run these tests after IMimeType tests or use `beforeAll` to reset.

---

## 6. P2 Tests

### 6.1 interfaces/publicity — `src/interfaces/__tests__/publicity.test.ts`

```
describe('publicity')
  ✓ PUBLICITY_TYPES has public, private, paid, deleted
  ✓ isAdminOnlyPublicity('deleted') returns true
  ✓ isAdminOnlyPublicity('public' | 'private' | 'paid') returns false
  ✓ isIncludedInAllFilter('public' | 'private' | 'paid') returns true
  ✓ isIncludedInAllFilter('deleted') returns false
  ✓ ADMIN_ONLY_PUBLICITY_TYPES is ['deleted']
  ✓ ALL_FILTER_PUBLICITY_TYPES is ['public', 'private', 'paid']
```

### 6.2 interfaces/embed-visibility — `src/interfaces/__tests__/embed-visibility.test.ts`

```
describe('embed-visibility')
  ✓ DEFAULT_EMBED_VISIBILITY is 'private'
  ✓ isPublicEmbedVisibility('public') returns true
  ✓ isPublicEmbedVisibility('authenticated' | 'private') returns false
  ✓ isAuthenticatedEmbedVisibility('public' | 'authenticated') returns true
  ✓ isAuthenticatedEmbedVisibility('private') returns false
```

### 6.3 UserMenu — `src/UserMenu/__tests__/UserMenu.test.tsx`

**Source**: `src/UserMenu/UserMenu.tsx` — MUI Avatar + Menu dropdown.

```
describe('UserMenu')
  ✓ renders avatar with first letter of name (no avatarUrl)
  ✓ renders avatar image when avatarUrl provided
  ✓ displays name and role
  ✓ click opens dropdown menu
  ✓ "Sign Out" menu item calls onSignOut
  ✓ menu closes after clicking Sign Out
  ✓ aria attributes are correct (aria-controls, aria-haspopup, aria-expanded)
```

Wrap with `renderWithTheme` (see section 8.1).

### 6.4 setProperty — `src/Types/__tests__/setProperty.test.ts`

**Source**: `src/Types/Types.ts:setProperty()` — `Object.defineProperty` wrapper.

```
describe('setProperty')
  ✓ defines non-writable, non-configurable, enumerable property
  ✓ property value is accessible
  ✓ property is not writable (assignment in strict mode would throw)
```

### 6.5 Hooks

**useResize** — `src/useResize/__tests__/useResize.test.tsx`:
```
describe('useResize')
  ✓ returns element dimensions when ref has current
  ✓ returns window dimensions when ref is null
  ✓ updates on window resize event
  ✓ cleans up resize listener on unmount
```

**useResizeWindow** — `src/useResizeWindow/__tests__/useResizeWindow.test.tsx`:
```
describe('useResizeWindow')
  ✓ returns [innerWidth, innerHeight]
  ✓ updates on window resize event
  ✓ returns [0, 0] when window is undefined (SSR)
```

**Known issue**: `useResizeWindow` calls `useState` conditionally after an early return (`if (typeof window === 'undefined') return [0, 0]`). This violates React's rules of hooks. Document in test comments but don't fix (out of scope for testing strategy).

---

## 7. P3 Tests (Deferred)

### 7.1 LocalDb — `src/LocalDb/__tests__/LocalDb.test.ts`

**Source**: `src/LocalDb/LocalDb.ts` — 546 lines, static class wrapping IndexedDB via `@tempfix/idb`.

Requires adding `fake-indexeddb` as devDependency (`pnpm add -D fake-indexeddb`).

**What to test when ready:**
```
describe('LocalDb')
  ✓ init() creates stores, sets initialized=true
  ✓ init() with disabled=true skips IDB, sets initialized=true
  ✓ init() is idempotent (second call is no-op)
  ✓ saveFile() stores version 1 correctly
  ✓ saveFile() appends version 2 to existing project
  ✓ loadByName() retrieves latest version when version=-1
  ✓ loadByName() retrieves specific version
  ✓ loadByName() returns null for unknown name
  ✓ loadByUrl() retrieves by indexed URL
  ✓ loadByUrl() returns null for unknown URL
  ✓ getVersions() returns sorted version list
  ✓ getKeys() returns all stored keys
  ✓ saveVideo() appends video to project version

describe('createFolder')   # Pure function, can test immediately (P1)
  ✓ creates folder with name, type='folder', mediaType='folder'
  ✓ includes children array
  ✓ uses namedId when no id option provided
  ✓ uses provided id option
  ✓ includes created timestamp
```

**Note**: `createFolder` is a pure function exported from `LocalDb.ts` (line 117). It can and should be tested immediately in Phase 1 — no IDB dependency.

### 7.2 GrokLoader — `src/GrokLoader/__tests__/GrokLoader.test.tsx`

Animated component — minimal test value. Mock framer-motion:

```typescript
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: { div: React.forwardRef((props: any, ref: any) => <div ref={ref} {...props} />) },
    useAnimationControls: () => ({ start: jest.fn(), stop: jest.fn() }),
    useMotionValue: (init: number) => ({ get: () => init, set: jest.fn() }),
    useTransform: (_: any, fn: (v: number) => number) => fn(0),
    animate: () => ({ stop: jest.fn() }),
  };
});
```

```
describe('GrokLoader')
  ✓ renders without crashing
```

---

## 8. Mock/Stub Strategy Summary

| Dependency | Strategy | Used By |
|---|---|---|
| `global.fetch` | `jest.fn()` — mock responses/errors | FetchBackoff |
| `setTimeout` / timers | `jest.useFakeTimers()` | FetchBackoff |
| `@mui/material/styles` (color fns) | Use real imports; mock only if import fails | Colors |
| `@mui/material` components | `ThemeProvider` + `createTheme()` wrapper | UserMenu, SocialLinks, GrokLoader |
| `@tempfix/idb` / IndexedDB | `fake-indexeddb` package (add as devDep) | LocalDb |
| `window` dimensions | `Object.defineProperty(window, 'innerWidth', ...)` | useResize, useResizeWindow |
| `framer-motion` | `jest.mock('framer-motion')` with stub components | GrokLoader |
| React hooks | `renderHook` from `@testing-library/react` | useIncId, useResize, useResizeWindow |
| `console.error/info` | `jest.spyOn(console, 'error').mockImplementation()` | FetchBackoff, LocalDb |

---

## 9. Coverage Targets

Medium priority → aim for **70% global**, with higher targets for critical modules.

### Global Thresholds

| Metric | Target |
|---|---|
| Statements | 70% |
| Branches | 65% |
| Functions | 80% |
| Lines | 70% |

### Per-Module Targets

| Module | Target | Rationale |
|---|---|---|
| FetchBackoff | 90% | Critical network resilience, all paths reachable |
| ProviderState + Settings | 85% | Core state management used across packages |
| Colors | 85% | Pure math, easy to cover |
| Types (SortedList, mergeWith) | 90% | Pure data structures, straightforward |
| Ids (namedId, useIncId) | 80% | ID generation used across all packages |
| MimeType (IMimeType, StokedUiMime) | 75% | Registry logic |
| MimeType (MimeType.ts map) | 5% | 1206-line static map — spot-check only |
| interfaces (publicity, embed-visibility) | 100% | Trivial functions, full coverage trivial |
| SocialLinks | 90% | Already well-tested |
| UserMenu | 70% | UI component |
| useResize / useResizeWindow | 60% | Simple hooks, SSR edge case |
| LocalDb / VideoDb | 50% | Complex IDB mocking, deferred |
| GrokLoader | 10% | Smoke test only |

---

## 10. Jest Configuration Updates

Add to `jest.config.js`:

```javascript
module.exports = {
  // ... existing config ...
  testPathIgnorePatterns: [
    '/node_modules/', '/build/', '/dist/',
    '/src/__tests__/setup.ts',
    '/src/__tests__/utils.tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.types.{ts,tsx}',
    '!src/**/*.styles.{ts,tsx}',
    '!src/MimeType/MimeType.ts',  // 1206-line static data map
    '!src/idb.types.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 80,
      lines: 70,
      statements: 70,
    },
  },
};
```

---

## 11. Shared Test Utilities

Create `src/__tests__/utils.tsx`:

```typescript
import * as React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

export function renderWithTheme(ui: React.ReactElement, options?: RenderOptions) {
  return render(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>,
    options,
  );
}

export { screen, fireEvent, waitFor, within } from '@testing-library/react';
```

Update `src/__tests__/setup.ts`:

```typescript
import '@testing-library/jest-dom';

// Suppress console.info in tests (LocalDb, ProviderState emit many logs)
jest.spyOn(console, 'info').mockImplementation(() => {});
```

---

## 12. Implementation Order

| Phase | Files to Create | Est. Cases | Effort |
|---|---|---|---|
| **1 — Pure Logic (P0)** | `FetchBackoff.test.ts`, `Settings.test.ts`, `ProviderState.test.ts`, `colors.test.ts`, `SortedList.test.ts`, `mergeWith.test.ts` | ~65 | 1 day |
| **2 — IDs & MimeType (P1)** | `namedId.test.ts`, `useIncId.test.tsx`, `IMimeType.test.ts`, `StokedUiMime.test.ts` | ~30 | 0.5 day |
| **3 — Interfaces & UI (P2)** | `publicity.test.ts`, `embed-visibility.test.ts`, `UserMenu.test.tsx`, `useResize.test.tsx`, `useResizeWindow.test.tsx` | ~25 | 0.5 day |
| **4 — IndexedDB (P3)** | `LocalDb.test.ts`, `GrokLoader.test.tsx` | ~15 | 1 day |

**Total**: ~135 new test cases across 15 new test files.

---

## 13. Key Risks & Known Issues

1. **`mergeWith` modifies `Array.prototype` globally** — importing the module adds `.mergeWith` to all arrays in the Jest worker. Tests in the same worker may be affected. Consider running these tests in a separate file (Jest runs each file in its own worker by default, so this is safe with the co-located `__tests__/mergeWith.test.ts` approach).

2. **`ProviderState.checkTriggers` closure bug** — Lines 111-112 and 125-126 in `ProviderState.ts` reference the `settings` parameter from the `createProviderState` closure directly, not `this.settings`. Object-type triggers modify the raw input object, bypassing the Settings Proxy. Tests should document this and verify both code paths.

3. **`LocalDb` static state pollution** — `LocalDb.stores`, `LocalDb.initialized`, `LocalDb.version` are static properties that persist across tests. Every test must reset: `LocalDb.initialized = false; LocalDb.stores = {};`.

4. **`useResizeWindow` violates rules of hooks** — `useState` is called after a conditional early return on SSR (`typeof window === 'undefined'`). This is a runtime bug on SSR, but harmless in jsdom tests where `window` is always defined.

5. **`FetchBackoff` silent error swallowing** — When `retryCondition(null, error)` returns `false` (line 35), the function calls `console.error` but does not throw or return, falling through to the retry loop. After max retries, it throws regardless. Test that errors with `retryCondition: () => false` still eventually throw after loop exhaustion.

6. **`MimeRegistry` static state** — `MimeRegistry.create()` permanently adds entries to static maps (`_exts`, `_names`, `_subtypes`, `_types`). Tests registering MIME types will affect subsequent tests. Use unique test-only extensions/names to avoid collisions.

7. **No `fake-indexeddb` devDependency** — Must be added before Phase 4 LocalDb tests: `pnpm add -D fake-indexeddb`.

---

## 14. Running Tests

```bash
# Run all package tests
cd packages/sui-common && pnpm test

# Run with coverage
cd packages/sui-common && pnpm test:coverage

# Run specific module
cd packages/sui-common && pnpm test -- --testPathPattern=FetchBackoff

# Run in watch mode during development
cd packages/sui-common && pnpm test:watch

# Via turbo from monorepo root
turbo run test --filter=@stoked-ui/common
```
