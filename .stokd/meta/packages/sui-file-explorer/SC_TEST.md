# Testing Strategy: `@stoked-ui/file-explorer`

> **Generated:** 2026-05-21 · **Refreshed:** 2026-07-02 (TIMED REFRESH — static re-verification: no package source/test files changed since the 2026-06-22 runtime run (only meta docs / `.axioms.md` touched in `13c8553b88`); re-ran the §0.3 import grep and confirmed the harness-path breakage is unchanged; confirmed `fileExportUtils.test.ts` still imports `@jest/globals` and `File.test.tsx` still targets `@mui/x-file-list`; **corrected §0.3** — `test/utils/file-explorer/fakeContextValue.ts` now exists, so the `fakeContextValue` rows are a path rewrite, not a missing-harness gap; re-verified symbol locations: `fileListStateReducer` at `FileExplorerDndContext.ts:276`, `getFileExplorerStateDefault` at `:196`, all six `fileValidation.ts` exports present) | **Meta version:** 0.7.0
> **Package:** `packages/sui-file-explorer` (`@stoked-ui/file-explorer` v0.1.2)
> **Priority:** Medium
> **Source entry:** `packages/sui-file-explorer/src/index.ts`

`@stoked-ui/file-explorer` is a fork of `@mui/x-tree-view` extended with
`@atlaskit/pragmatic-drag-and-drop` for internal/external file moves, an
optional grid view (`useFileExplorerGrid`), runtime feature flags
(`src/featureFlags/`), and a media-aware extension surface. It is consumed by
`@stoked-ui/editor` and the docs site (port 5199), so bugs are user-visible.
~14,000 LOC of source across 20 test files (~5,000 LOC of tests).

---

## 0. Ground Truth (runtime-verified 2026-06-22, statically re-verified 2026-07-02)

These facts were established by **running** the toolchain (2026-06-22) and
re-checked against an unchanged source tree (2026-07-02). They override any
optimistic claim that "the suites compile."

1. **Node version is load-bearing.** The repo runner pins to **Node 20.20.0**
   (`.nvmrc` requests `18.19.0`, which is not installed locally; `20.20.0` is
   the working version). Under **Node 26 the runner dies before any test
   loads** — `yargs@16` throws `ReferenceError: require is not defined in ES
   module scope`. Always run with:
   ```bash
   unset npm_config_prefix
   export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20.20.0
   ```

2. **"Compiles" ≠ "runs."** `pnpm --filter @stoked-ui/file-explorer typescript`
   can be green (the package `tsconfig.json` does not type-check the shared
   `test/utils/**` harness the way Mocha resolves it at runtime) while Mocha
   still fails to load most test files. TypeScript success is **not** evidence
   that the suite passes. Both gates must be checked independently.

3. **Most test files do not load** because their harness import paths point at
   directories that do not exist. Verified mismatch (re-run 2026-07-02 with
   `grep -rhoE "from 'test/utils/[^']+'" packages/sui-file-explorer/src | sort | uniq -c`
   — counts unchanged):

   | Import used in tests | Count | Exists at repo root? | Correct path |
   |---|---|---|---|
   | `test/utils/describeConformance` | 5 | ✅ `test/utils/describeConformance.ts` | (ok) |
   | `test/utils/describeSlotsConformance` | 1 | ✅ `test/utils/describeSlotsConformance.tsx` | (ok) |
   | `test/utils/fileExplorer-view/describeFileExplorer` | 7 | ❌ | `test/utils/file-explorer/describeFileExplorer` |
   | `test/utils/fileExplorer/describeFileExplorer` | 1 | ❌ | `test/utils/file-explorer/describeFileExplorer` |
   | `test/utils/tree-view/describeFileExplorer` | 1 | ❌ | `test/utils/file-explorer/describeFileExplorer` |
   | `test/utils/file-list/describeFileExplorer` | 1 | ❌ | `test/utils/file-explorer/describeFileExplorer` |
   | `test/utils/file-list/fakeContextValue` | 1 | ❌ | `test/utils/file-explorer/fakeContextValue` (exists as of 2026-07-02) |
   | `test/utils/tree-view/fakeContextValue` | 1 | ❌ | `test/utils/file-explorer/fakeContextValue` (exists as of 2026-07-02) |

   Exact failure observed:
   `Error: Cannot find module '.../test/utils/fileExplorer-view/describeFileExplorer'`
   (from `useFileExplorerSelection.test.tsx:4`). The bare `test/` prefix
   resolves to the repo-root `test/` dir at runtime, so only the **two**
   correctly-named imports above load; the other **~12** fail. The shared
   harness genuinely lives at **`test/utils/file-explorer/`**, which now
   contains both `describeFileExplorer/` and `fakeContextValue.ts` — the fix
   is a pure import-path rewrite (no harness code needs to be written).

4. **`fileExportUtils.test.ts` uses the wrong runner.** It imports
   `{ describe, it, expect, beforeEach, afterEach } from '@jest/globals'` and
   uses Jest matchers (`expect(...).toBe(...)`). There is **no jest config in
   this package** (only `sui-media`, `sui-common`, `sui-stokd` have one), and
   the repo-wide runner is Mocha. Under Mocha this file's `expect` is Jest's,
   not Chai's, and `@jest/globals` is not wired — it does not run.

5. **`File.test.tsx` tests the wrong code.** It imports
   `File` from `@mui/x-file-list/File` and a context from
   `@mui/x-file-list/internals/...` — i.e. the **upstream MUI package**, not
   `packages/sui-file-explorer/src/File`. Even after its
   `test/utils/file-list/fakeContextValue` path is rewritten, it would assert
   on MUI's component, not ours, until retargeted.

**Net effect:** the package ships ~5,000 lines of tests, but only the
`describeConformance`-based portions can even load today, and several of those
target upstream code. Treat the existing suite as a **migration backlog**, not
as coverage.

---

## 1. What Must Be Tested (by criticality)

### 1.1 Tier 1 — security & data-integrity (highest value, currently UNTESTED)

- **`src/internals/plugins/useFileExplorerDnd/fileValidation.ts`** —
  `isDangerousExtension`, `isAllowedMimeType`, `isAcceptableFileSize`,
  `validateFile`, `validateFiles`, `getRejectionReason` (all exports verified
  present 2026-07-02). This is the **only sanctioned boundary** between
  OS-originated drops and consumer code (AX-MOD-FILE-EXPLORER-003). It has
  **no test**. A regression here silently widens the dangerous-extension
  denylist or the size cap.
  *Pure functions, no DOM, no harness needed — easiest possible red→green.*

- **`fileListStateReducer`**
  (`src/internals/plugins/useFileExplorerDnd/FileExplorerDndContext.ts:276`,
  with `getFileExplorerStateDefault` at `:196`) — the reducer behind every
  internal move/reparent/reorder and trash action. Pure
  `(state, action) => state`. **No test.** Reducer bugs corrupt the tree model.

- **`fileExportUtils.ts`** — `isExportable`, `fileBaseToBlob`, `fileBaseToFile`,
  `createDownloadUrl`. A test file *exists* but cannot run (§0.4). Convert it to
  Chai/Mocha — see §6.

### 1.2 Tier 2 — plugin behavior (tests exist but do not load)

The plugin suites are the real behavioral contract and follow MUI X's
`describeFileExplorer` matrix pattern. They are blocked only by the §0.3 path
breakage. In load-bearing order (AX-MOD-FILE-EXPLORER-002):

- `useFileExplorerFiles` — items model, getItem, ordering.
- `useFileExplorerExpansion` — controlled/uncontrolled, default state.
- `useFileExplorerSelection` — single/multi/checkbox, controlled vs default.
- `useFileExplorerFocus` — focus tracking, roving tabindex.
- `useFileExplorerKeyboardNavigation` — arrows, Home/End, type-ahead, Space.
- `useFileExplorerIcons` — slot precedence.
- `useFileExplorerGrid` — column headers, sort, resize.
- `useFileExplorerDnd` — covered indirectly; reducer needs direct tests (Tier 1).

### 1.3 Tier 3 — components & integration

- `File` / `FileElement` / `useFile` — render, ref, class slots
  (`describeConformance` already wired — but retarget `File.test.tsx` to the
  **local** `src/File`, not `@mui/x-file-list`).
- `FileExplorer`, `FileExplorerBasic`, `FileExplorerTabs` — top-level render +
  prop plumbing; `FileExplorerAlternatingRows.test.tsx` (styling) already
  exists; `FileExplorerTabs` has **no test file** at all.
- `FileDropzone` — external-drop → `validateFiles` → accept/reject UI path.
  (Two stale files exist: `FileDropzone.test.tsx` and `.test.js` — dedupe.)
- `featureFlags/` — `FeatureFlagConfig.test.ts` and `FeatureFlagContext.test.tsx`
  exist; verify they load (they use plain Chai, likely OK) and cover
  `shouldShowFeature`, `hashUserId`, dependency resolution, persistence, and the
  `FileExplorerWithFlags` legacy↔MUI-X fallback.

### 1.4 Edge cases to assert explicitly

- Empty tree, single node, deeply nested (depth > 5, `indentPerLevel = 32`).
- Selection of an item not in the model (no throw).
- DnD drop onto self / onto descendant (must be rejected by reducer).
- External drop of a dangerous extension (`.exe`, `.sh`, double-extension
  `foo.txt.exe`), oversize file, disallowed MIME → rejected with reason string.
- Feature-flag dependency cycle / invalid stored config → falls back to defaults.

---

## 2. Framework & Tooling

| Concern | Choice | Notes |
|---|---|---|
| Runner | **Mocha 10.8.2** | root `.mocharc.js`; glob `packages/**/*.test.{js,ts,tsx}` |
| Assertions | **Chai 4** (`expect`) | `chai` is a devDependency here; **do not** use Jest matchers |
| Spies/stubs | **Sinon** (`spy`, `stub`) | as in `useFileExplorerSelection.test.tsx` |
| DOM | **JSDOM** via `@stoked-ui/internal-test-utils/setupJSDOM` | `window.HTMLLIElement` etc. available |
| Transpile | Babel via `@stoked-ui/internal-test-utils/setupBabel` + `pirates` | no ts-node |
| Render | `createRenderer()` from `@stoked-ui/internal-test-utils` | returns `{ render }` |
| Conformance | `test/utils/describeConformance`, `describeSlotsConformance` | MUI-X style |
| Behavior matrix | `test/utils/file-explorer/describeFileExplorer` | drives plugin tests |
| Node | **20.20.0** (see §0.1) | mandatory |

**Run commands** (from repo root, Node 20.20.0 active):
```bash
# single file
npx cross-env NODE_ENV=test mocha 'packages/sui-file-explorer/src/File/File.test.tsx'
# whole package
npx cross-env NODE_ENV=test mocha 'packages/sui-file-explorer/**/*.test.{ts,tsx}'
# coverage (repo-wide nyc)
pnpm test:coverage:no-docs    # nyc + mocha, text reporter
# type gate (separate signal, see §0.2)
pnpm --filter @stoked-ui/file-explorer typescript
```

Do **not** introduce Vitest or a per-package Jest config — it violates the
mono-repo's single-runner convention and the AX-REPO-PNPM-MONOREPO build
pipeline. The one in-tree Jest file (`fileExportUtils.test.ts`) is the anomaly
to fix, not the precedent to follow.

Note: `packages/sui-file-explorer/benchmark-results.json` and
`test-benchmark.html` (Work Item 4.1, stamped 2026-01-19) are **static
performance-benchmark artifacts**, not part of the Mocha suite — most of their
metrics are marked `"estimated": true`. Do not treat them as regression gates.

---

## 3. File Organization & Naming

- **Co-locate** tests next to source: `Foo.tsx` → `Foo.test.tsx`
  (already the convention; no `__tests__/` dirs in this package).
- **`.test.tsx`** for anything that renders/uses JSX; **`.test.ts`** for pure
  logic (`fileValidation.test.ts`, `fileListStateReducer.test.ts`,
  `fileExportUtils.test.ts`).
- **`.spec.ts`** is reserved for the existing theme-augmentation type spec
  (`themeAugmentation.spec.ts`) — keep that pattern, don't spread it.
- Plugin tests live under `src/internals/plugins/<plugin>/<plugin>.test.tsx`
  and use `describeFileExplorer<[Signature, ...]>(...)`.
- Top-of-file comment should name the behavior/work-item under test (existing
  convention, e.g. the keyboard-nav cross-reference in the selection test).

---

## 4. Mock / Stub Strategy

- **External DnD (`@atlaskit/pragmatic-drag-and-drop`)** — do **not** drive real
  pointer DnD in JSDOM. Test the *logic* (`fileListStateReducer`,
  `muiXDndAdapters`, drop-target validation) directly with synthesized action
  objects; reserve full DnD interaction for e2e/regression if needed.
- **External file drops** — construct `File`/`Blob`/`DataTransfer` fixtures in
  JSDOM; assert against `validateFiles` output. No filesystem.
- **`@stoked-ui/media` (`MediaType`, `IMediaFile`)** — use real types/enums; they
  are pure and cross-package-coordinated (AX-REPO-MEDIA-TYPE-COORDINATION). Build
  minimal `FileBase` fixtures rather than mocking the package.
- **localStorage (feature-flag persistence)** — JSDOM provides it; clear in
  `beforeEach`/`afterEach`. Stub `Date`/`Math.random` only where flag hashing
  needs determinism (`hashUserId`).
- **Spies** — use Sinon `spy()` for `onSelectedItemsChange`,
  `onExpandedItemsChange`, `onItemFocus`, etc.; assert call args, not internals.
- Avoid mocking the plugin runtime — exercise it through `describeFileExplorer`
  so plugin composition order (AX-MOD-FILE-EXPLORER-002) is actually validated.

---

## 5. Coverage Targets (priority: medium)

Phase the targets — chasing a number on a suite that doesn't load is theater.

| Phase | Gate | Target |
|---|---|---|
| 0 — unblock | Suite **loads & runs** under Node 20.20.0 (no MODULE_NOT_FOUND) | 100% of test files load |
| 1 — security | `fileValidation.ts`, `fileListStateReducer`, `fileExportUtils.ts` | **90%+ lines/branches** |
| 2 — plugins | the 8 `useFileExplorer*` suites green | each suite green; ~70% plugin lines |
| 3 — package | overall `nyc` line coverage | **65–70%** (medium priority; not 90%) |

Branch coverage matters most on `fileValidation` and the reducer (security +
data integrity); component render coverage is lower-value here.

---

## 6. First Test Cases to Implement (ordered)

Do these in TDD order (red → green per AXIOM 5). The first three need **no
harness** and are immune to the §0.3 breakage, so they deliver value before the
migration is finished.

1. **`fileValidation.test.ts`** (new, `.ts`, Chai + Mocha) — the security gate:
   - `isDangerousExtension('a.exe')` / `'.sh'` / `'archive.tar.gz'` /
     double-extension `'photo.png.exe'` → `true`; `'doc.pdf'` → `false`.
   - `isAllowedMimeType` accepts an allowlisted type, rejects an unknown one.
   - `isAcceptableFileSize` at boundary (== cap passes, cap+1 fails).
   - `validateFile` / `validateFiles` aggregate errors; `getRejectionReason`
     produces a human string. *Pin the current defaults so any loosening of the
     denylist/size cap turns a test red.*

2. **`fileListStateReducer.test.ts`** (new, `.ts`) — DnD model integrity:
   - `getFileExplorerStateDefault()` shape (`FileExplorerDndContext.ts:196`).
   - reorder within a folder, reparent across folders, move to trash.
   - **reject** drop onto self and onto a descendant.
   - unknown action returns state unchanged.

3. **Convert `fileExportUtils.test.ts`** from `@jest/globals` → Chai/Mocha:
   - replace the import with `import { expect } from 'chai'`,
   - rewrite `.toBe(x)` → `.to.equal(x)`, `.toEqual(x)` → `.to.deep.equal(x)`,
   - drop the `@jest/globals` `describe/it` import (Mocha provides them globally).
   It already covers `isExportable` (folder/trash/no-media → false); keep those.

4. **Fix the harness paths** (mechanical, unblocks 12 files): rewrite the broken
   imports per the §0.3 table — all four `describeFileExplorer` variants →
   `test/utils/file-explorer/describeFileExplorer`, both `fakeContextValue`
   variants → `test/utils/file-explorer/fakeContextValue` (the target file
   exists; no harness code needs writing). Then run
   `useFileExplorerSelection.test.tsx` first — it's the most self-contained and
   confirms the harness wiring.

5. **Retarget `File.test.tsx`** from `@mui/x-file-list/File` to the local
   `@stoked-ui/file-explorer` `File` (and rewrite its
   `file-list/fakeContextValue` import per step 4). Until then it is testing
   upstream MUI, not this package.

6. **De-duplicate `FileDropzone.test.tsx` vs `FileDropzone.test.js`** — keep the
   `.tsx`, delete the `.js`, and assert the external-drop → `validateFiles` →
   reject path end-to-end.

---

## 7. CI / Acceptance Hooks

- Package-level gate for any FE change: `pnpm --filter @stoked-ui/file-explorer
  typescript` **and** the Mocha run of the package glob — **both**, because §0.2
  shows they catch different failures.
- AX-MOD-FILE-EXPLORER-003 (security) and AX-MOD-FILE-EXPLORER-002 (plugin
  order) both name "run the suite" as their acceptance check; that check is only
  meaningful once Phase 0 (§5) lands. Until then, treat those axioms as
  *unverifiable by suite* and rely on the new Tier-1 unit tests.
- Coverage runs through the repo-wide `nyc` (`pnpm test:coverage:no-docs`); there
  is no package-local coverage script and none should be added.
