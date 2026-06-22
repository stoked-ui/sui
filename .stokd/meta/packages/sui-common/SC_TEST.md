# SC_TEST.md — `@stoked-ui/common` Testing Strategy

> **Generated:** 2026-06-06 | **Updated:** 2026-06-22 (re-grounded against source; existing Jest setup + 4 SocialLinks/CalendarBooking suites verified) | **Meta version:** 0.4.0
> **Package:** `packages/sui-common` (`@stoked-ui/common`, v0.2.2) · **Priority:** medium
> **Runner:** Jest 29 + ts-jest + jsdom (already configured) · **Component tests:** `@testing-library/react` 16
> **Scope:** Browser-safe shared utilities, hooks, and presentational components. Foundational
> dependency for `@stoked-ui/editor`, `file-explorer`, `timeline`, `media`, `cdn`, and `github`.

---

## 1. Why testing this package matters

`@stoked-ui/common` is a leaf dependency consumed by nearly every other publishable package
(see `AX-REPO-MEDIA-TYPE-COORDINATION`, `AX-REPO-BROWSER-NO-SERVER-DEPS`). A regression here
fans out to the whole monorepo and is invisible at compile time for the runtime-only utilities
(`mergeWith` prototype patch, `MimeRegistry` static state, `LocalDb` IndexedDB shapes). The
barrel `src/index.tsx` (`AX-REPO-PACKAGE-BARREL`) is the published contract — every symbol it
re-exports is a public API that deserves at least one behavioral test.

A second, structural reason: this package MUST stay browser-safe. `LocalDb` is the IndexedDB
state store explicitly reserved for editor project/version/recording state by
`AX-REPO-MONGODB-BUSINESS-DATA`. Tests must guard that no server-only import (`@nestjs`,
`mongoose`, `@aws-sdk`, `next/server`) leaks into the browser barrel.

---

## 2. Current state

Existing tooling is in place and working — **do not re-scaffold it**:

- `jest.config.js` — `ts-jest` preset, `jsdom` env, `roots: ['<rootDir>/src']`, CSS mapped to
  `identity-obj-proxy`, `setupFilesAfterEach: src/__tests__/setup.ts` (loads
  `@testing-library/jest-dom`), `isolatedModules: true`, `testPathIgnorePatterns` excludes
  `build/` and `setup.ts`.
- Scripts: `pnpm --filter @stoked-ui/common test` / `test:watch` / `test:coverage`.

Existing tests (4 files, all in `__tests__/` subfolders):

| File | Covers |
| --- | --- |
| `src/SocialLinks/__tests__/platformRegistry.test.ts` | `PLATFORM_REGISTRY`, `getPlatformByKey`, `ALL_PLATFORM_KEYS` |
| `src/SocialLinks/__tests__/SocialLinks.test.tsx` | `SocialLinks` component |
| `src/SocialLinks/__tests__/SocialLinkField.test.tsx` | `SocialLinkField` component |
| `src/CalendarBooking/__tests__/CalendarBooking.test.tsx` | `CalendarBooking` (mocks `useTheme`, sessionStorage cache) |

**Coverage gap:** the entire utility/hook surface re-exported from `src/index.tsx` is
untested — `Ids`, `MimeType`, `FetchBackoff`, `Colors`, `Types`/`mergeWith`, `ProviderState`,
`LocalDb`, `useResize`, `useResizeWindow`, `GrokLoader`, `UserMenu`, `interfaces`. This is where
the first wave of work belongs.

---

## 3. What to test (by module, in priority order)

### Tier 1 — Pure logic, high fan-out, fast wins (do these first)

Deterministic, dependency-light, and back the rest of the monorepo.

#### `src/Ids/namedId/namedId.ts` — `namedId`, `randomBytes`
- `namedId()` → matches `^id-[0-9a-f]{7}$` (default id `id`, length 7).
- `namedId('foo')` (string form) → `^foo-[0-9a-f]{7}$`.
- `namedId({ id, length, prefix, suffix })` → assembled as `prefix-id-suffix-<hex>`; verify
  prefix-only and suffix-only branches independently.
- Custom `length` controls the hex segment length (e.g. `length: 16`).
- Two successive calls produce different suffixes (uniqueness, not collision-proof).
- `randomBytes(n)` → string of length `n`, hex chars only. **Edge:** `randomBytes(0)` → `''`;
  large `n` (e.g. 64).

#### `src/Ids/useIncId/useIncId.tsx` — `useIncId`
- Deterministic increment: same starting config yields the same sequence (stated purpose:
  hydration-safe ids). Test the returned generator and its `.by(n)` form.
- String-arg vs object-arg forms; `prefix` joins as `prefix-id`.

#### `src/MimeType/IMimeType.ts` — `getExtension`, `MimeRegistry`
- `getExtension('https://x.com/a/b/file.png')` → `.png`; query string / hash ignored.
- No extension (`/path/file`) → `''`. Dotfile / trailing-dot edge cases.
- `MimeRegistry.create(...)` registers the entry under all four indices (`exts`, `names`,
  `subtypes`, `types`) and the returned `IMimeType` getters (`type`, `subType`, `accept`,
  `typeObj`) return the composed values. **Note:** `MimeRegistry` holds **static mutable state** —
  see §5.
- `src/MimeType/MimeType.ts` — spot-check the `ExtensionMimeTypeMap` lookup for known extensions
  (`mp4`, `png`, `pdf`, `bin` → `application/octet-stream`) and an unknown-extension fallback.

#### `src/Types/mergeWith.ts` — `mergeWith` (Array prototype augmentation)
- Merges two arrays by key; second array overwrites on key collision.
- Filters falsy entries from both `this` and `otherArray` (`.filter(Boolean)`).
- Non-array `otherArray` → returns the filtered instance unchanged.
- **Edge:** empty arrays, duplicate keys within one array (last wins), preserves `Map` insertion
  order.
- **Prototype-patch guard:** importing the module installs `Array.prototype.mergeWith`. Assert
  `[].mergeWith` is a function after import; document the global side effect.

#### `src/Colors/colors.ts` — `compositeColors`
- Opaque overlay (`alpha === 1` or no alpha) → returns overlay color as hex, base ignored.
- Semi-transparent overlay (`rgba(...,0.5)`) → per-channel composite; assert exact hex for a known
  pair (e.g. base `#000000` + `rgba(255,255,255,0.5)` → `#808080`).
- Accepts `#hex`, `hsl(...)`, and `rgb(...)` inputs (each branch of `parseColorWithAlpha`).
- **Error paths:** unsupported format (e.g. `'red'`) throws `'Unsupported color format'`; malformed
  rgb throws `'Invalid RGB color format'`.

#### `src/ProviderState/Settings.ts` + `ProviderState.ts` — `createSettings`, `createProviderState`
- `createSettings()` returns an empty settings object; with initial data it is populated.
- Nested get/set semantics (`NestedRecord`) — read/write a nested path.
- `createProviderState({...})` wires `FlagConfig` defaults correctly.

### Tier 2 — Async + timer logic

#### `src/FetchBackoff/FetchBackoff.ts` — `FetchBackoff`
- Returns the response immediately when `retryCondition` is false (happy path, no retry).
- Retries up to `retries` times on `!response.ok`, applying exponential `backoffFactor` delay —
  **use `jest.useFakeTimers()` + `jest.advanceTimersByTimeAsync`** to assert the delay schedule
  (`initialDelay`, `initialDelay*factor`, …) without real waits.
- Throws `'Fetch failed after maximum retries.'` after exhausting retries.
- Custom `retryCondition` is honored (e.g. retry only on 503).
- Mock `global.fetch` (`jest.fn()`) to script the response/throw sequence; assert call count.
- Verify `console.error` is invoked on terminal failure (spy, as `CalendarBooking.test.tsx` does).

### Tier 3 — Hooks (jsdom + RTL `renderHook`)

#### `src/useResize/useResize.tsx` and `src/useResizeWindow`
- With a `ref` whose `current` has `offsetWidth/offsetHeight`, returns those dimensions.
- With `null` ref, falls back to `window.innerWidth/innerHeight`.
- Updates on `window` `resize` event (dispatch `new Event('resize')` within `act`).
- Removes the listener on unmount (assert via `removeEventListener` spy).

### Tier 4 — IndexedDB store (integration-style)

#### `src/LocalDb/LocalDb.ts` — `LocalDb`
Highest-value but most involved. Wraps `@tempfix/idb` (`openDB`). Test with **`fake-indexeddb`**
against the real `idb` API rather than mocking `openDB` — matches the repo preference for
integration over mocks (`AX-CANDIDATE-REPO-NO-MOCKED-DB-IN-TESTS`) and validates the actual
object-store shapes.
- Init creates the configured stores (`LocalDbProps.stores` / `initializeStores`); `disabled: true`
  is a no-op.
- `FileSaveRequest` round-trips: save file+blob, load back by name and by url
  (`FileLoadRequestByName` / `FileLoadRequestByUrl`); assert version bumping and `IDBFileVersion`
  shape (`data` Blob, `mimeType`, `videos`).
- Video save (`VideoSaveRequest`) attaches `IDBVideo` records to the right project/version.
- Version list ordering and "latest version" resolution.
- **Browser-safety guard (separate, structural test):** assert `LocalDb` and the barrel import
  cleanly in jsdom with no `@nestjs`/`mongoose`/`@aws-sdk`/`next/server` in the resolved module
  graph.

### Tier 5 — Presentational components (partly covered)

`GrokLoader`, `UserMenu`, `Dialog`, `SocialLinks` (done), `CalendarBooking` (done). For untested
components, render with RTL, assert key roles/text, exercise callbacks via `fireEvent`. Mock
`@mui/material/styles` `useTheme` the way `CalendarBooking.test.tsx` does when a full
`ThemeProvider` is overkill.

---

## 4. Framework, tooling, conventions

- **Runner:** Jest 29 + ts-jest (already the preset). No change needed.
- **New dev dep to add:** `fake-indexeddb` for the `LocalDb` tier. Prefer a per-file
  `import 'fake-indexeddb/auto'` over wiring it into the shared `setup.ts`, to avoid leaking a
  global IndexedDB into hook/component suites.
- **Component tests:** `@testing-library/react` 16 + `@testing-library/jest-dom` (already in setup).
- **Timers:** `jest.useFakeTimers()` for `FetchBackoff` / any debounce path; pair with
  `jest.useRealTimers()` in `afterEach`.

### File organization & naming
- Co-locate tests in a `__tests__/` subfolder next to the module (matches existing convention:
  `SocialLinks/__tests__/*.test.ts(x)`). Do **not** scatter loose `*.test.ts` in module roots.
- Naming: `<Subject>.test.ts` for logic, `<Component>.test.tsx` for React. One subject per file.
- `jest.config.js` `testMatch` already picks up both `__tests__/**` and `*.test.*` — no config edit
  required.

---

## 5. Mock / stub & static-state strategy

- **`global.fetch`** — replace with `jest.fn()` per test (`FetchBackoff`); never hit the network.
- **IndexedDB** — use `fake-indexeddb` (real API surface), not a hand-rolled `openDB` mock.
- **`@mui/material/styles` `useTheme`** — mock with a minimal theme literal (see
  `CalendarBooking.test.tsx`) when a `ThemeProvider` wrapper is unnecessary.
- **`console.error`/`warn`** — spy + `mockImplementation(() => {})` in `beforeAll`, restore in
  `afterAll` (existing pattern) for code paths that intentionally log.
- **`window`/`sessionStorage`** — jsdom provides these; `clear()` in `beforeEach` for cache-backed
  code (existing `CalendarBooking` pattern).
- **Static mutable registries (`MimeRegistry`, `SUIMime`, `Array.prototype.mergeWith`)** — these
  persist across tests in the same Jest worker. Guard against cross-test bleed:
  - For `MimeRegistry.create`, use unique application/name per test or snapshot-and-restore the
    static maps in `afterEach`.
  - Treat the `Array.prototype` patch as a documented global side effect; test it in its own file.
  - `isolatedModules: true` does **not** reset module-level singletons between tests in a file — use
    `jest.resetModules()` + dynamic `import()` if a clean registry is needed.

---

## 6. Coverage targets (medium priority)

| Area | Statements | Rationale |
| --- | --- | --- |
| Tier 1 pure utils (`Ids`, `MimeType.getExtension`, `mergeWith`, `Colors`, `ProviderState`) | **90%+** | Deterministic, high fan-out, cheap to cover fully |
| `FetchBackoff` | **85%+** | Branchy retry logic; cover all `retryCondition` paths |
| Hooks (`useResize*`) | **80%+** | jsdom-testable; cover ref/no-ref/resize/unmount |
| `LocalDb` | **70%+** | Higher integration cost; cover save/load/version round-trips |
| Components (`GrokLoader`, `UserMenu`, `Dialog`) | **60%+** | Presentational; smoke + key interactions |
| **Package overall** | **~75% statements / 70% branches** | Appropriate for medium priority + high reuse |

Enable `coverageThreshold` in `jest.config.js` only **after** the Tier 1–2 suites land, so CI does
not red on the current untested surface. Start with
`collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/index.{ts,tsx}', '!**/__tests__/**']`.

---

## 7. First five test files to implement (in order)

Each is a self-contained red→green cycle per `~/.stokd/SC_AXIOMS.md` §5 — write the test, see it
fail, implement/verify, see it pass.

1. **`src/Ids/namedId/__tests__/namedId.test.ts`** — format, prefix/suffix/length branches,
   `randomBytes` edges. *(Pure, zero deps — fastest win.)*
2. **`src/Types/__tests__/mergeWith.test.ts`** — merge-by-key, falsy filtering, non-array guard,
   prototype-install assertion.
3. **`src/MimeType/__tests__/IMimeType.test.ts`** — `getExtension` happy/edge paths +
   `MimeRegistry.create` four-index registration (with static-state cleanup).
4. **`src/FetchBackoff/__tests__/FetchBackoff.test.ts`** — happy path, retry schedule with fake
   timers, exhaustion throw, custom `retryCondition`.
5. **`src/Colors/__tests__/colors.test.ts`** — opaque passthrough, alpha composite math (exact
   hex), each input-format branch, both error throws.

After these, proceed to `useResize` (Tier 3) and `LocalDb` (Tier 4, add `fake-indexeddb`).

---

## 8. Commands

```bash
# Run the whole suite
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

- **Barrel contract** (`AX-REPO-PACKAGE-BARREL`): every symbol exported from `src/index.tsx` is
  public — adding a test should never require widening the barrel. If a util is hard to test because
  it is not exported, test it via its module path, not by changing the public surface.
- **Browser-safety** (`AX-REPO-BROWSER-NO-SERVER-DEPS`): all tests run under `jsdom`; a server-only
  import would surface as a load failure — keep that signal, don't stub around it.
- **Media-type coordination** (`AX-REPO-MEDIA-TYPE-COORDINATION`): `LocalDb` consumes `MimeType`; a
  change to either should keep both suites green simultaneously.
