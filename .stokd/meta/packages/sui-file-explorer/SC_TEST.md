# Testing Strategy: `@stoked-ui/file-explorer`

> **Generated:** 2026-05-21 · **Refreshed:** 2026-06-06 (runtime-verified under Node 20.20.0 + Mocha 10) | **Meta version:** 0.4.0
> **Package:** `packages/sui-file-explorer` (`@stoked-ui/file-explorer` v0.1.2)
> **Priority:** Medium
> **Source entry:** `packages/sui-file-explorer/src/index.ts`

`@stoked-ui/file-explorer` is a fork of `@mui/x-tree-view` extended with
`@atlaskit/pragmatic-drag-and-drop` for internal/external file moves, an
optional grid view (`useFileExplorerGrid`), runtime feature flags
(`src/featureFlags/`), and a media-aware extension surface. It is consumed by
`@stoked-ui/editor` and the docs site (port 5199), so bugs are user-visible.
~14,000 LOC of source, ~5,000 LOC of tests across 20 test files.

The hard truth, verified by actually running the suite (not just reading it):
**almost none of the existing test files run today.** The package carries
~5,000 lines of tests that are a partially-migrated copy of MUI X's
`x-tree-view` suite — the import paths, the shared harness location, the source
package names (`@mui/x-*`), the assertion library, and even the test runner
were never fully rewired to this repo. One file (`fileExportUtils.test.ts`)
**aborts the entire umbrella `pnpm test` run for the whole monorepo.** Restoring
this suite to green is the single highest-leverage work in the package, and it
is mostly mechanical.

---

## 1. Current State

| Item | Status |
|---|---|
| Test runner | Mocha 10 (root `.mocharc.js`) — Babel + JSDOM. Canonical for the repo. |
| Setup | `@stoked-ui/internal-test-utils/setupBabel`, `@stoked-ui/internal-test-utils/setupJSDOM` (root `.mocharc.js` `require`) |
| Node | **Node 20.20.0 required** (`nvm use 20.20.0`). Node 26 breaks Mocha in this repo. |
| Assertions | Should be `chai` + `sinon` (declared in `devDependencies`). In practice **mixed** — see blockers B1/B2. |
| Per-package script | **None** — `package.json` has no `test` entry. Runs only via the root globs. |
| Conformance harness | `test/utils/describeConformance.ts` (root). Imported by 5 component tests. |
| Plugin harness | Authored at `test/utils/file-explorer/describeFileExplorer/describeFileExplorer.tsx`, but **every caller imports it from a wrong path** (B3). |
| Karma / browser | Not wired. The real pragmatic-drag-and-drop monitor cannot fire under JSDOM. |
| Benchmarks | `src/FileExplorer/FileExplorer.benchmark.tsx` + `test-benchmark.html` + `benchmark-results.json` at package root. Not part of the suite; don't gate CI on it. |
| CI gating | Folds into the root umbrella `mocha 'packages/**/*.test.{js,ts,tsx}'` (`pnpm test`, `pnpm test:coverage`, `turbo run test`). |

### 1.1 Existing test files (20 total) and their verified status

Status legend: ✅ runs · 🔴 errors at load (does not run) · 🟡 type-only (tsc, not Mocha)

**Component / view conformance**
- 🔴 `src/FileExplorer/FileExplorer.test.tsx` — subpath import `@stoked-ui/file-explorer/FileExplorer` fails (B4). `Cannot find module '../../FileExplorer'`.
- 🔴 `src/FileExplorer/FileExplorerAlternatingRows.test.tsx` — resolves source via relative imports, then dies on `ERR_UNSUPPORTED_DIR_IMPORT` for `@mui/material/SvgIcon` (B5).
- 🔴 `src/FileExplorerBasic/FileExplorerBasic.test.tsx` — subpath import fails (B4). `Cannot find module '../../FileExplorerBasic'`.
- 🔴 `src/File/File.test.tsx` — imports `@mui/x-tree-view/FileElement` and `@mui/x-tree-view/internals/...` (B6). `Cannot find module`.
- 🔴 `src/FileElement/FileElement.test.tsx` — imports `@mui/x-tree-view/FileElement` + harness from `test/utils/tree-view/describeFileExplorer` (B3, B6).
- 🔴 `src/FileDropzone/FileDropzone.test.tsx` — subpath import fails (B4); suite name typo `'ee<FileDropzone />'` (B7).
- 🔴 `src/FileDropzone/FileDropzone.test.js` — committed transpiled duplicate of the `.tsx` (`"use strict"`/`require`/`var`). Both match the glob (B8).
- 🟡 `src/themeAugmentation/themeAugmentation.spec.ts` — type-only; `.spec.ts` is **not** matched by the Mocha glob (`*.test.*`). Validated by `tsc`. This is the only file that "works" as intended.

**Hooks / plugins** (all use `describeFileExplorer<[…Signature]>` from the harness)
- 🔴 `src/useFile/useFile.test.tsx` — harness path `test/utils/fileExplorer-view/...` (B3).
- 🔴 `src/internals/useFileExplorer/useFileExplorer.test.tsx` — harness `fileExplorer-view` (B3).
- 🔴 `src/internals/plugins/useFileExplorerSelection/useFileExplorerSelection.test.tsx` (797 LOC — the richest file) — harness `fileExplorer-view` (B3).
- 🔴 `src/internals/plugins/useFileExplorerKeyboardNavigation/useFileExplorerKeyboardNavigation.test.tsx` (1,279 LOC) — harness `fileExplorer-view` (B3).
- 🔴 `src/internals/plugins/useFileExplorerExpansion/useFileExplorerExpansion.test.tsx` — harness `fileExplorer-view` (B3).
- 🔴 `src/internals/plugins/useFileExplorerFocus/useFileExplorerFocus.test.tsx` — harness `fileExplorer-view` (B3).
- 🔴 `src/internals/plugins/useFileExplorerFiles/useFileExplorerFiles.test.tsx` — harness `test/utils/fileExplorer/...` (B3).
- 🔴 `src/internals/plugins/useFileExplorerIcons/useFileExplorerIcons.test.tsx` — harness `fileExplorer-view` (B3).
- 🔴 `src/internals/plugins/useFileExplorerGrid/useFileExplorerGrid.test.tsx` — harness `test/utils/file-list/...` **and** `@mui/x-file-list/*` source imports (B3, B6).

**Pure logic**
- 🔴 `src/internals/plugins/useFileExplorerDnd/fileExportUtils.test.ts` — `import … from '@jest/globals'`. **Aborts the whole Mocha process** (B1).
- 🔴 `src/featureFlags/FeatureFlagConfig.test.ts` — `import { describe, it, expect } from '@stoked-ui/internal-test-utils'`; those are not exported → `describe is not a function` (B2).
- 🔴 `src/featureFlags/FeatureFlagContext.test.tsx` — same as above + jest-style matchers (B2).

### 1.2 Critical blockers (each reproduced 2026-06-06 by running Mocha on the file)

- **B1 — `@jest/globals` aborts the run (REPO-WIDE).**
  `src/internals/plugins/useFileExplorerDnd/fileExportUtils.test.ts:5` does
  `import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'`.
  Under Mocha this throws `Error: Do not import '@jest/globals' outside of the
  Jest test environment` as an **"Exception during run"**, which terminates the
  whole `mocha 'packages/**/*.test.{js,ts,tsx}'` invocation — i.e. this one file
  can red-X the entire umbrella `pnpm test` for the monorepo. **Fix first.**
  (Matches the standing note: a Jest-style test in a publishable package breaks
  the Mocha glob.)
- **B2 — `describe`/`it`/`expect` imported from `@stoked-ui/internal-test-utils`.**
  `internal-test-utils` exports `describeConformance`, `createDescribe`,
  `createRenderer`, `act`, `fireEvent`, `screen` — **not** `describe`/`it`
  (those are Mocha globals) or a jest-style `expect`. `featureFlags/*.test.{ts,tsx}`
  import them anyway → `(0, _internalTestUtils.describe) is not a function`.
- **B3 — `describeFileExplorer` harness path is wrong in every caller.**
  The harness lives at `test/utils/file-explorer/describeFileExplorer/`. Callers
  import it from **four different ghost paths**, none of which exist:
  - `test/utils/fileExplorer-view/describeFileExplorer` — `useFile`, `useFileExplorer`, `useFileExplorerSelection`, `useFileExplorerExpansion`, `useFileExplorerKeyboardNavigation`, `useFileExplorerFocus`, `useFileExplorerIcons`
  - `test/utils/fileExplorer/describeFileExplorer` — `useFileExplorerFiles`
  - `test/utils/tree-view/describeFileExplorer` — `FileElement`
  - `test/utils/file-list/describeFileExplorer` — `useFileExplorerGrid`
- **B4 — Babel alias `@stoked-ui/file-explorer` points at the package root, not `src`.**
  `babel.config.js` defines `'@stoked-ui/file-explorer': resolveAliasPath('./packages/sui-file-explorer')` (no `/src`), unlike `@stoked-ui/cdn` → `…/src` and `@stoked-ui/docs` → `…/src`. The bare import works (resolves via `package.json#main` = `src/index.ts`), but **subpath** imports like `@stoked-ui/file-explorer/FileExplorerBasic` resolve to `packages/sui-file-explorer/FileExplorerBasic` (nonexistent) → `Cannot find module '../../FileExplorerBasic'`. Breaks `FileExplorer`, `FileExplorerBasic`, `FileDropzone` conformance tests.
- **B5 — `ERR_UNSUPPORTED_DIR_IMPORT` for `@mui/material/SvgIcon`.**
  Once a test pulls the full component tree (e.g. `FileExplorerAlternatingRows`
  → `./FileExplorer` → `FileExplorerLegacy.tsx`), Node 20 ESM refuses the
  directory import `@mui/material/SvgIcon` made inside the published
  `@mui/material/utils/createSvgIcon.js`. This is an environment/transform issue
  (node_modules ESM is not Babel-transformed to CJS), not a test-code bug; it
  gates every full-`FileExplorer` render test and must be solved at the harness
  level (see §3).
- **B6 — Stale `@mui/x-*` source imports inside test bodies.**
  Separate from the harness path: `File.test.tsx`, `FileElement.test.tsx`, and
  `useFileExplorerGrid.test.tsx` import the component/hook **under test** from
  `@mui/x-tree-view/*` / `@mui/x-file-list/*`, which are not dependencies of
  this repo. Must be repointed to `@stoked-ui/file-explorer` (or relative).
- **B7 — `describe('ee<FileDropzone />', …)` typo** at `src/FileDropzone/FileDropzone.test.tsx:9` (and the `.js` duplicate).
- **B8 — `FileDropzone.test.js` is a committed build artifact** shadowing the `.tsx`. Delete it.

> **Net effect:** the only file Mocha currently "passes" is the type-only
> `themeAugmentation.spec.ts` (and only because tsc, not Mocha, validates it).
> Runtime behavioral coverage is effectively **0%** despite 5,000 LOC on disk.

---

## 2. What Should Be Tested

### Tier 1 — Critical, ship-blocking (fix the existing files first; they already encode the right cases)

| Module | Source | Why it matters |
|---|---|---|
| **Plugin harness restoration** | `src/internals/plugins/**/*.test.tsx`, `src/internals/useFileExplorer/useFileExplorer.test.tsx`, `src/useFile/useFile.test.tsx` | The only meaningful behavioral tests in the package. Repointing the harness import (B3) + repointing `@mui/x-*` (B6) restores ~9 files for near-zero risk. |
| `useFileExplorerSelection` | `src/internals/plugins/useFileExplorerSelection/useFileExplorerSelection.tsx` | Selection state: controlled vs uncontrolled, single vs multi, default vs controlled precedence. The 797-LOC test is comprehensive — make it run. |
| `useFileExplorerKeyboardNavigation` | `src/internals/plugins/useFileExplorerKeyboardNavigation/useFileExplorerKeyboardNavigation.ts` | A11y contract: Arrow/Home/End/Space/Enter/type-ahead. 1,279-LOC test is the canonical home for these. |
| `useFileExplorerExpansion` | `src/internals/plugins/useFileExplorerExpansion/` | Expand/collapse — silently breaks on MUI X upstream re-syncs. |
| `useFileExplorerFocus` | `src/internals/plugins/useFileExplorerFocus/` | Focus interacts with selection + DnD; regressions cascade. |
| `useFileExplorerDnd` core | `src/internals/plugins/useFileExplorerDnd/useFileExplorerDnd.tsx`, `fileValidation.ts`, `muiXDndAdapters.ts`, `FileExplorerDndContext.ts` | The differentiator vs upstream `x-tree-view`. The 1,881-LOC plugin is the largest in the package and has **no runtime test** of its own logic. See §2.1. |
| `FeatureFlagConfig` + `FeatureFlagContext` | `src/featureFlags/FeatureFlagConfig.ts`, `FeatureFlagContext.tsx` | Runtime kill switches. After B1/B2 are fixed these are pure-logic wins. Pin `shouldShowFeature` rollout edges (0%, 100%, hash boundary), `FEATURE_FLAG_DEPENDENCIES` resolution, localStorage round-trip (`FEATURE_FLAG_STORAGE_KEY`). |

#### 2.1 DnD logic — the biggest untested surface (write net-new pure tests)

These are pure/near-pure functions; no browser, no pragmatic-DnD monitor needed:

- **`fileValidation.ts`** (`src/internals/plugins/useFileExplorerDnd/fileValidation.ts`)
  - `isDangerousExtension(filename)` — true for the `DANGEROUS_EXTENSIONS` set (`.exe`, `.bat`, …), false for safe + extensionless.
  - `isAllowedMimeType(mimeType)` — `DEFAULT_ALLOWED_MIME_TYPES` membership.
  - `isAcceptableFileSize(size, maxSize=MAX_FILE_SIZE_BYTES)` — boundary at 10 MB.
  - `validateFile(file, options)` → `FileValidationResult` — combines the three guards; assert the `errors[]` content.
  - `validateFiles(files, options)` → `FileValidationBatchResult` — partitions valid/invalid; empty input.
  - `getRejectionReason(errors)` — human string from error codes.
- **`fileExportUtils.ts`** (already has a test; rewrite onto chai — see B1)
  - `isExportable(item)` — `false` for `type: 'folder'` and `type: 'trash'`, `false` without media, `true` for a file with media content.
  - `fileBaseToBlob` / `fileBaseToFile` — `null` for non-exportable; preserves `mediaType`/name otherwise.
  - `createDownloadUrl` / `triggerDownload` — `null`/`false` for non-exportable; URL creation for exportable.
- **`muiXDndAdapters.ts`** (`src/internals/plugins/useFileExplorerDnd/muiXDndAdapters.ts`)
  - `createOnItemPositionChangeHandler` — maps an MUI X position change to the internal move action.
  - `createIsItemReorderableHandler` — reorder permission predicate.
  - `createCanMoveItemToNewPositionHandler` — rejects folder→own-descendant and drop-on-self; honors trash semantics.
- **`FileExplorerDndContext.ts`** (`src/internals/plugins/useFileExplorerDnd/FileExplorerDndContext.ts`)
  - `getFileExplorerStateDefault(items)` — pure: shape of the default state for `[]` and a nested fixture.
  - `fileListStateReducer(state, action)` — pure reducer; assert each action type round-trips `{ items, lastAction }` and that move/remove/reorder produce the expected tree (this is the cheapest, highest-value DnD test).

### Tier 2 — Important utilities

| Module | Source | Why |
|---|---|---|
| `useFileExplorerFiles` utils | `src/internals/plugins/useFileExplorerFiles/useFileExplorerFiles.utils.ts` | Tree flatten / lookup — pure logic, easy line coverage. |
| `useFileExplorerGrid` | `src/internals/plugins/useFileExplorerGrid/` | Grid layout / column toggling. 1,377 LOC; existing test blocked by B3/B6. |
| `useFileExplorerIcons` | `src/internals/plugins/useFileExplorerIcons/` | Icon resolution by `mediaType`/`type`. Existing test blocked by B3. |
| `useFileUtils` | `src/hooks/useFileUtils/useFileUtils.tsx` | Shared helpers used by `File`/`FileElement`. |
| `useFileState` / `useFileElementState` | `src/File/useFileState.ts`, `src/FileElement/useFileElementState.ts` | Per-row UX (selected/expanded/focused). Only covered transitively today. |
| `useFileExplorerApiRef` | `src/hooks/useFileExplorerApiRef.tsx` | Imperative ref — ref stability across renders, exposed methods present + callable. |
| `FileExplorerWithFlags` / `FileExplorerLegacy` | `src/FileExplorer/FileExplorerWithFlags.tsx`, `FileExplorerLegacy.tsx` | Smoke that `USE_MUI_X_RENDERING` swaps the underlying renderer. |
| `FileExplorerTabs` | `src/FileExplorerTabs/` | No tests today; a render-with-tabs smoke is enough. |

### Tier 3 — Light coverage

| Module | Source | Goal |
|---|---|---|
| `File`, `FileElement`, `FileDropzone`, `FileExplorerBasic`, `FileExplorer` | existing conformance files | Keep one conformance each; don't expand. |
| `themeAugmentation` | `src/themeAugmentation/themeAugmentation.spec.ts` | Type-only — keep. |
| `icons/*`, `models/items.ts` | static maps | No tests unless logic is added. |
| `FileExplorer.benchmark.tsx` + `test-benchmark.html` | manual bench | Out of suite; don't gate CI. |

### Out of scope

- Real `@atlaskit/pragmatic-drag-and-drop` monitor firing (needs a real browser; document + skip under JSDOM).
- `@react-spring/web` animation timing — assert start/end states only.
- `prop-types` runtime warnings — covered transitively by `describeConformance`.
- `@mui/x-tree-view` internals — upstream's responsibility.
- Visual regression / screenshots — no Argos pipeline gating this package.

---

## 3. Tooling

The toolchain (Mocha 10 + Babel + JSDOM via root `.mocharc.js`) is correct and
matches `sui-editor`/`sui-timeline`. **Do not introduce Jest, Vitest, or
`@testing-library/jest-dom` matchers** — that is exactly what broke this suite
(B1/B2). Standardize everything onto:

- **Runner:** Mocha 10 via the root globs (`pnpm test`, `pnpm test:coverage` = `nyc` over `mocha 'packages/**/*.test.{js,ts,tsx}'`). Run under **Node 20.20.0**.
- **DOM:** JSDOM via `@stoked-ui/internal-test-utils/setupJSDOM`.
- **Compilation:** Babel via `@stoked-ui/internal-test-utils/setupBabel`.
- **Assertions:** `import { expect } from 'chai'` (`expect(x).to.equal(y)`), never jest `toBe`/`toEqual`.
- **Mocks:** `import { spy, stub, useFakeTimers } from 'sinon'`.
- **`describe`/`it`/`beforeEach`/`afterEach`:** Mocha **globals** — never import them.
- **React utils:** `act`, `fireEvent`, `createRenderer`, `screen` from `@stoked-ui/internal-test-utils`. Don't import `@testing-library/react` directly (the harness/conformance wrap it).
- **Conformance:** `test/utils/describeConformance.ts`.
- **Plugin harness:** `test/utils/file-explorer/describeFileExplorer` (the one true path).

### Resolving B4 and B5 (environment fixes the test code can't fix alone)

- **B4 (subpath alias):** prefer changing the in-package conformance tests to
  **relative** imports (`../FileExplorerBasic` re-exports `fileExplorerBasicClasses`)
  rather than `@stoked-ui/file-explorer/FileExplorerBasic`. Relative imports are
  proven to resolve (the `AlternatingRows` test gets past resolution this way).
  This also stays consistent with `AX-REPO-PACKAGE-BARREL` (no deep cross-package
  imports). Changing the Babel alias to `…/src` is the alternative but is
  repo-wide and affects every consumer — treat as a governed change.
- **B5 (`@mui/material/SvgIcon` dir import):** full-`FileExplorer` render tests
  need the harness to load `@mui/material` as CJS. Confirm whether
  `sui-editor`/`sui-timeline` component tests hit the same error under Node 20;
  if they don't, diff their import surface. The likely fix is at
  `internal-test-utils/setupBabel` (transform-ignore for `@mui/material` ESM) or
  importing icons from `@mui/material/SvgIcon/SvgIcon` (file, not dir). Until
  resolved, keep full-tree render tests minimal and lean on the JSDOM plugin
  harness, which renders `FileExplorerBasic` (lighter import surface).

### Add a per-package test script

`packages/sui-file-explorer/package.json` has no `test` script. After B1 is
fixed (otherwise it aborts), add:

```jsonc
"scripts": {
  "test": "cross-env NODE_ENV=test mocha '../../packages/sui-file-explorer/src/**/*.test.{ts,tsx}'",
  "test:watch": "pnpm test -- --watch"
}
```

so `turbo run test --filter=@stoked-ui/file-explorer` works without the root
glob. Note `internal-test-utils` setup is loaded by the root `.mocharc.js`; a
per-package run still picks it up because Mocha walks up to the nearest config.

---

## 4. Test File Organization & Naming

Match the existing co-located pattern; do **not** centralize under `__tests__/`.

- **Component tests:** `src/<Component>/<Component>.test.tsx`.
- **Plugin tests:** `src/internals/plugins/<plugin>/<plugin>.test.tsx` using `describeFileExplorer<[<plugin>Signature]>(...)`.
- **Hook tests:** `src/<hook>/<hook>.test.tsx` or `src/internals/<hook>/<hook>.test.tsx`.
- **Pure utility tests:** `src/.../<util>.test.ts` (no `.tsx` if no JSX) — e.g. `fileValidation.test.ts`, `fileExportUtils.test.ts`.
- **Type-only specs:** `*.spec.ts(x)` (e.g. `themeAugmentation.spec.ts`) — validated by `tsc`, **excluded** from Mocha (root glob is `*.test.*` only). Keep behavioral tests as `.test.*` so they actually run.
- **Shared harness:** stays at `test/utils/file-explorer/describeFileExplorer/`. Fix the callers, never relocate the harness to satisfy a stale import.

Naming:

```
describe('<ComponentName>', () => {
  describe('<feature>', () => {
    it('should <expected behavior> when <condition>', () => { ... })
  })
})
```

Plugin tests:

```
describeFileExplorer<[UseFileExplorerXxxSignature, …]>(
  'useFileExplorerXxx plugin',
  ({ render }) => { … }
)
```

so the harness exercises both `FileExplorerBasic` and the full `FileExplorer`.

---

## 5. Mock & Stub Strategy

Stub at the boundary, not deep inside plugins.

| API | Approach |
|---|---|
| `@atlaskit/pragmatic-drag-and-drop` (`draggable`, `monitorForElements`, `dropTargetForElements`) | `sinon.stub` / `sinon.replace` the module exports to **capture** the registered callbacks, then invoke them manually with a fake `DragEvent`-shaped payload. Restore in `afterEach`. The monitor never fires under JSDOM, so this is the only way to test drop handling. |
| `@atlaskit/pragmatic-drag-and-drop-flourish` / `-hitbox` / `-react-drop-indicator` | Stub to no-op — visual flair. |
| `DataTransfer` / `File` / `FileList` (external drops) | `new File([blob], 'name.txt', { type })` works in JSDOM. For `DataTransfer`, use the `internal-test-utils` polyfill or hand-roll `{ items, files, types, getData }`. |
| `@react-spring/web` | Render-through is fine; for deterministic assertions use `Globals.assign({ skipAnimation: true })` in a top-level `before`. |
| `@mui/x-tree-view` | **Real** — it's the engine when `USE_MUI_X_RENDERING` is on. Don't mock; just import it correctly (it IS a dependency, unlike `@mui/x-file-list`/`@mui/x-file-explorer`). |
| `@stoked-ui/media` (peer) | Real for happy paths; for pure mediaType-resolution unit tests, stub the mime lookup to a deterministic value. |
| `@stoked-ui/common` | Real. |
| `tiny-invariant` | Real — let invariants throw and assert `expect(fn).to.throw(/text/)`. |
| `prop-types` warnings | `consoleErrorMock` from `internal-test-utils` (already used by conformance). |
| `IntersectionObserver` / `ResizeObserver` | Polyfilled by `setupJSDOM` — verify before adding a custom stub. |
| `localStorage` (feature flags) | JSDOM provides it; clear in `afterEach` so `FEATURE_FLAG_STORAGE_KEY` doesn't leak between tests. |

**Module-level static state** — `DEFAULT_FEATURE_FLAGS`, `ENVIRONMENT_CONFIGS`,
`FEATURE_FLAG_DEPENDENCIES` (`src/featureFlags/FeatureFlagConfig.ts`) are
exported objects. If a test mutates them, snapshot (`{ ...DEFAULT_FEATURE_FLAGS }`)
and restore in `afterEach`, or suite ordering becomes load-bearing.

---

## 6. Coverage Targets

`Medium` priority, ~70% logic / ~30% UI. The plugin/DnD logic layer is highly
testable; aim higher there than at the component layer. **Baseline today is ~0%
runtime** — the first milestone is simply "suite runs green," then ratchet.

| Layer | Target line coverage |
|---|---|
| `src/internals/plugins/**` (excl. DnD monitor wiring) | **80%** |
| `src/internals/plugins/useFileExplorerDnd/**` (pure: validation/export/adapters/reducer) | **70%** (exclude `monitorForElements` callback wiring) |
| `src/internals/useFileExplorer/**` | **75%** |
| `src/featureFlags/**` | **90%** — pure config + context |
| `src/useFile/**`, `src/File/**`, `src/FileElement/**` | **60%** |
| `src/FileExplorer/**`, `src/FileExplorerBasic/**` | **55%** |
| `src/FileDropzone/**`, `src/FileExplorerTabs/**` | **40%** — smoke render |
| `src/icons/**`, `src/models/**`, `src/themeAugmentation/**` | n/a — static / type |
| **Package overall** | **65–70% lines / 55% branches** |

Track via `pnpm test:coverage` from root (already globs `packages/**`).

---

## 7. Specific Test Work to Do First

Strictly ordered — earlier items unblock later ones. Each ships in one PR and
must follow red→green TDD (the existing files already encode the red cases; make
them run, watch them fail for the right reason, then fix source if they expose a
real bug).

1. **Fix B1 — stop the whole-suite abort.** In
   `src/internals/plugins/useFileExplorerDnd/fileExportUtils.test.ts`, remove
   `import … from '@jest/globals'`, drop the `describe`/`it` import entirely
   (Mocha globals), and convert `expect(x).toBe(y)` → `import { expect } from 'chai'`
   / `expect(x).to.equal(y)`. **This is the gate for every other test in the repo.**
2. **Fix B2 — feature-flag runner imports.** In
   `src/featureFlags/FeatureFlagConfig.test.ts` and `FeatureFlagContext.test.tsx`,
   delete `{ describe, it, … }` from the `@stoked-ui/internal-test-utils` import,
   switch `expect` to `chai`, and `act`/`renderHook` to `internal-test-utils`.
3. **Fix B3 — harness path.** Find/replace across
   `packages/sui-file-explorer/src/**/*.test.tsx`, all four ghost paths →
   `'test/utils/file-explorer/describeFileExplorer'`.
4. **Fix B6 — stale `@mui/x-*` source imports** in `File.test.tsx`,
   `FileElement.test.tsx`, `useFileExplorerGrid.test.tsx` →
   `@stoked-ui/file-explorer` (bare/barrel) or relative.
5. **Fix B4 — conformance subpath imports** in `FileExplorer.test.tsx`,
   `FileExplorerBasic.test.tsx`, `FileDropzone.test.tsx` → relative imports of
   the classes (e.g. `import { fileExplorerBasicClasses } from '../FileExplorerBasic'`).
6. **Fix B7/B8 — housekeeping.** Delete `src/FileDropzone/FileDropzone.test.js`;
   fix the `'ee<FileDropzone />'` typo at `FileDropzone.test.tsx:9`.
7. **Triage B5.** Run the now-importable suite and capture which full-`FileExplorer`
   render tests still die on `@mui/material/SvgIcon` (B5); apply the §3 harness
   fix. Record each acceptance test's outcome series (red→green).
8. **New: `fileValidation.test.ts`** — the §2.1 guards (dangerous extension,
   mime, size boundary at 10 MB, `validateFiles` partition, `getRejectionReason`).
9. **New: `FileExplorerDndContext` reducer test** —
   `fileListStateReducer` + `getFileExplorerStateDefault` against a nested
   fixture (move/remove/reorder round-trips). Cheapest high-value DnD coverage.
10. **New: stubbed-monitor DnD smoke** —
    `src/internals/plugins/useFileExplorerDnd/useFileExplorerDnd.test.tsx`:
    `sinon.replace` `monitorForElements`, capture `onDrop`, render via the
    harness, fire a synthetic payload, assert the tree mutation.
11. **New: `useFileExplorerApiRef.test.tsx`** — ref stable across re-renders;
    exposed methods present + callable after mount.
12. **New: `FileExplorerWithFlags.test.tsx`** — `USE_MUI_X_RENDERING` true →
    MUI X renderer; false → `FileExplorerLegacy`; runtime toggle swaps the
    renderer without unmounting consumer state.
13. **Wire the per-package `test` script** (§3) and confirm
    `turbo run test --filter=@stoked-ui/file-explorer` is green.

---

## 8. Known Gotchas (carry into tests)

- **B1 is a footgun for the whole repo.** Any future `@jest/globals` /
  `import { describe } from '@stoked-ui/internal-test-utils'` will silently abort
  the umbrella `pnpm test`. Add a lint guard if it recurs.
- **Static feature-flag objects are exported by reference.** Mutating
  `DEFAULT_FEATURE_FLAGS` in one test poisons later tests. Snapshot + restore in
  `afterEach`.
- **`localStorage` leaks across feature-flag tests.** Clear `FEATURE_FLAG_STORAGE_KEY`
  in `afterEach`.
- **Pragmatic-DnD `monitorForElements` returns a cleanup fn.** Mount/unmount
  tests must call it, or the next test sees a registered monitor and double-fires.
- **`@react-spring/web` `useTransition` runs effects async.** Wrap animating
  state changes in `act`; prefer `Globals.assign({ skipAnimation: true })` in a
  suite-level `before`.
- **`describeConformance` skips `componentProp`, `componentsProp`, `themeVariants`**
  in every component test (`FileExplorer.test.tsx`, `FileDropzone.test.tsx`, …).
  Keep the same skip list for new components — these are deliberately unsupported.
- **`FileBase.type` includes `'folder'` and `'trash'`** — `isExportable`
  short-circuits on both. Any new `type` branch must keep folder/trash handled,
  and a regression test should pin that.
- **`test/utils/...` is root-relative** via the Babel `test` alias
  (`babel.config.js`). It works because of that alias, not Node resolution; don't
  change the alias without updating callers.
- **Run on Node 20.20.0.** Node 26 breaks Mocha here; the directory-import strict
  ESM behavior (B5) is also Node-version sensitive.

---

## Cross-References

- Module overview: `.stokd/meta/packages/sui-file-explorer/SC_MODULE.md`
- Module axioms: `packages/sui-file-explorer/.axioms.md`
- Repo axioms: `.stokd/meta/SC_AXIOMS.md` (`AX-REPO-PACKAGE-BARREL`, `AX-REPO-BROWSER-NO-SERVER-DEPS`, `AX-REPO-MEDIA-TYPE-COORDINATION`)
- Repo test inventory: `.stokd/meta/SC_TEST.md`
- Shared harness: `test/utils/file-explorer/describeFileExplorer/`, `test/utils/describeConformance.ts`
- Test setup: `@stoked-ui/internal-test-utils` (`setupBabel`, `setupJSDOM`, `createRenderer`, `describeConformance`)
- Closest sibling strategies: `.stokd/meta/packages/sui-editor/SC_TEST.md`, `.stokd/meta/packages/sui-timeline/SC_TEST.md`
