# SC_TEST: Testing Strategy — `@stoked-ui/docs`

**Package:** `packages/sui-docs`
**Priority:** Medium
**Current Test Status:** No tests (`"test": "exit 0"` in package.json)

---

## 1. What Should Be Tested

### 1.1 Pure Utility Functions (Highest ROI — No DOM Required)

These are pure functions with deterministic input/output. They should be tested first.

| Function | File | Why |
|---|---|---|
| `getFileExtension` | `src/components/FileExtension.ts` | Maps `'TS'`→`'tsx'`, `'JS'`→`'js'`, throws on invalid input |
| `addHiddenInput` | `src/components/addHiddenInput.ts` | DOM mutation — creates hidden `<input>` on a `<form>` |
| `pathnameToLanguage` | `src/utils.tsx` | Parses URL pathname into language, canonical path, server path |
| `pageToTitle` | `src/utils.tsx` | Converts page metadata to display title with PascalCase/titleCase rules |
| `pageToTitleI18n` | `src/utils.tsx` | i18n-aware title generation with translation fallback |
| `getCookie` | `src/utils.tsx` | Parses `document.cookie` string; throws on server |
| `getProductInfoFromUrl` | `src/components/getProductInfoFromUrl.ts` | Maps URL path to `{ productId, productCategoryId }` |
| `addTypeDeps` (internal) | `src/components/Dependencies.ts` | Adds `@types/*` packages, handles scoped packages |
| `SandboxDependencies` | `src/components/Dependencies.ts` | Extracts import statements from raw code, resolves versions |
| `getPath` (internal) | `src/i18n/i18n.tsx` | Dot-path traversal on nested objects |
| `mapTranslations` | `src/i18n/i18n.tsx` | Maps require context filenames to language-keyed translations |
| `stylingSolutionMapping` | `src/components/stylingSolutionMapping.ts` | Static mapping from CODE_STYLING constants to URL hash values |
| `getHtml` | `src/components/CreateReactApp.ts` | Generates HTML template with conditional Tailwind script |
| `getRootIndex` | `src/components/CreateReactApp.ts` | Generates React entry point code based on product ID and code variant |
| `getTsconfig` | `src/components/CreateReactApp.ts` | Returns static tsconfig JSON string |

### 1.2 React Hooks

| Hook | File | What to Test |
|---|---|---|
| `useClipboardCopy` | `src/utils.tsx` | Returns `{ copy, isCopied }`, resets `isCopied` after 1200ms, handles unmount cleanup |
| `useCodeVariant` / `useSetCodeVariant` | `src/components/codeVariant.tsx` | Reads from context, defaults to `'TS'` |
| `useCodeStyling` / `useSetCodeStyling` | `src/components/codeStylingSolution.tsx` | Reads from context, defaults to `'SUI System'` |
| `useUserLanguage` / `useSetUserLanguage` | `src/i18n/i18n.tsx` | Language state from context |
| `useTranslate` | `src/i18n/i18n.tsx` | Returns translate function, falls back to English, warns on missing keys |
| `useDocsConfig` | `src/DocsProvider/DocsProvider.tsx` | Returns config from context; throws if outside provider |

### 1.3 React Context Providers

| Provider | File | What to Test |
|---|---|---|
| `CodeVariantProvider` | `src/components/codeVariant.tsx` | Initializes from URL hash or cookie, persists to cookie, provides context |
| `CodeStylingProvider` | `src/components/codeStylingSolution.tsx` | Initializes from URL hash (`tailwind-`, `css-`, `system-`) or cookie |
| `UserLanguageProvider` | `src/i18n/i18n.tsx` | Wraps `TranslationsProvider`, provides language state |
| `TranslationsProvider` | `src/i18n/i18n.tsx` | Deep-merges translations into context |
| `DocsProvider` | `src/DocsProvider/DocsProvider.tsx` | Composes `DocsConfigContext` + `UserLanguageProvider` |

### 1.4 React Components (Lower Priority for Medium Package)

| Component | File | Critical Behavior |
|---|---|---|
| `CodeCopyButton` | `src/components/CodeCopyButton.tsx` | Click triggers clipboard copy, shows check icon after copy, detects macOS |
| `HighlightedCode` | `src/components/HighlightedCode.tsx` | Renders syntax-highlighted code, handles language prop |
| `DemoEditorError` | `src/components/DemoEditorError.tsx` | Renders error state for demo editor |
| `InfoCard` | `src/InfoCard/InfoCard.tsx` | Renders card with props |
| `Link` | `src/Link/Link.tsx` | Wraps Next.js link with MUI styling |

### 1.5 Edge Cases

- `pathnameToLanguage` with `'zh'` (Chinese has special handling — included in check but not in `LANGUAGES_LABEL`)
- `getCookie` called on server (should throw)
- `getFileExtension` with invalid variant (should throw)
- `SandboxDependencies` with scoped packages (`@foo/bar` → `@types/foo__bar`)
- `SandboxDependencies` with packages that have bundled types (should not add `@types/*`)
- `getProductInfoFromUrl` with language-prefixed paths (`/zh/stoked-ui/...`)
- `useDocsConfig` outside of `DocsProvider` (should throw)
- `useTranslate` with missing language (should log error, return `'…'`)
- `useTranslate` with missing key (should fall back to English translation)

### 1.6 Integration Points

- `CodeVariantProvider` ↔ cookie persistence (`document.cookie`)
- `CodeVariantProvider` ↔ URL hash reading (`window.location.hash`)
- `CodeStylingProvider` ↔ cookie/hash persistence
- `SandboxDependencies` ↔ `window.muiDocConfig` global
- `BrandingCssVarsProvider` ↔ MUI `CssVarsProvider` + NProgress
- `DocsProvider` → `UserLanguageProvider` → `TranslationsProvider` composition

---

## 2. Test Framework and Tooling

### Recommended: Jest + Testing Library

Follow the pattern established by `sui-media` (the most modern testing setup in the monorepo).

**Why Jest over Mocha for this package:**
- The monorepo is transitioning from Mocha to Jest for newer packages
- Jest provides built-in mocking for `document.cookie`, `window.location`, `window.navigator`
- `jsdom` test environment handles DOM APIs needed by this package
- Better DX for hook testing with `@testing-library/react`'s `renderHook`

### Dependencies to Add (devDependencies)

```json
{
  "jest": "^29.7.0",
  "ts-jest": "^29.1.2",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/user-event": "^14.5.1",
  "identity-obj-proxy": "^3.0.0",
  "@types/jest": "^29.5.0"
}
```

### Jest Configuration

Create `packages/sui-docs/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.test.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterSetup: ['<rootDir>/src/__tests__/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/index.tsx',
  ],
};
```

### Test Setup File

Create `packages/sui-docs/src/__tests__/setup.ts`:

```typescript
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

### Update package.json test script

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 3. Test File Organization and Naming

```
packages/sui-docs/src/
├── __tests__/
│   ├── setup.ts                           # Jest setup (DOM mocks, jest-dom)
│   ├── utils.test.ts                      # Tests for src/utils.tsx
│   └── test-utils.tsx                     # Shared render wrappers with providers
├── components/
│   ├── __tests__/
│   │   ├── FileExtension.test.ts          # getFileExtension
│   │   ├── addHiddenInput.test.ts         # addHiddenInput
│   │   ├── Dependencies.test.ts           # SandboxDependencies + addTypeDeps
│   │   ├── getProductInfoFromUrl.test.ts  # getProductInfoFromUrl
│   │   ├── CreateReactApp.test.ts         # getHtml, getRootIndex, getTsconfig
│   │   ├── stylingSolutionMapping.test.ts # stylingSolutionMapping
│   │   ├── codeVariant.test.tsx           # CodeVariantProvider + hooks
│   │   ├── codeStylingSolution.test.tsx   # CodeStylingProvider + hooks
│   │   └── CodeCopyButton.test.tsx        # CodeCopyButton component
│   └── ...
├── i18n/
│   └── __tests__/
│       └── i18n.test.tsx                  # Providers, useTranslate, mapTranslations
├── DocsProvider/
│   └── __tests__/
│       └── DocsProvider.test.tsx          # DocsProvider, useDocsConfig
└── ...
```

**Naming conventions:**
- Test files: `<ModuleName>.test.ts` (pure functions) or `<ModuleName>.test.tsx` (React components/hooks)
- Colocated in `__tests__/` directories alongside source
- Shared test utilities in `src/__tests__/test-utils.tsx`

---

## 4. Mock/Stub Strategy

### 4.1 Browser APIs (Jest Built-in)

```typescript
// document.cookie — use Object.defineProperty per test
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: 'codeVariant=TS; codeStyling=SUI System',
});

// window.location.hash — use Jest spyOn or JSDOM direct manipulation
delete (window as any).location;
window.location = { hash: '#demo.tsx' } as Location;

// window.navigator.platform — for macOS detection in CodeCopyButton
Object.defineProperty(navigator, 'platform', { value: 'MacIntel', writable: true });
```

### 4.2 External Libraries

```typescript
// clipboard-copy — mock the default export
jest.mock('clipboard-copy', () => jest.fn().mockResolvedValue(undefined));

// @mui/utils deepmerge — let it run (pure function, no side effects)
// No mock needed

// lodash/upperFirst, lodash/camelCase — let them run (pure functions)
// No mock needed

// nprogress — mock start/done/configure
jest.mock('nprogress', () => ({
  start: jest.fn(),
  done: jest.fn(),
  configure: jest.fn(),
}));
```

### 4.3 Next.js Router

```typescript
jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/stoked-ui/components/button',
    pathname: '/stoked-ui/components/button',
    events: { on: jest.fn(), off: jest.fn() },
  }),
}));
```

### 4.4 MUI Components (For Component Tests)

For component-level tests, wrap renders with necessary MUI providers:

```typescript
// src/__tests__/test-utils.tsx
import * as React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DocsProvider } from '../DocsProvider';
import { CodeVariantProvider } from '../components/codeVariant';
import { CodeStylingProvider } from '../components/codeStylingSolution';

const defaultConfig = {
  LANGUAGES: ['en'],
  LANGUAGES_SSR: ['en'],
  LANGUAGES_IN_PROGRESS: [],
  LANGUAGES_IGNORE_PAGES: () => false,
};

export function renderWithProviders(ui: React.ReactElement, options = {}) {
  return render(
    <ThemeProvider theme={createTheme()}>
      <DocsProvider config={defaultConfig} defaultUserLanguage="en">
        <CodeVariantProvider>
          <CodeStylingProvider>
            {ui}
          </CodeStylingProvider>
        </CodeVariantProvider>
      </DocsProvider>
    </ThemeProvider>,
    options,
  );
}
```

### 4.5 `window.muiDocConfig` Global

```typescript
// For SandboxDependencies tests
beforeEach(() => {
  (window as any).muiDocConfig = undefined;
});

// Test with custom config
(window as any).muiDocConfig = {
  csbIncludePeerDependencies: jest.fn((deps) => deps),
  csbGetVersions: jest.fn((versions) => versions),
  postProcessImport: jest.fn(() => null),
};
```

---

## 5. Coverage Targets

For a **medium priority** documentation infrastructure package:

| Metric | Target | Rationale |
|---|---|---|
| **Statements** | 70% | Focus on utility functions and hooks, skip complex styled components |
| **Branches** | 65% | Many branches are URL/cookie edge cases worth covering |
| **Functions** | 75% | All exported functions should have at least one test |
| **Lines** | 70% | Aligned with statement coverage |

### Excluded from Coverage

- `src/components/MarkdownElement.tsx` — 800+ lines of CSS-in-JS styling, low logic density
- `src/components/DemoToolbar.tsx` — 750+ lines, heavily coupled to MUI, GA, Next.js router
- `src/components/DemoSandbox.tsx` — iframe rendering, JSS setup, not unit-testable
- `src/components/ThemeContext.tsx` — complex state management, better tested via integration
- `src/NProgressBar/NProgressBar.js` — thin wrapper around nprogress
- Barrel `index.ts` / `index.tsx` files — re-exports only

---

## 6. Specific Test Cases to Implement First

### Phase 1: Pure Functions (Week 1)

#### `src/components/__tests__/FileExtension.test.ts`

```typescript
describe('getFileExtension', () => {
  it('returns "tsx" for TS variant', () => {});
  it('returns "js" for JS variant', () => {});
  it('throws for unsupported variant', () => {});
});
```

#### `src/components/__tests__/addHiddenInput.test.ts`

```typescript
describe('addHiddenInput', () => {
  it('creates a hidden input element on the form', () => {});
  it('sets name and value attributes correctly', () => {});
  it('appends the input as a child of the form', () => {});
});
```

#### `src/__tests__/utils.test.ts`

```typescript
describe('pathnameToLanguage', () => {
  const languages = ['en', 'fr', 'de'];
  it('detects "en" for root paths', () => {});
  it('detects "fr" for /fr/ prefixed paths', () => {});
  it('detects "zh" even when not in languages array (hardcoded)', () => {});
  it('strips language prefix from canonicalAs', () => {});
  it('strips hash from canonicalAsServer', () => {});
  it('replaces /api with /api-docs in canonicalPathname', () => {});
  it('strips trailing slash except for root', () => {});
  it('preserves root "/" without modification', () => {});
});

describe('pageToTitle', () => {
  it('returns null when page.title is false', () => {});
  it('returns page.title when explicitly set', () => {});
  it('PascalCases api-docs paths', () => {});
  it('camelCases hook names (use* prefix) in api paths', () => {});
  it('PascalCases component names in api paths', () => {});
  it('titleizes regular page paths', () => {});
  it('uses subheader over pathname when available', () => {});
});

describe('getCookie', () => {
  it('returns cookie value by name', () => {});
  it('returns undefined for missing cookie', () => {});
  it('throws when called on server (no document)', () => {});
  it('handles multiple cookies correctly', () => {});
});
```

#### `src/components/__tests__/getProductInfoFromUrl.test.ts`

```typescript
describe('getProductInfoFromUrl', () => {
  const languages = ['en', 'fr'];

  it('returns core category for /stoked-ui/ paths', () => {});
  it('returns core category for /file-explorer/ paths', () => {});
  it('returns core category for /timeline/ paths', () => {});
  it('returns core category for /editor/ paths', () => {});
  it('returns core category for /media-selector/ paths', () => {});
  it('returns docs productId for /docs/ paths', () => {});
  it('returns docs productId for /versions/ paths (legacy)', () => {});
  it('returns docs-infra for /experiments/docs/ paths', () => {});
  it('returns null productId and categoryId for unknown paths', () => {});
  it('strips language prefix before matching', () => {});
});
```

#### `src/components/__tests__/CreateReactApp.test.ts`

```typescript
describe('getHtml', () => {
  it('generates valid HTML with title and language', () => {});
  it('includes Tailwind CDN script when codeStyling is Tailwind', () => {});
  it('omits Tailwind script for SUI System styling', () => {});
  it('includes Two Tone icon variant when raw code references it', () => {});
});

describe('getRootIndex', () => {
  it('uses CssVarsProvider for joy-ui product', () => {});
  it('uses StyledEngineProvider for default product', () => {});
  it('renders without provider wrapper for base-ui product', () => {});
  it('adds non-null assertion for TS variant', () => {});
  it('omits non-null assertion for JS variant', () => {});
});

describe('getTsconfig', () => {
  it('returns valid JSON string', () => {});
  it('targets es5 with React JSX', () => {});
});
```

### Phase 2: Dependency Resolution (Week 1-2)

#### `src/components/__tests__/Dependencies.test.ts`

```typescript
describe('SandboxDependencies', () => {
  beforeEach(() => {
    (window as any).muiDocConfig = undefined;
  });

  it('extracts simple imports', () => {
    // raw: "import Button from '@mui/material'"
  });
  it('extracts scoped package imports', () => {
    // raw: "import { DataGrid } from '@mui/x-data-grid'"
  });
  it('ignores relative imports', () => {
    // raw: "import Foo from './Foo'"
  });
  it('adds @types/* for TS variant', () => {});
  it('skips @types/* for packages with bundled types (date-fns, emotion)', () => {});
  it('skips @types/* for @mui/* scoped packages', () => {});
  it('handles scoped @types/ naming (@foo/bar → @types/foo__bar)', () => {});
  it('adds typescript dependency for TS variant', () => {});
  it('adds @mui/material when no productId and not already present', () => {});
  it('includes react-scripts in devDependencies', () => {});
  it('includes peer dependencies (react, react-dom, emotion)', () => {});
  it('calls muiDocConfig hooks when available', () => {});
});
```

### Phase 3: React Hooks and Providers (Week 2)

#### `src/i18n/__tests__/i18n.test.tsx`

```typescript
describe('useTranslate', () => {
  it('returns translation for valid key', () => {});
  it('falls back to English for missing language key', () => {});
  it('returns "…" when language is missing entirely', () => {});
  it('logs error for missing translation key (non-CI)', () => {});
  it('suppresses warning when ignoreWarning is true', () => {});
  it('resolves dot-separated nested paths', () => {});
});

describe('UserLanguageProvider', () => {
  it('provides defaultUserLanguage to children', () => {});
  it('allows language to be changed via setUserLanguage', () => {});
});

describe('TranslationsProvider', () => {
  it('deep-merges custom translations with defaults', () => {});
});

describe('mapTranslations', () => {
  it('maps -en.json to en key', () => {});
  it('maps -fr.json to fr key', () => {});
  it('maps files without language suffix to en', () => {});
});
```

#### `src/DocsProvider/__tests__/DocsProvider.test.tsx`

```typescript
describe('DocsProvider', () => {
  it('renders children with config context', () => {});
  it('provides language configuration to children', () => {});
});

describe('useDocsConfig', () => {
  it('returns config when inside DocsProvider', () => {});
  it('throws when used outside DocsProvider', () => {});
});
```

#### `src/components/__tests__/codeVariant.test.tsx`

```typescript
describe('CodeVariantProvider', () => {
  it('defaults to TS variant', () => {});
  it('reads initial variant from URL hash (.tsx → TS)', () => {});
  it('reads initial variant from URL hash (.js → JS)', () => {});
  it('reads initial variant from cookie when no hash', () => {});
  it('persists variant changes to cookie', () => {});
});

describe('useCodeVariant / useSetCodeVariant', () => {
  it('returns current variant from context', () => {});
  it('updates variant via setter', () => {});
});
```

### Phase 4: Component Rendering (Week 3, Optional)

#### `src/components/__tests__/CodeCopyButton.test.tsx`

```typescript
describe('CodeCopyButton', () => {
  it('renders copy icon initially', () => {});
  it('calls clipboard copy on click', () => {});
  it('shows check icon after successful copy', () => {});
  it('shows ⌘ on macOS', () => {});
  it('shows Ctrl+ on non-macOS', () => {});
  it('has accessible label "Copy the code"', () => {});
});
```

---

## 7. Implementation Priority Summary

| Phase | Scope | Estimated Tests | Coverage Impact |
|---|---|---|---|
| **Phase 1** | Pure utility functions | ~35 tests | +25-30% line coverage |
| **Phase 2** | `SandboxDependencies` | ~12 tests | +10-15% line coverage |
| **Phase 3** | Hooks and providers | ~20 tests | +15-20% line coverage |
| **Phase 4** | Component rendering | ~10 tests | +5-10% line coverage |

**Total estimated: ~77 tests to reach 70% coverage target.**

Phase 1 alone provides significant value by covering all pure logic paths with minimal test infrastructure. Phase 2 validates the most complex logic in the package (dependency resolution). Phase 3 adds confidence to the React context/provider tree. Phase 4 is optional at medium priority.
