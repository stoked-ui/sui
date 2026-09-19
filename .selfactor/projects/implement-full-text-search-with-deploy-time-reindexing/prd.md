# Product Requirements Document (Sequential)

## 0. Source Context
**Derived From:** Feature Brief — Implement Full-Text Search with Deploy-Time Reindexing
**Feature Name:** Full-Text Search with Deploy-Time Reindexing
**PRD Owner:** Stoked UI Team
**Last Updated:** 2026-02-25

### Feature Brief Summary
Implement a fully functional search experience for the Stoked UI documentation site. An existing Algolia DocSearch integration exists (UI component only, no indexing pipeline). This project will evaluate the best search technology, build a build-time indexing pipeline, integrate the search UI, and ensure automatic reindexing on every deployment via SST.

---

## 1. Objectives & Constraints
### Objectives
- Deliver working full-text search across all documentation content (component docs, API references, guides, blog posts)
- Automate index generation at build time so every deploy has fresh search data
- Provide fast, relevant search results with category filtering and keyboard navigation
- Minimize ongoing cost and operational overhead (prefer client-side or free-tier solutions)
- Maintain existing UX patterns (Cmd+K shortcut, modal overlay, dark mode support)

### Constraints
- Must work with Next.js static export (`docs/export/`) — no server-side runtime available
- Deployment via SST StaticSite (CloudFront + S3) — index files must be part of the static output
- Single developer implementation within 2-4 weeks
- Zero recurring cost preferred (rules out paid search SaaS at scale)
- Must not add more than 60 seconds to the build pipeline
- Search bundle impact on initial page load must be < 50KB gzipped

---

## 1.5 Required Toolchain

| Tool | Min Version | Install Command | Verify Command |
|------|------------|-----------------|----------------|
| node | 18+ | `nvm install 18` | `node --version` |
| pnpm | 10+ | `npm i -g pnpm` | `pnpm --version` |
| pagefind | 1.0+ | `pnpm add -D pagefind` | `npx pagefind --version` |
| turbo | 2+ | (already installed) | `turbo --version` |

---

## 2. Execution Phases

> Phases below are ordered and sequential.
> A phase cannot begin until all acceptance criteria of the previous phase are met.

---

## Phase 1: Technology Evaluation & Selection
**Purpose:** Make an informed, documented decision on which search technology to use before writing any integration code. This prevents wasted effort on a solution that doesn't fit the constraints.

### 1.1 Audit Existing Algolia Integration
Assess the current state of the Algolia DocSearch integration to understand what works, what's broken, and what can be reused.

**Implementation Details**
- Read and document the full `docs/src/modules/components/AppSearch.js` component — identify all Algolia-specific API calls, response format expectations, and UI patterns
- Check if the Algolia DocSearch crawler is active by querying the existing index (`ZYBF3WCUQZ` / `stoked-ui`) via the search API key
- Document the integration points: `AppHeader.tsx`, `AppFrame.js`, `Head.tsx` meta tags
- List all Algolia-specific dependencies in `package.json` files
- Review E2E tests in `test/e2e-website/material-docs.spec.ts` for search test coverage
- Produce a written assessment: what works, what's missing, effort to complete vs. replace

**Acceptance Criteria**

_Structural:_
- AC-1.1.a: A written assessment document exists at `projects/implement-full-text-search-with-deploy-time-reindexing/algolia-audit.md`
- AC-1.1.b: Document covers: current state, missing pieces, Algolia account status, dependency list, integration points, reuse potential

_Executable:_
- AC-1.1.c: Assessment includes a concrete recommendation (continue with Algolia or switch)

**Acceptance Tests**
- Test-1.1.a: Audit document contains sections for: Current State, Missing Pieces, Account Status, Dependencies, Integration Points, Recommendation
- Test-1.1.b: All Algolia-specific files and dependencies are identified

**Verification Commands**
```bash
# Verify audit document exists and has substance
test -f projects/implement-full-text-search-with-deploy-time-reindexing/algolia-audit.md && \
  wc -l projects/implement-full-text-search-with-deploy-time-reindexing/algolia-audit.md | awk '{if ($1 > 30) exit 0; else exit 1}'
```

---

### 1.2 Evaluate Alternative Search Technologies
Research and benchmark candidate search solutions against project constraints (static site, free, build-time indexing, < 50KB bundle).

**Implementation Details**
- Evaluate at minimum: **Pagefind**, **Flexsearch**, **Lunr.js**, **Typesense** (free cloud tier), **Meilisearch** (self-hosted)
- For each candidate, assess: indexing approach, bundle size, query performance, relevance quality, cost, maintenance burden, static site compatibility
- Build a quick prototype with the top 2 candidates against a subset of the docs content (e.g., `docs/data/media/` only)
- Benchmark: index build time, index file size, search latency, result relevance for 10 sample queries
- Produce a comparison matrix and recommendation

**Acceptance Criteria**

_Structural:_
- AC-1.2.a: Comparison document exists at `projects/implement-full-text-search-with-deploy-time-reindexing/search-comparison.md`
- AC-1.2.b: At least 4 technologies compared across at least 6 criteria
- AC-1.2.c: Prototypes built for top 2 candidates with measurable benchmarks

_Executable:_
- AC-1.2.d: A final technology selection is documented with clear rationale

**Acceptance Tests**
- Test-1.2.a: Comparison matrix has rows for each technology and columns for each criterion
- Test-1.2.b: Benchmark numbers (index size, build time, latency) are real measurements, not estimates
- Test-1.2.c: Selected technology meets all constraints (static site compatible, free, < 50KB bundle)

**Verification Commands**
```bash
# Verify comparison document exists
test -f projects/implement-full-text-search-with-deploy-time-reindexing/search-comparison.md && echo "OK"
```

---

### 1.3 Document Architecture Decision
Formalize the technology choice and high-level architecture so subsequent phases have a clear foundation.

**Implementation Details**
- Write an Architecture Decision Record (ADR) capturing: context, decision, consequences
- Define the high-level data flow: content sources → indexer → index files → search UI → user
- Specify where index files will live in the build output (`docs/export/`)
- Define the search component architecture (new component vs. adapted AppSearch.js)
- Document which parts of AppSearch.js will be reused (styling, keyboard shortcut, modal pattern) vs. replaced (Algolia API calls, hit rendering)

**Acceptance Criteria**

_Structural:_
- AC-1.3.a: ADR exists at `projects/implement-full-text-search-with-deploy-time-reindexing/adr-search-technology.md`
- AC-1.3.b: Data flow diagram (text-based) is included
- AC-1.3.c: Component reuse plan is specified

_Executable:_
- AC-1.3.d: ADR references concrete benchmark data from 1.2

**Acceptance Tests**
- Test-1.3.a: ADR follows Context → Decision → Consequences format
- Test-1.3.b: Data flow covers: content source, indexing step, index storage, client loading, query execution, result rendering

**Verification Commands**
```bash
test -f projects/implement-full-text-search-with-deploy-time-reindexing/adr-search-technology.md && echo "OK"
```

---

## Phase 2: Build-Time Indexing Pipeline
**Purpose:** The indexing pipeline must exist and produce valid search index files before any UI work can begin. This phase creates the foundation that the search UI will query against. Cannot start until Phase 1 provides the technology decision.

### 2.1 Configure Search Indexer
Set up the selected search technology's indexing tool to process the static site output.

**Implementation Details**
- Install the selected search indexer as a dev dependency
- Create indexer configuration that targets `docs/export/` (the Next.js static output directory)
- Configure content selectors to extract: page title, headings, body text, code blocks
- Configure metadata extraction: product/category (from URL path), page type (guide, API, blog)
- Set up exclusion rules for non-content pages (404, blank pages, redirects)
- Add `data-pagefind-*` attributes (or equivalent) to the docs layout templates to mark searchable regions and metadata
- Ensure the indexer outputs index files into the static export directory

**Acceptance Criteria**

_Structural:_
- AC-2.1.a: Indexer configuration file exists in the project (e.g., `pagefind.yml` or equivalent config)
- AC-2.1.b: Content layout templates have search-specific markup for content regions and metadata
- AC-2.1.c: Exclusion rules prevent indexing of non-content pages

_Executable:_
- AC-2.1.d: Running the indexer against `docs/export/` produces index files without errors
- AC-2.1.e: Index output is placed within `docs/export/` so it deploys alongside the site

**Acceptance Tests**
- Test-2.1.a: Indexer runs successfully on the static export and produces index files
- Test-2.1.b: Index files are present in `docs/export/pagefind/` (or equivalent directory)
- Test-2.1.c: No non-content pages appear in the index

**Verification Commands**
```bash
# Build docs, run indexer, verify output
cd docs && pnpm build:export
npx pagefind --site export --serve false 2>&1 | tail -5
test -d docs/export/pagefind && ls docs/export/pagefind/ | head -10
```

---

### 2.2 Integrate Indexing into Build Pipeline
Add the indexing step to the monorepo build process so it runs automatically on every build.

**Implementation Details**
- Add a `docs:index` script to the docs `package.json` that runs the indexer
- Update the main build pipeline (`pnpm build:prod` or the SST build command) to run indexing after the Next.js export
- Ensure Turbo caching works correctly — index should rebuild when content changes
- Add the indexing step to CI if applicable
- Measure and document the time added to the build pipeline (target: < 60 seconds)

**Acceptance Criteria**

_Structural:_
- AC-2.2.a: `docs:index` script exists in `docs/package.json`
- AC-2.2.b: `build:prod` (or SST build command in `infra/site.ts`) includes the indexing step

_Executable:_
- AC-2.2.c: Running `pnpm build:prod` produces both the static site AND the search index
- AC-2.2.d: Indexing step completes in under 60 seconds
- AC-2.2.e: Deploying via `sst deploy` includes the search index files in the S3 upload

**Acceptance Tests**
- Test-2.2.a: Full build produces index files in the output directory
- Test-2.2.b: Index files are present in the deployed S3 bucket after a deploy
- Test-2.2.c: Build time with indexing is within acceptable range

**Verification Commands**
```bash
# Verify build script includes indexing
grep -q "index" docs/package.json && echo "index script found"
# Full build produces index
pnpm build:prod 2>&1 | tail -20
test -d docs/export/pagefind && echo "Index files present after build"
```

---

### 2.3 Validate Index Content Quality
Verify the index contains the right content with proper metadata, and that search queries return relevant results.

**Implementation Details**
- Write a validation script that queries the index programmatically for a set of known terms
- Test queries: component names (e.g., "MediaViewer", "Timeline", "FileExplorer"), API methods, guide topics, blog post titles
- Verify each result has: title, URL, content snippet, category/product metadata
- Verify results are ranked sensibly (title matches above body matches)
- Verify no duplicate entries for the same page
- Check index file total size and individual chunk sizes

**Acceptance Criteria**

_Structural:_
- AC-2.3.a: Validation script exists at `docs/scripts/validateSearchIndex.mjs` (or similar)

_Executable:_
- AC-2.3.b: Queries for known component names return the correct documentation pages as top results
- AC-2.3.c: Total index size is under 5MB (uncompressed), ensuring reasonable load times
- AC-2.3.d: No duplicate page entries in the index

**Acceptance Tests**
- Test-2.3.a: "MediaViewer" query returns the MediaViewer documentation page as the #1 result
- Test-2.3.b: "Timeline" query returns Timeline component docs, not unrelated content
- Test-2.3.c: Each result includes a non-empty title and valid URL
- Test-2.3.d: Index size validation passes

**Verification Commands**
```bash
# Run index validation
node docs/scripts/validateSearchIndex.mjs
```

---

## Phase 3: Search UI Integration
**Purpose:** Build the user-facing search experience that queries the index from Phase 2. Cannot start until Phase 2 produces a working, validated index.

### 3.1 Build Search Component
Create (or adapt) the search UI component that replaces the Algolia-specific implementation.

**Implementation Details**
- Create a new search component (or refactor AppSearch.js) that queries the local search index instead of Algolia's API
- Preserve existing UX patterns: Cmd+K / Ctrl+K keyboard shortcut, modal overlay, search input with instant results
- Implement result rendering: title, URL breadcrumb, content snippet with highlighted matches
- Implement category/product filtering using index metadata (Media, Timeline, File Explorer, Editor, Flux, Blog, etc.)
- Support dark mode and light mode via MUI theme integration
- Lazy-load the search index and UI component to avoid impacting initial page load
- Ensure the component works with Next.js static export (no SSR dependencies)

**Acceptance Criteria**

_Structural:_
- AC-3.1.a: Search component exists and is importable (either refactored AppSearch or new component)
- AC-3.1.b: Component uses the build-time index, not Algolia APIs
- AC-3.1.c: Component supports both light and dark themes

_Executable:_
- AC-3.1.d: Pressing Cmd+K opens the search modal
- AC-3.1.e: Typing a query displays results within 200ms
- AC-3.1.f: Clicking a result navigates to the correct page
- AC-3.1.g: Category filters narrow results to the selected product

**Acceptance Tests**
- Test-3.1.a: Component renders without errors in both light and dark mode
- Test-3.1.b: Keyboard shortcut opens and closes the modal
- Test-3.1.c: Search results match expected pages for test queries
- Test-3.1.d: Navigation from search result lands on correct page

**Verification Commands**
```bash
# Build docs and verify search component is included in output
pnpm build:prod
grep -r "pagefind" docs/export/ --include="*.js" -l | head -5
# TypeScript compilation passes
pnpm tsc --noEmit -p docs/tsconfig.json
```

---

### 3.2 Integrate into Site Layout
Wire the search component into the existing site header and navigation, replacing the Algolia integration.

**Implementation Details**
- Update `docs/src/layouts/AppHeader.tsx` to use the new search component instead of the Algolia-based AppSearch
- Remove or deprecate `@docsearch/react` dependency and related Algolia imports
- Remove Algolia-specific meta tags from `docs/src/modules/components/Head.tsx` (lines 64-66)
- Update the lazy-loading setup in `docs/src/modules/components/AppFrame.js`
- Ensure search button styling matches the existing header design
- Test on mobile viewports (search button should be icon-only on small screens, as existing)

**Acceptance Criteria**

_Structural:_
- AC-3.2.a: `AppHeader.tsx` imports the new search component
- AC-3.2.b: No Algolia-specific imports remain in active code paths
- AC-3.2.c: `@docsearch/react` removed from `package.json` dependencies

_Executable:_
- AC-3.2.d: Search button appears in the site header on all pages
- AC-3.2.e: Search works on desktop (full button) and mobile (icon-only) viewports
- AC-3.2.f: No console errors related to search on page load

**Acceptance Tests**
- Test-3.2.a: Header renders search button on desktop and mobile viewports
- Test-3.2.b: No references to `@docsearch/react` in built JavaScript output
- Test-3.2.c: Search modal opens and functions from any page on the site

**Verification Commands**
```bash
# Verify no Algolia dependencies remain
! grep -q "docsearch" docs/package.json && echo "Algolia removed"
# Build succeeds without Algolia
pnpm build:prod 2>&1 | tail -5
```

---

### 3.3 Implement Search Results UX Polish
Refine the search results display for quality, relevance, and visual polish.

**Implementation Details**
- Add result grouping by product/category (e.g., "Media", "Timeline", "API Reference")
- Implement highlighted search term matches in result snippets
- Add "no results" state with helpful suggestions
- Add recent searches / popular searches on the empty state (start screen)
- Implement proper focus management and keyboard navigation within results (arrow keys, Enter to select)
- Add loading state for initial index download
- Ensure accessibility: ARIA labels, screen reader support, focus trap in modal

**Acceptance Criteria**

_Structural:_
- AC-3.3.a: Results are grouped by category when multiple categories have matches
- AC-3.3.b: Search terms are highlighted in result snippets
- AC-3.3.c: Empty state, no-results state, and loading state all have dedicated UI

_Executable:_
- AC-3.3.d: Arrow keys navigate between results, Enter selects
- AC-3.3.e: Screen reader announces result count and navigation instructions
- AC-3.3.f: Loading state shows while index is being downloaded on first search

**Acceptance Tests**
- Test-3.3.a: Results for "media" show grouped results under Media category
- Test-3.3.b: Keyboard-only navigation works end-to-end (open modal → type → arrow → enter → page navigates)
- Test-3.3.c: Accessibility audit passes (no critical a11y violations in search modal)

**Verification Commands**
```bash
# Build and check for accessibility attributes
pnpm build:prod
grep -r "aria-label" docs/src/modules/components/Search* --include="*.tsx" --include="*.js" | head -5
```

---

## Phase 4: Testing & Deploy Integration
**Purpose:** Ensure the complete search system works end-to-end in production, including automated reindexing on deploy. Cannot start until Phase 3 delivers a working search UI.

### 4.1 E2E Test Coverage
Write comprehensive end-to-end tests for the search functionality.

**Implementation Details**
- Update existing E2E tests in `test/e2e-website/material-docs.spec.ts` or create new search-specific test file
- Test scenarios: open search via keyboard, type query, verify results appear, click result and verify navigation
- Test category filtering: select a category, verify results are filtered
- Test edge cases: empty query, very long query, special characters, no results
- Test on multiple viewport sizes (desktop, tablet, mobile)
- Ensure tests work against the static export (not dev server)

**Acceptance Criteria**

_Structural:_
- AC-4.1.a: E2E test file exists with at least 8 test cases covering core search flows

_Executable:_
- AC-4.1.b: All E2E tests pass against the built static site
- AC-4.1.c: Tests cover: open, query, results, navigation, filtering, empty states

**Acceptance Tests**
- Test-4.1.a: `pnpm test:e2e` passes all search-related tests
- Test-4.1.b: Tests run in under 60 seconds

**Verification Commands**
```bash
# Run E2E tests for search
pnpm test:e2e --grep "search" 2>&1 | tail -20
```

---

### 4.2 Deploy Pipeline Verification
Verify the complete build → index → deploy pipeline works end-to-end with SST.

**Implementation Details**
- Run a full `sst deploy` (or `pnpm deploy`) and verify search works on the deployed site
- Verify index files are present in the S3 bucket alongside the static site
- Verify CloudFront serves index files with correct content-type and caching headers
- Test search on all deployed domains (stoked-ui.com, stokedconsulting.com, stokedui.com)
- Document the deploy pipeline flow in a brief runbook
- Ensure index files get proper cache-control headers (should be cacheable but invalidated on deploy)

**Acceptance Criteria**

_Structural:_
- AC-4.2.a: Deploy runbook exists documenting the build → index → deploy flow

_Executable:_
- AC-4.2.b: `sst deploy` completes successfully with search index included
- AC-4.2.c: Search works on the production deployed site
- AC-4.2.d: Index files are served with correct content-type headers

**Acceptance Tests**
- Test-4.2.a: After deploy, visiting stoked-ui.com and pressing Cmd+K opens working search
- Test-4.2.b: Search for "MediaViewer" returns relevant results on the live site
- Test-4.2.c: Index files are present in S3 bucket under the expected path

**Verification Commands**
```bash
# Deploy and verify
pnpm deploy --profile stoked 2>&1 | tail -20
# Check index files in S3 (adjust bucket name)
aws s3 ls s3://[bucket-name]/pagefind/ --profile stoked | head -5
```

---

### 4.3 Cleanup & Documentation
Remove legacy Algolia code and document the new search system.

**Implementation Details**
- Remove `@docsearch/react` and any other Algolia packages from all `package.json` files
- Remove or archive the old `AppSearch.js` file (after confirming no code references it)
- Remove Algolia-specific CSS (`@docsearch/css` if present)
- Remove Algolia meta tags from `Head.tsx`
- Clean up any Algolia environment variables or configuration
- Update any documentation that references the old search setup
- Add a brief README section about how search works and how to debug it

**Acceptance Criteria**

_Structural:_
- AC-4.3.a: No Algolia packages in any `package.json` across the monorepo
- AC-4.3.b: No Algolia imports in any active source files
- AC-4.3.c: Search system documentation exists

_Executable:_
- AC-4.3.d: `pnpm install` completes without Algolia packages
- AC-4.3.e: Full build succeeds with zero Algolia references
- AC-4.3.f: Search continues to work after cleanup

**Acceptance Tests**
- Test-4.3.a: `grep -r "algolia\|docsearch" packages/ docs/src/ --include="*.ts" --include="*.tsx" --include="*.js"` returns no matches
- Test-4.3.b: `grep -r "docsearch\|algolia" package.json docs/package.json` returns no matches
- Test-4.3.c: Build and search still work after all cleanup

**Verification Commands**
```bash
# Verify no Algolia remnants
! grep -rq "algolia\|docsearch" docs/package.json package.json && echo "Clean"
! grep -rq "@docsearch" docs/src/ --include="*.ts" --include="*.tsx" --include="*.js" && echo "Clean"
# Full build still works
pnpm build:prod 2>&1 | tail -5
```

---

## 3. Completion Criteria
The project is considered complete when:
- All phase acceptance criteria pass
- All acceptance tests are green (verified by executing test commands, not just reading code)
- All Verification Commands from every work item exit 0
- Full project build succeeds (`pnpm build:prod`)
- Search works on all deployed domains (stoked-ui.com, stokedconsulting.com, stokedui.com)
- Search index is automatically rebuilt on every deploy with zero manual steps
- No Algolia dependencies remain in the codebase
- E2E tests pass for all search flows
- No open P0 or P1 issues remain

---

## 4. Rollout & Validation
### Rollout Strategy
- Deploy to a preview/staging URL first for manual testing
- Verify search works on staging before promoting to production
- Deploy to production across all domains simultaneously (single SST deploy)
- No feature flags needed — search replaces existing non-functional search

### Post-Launch Validation
- Manually test 10 common search queries on production
- Verify Cmd+K shortcut works across Chrome, Firefox, Safari
- Monitor CloudFront logs for 404s on index files
- Check page load performance (Core Web Vitals) to ensure no regression from search bundle

---

## 5. Open Questions
1. Should the old AppSearch.js be archived in the repo or deleted entirely?
2. What cache-control policy should index files use? (Recommend: same as other static assets with CloudFront invalidation on deploy)
3. Should search results include code examples from API docs, or just page titles and descriptions?
4. Is there a preference for the search results UI style (current DocSearch-like modal vs. inline dropdown)?
5. Should the index include draft/unpublished content that may exist in the docs/data directory?
