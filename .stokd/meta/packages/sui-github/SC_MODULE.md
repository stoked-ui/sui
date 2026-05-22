# SC_MODULE — sui-github

**Meta version:** 0.4.0
**Module name:** `@stoked-ui/github`
**Package location:** `packages/sui-github/`
**Package version:** `0.1.0-alpha.11.3`
**Barrel:** `src/index.ts` (components + handler factories + server helpers + types)
**Sibling docs:** `.stokd/meta/packages/sui-github/SC_TEST.md`

---

## Responsibility

Provides React UI components and server-safe helpers for surfacing GitHub activity in Stoked UI applications. Four primary responsibilities:

1. **Contribution calendar** — renders a year-scoped GitHub contribution heatmap for any user. Supports either a server-side proxy (GraphQL via mounted handler) or a public, token-free fallback to `github-contributions-api.jogruber.de`. Includes `punch` / `highlight` SVG hover effects and responsive block sizing.
2. **Events browser** — fetches, caches, filters, paginates, and renders GitHub public events (push, pull request, issues, comments, create, delete, fork, Projects v2). Includes a master/detail layout with a tabbed pull-request detail view (commits + file diffs).
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

### Internal helpers (not exported but contracts to know)

`src/apiHandlers/githubApi.ts` — shared REST utilities: `fetchGithubResource`, `parseGithubDiff`, `normalizeGithubFile`, `normalizeGithubCommit`, `buildGithubContributors`, `summarizeGithubStats`, `getGithubMessageSummary`, `getGithubShortRef`, plus `GITHUB_TOKEN` header handling and rate-limit detection.

---

## Products

- **`SC_PRODUCT_STOKED_UI_SUI.md`** — `@stoked-ui/sui` umbrella product. The docs site registers a `github` product (`productId: github`) whose MDX lives under `docs/data/github/docs/{overview,github-calendar,github-events,github-commit,github-branch}/*.md` and whose demos (`GithubCalendarDemo`, `GithubEventsDemo`, `GithubCommitDemo`, `GithubBranchDemo`) import directly from `@stoked-ui/github`.

---

## Views

From `.stokd/meta/SC_VIEWS.md` § 14 — "GitHub Package Views":

- **14.1 GithubEvents** — master/detail events browser with filter toolbar, event list, and contextual detail panel (PR diff, push commits, issue details). Detail panel hides below 813 px.
- **14.2 GithubCalendar** — full-year contribution heatmap rendered via `react-activity-calendar`.
- **14.3 GithubBranch** — branch compare with status badge (ahead/behind/diverged/identical), `GithubContributorsList`, `FileChanges`, and embedded `PullRequestView`.
- **14.4 GithubCommit** — single-commit summary with contributor card, file changes, and compact diff view.
- **14.5 PullRequestView** — tabbed PR detail (Commits / Files changed) used inside `GithubEvents` and embedded in `GithubBranch`.

Also materially shapes the marketing showcase row at `/github/` (`HeroGithub` in `docs/src/components/showcase/HeroGithub.tsx` — listed in SC_VIEWS § 2).

---

## Integration Points

### Upstream runtime dependencies

| Dependency | Role |
|---|---|
| `react-activity-calendar` ^2.7.10 | SVG heatmap rendering in `GithubCalendar` |
| `@octokit/request-error` ^6.1.8, `@octokit/types` ^14.0.0 | Error and response typing for GitHub API |
| `date-fns` ^3.0.0, `date-fns-tz` ^3.2.0 | Date formatting and `America/Chicago` TZ handling in events |
| `react-json-view` ^1.21.3 | Raw event payload viewer (dynamically imported, SSR-disabled) |
| `react-hook-form` + `@hookform/resolvers` + `yup` | Form handling inside event detail forms |
| `@stoked-ui/common` (workspace) | `useResize`, `useResizeWindow` hooks for `GithubCalendar` sizing |
| MUI (`@mui/base`, `@mui/system`, `@mui/material`, `@mui/icons-material`) | Theming, layout primitives, contributor avatars/chips |

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

`GithubCalendar`, `GithubEvents`, `GithubCommit`, `GithubBranch`, and `PullRequestEvent` all accept an `apiUrl` prop. This is the contract a host app implements (typically a Next.js route under `docs/pages/api/*`) to keep `GITHUB_TOKEN` off the wire. The handler factories are the canonical implementation — query string shapes (`username`, `from`, `to`, `page`, `per_page`, `repo`, `action`, `date`, `description`, `owner`, `repo`, `ref`, `base`, `head`) must stay aligned between component and handler.

### Workspace integration

Consumed by the docs app at `docs/data/github/docs/**` (demos and MDX) and surfaced through the docs site routing manifest as the `github` product.

---

## Key Source Files

| File | Why it matters |
|---|---|
| `src/index.ts` | Single barrel — components + handler factories + server helpers + types |
| `src/GithubCalendar/GithubCalendar.tsx` (464 LOC) | Calendar component; payload normalization, responsive block sizing, SVG `punch`/`highlight` animation that mutates `react-activity-calendar` DOM directly |
| `src/GithubEvents/GithubEvents.tsx` (1,377 LOC) | Core events pipeline: cache (localStorage `github_events_<username>`, 8h TTL; sessionStorage de-dup), filters, pagination, master/detail rendering, dispatcher to `EventTypes/*` |
| `src/GithubEvents/EventTypes/PullRequest/` | PR row + `PullRequestView` (tabbed) + `FileChanges` (`@mui/x-tree-view` diff viewer) — full PR detail surface |
| `src/GithubEvents/EventTypes/{Push,Issues,IssueComment,Create,Delete,Fork,ProjectsV2*}Event.tsx` | Per-event-type renderers; new event types must add a `case` here and in `processEvents` |
| `src/GithubCommit/GithubCommit.tsx` | Commit detail; routes between direct fetch / `apiUrl` proxy / snapshot `data` |
| `src/GithubBranch/GithubBranch.tsx` | Branch compare; same direct/proxy/snapshot routing |
| `src/apiHandlers/githubApi.ts` | Shared REST plumbing: token headers, rate-limit detection (`x-ratelimit-remaining`), diff parsing (24-line cap), file/commit normalization, contributor aggregation, stat summarization |
| `src/apiHandlers/getGithubContributions.ts` | GraphQL contribution fetch + week/day → calendar payload normalization |
| `src/apiHandlers/getGithubEvents.ts` | Paginates upstream events (up to 10 × 100), applies repo/action/date/description filters, derives facet lists |
| `src/apiHandlers/getPullRequestDetails.ts` | One-call PR fetch (metadata + commits + parsed file diffs); used both client and server side |
| `src/apiHandlers/create*Handler.ts` | Thin route adapters (request validation, token resolution, error → status mapping: 400/404/500/502, cache headers) |
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

- `localStorage` cache key is `github_events_<username>` with no version field — any change to `CachedData` shape requires a key bump or invalidation, or existing user caches will fail to parse.
- Adding a new GitHub event type requires a new `case` in `processEvents` **and** a matching renderer under `src/GithubEvents/EventTypes/`.
- Client-side `filterEvents` and server-side filter logic in `githubEventsQuery` must stay in lockstep when an `apiUrl` is used.
- First load can fan out to 10 × 100 = 1,000 unauthenticated calls — expect rapid rate-limit exhaustion without a token-backed proxy.

### Commit / Branch (`GithubCommit`, `GithubBranch`, related fetchers)

- All three modes (direct, proxy, snapshot) must produce visually identical output — `GithubCommitData` / `GithubBranchData` are the contract.
- `githubApi.ts` diff parser caps at 24 lines per file (`DEFAULT_DIFF_LINE_LIMIT`); changing this affects every commit/branch/PR diff consistently — verify large-diff perf.
- Compare status strings (`ahead` / `behind` / `diverged` / `identical`) drive the badge in `GithubBranch`; renames must update both view and normalizer.

### Pull request details (`getPullRequestDetails`)

- Called from both browser (via `PullRequestEvent`) and server contexts; return shape changes hit both paths.
- `PullRequestEvent.tsx` historically imported via an absolute monorepo path rather than the package alias — verify the import path before moving the file.
- Reads `process.env.GITHUB_TOKEN` directly; in browser contexts without `apiUrl`, calls run unauthenticated.

### Types (`src/types/github.ts`)

- `EventDetails` is consumed by every event renderer — additive changes are safest; renames require a sweep through `EventTypes/*`.
- `PullRequestDetails` is the return type of `getPullRequestDetails` and is reshaped inside `PullRequestEvent` before reaching `PullRequestView`.
- `CachedData` is the on-disk localStorage schema — incompatible changes need a cache migration.

### SSR / build

- `react-json-view` is dynamically imported with `next/dynamic` and `ssr: false`; removing the guard causes hydration errors.
- Components rely on MUI theme context — consumers without an MUI `ThemeProvider` see degraded styling.

### Validation checklist when this module changes

- Build the package: `pnpm --filter @stoked-ui/github build`.
- Type check: `pnpm --filter @stoked-ui/github typescript`.
- Smoke the four demo pages under `docs/data/github/docs/**` against a live or proxied data source.
- If touching the cache or filters, manually clear `localStorage.github_events_*` to retest cold load.
- If touching SVG `fx`, re-test on resize and after navigating away/back to verify listeners rebind.
