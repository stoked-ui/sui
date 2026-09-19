# SC_MODULE_SUI_GITHUB

**Meta version:** 0.2.0
**Package:** `@stoked-ui/github`
**Location:** `packages/sui-github/`
**Package version:** `0.1.0` (prerelease base)

---

## Responsibility

Provides React UI components for surfacing GitHub activity data. The module has four primary responsibilities:

1. **Contribution calendar** — renders a heatmap calendar of GitHub contribution history for a configurable GitHub user. The component supports either a server-side `apiUrl` proxy backed by GitHub GraphQL or a direct public fallback to `github-contributions-api.jogruber.de`. Supports interactive visual effects (`punch`, `highlight`) and responsive block sizing.

2. **Events browser** — fetches, caches, filters, paginates, and renders a detailed view of GitHub public events (pushes, pull requests, issues, comments, creates, deletes, forks, Projects v2 changes) for a configurable GitHub user. Includes a master/detail layout with a full pull-request detail view (commits list + file diff viewer).

3. **Commit detail view** — renders a single commit with contributor identity, commit message, changed files, aggregate stats, and a compact diff view. Supports direct public GitHub fetching, server-side proxy routes, and static snapshot rendering for private repos.

4. **Branch comparison view** — compares a head branch against a base branch and renders contributors, commit list, changed files, aggregate stats, and compact diffs. Supports direct public GitHub fetching, server-side proxy routes, and static snapshot rendering for private branch data.

This module is primarily a **personal portfolio / developer-profile display module**, but the calendar, events, commit, and branch components now expose reusable user/api seams (`githubUser`, `apiUrl`) so an app can host the data source server-side without forking the component code.

---

## Public Interfaces / Entry Points

### Package exports (`src/index.ts`)

```ts
export {
  GithubBranch,
  GithubCalendar,
  GithubCommit,
  GithubEvents,
  createGithubBranchHandler,
  createGithubCommitHandler,
  getBranchCompareDetails,
  getCommitDetails,
  createGithubContributionsHandler,
  createGithubEventsHandler,
  getGithubContributions,
  getGithubEvents,
  githubEventsQuery,
  getPullRequestDetails,
};
```

### `GithubCalendar` — `src/GithubCalendar/GithubCalendar.tsx`

```tsx
<GithubCalendar
  githubUser: string          // required: GitHub username for contribution history
  apiUrl?: string             // optional: server-side proxy endpoint for GitHub GraphQL
  windowMode?: boolean        // size blocks relative to window width
  containerMode?: boolean     // size blocks relative to container width
  blockSize?: number          // fixed block size (default: 12)
  fx?: 'punch' | 'highlight'  // hover animation mode
  startImage?: string         // image injected at calendar start position
/>
```

- Fetches contribution data from `apiUrl?username={githubUser}` when `apiUrl` is supplied
- Falls back to `https://github-contributions-api.jogruber.de/v4/{githubUser}?yr=last` for public-only usage when `apiUrl` is omitted
- Adapts to MUI `theme.palette.mode` for light/dark coloring
- Scrolls calendar to the most recent week on mount
- Hooks: `useResize` and `useResizeWindow` from `@stoked-ui/common`

### `getGithubContributions` — `src/apiHandlers/getGithubContributions.ts`

```ts
getGithubContributions({ githubUser, githubToken?, from?, to? }): Promise<GithubContributionsResponse>
```

Fetches contribution calendar data from GitHub GraphQL and normalizes it to the shape consumed by `GithubCalendar`.

### `createGithubContributionsHandler` — `src/apiHandlers/createGithubContributionsHandler.ts`

```ts
createGithubContributionsHandler(config?): (req, res) => Promise<void>
```

Creates a thin server handler that reads `username` (and optional `from` / `to`) from the request query, resolves `GITHUB_TOKEN` server-side, and returns normalized calendar data for framework routes such as Next.js `pages/api/*`.

### `GithubEvents` — `src/GithubEvents/GithubEvents.tsx`

```tsx
<GithubEvents
  githubUser: string          // required: GitHub username to fetch events for
  githubToken?: string        // optional: GitHub PAT to increase rate limit
  apiUrl?: string             // optional: proxy API URL (bypasses direct GitHub API calls)
  eventsPerPage?: number      // default: 40
  hideMetadata?: boolean      // hides the detail panel
/>
```

- Fetches up to 10 pages × 100 events/page from GitHub public events API
- **Caching:** `localStorage` keyed `github_events_<username>`, 8-hour TTL; `sessionStorage` prevents redundant refetches within a session
- **Filters:** repository, action type, date range (today / yesterday / week / month), description keyword
- **Pagination:** client-side from in-memory/cached events
- Accepts `apiUrl` for a server-side proxy route that receives `username` plus filter query params
- Re-exports `githubEventsQuery`; internal `getEvents` uses the shared server-safe helper when `apiUrl` is omitted

### `getGithubEvents` / `githubEventsQuery` — `src/apiHandlers/getGithubEvents.ts`

```ts
githubEventsQuery({ query: EventsQuery, githubUser, githubToken? }): Promise<{
  events, total, repositories, actionTypes, page, per_page, total_pages,
  total_fetched_events, max_pages_fetched
}>
```

Fetches public GitHub events from the REST API, paginates upstream correctly, applies client-visible filters in memory, and is reusable from both browser code and server handlers.

### `createGithubEventsHandler` — `src/apiHandlers/createGithubEventsHandler.ts`

```ts
createGithubEventsHandler(config?): (req, res) => Promise<void>
```

Creates a thin server handler that reads `username` plus filter/pagination query params, resolves `GITHUB_TOKEN` server-side, and returns the same payload shape consumed by `GithubEvents`.

### `GithubCommit` — `src/GithubCommit/GithubCommit.tsx`

```tsx
<GithubCommit
  owner: string              // required GitHub owner/org
  repo: string               // required repository name
  ref: string                // required commit SHA or ref
  apiUrl?: string            // optional proxy endpoint
  private?: boolean          // render from provided snapshot data only
  data?: GithubCommitData    // optional pre-fetched/snapshot payload
/>
```

Renders a commit summary, contributor card, changed files, and compact diff view. If `apiUrl` is omitted, it fetches directly from GitHub REST.

### `getCommitDetails` — `src/apiHandlers/getCommitDetails.ts`

```ts
getCommitDetails({ owner, repo, ref }): Promise<GithubCommitData>
```

Fetches a single commit from GitHub REST, normalizes author identity, file changes, compact diff lines, and summary stats used by `GithubCommit`.

### `GithubBranch` — `src/GithubBranch/GithubBranch.tsx`

```tsx
<GithubBranch
  owner: string              // required GitHub owner/org
  repo: string               // required repository name
  base: string               // required base branch/ref
  head: string               // required head branch/ref
  apiUrl?: string            // optional proxy endpoint
  private?: boolean          // render from provided snapshot data only
  data?: GithubBranchData    // optional pre-fetched/snapshot payload
/>
```

Renders branch comparison status, contributors, commits, changed files, and compact diffs. If `apiUrl` is omitted, it fetches directly from GitHub REST compare endpoints.

### `getBranchCompareDetails` — `src/apiHandlers/getBranchCompareDetails.ts`

```ts
getBranchCompareDetails({ owner, repo, base, head }): Promise<GithubBranchData>
```

Fetches a branch comparison from GitHub REST and normalizes compare status, contributors, commits, file changes, compact diffs, and aggregate stats used by `GithubBranch`.

### `getPullRequestDetails` — `src/apiHandlers/getPullRequestDetails.ts`

```ts
getPullRequestDetails({ owner, repo, pull_number }): Promise<PullRequestDetails | RequestError | null>
```

Fetches PR metadata, commits list, and file-level diffs (with parsed addition/deletion/context lines) from the GitHub REST API. Reads `process.env.GITHUB_TOKEN` if present.

---

## Products

No product docs files were provided for this generation run. The docs site registers a `github` product (`productId: github`) documented at:

- `docs/data/github/docs/overview/overview.md`
- `docs/data/github/docs/github-calendar/github-calendar.md`
- `docs/data/github/docs/github-events/github-events.md`
- `docs/data/github/docs/github-commit/github-commit.md`
- `docs/data/github/docs/github-branch/github-branch.md`

Demo components live at:
- `docs/data/github/docs/github-calendar/GithubCalendarDemo.tsx`
- `docs/data/github/docs/github-events/GithubEventsDemo.tsx`
- `docs/data/github/docs/github-commit/GithubCommitDemo.tsx`
- `docs/data/github/docs/github-branch/GithubBranchDemo.tsx`

---

## Views

No SC_VIEWS.md reference was available during generation. This module renders four primary view surfaces in the docs site:

- **GitHub Calendar view** — full-year contribution heatmap, used in portfolio/about pages
- **GitHub Events view** — master/detail events browser with filter toolbar, event list table, and contextual detail panel (PR diff, push commits, issue details)
- **GitHub Commit view** — single-commit summary with contributor card plus compact diff/file list
- **GitHub Branch view** — branch compare summary with contributor list, commit list, and compact diff/file list

Both views are responsive: the metadata/detail panel hides below 813px.

---

## Integration Points

### Upstream dependencies

| Dependency | Role |
|---|---|
| `react-activity-calendar` ^2.7.10 | Renders the contribution heatmap SVG in `GithubCalendar` |
| `@octokit/request-error` ^6.1.8 | Error typing for GitHub API failures |
| `@octokit/types` ^14.0.0 | TypeScript types for GitHub API responses |
| `date-fns` ^3.0.0 + `date-fns-tz` | Date formatting and timezone conversion (America/Chicago) |
| `react-json-view` ^1.21.3 | Raw event payload viewer (dynamically imported, SSR-safe) |
| `@mui/x-tree-view` | `SimpleTreeView` / `TreeItem` used in `FileChanges.tsx` |
| `@stoked-ui/common` | `useResize`, `useResizeWindow` hooks |
| `next/dynamic` | SSR-safe dynamic import for `react-json-view` |

### External API contracts

| Endpoint | Used by | Auth |
|---|---|---|
| `https://github-contributions-api.jogruber.de/v4/{user}?yr=last` | `GithubCalendar` fallback | None |
| `https://api.github.com/graphql` | `getGithubContributions` / `createGithubContributionsHandler` | Required `GITHUB_TOKEN` |
| `https://api.github.com/users/{user}/events` | `getGithubEvents` / `githubEventsQuery` / `createGithubEventsHandler` | Optional `GITHUB_TOKEN` |
| `https://api.github.com/repos/{owner}/{repo}/commits/{ref}` | `getCommitDetails` / `GithubCommit` | Optional `GITHUB_TOKEN` |
| `https://api.github.com/repos/{owner}/{repo}/compare/{base}...{head}` | `getBranchCompareDetails` / `GithubBranch` | Optional `GITHUB_TOKEN` |
| `https://api.github.com/repos/{owner}/{repo}/pulls/{number}` | `getPullRequestDetails` | Optional `GITHUB_TOKEN` |
| `https://api.github.com/repos/{owner}/{repo}/pulls/{number}/commits` | `getPullRequestDetails` | Optional `GITHUB_TOKEN` |
| `https://api.github.com/repos/{owner}/{repo}/pulls/{number}/files` | `getPullRequestDetails` | Optional `GITHUB_TOKEN` |

### Downstream / proxy API surface

`GithubCalendar`, `GithubEvents`, and `PullRequestEvent` accept an `apiUrl` prop that proxies calls through a custom backend endpoint (e.g., a Next.js API route under `docs/pages/api/*`). This decouples the browser from direct GitHub API access when a token must be kept server-side.

### Peer dependencies (workspace)

`@stoked-ui/common`, `@stoked-ui/file-explorer`, `@stoked-ui/media`, `@stoked-ui/timeline` — declared as peers but only `@stoked-ui/common` (`useResize`, `useResizeWindow`) is actively imported.

---

## Key Source Files

| File | Why it matters |
|---|---|
| `src/index.ts` | Package entry — exports calendar/events/commit/branch components plus reusable server helpers |
| `src/GithubCalendar/GithubCalendar.tsx` | Full calendar component; accepts `githubUser` / `apiUrl`, normalizes contribution payloads, computes responsive block sizing, and applies `punch`/`highlight` SVG animation |
| `src/GithubCommit/GithubCommit.tsx` | Commit detail surface; supports direct fetch, proxy-backed fetch, and snapshot rendering |
| `src/GithubBranch/GithubBranch.tsx` | Branch compare surface; supports direct fetch, proxy-backed fetch, and snapshot rendering |
| `src/apiHandlers/getGithubContributions.ts` | Server-side GitHub GraphQL contribution fetcher; normalizes weeks/days into the calendar payload consumed by `GithubCalendar` |
| `src/apiHandlers/createGithubContributionsHandler.ts` | Thin route factory that lets apps mount a Next.js-style contributions endpoint while keeping handler logic in the package |
| `src/GithubEvents/GithubEvents.tsx` | Core events browser; owns the cache/filter/paginate/render pipeline and delegates fetches to the shared events query helper |
| `src/apiHandlers/getGithubEvents.ts` | Shared GitHub events query helper; fetches upstream pages, applies filters, and returns the normalized list payload used by browser and server code |
| `src/apiHandlers/createGithubEventsHandler.ts` | Thin route factory that lets apps mount a token-backed Next.js-style events endpoint without exposing the token to the browser |
| `src/apiHandlers/getCommitDetails.ts` | Commit fetcher that normalizes a single commit into the reusable `GithubCommitData` shape |
| `src/apiHandlers/getBranchCompareDetails.ts` | Compare fetcher that normalizes branch compare responses into the reusable `GithubBranchData` shape |
| `src/apiHandlers/githubApi.ts` | Shared GitHub REST utilities for commit/compare normalization, rate-limit handling, contributor aggregation, and compact diff parsing |
| `src/components/GithubContributorsList.tsx` | Shared contributor-card list used by commit and branch views |
| `src/apiHandlers/getPullRequestDetails.ts` | Standalone PR detail fetcher; called both client-side and server-side; handles commits + file diffs in one function |
| `src/types/github.ts` | Canonical type definitions for events, contributions, commit/branch payloads, cached data, and PR details |
| `src/GithubEvents/EventTypes/PullRequest/PullRequestEvent.tsx` | PR event row renderer; orchestrates `getPRDetails` fetch (with `apiUrl` support) and renders `PullRequestView` |
| `src/GithubEvents/EventTypes/PullRequest/PullRequestView.tsx` | Tabbed PR detail view: "Commits" tab via `CommitsList`, "Files changed" tab via `FileChanges` |
| `src/GithubEvents/EventTypes/PullRequest/FileChanges.tsx` | Diff viewer using `@mui/x-tree-view` + styled `DiffView`/`DiffLine` with GitHub-style green/red coloring |
| `src/GithubEvents/EventTypes/PushEvent.tsx` | Push event renderer with commit list |
| `src/GithubEvents/EventTypes/IssuesEvent.tsx` | Issue event renderer with label chips |
| `src/GithubEvents/EventTypes/IssueCommentEvent.tsx` | Issue comment event renderer |
| `src/GithubEvents/EventTypes/CreateEvent.tsx` | Branch/tag/repo creation event renderer |

---

## Change Impact

### When `GithubCalendar` changes

- The calendar payload shape is now shared across browser rendering and server-side proxy responses, so changes must stay compatible with both `GithubCalendar` and `createGithubContributionsHandler`
- Changes to the `apiUrl` query string shape (`username`, optional `from`, optional `to`) must stay aligned with any mounted backend route using `createGithubContributionsHandler`
- The `fx` animation system directly mutates SVG DOM nodes by cloning `rect` elements and re-attaching event listeners — changes here can silently break the animation on resize or remount
- `react-activity-calendar` version upgrades may change the rendered SVG structure, breaking the `querySelector('svg')` / `querySelectorAll('rect')` selectors in `setupRectAnimations`

### When `GithubEvents` changes

- The localStorage cache key is `github_events_<username>` — changing the format or structure of cached data requires a cache version bump or invalidation strategy, or existing user caches will fail to parse
- The `processEvents` function maps raw `GitHubEvent` to `DisplayEventDetails`; adding new event types requires a corresponding `case` in the `switch` block and a matching event renderer under `src/GithubEvents/EventTypes/`
- Filter state is all client-side against the in-memory cache; the `filterEvents` function must stay consistent with `githubEventsQuery`'s server-side filter logic when `apiUrl` is used
- The `apiUrl` prop is a seam for server-side proxying — changes to the query string shape (`username`, `page`, `per_page`, `repo`, `action`, `date`, `description`) must be mirrored in any backend proxy implementation

### When `getPullRequestDetails` changes

- The function is called both client-side (from `PullRequestEvent`) and can be called server-side — changes to its return shape affect both paths
- `PullRequestEvent.tsx` line 13 imports via an absolute monorepo path (`packages/sui-github/src/apiHandlers`) rather than a package alias — this is fragile and will break if the file is moved

### When types change (`src/types/github.ts`)

- `EventDetails` is consumed by every event renderer (`PushEvent`, `IssuesEvent`, `IssueCommentEvent`, `CreateEvent`, `DeleteEvent`, `ForkEvent`, PR events)
- `PullRequestDetails` is the return type of `getPullRequestDetails` and is transformed in `PullRequestEvent` before being passed to `PullRequestView`
- `CachedData` defines the localStorage schema — changing it without a migration breaks cached sessions

### GitHub API rate limiting

- Without `GITHUB_TOKEN`, all fetches are unauthenticated (60 req/hour limit)
- `getGithubContributions` depends on GitHub GraphQL and will fail without a server-side token; the mounted proxy route should surface this clearly
- `GithubCalendar` can still use the third-party public fallback (`jogruber.de`) when `apiUrl` is omitted; if that service changes or goes down, the calendar falls back to synthetic zero-data
- `GithubEvents` fetches up to 10 pages × 100 events = 1,000 API calls on first load; this will hit unauthenticated rate limits quickly

### Build / SSR

- `react-json-view` is dynamically imported (`next/dynamic`, `ssr: false`) — removing this guard will cause SSR hydration errors
- The package uses `process.env.GITHUB_TOKEN` directly in `getPullRequestDetails.ts`, which is only available server-side in Next.js — calling this function from a browser context without `apiUrl` will not have the token
