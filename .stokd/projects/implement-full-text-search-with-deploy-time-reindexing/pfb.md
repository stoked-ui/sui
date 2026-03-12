# Implement Full-Text Search with Deploy-Time Reindexing

## 1. Feature Overview
**Feature Name:** Full-Text Search with Deploy-Time Reindexing
**Owner:** Stoked UI Team
**Status:** Draft
**Target Release:** Q1 2026

### Summary
Implement a fully functional search experience for the Stoked UI documentation site that allows users to find components, API references, guides, and blog posts instantly. The search must automatically rebuild its index on every deployment so content is always up-to-date. An existing partial Algolia DocSearch integration exists but was never completed — this project will evaluate the best approach (continue with Algolia, switch to a client-side solution like Pagefind, or adopt another service) and deliver a production-ready implementation.

---

## 2. Problem Statement
### What problem are we solving?
The Stoked UI documentation site has no working search. While a sophisticated Algolia DocSearch UI component exists (`AppSearch.js`, ~830 lines), there is no indexing pipeline — the Algolia DocSearch crawler may not be active, meaning search results are stale or empty. Users visiting stoked-ui.com, stokedconsulting.com, or stokedui.com cannot discover components, API docs, or guides without manually browsing the navigation tree.

### Who is affected?
- **Primary users:** Developers evaluating or using Stoked UI packages (sui-media, sui-timeline, sui-file-explorer, sui-editor, sui-common, Flux)
- **Secondary users:** Internal team members referencing API documentation and guides

### Why now?
The documentation site has grown significantly with new products (Flux, consulting portal, blog system, invoice system). Without search, discoverability of this content is poor. The existing Algolia integration represents sunk effort that should either be completed or replaced. Deploy-time reindexing is critical because content changes with every release.

---

## 3. Goals & Success Metrics
### Goals
1. Deliver a fully working search that covers all documentation content (component docs, API references, guides, blog posts)
2. Ensure the search index is automatically rebuilt on every deployment — zero manual steps
3. Provide sub-200ms search response times for a responsive user experience
4. Support keyboard navigation (Cmd+K / Ctrl+K) and category filtering (already partially built)
5. Minimize ongoing cost — prefer free or open-source solutions where quality is comparable

### Success Metrics (How we'll know it worked)
- Search returns relevant results for 100% of documented components and API pages (baseline: 0% working → target: 100%)
- Index rebuild completes within the CI/CD pipeline without adding more than 60 seconds to deploy time
- Search latency p95 < 200ms from user keystroke to results rendered
- Zero manual intervention required for reindexing after any deploy

---

## 4. User Experience & Scope
### In Scope
- Evaluate and select search technology (Algolia DocSearch, Pagefind, Flexsearch, Typesense, Meilisearch, or custom)
- Build or configure an indexing pipeline that runs at build/deploy time
- Integrate search UI into the existing docs site header (leveraging or replacing AppSearch.js)
- Index all content: markdown docs, API reference pages, blog posts, product pages
- Support filtering by product/category (Media, Timeline, File Explorer, Editor, Flux, etc.)
- Keyboard shortcut support (Cmd+K / Ctrl+K)
- Dark mode / light mode styling
- E2E test coverage for search functionality
- SST deployment integration for index generation

### Out of Scope
- Full-text search within source code files (IDE-level search)
- Search analytics dashboard or query tracking
- Autocomplete for code snippets within search results
- Multi-language / i18n search (English only for now)
- Search across external sites or third-party documentation

---

## 5. Assumptions & Constraints
### Assumptions
- The docs site will continue to be statically exported via Next.js (`docs/export/`)
- SST (Ion) will remain the deployment infrastructure (CloudFront + S3)
- The existing AppSearch.js component's UX patterns (keyboard shortcut, category filtering, modal overlay) are desirable and should be preserved or replicated
- All searchable content is available as markdown files at build time in `docs/data/`
- API docs are generated at build time via `pnpm docs:api`

### Constraints
- **Technical:** Must work with static site deployment (no server-side search unless a hosted service is used)
- **Cost:** Prefer free or very low-cost solutions — the site is open-source / small-scale
- **Timeline:** Should be implementable within a single project cycle (2-4 weeks)
- **Resources:** Single developer implementation
- **Infrastructure:** Must integrate with existing SST deploy pipeline without requiring additional servers

---

## 6. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Algolia DocSearch free tier requires open-source approval and has crawler reliability issues | Search may not index reliably; dependency on external crawler schedule | Evaluate self-hosted alternatives (Pagefind) that give full control over indexing |
| Client-side search (Pagefind, Flexsearch) may produce large index bundles for the docs site | Increased page load time and bandwidth usage | Benchmark index sizes; Pagefind uses chunked loading to minimize initial payload |
| Existing AppSearch.js component is tightly coupled to Algolia's API response format | Significant refactoring needed if switching providers | Assess adaptation cost vs. building a simpler replacement component |
| Build-time indexing adds time to CI/CD pipeline | Slower deployments | Set budget of 60 seconds; choose tools with fast indexing; cache index when content hasn't changed |
| Search relevance tuning requires ongoing maintenance | Poor search results erode trust | Use proven ranking algorithms; add boost weights for titles, headings, and component names |

---

## 7. Dependencies
- **Build System:** Turbo + pnpm monorepo build must complete before indexing (API docs generated at build time)
- **Deployment:** SST deploy pipeline must support a post-build indexing step
- **Content:** All markdown content in `docs/data/` and generated API docs must be available at index time
- **UI Framework:** Material-UI v5 for search component styling
- **Next.js:** Static export compatibility — search solution must work with `next export`
- **Existing Infrastructure:** CloudFront CDN for serving index files (if client-side approach)

---

## 8. Open Questions
1. Is the existing Algolia DocSearch account/crawler still active, or has it lapsed?
2. Should we prioritize zero-cost (Pagefind, Flexsearch) over best-in-class relevance (Algolia, Typesense)?
3. How much of the existing AppSearch.js component can be reused vs. needs replacement?
4. Should blog posts be searchable with the same weight as component documentation?
5. Do we need search result previews/snippets, or just titles and links?
6. Should the index be served from the same S3/CloudFront origin or a separate service?

---

## 9. Non-Goals
- Building a custom search engine from scratch (use existing open-source tooling)
- Achieving Google-quality NLP or semantic search — keyword/fuzzy matching is sufficient
- Supporting search across multiple separate documentation sites
- Building an admin UI for managing search configuration
- Real-time indexing of content changes (deploy-time batch reindexing is sufficient)

---

## 10. Notes & References
- **Existing search component:** `docs/src/modules/components/AppSearch.js` (~830 lines, Algolia DocSearch React)
- **Existing integration point:** `docs/src/layouts/AppHeader.tsx` (line 148)
- **Algolia config:** App ID `ZYBF3WCUQZ`, Index `stoked-ui`, Public API Key in AppSearch.js
- **E2E tests:** `test/e2e-website/material-docs.spec.ts`
- **Content source:** `docs/data/` (markdown), `docs/scripts/buildApiDocs/` (API doc generation)
- **Deployment config:** `infra/site.ts` (SST)
- **Candidate technologies:**
  - [Pagefind](https://pagefind.app/) — Static search library, indexes at build time, zero config, free
  - [Algolia DocSearch](https://docsearch.algolia.com/) — Free for open-source, external crawler
  - [Flexsearch](https://github.com/nickunger/flexsearch) — Client-side full-text search, zero dependencies
  - [Typesense](https://typesense.org/) — Open-source search engine with free cloud tier
  - [Meilisearch](https://www.meilisearch.com/) — Open-source, self-hostable search engine
