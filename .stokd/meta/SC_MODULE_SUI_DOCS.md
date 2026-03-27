# SC_MODULE_SUI_DOCS

> **Generated:** 2026-03-18 | **Meta version:** 0.2.0
> **Package:** `@stoked-ui/docs` v0.1.21
> **Location:** `packages/sui-docs`

---

## Module Name

`@stoked-ui/docs` — Documentation building blocks for the Stoked UI monorepo docs site.

---

## Responsibility

`sui-docs` is a **shared React component library** that provides the rendering infrastructure for interactive documentation pages. It is not a product in itself; it is the substrate on which all product documentation is displayed.

Primary responsibilities:
- Render pre-compiled markdown HTML with full MUI theming (`MarkdownElement`, `RichMarkdownElement`)
- Embed and execute live interactive code demos inside documentation (`Demo`, `DemoEditor`, `DemoSandbox`, `ReactRunner`)
- Provide syntax-highlighted, copyable code blocks (`HighlightedCode`, `HighlightedCodeWithTabs`)
- Manage theme and branding context for the docs site (`BrandingCssVarsProvider`)
- Provide internationalization (i18n) context (`DocsProvider`, `UserLanguageProvider`, `useTranslate`)
- Expose top-level page layout primitives used by Next.js pages in `docs/`

---

## Public Interfaces / Entry Points

### Main Package Entry

`packages/sui-docs/src/index.js` — ES Module, ~40 named exports.

### Providers & Contexts

| Export | File | Purpose |
|--------|------|---------|
| `BrandingCssVarsProvider` | `src/BrandingCssVarsProvider/BrandingCssVarsProvider.tsx` | MUI `CssVarsProvider` wrapper that applies branding theme, NProgressBar, and SkipLink |
| `DocsProvider` | `src/DocsProvider/DocsProvider.tsx` | Root docs config provider; exposes `useDocsConfig()` hook |
| `CodeVariantProvider` | `src/components/CodeVariantProvider.tsx` | JS/TS variant context for demo code blocks |
| `CodeStylingProvider` | `src/components/CodeStylingProvider.tsx` | Tailwind vs SUI System styling context |
| `UserLanguageProvider` | `src/i18n/i18n.tsx` | i18n language context |

### Core Rendering Components

| Export | File | Purpose |
|--------|------|---------|
| `MarkdownElement` | `src/components/MarkdownElement.tsx` | Renders pre-compiled markdown HTML with full MUI CSS styling; 31KB |
| `RichMarkdownElement` | `src/components/RichMarkdownElement.tsx` | Orchestrates markdown sections + embedded `Demo` + custom components |
| `Demo` | `src/components/Demo.tsx` | Interactive demo container (230-line stub wiring preview + toolbar + editor) |
| `DemoEditor` | `src/components/DemoEditor.tsx` | Editable Prism-highlighted code editor within demos |
| `DemoSandbox` | `src/components/DemoSandbox.tsx` | Sandboxed iframe for Joy UI / standard MUI theme demo execution |
| `DemoToolbar` | `src/components/DemoToolbar.tsx` | Demo control bar — variant toggle (JS/TS), styling dropdown, copy, StackBlitz, CodeSandbox, reset; 24KB |
| `DemoToolbarRoot` | `src/components/DemoToolbar.tsx` | Root wrapper for toolbar composition |
| `ReactRunner` | `src/components/ReactRunner.tsx` | Live React code execution sandbox (uses `react-runner` library) |
| `HighlightedCode` | `src/components/HighlightedCode.tsx` | Prism syntax-highlighted, copyable code block |
| `HighlightedCodeWithTabs` | `src/components/HighlightedCodeWithTabs.tsx` | Multi-language tab code block (persists selection to `localStorage`) |

### UI Components

| Export | File | Purpose |
|--------|------|---------|
| `InfoCard` | `src/InfoCard/InfoCard.tsx` | Icon + glow + title + description card with optional page link |
| `Link` | `src/Link/Link.tsx` | Docs-aware link component (Next.js router integration) |
| `NProgressBar` | `src/NProgressBar/NProgressBar.tsx` | Page navigation progress bar (nprogress) |
| `CodeCopyButton` | `src/components/CodeCopyButton.tsx` | Copy-to-clipboard button for code blocks |
| `CodeSandbox` | `src/components/CodeSandbox.tsx` | CodeSandbox external editor launcher |
| `StackBlitz` | `src/components/StackBlitz.tsx` | StackBlitz external editor launcher |

### Hooks & Utilities

| Export | File | Purpose |
|--------|------|---------|
| `useTranslate()` | `src/i18n/i18n.tsx` | Returns translation function `t(key)` with English fallback |
| `useUserLanguage()` | `src/i18n/i18n.tsx` | Returns current BCP-47 language string |
| `useSetUserLanguage()` | `src/i18n/i18n.tsx` | Sets active language in context |
| `useDocsConfig()` | `src/DocsProvider/DocsProvider.tsx` | Returns `DocsConfig` from provider context |
| `useLazyCSS()` | `src/utils.tsx` | Dynamically injects a `<link>` stylesheet on demand |
| `useCodeCopy()` | `src/components/CodeCopyButton.tsx` | Hook for clipboard copy with feedback state |
| `addHiddenInput()` | `src/utils.tsx` | Adds hidden `<input>` to a form element |
| `getFileExtension()` | `src/utils.tsx` | Maps code variant + language to file extension |
| `getProductInfoFromUrl()` | `src/utils.tsx` | Extracts product metadata from URL path |
| `stylingSolutionMapping` | `src/utils.tsx` | Maps styling solution IDs to display labels |

### Build Scripts

| Script | File | Purpose |
|--------|------|---------|
| `build` | `package.json` | Full pipeline: legacy → node → stable → types → copy files |
| `build:legacy` | — | Babel + browserslist legacy transpile |
| `build:node` | — | Node-compatible CJS output |
| `build:types` | — | `tsc` type declaration generation |
| Restructure | `scripts/restructure.js` | Generates per-component folders with index.ts for deep-import support |

---

## Products

No product docs pages are explicitly registered to this module (empty list provided). However, `sui-docs` is the **transitive dependency of every product documentation page** in the repo. The following product doc trees consume it:

- `sui-file-explorer` — `docs/pages/products/file-explorer/docs/`
- `sui-media` — `docs/pages/products/media/docs/`
- `sui-timeline` — `docs/pages/products/timeline/docs/`
- `sui-editor` — `docs/pages/products/editor/docs/`
- `sui-github` — `docs/pages/github/docs/`
- `sui-video-renderer` — `docs/pages/video-renderer/docs/`
- Blog — `docs/pages/blog/`

---

## Views

Views from `SC_VIEWS.md` that `sui-docs` components render or materially shape:

| View | Section | Contribution |
|------|---------|-------------|
| **Product Documentation Pages** | 1.3 | `MarkdownElement` renders all doc content; `RichMarkdownElement` embeds `Demo` components; `DemoToolbar` drives variant/styling state |
| **Demo Viewer** | 9.4 | `Demo`, `DemoEditor`, `DemoSandbox`, `DemoToolbar`, `ReactRunner` — the full interactive demo subsystem lives in sui-docs |
| **Code Viewers** | 9.5 | `HighlightedCode`, `HighlightedCodeWithTabs`, `DemoCodeViewer` — all syntax-highlighted code rendering |
| **Markdown Renderer** | 9.6 | `MarkdownElement`, `RichMarkdownElement` — all markdown-to-HTML rendering |
| **InfoCard** | 9.9 | `InfoCard` component lives in this module |
| **Blog Home** | 3.1 | Blog pages use `MarkdownElement` and docs layout primitives |
| **Blog Post** | 3.2 | Post content rendered via `MarkdownElement` with `markdown-body` styling |
| **Blog Editor** | 3.3–3.5 | Blog editing views use docs-provided layout components |
| **Premium Theme Pages** | 10.1 | `BrandingCssVarsProvider` wraps these pages |
| **Experiment Pages** | 10.7 | Experiment/branding test pages depend on `BrandingCssVarsProvider` and `DocsProvider` |

---

## Integration Points

### Upstream (what sui-docs depends on)

| Dependency | Version | Contract |
|-----------|---------|---------|
| `@mui/material` | ^5.x | Theme provider, CSS variables, component primitives |
| `@mui/base` | ^5.x | Unstyled primitives |
| `@mui/system` | ^5.x | System sx prop and theme utilities |
| `@mui/icons-material` | ^5.x | Icons for toolbar and UI components |
| `next` | ^13.5.1 \| ^14 | Router (`useRouter`) for `NProgressBar` and `Link` |
| `react` | ^18.3.1 | Core rendering |
| `react-runner` | — | Sandboxed code execution for live demos |
| `nprogress` | — | Page-transition progress bar |
| `@stripe/react-stripe-js` + `@stripe/stripe-js` | — | Payment integration (embedded checkout support) |
| `clipboard-copy` | — | Cross-browser clipboard API |
| `prismjs` | — | Syntax highlighting in `HighlightedCode` / `DemoEditor` |

### Downstream (what consumes sui-docs)

| Consumer | How it's used |
|---------|--------------|
| `docs/` Next.js app | All product documentation pages import `MarkdownElement`, `RichMarkdownElement`, `Demo`, `BrandingCssVarsProvider`, `DocsProvider` |
| `docs/pages/blog/` | Blog pages use `MarkdownElement` for post rendering |
| `docs/src/components/` | Layout components (`AppHeader`, etc.) rely on `NProgressBar`, `Link`, i18n hooks |
| Product packages (indirectly) | Documentation JS files in `docs/pages/products/*/docs/*.js` reference demos that use `ReactRunner` and `DemoSandbox` |

### Key Contracts

- **`BrandingCssVarsProvider` must wrap the Next.js `_app.tsx`** — it sets all `--muidocs-*` CSS custom properties consumed by `MarkdownElement` for light/dark mode theming.
- **`DocsProvider` must be a descendant of `BrandingCssVarsProvider`** — it requires the MUI theme context to be initialized.
- **`UserLanguageProvider` is embedded in `DocsProvider`** — consuming components call `useTranslate()` and `useUserLanguage()` only within a `DocsProvider` tree.
- **Demo component receives a `demos` prop** — a lookup map of demo names to `{ raw, js, ts, ... }` objects produced at build time by the docs scripts.

---

## Key Source Files

| File | Why It Matters |
|------|---------------|
| `src/components/MarkdownElement.tsx` | 31KB — defines the visual style for ALL documentation content (headings, code blocks, callouts, tables, keyboard hints). Any CSS variable rename here breaks the entire docs site appearance. |
| `src/components/RichMarkdownElement.tsx` | Routing layer that separates markdown sections from demo sections — the bridge between compiled markdown and live demos. |
| `src/components/Demo.tsx` | Entry point for interactive demos; wires `ReactRunner`/`DemoSandbox` to `DemoToolbar` and `DemoEditor`. Currently a lightweight stub (~230 lines). |
| `src/components/DemoToolbar.tsx` | 24KB — most complex component; manages demo state (variant, styling solution, code visibility, GA events, localStorage persistence). |
| `src/BrandingCssVarsProvider/BrandingCssVarsProvider.tsx` | Root theme provider for the docs app — all CSS variables (`--muidocs-*`) originate here. |
| `src/DocsProvider/DocsProvider.tsx` | Exposes `DocsConfig` context and wraps i18n — the root configuration provider for documentation pages. |
| `src/i18n/i18n.tsx` | Full i18n runtime: `UserLanguageProvider`, `useTranslate()`, `useUserLanguage()`, `useSetUserLanguage()`. Dot-notation key lookup with English fallback. |
| `src/utils.tsx` | Cross-cutting utilities: `useLazyCSS`, `getProductInfoFromUrl`, `addHiddenInput`, `getFileExtension`, `stylingSolutionMapping`. |
| `package.json` | `exports` map defines the deep-import surface; `publishConfig.directory = "build/"` means the published package only contains the built output. |
| `scripts/restructure.js` | Script-driven component folder generation — must be re-run after adding new top-level exports to keep the `exports` map in sync. |

---

## Change Impact

### When `MarkdownElement.tsx` changes
- All rendered documentation content will be affected visually — headings, code blocks, callouts, tables across every product doc page.
- Validate: Load any docs page (e.g., `localhost:5199/products/editor/docs/editor`) and inspect heading hierarchy, code block copy buttons, and dark-mode CSS variable overrides.

### When `BrandingCssVarsProvider` changes
- Light/dark mode theming breaks across the entire docs site (`--muidocs-*` variables may not be applied).
- Validate: Toggle dark mode on the docs home page and a product documentation page; check that colors, code blocks, and sidebar all switch correctly.

### When `DemoToolbar.tsx` changes
- Demo code copy, variant switching (JS/TS), and styling solution toggles may break.
- Validate: Open a product documentation demo, toggle JS↔TS, switch styling solution, click CodeSandbox/StackBlitz buttons, and use the copy button.

### When `i18n.tsx` changes
- `useTranslate()` calls across the docs site may return wrong values or throw; server-side rendering with explicit `language` prop may break.
- Validate: Load a documentation page with the `userLanguage` localStorage key set to a non-English locale; verify translations still render correctly.

### When `DocsProvider.tsx` changes
- `useDocsConfig()` consumers will fail; i18n context will be unavailable.
- Validate: Check that the docs app boots without console errors and that the language selector (if present) functions correctly.

### When `package.json exports` changes
- Deep imports like `import Demo from '@stoked-ui/docs/Demo'` used by doc pages in `docs/` may break at build time.
- Validate: Run `pnpm build` from the monorepo root and verify the `docs/` app compiles without missing-module errors.

### When `scripts/restructure.js` runs
- Per-component index files in `build/` are regenerated. Stale `exports` entries in `package.json` will cause runtime import errors.
- Validate: Run `pnpm build` for `sui-docs` and confirm all `exports` paths resolve to real build-output files.

### When Stripe dependencies change
- Embedded checkout (`StripeEmbeddedCheckout.tsx` in `docs/`) may break if `@stripe/react-stripe-js` API changes.
- Validate: Test the checkout flow at `docs/pages/consulting/checkout.tsx`.
