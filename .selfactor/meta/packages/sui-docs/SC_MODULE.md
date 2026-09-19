# Module: @stoked-ui/docs

> **Generated:** 2026-05-05 (fresh) | **Updated:** 2026-06-22 (UPGRADE 0.4.0 → 0.6.0; re-verified against the live tree: `package.json#exports` = **31 entries** (root `.` → `./index.ts` + 30 subpaths), test script still `"exit 0"`, Next.js coupling = **5 files** (`BrandingCssVarsProvider.tsx`, `MarkdownLinks.js`, `Link.tsx`, `DemoToolbar.tsx`, `CodeCopy.tsx`), `DocsConfig` = 4 fields with `useDocsConfig` throw, `cssVarPrefix: 'muidocs'` @ `BrandingCssVarsProvider.tsx:66`, `DemoCodeViewer/` + `DemoToolbarFallback/` directories present, source-file layout + line counts (MarkdownElement 824, DemoToolbar 748, ThemeContext 351, brandingTheme 1292, Dependencies 162, i18n 140, Link 138, utils 144), and the five restructure scripts) | **Meta version:** 0.6.0 (previous: 0.4.0)
> **Package location:** `packages/sui-docs`
> **NPM name:** `@stoked-ui/docs` (v0.1.21)
> **Source entry:** `packages/sui-docs/src/index.ts` (declared in `package.json#main` as `./src/index.js`; resolved as `.ts` via the build pipeline / TS path mapping)
> **Module type:** ESM (`package.json#type: "module"`)
> **Build artifacts:** `packages/sui-docs/build/` plus per-component flat directories (`./Demo`, `./HighlightedCode`, `./MarkdownElement`, `./components/...`, etc.) populated by `build:copy-files`. Published from `build/` (`publishConfig.directory: "build"`).
> **Axioms:** see `packages/sui-docs/.axioms.md` for binding invariants.

---

## 1. Responsibility

`@stoked-ui/docs` is the **documentation infrastructure layer** that powers the `docs/` Next.js site (port 5199) and is reused by example/template apps. Its design intent:

1. **Branding & theming** — provide the canonical light/dark MUI theme (`brandingTheme`) and Next.js-aware CSS-vars provider (`BrandingCssVarsProvider`) used by every page in the docs site.
2. **MDX & demo plumbing** — primitives that turn MDX docs into interactive examples: code highlighting, copy-to-clipboard, sandbox launchers (CodeSandbox / StackBlitz), in-page editor (`DemoEditor`), demo toolbar, and the `MarkdownElement` / `RichMarkdownElement` renderer skin.
3. **Docs-site context** — `DocsProvider` (language config + translations), `i18n` providers + `useTranslate`, and the `CodeVariant` (TS/JS) + `CodeStyling` (SUI System / Tailwind / CSS / etc.) preference contexts persisted via cookie + URL hash.
4. **URL & dependency utilities** — `pathnameToLanguage`, `pageToTitle*`, `getProductInfoFromUrl`, `SandboxDependencies` (resolves imports + `@types/*` for sandbox manifests), `getFileExtension`, `addHiddenInput`, `stylingSolutionMapping`, plus the React `Link` wrapper that bridges `next/link` and `@mui/material/Link`.
5. **Misc UI primitives** — `InfoCard`, `NProgressBar`, `svgIcons` (`FileDownload`, `JavaScript`, `TypeScript`).

It is *not* an end-user app, *not* a domain-specific UI kit, and *not* a server module — it is a Next.js peer-dep React library that other workspace packages and the `docs/` site consume.

---

## 2. Public Interfaces / Entry Points

### 2.1 Top-level barrel — `src/index.ts`

```ts
export * from './branding';                 // theme tokens, colors, BrandingProvider
export * from './BrandingCssVarsProvider';  // BrandingCssVarsProvider, NextNProgressBar
export * from './components';               // demo / MDX / sandbox primitives (see 2.2)
export * from './DocsProvider';             // DocsProvider, useDocsConfig, DocsConfig
export * from './i18n';                     // language + translations providers, useTranslate
export * from './InfoCard';                 // InfoCard + GlowingIconContainer
export * from './Link';                     // Link wrapping next/link + MUI Link
export * from './svgIcons';                 // FileDownload, JavaScript, TypeScript icons
export { default } from './NProgressBar/NProgressBar';
export { en };                              // default English translations bundle
```

### 2.2 Components surface — `src/components/index.ts`

| Surface | Exports | Source |
|---|---|---|
| Demo plumbing | `Demo`, `DemoEditor`, `DemoEditorError`, `DemoSandbox`, `DemoToolbar`, `DemoToolbarRoot` | `Demo.tsx`, `DemoEditor.tsx`, `DemoEditorError.tsx`, `DemoSandbox.tsx`, `DemoToolbar.tsx`, `DemoToolbarRoot.tsx` |
| Code rendering | `HighlightedCode`, `HighlightedCodeWithTabs`, `MarkdownElement`, `RichMarkdownElement`, `ReactRunner` | `HighlightedCode.tsx`, `HighlightedCodeWithTabs.tsx`, `MarkdownElement.tsx` (824 LOC), `RichMarkdownElement.tsx`, `ReactRunner.tsx` |
| Clipboard | `CodeCopyButton`, `useCodeCopy`, `CodeCopyProvider` | `CodeCopyButton.tsx`, `CodeCopy.tsx` |
| Sandbox launchers | `CodeSandbox`, `StackBlitz`, `SandboxDependencies` | `CodeSandbox.tsx`, `StackBlitz.tsx`, `Dependencies.ts` |
| Code variant / styling | `CodeVariantProvider`, `useCodeVariant`, `useNoSsrCodeVariant`, `useSetCodeVariant`, `CodeStylingProvider`, `useCodeStyling`, `useNoSsrCodeStyling`, `useSetCodeStyling`, `CODE_VARIANTS`, `LANGUAGES_LABEL`, `CODE_STYLING`, `GA_ADS_DISPLAY_RATIO`, `stylingSolutionMapping` | `codeVariant.tsx`, `codeStylingSolution.tsx`, `constants.js`, `stylingSolutionMapping.ts` |
| URL / file helpers | `getFileExtension`, `getProductInfoFromUrl`, `addHiddenInput`, `useLazyCSS` | `FileExtension.ts`, `getProductInfoFromUrl.ts`, `addHiddenInput.ts`, `useLazyCSS.tsx` |
| CRA scaffolding | `getHtml`, `getRootIndex`, `getTsconfig` | `CreateReactApp.ts` |
| Theme context | `ThemeProvider`, `DispatchContext`, `useChangeTheme`, `useColorSchemeShim`, `highDensity` | `ThemeContext.tsx` (351 LOC) |
| Types | `HighlightedCodeProps`, `DemoToolbarProps`, `MuiProductId`, `CodeStyling`, `CodeVariant`, `DemoData` | `HighlightedCode.tsx`, `DemoToolbar.tsx`, `getProductInfoFromUrl.ts`, `types.ts` |

### 2.3 Standalone subpath exports (per `package.json#exports`)

A **curated set** of ~30 components/helpers (the `package.json#exports` map — not every symbol in the barrel) is also a deep import target — e.g. `@stoked-ui/docs/Demo`, `@stoked-ui/docs/MarkdownElement`, `@stoked-ui/docs/HighlightedCode`, `@stoked-ui/docs/CodeSandbox`, `@stoked-ui/docs/i18n`, `@stoked-ui/docs/branding`, `@stoked-ui/docs/svgIcons`, `@stoked-ui/docs/translations`, `@stoked-ui/docs/useLazyCSS`, `@stoked-ui/docs/getFileExtension`, `@stoked-ui/docs/DocsProvider`. Caveats:

- Barrel-only symbols (`ThemeContext`, `CreateReactApp` helpers, `codeVariant` / `codeStylingSolution`, `constants`, `types`, `CodeCopy`) are reachable **only** through the package root, not a subpath.
- Several subpaths resolve under `./components/*` in the flattened publish layout: `./DocsProvider` → `./components/DocsProvider/index.js`, `./Link` → `./components/Link/index.js`, plus `./InfoCard`, `./branding`, `./i18n`, `./svgIcons`, `./translations`.

The consuming `docs/` site uses both the barrel and these subpaths.

### 2.4 Other utility surfaces

| Surface | Exports | Source |
|---|---|---|
| URL/i18n utils (top-level) | `pathnameToLanguage`, `pageToTitle`, `pageToTitleI18n`, `useClipboardCopy`, `getCookie`, `Translate`, `Page` | `src/utils.tsx` |
| Branding tokens | `getDesignTokens`, `getThemedComponents`, `getMetaThemeColor`, `blue`, `blueDark`, `grey`, `error`, `success`, `warning`, `brandingLightTheme`, `brandingDarkTheme` | `src/branding/brandingTheme.ts` |
| BrandingProvider (legacy) | `BrandingProvider` | `src/branding/BrandingProvider.tsx` |
| i18n | `UserLanguageProvider`, `useUserLanguage`, `useSetUserLanguage`, `useTranslate`, `mapTranslations`, `Translations`, `RequireContext`, `TranslateOptions` | `src/i18n/i18n.tsx` |
| DocsProvider | `DocsProvider`, `useDocsConfig`, `DocsConfig`, `DocsProviderProps` | `src/DocsProvider/DocsProvider.tsx` |

There are **no NestJS controllers, no CLI commands, and no runtime daemons** — this is library code consumed at build/render time by Next.js.

---

## 3. Products

This module is consumed by the single product documented in this repo:

- **SC_PRODUCT_STOKED_UI_SUI.md** — `@stoked-ui/sui`. Every public-facing surface in the `docs/` Next.js site uses `@stoked-ui/docs` for theming, MDX rendering, demos, and i18n. No other published `@stoked-ui/*` package depends on it (it is `devDependency`-only inside other packages); only the docs app imports it as a runtime dependency. A grep for `@stoked-ui/docs` (barrel + subpaths) shows **112 files** under `docs/src/**` and **46 files** under `docs/pages/**` (158 total) importing the package.

---

## 4. Views

From `SC_VIEWS.md` §15 ("Docs Package Primitives — `@stoked-ui/docs`"), this module **directly renders or owns**:

| View | File | Notes |
|---|---|---|
| `Demo` (placeholder shell) | `src/components/Demo.tsx` | Stub container exposed for MDX `Demo` blocks; production demos compose `DemoEditor` + `MarkdownElement` + `DemoSandbox`. |
| `DemoEditor` | `src/components/DemoEditor.tsx` | `SimpleCodeEditor` + `CodeCopyButton` + `MarkdownElement`. Editing/focus/copy-success states. |
| `DemoSandbox` | `src/components/DemoSandbox.tsx` | iframe shell that mounts a CodeSandbox/StackBlitz embed; loading / ready / error. |
| `CodeSandbox` | `src/components/CodeSandbox.tsx` | "Open in CodeSandbox" launcher form (uses `addHiddenInput` + `SandboxDependencies`). |
| `StackBlitz` | `src/components/StackBlitz.tsx` | "Open in StackBlitz" launcher. |
| `DemoToolbar` | `src/components/DemoToolbar.tsx` (748 LOC) | Edit / sandbox / copy / share controls; pulls in GA ads, copy state, code variant + styling pickers. |
| `DemoCodeViewer` | `src/components/DemoCodeViewer/index.tsx` | Collapsed/expanded/copied code block. |
| `HighlightedCode` / `HighlightedCodeWithTabs` | `src/components/HighlightedCode*.tsx` | Syntax-highlighted block; tabbed variant for multi-language samples. |
| `MarkdownElement` / `RichMarkdownElement` | `src/components/MarkdownElement.tsx` (824 LOC), `RichMarkdownElement.tsx` | The MDX render skin: prose, headings, code blocks, callouts, tables, images, anchors. |
| `BrandingCssVarsProvider` | `src/BrandingCssVarsProvider/BrandingCssVarsProvider.tsx` | Theme injection (CSS variables, light/dark/system), `NextNProgressBar`, `CssBaseline`, `SkipLink`, `MarkdownLinks`. |
| `BrandingProvider` | `src/branding/BrandingProvider.tsx` | Legacy nested theme provider for component branches. |
| `DocsProvider` | `src/DocsProvider/DocsProvider.tsx` | Language config context + `UserLanguageProvider` composition. |
| `NProgressBar` | `src/NProgressBar/NProgressBar.js` (default export) | Top-of-page route-change progress bar. |
| `InfoCard` | `src/InfoCard/InfoCard.tsx` | Marketing/feature card with `GlowingIconContainer` + Link. |
| `Link` | `src/Link/Link.tsx` | `next/link` + `@mui/material/Link` wrapper that respects `useUserLanguage` + `useDocsConfig`. |
| `SvgIcons` | `src/svgIcons/{FileDownload,JavaScript,TypeScript}.js` | Inline SVG icon set. |

This module **materially shapes** every view documented in `SC_VIEWS.md` §1 (public marketing pages — chrome via `BrandingCssVarsProvider`, links via `Link`), §2 (showcase pages — same), §3 (MDX product docs — `MarkdownDocs` consumes `MarkdownElement`, `HighlightedCode`, `Demo*`, `CodeSandbox`), and the `docs/` checkout/legal/blog pages. Any visual change here propagates to every page on the docs site.

---

## 5. Integration Points

### Upstream (this module depends on)

| Dependency | Where used | Contract |
|---|---|---|
| `next` (^13.5.1 \|\| ^14, peer) | `BrandingCssVarsProvider.tsx`, `BrandingCssVarsProvider/MarkdownLinks.js`, `Link.tsx`, `components/DemoToolbar.tsx`, `components/CodeCopy.tsx` (these are the only files that actually `import … from 'next/router'` / `'next/link'`) | `useRouter`, `next/link`, `Router` route events. These components are **Next.js-coupled** and not directly usable in non-Next consumers. Note: `codeVariant.tsx` / `codeStylingSolution.tsx` / `MarkdownElement.tsx` read `window.location.hash` directly and do **not** import `next/router`. |
| `react` 18.3.1 (peer) | All hooks/components | Hooks API; SSR-safe wrappers (e.g. `useNoSsrCodeVariant`) provided where needed. |
| `@mui/material`, `@mui/material/styles`, `@mui/icons-material`, `@mui/system`, `@mui/base` (peer) | `BrandingCssVarsProvider` (`Experimental_CssVarsProvider`, `extendTheme`), `MarkdownElement`, `InfoCard`, `Link`, `DemoToolbar`, etc. | Theme/CSS-vars contract — every consumer is wrapped in the docs theme. |
| `@mui/utils` (peer transitively) | `BrandingCssVarsProvider` (`deepmerge`), `i18n` (`deepmerge`) | Pure utilities. |
| `clipboard-copy` (^4.0.1) | `useClipboardCopy` (`utils.tsx`), `CodeCopyButton`, `CodeCopy` | Browser clipboard write; assumes user gesture. |
| `nprogress` (^0.2.0) | `NProgressBar`, `BrandingCssVarsProvider` (`NextNProgressBar`) | `start()` / `done()` driven by `next/router` events. |
| `fg-loadcss` (^3.1.0) | `useLazyCSS` | Lazy CSS injection for icon fonts/material symbols. |
| `react-runner` (^1.0.5) | `ReactRunner` | Live JSX evaluation for in-page demos. |
| `prop-types` (^15.8.1) | `i18n` provider, legacy components | Runtime prop validation. |
| `clipboard-copy`, `lodash/upperFirst`, `lodash/camelCase` | `utils.tsx` | Pure helpers used by `pageToTitle*`. |
| `@stoked-ui/editor`, `@stoked-ui/file-explorer`, `@stoked-ui/media`, `@stoked-ui/timeline` (devDependency) | Demo/sandbox playgrounds for those packages | Used only in demo plumbing — not bundled at build time, but referenced by sandbox manifests via `SandboxDependencies`. |

### Downstream (consumers)

- **`docs/` Next.js site** — pervasive: `_app.tsx`, every `pages/**/*.tsx`, `docs/src/modules/components/MarkdownDocs.js`, `docs/src/modules/components/AppLayoutDocs.tsx`, hero / showcase components in `docs/src/components/{home,showcase,productMaterial,productBaseUI,productDesignKit,productTemplate,about,action,...}` (~112 importing files under `docs/src/**`).
- **Workspace packages** — none consume `@stoked-ui/docs` as a runtime dependency. It only appears in the `docs/` app's `package.json`. Other packages reference doc primitives indirectly through their own MDX trees rendered by the docs site.
- **External examples / templates** — the `examples/stoked-ui-nextjs-pages-router*` folders mirror `Link` semantics (see comment in `Link.tsx` line 11–15).

### Contracts that must hold for downstream

1. **Top-level barrel + subpath exports** — both must continue to resolve. The flat per-component publish layout (e.g. `@stoked-ui/docs/Demo`) is contractual; the `build:copy-files` step in `package.json` is what creates them, and removing entries breaks subpath imports in `docs/`.
2. **`BrandingCssVarsProvider` is the canonical theme provider** — `cssVarPrefix: 'muidocs'` is referenced by inline CSS in `docs/` and `MarkdownElement` (`var(--muidocs-palette-*)`). Renaming the prefix is a site-wide visual break.
3. **`DocsProvider` config shape** — `DocsConfig` has exactly four fields: `LANGUAGES: string[]`, `LANGUAGES_SSR: string[]`, `LANGUAGES_IN_PROGRESS: string[]`, `LANGUAGES_IGNORE_PAGES(pathname): boolean` (verified in `DocsProvider.tsx` lines 4–9 — there is **no** `productIdentifier` field on `DocsConfig`; the docs app keeps `productIdentifier` in its own `_app.js` config, separately). These are read by `Link`, `pathnameToLanguage`, and the docs site's `_app`. Adding required fields is a breaking change.
4. **`useDocsConfig` throws outside `DocsProvider`** — consumers (notably `Link`) rely on this. Tests in `SC_TEST.md` §1.5 enforce it.
5. **`CodeVariantProvider` / `CodeStylingProvider` precedence** — initial value comes from URL hash, then cookie, then default (`'TS'` / `'SUI System'`). Changing precedence flips the demo language for everyone.
6. **`SandboxDependencies` `window.muiDocConfig` hook surface** — the site can override `csbIncludePeerDependencies`, `csbGetVersions`, `postProcessImport`. Removing or renaming any hook breaks `docs/` integration with experimental dependency overrides.
7. **`i18n` translation lookup semantics** — dot-paths (`pages.foo.bar`), missing-key warning except in CI, `'…'` fallback when language is missing entirely. These behaviors are baked into thousands of MDX strings.
8. **`Link` Next.js coupling** — must preserve language prefixing, `legacyBehavior=true` default, and `useRouter` SSR-safety. Sister files in `examples/` and `docs/src/modules/components/Link.tsx` are kept in sync by hand (see source comment).
9. **Theme tokens (`getDesignTokens`, `getThemedComponents`)** — heavily customized per-component overrides; `MarkdownElement` and many `docs/` components rely on the resulting theme keys (`primaryDark`, typography variants, `cssVarPrefix`).

---

## 6. Key Source Files

| File | Lines | Why it matters |
|---|---|---|
| `src/index.ts` | 12 | Barrel — every public export flows here. |
| `src/components/index.ts` | 35 | Components barrel — adding/removing here flips package surface. |
| `src/components/MarkdownElement.tsx` | 824 | Massive CSS-in-JS skin for every MDX element. Drives prose, code-block, table, callout, anchor styles. |
| `src/components/DemoToolbar.tsx` | 748 | Demo toolbar: edit/copy/sandbox/share/codestyling/codevariant pickers, GA ads, MUI menus. |
| `src/components/ThemeContext.tsx` | 351 | Theme + dispatch context (`useChangeTheme`, `useColorSchemeShim`, density toggle). |
| `src/components/DemoSandbox.tsx` | 227 | Iframe + JSS skeleton for sandboxed demo rendering. |
| `src/components/CodeSandbox.tsx` | 186 | Builds CodeSandbox API form payload from `SandboxDependencies`. |
| `src/components/DemoEditor.tsx` | 169 | In-page Simple code editor, copy button, fallback Markdown rendering. |
| `src/components/CreateReactApp.ts` | 161 | `getHtml`, `getRootIndex`, `getTsconfig` — generate sandbox project files for CRA targets. |
| `src/components/Dependencies.ts` | 162 | `SandboxDependencies` — extracts imports from raw demo code, resolves package versions, injects `@types/*`, applies `window.muiDocConfig` hooks. |
| `src/components/RichMarkdownElement.tsx` | 138 | Higher-level Markdown wrapper that composes `Demo` + code blocks. |
| `src/components/HighlightedCodeWithTabs.tsx` | 125 | Multi-tab syntax-highlighted block. |
| `src/components/HighlightedCode.tsx` | 54 | Single-language syntax-highlighted block + `HighlightedCodeProps`. |
| `src/components/CodeCopy.tsx` | 199 | `CodeCopyProvider` + `useCodeCopy` — keyboard-driven copy state for in-doc code blocks. |
| `src/components/codeStylingSolution.tsx` | 100 | `CodeStylingProvider` + hooks; URL hash (`tailwind-`/`css-`/`system-`) + cookie persistence. |
| `src/components/codeVariant.tsx` | 86 | `CodeVariantProvider` (TS/JS) — hash + cookie persistence. |
| `src/components/getProductInfoFromUrl.ts` | 58 | URL → `{ productId, productCategoryId }` fallback used by demo dependency resolution. |
| `src/components/types.ts` | 47 | `CodeStyling`, `CodeVariant`, `DemoData`, `DemoComponentProps`. |
| `src/components/CodeCopyButton.tsx` | 41 | Click-to-copy IconButton with macOS detection (`⌘` vs `Ctrl`). |
| `src/components/DemoToolbarRoot.tsx` | 41 | Styled wrapper for DemoToolbar layout. |
| `src/components/DemoEditorError.tsx` | 35 | Error fallback for inline editor. |
| `src/components/StackBlitz.tsx` | 59 | Posts a manifest to StackBlitz `_self` form. |
| `src/components/ReactRunner.tsx` | 50 | Wrapper around `react-runner` for in-page evaluation. |
| `src/components/FileExtension.ts` | 9 | `'TS'`→`'tsx'`, `'JS'`→`'js'`. Throws on invalid input. |
| `src/components/addHiddenInput.ts` | 7 | DOM helper used by sandbox launcher forms. |
| `src/components/useLazyCSS.tsx` | 17 | `fg-loadcss` wrapper for icon-font lazy loading. |
| `src/components/stylingSolutionMapping.ts` | 9 | Static map from `CODE_STYLING` constant → URL hash slug. |
| `src/components/constants.js` | — | `CODE_VARIANTS`, `CODE_STYLING`, `LANGUAGES_LABEL`, `GA_ADS_DISPLAY_RATIO`. |
| `src/utils.tsx` | 144 | `useClipboardCopy`, `pathnameToLanguage`, `pageToTitle`, `pageToTitleI18n`, `getCookie`. |
| `src/i18n/i18n.tsx` | ~140 | `UserLanguageProvider`, `TranslationsProvider` (deepmerge), `useUserLanguage`, `useSetUserLanguage`, `useTranslate` (dot-path lookup, English fallback, missing-key warn), `mapTranslations`. |
| `src/branding/brandingTheme.ts` | 1292 | All design tokens + themed components. `getDesignTokens(mode)`, `getThemedComponents()`, `brandingLightTheme`, `brandingDarkTheme`, color scales (`blue`, `blueDark`, `grey`, `error`, `success`, `warning`). |
| `src/branding/BrandingProvider.tsx` | 21 | Legacy nested theme switch (light/dark) for in-page islands. |
| `src/BrandingCssVarsProvider/BrandingCssVarsProvider.tsx` | 107 | Canonical theme + `NextNProgressBar` + `CssBaseline` + `SkipLink` + `MarkdownLinks`; hard-codes `cssVarPrefix: 'muidocs'` (line 66) and imports `useRouter` from `next/router`. |
| `src/BrandingCssVarsProvider/SkipLink.tsx`, `MarkdownLinks.js` | — | A11y skip link + anchor copy-on-hover. `MarkdownLinks.js` imports `Router` from `next/router` (one of the 5 Next.js-coupled files). |
| `src/components/DemoToolbarFallback/index.tsx` | — | Static placeholder toolbar rendered while the real `DemoToolbar` (and its heavy deps) hydrate; keeps demo layout stable on first paint. |
| `src/components/DemoCodeViewer/index.tsx` | — | Collapsed/expanded/copied read-only code block used inside demos. |
| `src/DocsProvider/DocsProvider.tsx` | 43 | `DocsConfigContext` + composition with `UserLanguageProvider`; `useDocsConfig` throws outside a provider (lines 35–42). |
| `src/InfoCard/InfoCard.tsx` | — | `InfoCard` + `GlowingIconContainer`. |
| `src/Link/Link.tsx` | ~140 | `NextLinkComposed` + branded `Link` component; consumes `useUserLanguage` + `useDocsConfig` to prefix language. |
| `src/NProgressBar/NProgressBar.js` (default export of package) | — | Standalone nprogress styles + initialization. |
| `src/svgIcons/{FileDownload,JavaScript,TypeScript}.js` | — | Inline icons. |
| `src/translations/translations.json` | — | Default English bundle. Distribution is two-step: `build:copy-files` seeds `./translations/translations.json` and `./node/translations/translations.json`, then `postbuild` (`copyTranslations.sh`) fans the source out into **every** directory named `translations` found under `build/`. |
| `src/global.d.ts` | — | Module-augmentation types (e.g. `@mui/material/styles` `primaryDark`). |
| Build infra | `package.json#scripts`, `restructure.js`, `restructure-components.js`, `update-imports.js`, `fix-extensions.js`, `verify-components.js`, `copyTranslations.sh` | Drive the unusual flat publish layout (one folder per component at the package root). |

---

## 7. Change Impact

When this module changes, the following typically need validation:

### Always validate

- **Build** — `pnpm --filter @stoked-ui/docs build` (legacy + node + stable + types + copy-files + `postbuild` → `copyTranslations.sh`). The flat per-component layout under `build/` and the package root is what `@stoked-ui/docs/<Component>` subpaths resolve to.
- **Type check** — `npx tsc --noEmit -p packages/sui-docs/tsconfig.json` (project-isolated; `sui-docs` has **no** standalone `typescript` package script, so `pnpm --filter @stoked-ui/docs typescript` errors with "None of the selected packages has a typescript script"). `build:types` (`tsc -b tsconfig.build.json`) also type-checks but pulls in the editor/file-explorer/timeline/media project references. Propagate to `docs/` too, since it imports `@stoked-ui/docs` types extensively.
- **Tests** — `pnpm --filter @stoked-ui/docs test`. Today the script is `exit 0`; see `.stokd/meta/packages/sui-docs/SC_TEST.md` for the recommended Jest plan (Phases 1–4, ~77 tests targeting 70% coverage).
- **Docs site smoke test** — `pnpm docs:dev` (port **5199**). Render the home, a marketing page, an MDX docs page, a demo with sandbox launchers, and a page in a non-default language to exercise the i18n path.

### Risk-specific checklists

| Change | What to validate |
|---|---|
| Edit `src/index.ts` or `src/components/index.ts` | Every page in `docs/` imports something here — run `pnpm --filter stokedui-com typescript` (the docs app's `tsc` check) and `pnpm docs:dev` to catch missing-export errors. Also confirm `package.json#exports` and the corresponding `build:copy-files` entries are still in sync. |
| Add a new component | (1) add the file under `src/components/`; (2) export from `src/components/index.ts`; (3) add a top-level subpath in `package.json#exports`; (4) extend `build:copy-files` to ship the flat directory; (5) verify in `docs/` after a fresh build. |
| Edit `BrandingCssVarsProvider` or theme tokens | The whole docs site re-themes. Check both light and dark, with `system` color scheme. Verify `NextNProgressBar`, `SkipLink`, `MarkdownLinks` still mount. `cssVarPrefix: 'muidocs'` must remain stable or every `var(--muidocs-...)` reference in MDX/CSS breaks. |
| Edit `MarkdownElement` styles | Visual regression risk on every MDX page. Cross-check headings, code blocks, callouts, tables, image captions, link hover anchors in `docs/pages/{stoked-ui,editor,timeline,file-explorer,media,github}/docs/**`. |
| Edit `DemoToolbar` or `DemoSandbox` | Open a doc with a `Demo` block, click edit, copy, "Open in CodeSandbox", "Open in StackBlitz". Confirm code variant (TS/JS) and code styling (Tailwind/CSS/SUI System) selectors still persist via cookie + URL hash. |
| Edit `SandboxDependencies` (`Dependencies.ts`) | Open a sandbox launcher and confirm dependency manifest still resolves correctly: scoped packages (`@types/foo__bar`), bundled-types packages skip `@types/*`, `react-scripts` is in devDependencies, peer deps included, `window.muiDocConfig` hooks called. |
| Edit `CreateReactApp.ts` (`getHtml`/`getRootIndex`/`getTsconfig`) | Sandbox bootstrap. Verify Tailwind CDN script is conditional on styling, `joy-ui` uses `CssVarsProvider`, default uses `StyledEngineProvider`, `base-ui` uses no provider, TS/JS variants emit correct entry. |
| Edit `i18n` (`useTranslate`, providers, `mapTranslations`) | All localized pages — verify English fallback still kicks in for missing keys, missing-language returns `'…'`, dot-path lookups work, `ignoreWarning` suppresses `console.error`. Re-run with `LANG=fr` (or relevant) docs build. |
| Edit `DocsProvider` / `DocsConfig` shape | Adding required fields = breaking. Check `docs/pages/_app.js`-style consumer to update the config object and update `LANGUAGES_IGNORE_PAGES` predicate as needed. |
| Edit `Link` | Test internal vs external URLs, language-prefixed paths, `legacyBehavior` toggle, `next/link` prefetch behavior, and ensure example mirrors (`examples/stoked-ui-nextjs-pages-router*/src/Link.{js,tsx}` and `docs/src/modules/components/Link.tsx`) are updated to match. |
| Edit `pathnameToLanguage` / `getProductInfoFromUrl` / `pageToTitle*` | These flow into URL canonicalization, breadcrumb titles, and demo dependency selection. Spot-check `/zh/...`, `/api/...` (rewrites to `/api-docs/...`), `/experiments/docs/...` (forces `docs-infra`), and root `/`. |
| Edit `CodeVariantProvider` / `CodeStylingProvider` precedence | URL hash → cookie → default. A regression flips the demo language for every visitor. Validate after deploy by visiting a doc page with `#demo.tsx` and `#demo.js`. |
| Edit `branding/brandingTheme.ts` | This is the visual identity of the docs site. Check both `BrandingCssVarsProvider` (CSS vars) and `BrandingProvider` (nested classic theme) renders. |
| Edit translations (`src/translations/translations.json`) | `postbuild` (`copyTranslations.sh`) must still copy to `build/translations/` and `node/translations/`. |
| Bump `next` peer range | Verify `next/router` and `next/link` API surface still matches; this package supports `next ^13.5.1 \|\| ^14`. |
| Bump MUI peer ranges | Coordinate with `docs/` and other workspace packages so the entire monorepo aligns peer-dep versions. |
| Add a runtime dependency | The site bundles this package on every page; size matters. Justify in PR. |

### Smoke tests after non-trivial changes

1. `pnpm docs:dev` (port **5199**) — open `/`, a marketing page (`/pricing`), and a docs page (`/editor/docs/overview`) in both light and dark mode. Confirm `BrandingCssVarsProvider`, `NProgressBar` (route change), and `SkipLink` work.
2. Open any doc page with a demo block: click edit → toggle TS/JS → click copy → "Open in CodeSandbox" → "Open in StackBlitz". Exercises `DemoEditor`, `CodeCopyButton`, `CodeVariantProvider`, `SandboxDependencies`, `CodeSandbox`, `StackBlitz`.
3. Visit a localized URL (`/zh/...` or `/fr/...` if available) and confirm `useUserLanguage` + `useTranslate` + `Link` prefixes work. `getCookie` must not throw on the client.
4. Force a missing translation key in a dev build and verify the `console.error` warning fires (suppressed in CI / when `ignoreWarning: true`).
5. Trigger a route change to confirm `NextNProgressBar` starts/stops without leaking listeners (debounced 200 ms).
