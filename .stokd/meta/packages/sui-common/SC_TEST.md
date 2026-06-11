# Testing Strategy: @stoked-ui/common

> **Generated:** 2026-06-06 | **Meta version:** 0.4.0
> **Package:** `packages/sui-common` (`@stoked-ui/common` v0.1.2)
> **Priority:** Medium
> **Source entry:** `packages/sui-common/src/index.tsx`

`@stoked-ui/common` is the foundation layer for every other Stoked UI package, so a regression here cascades into `sui-editor`, `sui-timeline`, `sui-file-explorer`, `sui-media`, `sui-github`, and the docs site. Test investment should reflect that blast radius even though the package itself is small.

---

## 1. Current State (verified 2026-06-06)

| Item | Status |
|---|---|
| Test runner | Jest 29 (`packages/sui-common/jest.config.js`) — `ts-jest` preset, jsdom env |
| Setup file | `src/__tests__/setup.ts` — imports `@testing-library/jest-dom` only |
| RTL | `@testing-library/react` 16.3.2 |
| Existing test files | 3 — all under `src/SocialLinks/__tests__/` |
| **Baseline run** | `pnpm --filter @stoked-ui/common test` → **3 suites / 52 tests, all passing** (~4s, Node v26.0.0) |
| Coverage script | `pnpm --filter @stoked-ui/common test:coverage` (defined, not enforced) |
| CI gating | None — package has no test step in the root workflow |

Existing tests (all green):

- `src/SocialLinks/__tests__/platformRegistry.test.ts` — registry shape, `getPlatformByKey`, `ALL_PLATFORM_KEYS`
- `src/SocialLinks/__tests__/SocialLinks.test.tsx` — RTL render of all 13 fields, filtering, invalid keys, disabled/readOnly
- `src/SocialLinks/__tests__/SocialLinkField.test.tsx` — per-platform render (`it.each` over `PLATFORM_REGISTRY`), prefix adornments

**Everything else in the package is currently untested.** That includes `LocalDb` (557 LOC, IndexedDB-backed), `FetchBackoff`, `mergeWith` (an `Array.prototype` extension), `createSettings` / `createProviderState`, `namedId` / `useIncId`, `compositeColors`, `MimeRegistry` / `getExtension`, and the `useResize` / `useResizeWindow` hooks.

### Node version note

This package's **standalone Jest** suite runs cleanly on **Node v26** (verified above). That is *not* true of the umbrella Mocha suite, which still requires `nvm use v20.20.0` (see `MEMORY.md` → "Node version for tests"). Keep `sui-common` on Jest — do **not** fold it into the umbrella Mocha glob (per `MEMORY.md` → "Dual test stacks": a Jest file in a publishable package breaks the mocha glob; `sui-common` and `sui-media` are the sanctioned Jest islands).

### Known tooling warning

`jest.config.js` passes `isolatedModules: true` to the `ts-jest` transform, which logs a deprecation warning (`removed in v30`). Non-blocking. When touching the config, move `isolatedModules: true` into `tsconfig.json` `compilerOptions` to silence it.

---

## 2. What Should Be Tested

### Tier 1 — Critical, ship-blocking (write first)

These modules are imported by multiple consumer packages and a regression silently corrupts their state. Several are pinned as observable contracts by `packages/sui-common/.axioms.md`.

| Module | File | Why it matters | Axiom |
|---|---|---|---|
| `FetchBackoff` | `src/FetchBackoff/FetchBackoff.ts` | Network retry primitive. Wrong backoff math = thundering herd or premature give-up. The loop only `return`s when `retryCondition` is false, so a custom predicate that returns `true` on a 2xx will keep retrying a good response — lock that down. | — |
| `createProviderState` | `src/ProviderState/ProviderState.ts` | Drives flag/setting state across packages. `addTriggers`/`removeTriggers` accept string, `string[]`, and object forms with different effects. | AX-MOD-SUICOMMON-006 |
| `createSettings` | `src/ProviderState/Settings.ts` | Proxy dotted-path get/set with autovivified intermediates. Known footgun (`MEMORY.md`): values set via `Object.assign` don't propagate through React state. Lock in *current* behavior so future "fixes" don't silently break editor consumers. | AX-MOD-SUICOMMON-006 |
| `LocalDb` | `src/LocalDb/LocalDb.ts` | IndexedDB persistence for editor/media. `MEMORY.md` records two prior incidents here (missing version entry on `saveVideo`; empty `ScreenshotStore` blocked generation). Both need regression coverage. | AX-MOD-SUICOMMON-004 |
| `namedId` / `useIncId` | `src/Ids/namedId/namedId.ts`, `src/Ids/useIncId/useIncId.ts` | Used for React keys and IDB record IDs. `useIncId` must be deterministic across renders for hydration. | — |
| `mergeWith` | `src/Types/mergeWith.ts` | Extends `Array.prototype` globally — side-effecting import. Wrong key-merge logic silently drops data. | AX-MOD-SUICOMMON-005 |

### Tier 2 — Important utilities

| Module | File | Why |
|---|---|---|
| `compositeColors` / `parseColorWithAlpha` | `src/Colors/colors.ts` | Throws on unsupported formats, alpha-compositing math, depends on `@mui/material/styles` `hexToRgb`/`hslToRgb`. |
| `MimeRegistry` / `getExtension` | `src/MimeType/IMimeType.ts` | Module-level **static** maps mutated by `create()` — test isolation matters. `getExtension` parses with `new URL(...)`, so it requires a full URL (footgun below). |
| `ExtensionMimeTypeMap` | `src/MimeType/MimeType.ts` | ~1200 lines of static data — sanity/spot-check only, not exhaustive. |
| `SUIMime` (`StokedUiMime.ts`) | `src/MimeType/StokedUiMime.ts` | Subclass of `MimeRegistry` that registers SUI-specific MIME types via `create`. |

> **`getExtension` footgun (verified):** the function does `new URL(url)` then returns `pathname.substring(lastIndexOf('.'))` — i.e. it returns the dot-prefixed extension (`.png`), and **throws `TypeError` on a bare filename** like `"video.mp4"` because that is not a valid absolute URL. Tests must pass full URLs (`https://x/y.png`), and should assert the throw on a bare filename so the contract is explicit.

### Tier 3 — React components / hooks

| Module | File | Coverage goal |
|---|---|---|
| `useResize` | `src/useResize/useResize.tsx` | Hook contract; subscribes to `window` `resize`, reads `elementRef.current.offsetWidth/Height` (or `window.inner*` when no ref); cleanup on unmount. |
| `useResizeWindow` | `src/useResizeWindow/useResizeWindow.tsx` | Window resize event wiring + listener cleanup. |
| `UserMenu` | `src/UserMenu/UserMenu.tsx` | Render + interaction smoke tests (open on click, fire callbacks). |
| `GrokLoader` | `src/GrokLoader/GrokLoader.tsx` | Render smoke only (framer-motion). |
| `SocialLinks` family | `src/SocialLinks/__tests__/` | Already covered (52 tests). Maintain, fill gaps only. |

### Out of scope

- The static `ExtensionMimeTypeMap` data table (~1100 entries) — spot-check, do not enumerate.
- Pure type-only re-exports under `src/interfaces/` (covered structurally by AX-MOD-SUICOMMON-003; verified by `sui-common-api` / `sui-media-api` `tsc`, not by unit tests). The two tiny predicate helpers in `embed-visibility.ts` (`isPublicEmbedVisibility`, `isAuthenticatedEmbedVisibility`) are the only runnable code there and are worth a 4-line test.
- Build outputs in `build/` and the generated `*.js` / `*.js.map` siblings of `*.ts` sources (already in `testPathIgnorePatterns`).

---

## 3. Tooling

The current toolchain is correct for this package. **Do not introduce additional runners** (no Mocha, no Vitest).

- **Runner:** Jest 29 with `ts-jest` (`jest.config.js`).
- **DOM:** `jsdom` (`testEnvironment: 'jsdom'`).
- **Assertions:** `@testing-library/jest-dom` (loaded via `src/__tests__/setup.ts`).
- **React:** `@testing-library/react` for components and `renderHook` for hooks.
- **Mocks:** Jest built-ins (`jest.fn`, `jest.useFakeTimers`, `jest.spyOn`).
- **CSS modules:** already mapped to `identity-obj-proxy`.

### Add (one-time)

- **`fake-indexeddb`** — required to test `LocalDb` in jsdom, which has no IndexedDB (confirmed absent from `node_modules` and `devDependencies`). Add as a devDependency and register in `src/__tests__/setup.ts` (`import 'fake-indexeddb/auto';`). Reset between tests with a fresh `IDBFactory` or by deleting the test DB in `afterEach`.
- **Wire `pnpm --filter @stoked-ui/common test` into root CI.** It is currently unreferenced, yet AX-MOD-SUICOMMON-006 and -007 both cite `pnpm --filter @stoked-ui/common test` as an acceptance check. The check exists on paper but nothing runs it in CI — close that gap.

---

## 4. File Organization & Naming

Follow the precedent already set by `SocialLinks`: tests co-located in a `__tests__/` directory inside the module.

```
src/<Module>/
  <Module>.ts(x)
  __tests__/
    <Module>.test.ts(x)
```

- Keep `src/__tests__/setup.ts` as the only top-level test-support file (jest-dom + future `fake-indexeddb/auto` registration). It is explicitly excluded from `testMatch` via `testPathIgnorePatterns`.
- One top-level `describe` per module, nested `describe` per public function/method.
- Test names in the form `it('returns X when Y')` — match existing style in `platformRegistry.test.ts`.
- Use `*.test.ts` for plain TS, `*.test.tsx` only when JSX is needed.

---

## 5. Mock / Stub Strategy

| Dependency | Strategy |
|---|---|
| `fetch` (FetchBackoff) | `global.fetch = jest.fn()` per test; reset in `afterEach`. Use `jest.useFakeTimers()` + `await jest.advanceTimersByTimeAsync(delay)` to skip the backoff `setTimeout` without real waits. |
| `IndexedDB` (`LocalDb`, `VideoDb`) | `fake-indexeddb` global polyfill. Do **not** mock `@tempfix/idb` — exercise the real `openDB` wrapper against the fake DB. Delete the DB in `afterEach` to keep tests isolated. |
| `ResizeObserver` (`useResize`) | jsdom has none. Polyfill in setup: `class RO { observe(){} unobserve(){} disconnect(){} }; global.ResizeObserver = RO as any;`. NOTE: `useResize` currently listens to `window` `resize` (not `ResizeObserver`), so for its own tests dispatch `window.dispatchEvent(new Event('resize'))` and assert returned dims; keep the RO polyfill only for consumers that need it. |
| `window` resize events | jsdom supports `window.dispatchEvent(new Event('resize'))` directly. Set `window.innerWidth/innerHeight` before dispatch to assert the no-ref branch. |
| `offsetWidth` / `offsetHeight` | jsdom returns `0`. When testing the element-ref branch, stub via `Object.defineProperty(el, 'offsetWidth', { value: 123 })`. |
| `MUI ThemeProvider` (components) | Wrap in `<ThemeProvider theme={createTheme()}>` per existing `SocialLinks.test.tsx` `renderWithTheme` helper. Extract a shared helper if a third component needs it. |
| `MUI icon imports` (`@mui/icons-material/*`) | None needed — they render as inline SVG in jsdom. |
| `framer-motion` (`GrokLoader`) | None needed for a render smoke test; it renders in jsdom. Mock only if animation timing causes flakiness. |
| `MimeRegistry` static state | Reset between tests. The four maps are `private static`; prefer per-test **unique extensions** (e.g. `.test-${Date.now()}`) so registrations don't collide, rather than reflecting into private fields. |
| `console.error` / `console.log` | `FetchBackoff` logs on failure; `setProperty` in `Types.ts` logs on every call. `jest.spyOn(console, 'error'/'log').mockImplementation(() => {})` to keep output clean. |
| `Math.random` (`namedId`) | Spy/seed when asserting exact output; otherwise assert format with a regex. |
| `process.env.FLAG_DEBUGGING` | Read by `enableFlags`/`disableFlags`. Leave unset, or `delete process.env.FLAG_DEBUGGING` in setup so console output stays quiet. |

**Side-effect import warning:** `src/Types/mergeWith.ts` mutates `Array.prototype` at import time. Tests for it must `import '../mergeWith'` (or rely on the index re-export) and assert the prototype is patched. **Do not `delete Array.prototype.mergeWith`** afterward — other modules/tests depend on it being installed (AX-MOD-SUICOMMON-005).

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

Rationale: utilities are deterministic and cheap to cover thoroughly; `LocalDb` interacts with IndexedDB so 70% is realistic. Components are excluded from per-directory thresholds — render-smoke coverage is enough at Medium priority.

Exclude from coverage: `src/**/index.ts(x)` re-exports, `src/interfaces/` (type-only), `src/__tests__/`, all `*.js` build siblings, `src/idb.types.d.ts`, `src/Dialog/Dialog.types.ts`, `*.types.ts`.

---

## 7. Concrete Test Cases — Implement First

The order below is the recommended implementation order (TDD: write the test, see it fail/observe behavior, lock it in). Each item lists the file to create and the cases that must pass.

### Sprint 1 — Pure utilities (no DOM, fastest to write)

**`src/FetchBackoff/__tests__/FetchBackoff.test.ts`**
- returns response on first success (no retry; `fetch` called once, **no** `setTimeout` fired — success returns before the delay)
- retries up to `retries` (default 3 → 4 total `fetch` attempts) when `response.ok === false`
- doubles delay with default `backoffFactor: 2`. The loop runs `setTimeout(delay)` after **every** attempt, including the last failed one, so an all-fail run with `retries: 3` fires **4** delays before throwing: `500, 1000, 2000, 4000` (assert via `jest.useFakeTimers()` + a `setTimeout` spy — do not just check the first three)
- respects custom `initialDelay` and `backoffFactor` (e.g. `initialDelay: 100, backoffFactor: 3` → `100, 300, 900, …`)
- throws `"Fetch failed after maximum retries."` after exhausting retries (and only *after* the trailing delay of the final attempt resolves)
- custom `retryCondition` returning `false` short-circuits the loop and returns the first response (line 30: `if (!retryCondition(response, null)) return response`)
- inverse footgun: a `retryCondition` that returns `true` on a 2xx keeps retrying a good response until it throws — pin this so the predicate contract is explicit
- swallows fetch rejections per `retryCondition`, `console.error('FetchBackoff', …)` once on the final attempt
- does **not** rethrow when `retryCondition` returns `false` for an error — it logs `console.error('FetchBackoff', error)` and continues to the delay/next iteration (never an early throw on a single error)

**`src/Ids/namedId/__tests__/namedId.test.ts`**
- default call returns string matching `/^id-[0-9a-f]{1,7}$/`
- string arg becomes the id segment: `namedId('foo')` → `/^foo-/`
- object arg respects `prefix`, `id`, `suffix`, `length` (order: `prefix-id-suffix-<hex>`)
- `randomBytes(n)` returns an `n`-character lowercase hex string
- two consecutive calls produce different IDs (collision smoke test, 1000 iterations)

**`src/Ids/useIncId/__tests__/useIncId.test.ts`** (uses `renderHook`)
- counter starts at `0`, increments by 1 per call
- pads to configured `length` with leading zeros (`length: 3` → `...-000`, `...-001`)
- `prefix` is concatenated correctly (`${prefix}-${id}-${padded}`)
- `.by(n)` jumps the counter by `n`
- counter persists across re-renders (`rerender()`), resets on unmount/remount

**`src/Types/__tests__/mergeWith.test.ts`**
- merges two arrays by key, second array overwrites first on key collision
- filters out falsy entries from both arrays
- returns instance (filtered) unchanged when `otherArray` is not an array
- empty arrays return an empty array
- side-effect: `Array.prototype.mergeWith` is `typeof 'function'` after import

**`src/Colors/__tests__/colors.test.ts`**
- alpha === 1 returns the overlay color verbatim
- alpha === 0 returns the base color verbatim
- alpha === 0.5 produces a midpoint blend
- accepts `#hex`, `rgb()`, `rgba()`, `hsl()` as base
- throws `"Unsupported color format"` on unknown input (e.g. `"red"`)
- throws `"Invalid RGB color format"` on malformed RGB

### Sprint 2 — State containers

**`src/ProviderState/__tests__/Settings.test.ts`**
- top-level get/set works like a normal object
- dotted-path get traverses nested objects (`settings['user.name']`)
- dotted-path set creates intermediate objects (autovivification)
- get returns `undefined` for a missing intermediate key (no throw)
- regression: document the `Object.assign` propagation gap from `MEMORY.md` with an `it.skip` + comment so a future "fix" surfaces deliberately, not silently (AX-MOD-SUICOMMON-006)

**`src/ProviderState/__tests__/ProviderState.test.ts`**
- `createFlags` seeds `flags` from `config.defaultValue` (falls back to `false`)
- `enableFlags` / `disableFlags` accept a string or `string[]`
- `toggleFlags` flips the current value and re-runs `checkTriggers`
- `removeFlags` throws `Flag "x" does not exist.` on an unknown flag name
- `addTriggers` with a string array enables those flags transitively
- `removeTriggers` with a string array disables those flags
- object trigger writes into the **captured `settings` closure argument**, *not* `this.settings` — assert the documented quirk in AX-MOD-SUICOMMON-006, do not "fix" it in the test

### Sprint 3 — IndexedDB-backed persistence

Add `fake-indexeddb` and update `src/__tests__/setup.ts`:

```ts
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
```

**`src/LocalDb/__tests__/LocalDb.test.ts`**
- `getRecordVersions` produces ascending versions for an `IDBProjectFile` with multiple version entries; `mediaType` is `'project'` when the mime includes `'project'`, else `'doc'`
- save → load round-trip: write a `FileSaveRequest`, read back via `FileLoadRequestByName`; blob bytes match
- save with missing `versions` entry creates the version (regression for the `saveVideo` issue in `MEMORY.md`)
- load by URL (`FileLoadRequestByUrl`) resolves the same record as load by name
- `disabled: true` short-circuits all writes/reads without throwing (AX-MOD-SUICOMMON-004)
- `getVideos` returns flattened videos across versions; empty store returns `[]` (regression for the empty-`ScreenshotStore` count check)
- `createFolder` produces a folder `IDBFile` with a generated id (or the supplied `options.id`)
- SSR guard: importing the module does not throw when `indexedDB`/`window` are undefined (AX-MOD-SUICOMMON-004 — simulate by deleting the global before `require`)

Reset state between tests:
```ts
afterEach(async () => {
  await new Promise((r) => {
    const req = indexedDB.deleteDatabase('<dbName>');
    req.onsuccess = () => r(undefined);
    req.onerror = () => r(undefined);
  });
});
```

### Sprint 4 — MIME + components

**`src/MimeType/__tests__/MimeRegistry.test.ts`**
- `MimeRegistry.create(app, name, ext, desc)` registers the same `IMimeType` in all four static maps (`exts`, `names`, `subtypes`, `types`), keyed correctly (`ext`, `name`, `${app}-${name}`, `${type}/${app}-${name}`)
- the returned object's `accept` getter yields `{ [fullType]: ext }`
- `getExtension('https://x/y.png')` → `.png` (dot-prefixed)
- `getExtension('https://x/y')` (no extension) → `''`
- `getExtension('y.png')` (bare filename) **throws** `TypeError` — verified `new URL()` footgun
- use unique extensions per test to avoid static-map cross-test leakage

**`src/MimeType/__tests__/MimeType.test.ts`**
- `ExtensionMimeTypeMap` returns expected types for `mp4`, `png`, `pdf`, `json`, `zip` (spot check, not exhaustive)
- map size is non-zero (sanity)

**`src/MimeType/__tests__/StokedUiMime.test.ts`**
- `SUIMime` registers its SUI-specific types and they resolve through the inherited `MimeRegistry` maps

**`src/useResize/__tests__/useResize.test.tsx`** / **`src/useResizeWindow/__tests__/useResizeWindow.test.tsx`** (use `renderHook`)
- no-ref branch: returns `window.innerWidth/innerHeight`; updates after `window.dispatchEvent(new Event('resize'))`
- element-ref branch: returns stubbed `offsetWidth/offsetHeight`
- removes the `resize` listener on unmount (spy on `window.removeEventListener`)

**`src/UserMenu/__tests__/UserMenu.test.tsx`**
- renders with required props, opens menu on click, fires the documented callbacks
- wrap in `renderWithTheme` (shared MUI `ThemeProvider` helper)

**`src/interfaces/__tests__/embed-visibility.test.ts`** (tiny, high-value)
- `isPublicEmbedVisibility('public')` → `true`; `'authenticated'`/`'private'` → `false`
- `isAuthenticatedEmbedVisibility` → `true` for `'public'` and `'authenticated'`, `false` for `'private'`
- `DEFAULT_EMBED_VISIBILITY === 'private'` (most-restrictive default is a contract)

---

## 8. Risks & Notes

- **`createSettings` Proxy is load-bearing across packages** — `MEMORY.md` calls out a specific footgun used by the editor (`file.media` properties set via `Object.assign` don't propagate through React state updates). Tests must lock in *current* behavior, not "ideal" behavior, until that gap is addressed deliberately (AX-MOD-SUICOMMON-006).
- **`mergeWith` mutates `Array.prototype`.** Importing it in any test (or via the index barrel) installs the patch globally for the run — that matches production. Do not isolate or delete it (AX-MOD-SUICOMMON-005).
- **`MimeRegistry` keeps module-level static state.** Tests that call `create()` leak across files unless reset. Prefer unique extensions per test (e.g. `.test-${Date.now()}`) to dodge the issue without reflecting into private fields.
- **`getExtension` requires a full URL** (`new URL(...)`). Passing a bare filename throws `TypeError`. Either consumers always pass URLs, or the function needs a guard — until then, the test pins the throw as the contract.
- **`process.env.FLAG_DEBUGGING`** is read by `enableFlags`/`disableFlags`. Leave it unset (or `delete` it in setup) so console output stays quiet.
- **`Types.ts` `setProperty` logs `console.log('setProperty', 'name')` on every call** (note: logs the literal string `'name'`, a likely bug). If `setProperty` ends up under test, spy on `console.log`; consider filing a fix for the literal.
- **No CI test step exists** for this package today, yet three axioms (-006, -007, and -006 again) name `pnpm --filter @stoked-ui/common test` as an acceptance check. Adding tests is half the work; wiring the command (and eventually `test:coverage`) into the root pipeline is the other half. Without that, regressions still ship green.
- **Keep Jest, not Mocha.** `sui-common` is one of the two sanctioned standalone-Jest packages (`MEMORY.md` → "Dual test stacks"). Adding it to the umbrella Mocha glob would break that glob; the umbrella suite also needs Node v20.20.0 while this Jest suite runs fine on Node v26.

---

## 9. Acceptance Snapshot

A change to `sui-common` is test-ready when:

1. `pnpm --filter @stoked-ui/common test` is green (today: 52 tests; growing).
2. Every Tier 1 module touched by the change has a red→green regression test added in the same PR.
3. `pnpm --filter @stoked-ui/common typescript` and `pnpm --filter @stoked-ui/common build` pass (barrel/contract integrity — AX-MOD-SUICOMMON-001).
4. Downstream type-checks still pass for the consumers a contract change touches: `pnpm --filter @stoked-ui/editor typescript`, `pnpm --filter @stoked-ui/timeline typescript`, `pnpm --filter @stoked-ui/common-api typescript`, `pnpm --filter @stoked-ui/media-api typescript` (AX-MOD-SUICOMMON-003, -006).
