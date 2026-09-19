# SC_TEST.md — `@stoked-ui/stokd`

> Testing strategy & implementation plan for the Stokd **Current Activity** UX library.
> **Priority:** medium · **Package:** `packages/sui-stokd` · **Type:** host-agnostic React component + view-model library.
> **Generated:** 2026-06-22 | **Updated:** 2026-07-02 (TIMED REFRESH — re-verified every claim against source: baseline re-run green at 10 suites / 32 tests / ~7.5s; utils test gap in §2 still open; noted that `normalizeProviderId`/`providerLabel` are now exported from the barrel).

---

## 1. What This Package Is (and what that means for testing)

`@stoked-ui/stokd` is a **purely presentational, host-agnostic** React component
set plus the view-model types that are their data contract
(`src/types/index.ts`). Its three governing axioms (`packages/sui-stokd/.axioms.md`)
shape the entire test strategy:

| Axiom | Test implication |
| --- | --- |
| `AX-MOD-SUISTOKD-VIEWMODEL-SOURCE-OF-TRUTH` | Tests build view-models from **plain objects** — never import a host/app package. Guard against `@stokd-cloud/*` creeping in. |
| `AX-MOD-SUISTOKD-CSS-VAR-THEMED` | No theme provider needed in tests. CSS is stubbed via `identity-obj-proxy`; assert on `data-*` attributes and class names, not computed colors. |
| `AX-MOD-SUISTOKD-PRESENTATIONAL-NO-IO` | No network/fetch/router to mock. Every component is `(view-model props) → DOM`, every action is an outbound callback. This makes the package **highly unit-testable with zero infra**. |

Because there is no I/O, **the test surface is deterministic and fast**. The only
non-determinism is time (`Date.now()` / `setInterval`), which must be faked.

---

## 2. Current State (baseline — re-verified 2026-07-02)

Run: `pnpm --filter @stoked-ui/stokd test` → **10 suites, 32 tests, all passing** (~7.5s).

Existing coverage:

- ✅ `src/__tests__/types.test.ts` — compile-time contract test (every exported type importable + assignable).
- ✅ `src/grouping/__tests__/groupSessions.test.ts` — grouping + stable ordering (4 cases).
- ✅ One `*.test.tsx` per component (`ActiveTaskCard` ×5, `ProviderBadge` ×5, `InteractiveSessionCard` ×3, `PipelineShellCard` ×3, `PrerequisiteBadge` ×3, `ShipStatusChips` ×3, `StatusBadge` ×3, `LiveTimer` ×2).

### ❗ Coverage gaps (highest priority — still open as of 2026-07-02)

The **pure utility modules have NO dedicated test files**, despite being the most
logic-dense, most-reused, and easiest-to-test code in the package:

- ❌ `src/utils/status.ts` — `isEngagedDisplayStatus`, `pickGroupDisplayStatus`, `displayStatusLabel`, `displayStatusKind`, `isGenericSessionTitle`, `GROUP_STATUS_ORDER`.
- ❌ `src/utils/text.ts` — `trimText`, `fullText`, `formatToolName`, `summarizeFiles`, `meaningfulActionText`, `sameAsTitle`, `isInternalStokdPrompt`, `formatElapsedLabel` (8 functions; **none of `text.ts` is exported from the barrel** but all are used internally by the cards — still must be tested).
- ❌ `src/utils/format.ts` — `formatDuration`, `formatDateTime`, `formatNumber`, `formatCurrency` (locale + edge-case heavy; exported from the barrel, only exercised indirectly via `LiveTimer`).

Closing these three gaps is the **#1 priority** of this plan.

Note: `normalizeProviderId` and `providerLabel` are exported from the barrel
(`src/index.ts:44`) — they are public API, so their mapping tables (§6.4) are a
contract, not an implementation detail.

---

## 3. Framework & Tooling (already in place — keep it)

- **Runner:** Jest 29 + `ts-jest` (`jest.config.js`), `jsdom` environment.
- **DOM assertions:** `@testing-library/react` 16 + `@testing-library/jest-dom` (loaded via `src/__tests__/setup.ts`).
- **CSS:** `identity-obj-proxy` maps `*.css` imports to no-op proxies.
- **Conventions already configured:** `testMatch` covers `**/__tests__/**` and `*.test.*`; `setupFilesAfterEnv` wires jest-dom; `testPathIgnorePatterns` excludes `/build/` so compiled output is never picked up.

**Recommended config tweaks (low-risk, do as a chore):**

1. Move `isolatedModules: true` from the `ts-jest` transform option into
   `tsconfig.json` to silence the deprecation warning (ts-jest v30 removes the
   transform option). The warning still prints on every run today.
2. Add a `coverageThreshold` block (see §7) once util tests land, so coverage
   cannot regress silently.
3. Add `collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/__tests__/**', '!src/**/index.ts']`
   so the coverage denominator is meaningful (barrels and type-only files excluded).

No new dependencies are required. **Do not** introduce Vitest/Playwright/Storybook
for this package — the Jest+RTL stack matches the monorepo and fits the scope.

---

## 4. Test Organization & Naming Conventions (match existing)

Keep the established, co-located layout — it is already consistent:

```
src/
  utils/
    status.ts
    __tests__/status.test.ts        ← ADD
    text.ts
    __tests__/text.test.ts          ← ADD
    format.ts
    __tests__/format.test.ts        ← ADD
  grouping/
    groupSessions.ts
    __tests__/groupSessions.test.ts ← exists
  components/<Name>/
    <Name>.tsx
    __tests__/<Name>.test.tsx       ← exists, one per component
  __tests__/
    setup.ts                        ← jest-dom only
    types.test.ts                   ← type contract
```

Rules:
- One `__tests__/` folder beside each source folder; test file named after the unit (`status.test.ts`, `ProviderBadge.test.tsx`).
- `describe(<unitName>)` → `it('does X when Y')`. Use plain-object view-model literals inline.
- Component tests assert via `data-testid` (`provider-badge`, `status-badge`, `prereq-badge`, …) and `data-*` attributes already emitted by the components — these are the stable test contract.

---

## 5. Mock / Stub Strategy

This package has **no external runtime dependencies to mock** (only `react`,
`react-dom`, `lucide-react`). Concretely:

| Concern | Strategy |
| --- | --- |
| **CSS imports** | Already handled by `identity-obj-proxy` moduleNameMapper. Do not assert on real styles. |
| **Time / `Date.now()`** | Use `jest.useFakeTimers()` + `jest.setSystemTime(new Date('2026-07-01T00:00:00Z'))`. **Required** for `LiveTimer` and `formatDuration(string)` (elapsed = `Date.now() − new Date(value)`, `format.ts:82`). Always restore with `jest.useRealTimers()` in `afterEach`. |
| **`setInterval` (LiveTimer)** | Advance with `act(() => jest.advanceTimersByTime(1000))`; assert the rendered text changes; assert `clearInterval` on unmount (no leak) and that `paused` stops updates. |
| **Locale (`Intl`)** | Pass explicit locales (e.g. `'en-US'`, `'de-DE'`) to `format*` and assert on **structure/contains**, not exact glyphs, to stay robust across Node ICU versions. For locale-independent assertions, prefer checking that distinct inputs yield distinct/ordered outputs. |
| **`lucide-react` icons** | No mock needed — they render as inert SVG in jsdom. Assert on surrounding text/attributes, not icon internals. |
| **Callbacks** (`onCancel`, `onContinue`, `onOpenTask`, …) | Use `jest.fn()` and `fireEvent`/`userEvent`; assert call + arguments. This is the primary behavioral contract for interactive cards. |

**Anti-pattern to avoid:** do not snapshot full component trees — they are brittle
against the CSS-var theming churn. Assert targeted DOM/attributes instead.

---

## 6. Specific Test Cases to Implement First

Ordered by value. Items 1–3 close the untested-utility gap and should land first.

### 6.1 `src/utils/__tests__/status.test.ts` (FIRST — pure, high logic density)

- `isEngagedDisplayStatus`: returns `true` for `working`/`validating`/`analyzing`; `false` for `prompting`/`needs-input`/`idle`/`stopped`.
- `pickGroupDisplayStatus`:
  - picks the most-engaged per `GROUP_STATUS_ORDER` (e.g. `['idle','working','stopped'] → 'working'`).
  - returns `'stopped'` for an empty array (the `?? 'stopped'` fallback).
  - respects full precedence order across a mixed set.
- `displayStatusLabel`: exhaustive map incl. `prompting → 'Typing…'`, `needs-input → 'Your turn'`, default → `'Stopped'`.
- `displayStatusKind`: `working→success`, `validating/analyzing→info`, `prompting/needs-input→warning`, else `neutral`.
- `isGenericSessionTitle`:
  - `true` for known generics (case/whitespace-insensitive — test `'  Claude Session '`, `'INTERACTIVE CODEX SESSION'`).
  - `false` for `undefined`, `null`, `''`, and a real title (`'Add a login button'`).

### 6.2 `src/utils/__tests__/text.test.ts` (FIRST — 8 functions, zero coverage)

- `trimText`: collapses whitespace; truncates to `maxLen` with `...`; returns `undefined` for empty/non-string; **returns `undefined` for the `/^interactive (claude|codex|gemini|grok) session$/i` wrapper** (`text.ts:25`).
- `fullText`: preserves internal newlines, trims ends, `undefined` for empty.
- `formatToolName`: applies `TOOL_NAME_OVERRIDES` (`run_shell_command → 'Bash'`, `read_file → 'Read'`, `grep_search → 'Grep'`, …); title-cases unknown ids (`my_custom_tool → 'My Custom Tool'`); `undefined → 'Activity'`.
- `summarizeFiles`: `[]/undefined → undefined`; single file → that file; many → `"a.ts +2 more"`.
- `meaningfulActionText`: drops generic titles (delegates to `isGenericSessionTitle`); returns trimmed text otherwise.
- `sameAsTitle`: whitespace/case-insensitive equality (`'  Add  Button ' ≡ 'add button'`).
- `isInternalStokdPrompt`: `true` for each of the 5 governance/continuation markers (incl. `'task worktree: /opt/worktrees/'`, `text.ts:83-88`); `false` for normal prompts and empty.
- `formatElapsedLabel`: `'+m:ss'` with zero-padded seconds; `undefined` when either arg missing or unparseable (`Number.isFinite` guard); negative delta clamps to `'+0:00'` (`Math.max(0, …)`, `text.ts:98`). **Use a fixed pair of ISO timestamps — no `Date.now()` dependency here.**

### 6.3 `src/utils/__tests__/format.test.ts` (FIRST — locale + boundary heavy)

- `formatDuration(number)`: boundaries — `< 60s` → seconds; exactly `60000` → `1 min` (no seconds part); `90000` → `1 min 30 sec`; `3600000` → `1 hr`; `>24h` → `Nd Mh`; **negative / non-finite → `0 sec`** (`format.ts:84`); `null/undefined → '-'`.
- `formatDuration(string)`: with faked system time, an ISO start in the past yields a positive elapsed; a **future** start (negative elapsed) clamps to `0 sec`.
- `formatDateTime`: valid date → contains short date + time parts; `null`/invalid → `'-'`; verify the `replaceYearPart` path renders the full 4-digit year (short style would otherwise 2-digit it).
- `formatNumber`: passes through `Intl.NumberFormatOptions`; locale-sensitive grouping (assert *contains* a separator rather than exact char).
- `formatCurrency`: default `USD`, `minimumFractionDigits` default `0` / `maximumFractionDigits` default `2`; respects overrides; honors explicit currency code.

### 6.4 Component behavior gaps to add (after utils)

Strengthen beyond the existing render-smoke tests:

- **`LiveTimer`** (`components/LiveTimer/LiveTimer.tsx`, only 2 cases today): with fake timers — initial render shows elapsed from `startTime`; advancing 1s updates the text; `paused` freezes updates; `baseMs` offset is added; `startTime` null renders the `baseMs` (or `0 sec`) value; unmount clears the interval.
- **`ProviderBadge`** (`components/ProviderBadge/ProviderBadge.tsx`): exhaustive `normalizeProviderId` table (`'claude-code'→claude`, `'gpt-4'→codex`, `'ollama'→local`, `'x-ai'→grok`, `''→unknown`, `'sourcegraph'→amp`); renders `<img>` only when `logoBaseUrl` **and** a logo file exist, else letter avatar; `codex` gets `--mono` class; `data-provider`/`data-size` attributes; `providerLabel` mapping. Both functions are **barrel exports** — treat the tables as public contract.
- **`PrerequisiteBadge`**: empty list → renders `null`; all satisfied → "Prerequisites met" (`data-blocked="false"`); some unsatisfied → "Blocked — waiting on N prerequisite(s)" with correct singular/plural and `title` listing; explicit `blocked` prop overrides the derived value.
- **`StatusBadge`**: `type="neutral"` hides the dot wrapper; non-neutral shows dot; `pulse` adds the `--ping` dot; `data-type` reflects the kind.
- **Interactive cards** (`ActiveTaskCard`, `InteractiveSessionCard`, `PipelineShellCard`): verify each outbound callback (`onCancel`/`onContinue`/`onOpenTask` etc.) fires with expected args; verify generic titles and internal stokd prompts (`isInternalStokdPrompt`) are suppressed in the rendered conversation (ties `text.ts` helpers to UI).

### 6.5 `groupSessions` — extend existing

- Stable ordering invariant: re-running `groupSessionsByRequest` after a session's `displayStatus`/activity changes (but same `started_at`+`key`) yields the **same order**.
- `compareSessionGroups` (`grouping/groupSessions.ts:35`): newest `started_at` first; equal starts tie-break by `key.localeCompare`; groups with no parseable `started_at` sort as `0`-start (last).
- `groupSessionsByRequest` (`grouping/groupSessions.ts:49`): multiple sessions sharing a `resolve().key` collapse into one group; `title`/`workType` taken from first resolution.

### 6.6 Axiom guard test (cheap insurance) — `src/__tests__/axioms.test.ts`

A lightweight static test that reads the `src` tree and asserts the computational
acceptance checks from `.axioms.md`, so a violation fails CI in this package
(not just a repo-wide grep):

- No `@stokd-cloud/` import anywhere in `src`.
- No `fetch(`/`axios`/`apiClient`/`react-router` in `src`.
- No `tailwind` reference, and no hex/`rgb(` color literals in any `*.tsx` (color literals belong only in `src/theme/tokens.css`).

---

## 7. Coverage Targets (medium priority)

Given the package is pure and trivially testable, aim higher than a typical
medium-priority package:

| Area | Target (lines/branches) |
| --- | --- |
| `src/utils/**` (`status`, `text`, `format`) | **≥ 95%** — pure functions, no excuse for gaps |
| `src/grouping/**` | **≥ 95%** |
| `src/components/**` | **≥ 80%** statements, **≥ 70%** branches |
| **Package overall** | **≥ 85%** statements / **≥ 75%** branches |

Enforce via `jest.config.js`:

```js
coverageThreshold: {
  global: { statements: 85, branches: 75, functions: 85, lines: 85 },
  './src/utils/': { statements: 95, branches: 90 },
},
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/**/index.ts',
  '!src/__tests__/**',
],
```

Run coverage with the existing `pnpm --filter @stoked-ui/stokd test:coverage`.

---

## 8. TDD Note (per SC_AXIOMS §5)

For any future behavior change in this package, write the failing test first
(red), implement, then green — and record the red→green outcome series. The pure
utilities make this cheap: a new branch in `displayStatusKind` or a new provider
key in `normalizeProviderId` should arrive **with** its table-row test. The
util-test backfill in §6.1–6.3 is the one exception (characterization tests for
already-shipped pure code); write them to pin current behavior, and treat any
surprising result as a bug to fix, not a test to weaken.

---

## 9. Command Reference

```bash
# from repo root
pnpm --filter @stoked-ui/stokd test            # full suite
pnpm --filter @stoked-ui/stokd test:watch      # watch mode
pnpm --filter @stoked-ui/stokd test:coverage   # coverage report
pnpm --filter @stoked-ui/stokd typescript      # tsc type-check (tsconfig.json)

# single file
pnpm --filter @stoked-ui/stokd exec jest src/utils/__tests__/text.test.ts
```
