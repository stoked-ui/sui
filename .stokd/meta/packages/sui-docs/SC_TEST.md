# Testing Strategy: `@stoked-ui/docs`

> **Generated:** 2026-06-06 | **Meta version:** 0.4.0
> **Package:** `packages/sui-docs` (`@stoked-ui/docs` v0.1.21)
> **Priority:** Medium
> **Source entry:** `packages/sui-docs/src/index.ts`

`@stoked-ui/docs` is the documentation-infrastructure layer consumed almost
exclusively by the `docs/` Next.js app (port 5199). It is **not** a runtime
dependency of any other publishable `@stoked-ui/*` package, so a regression here
has a narrow blast radius — it breaks the docs/marketing site, not the editor or
timeline runtimes. Its public contract is wide, though: 30+ subpath exports
(`./Demo`, `./HighlightedCode`, `./branding`, `./i18n`, `./getProductInfoFromUrl`,
…) pinned by `AX-MOD-SUIDOCS-001`. Investment should match Medium priority:
lock down the pure logic and the public contracts the axioms already name, skip
the large styled/iframe components.

---

## 1. Current State (verified 2026-06-06)

| Item | Status |
|---|---|
| Test runner | **None.** `package.json#scripts.test` is `"exit 0"` |
| Test files in package | **0** (`find packages/sui-docs -name "*.test.*"` → empty) |
| CI gating | None — package contributes nothing to the umbrella suite |
| Type-check | No standalone `typescript` script. `npx tsc --noEmit -p packages/sui-docs/tsconfig.json` → exit 0, 0 errors (per `AX-MOD-SUIDOCS-004`) |
| Build | `pnpm --filter @stoked-ui/docs build` (legacy → node → stable → types → copy-files → postbuild) |

**Everything in this package is currently untested.** The highest-value, lowest-cost
targets are the pure functions in `src/utils.tsx`, `src/components/getProductInfoFromUrl.ts`,
`src/components/FileExtension.ts`, `src/components/addHiddenInput.ts`,
`src/components/Dependencies.ts`, `src/components/CreateReactApp.ts`, and
`src/components/stylingSolutionMapping.ts`.

### 1.1 There is already a working test corpus for this logic — in `docs/`

Most of this package was forked from the MUI docs-infra, and the **docs app still
carries Mocha/chai tests for the same logic**. These are the canonical templates —
read them before writing anything new:

| Existing test (in `docs/`) | Exercises logic equivalent to |
|---|---|
| `docs/src/modules/sandbox/Dependencies.test.js` | `src/components/Dependencies.ts` (`SandboxDependencies`) |
| `docs/src/modules/sandbox/CodeSandbox.test.js` | `src/components/CodeSandbox.tsx` |
| `docs/src/modules/sandbox/StackBlitz.test.js` | `src/components/StackBlitz.tsx` |
| `docs/src/modules/components/HighlightedCode.test.js` | `src/components/HighlightedCode.tsx` |
| `docs/src/modules/utils/getProductInfoFromUrl.test.js` | `src/components/getProductInfoFromUrl.ts` ⚠️ **see drift note below** |

These prove the framework choice (§2): all use `chai` + Mocha, and the component
test uses `createRenderer()` from `@stoked-ui/internal-test-utils` and imports
`getDesignTokens` from `@stoked-ui/docs/branding`.

### 1.2 ⚠️ Known drift: `getProductInfoFromUrl` has two divergent signatures

This is a real bug-shaped hazard for anyone copying tests across the boundary:

- **Package copy** `packages/sui-docs/src/components/getProductInfoFromUrl.ts` —
  `getProductInfoFromUrl(languages: string[], asPath: string)` (legacy MUI 2-arg
  form; matches only `stoked-ui|file-explorer|media-selector|timeline|editor|core|versions|docs`).
- **Docs copy** `docs/src/modules/utils/getProductInfoFromUrl.ts` —
  `getProductInfoFromUrl(asPath: string)` (1-arg; understands `/products/…`,
  `/consulting/…`, `flux`, `focus-capture`, `github`).

The existing `docs/.../getProductInfoFromUrl.test.js` targets the **1-arg** copy.
**Do not copy it verbatim into this package** — tests here must call the 2-arg
signature. When writing this package's test, also record the drift as a finding:
the two copies should eventually be reconciled (the package is the publishable
source of truth, but the docs copy is the one that actually evolved).

---

## 2. Test Framework and Tooling

### Use Mocha + chai + sinon + `@stoked-ui/internal-test-utils` — NOT Jest

This is the single most important decision and it is **already settled by repo
convention**, not open for re-litigation:

- The umbrella suite is Mocha, globbing `packages/**/*.test.{js,ts,tsx}` (see root
  `package.json` → `test:unit`, and `.mocharc.js`). A `*.test.tsx` placed anywhere
  under `packages/sui-docs/src/**` is **automatically picked up** by that glob — no
  per-package config needed.
- `.mocharc.js` already wires the required setup:
  `require: ['@stoked-ui/internal-test-utils/setupBabel', '@stoked-ui/internal-test-utils/setupJSDOM']`.
  Babel transpiles `.ts/.tsx`; JSDOM supplies `document`, `window`, cookies, etc.
- **A Jest config in this package would break the monorepo.** Per `MEMORY.md`
  ("Dual test stacks"), a Jest test file inside a publishable package collides with
  the Mocha glob; only `sui-common` and `sui-media` are sanctioned Jest islands.
  Do not add `jest`, `ts-jest`, or a `jest.config.js` here.

### Canonical imports for this package

```ts
// pure-function test (no DOM-render needed)
import { expect } from 'chai';
import getFileExtension from '@stoked-ui/docs/getFileExtension'; // or relative '../FileExtension'

// component/hook test
import * as React from 'react';
import { expect } from 'chai';
import { spy, useFakeTimers } from 'sinon';
import { act, createRenderer, fireEvent, screen, renderHook } from '@stoked-ui/internal-test-utils';
```

`createRenderer()` returns `{ render }` (plus `clock`, `setProps`) and re-exports
everything from `@testing-library/react/pure`, so `renderHook`, `fireEvent`,
`screen`, and `act` all come from `@stoked-ui/internal-test-utils`.

### Running the tests

```bash
# whole package (relies on the umbrella glob — run from repo root)
nvm use v20.20.0   # MEMORY.md: Node 26 breaks the umbrella Mocha runner
cross-env NODE_ENV=test mocha 'packages/sui-docs/**/*.test.{js,ts,tsx}'

# single file while iterating
cross-env NODE_ENV=test mocha packages/sui-docs/src/components/FileExtension.test.tsx
```

No change to `package.json#scripts.test` is required for the umbrella to find the
tests, but it is worth replacing `"exit 0"` with a local convenience script:

```json
"test": "cross-env NODE_ENV=test mocha 'src/**/*.test.{js,ts,tsx}' --require @stoked-ui/internal-test-utils/setupBabel --require @stoked-ui/internal-test-utils/setupJSDOM"
```

---

## 3. Test File Organization and Naming

Follow the **co-located** convention used across `packages/sui-*` (e.g.
`packages/sui-editor/src/EditorFile/EditorFile.test.tsx`,
`packages/sui-file-explorer/src/useFile/useFile.test.tsx`). Place the test next to
its source, not in a `__tests__/` folder (that folder convention belongs to the
Jest islands `sui-common`/`sui-media`).

```
packages/sui-docs/src/
├── utils.test.tsx                              # pathnameToLanguage, pageToTitle, pageToTitleI18n, getCookie, useClipboardCopy
├── components/
│   ├── FileExtension.test.ts                   # getFileExtension
│   ├── addHiddenInput.test.ts                  # addHiddenInput
│   ├── getProductInfoFromUrl.test.ts           # 2-arg signature (see §1.2)
│   ├── Dependencies.test.ts                    # SandboxDependencies + @types resolution
│   ├── CreateReactApp.test.ts                  # getHtml, getRootIndex, getTsconfig
│   ├── stylingSolutionMapping.test.ts          # static CODE_STYLING → slug map
│   ├── codeVariant.test.tsx                    # CodeVariantProvider + hooks
│   └── codeStylingSolution.test.tsx            # CodeStylingProvider + hooks
├── i18n/
│   └── i18n.test.tsx                           # useTranslate, providers, mapTranslations
└── DocsProvider/
    └── DocsProvider.test.tsx                   # DocsProvider, useDocsConfig (throw contract)
```

**Naming:** `<Module>.test.ts` for pure logic, `<Module>.test.tsx` for anything that
renders React. One test file per source module.

---

## 4. Mock/Stub Strategy

JSDOM (loaded by `setupJSDOM`) provides `document`, `window`, `document.cookie`, and
`window.location` for free — most "mocking" here is just setting those before the
call and restoring after.

### 4.1 Browser state (cookies, location hash)

```ts
// document.cookie — JSDOM cookie jar is writable directly
beforeEach(() => { document.cookie = 'codeVariant=JS; path=/'; });
afterEach(() => { document.cookie = 'codeVariant=; path=/; max-age=0'; });

// window.location.hash — JSDOM lets you assign it; restore in afterEach
let originalHash;
beforeEach(() => { originalHash = window.location.hash; window.location.hash = '#demo.js'; });
afterEach(() => { window.location.hash = originalHash; });

// navigator.platform — for the macOS branch in CodeCopyButton
const restore = Object.getOwnPropertyDescriptor(navigator, 'platform');
Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });
```

### 4.2 External libraries — prefer sinon spies/stubs over module mocks

Mocha has no `jest.mock`. Use `sinon` and dependency-injection points instead:

- `clipboard-copy` — `useClipboardCopy` (`src/utils.tsx`) calls the default export.
  Test the **observable** state (`isCopied` flips true then false after 1200ms via
  `sinon.useFakeTimers()`); the actual clipboard write is a no-op in JSDOM and can
  be ignored. Avoid trying to intercept the ESM default export.
- `nprogress` (`src/NProgressBar/NProgressBar.js`) — thin wrapper; **excluded** from
  coverage (§5), no mock needed.
- `lodash/upperFirst`, `lodash/camelCase`, `@mui/utils` `deepmerge` — pure, let them run.

### 4.3 `window.muiDocConfig` global (Dependencies.ts)

`SandboxDependencies` reads `(window as any).muiDocConfig` and, if present, calls
`csbIncludePeerDependencies` / `csbGetVersions`. Reset it per test:

```ts
afterEach(() => { delete (window as any).muiDocConfig; });

// to test the hook path:
(window as any).muiDocConfig = {
  csbIncludePeerDependencies: spy((deps) => deps),
  csbGetVersions: spy((versions) => versions),
};
```

Also note `Dependencies.test.js` (docs copy) sets
`process.env.SOURCE_CODE_REPO = 'https://github.com/mui/material-ui'` in `before`
and deletes it in `after` — required to exercise the `commitRef` → `pkg.csb.dev`
branch of `getMuiPackageVersion`. Mirror that.

### 4.4 Component renders — provider wrapper

Components that consume contexts need a wrapper. Build one shared helper rather than
repeating it (DocsProvider config shape is pinned by `AX-MOD-SUIDOCS-003` — exactly
four fields):

```tsx
const docsConfig = {
  LANGUAGES: ['en'],
  LANGUAGES_SSR: ['en'],
  LANGUAGES_IN_PROGRESS: [],
  LANGUAGES_IGNORE_PAGES: () => false,
};
// wrap in <ThemeProvider theme={createTheme()}> + <DocsProvider config={docsConfig} defaultUserLanguage="en">
```

The `HighlightedCode.test.js` template shows the minimal "does not crash with
default + branding theme, light + dark" smoke pattern using
`getDesignTokens('light'|'dark')` from `@stoked-ui/docs/branding` — reuse it for any
themed component.

---

## 5. Coverage Targets

Medium priority, narrow blast radius. Target logic, not styling.

| Metric | Target | Rationale |
|---|---|---|
| **Statements** | 65% | Concentrated in the pure-function + provider files |
| **Branches** | 60% | URL-hash / cookie / language fallbacks are the branch-heavy paths worth covering |
| **Functions** | 70% | Every *exported pure function* and every *provider/hook* gets ≥1 test |
| **Lines** | 65% | Tracks statements |

Coverage is **not CI-enforced** for this package today; these are review guides, not
gates. Measure with the repo's nyc setup (`pnpm test:coverage` globs `packages/**`).

### Explicitly out of scope (low logic density / not unit-testable)

- `src/components/MarkdownElement.tsx` — ~800 lines of CSS-in-JS, no logic.
- `src/components/DemoToolbar.tsx`, `DemoToolbarRoot.tsx`, `DemoToolbarFallback/` —
  heavy MUI/GA/Next-router coupling; cover via the docs app E2E if at all.
- `src/components/DemoSandbox.tsx`, `Demo.tsx`, `DemoEditor.tsx`,
  `DemoCodeViewer/` — iframe / JSS / live-editor rendering.
- `src/components/ThemeContext.tsx` — large stateful surface; integration-level.
- `src/components/ReactRunner.tsx` — wraps `react-runner` eval.
- `src/NProgressBar/NProgressBar.js`, `src/svgIcons/*` — thin wrappers / static SVG.
- All `index.ts` / `index.tsx` barrels — re-exports only (covered structurally by
  the build, per `AX-MOD-SUIDOCS-001`).

---

## 6. Specific Test Cases to Implement First

### Phase 1 — Pure functions (write first, no render needed)

#### `src/components/FileExtension.test.ts`
```ts
import { expect } from 'chai';
import getFileExtension from './FileExtension';

describe('getFileExtension', () => {
  it("returns 'tsx' for 'TS'", () => { expect(getFileExtension('TS')).to.equal('tsx'); });
  it("returns 'js' for 'JS'", () => { expect(getFileExtension('JS')).to.equal('js'); });
  it('throws on an unsupported variant', () => {
    // @ts-expect-error intentionally invalid
    expect(() => getFileExtension('PY')).to.throw('Unsupported codeVariant: PY');
  });
});
```

#### `src/components/addHiddenInput.test.ts`
```ts
import { expect } from 'chai';
import addHiddenInput from './addHiddenInput';

describe('addHiddenInput', () => {
  it('appends a hidden input with name and value', () => {
    const form = document.createElement('form');
    addHiddenInput(form, 'parameters', 'abc');
    const input = form.querySelector('input');
    expect(input).to.not.equal(null);
    expect(input.type).to.equal('hidden');
    expect(input.name).to.equal('parameters');
    expect(input.value).to.equal('abc');
  });
});
```

#### `src/utils.test.tsx` — `pathnameToLanguage`, `pageToTitle`, `getCookie`
- `pathnameToLanguage(['en','fr'], '/fr/components/x')` → `userLanguage: 'fr'`, language stripped from `canonicalAs`.
- `'zh'` is recognized even though it is **not** in `LANGUAGES_LABEL` (hard-coded in the check).
- hash is stripped in `canonicalAsServer` but kept in `canonicalAs`.
- `/api/...` rewrites to `/api-docs/...` in `canonicalPathname`; trailing slash stripped except for `'/'`.
- `pageToTitle`: `title === false` → `null`; explicit `title` passes through; `/api-docs/` path → PascalCase; `/api/` path with `use*` → camelCase, else PascalCase; plain path → titleized.
- `getCookie`: returns value by name; `undefined` when absent; **throws** the documented message when `document` is undefined (simulate by temporarily shadowing — or assert the guard via the message string).

#### `src/components/getProductInfoFromUrl.test.ts` — **2-arg signature** (§1.2)
```ts
import { expect } from 'chai';
import getProductInfoFromUrl from './getProductInfoFromUrl';

describe('getProductInfoFromUrl (2-arg package copy)', () => {
  const langs = ['en', 'fr'];
  it('maps core products to category "core"', () => {
    expect(getProductInfoFromUrl(langs, '/editor/components/editor/'))
      .to.deep.equal({ productCategoryId: 'core', productId: 'editor' });
    expect(getProductInfoFromUrl(langs, '/file-explorer/docs/overview/'))
      .to.deep.equal({ productCategoryId: 'core', productId: 'file-explorer' });
  });
  it("maps '/docs/' to productId 'docs'", () => {
    expect(getProductInfoFromUrl(langs, '/docs/overview/').productId).to.equal('docs');
  });
  it("maps legacy '/versions/' and '/production-error/' to 'docs'", () => {
    expect(getProductInfoFromUrl(langs, '/versions/').productId).to.equal('docs');
  });
  it("maps '/experiments/docs/' to 'docs-infra'", () => {
    expect(getProductInfoFromUrl(langs, '/experiments/docs/foo').productId).to.equal('docs-infra');
  });
  it('strips the language prefix before matching', () => {
    expect(getProductInfoFromUrl(langs, '/fr/timeline/docs/#api'))
      .to.deep.equal({ productCategoryId: 'core', productId: 'timeline' });
  });
  it("returns 'null'/'null' for unknown routes", () => {
    expect(getProductInfoFromUrl(langs, '/')).to.deep.equal({ productCategoryId: 'null', productId: 'null' });
  });
});
```

#### `src/components/stylingSolutionMapping.test.ts`
- `CODE_STYLING.TAILWIND → 'tailwind'`, `CODE_STYLING.CSS → 'css'`, `CODE_STYLING.SYSTEM → 'system'` (guards `AX-MOD-SUIDOCS-004`).

#### `src/components/CreateReactApp.test.ts` — `getHtml`, `getRootIndex`, `getTsconfig`
- `getHtml`: includes `<title>` and `lang`; injects the Tailwind CDN `<script>` only when `codeStyling === 'Tailwind'`; adds `Material+Icons+Two+Tone` when `raw` references `material-icons-two-tone`.
- `getRootIndex(demoData)`: provider selection varies by `productId` (joy-ui vs default vs base-ui); TS variant adds the non-null assertion that JS omits.
- `getTsconfig()`: returns a parseable JSON string (`JSON.parse` doesn't throw).

### Phase 2 — Dependency resolution (the most logic-dense module)

#### `src/components/Dependencies.test.ts`
Port `docs/src/modules/sandbox/Dependencies.test.js` (it already passes against
equivalent logic). Cover: `@`-scoped imports, `*` imports, side-effect imports
(`import 'x'`), multiline imports, `@types/*` injection for TS, **skipping** `@types`
for `packagesWithBundledTypes` (`date-fns`, `@emotion/*`, `dayjs`) and `@mui/*`,
scoped `@types` naming (`@foo/bar → @types/foo__bar`), `@mui/lab`/`icons` pulling in
`@mui/material`, the `commitRef` → `pkg.csb.dev` URL branch (set
`process.env.SOURCE_CODE_REPO` in `before`), and that relative imports (`./x`,
`../x`) are **not** treated as deps.

### Phase 3 — Hooks & providers

#### `src/DocsProvider/DocsProvider.test.tsx` (pins `AX-MOD-SUIDOCS-003`)
```tsx
import { expect } from 'chai';
import { renderHook } from '@stoked-ui/internal-test-utils';
import { DocsProvider, useDocsConfig } from './DocsProvider';

it('throws when useDocsConfig is used outside a provider', () => {
  expect(() => renderHook(() => useDocsConfig()))
    .to.throw(/Could not find docs config context value/);
});
it('returns the config inside a provider', () => {
  const config = { LANGUAGES: ['en'], LANGUAGES_SSR: ['en'], LANGUAGES_IN_PROGRESS: [], LANGUAGES_IGNORE_PAGES: () => false };
  const { result } = renderHook(() => useDocsConfig(), {
    wrapper: ({ children }) => <DocsProvider config={config} defaultUserLanguage="en">{children}</DocsProvider>,
  });
  expect(result.current.LANGUAGES).to.deep.equal(['en']);
});
```

#### `src/i18n/i18n.test.tsx`
- `useTranslate`: returns translation for a known key; falls back to English for a
  missing language key; logs error + returns the key when the language is missing
  entirely; `ignoreWarning: true` suppresses the warn-once.
- `TranslationsProvider`: deep-merges custom translations over defaults.
- `mapTranslations`: maps `-en` suffixed require-context entries to the `en` key
  (and unsuffixed → `en`).

#### `src/components/codeVariant.test.tsx` (pins `AX-MOD-SUIDOCS-004` precedence)
- default is `CODE_VARIANTS.TS`; URL hash `#demo.tsx` → TS, `#demo.js` → JS;
  cookie wins when there is no hash; precedence is **hash → cookie → default**;
  a variant change writes the `codeVariant` cookie.
- mirror for `codeStylingSolution.test.tsx`: hash slugs `tailwind-` / `css-` /
  `system-` map to the matching `CODE_STYLING`.

### Phase 4 — Component smoke (optional at Medium)
- `CodeCopyButton.test.tsx`: renders an accessible "Copy the code" control; click
  flips to the check icon; `⌘` vs `Ctrl+` per `navigator.platform`.
- `HighlightedCode.test.tsx`: the four-case "does not crash" smoke from the docs
  template (default + branding theme × light + dark).

---

## 7. Implementation Priority Summary

| Phase | Scope | Est. tests | Notes |
|---|---|---|---|
| **1** | Pure functions (`FileExtension`, `addHiddenInput`, `utils`, `getProductInfoFromUrl`, `stylingSolutionMapping`, `CreateReactApp`) | ~35 | No render infra; highest ROI; pure red→green |
| **2** | `SandboxDependencies` | ~12 | Port the existing docs test; densest logic |
| **3** | Providers & hooks (`DocsProvider`, `i18n`, `codeVariant`, `codeStyling`) | ~20 | Locks the axiom-pinned contracts (`-003`, `-004`) |
| **4** | Component smoke (`CodeCopyButton`, `HighlightedCode`) | ~10 | Optional at Medium |

**~77 tests to reach the §5 targets.** Phase 1 alone covers all pure logic with
zero new infrastructure. Phases 1–3 are the meaningful gate; Phase 4 is gravy.

### TDD note (per repo Axiom 5)
Every one of these is a behavioral change ⇒ write the test, run it **red** against
the current (untested) code, then — for genuinely new behavior — implement; for
this package most logic already exists, so the cycle is: write the test, confirm it
**passes** against existing code (characterization), and record any case that
*fails* as a real bug (the `getProductInfoFromUrl` drift in §1.2 is the prime
candidate to surface this way).

---

## 8. Cross-References

- Package axioms: `packages/sui-docs/.axioms.md`
  (`AX-MOD-SUIDOCS-001` exports/barrel sync, `-002` `muidocs` CSS var prefix,
  `-003` `DocsConfig` shape + `useDocsConfig` throw, `-004` variant/styling precedence)
- Framework convention & Node pin: `MEMORY.md` → "Dual test stacks", "Node version for tests"
- Umbrella config: root `package.json` (`test:unit`, `test:coverage`), `.mocharc.js`
- Live templates: `docs/src/modules/sandbox/*.test.js`,
  `docs/src/modules/components/HighlightedCode.test.js`,
  `docs/src/modules/utils/getProductInfoFromUrl.test.js`
- Repo test inventory: `.stokd/meta/SC_TEST.md`
