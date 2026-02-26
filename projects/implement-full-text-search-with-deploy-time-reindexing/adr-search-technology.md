# ADR-001: Search Technology — Pagefind for Static Full-Text Search

**Project:** #14 — Implement Full-Text Search with Deploy-Time Reindexing
**Status:** Accepted
**Date:** 2026-02-26
**Deciders:** Project-14 Agent (Items 1.1, 1.2, 1.3)
**Supersedes:** The implicit decision to adopt Algolia DocSearch (inherited from upstream MUI codebase)

---

## 1. Context

The Stoked UI documentation site (`docs/`) is a Next.js application exported as a fully static site
via `next export`. The output (`docs/export/`) is deployed to AWS S3 and served through CloudFront
using SST StaticSite. There is no server-side runtime — all content is served as static files.

The codebase contains a complete Algolia DocSearch UI component (`docs/src/modules/components/AppSearch.js`)
adapted from the upstream MUI project. This component is polished and well-integrated into the site
layout. However, Item 1.1 (Algolia audit) established that the integration is entirely non-functional:

- The hardcoded Algolia Application ID (`ZYBF3WCUQZ`) and search API key belong to the upstream MUI
  project, not Stoked UI. DNS resolution for `ZYBF3WCUQZ-dsn.algolia.net` returns `NXDOMAIN`.
- No Stoked UI Algolia account exists.
- No indexing pipeline exists (no crawler config, no indexing scripts, no environment variables).
- The search modal opens but returns zero results for any query.
- The `NewStartScreen` quick-links reference MUI products (Base UI, Joy UI, SUI Toolpad, SUI System)
  that are not part of the Stoked UI documentation.

Item 1.2 (technology comparison) evaluated five candidate search technologies against five hard
constraints:

| Constraint | Value |
|---|---|
| Static site compatibility | Required — Next.js export, no server |
| Deployment platform | SST StaticSite (CloudFront + S3) |
| Recurring cost | $0 preferred |
| Build time overhead | < 60 seconds added to build pipeline |
| Initial page load bundle | < 50 KB gzipped |

The candidates evaluated were: Pagefind, Flexsearch, Lunr.js, Typesense, and Meilisearch.

---

## 2. Decision

**Replace the Algolia DocSearch integration with Pagefind.**

Pagefind is the only evaluated technology that satisfies all five hard constraints. The decision is
supported by measured benchmark data from the prototype (see Section 5).

---

## 3. Rejected Alternatives

### 3.1 Complete the Algolia Integration

Completing the Algolia integration would require: creating a Stoked UI Algolia account, applying
for the free DocSearch program (not guaranteed, may take weeks), building an out-of-band crawler
trigger that is not atomic with SST deployments, and carrying ~20 transitive Algolia packages
(`algoliasearch@5.49.0` and sub-packages) as runtime dependencies. Ongoing operational cost and
the non-atomic index freshness model make this a poor fit for the deployment architecture.

### 3.2 Flexsearch

Eliminated. Flexsearch has no built-in index chunking. For ~300 documentation pages, the
pre-serialized index JSON is estimated at 2–10 MB uncompressed, which must be loaded entirely
before the first query executes. No official build-time CLI exists; all indexing tooling would
require custom Node.js scripts with ongoing maintenance burden.

### 3.3 Lunr.js

Eliminated. Same monolithic index problem as Flexsearch — estimated 3–15 MB index JSON for this
site's scale. Additionally, Lunr does not support partial/prefix match out of the box, which
degrades live-search UX. No official build-time CLI; custom tooling required.

### 3.4 Typesense

Eliminated. Requires a live server to answer queries at runtime. The CloudFront + S3 deployment
has no server; this is an unresolvable architectural constraint violation.

### 3.5 Meilisearch

Eliminated. Same server-required constraint violation as Typesense. Self-hosting would add
~$15–40/month infrastructure cost; Meilisearch Cloud starts at $30/month.

---

## 4. Architecture

### 4.1 High-Level Data Flow

```
Content Sources                    Build Step                    Runtime
─────────────────                  ──────────                    ───────

docs/src/pages/**/*.tsx            next export                   CloudFront + S3
docs/data/**/*.md          ──▶    ─────────────▶  docs/export/  ──────────────────▶  Browser
docs/src/layouts/*.tsx             (Next.js)          │
                                                       │
                                                       ▼
                                   pagefind --site export
                                   ─────────────────────▶  docs/export/pagefind/
                                                                │
                                                                ├── pagefind.js         (9.8 KB gz, initial load)
                                                                ├── pagefind-ui.js      (22.6 KB gz, optional)
                                                                ├── wasm.en.pagefind    (54.9 KB, lazy on first search)
                                                                ├── index/en_*.pf_index (5.5 KB per shard, lazy per query)
                                                                └── fragment/en_*.pf_fragment (~0.6 KB per result, lazy)

                                                                         │
                                                                         ▼
                                              User opens search (Cmd+K / Ctrl+K)
                                                                         │
                                                                         ▼
                                              PagefindSearch component loads pagefind.js
                                                                         │
                                                                         ▼
                                              User types query → pagefind.search(query)
                                                                         │
                                                                         ▼
                                              Lazy-fetch relevant index shard(s) (~5–15 KB)
                                                                         │
                                                                         ▼
                                              Lazy-fetch result fragments (~0.6 KB each)
                                                                         │
                                                                         ▼
                                              Render results in modal (title, excerpt, URL)
```

### 4.2 Index File Location

After `next export` produces `docs/export/`, Pagefind is run as a post-build step:

```bash
npx pagefind --site docs/export --output-path docs/export/pagefind
```

The index is written into `docs/export/pagefind/`. Because `docs/export/` is the entire static
site root uploaded to S3, the index files deploy automatically alongside HTML, CSS, and JS with no
additional configuration. CloudFront serves `pagefind/**` as ordinary static assets.

### 4.3 HTML Annotation Strategy

Pagefind determines what to index based on HTML attributes placed in the layout templates:

- `data-pagefind-body` — marks the main content region to index (typically the
  `<main>` element in `docs/src/layouts/`). Content outside this attribute is excluded (headers,
  footers, sidebars).
- `data-pagefind-meta="title"` — overrides the page title used in results (falls back to `<title>`).
- `data-pagefind-filter="product[data-product]"` — indexes a per-page filter value from a data
  attribute, enabling product-scoped filtering (Media, Timeline, File Explorer, Flux, etc.).
- `data-pagefind-ignore` — excludes specific elements within the body (e.g., code blocks that are
  demo-only, navigation breadcrumbs).

These attributes are added to `docs/src/layouts/` templates in Phase 2.

---

## 5. Benchmark Data (from Item 1.2 Prototype)

All measurements were taken with Pagefind v1.4.0 against the prototype in
`projects/implement-full-text-search-with-deploy-time-reindexing/prototype/`.

### 5.1 Build Time

| Pages Indexed | Build Time | Constraint | Result |
|---|---|---|---|
| 8 pages (prototype) | **0.515 s** | < 60 s | PASS |
| 50 pages (scaling test) | **0.301 s** | < 60 s | PASS |
| ~300 pages (projected full site) | **~2–5 s** | < 60 s | PASS |

The 50-page build time being *lower* than the 8-page build time confirms that Rust binary startup
overhead dominates, not per-page processing cost. The full site will index in well under 10 seconds.

### 5.2 Bundle Sizes

| Asset | Raw | Gzipped | When Loaded |
|---|---|---|---|
| `pagefind.js` (search engine) | 33.1 KB | **9.8 KB** | Initial page load |
| `pagefind-ui.js` (optional built-in UI) | 82.6 KB | **22.6 KB** | On search open (if used) |
| `wasm.en.pagefind` (WASM engine) | 54.9 KB | 54.9 KB (binary) | First search interaction |
| Index shard (`en_*.pf_index`) | — | **~5.5 KB** per shard | Per query |
| Fragment (`en_*.pf_fragment`) | — | **~0.6 KB** per page | Per result |

Initial page load cost: **9.8 KB gzipped** — 5x under the 50 KB constraint. All remaining assets
are deferred until the user explicitly opens and uses the search interface.

### 5.3 Constraint Compliance

| Constraint | Pagefind Result | Status |
|---|---|---|
| Static site compatible | Runs against `docs/export/` HTML; output is static files | PASS |
| SST StaticSite / CloudFront + S3 | `pagefind/` deploys with the site; no special config | PASS |
| Zero recurring cost | Open source (MIT); no accounts, APIs, or services | PASS |
| < 60 s build time | 0.3–0.5 s measured; ~2–5 s projected at full scale | PASS |
| < 50 KB gzipped initial bundle | 9.8 KB (`pagefind.js` only) | PASS |

---

## 6. Component Architecture

### 6.1 Strategy: Adapt AppSearch.js — Do Not Replace It

The existing `AppSearch.js` contains significant, well-tested UI work (styled components, keyboard
handling, dark mode theming, modal infrastructure). The search engine coupling (Algolia API calls,
hit rendering) is localized and surgically replaceable without discarding the surrounding UI work.

The new component will be named `AppSearch.js` (same file) — the Algolia internals are replaced,
the outer shell is retained.

### 6.2 Reuse Plan

| AppSearch.js Element | Action | Rationale |
|---|---|---|
| `SearchButton` styled component | **Keep as-is** | No Algolia coupling; pure MUI styled component |
| `SearchLabel` styled component | **Keep as-is** | No Algolia coupling |
| `Shortcut` styled component | **Keep as-is** | No Algolia coupling |
| `useDocSearchKeyboardEvents` (Cmd+K handler) | **Replace** | Algolia-specific hook; replace with a plain `keydown` `useEffect` handler listening for `Meta+K` / `Ctrl+K` |
| `isOpen` / `onOpen` / `onClose` state pattern | **Keep as-is** | Standard React modal state; no Algolia dependency |
| Modal portal (`ReactDOM.createPortal` into `document.body`) | **Keep as-is** | Pattern is correct; only the modal content changes |
| `DocSearchModal` | **Replace** | Algolia-specific component; replace with a custom `PagefindModal` that renders a `<input>` wired to `pagefind.search()` and a results list |
| `DocSearchHit` component | **Replace** | Renders Algolia hit shape (`hierarchy.lvl*`, `content`); replace with `PagefindHit` that renders Pagefind result shape (`meta.title`, `excerpt`, `url`) |
| URL domain-stripping transform (`pathnameToLanguage`) | **Keep as-is** | Useful for deploy-preview environments; Pagefind `url` fields will be relative but the transform adds no harm |
| `NewStartScreen` | **Rewrite content, keep structure** | Replace MUI product links with actual Stoked UI products (Media, Timeline, File Explorer, Flux, Always Listening, Mac Mixer, Stokd Cloud); retain CSS class names and rendering pattern |
| `productNameProductId` map + `getDisplayTag` | **Rewrite** | Replace with a product tag system backed by `data-pagefind-filter` values from the index; map Stoked UI product IDs only |
| Language faceting (`facetFilterLanguage`) | **Defer to Phase 3** | Pagefind supports metadata filters; implement language filtering if multi-language support is needed |
| Dark mode `GlobalStyles` (CSS custom properties) | **Keep as-is** | Not Algolia-specific; the CSS variable names (`--docsearch-*`) can be replaced with `--search-*` variants, or Pagefind's own CSS variables used |
| Algolia `@docsearch/react` import | **Remove** | Eliminated with the integration |
| `useLazyCSS` CDN stylesheet loader | **Remove** | DocSearch CSS no longer needed; Pagefind uses its own CSS or a custom stylesheet |
| `appId`, `apiKey`, `indexName` constants | **Remove** | No credentials required for Pagefind |

### 6.3 New Components Added

| New Component | Location | Description |
|---|---|---|
| `PagefindModal` | `AppSearch.js` (inline) | Replaces `DocSearchModal`; renders a search input wired to `window.__pagefind__.search()`, a loading state while WASM initializes, and a results list |
| `PagefindHit` | `AppSearch.js` (inline) | Replaces `DocSearchHit`; renders a Pagefind result (title, excerpt with `<mark>` highlights, breadcrumb path) using MUI `Link` |
| `PagefindResultList` | `AppSearch.js` (inline) | Renders the list of `PagefindHit` items with keyboard navigation via `aria-activedescendant` |

### 6.4 AppFrame.js and AppHeader.tsx

Neither `docs/src/modules/components/AppFrame.js` nor `docs/src/layouts/AppHeader.tsx` require
changes. Both consume `AppSearch` through the `DeferredAppSearch` lazy-load wrapper, which is
agnostic to the search backend. The lazy-load pattern (client-side only, `React.Suspense`) is
retained as-is.

### 6.5 Head.tsx

Remove the two Algolia crawler meta tags:

```html
<!-- Remove in Phase 2 -->
<meta name="docsearch:language" content={userLanguage} />
<meta name="docsearch:version" content="master" />
```

These are read only by the Algolia DocSearch crawler. They have no meaning with Pagefind.

### 6.6 E2E Tests

The existing E2E tests in `test/e2e-website/material-docs.spec.ts` (Search describe block, lines
175–214) reference MUI routes (`/material-ui/react-card/`) and the Algolia `#docsearch-input`
element selector. These tests must be rewritten in Phase 2 to:

- Target the Pagefind input selector
- Assert against Stoked UI documentation routes and product names
- Cover keyboard shortcut activation (Cmd+K)
- Cover `NewStartScreen` quick-links for Stoked UI products

---

## 7. Dependency Changes

### 7.1 Dependencies to Remove

| Package | Notes |
|---|---|
| `@docsearch/react` | Algolia DocSearch React integration — primary package |
| `algoliasearch` | Pulled in transitively; ~20 sub-packages removed with it |
| `@algolia/client-search` and all `@algolia/*` packages | See full list in algolia-audit.md Section 3 |
| `search-insights` | Algolia analytics integration |

Removing `@docsearch/react` and its transitive Algolia dependencies eliminates approximately 20
packages from the dependency graph.

### 7.2 Dependencies to Add

| Package | Where | Notes |
|---|---|---|
| `pagefind` | `docs/devDependencies` | Build-time indexer CLI only; not in the runtime bundle |

The Pagefind client-side JavaScript (`pagefind.js`) is loaded at runtime directly from
`/pagefind/pagefind.js` (a static file in the deployment), not from `node_modules`. There is no
runtime `npm` package to add.

---

## 8. Build Pipeline Changes

### 8.1 Current Build Order

```
1. pnpm build (workspace)
2. next build (docs)
3. next export → docs/export/
4. sst deploy (uploads docs/export/ to S3)
```

### 8.2 Updated Build Order (Phase 2)

```
1. pnpm build (workspace)
2. next build (docs)
3. next export → docs/export/
4. npx pagefind --site docs/export --output-path docs/export/pagefind  ← NEW
5. sst deploy (uploads docs/export/ to S3, including pagefind/ directory)
```

Step 4 adds ~2–5 seconds to the total build time at full documentation scale. The index is
atomically consistent with the deployed HTML — any page reachable via CloudFront will have a
corresponding Pagefind index entry.

---

## 9. Consequences

### Positive

- Search works. The current Algolia integration returns zero results for every query because the
  index does not exist. Pagefind produces a real, populated index on every build.
- Zero recurring cost. No accounts, no API keys, no SaaS subscriptions.
- Atomic consistency. The search index always matches the deployed content exactly. There is no
  crawler lag, no stale results, and no manual reindexing step.
- Smaller dependency footprint. Removing `@docsearch/react` and ~20 Algolia transitive packages
  reduces install time and eliminates external SaaS coupling at build time.
- Purpose-built tooling. Pagefind is designed for exactly this deployment model (static HTML →
  S3/CDN). Its annotations (`data-pagefind-body`, `data-pagefind-filter`) are expressive enough
  to replicate the product-scoped filtering that the Algolia integration attempted.

### Negative / Trade-offs

- No typo tolerance. Pagefind uses BM25 with stemming but does not provide the fuzzy/typo-tolerant
  matching that Typesense and Meilisearch offer. Queries with minor typos may not return results.
  This is acceptable for technical documentation where users typically type component names correctly.
- Custom UI required. Unlike `@docsearch/react` (a complete drop-in modal), Pagefind requires
  building a modal UI. This is partially mitigated by reusing the `SearchButton`, keyboard handler,
  and dark mode theming from `AppSearch.js`, and optionally using `pagefind-ui.js` as a starting
  point for the result rendering.
- Phase 2 implementation work. The component rewrite and HTML annotation pass are non-trivial but
  time-bounded. Item 1.2 estimated 2–3 days; this ADR's more detailed reuse plan reduces the
  unknown scope further.

---

## 10. References

- Item 1.1 Algolia Audit: `projects/implement-full-text-search-with-deploy-time-reindexing/algolia-audit.md`
- Item 1.2 Technology Comparison: `projects/implement-full-text-search-with-deploy-time-reindexing/search-comparison.md`
- Pagefind documentation: https://pagefind.app
- Pagefind v1.4.0 (benchmarked version)
- Source file analyzed: `docs/src/modules/components/AppSearch.js`
- Lazy-load integration: `docs/src/modules/components/AppFrame.js`
- Header integration: `docs/src/layouts/AppHeader.tsx`
- E2E tests: `test/e2e-website/material-docs.spec.ts` (Search describe block, lines 175–214)
