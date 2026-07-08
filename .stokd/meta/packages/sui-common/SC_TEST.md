# SC_TEST.md — `@stoked-ui/common` Testing Strategy

> **Generated:** 2026-06-06 | **Updated:** 2026-07-02 (TIMED REFRESH — re-verified against source; ran the suite: **4 suites / 80 tests, all green** in ~12s; corrected `useIncId.ts` path and `setupFilesAfterEnv` key; added `SUIMime` singleton, `VideoDb`, and type-only surfaces; documented the `FetchBackoff` catch-branch quirk and the CalendarBooking `act(...)` warning) | **Meta version:** 0.4.1
> **Package:** `packages/sui-common` (`@stoked-ui/common`, v0.2.2) · **Priority:** medium
> **Runner:** Jest 29 + ts-jest + jsdom (already configured) · **Component tests:** `@testing-library/react` 16 + `@testing-library/jest-dom`
> **Scope:** Browser-safe shared utilities, hooks, and presentational components. Foundational dependency for `@stoked-ui/editor`, `file-explorer`, `timeline`, `media`, `cdn`, and `github`.

---

## 1. Why testing this package matters

`@stoked-ui/common` is a leaf dependency consumed by nearly every other publishable package (see `AX-REPO-MEDIA-TYPE-COORDINATION`, `AX-REPO-BROWSER-NO-SERVER-DEPS`). A regression here fans out to the whole monorepo and is invisible at compile time for the runtime-only pieces (`Array.prototype.mergeWith` patch, `MimeRegistry` static state, `LocalDb` IndexedDB shapes). The barrel `src/index.tsx` (`AX-REPO-PACKAGE-BARREL`) is the published contract — every symbol it re-exports deserves at least one behavioral test.

A second, structural reason: this package MUST stay browser-safe. `LocalDb` is the IndexedDB store explicitly reserved for editor project/version/recording state by `AX-REPO-MONGODB-BUSINESS-DATA`, and `src/interfaces/upload-types.ts` exists precisely to give clients the upload DTO shapes *without* NestJS decorators. Tests must guard that no server-only import (`@nestjs`, `mongoose`, `@aws-sdk`, `next/server`) leaks into the browser barrel.

---

## 2. Current state (verified 2026-07-02)

Tooling is in place and working — **do not re-scaffold it**:

- `packages/sui-common/jest.config.js` — `ts-jest` preset, `jsdom` env, `roots: ['<rootDir>/src']`, CSS mapped to `identity-obj-proxy`, `setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']` (loads `@testing-library/jest-dom`), per-transform `isolatedModules: true`, `testPathIgnorePatterns` excludes `build/`, `dist/`, and `setup.ts`.
- Scripts: `pnpm --filter @stoked-ui/common test` / `test:watch` / `test:coverage`.
- **Suite status:** `pnpm --filter @stoked-ui/common test` → 4 suites, 80 tests, all passing (~12s).
- **Known warning to clean up:** `CalendarBooking.test.tsx` triggers a React "update not wrapped in act(...)" warning from `src/CalendarBooking/CalendarBooking.tsx:303` (async availability fetch resolving after render). Wrap the resolution in `await act(...)`/`findBy*` — cosmetic today, but it masks real async assertions.

Existing tests (4 files, all in `__tests__/` subfolders):

| File | Covers |
| --- | --- |
| `src/SocialLinks/__tests__/platformRegistry.test.ts` | `PLATFORM_REGISTRY`, `getPlatformByKey`, `ALL_PLATFORM_KEYS` |
| `src/SocialLinks/__tests__/SocialLinks.test.tsx` | `SocialLinks` component |
| `src/SocialLinks/__tests__/SocialLinkField.test.tsx` | `SocialLinkField` component |
| `src/CalendarBooking/__tests__/CalendarBooking.test.tsx` | `CalendarBooking` (mocks `useTheme`, sessionStorage cache) |

**Coverage gap:** the entire utility/hook surface re-exported from `src/index.tsx` is untested — `Ids` (`namedId`, `useIncId`), `MimeType` (`getExtension`, `MimeRegistry`, `SUIMime`), `FetchBackoff`, `Colors`, `Types`/`mergeWith`, `ProviderState`/`Settings`, `LocalDb` (+ `VideoDb`), `useResize`, `useResizeWindow`, `GrokLoader`, `UserMenu`. This is where the first wave of work belongs.

---

## 3. What to test (by module, in priority order)

### Tier 1 — Pure logic, high fan-out, fast wins (do these first)

Deterministic, dependency-light, and back the rest of the monorepo.

#### `src/Ids/namedId/namedId.ts` — `namedId`, `randomBytes`
- `namedId()` → matches `^id-[0-9a-f]{7}$` (defaults: id `'id'`, length 7).
- `namedId('foo')` (string form) → `^foo-[0-9a-f]{7}$`.
- Object form assembles `prefix-id-suffix-<hex>` (prefix prepends, suffix appends *before* the hex segment — pin this order); verify prefix-only and suffix-only branches independently.
- Custom `length` controls the hex segment length exactly (`randomBytes` generates `2n` hex chars and truncates via `.substring(0, length)` — `length: 16` → 16 chars).
- Two successive calls produce different suffixes (uniqueness smoke, not collision-proof).
- `randomBytes(n)` → string of length `n`, `[0-9a-f]` only. **Edges:** `randomBytes(0)` → `''`; large `n` (e.g. 64).

#### `src/Ids/useIncId/useIncId.ts` — `useIncId` (RTL `renderHook`)
- Deterministic sequence: `fn()` returns `id-000`, `id-001`, … (default `length: 3` zero-padding via `padStart`).
- String-arg vs object-arg forms; `prefix` joins as `prefix-id`.
- `fn.by(n)` returns the *current* counter value, then advances by `n` (pin this return-before-increment behavior).
- Counter persists across re-renders (it lives in a `useRef`).

#### `src/MimeType/IMimeType.ts` + `StokedUiMime.ts` — `getExtension`, `MimeRegistry`, `SUIMime`
- `getExtension('https://x.com/a/b/file.png')` → `.png`; query string / hash ignored; no extension → `''`; dotfile / trailing-dot edges.
- `MimeRegistry.create(...)` registers the entry under all four static indices (`exts`, `names`, `subtypes`, `types`) and the returned `IMimeType` getters (`type`, `subType`, `accept`, `typeObj`) compose correctly. **Static mutable state** — see §5.
- `SUIMime.getInstance()` is a singleton (`getInstance() === getInstance()`); construction registers the standard types (`image/png`, `video/mp4`, `audio/mp3`); `SUIMime.make(app, ext, desc)` registers under the `'stoked-ui'` type.
- `src/MimeType/MimeType.ts` — spot-check `ExtensionMimeTypeMap` for known extensions (`mp4`, `png`, `pdf`, `bin` → `application/octet-stream`) and an unknown-extension fallback.

#### `src/Types/mergeWith.ts` — `mergeWith` (Array prototype augmentation)
- Merges two arrays by `mergeKey`; second array overwrites on key collision.
- Filters falsy entries from both `this` and `otherArray` (`.filter(Boolean)`).
- Non-array `otherArray` → returns the filtered instance unchanged.
- **Edges:** empty arrays; duplicate keys within one array (last wins); `Map` insertion order preserved in output.
- **Prototype-patch guard:** importing the module installs `Array.prototype.mergeWith` (`mergeWith.ts:35`). Assert `[].mergeWith` is a function after import; keep this in its own file — it is a documented global side effect.

#### `src/Colors/colors.ts` — `compositeColors`
- Opaque overlay (`alpha === 1` or no alpha) → returns overlay color as hex, base ignored.
- Semi-transparent overlay → per-channel composite; assert exact hex for a known pair (e.g. base `#000000` + `rgba(255,255,255,0.5)` → `#808080`).
- Each input-format branch of `parseColorWithAlpha`: `#hex`, `hsl(...)`, `rgb(...)`/`rgba(...)`.
- **Error paths:** unsupported format (`'red'`) throws `'Unsupported color format'`; malformed rgb throws `'Invalid RGB color format'`.

#### `src/ProviderState/Settings.ts` + `ProviderState.ts` — `createSettings`, `createProviderState`
- `createSettings()` returns an empty settings object; with initial data it is populated.
- Nested get/set semantics (`NestedRecord`) — read/write a nested path.
- `createProviderState({...})` wires `FlagConfig` defaults correctly.

### Tier 2 — Async + timer logic

#### `src/FetchBackoff/FetchBackoff.ts` — `FetchBackoff`
- Happy path: first response passes the default `retryCondition` (`response.ok`) → returned immediately, `fetch` called once.
- Retries up to `retries` times on `!response.ok` / thrown error, with exponential delay (`initialDelay`, `initialDelay*backoffFactor`, …) — **use `jest.useFakeTimers()` + `jest.advanceTimersByTimeAsync`** to assert the schedule without real waits.
- Throws `'Fetch failed after maximum retries.'` after exhausting retries (`FetchBackoff.ts:52`).
- Custom `retryCondition` honored (e.g. retry only on 503).
- **Pin the current catch-branch quirk:** when `fetch` throws and `retryCondition(null, error)` is `false`, the implementation logs `console.error` but *still sleeps and retries* rather than rethrowing (`FetchBackoff.ts:33-40`). Write the test against observed behavior and flag it — if the intended behavior is "don't retry", fixing it is a governed red→green task, not a silent test adjustment.
- Mock `global.fetch` (`jest.fn()`) to script response/throw sequences; assert call counts. Spy on `console.error` for terminal failure (same pattern as `CalendarBooking.test.tsx`).

### Tier 3 — Hooks (jsdom + RTL `renderHook`)

#### `src/useResize/useResize.tsx` and `src/useResizeWindow/useResizeWindow.tsx`
- With a `ref` whose `current` has `offsetWidth`/`offsetHeight`, returns those dimensions.
- With `null` ref, falls back to `window.innerWidth`/`innerHeight`.
- Updates on window `resize` (dispatch `new Event('resize')` inside `act`).
- Removes the listener on unmount (assert via a `removeEventListener` spy).

### Tier 4 — IndexedDB store (integration-style)

#### `src/LocalDb/LocalDb.ts` (557 lines) + `src/LocalDb/VideoDb.tsx` — `LocalDb`
Highest-value but most involved. Wraps `@tempfix/idb` (`openDB`). Test with **`fake-indexeddb`** against the real `idb` API rather than mocking `openDB` — matches the repo preference for integration over mocks (`AX-CANDIDATE-REPO-NO-MOCKED-DB-IN-TESTS`) and validates the actual object-store shapes.
- Init creates the configured stores (`LocalDbProps.stores` / `initializeStores`); `disabled: true` is a no-op.
- `FileSaveRequest` round-trips: save file+blob, load back by name and by url (`FileLoadRequestByName` / `FileLoadRequestByUrl`); assert version bumping and `IDBFileVersion` shape (`data` Blob, `mimeType`, `videos`).
- Video save (`VideoSaveRequest`) attaches `IDBVideo` records to the right project/version; `VideoDb.tsx` helpers resolve against the same stores.
- Version list ordering and "latest version" resolution.
- **Browser-safety guard (separate, structural test):** import the barrel `src/index.tsx` in jsdom and assert it loads cleanly with no `@nestjs`/`mongoose`/`@aws-sdk`/`next/server` in the resolved module graph (`AX-REPO-BROWSER-NO-SERVER-DEPS`).

### Tier 5 — Presentational components (partly covered)

`SocialLinks` and `CalendarBooking` are done. Remaining: `GrokLoader` (140 lines, framer-motion animation — smoke render + key roles), `UserMenu` (122 lines — render authed/unauthed states, menu open/close, callback wiring). Mock `@mui/material/styles` `useTheme` the way `CalendarBooking.test.tsx` does when a full `ThemeProvider` is overkill. Also fix the existing `act(...)` warning in `CalendarBooking.test.tsx` (see §2).

### Not worth runtime tests (type-only surfaces)

`src/interfaces/upload-types.ts` (client-safe upload DTOs), `src/interfaces/publicity.ts`, `src/interfaces/embed-visibility.ts`, `src/Dialog/Dialog.types.ts`, `src/UserMenu/UserMenu.types.ts` — compile-time contracts with no runtime behavior. They are covered by the `pnpm --filter @stoked-ui/common typescript` gate, not Jest. Do not pad coverage numbers with trivial type tests; instead exclude `*.types.ts` / `*.d.ts` from `collectCoverageFrom`.

---

## 4. Framework, tooling, conventions

- **Runner:** Jest 29 + ts-jest (already the preset). No change needed.
- **New dev dep to add:** `fake-indexeddb` for the `LocalDb` tier. Prefer a per-file `import 'fake-indexeddb/auto'` over wiring it into the shared `setup.ts`, to avoid leaking a global IndexedDB into hook/component suites.
- **Component tests:** `@testing-library/react` 16 + `@testing-library/jest-dom` (already loaded via `src/__tests__/setup.ts`).
- **Timers:** `jest.useFakeTimers()` for `FetchBackoff` / any debounce path; pair with `jest.useRealTimers()` in `afterEach`.

### File organization & naming

- Co-locate tests in a `__tests__/` subfolder next to the module (existing convention: `SocialLinks/__tests__/*.test.ts(x)`). Do **not** scatter loose `*.test.ts` in module roots.
- Naming: `<Subject>.test.ts` for logic, `<Component>.test.tsx` for React. One subject per file.
- `jest.config.js` `testMatch` already picks up both `__tests__/**` and `*.test.*` — no config edit required.
- **Caution:** `testMatch` includes bare `**/__tests__/**/*.ts`, so any non-test helper placed in a `__tests__/` folder (other than the already-ignored `setup.ts`) will be treated as a suite. Name shared helpers `*.helper.ts` outside `__tests__/`, or add them to `testPathIgnorePatterns`.

---

## 5. Mock / stub & static-state strategy

- **`global.fetch`** — replace with `jest.fn()` per test (`FetchBackoff`); never hit the network.
- **IndexedDB** — use `fake-indexeddb` (real API surface), not a hand-rolled `openDB` mock.
- **`@mui/material/styles` `useTheme`** — mock with a minimal theme literal (see `CalendarBooking.test.tsx`) when a `ThemeProvider` wrapper is unnecessary.
- **`console.error`/`warn`** — spy + `mockImplementation(() => {})` in `beforeAll`, restore in `afterAll` (existing pattern) for code paths that intentionally log.
- **`window`/`sessionStorage`** — jsdom provides these; `clear()` in `beforeEach` for cache-backed code (existing `CalendarBooking` pattern).
- **Static mutable registries (`MimeRegistry` statics, `SUIMime.instance`, `Array.prototype.mergeWith`)** — these persist across tests in the same Jest worker. Guard against cross-test bleed:
  - For `MimeRegistry.create`, use a unique application/name per test or snapshot-and-restore the static maps in `afterEach`.
  - `SUIMime.getInstance()` memoizes on a private static — a test needing a "fresh" singleton must use `jest.resetModules()` + dynamic `import()`.
  - Treat the `Array.prototype` patch as a documented global side effect; test it in its own file.
  - Note: ts-jest `isolatedModules` affects *compilation only*; it does **not** reset module-level singletons between tests.

---

## 6. Coverage targets (medium priority)

| Area | Statements | Rationale |
| --- | --- | --- |
| Tier 1 pure utils (`Ids`, `MimeType`, `mergeWith`, `Colors`, `ProviderState`) | **90%+** | Deterministic, high fan-out, cheap to cover fully |
| `FetchBackoff` | **85%+** | Branchy retry logic; cover all `retryCondition` paths |
| Hooks (`useResize*`, `useIncId`) | **80%+** | jsdom-testable; cover ref/no-ref/resize/unmount |
| `LocalDb` / `VideoDb` | **70%+** | Higher integration cost; cover save/load/version round-trips |
| Components (`GrokLoader`, `UserMenu`) | **60%+** | Presentational; smoke + key interactions |
| **Package overall** | **~75% statements / 70% branches** | Appropriate for medium priority + high reuse |

Enable `coverageThreshold` in `jest.config.js` only **after** the Tier 1–2 suites land, so CI does not go red on the current untested surface. Start with:

```js
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/**/*.types.ts',
  '!src/**/index.{ts,tsx}',
  '!src/interfaces/**',
  '!**/__tests__/**',
],
```

---

## 7. First five test files to implement (in order)

Each is a self-contained red→green cycle per `~/.stokd/SC_AXIOMS.md` §5 — write the test, see it fail, implement/verify, see it pass. (For tests pinning existing behavior, "red" means the assertion fails until it correctly describes the real behavior — a wrong expectation is the failing state.)

1. **`src/Ids/namedId/__tests__/namedId.test.ts`** — format, prefix/suffix/length branches, `randomBytes` edges. *(Pure, zero deps — fastest win.)*
2. **`src/Types/__tests__/mergeWith.test.ts`** — merge-by-key, falsy filtering, non-array guard, prototype-install assertion.
3. **`src/MimeType/__tests__/IMimeType.test.ts`** — `getExtension` happy/edge paths, `MimeRegistry.create` four-index registration, `SUIMime` singleton + standard types (with static-state cleanup).
4. **`src/FetchBackoff/__tests__/FetchBackoff.test.ts`** — happy path, retry schedule with fake timers, exhaustion throw, custom `retryCondition`, the catch-branch quirk (§3 Tier 2).
5. **`src/Colors/__tests__/colors.test.ts`** — opaque passthrough, alpha composite math (exact hex), each input-format branch, both error throws.

After these: `useIncId` + `useResize*` (Tier 3), then `LocalDb` with `fake-indexeddb` (Tier 4), then `GrokLoader`/`UserMenu` smoke tests and the `CalendarBooking` `act(...)` cleanup (Tier 5).

---

## 8. Commands

```bash
# Run the whole suite (verified green 2026-07-02: 4 suites / 80 tests, ~12s)
pnpm --filter @stoked-ui/common test

# Watch a single new file while developing (TDD)
pnpm --filter @stoked-ui/common test:watch -- namedId

# Coverage report
pnpm --filter @stoked-ui/common test:coverage

# Typecheck (separate gate, must stay green — AX-REPO-PACKAGE-BARREL)
pnpm --filter @stoked-ui/common typescript
```

---

## 9. Guardrails to honor while testing

- **Barrel contract** (`AX-REPO-PACKAGE-BARREL`): every symbol exported from `src/index.tsx` is public — adding a test should never require widening the barrel. If a util is hard to test because it is not exported (e.g. `Dialog` types are currently *not* in the barrel), test it via its module path, not by changing the public surface.
- **Browser-safety** (`AX-REPO-BROWSER-NO-SERVER-DEPS`): all tests run under `jsdom`; a server-only import would surface as a load failure — keep that signal, don't stub around it.
- **Media-type coordination** (`AX-REPO-MEDIA-TYPE-COORDINATION`): `LocalDb` consumes `MimeType`; a change to either should keep both suites green simultaneously.
- **Behavior quirks are governed** (`AX-REPO-FLOWS-GOVERNED`, SC_AXIOMS §5.3): where a test pins surprising existing behavior (the `FetchBackoff` non-retryable-error path), changing the behavior later is a governed task with its own red→green cycle — never quietly rewrite the pinning test.
