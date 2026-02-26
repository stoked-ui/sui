# Algolia Integration Audit
**Project:** #14 — Implement Full-Text Search with Deploy-Time Reindexing
**Work Item:** 1.1 — Audit Existing Algolia Integration
**Date:** 2026-02-26
**Auditor:** Project-14 Agent

---

## 1. Current State

The codebase has a complete, polished **Algolia DocSearch UI component** (`docs/src/modules/components/AppSearch.js`) that was adapted from the upstream MUI project. The frontend integration is fully built out and styled. However, there is **no indexing pipeline** — the Algolia index either does not exist or has never been populated with Stoked UI content.

### What Is Working

- The `AppSearch.js` component renders a styled search button (Cmd+K / Ctrl+K shortcut) that opens the Algolia `DocSearchModal` via a portal into `document.body`.
- Keyboard navigation is wired up via `useDocSearchKeyboardEvents`.
- A custom `NewStartScreen` renders quick-links to major product sections (Media, Base UI, SUI X, etc.) before the user types a query.
- A custom `DocSearchHit` component transforms Algolia hit URLs to strip the external domain, enabling cross-environment links (e.g., deploy previews, localhost).
- Search results can be filtered by `productId` / `productCategoryId` using Algolia `optionalFilters`, providing context-aware result boosting.
- Language faceting is implemented: results are filtered to `language:en` (or the active locale if it is in `LANGUAGES_SSR`).
- Dark mode theming is fully implemented via MUI `GlobalStyles` using CSS custom properties.
- The component is lazy-loaded (via `React.lazy` in `AppFrame.js`) to avoid blocking the initial page render.

### What Is Missing

- **No active Algolia index.** DNS resolution for `ZYBF3WCUQZ-dsn.algolia.net` fails in this environment, indicating the Application ID `ZYBF3WCUQZ` does not resolve to a live Algolia cluster. The credentials hardcoded in `AppSearch.js` (`appId: "ZYBF3WCUQZ"`, `apiKey: "913ec420cdff0c980c01a05e9a88f70b"`) appear to be carried over from an upstream MUI/Material-UI project and have not been replaced with Stoked UI-specific credentials.
- **No DocSearch crawler configuration.** There is no `algolia-crawler.json`, `.algoliaignore`, or any crawler config file in the repository. Algolia DocSearch relies on either (a) the free Algolia DocSearch program (requires applying for the program), or (b) a self-hosted crawler, or (c) manual indexing via the Algolia API. None of these are configured.
- **No indexing scripts.** The `scripts/` and `docs/scripts/` directories contain no Algolia indexing utilities. There is no `docs/scripts/buildAlgoliaIndex.ts` or equivalent.
- **No Algolia environment variables.** The `.env` and `.env.development` files contain no `NEXT_PUBLIC_ALGOLIA_*` or `ALGOLIA_*` variables. The app ID and search API key are hardcoded into the component source.
- **CSS version mismatch.** `AppSearch.js` lazily loads the DocSearch stylesheet from a CDN pinned to `@docsearch/css@3.0.0-alpha.40`, while the installed package version (resolved in `pnpm-lock.yaml`) is `@docsearch/react@3.9.0`. The pinned CDN version is a pre-release alpha that predates the current stable release by several years; this may cause style inconsistencies.
- **Start screen shows legacy MUI products.** The `NewStartScreen` component lists "Base UI", "Joy UI", "SUI Toolpad", and "SUI System" alongside "Media" — products that are not part of the Stoked UI documentation site. These are holdovers from the original MUI codebase that were not cleaned up.
- **`productNameProductId` mapping is incomplete.** `AppSearch.js` maps `'media'`, `'file-explorer'`, `'timeline'`, `'x'`, `'system'`, and `'toolpad*'` product IDs to display names. New products added to the site (Flux, Always Listening, Mac Mixer, Stokd Cloud) are not mapped, so `getDisplayTag()` will emit `console.error` for any search hits from those products.

---

## 2. Algolia Account Status

**Status: No active account / credentials are invalid for this site.**

Attempts to resolve `ZYBF3WCUQZ-dsn.algolia.net` via DNS return `NXDOMAIN`. The application ID `ZYBF3WCUQZ` is sourced from MUI's upstream codebase and is not a Stoked UI–owned Algolia application. The search key (`913ec420cdff0c980c01a05e9a88f70b`) is MUI's public search-only key and cannot be used to write records or access a Stoked UI index.

There is no Algolia account, application, or index provisioned for `stoked-ui` or `stokedconsulting.com`. The free Algolia DocSearch program (which MUI uses) requires an approved application and an active, publicly crawlable documentation site. There is no record of such an application having been submitted for Stoked UI.

**Practical consequence:** The search modal opens but returns zero results for any query. Users who press Cmd+K see the `NewStartScreen` with legacy quick-links, but any search query against the dead index returns nothing.

---

## 3. Dependency List

### Direct Dependency

| Package | Location | Version in `package.json` | Resolved Version |
|---------|----------|-----------------------------|-----------------|
| `@docsearch/react` | `docs/package.json` | `^3.6.0` | `3.9.0` |

### Transitive Dependencies (from `pnpm-lock.yaml`)

| Package | Resolved Version |
|---------|-----------------|
| `@docsearch/css` | `3.9.0` |
| `algoliasearch` | `5.49.0` |
| `@algolia/client-search` | `5.49.0` |
| `@algolia/client-common` | `5.49.0` |
| `@algolia/client-analytics` | `5.49.0` |
| `@algolia/client-insights` | `5.49.0` |
| `@algolia/client-abtesting` | `5.49.0` |
| `@algolia/client-personalization` | `5.49.0` |
| `@algolia/client-query-suggestions` | `5.49.0` |
| `@algolia/requester-browser-xhr` | `5.49.0` |
| `@algolia/requester-fetch` | `5.49.0` |
| `@algolia/requester-node-http` | `5.49.0` |
| `@algolia/recommend` | `5.49.0` |
| `@algolia/ingestion` | `1.49.0` |
| `@algolia/monitoring` | `1.49.0` |
| `@algolia/abtesting` | `1.15.0` |
| `@algolia/autocomplete-core` | `1.17.9` |
| `@algolia/autocomplete-plugin-algolia-insights` | `1.17.9` |
| `@algolia/autocomplete-preset-algolia` | `1.17.9` |
| `@algolia/autocomplete-shared` | `1.17.9` |
| `search-insights` | `2.17.3` |

Additionally, `fg-loadcss` is used by `useLazyCSS` to inject the DocSearch stylesheet at runtime.

---

## 4. Integration Points

### 4.1 `docs/src/modules/components/AppSearch.js`

The primary integration file. Key Algolia-specific parameters hard-coded in this file:

```js
appId="ZYBF3WCUQZ"
apiKey="913ec420cdff0c980c01a05e9a88f70b"
indexName="stoked-ui"
```

Search parameters sent on every query:
- `facetFilters: ['version:master', facetFilterLanguage]` — requires the index to have `version` and `language` facet attributes configured.
- `optionalFilters: ['productId:<current>']` or `['productCategoryId:<current>']` — boosts results from the current product section.
- `attributesToRetrieve`: `hierarchy.lvl0` through `hierarchy.lvl6`, `content`, `type`, `url`, `productId`, `productCategoryId` — these are the Algolia record fields the UI expects.
- `hitsPerPage: 40`

Response shape expected by `DocSearchHit`:
```js
{
  url: string,        // full URL including domain; transformed to strip domain
  pathname: string,   // derived from url (after transform)
  as: string,         // localized pathname alias (after transform)
  userLanguage: string,
  productId: string,
  productCategoryId: string,
  hierarchy: { lvl0..lvl6 },
  content: string,
  type: string,
}
```

CSS is loaded lazily from CDN: `https://cdn.jsdelivr.net/npm/@docsearch/css@3.0.0-alpha.40/dist/style.min.css` (pinned to an outdated alpha version).

### 4.2 `docs/src/modules/components/AppFrame.js`

- Lazy-loads `AppSearch` via `React.lazy()` to prevent SSR and keep it out of the initial JS bundle.
- Exports `DeferredAppSearch`, which mounts only after `useEffect` fires (client-side only), wrapping in `React.Suspense` with a blank `Box` fallback.
- `DeferredAppSearch` is used in `AppFrame`'s own header (line 195) and exported for use by other layouts.

### 4.3 `docs/src/layouts/AppHeader.tsx`

- Imports `DeferredAppSearch` from `AppFrame.js`.
- Renders it in the header toolbar at line 148.

### 4.4 `docs/src/modules/components/Head.tsx`

Emits two Algolia DocSearch crawler-hint meta tags in `<head>`:

```html
<meta name="docsearch:language" content={userLanguage} />
<meta name="docsearch:version" content="master" />
```

These are read by the Algolia DocSearch crawler to tag indexed records with `language` and `version` facet values. They have no effect without an active crawler.

---

## 5. E2E Test Coverage

File: `test/e2e-website/material-docs.spec.ts`

The `Search` describe block (lines 175–214) contains two tests:

| Test | Input | Expected Output |
|------|-------|----------------|
| `should have correct link when searching component` | Type "card" into `input#docsearch-input` | `.DocSearch-Hits a:has-text("Card")` links to `/material-ui/react-card/` |
| `should have correct link when searching API` | Type "card api" into `input#docsearch-input` | `.DocSearch-Hits a:has-text("Card API")` links to `/material-ui/api/card/` |

**Gaps in test coverage:**
- Tests are written against MUI's live Algolia index (`/material-ui/*` routes), not Stoked UI content. They would fail against any Stoked UI index because the expected URLs reference Material UI paths.
- No tests cover the Stoked UI product sections (Media, File Explorer, Timeline, Flux, etc.).
- No tests verify the `NewStartScreen` quick-links render correctly.
- No tests cover keyboard navigation (`Meta+K` shortcut) functioning after the component renders.
- Tests depend on a live, populated Algolia index being queryable from the test environment — since the current index does not exist, these tests will fail.

---

## 6. Reuse Potential

If continuing with Algolia, the following components from the existing integration can be reused with modifications:

| Component/File | Reuse Potential | Required Changes |
|---------------|----------------|-----------------|
| `AppSearch.js` — modal trigger button, keyboard handler, dark mode styles | High | Replace App ID / API key; fix CDN CSS version pin |
| `AppSearch.js` — `DocSearchHit` transform logic | High | No changes needed; handles URL domain stripping |
| `AppSearch.js` — `NewStartScreen` | Medium | Replace MUI product links with Stoked UI product links; add missing products |
| `AppSearch.js` — facet/filter logic (`productId`, language) | High | Add new products to `productNameProductId` map |
| `AppFrame.js` — `DeferredAppSearch` lazy loader | High | No changes needed |
| `AppHeader.tsx` — `DeferredAppSearch` usage | High | No changes needed |
| `Head.tsx` — DocSearch crawler meta tags | Medium | Keep if using Algolia crawler; remove if switching to static indexing |
| E2E tests | Low | Must be rewritten for Stoked UI routes and product names |

If **switching away from Algolia** (e.g., to Pagefind), the following is reusable:

- The **search button trigger** (`SearchButton`, `SearchLabel`, `Shortcut` styled components) — these are pure MUI styled components with no Algolia coupling and can wrap any search UI.
- The **keyboard shortcut registration** pattern (Cmd+K) — can be reimplemented with `useDocSearchKeyboardEvents` replaced by a plain `keydown` handler.
- The **dark mode GlobalStyles** theming approach — any custom search modal can adopt the same CSS variable pattern.

---

## 7. Effort Estimate: Complete vs. Replace

### Option A — Complete the Algolia Integration

**What is needed:**
1. Register for Algolia DocSearch (free tier requires open-source / public docs approval) or create a paid Algolia account and application.
2. Configure and run the DocSearch crawler (either via Algolia's hosted crawler or self-hosted) against `stokedconsulting.com` docs.
3. Update `AppSearch.js` with the correct `appId` and `apiKey`.
4. Fix the CDN CSS version pin to match `@docsearch/css@3.9.0`.
5. Update `NewStartScreen` to reflect actual Stoked UI products and remove MUI products.
6. Extend `productNameProductId` map for new products (Flux, Always Listening, Mac Mixer, Stokd Cloud).
7. Determine whether to embed API keys via environment variables (`NEXT_PUBLIC_ALGOLIA_APP_ID` etc.) or keep them hardcoded (search-only keys are safe to expose publicly).
8. Establish a crawl schedule (or deploy-triggered reindexing).
9. Rewrite E2E tests for Stoked UI routes.

**Risks:**
- Algolia DocSearch free tier approval is not guaranteed and may take weeks.
- The crawler-based approach means index freshness depends on crawler schedule — not atomic with deployments.
- Paid Algolia plans add ongoing cost; at scale this is significant.
- Static site (CloudFront + S3) makes it harder to run a server-side crawler trigger post-deploy.
- Transitive dependency tree (`algoliasearch@5.49.0` + ~15 sub-packages) adds bundle weight.

**Estimated effort:** 3–5 days if Algolia account is approved promptly; up to 2 weeks if crawler approval takes time.

### Option B — Replace with Pagefind (Static, Build-Time)

**What is needed:**
1. Add `pagefind` as a dev dependency; remove `@docsearch/react` and transitive Algolia deps.
2. Run `pagefind --site docs/export/` as a post-build step; output goes to `docs/export/pagefind/`.
3. Build a custom `AppSearch`-compatible wrapper that opens Pagefind's UI in the existing DocSearch modal pattern.
4. Reuse the `SearchButton` trigger, keyboard shortcut, and dark mode theming from the current `AppSearch.js`.
5. Rewrite E2E tests for the new UI.

**Advantages:**
- Zero cost, zero external dependency at runtime.
- Index is always in sync with content — atomically built and deployed.
- Bundle savings: `@docsearch/react` + transitive Algolia packages is replaced by Pagefind's lightweight client (~13KB gzipped).
- No crawler approval process or account management.
- Works perfectly with the SST StaticSite (S3 + CloudFront) deployment model.

**Estimated effort:** 2–3 days.

---

## 8. Recommendation

**Switch to Pagefind.**

The Algolia integration is non-functional: the Application ID is borrowed from MUI and resolves to a dead cluster. There is no Algolia account, no index, and no indexing pipeline. Completing the Algolia integration requires obtaining new credentials, waiting for DocSearch program approval (or paying for a plan), and building an out-of-band crawl-trigger mechanism that is not atomic with the SST deployment.

Pagefind is the better fit for this project's constraints:

- It produces a static index at build time, fully compatible with the `docs/export/` → S3/CloudFront deployment model.
- The index is always in sync with the deployed content — no crawler lag.
- It eliminates ~20 transitive Algolia packages from the dependency tree.
- It is free, requires no account or API keys, and has no ongoing operational burden.
- The existing `SearchButton` trigger, keyboard shortcut (Cmd+K), and dark mode theming can be retained and wrapped around Pagefind's client-side search API.

The UI refactor effort (replacing `DocSearchModal` with a Pagefind-powered modal) is comparable to the Algolia credential/crawler setup work, but Pagefind removes all future operational risk and cost. The E2E tests must be rewritten regardless of which technology is chosen.

**The `@docsearch/react` dependency and hardcoded MUI credentials should be removed in Phase 2 when the replacement is implemented.**
