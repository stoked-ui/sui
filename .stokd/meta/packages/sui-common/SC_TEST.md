# Testing Strategy: @stoked-ui/common

> **Generated:** 2026-05-21 | **Meta version:** 0.3.1
> **Package:** `packages/sui-common` (`@stoked-ui/common` v0.1.2)
> **Priority:** Medium
> **Source entry:** `packages/sui-common/src/index.tsx`

`@stoked-ui/common` is the foundation layer for every other Stoked UI package, so a regression here cascades into `sui-editor`, `sui-timeline`, `sui-file-explorer`, `sui-media`, `sui-github`, and the docs site. Test investment should reflect that blast radius even though the package itself is small.

---

## 1. Current State

| Item | Status |
|---|---|
| Test runner | Jest 29 (`packages/sui-common/jest.config.js`) — `ts-jest` preset, jsdom env |
| Setup file | `src/__tests__/setup.ts` — imports `@testing-library/jest-dom` only |
| RTL | `@testing-library/react` 16.3.2 |
| Existing test files | 3 — all under `src/SocialLinks/__tests__/` |
| Coverage script | `pnpm --filter @stoked-ui/common test:coverage` (defined, not enforced) |
| CI gating | None — package has no test step in the root workflow |

Existing tests:

- `src/SocialLinks/__tests__/platformRegistry.test.ts` — registry shape, `getPlatformByKey`, `ALL_PLATFORM_KEYS`
- `src/SocialLinks/__tests__/SocialLinks.test.tsx` — RTL render of all 13 fields, filtering, invalid keys
- `src/SocialLinks/__tests__/SocialLinkField.test.tsx`

**Everything else in the package is currently untested.** That includes `LocalDb` (557 LOC, IndexedDB-backed), `FetchBackoff`, `mergeWith` (an `Array.prototype` extension), `createSettings` / `createProviderState`, `namedId` / `useIncId`, `compositeColors`, and `MimeRegistry`.

---

## 2. What Should Be Tested

### Tier 1 — Critical, ship-blocking (write first)

These modules are imported by multiple consumer packages and a regression silently corrupts their state.

| Module | File | Why it matters |
|---|---|---|
| `FetchBackoff` | `src/FetchBackoff/FetchBackoff.ts` | Network retry primitive. Wrong backoff math = thundering herd or premature give-up. Loop drops responses when `retryCondition` is true but the response was OK, so behavior under custom predicates needs locking down. |
| `createProviderState` | `src/ProviderState/ProviderState.ts` | Drives flag/setting state across packages. Trigger semantics (`addTriggers`/`removeTriggers`) accept string, array, and object forms with different effects. |
| `createSettings` | `src/ProviderState/Settings.ts` | Proxy-based dotted-path getter/setter. Known footgun (see `~/.claude/projects/-opt-dev-stoked-ui/memory/MEMORY.md`): values set via `Object.assign` don't propagate. Lock in current behavior so future "fixes" don't silently break editor consumers. |
| `LocalDb` | `src/LocalDb/LocalDb.ts` | IndexedDB persistence for editor/media. Memory notes call out two prior incidents here (missing version entry on `saveVideo`; empty `ScreenshotStore` blocked generation). Both need regression coverage. |
| `namedId` / `useIncId` | `src/Ids/namedId/namedId.ts`, `src/Ids/useIncId/useIncId.ts` | Used for React keys and IDB record IDs. `useIncId` must be deterministic across renders for hydration. |
| `mergeWith` | `src/Types/mergeWith.ts` | Extends `Array.prototype` globally — side-effecting import. Wrong key-merge logic silently drops data. |

### Tier 2 — Important utilities

| Module | File | Why |
|---|---|---|
| `compositeColors` | `src/Colors/colors.ts` | Throws on unsupported formats, alpha-compositing math, depends on `@mui/material/styles` helpers. |
| `MimeRegistry` / `getExtension` | `src/MimeType/IMimeType.ts` | Module-level static maps mutated by `create()` — test isolation matters. |
| `ExtensionMimeTypeMap` | `src/MimeType/MimeType.ts` | 1209 lines of static data — sanity tests, not exhaustive. |
| `StokedUiMime` | `src/MimeType/StokedUiMime.ts` | Wraps `MimeRegistry.create` for SUI-specific MIME types. |

### Tier 3 — React components / hooks

| Module | File | Coverage goal |
|---|---|---|
| `useResize` | `src/useResize/useResize.tsx` | Hook contract; mock `ResizeObserver`. |
| `useResizeWindow` | `src/useResizeWindow/useResizeWindow.tsx` | Window resize event wiring + cleanup. |
| `UserMenu` | `src/UserMenu/UserMenu.tsx` | Render + interaction smoke tests. |
| `GrokLoader` | `src/GrokLoader/GrokLoader.tsx` | Render snapshot only. |
| `SocialLinks` family | already covered | Fill any gap in `SocialLinkField.test.tsx`. |

### Out of scope

- The static `ExtensionMimeTypeMap` data table (~1100 entries) — spot-check, do not enumerate.
- Pure type-only re-exports under `src/interfaces/`.
- Build outputs in `build/` and the generated `*.js`/`*.js.map` siblings of `*.ts` sources.

---

## 3. Tooling

The current toolchain is correct for this package. Do not introduce additional runners.

- **Runner:** Jest 29 with `ts-jest` (`jest.config.js`).
- **DOM:** `jsdom` (`testEnvironment: 'jsdom'`).
- **Assertions:** `@testing-library/jest-dom` (loaded via `src/__tests__/setup.ts`).
- **React:** `@testing-library/react` for components and `renderHook` for hooks.
- **Mocks:** Jest built-ins (`jest.fn`, `jest.useFakeTimers`, `jest.spyOn`).
- **CSS modules:** already mapped to `identity-obj-proxy`.

### Add (one-time)

- `fake-indexeddb` — required to test `LocalDb` in jsdom, which has no IndexedDB. Add as devDependency and import in `src/__tests__/setup.ts` (`import 'fake-indexeddb/auto';`). Reset between tests with `indexedDB = new IDBFactory()` or by deleting the test DB in `afterEach`.
- Wire `pnpm --filter @stoked-ui/common test` into the root CI workflow (currently unreferenced).

---

## 4. File Organization & Naming

Follow the precedent already set by `SocialLinks`: tests co-located in a `__tests__/` directory inside the module.

```
src/<Module>/
  <Module>.ts(x)
  __tests__/
    <Module>.test.ts(x)
```

- Keep `src/__tests__/setup.ts` as the only top-level test file (jest-dom + fake-indexeddb registration).
- One `describe` per module, nested `describe` per public function.
- Test names in the form `it('returns X when Y')` — match existing style in `platformRegistry.test.ts`.
- Use `*.test.ts` for plain TS, `*.test.tsx` only when JSX is needed.

---

## 5. Mock / Stub Strategy

| Dependency | Strategy |
|---|---|
| `fetch` (FetchBackoff) | `global.fetch = jest.fn()` per test; reset in `afterEach`. Use `jest.useFakeTimers()` + `jest.advanceTimersByTimeAsync` to skip the backoff delay. |
| `IndexedDB` (`LocalDb`, `VideoDb`) | `fake-indexeddb` global polyfill. Do **not** mock `@tempfix/idb` — exercise the real wrapper against the fake DB. Delete the DB in `afterEach` to keep tests isolated. |
| `ResizeObserver` (`useResize`) | Polyfill in setup: `class RO { observe(){} unobserve(){} disconnect(){} }; global.ResizeObserver = RO;`. Capture the callback by spying on the constructor. |
| `window` resize events | jsdom supports `window.dispatchEvent(new Event('resize'))` directly. |
| `MUI ThemeProvider` (components) | Wrap in `<ThemeProvider theme={createTheme()}>` per existing `SocialLinks.test.tsx` pattern. Extract a shared `renderWithTheme` helper if a third component needs it. |
| `MUI icon imports` (`@mui/icons-material/*`) | None needed — they render as inline SVG in jsdom. |
| `MimeRegistry` static state | Reset between tests by clearing the four private maps via reflection, or structure tests so each one creates unique extensions. |
| `console.error` (FetchBackoff) | `jest.spyOn(console, 'error').mockImplementation(() => {})` to keep output clean. |
| `Math.random` (`namedId`) | Spy or seed when asserting exact output; otherwise assert format with regex. |

Side-effect import warning: `src/Types/mergeWith.ts` mutates `Array.prototype`. Tests for it must `import '../mergeWith'` (or rely on the index re-export) and assert the prototype is patched. Do not `delete Array.prototype.mergeWith` afterward — other tests in the suite depend on it being installed.

---

## 6. Coverage Targets (Medium priority)

Enforce via `jest.config.js` `coverageThreshold` once the Tier 1 tests land:

```js
coverageThreshold: {
  global:                  { lines: 60, statements: 60, branches: 50, functions: 60 },
  './src/FetchBackoff/':   { lines: 90, branches: 85 },
  './src/ProviderState/':  { lines: 85, branches: 75 },
  './src/Ids/':            { lines: 90, branches: 80 },
  './src/Types/':          { lines: 85, branches: 80 },
  './src/LocalDb/':        { lines: 70, branches: 60 },
  './src/Colors/':         { lines: 90, branches: 85 },
}
```

Rationale: utilities are deterministic and cheap to cover thoroughly; `LocalDb` interacts with IndexedDB so 70% is realistic. Components are excluded from per-directory thresholds — render-smoke coverage is enough.

Exclude from coverage: `src/**/index.ts(x)` re-exports, `src/interfaces/`, `src/__tests__/`, all `*.js` build siblings.

---

## 7. Concrete Test Cases — Implement First

The order below is the recommended implementation order. Each item lists the file to create and the cases that must pass.

### Sprint 1 — Pure utilities (no DOM, fastest to write)

**`src/FetchBackoff/__tests__/FetchBackoff.test.ts`**
- returns response on first success (no retry)
- retries up to `retries` (default 3) when `response.ok === false`
- doubles delay each attempt with default `backoffFactor: 2` (assert via `setTimeout` spy)
- respects custom `initialDelay` and `backoffFactor`
- throws `"Fetch failed after maximum retries."` after exhausting retries
- uses custom `retryCondition` to short-circuit the retry loop
- swallows fetch rejections per `retryCondition`, logs once on final failure
- does not retry when `retryCondition` returns `false` for an error

**`src/Ids/namedId/__tests__/namedId.test.ts`**
- default call returns string matching `/^id-[0-9a-f]{1,7}$/`
- string arg becomes the id segment: `namedId('foo')` → `/^foo-/`
- object arg respects `prefix`, `id`, `suffix`, `length`
- `randomBytes(n)` returns an `n`-character lowercase hex string
- two consecutive calls produce different IDs (collision smoke test, 1000 iterations)

**`src/Ids/useIncId/__tests__/useIncId.test.ts`** (uses `renderHook`)
- counter starts at 0, increments by 1 per call
- pads to configured `length` with leading zeros (`length: 3` → `001`)
- `prefix` is concatenated correctly (`${prefix}-${id}-${padded}`)
- `.by(n)` jumps the counter by `n`
- counter persists across re-renders, resets on unmount

**`src/Types/__tests__/mergeWith.test.ts`**
- merges two arrays by key, second array overwrites first
- filters out falsy entries from both arrays
- returns instance unchanged when `otherArray` is not an array
- empty arrays return an empty array
- side-effect: `Array.prototype.mergeWith` is defined after import

**`src/Colors/__tests__/colors.test.ts`**
- alpha === 1 returns the overlay color verbatim
- alpha === 0 returns the base color verbatim
- alpha === 0.5 produces a midpoint blend
- accepts `#hex`, `rgb()`, `rgba()`, `hsl()` as base
- throws `"Unsupported color format"` on unknown input
- throws `"Invalid RGB color format"` on malformed RGB

### Sprint 2 — State containers

**`src/ProviderState/__tests__/Settings.test.ts`**
- top-level get/set works like a normal object
- dotted-path get traverses nested objects (`settings['user.name']`)
- dotted-path set creates intermediate objects
- get returns `undefined` for missing intermediate keys (no throw)
- regression: document the `Object.assign` propagation gap from `MEMORY.md` with a skipped test or comment so future work doesn't silently regress

**`src/ProviderState/__tests__/ProviderState.test.ts`**
- `createFlags` seeds `flags` from `defaultValue`
- `enableFlags` / `disableFlags` accept a string or `string[]`
- `toggleFlags` flips the current value
- `removeFlags` throws on an unknown flag name
- `addTriggers` with a string array enables those flags transitively
- `removeTriggers` with a string array disables those flags
- object trigger writes into the captured `settings` closure (note: this writes to the *constructor argument*, not `this.settings` — assert the actual behavior)

### Sprint 3 — IndexedDB-backed persistence

Add `fake-indexeddb` and update `src/__tests__/setup.ts`:

```ts
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
```

**`src/LocalDb/__tests__/LocalDb.test.ts`**
- `getRecordVersions` produces ascending versions for an `IDBProjectFile` with multiple version entries
- save → load round-trip: write a `FileSaveRequest`, read back via `FileLoadRequestByName`, blob bytes match
- save with missing `versions` entry creates the version (regression for the issue noted in `MEMORY.md`)
- load by URL resolves the same record as load by name
- `disabled: true` short-circuits all writes/reads without throwing
- `getVideos` returns videos for a project; empty store returns `[]` (regression for the empty-`ScreenshotStore` count check)
- `createFolder` produces a folder `IDBFile` with a generated id

Reset state between tests:
```ts
afterEach(async () => {
  await new Promise((r) => {
    const req = indexedDB.deleteDatabase('<dbName>');
    req.onsuccess = r;
    req.onerror = r;
  });
});
```

### Sprint 4 — MIME + components

**`src/MimeType/__tests__/MimeRegistry.test.ts`**
- `create(app, name, ext, desc)` registers in all four maps (`exts`, `names`, `subtypes`, `types`)
- `accept` returns `{ [fullType]: ext }`
- `getExtension('https://x/y.png')` → `.png`; no extension → `''`

**`src/MimeType/__tests__/MimeType.test.ts`**
- `ExtensionMimeTypeMap` returns expected types for `mp4`, `png`, `pdf`, `json`, `zip` (spot check, not exhaustive)
- map size is non-zero (sanity)

**`src/useResize/__tests__/useResize.test.tsx`** / **`src/useResizeWindow/__tests__/useResizeWindow.test.tsx`** (use `renderHook`)
- Mock `ResizeObserver` in setup, then assert the hook subscribes on mount and disconnects on unmount.
- Trigger a resize and assert the returned dimensions update.

**`src/UserMenu/__tests__/UserMenu.test.tsx`**
- Renders with required props, opens menu on click, fires the documented callbacks.

---

## 8. Risks & Notes

- **`createSettings` Proxy is load-bearing across packages** — `MEMORY.md` calls out a specific footgun used by the editor (`file.media` properties set via `Object.assign` don't propagate through React state updates). Tests must lock in current behavior, not "ideal" behavior, until that gap is addressed deliberately.
- **`mergeWith` mutates `Array.prototype`.** Adding it to a Jest setup means every test runs with the patched prototype; that matches production. Do not isolate it.
- **`MimeRegistry` keeps module-level state.** Tests that call `create()` will leak across files unless reset. Prefer unique extensions per test (e.g. `.test-${Date.now()}`) to dodge the issue without reflecting into private fields.
- **`process.env.FLAG_DEBUGGING`** is read by `enableFlags` / `disableFlags`. Either leave it unset or `delete process.env.FLAG_DEBUGGING` in setup so console output stays quiet.
- **No CI test step exists** for this package today. Adding the tests is half the work; wiring `pnpm --filter @stoked-ui/common test` (and eventually `test:coverage`) into the root pipeline is the other half. Without that, regressions still ship.
