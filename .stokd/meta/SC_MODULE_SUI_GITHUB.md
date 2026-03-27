# SC_MODULE_SUI_GITHUB

**Meta version:** 0.2.0
**Package:** `@stoked-ui/github`
**Location:** `packages/sui-github/`
**Package version:** `0.0.0-a.0` (early alpha)

---

## Responsibility

Provides React UI components for surfacing GitHub activity data. The module has two primary responsibilities:

1. **Contribution calendar** — renders a heatmap calendar of GitHub contribution history for a single hardcoded user (`brian-stoker`), sourced from the third-party `github-contributions-api.jogruber.de` service. Supports interactive visual effects (`punch`, `highlight`) and responsive block sizing.

2. **Events browser** — fetches, caches, filters, paginates, and renders a detailed view of GitHub public events (pushes, pull requests, issues, comments, creates, deletes, forks, Projects v2 changes) for a configurable GitHub user. Includes a master/detail layout with a full pull-request detail view (commits list + file diff viewer).

This module is primarily a **personal portfolio / developer-profile display module** — the calendar is tied to a specific user and the events component functions as a developer activity feed, not a general-purpose GitHub integration.

---

## Public Interfaces / Entry Points

### Package exports (`src/index.ts`)

```ts
export { GithubCalendar, GithubEvents };
```

### `GithubCalendar` — `src/GithubCalendar/GithubCalendar.tsx`

```tsx
<GithubCalendar
  windowMode?: boolean        // size blocks relative to window width
  containerMode?: boolean     // size blocks relative to container width
  blockSize?: number          // fixed block size (default: 12)
  fx?: 'punch' | 'highlight'  // hover animation mode
  startImage?: string         // image injected at calendar start position
/>
```

- Fetches contribution data from `https://github-contributions-api.jogruber.de/v4/brian-stoker?yr=last`
- **Hardcoded to user `brian-stoker`** — not configurable via props
- Adapts to MUI `theme.palette.mode` for light/dark coloring
- Scrolls calendar to the most recent week on mount
- Hooks: `useResize` and `useResizeWindow` from `@stoked-ui/common`

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
- Exports `githubEventsQuery` and `getEvents` as named exports (used when `apiUrl` is omitted)

### `getPullRequestDetails` — `src/apiHandlers/getPullRequestDetails.ts`

```ts
getPullRequestDetails({ owner, repo, pull_number }): Promise<PullRequestDetails | RequestError | null>
```

Fetches PR metadata, commits list, and file-level diffs (with parsed addition/deletion/context lines) from the GitHub REST API. Reads `process.env.GITHUB_TOKEN` if present.

### `githubEventsQuery` — `src/GithubEvents/GithubEvents.tsx` (named export)

```ts
githubEventsQuery({ query: EventsQuery, githubUser, githubToken? }): Promise<{
  events, total, repositories, actionTypes, page, per_page, total_pages,
  total_fetched_events, max_pages_fetched
}>
```

Fetches and filters events directly from the GitHub REST API (up to 30 pages). Can be called server-side.

---

## Products

No product docs files were provided for this generation run. The docs site registers a `github` product (`productId: github`) documented at:

- `docs/data/github/docs/overview/overview.md`
- `docs/data/github/docs/github-calendar/github-calendar.md`
- `docs/data/github/docs/github-events/github-events.md`

Demo components live at:
- `docs/data/github/docs/github-calendar/GithubCalendarDemo.tsx`
- `docs/data/github/docs/github-events/GithubEventsDemo.tsx`

---

## Views

No SC_VIEWS.md reference was available during generation. This module renders two primary view surfaces in the docs site:

- **GitHub Calendar view** — full-year contribution heatmap, used in portfolio/about pages
- **GitHub Events view** — master/detail events browser with filter toolbar, event list table, and contextual detail panel (PR diff, push commits, issue details)

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
| `https://github-contributions-api.jogruber.de/v4/brian-stoker?yr=last` | `GithubCalendar` | None |
| `https://api.github.com/users/{user}/events` | `githubEventsQuery` | Optional `GITHUB_TOKEN` |
| `https://api.github.com/repos/{owner}/{repo}/pulls/{number}` | `getPullRequestDetails` | Optional `GITHUB_TOKEN` |
| `https://api.github.com/repos/{owner}/{repo}/pulls/{number}/commits` | `getPullRequestDetails` | Optional `GITHUB_TOKEN` |
| `https://api.github.com/repos/{owner}/{repo}/pulls/{number}/files` | `getPullRequestDetails` | Optional `GITHUB_TOKEN` |

### Downstream / proxy API surface

`GithubEvents` and `PullRequestEvent` accept an `apiUrl` prop that proxies calls through a custom backend endpoint (e.g., a Next.js API route under `docs/pages/api/*`). This decouples the browser from direct GitHub API access when a token must be kept server-side.

### Peer dependencies (workspace)

`@stoked-ui/common`, `@stoked-ui/file-explorer`, `@stoked-ui/media`, `@stoked-ui/timeline` — declared as peers but only `@stoked-ui/common` (`useResize`, `useResizeWindow`) is actively imported.

---

## Key Source Files

| File | Why it matters |
|---|---|
| `src/index.ts` | Package entry — exports `GithubCalendar` and `GithubEvents` |
| `src/GithubCalendar/GithubCalendar.tsx` | Full calendar component; contains hardcoded `brian-stoker` fetch URL, responsive block sizing logic, and `punch`/`highlight` SVG animation system |
| `src/GithubEvents/GithubEvents.tsx` | Core events browser; owns the full fetch/cache/filter/paginate/render pipeline; exports `githubEventsQuery` and `GetEventsParams` |
| `src/apiHandlers/getPullRequestDetails.ts` | Standalone PR detail fetcher; called both client-side and server-side; handles commits + file diffs in one function |
| `src/types/github.ts` | Canonical type definitions: `EventDetails`, `GitHubEvent`, `CachedData`, `PullRequestDetails` |
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

- The hardcoded `brian-stoker` API URL means any changes to fetch logic affect only that user's calendar display
- The `fx` animation system directly mutates SVG DOM nodes by cloning `rect` elements and re-attaching event listeners — changes here can silently break the animation on resize or remount
- `react-activity-calendar` version upgrades may change the rendered SVG structure, breaking the `querySelector('svg')` / `querySelectorAll('rect')` selectors in `setupRectAnimations`

### When `GithubEvents` changes

- The localStorage cache key is `github_events_<username>` — changing the format or structure of cached data requires a cache version bump or invalidation strategy, or existing user caches will fail to parse
- The `processEvents` function maps raw `GitHubEvent` to `DisplayEventDetails`; adding new event types requires a corresponding `case` in the `switch` block and a matching event renderer under `src/GithubEvents/EventTypes/`
- Filter state is all client-side against the in-memory cache; the `filterEvents` function must stay consistent with `githubEventsQuery`'s server-side filter logic when `apiUrl` is used
- The `apiUrl` prop is a seam for server-side proxying — changes to the query string shape (`page`, `per_page`, `repo`, `action`, `date`, `description`) must be mirrored in any backend proxy implementation

### When `getPullRequestDetails` changes

- The function is called both client-side (from `PullRequestEvent`) and can be called server-side — changes to its return shape affect both paths
- `PullRequestEvent.tsx` line 13 imports via an absolute monorepo path (`packages/sui-github/src/apiHandlers`) rather than a package alias — this is fragile and will break if the file is moved

### When types change (`src/types/github.ts`)

- `EventDetails` is consumed by every event renderer (`PushEvent`, `IssuesEvent`, `IssueCommentEvent`, `CreateEvent`, `DeleteEvent`, `ForkEvent`, PR events)
- `PullRequestDetails` is the return type of `getPullRequestDetails` and is transformed in `PullRequestEvent` before being passed to `PullRequestView`
- `CachedData` defines the localStorage schema — changing it without a migration breaks cached sessions

### GitHub API rate limiting

- Without `GITHUB_TOKEN`, all fetches are unauthenticated (60 req/hour limit)
- `GithubCalendar` uses a third-party proxy (`jogruber.de`) — if that service changes or goes down, the calendar silently falls back to empty `defaultActivityData`
- `GithubEvents` fetches up to 10 pages × 100 events = 1,000 API calls on first load; this will hit unauthenticated rate limits quickly

### Build / SSR

- `react-json-view` is dynamically imported (`next/dynamic`, `ssr: false`) — removing this guard will cause SSR hydration errors
- The package uses `process.env.GITHUB_TOKEN` directly in `getPullRequestDetails.ts`, which is only available server-side in Next.js — calling this function from a browser context without `apiUrl` will not have the token
