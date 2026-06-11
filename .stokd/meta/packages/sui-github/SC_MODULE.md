# SC_MODULE — sui-github

**Meta version:** 0.4.0
**Last refreshed:** 2026-06-06 (timed refresh — re-verified against source: barrel, file tree, LOC, cache constants, dispatch chain, handler cache headers, and docs-app wiring all confirmed unchanged)
**Module name:** `@stoked-ui/github`
**Package location:** `packages/sui-github/`
**Package version:** `0.1.0-alpha.11.3`
**Barrel:** `src/index.ts` (components + handler factories + server helpers + types)
**Sibling docs:** `.stokd/meta/packages/sui-github/SC_TEST.md`

---

## Responsibility

Provides React UI components and server-safe helpers for surfacing GitHub activity in Stoked UI applications. Four primary responsibilities:

1. **Contribution calendar** — renders a year-scoped GitHub contribution heatmap for any user. Supports either a server-side proxy (GraphQL via mounted handler) or a public, token-free fallback to `github-contributions-api.jogruber.de`. Includes `punch` / `highlight` SVG hover effects and responsive block sizing.
2. **Events browser** — fetches, caches, filters, paginates, and renders GitHub public events with a master/detail layout. The events list classifies every event type (`event.type.replace('Event','')`), but the detail panel only has dedicated renderers for **Push, PullRequest, Issues, IssueComment, Create, Delete**; any other type (including Fork and Projects v2) falls through to a raw `JsonFallbackView` (`JSON.stringify` in a `<pre>`). The PR renderer includes a tabbed detail view (commits + file diffs).
3. **Commit detail view** — renders a single commit's contributor card, message, file changes, aggregate stats, and compact diff. Supports direct fetch, proxy fetch, or a snapshot payload (private-repo display).
4. **Branch comparison view** — renders a base↔head compare with status badge, contributors, commit list, file changes, aggregate stats, and compact diff. Same direct/proxy/snapshot triad as `GithubCommit`.

Design intent: a portfolio/activity display module that splits browser components from token-bearing data fetchers, so an app can keep `GITHUB_TOKEN` server-side via an `apiUrl` proxy without forking component code.

---

## Public Interfaces / Entry Points

All exports are surfaced from `src/index.ts`.

### React components

| Export | File | Purpose |
|---|---|---|
| `GithubCalendar` | `src/GithubCalendar/GithubCalendar.tsx` | Contribution heatmap (`githubUser`, `apiUrl?`, `windowMode?`, `containerMode?`, `blockSize?`, `fx?`, `startImage?`) |
| `GithubEvents` | `src/GithubEvents/GithubEvents.tsx` | Events browser (`githubUser`, `githubToken?`, `apiUrl?`, `eventsPerPage?`, `hideMetadata?`) |
| `GithubCommit` | `src/GithubCommit/GithubCommit.tsx` | Single-commit detail (`owner`, `repo`, `ref`, `apiUrl?`, `private?`, `data?`) |
| `GithubBranch` | `src/GithubBranch/GithubBranch.tsx` | Branch compare (`owner`, `repo`, `base`, `head`, `apiUrl?`, `private?`, `data?`) |

### Handler factories (route adapters)

| Export | File | Purpose |
|---|---|---|
| `createGithubContributionsHandler` | `src/apiHandlers/createGithubContributionsHandler.ts` | Next.js-style handler; reads `username`/`from`/`to`, resolves `GITHUB_TOKEN` server-side, returns calendar payload |
| `createGithubEventsHandler` | `src/apiHandlers/createGithubEventsHandler.ts` | Next.js-style handler; reads `username` plus filter/pagination params, returns events payload |
| `createGithubCommitHandler` | `src/apiHandlers/createGithubCommitHandler.ts` | Handler returning normalized commit data |
| `createGithubBranchHandler` | `src/apiHandlers/createGithubBranchHandler.ts` | Handler returning normalized branch-compare data |

### Server-safe data helpers

| Export | File | Returns |
|---|---|---|
| `getGithubContributions` | `src/apiHandlers/getGithubContributions.ts` | `GithubContributionsResponse` (GitHub GraphQL → calendar shape) |
| `getGithubEvents` / `githubEventsQuery` | `src/apiHandlers/getGithubEvents.ts` | Paginated events payload with derived `repositories` / `actionTypes` |
| `getCommitDetails` | `src/apiHandlers/getCommitDetails.ts` | `GithubCommitData` |
| `getBranchCompareDetails` | `src/apiHandlers/getBranchCompareDetails.ts` | `GithubBranchData` |
| `getPullRequestDetails` | `src/apiHandlers/getPullRequestDetails.ts` | `PullRequestDetails \| RequestError \| null` (PR metadata + commits + file diffs) |

### Type exports

`EventsQuery`, `GithubBranchData`, `GithubCommitData`, `GithubFileHighlight` (re-exported from `src/types/github.ts`).

> The barrel re-exports the handler/helper set through `src/apiHandlers/index.ts`. Both `src/index.ts` and `src/apiHandlers/index.ts` are the publishable contract — verify the two stay in sync.

### Internal helpers (not exported but contracts to know)

`src/apiHandlers/githubApi.ts` — shared REST utilities: `fetchGithubResource`, `parseGithubDiff`, `normalizeGithubFile`, `normalizeGithubCommit`, `buildGithubContributors`, `summarizeGithubStats`, `getGithubMessageSummary`, `getGithubShortRef`, plus `GITHUB_TOKEN` header handling, the `DEFAULT_DIFF_LINE_LIMIT = 24` diff cap, and rate-limit detection.

---

## Products

- **`SC_PRODUCT_STOKED_UI_SUI.md`** — `@stoked-ui/sui` umbrella product. The docs site registers a `github` product (`productId: github`) whose MDX lives under `docs/data/github/docs/{overview,github-calendar,github-events,github-commit,github-branch,roadmap}/*.md` and whose demos (`GithubCalendarDemo`, `GithubEventsDemo`, `GithubCommitDemo` + `GithubCommitApiDemo` / `GithubCommitRuntimeDemo`, `GithubBranchDemo`) import directly from `@stoked-ui/github`.

---

## Views

From `.stokd/meta/SC_VIEWS.md` § 14 — "GitHub Package Views":

- **14.1 GithubEvents** — master/detail events browser with an event-type filter, date-range picker, repo autocomplete, event list/table, pagination, and a sticky `MetadataDisplay` sidebar (PR diff, push commits, issue details; raw `JsonFallbackView` for unhandled types).
- **14.2 GithubCalendar** — full-year contribution heatmap rendered via `react-activity-calendar`.
- **14.3 GithubBranch** — branch compare with status badge (ahead/behind/diverged/identical), `GithubContributorsList`, `FileChanges`, and embedded `PullRequestView`.
- **14.4 GithubCommit** — single-commit summary with contributor card, file changes, and compact diff view.
- **14.5 PullRequestView** — tabbed PR detail (Commits / Files changed) used inside `GithubEvents` and embedded in `GithubBranch`.

Also materially shapes the marketing showcase row at `/github/` (`HeroGithub` in `docs/src/components/home/HeroGithub.tsx` — listed in SC_VIEWS § 2 view table).

---

## Integration Points

### Upstream runtime dependencies

| Dependency | Role |
|---|---|
| `react-activity-calendar` ^2.7.10 | SVG heatmap rendering in `GithubCalendar` |
| `@octokit/request-error` ^6.1.8, `@octokit/types` ^14.0.0 | Error and response typing for GitHub API; `RequestError` returned (not thrown) by `getPullRequestDetails` |
| `date-fns` ^3.0.0, `date-fns-tz` ^3.2.0 | Date formatting and `America/Chicago` TZ handling in events |
| `react-hook-form` + `@hookform/resolvers` + `@hookform/error-message` + `yup` | Form handling inside event detail forms |
| `react-router-dom` ^6.21.3, `lodash` ^4.17.23 | Declared deps used by view components/utilities |
| `@stoked-ui/common` (workspace `0.1.3-a.0`) | `useResize`, `useResizeWindow` hooks for `GithubCalendar` sizing |
| MUI (`@mui/base`, `@mui/system`, `@mui/utils`; peers `@mui/material`, `@mui/icons-material`) | Theming, layout primitives, contributor avatars/chips |
| `react-json-view` ^1.21.3 | **Declared dependency but no longer imported by `src/`.** The raw-payload view is now the in-package `JsonFallbackView` (`GithubEvents.tsx`), so this dep is currently dead weight and a candidate for removal. |

### External API contracts

| Endpoint | Used by | Token |
|---|---|---|
| `https://github-contributions-api.jogruber.de/v4/{user}?yr=last` | `GithubCalendar` (no `apiUrl`) | None |
| `https://api.github.com/graphql` (contributionsCollection) | `getGithubContributions` | **Required** `GITHUB_TOKEN` |
| `https://api.github.com/users/{user}/events` | `getGithubEvents` / `githubEventsQuery` | Optional |
| `https://api.github.com/repos/{owner}/{repo}/commits/{ref}` | `getCommitDetails` / `GithubCommit` direct | Optional |
| `https://api.github.com/repos/{owner}/{repo}/compare/{base}...{head}` | `getBranchCompareDetails` / `GithubBranch` direct | Optional |
| `https://api.github.com/repos/{owner}/{repo}/pulls/{n}` (+ `/commits`, `/files`) | `getPullRequestDetails` | Optional |

### Downstream / proxy seam

`GithubCalendar`, `GithubEvents`, `GithubCommit`, `GithubBranch`, and `PullRequestEvent` all accept an `apiUrl` prop. This is the contract a host app implements (typically a Next.js route under `docs/pages/api/github/*`) to keep `GITHUB_TOKEN` off the wire. The handler factories are the canonical implementation — query string shapes (`username`, `from`, `to`, `page`, `per_page`, `repo`, `action`, `date`, `description`, `owner`, `repo`, `ref`, `base`, `head`) must stay aligned between component and handler.

The docs app wires all four factories one-to-one:

| Route | Factory | Success `Cache-Control` |
|---|---|---|
| `docs/pages/api/github/contributions.ts` | `createGithubContributionsHandler()` | `s-maxage=3600, stale-while-revalidate=86400` |
| `docs/pages/api/github/events.ts` | `createGithubEventsHandler()` | `s-maxage=300, stale-while-revalidate=3600` |
| `docs/pages/api/github/commit.ts` | `createGithubCommitHandler()` | `s-maxage=300, stale-while-revalidate=3600` |
| `docs/pages/api/github/branch.ts` | `createGithubBranchHandler()` | `s-maxage=300, stale-while-revalidate=3600` |

All four reject non-GET with `405` + `Allow: GET`, map missing required params to `400`, and map upstream/query failures to `502`.

### Workspace integration

Consumed by the docs app at `docs/data/github/docs/**` (demos and MDX) and surfaced through the docs site routing manifest as the `github` product.

---

## Key Source Files

| File | Why it matters |
|---|---|
| `src/index.ts` | Single barrel — components + handler factories + server helpers + types |
| `src/apiHandlers/index.ts` | Re-export hub for the handler/helper set the barrel forwards |
| `src/GithubCalendar/GithubCalendar.tsx` (~464 LOC) | Calendar component; payload normalization, responsive block sizing, SVG `punch`/`highlight` animation that mutates `react-activity-calendar` DOM directly |
| `src/GithubEvents/GithubEvents.tsx` (~1,377 LOC) | Core events pipeline: quota-aware localStorage cache (key `github_events_<username>` where `<username>` is lowercased, 8h TTL, `CACHE_PERSIST_LIMITS = [200,150,100,50,25]` truncation, `get/set/removeStorageItem` wrappers; sessionStorage de-dup), filters, pagination, master/detail rendering, `processEvents` switch + detail-panel renderer dispatch (`PullRequest → Push → Delete → Create → Issues → IssueComment → JsonFallbackView`, around `GithubEvents.tsx:1355`), `JsonFallbackView` for unhandled types |
| `src/GithubEvents/EventTypes/PullRequest/` | PR row (`PullRequestEvent`) + `PullRequestView` (tabbed) + `CommitsList` + `FileChanges` (`@mui/x-tree-view` diff viewer) — full PR detail surface |
| `src/GithubEvents/EventTypes/{Push,Issues,IssueComment,Create,Delete}Event.tsx` | Per-event-type renderers currently wired into the detail panel |
| `src/GithubEvents/EventTypes/{Fork,ProjectsV2,ProjectsV2Column,ProjectsV2Field,ProjectsV2Item}Event.tsx` | Renderer files that **exist but are not imported/wired** anywhere in `src/` — these types currently render via `JsonFallbackView` until wired |
| `src/GithubCommit/GithubCommit.tsx` (~171 LOC) | Commit detail; routes between direct fetch / `apiUrl` proxy / snapshot `data` |
| `src/GithubBranch/GithubBranch.tsx` (~175 LOC) | Branch compare; same direct/proxy/snapshot routing |
| `src/apiHandlers/githubApi.ts` (~226 LOC) | Shared REST plumbing: token headers, rate-limit detection (`x-ratelimit-remaining`), diff parsing (`DEFAULT_DIFF_LINE_LIMIT = 24`), file/commit normalization, contributor aggregation, stat summarization |
| `src/apiHandlers/getGithubContributions.ts` | GraphQL contribution fetch + week/day → calendar payload normalization |
| `src/apiHandlers/getGithubEvents.ts` | Paginates upstream events (up to 30 pages), applies repo/action/date/description filters, derives facet lists; exports `githubEventsQuery` + `EventsQuery` |
| `src/apiHandlers/getPullRequestDetails.ts` | One-call PR fetch (metadata + commits + parsed file diffs); used both client and server side |
| `src/apiHandlers/create*Handler.ts` | Thin route adapters (method gate, request validation, token resolution, error → status mapping: 400/404/405/500/502, `Cache-Control` headers). The contributions handler sets a long TTL (`s-maxage=3600, stale-while-revalidate=86400`); events/commit/branch use the shorter `s-maxage=300, stale-while-revalidate=3600`. |
| `src/components/GithubContributorsList.tsx` | Shared contributor-card list used by both commit and branch views |
| `src/components/fetchGithubViewData.ts` | Shared client fetcher used by `GithubCommit` / `GithubBranch` for `apiUrl`-mode loads |
| `src/types/github.ts` | Canonical types: `EventDetails`, `GitHubEvent`, `CachedData`, `GithubChangedFile`, `GithubContributor`, `GithubCommitData`, `GithubBranchData`, `GithubContributionsResponse`, `PullRequestDetails`, etc. |

---

## Change Impact

### Calendar (`GithubCalendar` / `getGithubContributions` / `createGithubContributionsHandler`)

- The calendar payload is shared across browser fallback, GraphQL fetch, and proxy responses — keep all three shape-compatible.
- `apiUrl` query string (`username`, optional `from`, `to`) is the contract with any mounted handler; renaming params breaks both sides.
- The `fx` system mutates `react-activity-calendar`'s SVG by cloning `rect` nodes and rebinding listeners. Upgrading `react-activity-calendar` may change the SVG structure and silently break `setupRectAnimations` (`querySelector('svg')` / `querySelectorAll('rect')`).
- Without `GITHUB_TOKEN`, GraphQL contributions fail; the public `jogruber.de` fallback is the only token-free path and may degrade to synthetic zero-data if the third party is unavailable.

### Events (`GithubEvents` / `getGithubEvents` / `createGithubEventsHandler`)

- `localStorage` cache key is `github_events_<username>` (username lowercased) with no version field — any change to `CachedData` shape requires a key bump or invalidation, or existing user caches will fail to parse. Writes are quota-aware: `persistCachedEvents` retries against `CACHE_PERSIST_LIMITS` and drops the key on `QuotaExceededError`.
- Adding a new GitHub event type that needs a rich detail view requires **two** dispatch updates: a `case` in `processEvents` (for list metadata/description/link) **and** a renderer arm in the detail-panel ternary near `GithubEvents.tsx:1355`, plus a matching file under `src/GithubEvents/EventTypes/`. Unhandled types degrade to `JsonFallbackView` rather than crashing.
- `Fork` and the `ProjectsV2*` renderers exist as files but are not wired — wiring them is purely additive (import + ternary arm).
- Client-side `filterEvents` and server-side filter logic in `githubEventsQuery` must stay in lockstep when an `apiUrl` is used.
- First load can fan out to up to 30 × 100 = 3,000 events worth of unauthenticated calls — expect rapid rate-limit exhaustion without a token-backed proxy.

### Commit / Branch (`GithubCommit`, `GithubBranch`, related fetchers)

- All three modes (direct, proxy, snapshot) must produce visually identical output — `GithubCommitData` / `GithubBranchData` are the contract.
- `githubApi.ts` diff parser caps at 24 lines per file (`DEFAULT_DIFF_LINE_LIMIT`); changing this affects every commit/branch/PR diff consistently — verify large-diff perf.
- Compare status strings (`ahead` / `behind` / `diverged` / `identical`) drive the badge in `GithubBranch`; renames must update both view and normalizer.

### Pull request details (`getPullRequestDetails`)

- Called from both browser (via `PullRequestEvent`) and server contexts; return shape changes hit both paths.
- `PullRequestEvent.tsx` imports `getPullRequestDetails` via the in-package relative path `../../../apiHandlers` (not an absolute monorepo path or the package alias) — keep imports relative within the package.
- Reads `process.env.GITHUB_TOKEN` directly inside the helper; in browser contexts without `apiUrl`, calls run unauthenticated.

### Types (`src/types/github.ts`)

- `EventDetails` is consumed by every event renderer — additive changes are safest; renames require a sweep through `EventTypes/*`.
- `PullRequestDetails` is the return type of `getPullRequestDetails` and is reshaped inside `PullRequestEvent` before reaching `PullRequestView`.
- `CachedData` is the on-disk localStorage schema — incompatible changes need a cache migration.

### SSR / build

- The raw-payload viewer is the in-package `JsonFallbackView` (`<pre>` + `JSON.stringify`) and is SSR-safe; `react-json-view` is no longer imported. If an SSR-unsafe dependency is reintroduced, it must be loaded via `next/dynamic` with `ssr: false` (see AX-MOD-GITHUB-007).
- Components rely on MUI theme context — consumers without an MUI `ThemeProvider` see degraded styling.

### Validation checklist when this module changes

- Build the package: `pnpm --filter @stoked-ui/github build`.
- Type check: `pnpm --filter @stoked-ui/github typescript`.
- Smoke the demo pages under `docs/data/github/docs/**` against a live or proxied data source (docs site on port 5199).
- If touching the cache or filters, manually clear `localStorage.github_events_*` to retest cold load.
- If touching SVG `fx`, re-test on resize and after navigating away/back to verify listeners rebind.

---

## Testing Posture

Current coverage is **0%** of this package's source — files under `test/` are MUI scaffolding boilerplate (Dialog/Menu/Select/Table) that exercise none of `src/`. The pure helpers in `src/apiHandlers/githubApi.ts` and the server fetchers/handlers are the highest-ROI test targets. See `.stokd/meta/packages/sui-github/SC_TEST.md` for the full strategy, fixtures, and prioritized cases.
