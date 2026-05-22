# Testing Strategy: `@stoked-ui/file-explorer`

> **Generated:** 2026-05-21 | **Meta version:** 0.3.1
> **Package:** `packages/sui-file-explorer` (`@stoked-ui/file-explorer` v0.1.2)
> **Priority:** Medium
> **Source entry:** `packages/sui-file-explorer/src/index.ts`

`@stoked-ui/file-explorer` is a fork of `@mui/x-tree-view` extended with
`@atlaskit/pragmatic-drag-and-drop` for internal/external file moves, an
optional grid view, runtime feature flags, and a small media-aware extension
surface. It is consumed by `@stoked-ui/editor` and the docs site, so bugs
are user-visible. Most of the package is plugin code that can be exercised
through a JSDOM harness; only the actual drag/drop monitoring requires a real
browser. Test investment should focus on the plugin contracts
(`useFileExplorerSelection`, `useFileExplorerExpansion`,
`useFileExplorerKeyboardNavigation`, `useFileExplorerFocus`,
`useFileExplorerFiles`, `useFileExplorerDnd`, `useFileExplorerGrid`,
`useFileExplorerIcons`), the export utilities, and the feature-flag plumbing —
which is exactly the set of files that already has tests on disk but **most
cannot run today** because of broken import paths.

---

## 1. Current State

| Item | Status |
|---|---|
| Test runner | Mocha 10 (root `.mocharc.js`) — Babel + JSDOM |
| Setup | `@stoked-ui/internal-test-utils/setupBabel`, `@stoked-ui/internal-test-utils/setupJSDOM` |
| Assertions | Mixed — `chai` + `sinon` (declared in `devDependencies`) **and** `@jest/globals`/`@stoked-ui/internal-test-utils` jest-style `expect` (in `featureFlags/*.test.ts`, `useFileExplorerDnd/fileExportUtils.test.ts`). This inconsistency is a problem (see §3). |
| Per-package script | None — `package.json` has no `test` entry. Runs from root via `pnpm test` / `pnpm test:coverage`. |
| Conformance | Driven through the root `test/utils/describeConformance.ts`. Used by `FileExplorer.test.tsx`, `FileExplorerBasic.test.tsx`, `FileDropzone.test.tsx`, `FileElement.test.tsx`, `File.test.tsx`. |
| Plugin harness | Lives at `test/utils/file-explorer/describeFileExplorer/describeFileExplorer.tsx` — but tests import it from four different non-existent paths (see §1.2). |
| Karma / browser tests | Not wired up; pragmatic-drag-and-drop monitor cannot fire under JSDOM. |
| Benchmarks | `src/FileExplorer/FileExplorer.benchmark.tsx` plus `test-benchmark.html` and `benchmark-results.json` at the package root. Not part of the test suite. |
| CI gating | Rolls into the umbrella `pnpm test` / `pnpm test:coverage` from the root via `mocha 'packages/**/*.test.{js,ts,tsx}'`. |

### 1.1 Existing test files (20 in total)

Component / view conformance:

- `src/FileExplorer/FileExplorer.test.tsx` — single conformance via root `describeConformance`.
- `src/FileExplorer/FileExplorerAlternatingRows.test.tsx`
- `src/FileExplorerBasic/FileExplorerBasic.test.tsx` — single conformance.
- `src/File/File.test.tsx`
- `src/FileElement/FileElement.test.tsx`
- `src/FileDropzone/FileDropzone.test.tsx` — suite name is `'ee<FileDropzone />'` (typo, still present).
- `src/FileDropzone/FileDropzone.test.js` — duplicate of the `.tsx`; should be deleted.
- `src/themeAugmentation/themeAugmentation.spec.ts` — type-only spec.

Hooks / plugins (all use `describeFileExplorer<[…signatures]>` from a plugin harness):

- `src/useFile/useFile.test.tsx`
- `src/internals/useFileExplorer/useFileExplorer.test.tsx`
- `src/internals/plugins/useFileExplorerSelection/useFileExplorerSelection.test.tsx`
- `src/internals/plugins/useFileExplorerExpansion/useFileExplorerExpansion.test.tsx`
- `src/internals/plugins/useFileExplorerFocus/useFileExplorerFocus.test.tsx`
- `src/internals/plugins/useFileExplorerKeyboardNavigation/useFileExplorerKeyboardNavigation.test.tsx`
- `src/internals/plugins/useFileExplorerFiles/useFileExplorerFiles.test.tsx`
- `src/internals/plugins/useFileExplorerIcons/useFileExplorerIcons.test.tsx`
- `src/internals/plugins/useFileExplorerGrid/useFileExplorerGrid.test.tsx`

Pure logic (no harness dependency):

- `src/internals/plugins/useFileExplorerDnd/fileExportUtils.test.ts` — `@jest/globals` style.
- `src/featureFlags/FeatureFlagConfig.test.ts` — jest-style `expect` from `@stoked-ui/internal-test-utils`.
- `src/featureFlags/FeatureFlagContext.test.tsx` — jest-style.

### 1.2 Critical blockers (verified 2026-05-21)

1. **Broken `describeFileExplorer` import paths.** The harness exists at
   `test/utils/file-explorer/describeFileExplorer/describeFileExplorer.tsx`,
   but the plugin/component tests import it from four ghost paths:
   - `test/utils/fileExplorer-view/describeFileExplorer` — used by `useFile/useFile.test.tsx`, `useFileExplorerSelection`, `useFileExplorerIcons`, `useFileExplorerExpansion`, `useFileExplorerKeyboardNavigation`, `useFileExplorerFocus`
   - `test/utils/fileExplorer/describeFileExplorer` — used by `useFileExplorerFiles`
   - `test/utils/tree-view/describeFileExplorer` — used by `FileElement.test.tsx`
   - `test/utils/file-list/describeFileExplorer` — used by `useFileExplorerGrid`

   Every `useFileExplorer*` test fails to resolve at compile/import time.
   This is the single highest-leverage fix in the package.
2. **Mixed assertion libraries.** `chai`/`sinon` is the package convention
   (declared in `devDependencies`, used by every plugin/conformance test) but
   `featureFlags/*.test.ts` and `fileExportUtils.test.ts` use jest-style
   `expect`. Pick one and standardize.
3. **`FileDropzone.test.js` shadows `FileDropzone.test.tsx`.** Both run.
   Delete the `.js`.
4. **`describe('ee<FileDropzone />', ...)` typo** at
   `src/FileDropzone/FileDropzone.test.tsx:9`.

---

## 2. What Should Be Tested

### Tier 1 — Critical, ship-blocking (fix or write first)

| Module | File | Why it matters |
|---|---|---|
| Plugin harness imports | `src/internals/plugins/**/*.test.tsx`, `src/internals/useFileExplorer/useFileExplorer.test.tsx`, `src/useFile/useFile.test.tsx` | These are the only meaningful behavioral tests in the package. All currently fail to import the harness (§1.2). Fixing the import path restores ~9 test files. |
| `useFileExplorerSelection` | `src/internals/plugins/useFileExplorerSelection/useFileExplorerSelection.tsx` | Owns selection state, single vs multi, controlled vs uncontrolled. Existing test file is comprehensive — make it run. |
| `useFileExplorerKeyboardNavigation` | `src/internals/plugins/useFileExplorerKeyboardNavigation/useFileExplorerKeyboardNavigation.ts` | A11y. Arrow / Home / End / Space / Enter / type-ahead. Existing test file is the canonical place for these. |
| `useFileExplorerExpansion` | `src/internals/plugins/useFileExplorerExpansion/` | Expand/collapse — easy to silently break when porting MUI X upstream changes. |
| `useFileExplorerFocus` | `src/internals/plugins/useFileExplorerFocus/` | Focus management interacts with selection and DnD; regressions cascade. |
| `useFileExplorerDnd` core paths | `src/internals/plugins/useFileExplorerDnd/useFileExplorerDnd.tsx`, `fileValidation.ts`, `muiXDndAdapters.ts` | This is the main differentiator vs upstream `@mui/x-tree-view`. Stub `@atlaskit/pragmatic-drag-and-drop` `monitorForElements` and assert: `fileValidation.ts` rejects (a) folder→descendant, (b) drop on self, (c) trash drop semantics. |
| `fileExportUtils` | `src/internals/plugins/useFileExplorerDnd/fileExportUtils.ts` | Already covered by `fileExportUtils.test.ts`. Standardize its assertions onto chai. |
| `FeatureFlagConfig` + Context | `src/featureFlags/FeatureFlagConfig.ts`, `FeatureFlagContext.tsx` | Runtime kill switch for `USE_MUI_X_RENDERING`, `DND_INTERNAL`, `DND_EXTERNAL`, `DND_TRASH`. Existing tests cover this. Standardize assertions and verify `shouldShowFeature` rollout-percentage edge cases (0%, 100%, hash boundary). |

### Tier 2 — Important utilities

| Module | File | Why |
|---|---|---|
| `useFileExplorerFiles` | `src/internals/plugins/useFileExplorerFiles/useFileExplorerFiles.utils.ts` (the `.tsx` is the plugin) | Tree flatten / lookup utilities — pure logic, easy wins for line coverage. |
| `useFileExplorerGrid` | `src/internals/plugins/useFileExplorerGrid/` | Grid view layout / column toggling. Has an existing test file blocked by the same import bug. |
| `useFileExplorerIcons` | `src/internals/plugins/useFileExplorerIcons/` | Icon resolution by mediaType / type. Existing test blocked. |
| `useFileUtils` (under hooks) | `src/hooks/useFileUtils/` | Shared helpers used by `File`/`FileElement`. |
| `useFileState` / `useFileElementState` | `src/File/useFileState.ts`, `src/FileElement/useFileElementState.ts` | Drive the per-row UX (selected, expanded, focused). Currently only covered transitively via conformance. |
| `FileExplorerWithFlags` / `FileExplorerLegacy` | `src/FileExplorer/FileExplorerWithFlags.tsx`, `FileExplorerLegacy.tsx` | Smoke test that flipping `USE_MUI_X_RENDERING` swaps the underlying renderer. |
| `FileExplorerTabs` | `src/FileExplorerTabs/` | No tests today; a render-with-tabs smoke is enough. |
| `useFileExplorerApiRef` | `src/hooks/useFileExplorerApiRef.tsx` | Imperative ref — assert ref stability across renders and that the exposed methods exist. |

### Tier 3 — Light coverage

| Module | File | Coverage goal |
|---|---|---|
| `File`, `FileElement`, `FileDropzone`, `FileExplorerBasic`, `FileExplorer` | conformance test files already exist | Keep one conformance test each; do not expand. |
| `themeAugmentation` | `src/themeAugmentation/themeAugmentation.spec.ts` | Type-only — keep. |
| `icons/*`, `models/items.ts` | static maps | No tests needed unless logic is added. |
| `FileExplorer.benchmark.tsx` + `test-benchmark.html` | manual bench | Out of test suite; don't gate CI on it. |

### Out of scope

- Real `@atlaskit/pragmatic-drag-and-drop` monitor firing (requires a real browser; document and skip under JSDOM).
- `@react-spring/web` animation timing — render the start/end states only.
- `prop-types` runtime warnings — covered transitively by `describeConformance`.
- `@mui/x-tree-view` internals — upstream's responsibility.
- Visual regression / screenshot — no Argos pipeline in this repo.

---

## 3. Tooling

The current toolchain (Mocha + Babel + JSDOM via root config) is correct.
**Do not introduce Jest, Vitest, or RTL `jest-dom` matchers** — that diverges
from `sui-editor`, `sui-timeline`, and the umbrella runner. The
`@jest/globals` import in `fileExportUtils.test.ts` and the jest-style
`expect(...).toBe(...)` in `featureFlags/*.test.ts` should be migrated to
`chai`'s `expect(...).to.equal(...)`.

- **Runner:** Mocha 10 via root `pnpm test` / `pnpm test:coverage` (`nyc` over `mocha 'packages/**/*.test.{js,ts,tsx}'`).
- **DOM:** JSDOM via `@stoked-ui/internal-test-utils/setupJSDOM`.
- **Compilation:** Babel via `@stoked-ui/internal-test-utils/setupBabel`.
- **Assertions:** `chai` `expect`. Mocks via `sinon` `spy`/`stub`/`fake`.
- **React testing:** `act`, `fireEvent` from `@stoked-ui/internal-test-utils`. Don't import `@testing-library/react` directly.
- **Conformance:** `test/utils/describeConformance.ts` (already used by 6 component test files).
- **Plugin harness:** `test/utils/file-explorer/describeFileExplorer/describeFileExplorer.tsx` — already authored, just needs callers to import the right path.
- **DnD doubles:** stub `@atlaskit/pragmatic-drag-and-drop` `monitorForElements` and `draggable` via `sinon.replace` at the top of each DnD test, returning a manual trigger that the test calls to simulate drop events.
- **Karma (browser):** Optional. Only opt in if a future suite needs the real `pragmatic-drag-and-drop` monitor.

### Add a per-package test script

`packages/sui-file-explorer/package.json` is missing a `test` script. Add:

```jsonc
"scripts": {
  "test": "cross-env NODE_ENV=test mocha 'src/**/*.test.{ts,tsx}'",
  "test:watch": "pnpm test -- --watch"
}
```

This lets `turbo run test --filter=@stoked-ui/file-explorer` work without going through the root.

---

## 4. Test File Organization & Naming

Match the existing co-located pattern — do not centralize tests under a
top-level `__tests__/`:

- **Component tests:** `src/<Component>/<Component>.test.tsx` next to source.
- **Plugin tests:** `src/internals/plugins/<plugin>/<plugin>.test.tsx`, using `describeFileExplorer<[<plugin>Signature]>(...)`.
- **Hook tests:** `src/<hook>/<hook>.test.tsx` (e.g. `useFile/useFile.test.tsx`) or `src/internals/<hook>/<hook>.test.tsx`.
- **Pure utility tests:** `src/.../<util>.test.ts` (no `.tsx` if no JSX). Already follows: `useFileExplorerDnd/fileExportUtils.test.ts`.
- **Type-only specs:** `*.spec.ts` / `*.spec.tsx` under `src/themeAugmentation/` — validated by `tsc`, excluded from Mocha by being `.spec.*`. (Root mocharc only globs `*.test.*`.)
- **Shared harness:** keep at `test/utils/file-explorer/describeFileExplorer/`. Do **not** move it to `test/utils/fileExplorer/` etc. — fix the callers instead.

Naming, in order of preference:

```
describe('<ComponentName>', () => {
  describe('<feature>', () => {
    it('should <expected behavior> when <condition>', () => { ... })
  })
})
```

For plugin tests use:

```
describeFileExplorer<[UseFileExplorerXxxSignature, …]>('useFileExplorerXxx plugin', ({ render }) => { … })
```

so the harness can render against both `FileExplorerBasic` and the full `FileExplorer`.

---

## 5. Mock & Stub Strategy

Stub at the boundary, not deep inside the plugins.

| API | Mock approach |
|---|---|
| `@atlaskit/pragmatic-drag-and-drop` (`draggable`, `monitorForElements`, `dropTargetForElements`) | `sinon.stub` the module export to capture the registered callbacks, then call them manually with a fake `DragEvent`-shaped payload. Reset stubs in `afterEach`. |
| `@atlaskit/pragmatic-drag-and-drop-flourish` / `-hitbox` / `-react-drop-indicator` | Stub to no-op — they are visual flair. |
| `DataTransfer` / `File` / `FileList` (external file drops) | Construct via `new File([blob], 'name.txt', { type })`. JSDOM supports both. For `DataTransfer`, use the `@stoked-ui/internal-test-utils` polyfill or hand-roll `{ items, files, types, getData }`. |
| `@react-spring/web` | Render-through is fine; for assertions on `useTransition` results, prefer `@react-spring/web` `Globals.assign({ skipAnimation: true })` in a `before` hook. |
| `@mui/x-tree-view` | Real — it's the underlying engine when `USE_MUI_X_RENDERING` is on. Don't mock. |
| `@stoked-ui/media` (peer dep) | Real for happy-path; for unit tests that only need mediaType resolution, stub `MimeRegistry` lookups to a deterministic value. |
| `@stoked-ui/common` | Real. |
| `tiny-invariant` | Real — let invariant violations surface as thrown errors and assert with `expect(...).to.throw(/text/)`. |
| `prop-types` warnings | Capture via `consoleErrorMock` from `@stoked-ui/internal-test-utils` (already used in conformance). |
| `IntersectionObserver` / `ResizeObserver` | Polyfilled in `setupJSDOM`. Verify before adding a custom stub. |

**Module-level static state** — `DEFAULT_FEATURE_FLAGS`, `ENVIRONMENT_CONFIGS`,
and `FEATURE_FLAG_DEPENDENCIES` (`src/featureFlags/FeatureFlagConfig.ts`) are
exported objects. If a test mutates them, restore in `afterEach` — otherwise
suite ordering becomes load-bearing.

---

## 6. Coverage Targets

This package is `Medium` priority and ~70% logic / ~30% UI. The plugin layer
is highly testable; aim higher there than at the component layer.

| Layer | Target line coverage |
|---|---|
| `src/internals/plugins/**` (excluding DnD monitor wiring) | **80%** — pure plugin reducers, deterministic |
| `src/internals/plugins/useFileExplorerDnd/**` | **65%** — exclude lines that touch `monitorForElements` callbacks |
| `src/internals/useFileExplorer/**` | **75%** |
| `src/featureFlags/**` | **90%** — config + context, all logic |
| `src/useFile/**`, `src/File/**`, `src/FileElement/**` | **60%** — render + slot conformance |
| `src/FileExplorer/**`, `src/FileExplorerBasic/**` | **55%** — conformance + a few interaction tests |
| `src/FileDropzone/**`, `src/FileExplorerTabs/**` | **40%** — smoke render |
| `src/icons/**`, `src/models/**`, `src/themeAugmentation/**` | n/a — type / static |
| Package overall | **65–70% lines / 55% branches** |

Track via `pnpm test:coverage` from the root — it already includes
`packages/**/*.test.{js,ts,tsx}` in its globs.

---

## 7. Specific Test Cases to Implement First

In order. Each is small enough to ship in one PR.

1. **Fix the broken `describeFileExplorer` import path.**
   Find/replace across `packages/sui-file-explorer/src/**/*.test.tsx`:
   - `'test/utils/fileExplorer-view/describeFileExplorer'` → `'test/utils/file-explorer/describeFileExplorer'`
   - `'test/utils/fileExplorer/describeFileExplorer'` → `'test/utils/file-explorer/describeFileExplorer'`
   - `'test/utils/tree-view/describeFileExplorer'` → `'test/utils/file-explorer/describeFileExplorer'`
   - `'test/utils/file-list/describeFileExplorer'` → `'test/utils/file-explorer/describeFileExplorer'`

   Then run `pnpm test --filter=@stoked-ui/file-explorer` and triage what
   actually executes vs what is silently skipped. This single PR
   unblocks ~9 test files.

2. **Delete `src/FileDropzone/FileDropzone.test.js`** (duplicate of the `.tsx` and
   the `.tsx` is the canonical one). Fix the
   `describe('ee<FileDropzone />', …)` typo on line 9 of the `.tsx` to
   `describe('<FileDropzone />', …)`.

3. **Standardize feature-flag tests on chai/sinon.**
   `src/featureFlags/FeatureFlagConfig.test.ts` and
   `src/featureFlags/FeatureFlagContext.test.tsx` use jest-style
   `expect(...).toBe(...)`. Convert to `import { expect } from 'chai'` and
   `expect(...).to.equal(...)`. This matches every other `*.test.tsx` in the
   package.

4. **Standardize `fileExportUtils.test.ts`.**
   Drop the `@jest/globals` import, swap `expect(...).toBe(...)` to chai. Add
   missing cases: (a) `fileBaseToBlob` round-trip preserves `mediaType`, (b)
   `createDownloadUrl` revokes the previous URL when called twice, (c)
   `isExportable` returns `false` for `type: 'trash-folder'` if that variant
   exists in `FileBase`.

5. **Add `fileValidation` unit tests.** New file:
   `src/internals/plugins/useFileExplorerDnd/fileValidation.test.ts`.
   Cover the deterministic guards:
   - drop a folder onto its own descendant → invalid
   - drop a node onto itself → invalid
   - drop into trash → maps to delete intent
   - drop a non-folder onto a non-folder peer → reorder, not nest

6. **Add a stubbed-monitor DnD plugin smoke test.** New file:
   `src/internals/plugins/useFileExplorerDnd/useFileExplorerDnd.test.tsx`.
   Use `sinon.replace` to swap `monitorForElements` for a fake that captures
   the `onDrop` callback. Render via `describeFileExplorer`, fire the captured
   callback with a synthetic payload, assert the resulting tree mutation.

7. **Add `useFileExplorerApiRef` ref-stability test.** New file:
   `src/hooks/useFileExplorerApiRef.test.tsx`.
   - The ref instance is stable across re-renders.
   - The exposed methods (`getItem`, `selectItem`, `focusItem`, `expandItem`,
     etc.) are present and callable after mount.

8. **Add a `FileExplorerWithFlags` rendering test.** New file:
   `src/FileExplorer/FileExplorerWithFlags.test.tsx`.
   - With `USE_MUI_X_RENDERING = true` it renders the MUI X `RichTreeView`.
   - With `USE_MUI_X_RENDERING = false` it renders `FileExplorerLegacy`.
   - Toggling at runtime via `FeatureFlagContext` swaps the renderer without
     unmounting consumer state.

9. **Expand `useFileExplorerKeyboardNavigation` matrix.** In the existing
   test file, add: ArrowUp at top wraps/clamps, Home/End jump, Space toggles
   selection without losing focus, type-ahead resets after the configured
   timeout.

10. **Wire the per-package `test` script** (§3) and add it to `turbo.json`
    pipeline if not already declared.

---

## 8. Known Gotchas (carry into tests)

- **Static feature-flag objects are exported by reference.** Mutating
  `DEFAULT_FEATURE_FLAGS` in one test poisons every later test. Snapshot via
  `{ ...DEFAULT_FEATURE_FLAGS }` and restore in `afterEach`.
- **`MimeRegistry` from `@stoked-ui/common` registers globally on module load.**
  If a test registers a custom mime type, deregister it in `afterEach` or
  later tests will see the leak.
- **Pragmatic-DnD `monitorForElements` returns a cleanup function.** Tests
  that mount and unmount must call the cleanup; otherwise the next test sees a
  registered monitor and double-fires.
- **`@react-spring/web` `useTransition` runs effects asynchronously.** Use
  `act` around state changes that animate, and prefer
  `Globals.assign({ skipAnimation: true })` in a top-level `before` hook for
  the suite.
- **`describeConformance` skips `componentProp`, `componentsProp`, and
  `themeVariants`** in every component test (see `FileExplorer.test.tsx:18`,
  `FileDropzone.test.tsx:18`, etc.). When adding new components, follow the
  same skip list — these are deliberately not supported.
- **`FileBase.type` includes `'trash'` and `'folder'`** — `isExportable`
  short-circuits on both. Any new code that branches on `type` must keep
  trash and folder handled explicitly, and a regression test should pin that.
- **Tests reference `'test/utils/...'` (root-relative).** This works only
  because the root `tsconfig.json` and Babel config define a path alias.
  Don't change the alias without updating every test.
