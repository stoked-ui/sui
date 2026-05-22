# Testing Strategy: `@stoked-ui/github`

**Package:** `packages/sui-github`
**Priority:** Medium
**Stack:** TypeScript + React 18 + MUI 5 + native `fetch`
**Current Coverage:** 0% — files under `test/` are MUI boilerplate (Dialog/Menu/Select/Table/etc.) and exercise none of this package's source

---

## 1. What Should Be Tested

### 1.1 Critical Paths

| Area | Source | Why Critical |
|------|--------|-------------|
| `fetchGithubResource` / `parseGithubDiff` / `normalizeGithubFile` / `normalizeGithubCommit` / `buildGithubContributors` / `summarizeGithubStats` | `src/apiHandlers/githubApi.ts` | Pure helpers shared by every commit/branch/PR fetcher — bugs here cascade into every consumer |
| `getGithubContributions` | `src/apiHandlers/getGithubContributions.ts` | Drives `GithubCalendar` — GraphQL query, date-range coercion, contribution-level mapping, total label |
| `getCommitDetails` | `src/apiHandlers/getCommitDetails.ts` | Single-commit normalizer — short ref, summary, contributor, files, stats |
| `getBranchCompareDetails` | `src/apiHandlers/getBranchCompareDetails.ts` | Compare endpoint — status, ahead/behind, contributors, file diffs |
| `getPullRequestDetails` | `src/apiHandlers/getPullRequestDetails.ts` | Three sequential REST calls (PR + commits + files), diff parsing, rate-limit detection, `RequestError` returns |
| `githubEventsQuery` | `src/apiHandlers/getGithubEvents.ts` | Multi-page event fetch (up to 30 pages), `Link` header pagination, dedup, repo/action/date/description filtering, derived facets |
| `createGithubEventsHandler` | `src/apiHandlers/createGithubEventsHandler.ts` | Next.js API seam — keeps `GITHUB_TOKEN` server-side, validates `username`, maps errors to 400/502 |
| `createGithubBranchHandler` / `createGithubCommitHandler` / `createGithubContributionsHandler` | `src/apiHandlers/*.ts` | Same handler pattern: method gate, param validation, cache headers, error mapping |
| `processEvents` | `src/GithubEvents/GithubEvents.tsx:381` | Transforms raw `GitHubEvent[]` into `DisplayEventDetails[]` — date formatting (`America/Chicago`), per-type routing, error resilience |
| `filterEvents` | `src/GithubEvents/GithubEvents.tsx:502` | Client-side combined repo/action/description/date filter |
| `getEventDescription` | `src/GithubEvents/GithubEvents.tsx:525` | Type-to-description mapping used by description filter |
| `getFilteredDate` | `src/GithubEvents/GithubEvents.tsx:539` | Cutoff date for `today` / `yesterday` / `week` / `month` |
| `ErrorDetails` | `src/GithubEvents/GithubEvents.tsx:232` | Renders `RequestError`, plain-string, and unknown error shapes |
| Cache layer | `src/GithubEvents/GithubEvents.tsx` (`persistCachedEvents`, `updateCachedEventsTimestamp`, etc.) | localStorage-backed cache with truncation + timestamp refresh; falls back when storage write fails |

### 1.2 Edge Cases

- **`fetchGithubResource`** — 403 with `x-ratelimit-remaining: 0` ⇒ "rate limit" error including reset timestamp; 403 with remaining ⇒ raw body; non-JSON body; missing `User-Agent` header tolerated; `GITHUB_TOKEN` absent ⇒ no `Authorization` header.
- **`parseGithubDiff`** — undefined patch ⇒ `[]`; truncation sentinel appears only when over `maxLines`; lines beginning with `+`/`-` only at column 0 are addition/deletion (not `+++`/`---` headers — verify current behavior, since headers DO start with `+`/`-`).
- **`normalizeGithubFile`** — missing `filename` falls back to `path` then `'unknown'`; status `removed` ⇒ `deleted`; status `added` ⇒ `added`; everything else ⇒ `modified`; pre-supplied `diff` short-circuits patch parsing.
- **`normalizeGithubCommit` / `buildGithubContributors`** — anonymous commit (no `author`, only `commit.author`); identical login appearing in multiple commits aggregates contributions; sort is by contributions desc then `login` asc; `'Unknown author'` is upgraded if a later commit supplies a real name.
- **`summarizeGithubStats`** — empty array returns zeros; per-file `additions`/`deletions` undefined treated as `0` via `||`.
- **`getGithubMessageSummary` / `getGithubShortRef`** — empty message ⇒ `'Untitled commit'`; ref shorter than `length` returned as-is; empty ref ⇒ `''`.
- **`getGithubContributions`** — missing `githubUser` throws; missing `githubToken` (env unset) throws "GitHub token not configured"; `from > to` throws "must be before"; invalid date strings ignored (defaults applied); GraphQL `errors` array surfaced; missing `contributionCalendar` throws; same-year vs cross-year `countLabel`.
- **`getCommitDetails`** — missing params throw; commit with no `files`; `contributor` fallback when `buildGithubContributors` returns empty; multi-line message ⇒ summary uses first line.
- **`getBranchCompareDetails`** — missing params throw; `status` of `ahead`/`behind`/`diverged`/`identical`/missing; empty `commits`/`files` arrays; `total_commits` falls back to `commits.length`; URL fallback when `html_url` missing; encoded refs containing `/`.
- **`getPullRequestDetails`** — missing param ⇒ `RequestError(400)`; rate-limit 403 ⇒ thrown error with reset time; non-ok ⇒ thrown error with body; fetch failure ⇒ `RequestError(500)`; `file.status` mapping; empty `patch` ⇒ empty diff array.
- **`githubEventsQuery`** — pagination stops on empty page, on missing `Link: rel="next"`, and at 30-page cap; dedup by `event.id`; `action` filter strips trailing `Event`; `date: 'yesterday'` resets hours to start-of-day; `description` is case-insensitive substring; pagination math uses 1-based `pageNum`; combined filters compose; `total_pages` is ceil(filtered / per_page).
- **`createGithubEventsHandler`** — non-GET ⇒ 405 with `Allow: GET`; missing `username` ⇒ 400; array-valued query params take first element; `parseNumber` rejects ≤0 and non-finite; `getGithubToken` config override beats `process.env.GITHUB_TOKEN`; query error ⇒ 502 unless message contains "username is required" ⇒ 400; success sets `s-maxage=300, stale-while-revalidate=3600`.
- **`createGithubBranchHandler` / `createGithubCommitHandler`** — same method gate, param requirement (`owner/repo/base/head` or `owner/repo/ref`), and "Missing required parameters" → 400 vs upstream → 502 mapping.
- **`processEvents`** — null entries filtered; missing `created_at` produces error placeholder; unknown `type` falls back to `type.replace('Event','')`; `payload` sub-fields missing on PR/Issue/Push handled.
- **`filterEvents`** — empty filters return input; combined filters intersect; description filter is case-insensitive.
- **`getFilteredDate`** — `today` is 00:00 of today; `yesterday` subtracts a day then resets to 00:00; `week`/`month` analogous; unknown ⇒ `null` (or epoch — verify against source).
- **Cache** — `persistCachedEvents` truncates to `normalizedLimit`; storage failure removes the key and warns; stale entry (>8h) ignored; corrupt JSON gracefully reset; session-level fetch dedup avoids parallel duplicate requests.
- **Event-type components** — every renderer in `src/GithubEvents/EventTypes/*` should return `null` (or a recognizable placeholder) when `event.payload` or expected sub-fields are missing.

### 1.3 Integration Points

- GitHub REST: `api.github.com/users/{user}/events`, `/repos/{owner}/{repo}/commits/{ref}`, `/repos/{owner}/{repo}/compare/{base}...{head}`, `/repos/{owner}/{repo}/pulls/{n}`, `/pulls/{n}/commits`, `/pulls/{n}/files`
- GitHub GraphQL: `api.github.com/graphql` (contribution calendar)
- `react-activity-calendar` SVG renderer in `GithubCalendar.tsx`
- `next/dynamic` to defer `react-json-view` (SSR-unsafe)
- `localStorage` / `sessionStorage` for event cache + dedup
- MUI theme integration via `@mui/material/styles` (`useTheme`, `styled`, `ThemeProvider`)
- `date-fns` / `date-fns-tz` for `America/Chicago` zoned formatting in `processEvents`
- `@stoked-ui/common` resize hooks (`useResize`, `useResizeWindow`) used by `GithubCalendar`
- `@octokit/request-error` `RequestError` returned (not thrown) by `getPullRequestDetails`

---

## 2. Test Framework and Tooling

### Recommended Stack

| Tool | Purpose | Rationale |
|------|---------|-----------|
| **Mocha + Chai + Sinon** | Test runner / assertions / spies | Matches the rest of this monorepo (`@mui-internal/test-utils`, `chai` is already a devDependency in `package.json:83`) — keeps tests runnable via the root `pnpm test` |
| **`@mui-internal/test-utils`** | `createRenderer`, `describeConformance` | `test/describeConformance.ts` already wires this up; sibling packages (`sui-editor`, `sui-file-explorer`) follow the same pattern |
| **JSDOM** (via root mocharc) | DOM environment | Already configured at the monorepo level |
| **`global.fetch` stub** (Sinon) | API mocking | All GitHub calls go through native `fetch` — no extra dependency needed |

> Do **not** introduce Jest in this package alone — it would diverge from the monorepo's Mocha-based runner and break aggregated `pnpm test`. The existing `test/` layout (`integration/`, `typescript/`, `umd/`) is the convention to follow once you replace the MUI boilerplate.

### Configuration

- Tests run from the monorepo root via Mocha; no per-package config is needed beyond glob inclusion.
- Add a per-package `tsconfig.test.json` only if test-only types diverge from `tsconfig.json`.
- Re-use `test/describeConformance.ts` for component conformance suites.

---

## 3. Test File Organization

Mirror the convention used by sibling packages (e.g. `packages/sui-editor/src/**/*.test.tsx`):

```
packages/sui-github/
├── src/
│   ├── apiHandlers/
│   │   ├── githubApi.test.ts
│   │   ├── getGithubContributions.test.ts
│   │   ├── getCommitDetails.test.ts
│   │   ├── getBranchCompareDetails.test.ts
│   │   ├── getPullRequestDetails.test.ts
│   │   ├── getGithubEvents.test.ts
│   │   ├── createGithubEventsHandler.test.ts
│   │   ├── createGithubBranchHandler.test.ts
│   │   ├── createGithubCommitHandler.test.ts
│   │   └── createGithubContributionsHandler.test.ts
│   ├── GithubEvents/
│   │   ├── GithubEvents.test.tsx          # ErrorDetails + cache + render integration
│   │   ├── processEvents.test.ts          # after extraction (see §7)
│   │   ├── filterEvents.test.ts           # after extraction
│   │   ├── getEventDescription.test.ts    # after extraction
│   │   ├── getFilteredDate.test.ts        # after extraction
│   │   └── EventTypes/
│   │       ├── PushEvent.test.tsx
│   │       ├── PullRequest/PullRequestEvent.test.tsx
│   │       ├── IssuesEvent.test.tsx
│   │       ├── IssueCommentEvent.test.tsx
│   │       ├── CreateEvent.test.tsx
│   │       ├── DeleteEvent.test.tsx
│   │       ├── ForkEvent.test.tsx
│   │       └── ProjectsV2*Event.test.tsx
│   ├── GithubCalendar/
│   │   └── GithubCalendar.test.tsx
│   ├── GithubBranch/
│   │   └── GithubBranch.test.tsx
│   ├── GithubCommit/
│   │   └── GithubCommit.test.tsx
│   └── components/
│       └── GithubContributorsList.test.tsx
└── test/
    ├── describeConformance.ts             # keep — already correct
    ├── fixtures/                          # NEW — shared mock data
    │   ├── githubEvents.ts
    │   ├── pullRequest.ts
    │   ├── compareResponse.ts
    │   ├── commitResponse.ts
    │   └── contributionGraphql.ts
    ├── integration/                       # delete MUI boilerplate
    ├── typescript/                        # delete MUI boilerplate (or replace with this package's type specs)
    └── umd/                               # delete unless an actual UMD bundle is built
```

### Naming Conventions

- `<ModuleName>.test.ts(x)` co-located with source.
- `describe('<ComponentOrFunction>', …)`, `it('<expected behavior> when <condition>', …)`.
- Shared fixtures live under `test/fixtures/` and export factory functions that accept `Partial<T>` overrides.

---

## 4. Mock/Stub Strategy

### 4.1 `fetch`

Stub the global with Sinon and reset between cases:

```ts
import sinon from 'sinon';

let fetchStub: sinon.SinonStub;

beforeEach(() => {
  fetchStub = sinon.stub(global, 'fetch');
});

afterEach(() => {
  fetchStub.restore();
});

function jsonResponse(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
}
```

Drive multi-call flows (`getPullRequestDetails`, `githubEventsQuery`) with `fetchStub.onCall(n).resolves(...)`.

### 4.2 Fixtures

```ts
// test/fixtures/githubEvents.ts
import type { GitHubEvent } from '../../src/types/github';

export function pushEvent(overrides: Partial<GitHubEvent> = {}): GitHubEvent {
  return {
    id: '1',
    type: 'PushEvent',
    repo: { name: 'owner/repo' },
    created_at: '2026-03-01T12:00:00Z',
    payload: { commits: [{ sha: 'abc', message: 'msg' }], head: 'abc', ref: 'refs/heads/main' },
    ...overrides,
  };
}
```

Provide analogous factories for `pullRequestEvent`, `issuesEvent`, `issueCommentEvent`, `createEvent`, `forkEvent`, plus raw GitHub REST payloads for compare/commit/PR endpoints.

### 4.3 `process.env.GITHUB_TOKEN`

```ts
const original = process.env.GITHUB_TOKEN;
afterEach(() => {
  if (original === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = original;
});
```

### 4.4 `next/dynamic`

`react-json-view` is loaded via `next/dynamic` inside `GithubEvents`. For component tests, stub the module:

```ts
import { mock } from 'node:test'; // or your loader of choice
// e.g. proxyquire / require-cache replacement
```

If a loader-based mock is awkward, render in a wrapper that does not exercise the JSON view, or extract the JSON-view section into its own component to isolate the test surface.

### 4.5 MUI Theme

```tsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
```

### 4.6 `@stoked-ui/common` Resize Hooks

```ts
sinon.stub(common, 'useResize').returns({ width: 800, height: 600 });
sinon.stub(common, 'useResizeWindow').returns([1024, () => {}]);
```

### 4.7 `react-activity-calendar`

Replace with a stub that exposes the props you assert on:

```tsx
jest.mock('react-activity-calendar', () => ({
  ActivityCalendar: (props: any) => (
    <div data-testid="activity-calendar" data-loading={String(!!props.loading)} data-count={props.data.length} />
  ),
}));
```

(Use the equivalent loader-mock helper if staying on Mocha-only.)

### 4.8 Storage

JSDOM provides `localStorage` / `sessionStorage`; clear them in `afterEach`:

```ts
afterEach(() => { localStorage.clear(); sessionStorage.clear(); });
```

### 4.9 Date / Time

Freeze the clock with Sinon for date-sensitive tests (`getFilteredDate`, `processEvents`, `toDateRange`):

```ts
const clock = sinon.useFakeTimers(new Date('2026-03-15T10:00:00Z').getTime());
afterEach(() => clock.restore());
```

Do **not** mock `date-fns` / `date-fns-tz` — they are pure and produce deterministic output.

### 4.10 Logging

`getGithubEvents.ts` and `getPullRequestDetails.ts` are noisy with `console.log` / `console.error`. Stub `console.log`/`console.error` per test to keep output clean and to assert on error logging when relevant.

---

## 5. Coverage Targets

Medium priority, prerelease (`0.1.0-alpha.x`). Bias toward pure-logic coverage; UI is secondary.

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Statements** | 70% | Pure helpers + handlers are highly testable |
| **Branches** | 60% | Many branches are error/rate-limit fallbacks — cover happy path + key error path |
| **Functions** | 65% | Repetitive event-type components share a pattern; sample, don't enumerate |
| **Lines** | 70% | Tracks statements |

### Coverage Exclusions

- `src/index.ts` and per-folder `index.ts` re-exports
- `styled(...)` declarations (visual-only)
- Debug `console.log`/`console.error` (cleanup-tracked separately)
- Legacy MUI boilerplate under `test/integration/` and `test/typescript/` once deleted

---

## 6. Priority Test Cases — Implement First

### Phase 1 — Pure helpers (highest ROI, no React)

#### 6.1 `githubApi.ts` — `src/apiHandlers/githubApi.ts`

```
describe('fetchGithubResource')
  it('hits api.github.com with default headers and no Authorization when GITHUB_TOKEN is unset')
  it('adds "token <value>" Authorization when GITHUB_TOKEN is set')
  it('throws "GitHub rate limit exceeded. Resets at <date>" on 403 with x-ratelimit-remaining=0')
  it('throws response body text on other non-ok statuses')
  it('returns parsed JSON on 200')

describe('parseGithubDiff')
  it('returns [] for undefined patch')
  it('classifies +/-/other as addition/deletion/context with sequential lineNumber')
  it('appends "... N more diff lines" sentinel when patch exceeds maxLines')
  it('respects custom maxLines')

describe('normalizeGithubFile')
  it('maps status "added" → type "added", "removed" → "deleted", default → "modified"')
  it('uses filename, then path, then "unknown"')
  it('passes through pre-supplied diff and skips parseGithubDiff')
  it('defaults additions/deletions to 0 when missing')

describe('normalizeGithubCommit')
  it('uses commit.sha as id and hash, falling back to node_id then login')
  it('builds author from commit.author then commit.commit.author')

describe('buildGithubContributors')
  it('aggregates contributions by login and sorts by count desc, login asc')
  it('upgrades "Unknown author" to a real name if a later commit has one')
  it('fills missing avatarUrl from a later commit')

describe('summarizeGithubStats')
  it('returns zeros for empty input')
  it('sums additions, deletions, and changedFiles')

describe('getGithubMessageSummary')
  it('returns first non-empty line trimmed')
  it('returns "Untitled commit" for empty/whitespace messages')

describe('getGithubShortRef')
  it('truncates to length when ref is longer')
  it('returns ref unchanged when shorter than length')
  it('returns "" for empty ref')
```

#### 6.2 `getCommitDetails.ts`

```
describe('getCommitDetails')
  it('throws "Missing required parameters" when owner/repo/ref missing')
  it('hits /repos/:owner/:repo/commits/:ref with encoded ref')
  it('returns repo, ref, shortRef, summary, message, committedAt, contributor, commits, files, stats')
  it('falls back to constructed html_url when API omits one')
  it('uses single-element commits array via normalizeGithubCommit')
  it('builds contributor fallback when buildGithubContributors returns []')
```

#### 6.3 `getBranchCompareDetails.ts`

```
describe('getBranchCompareDetails')
  it('throws on missing owner/repo/base/head')
  it('encodes base and head into the compare path')
  it('returns aheadBy/behindBy/totalCommits/status with sensible defaults when missing')
  it('aggregates contributors from compare.commits')
  it('returns empty arrays when commits/files are absent')
```

#### 6.4 `getPullRequestDetails.ts`

```
describe('getPullRequestDetails')
  it('returns RequestError(400) when owner/repo/pull_number is missing')
  it('issues three sequential fetches (pull, commits, files)')
  it('adds Authorization when GITHUB_TOKEN is set; omits otherwise')
  it('throws on 403 rate-limit with reset timestamp string')
  it('throws on non-ok with status and body')
  it('parses file.patch into typed diff lines (+/-/context)')
  it('maps file.status removed→deleted, added→added, default→modified')
  it('returns RequestError(500) on fetch rejection')
```

#### 6.5 `getGithubContributions.ts`

```
describe('getGithubContributions')
  it('throws when githubUser is missing')
  it('throws "GitHub token not configured" when no token in args or env')
  it('throws "must be before" when from > to')
  it('defaults to one-year window when from is invalid/missing')
  it('POSTs to api.github.com/graphql with Bearer token and User-Agent')
  it('throws GraphQL error message when payload.errors is non-empty')
  it('throws when contributionCalendar is missing')
  it('maps NONE/FIRST_/SECOND_/THIRD_/FOURTH_QUARTILE → 0..4')
  it('sorts contributions by date asc and groups totals by year')
  it('emits same-year vs cross-year countLabel')
```

#### 6.6 `getGithubEvents.ts` (`githubEventsQuery` + `parseLinkHeader`)

```
describe('parseLinkHeader')
  it('returns {} for null')
  it('extracts next and last urls')
  it('ignores other rel values')
  it('handles malformed entries')

describe('githubEventsQuery')
  it('paginates while Link rel="next" is present, up to maxPages=30')
  it('stops when a page returns []')
  it('dedupes events by id across pages')
  it('filters by repo.name when repo is provided')
  it('filters by type.replace("Event","") when action is provided')
  it('applies today/yesterday/week/month cutoff for date filter')
  it('case-insensitive substring match against derived description')
  it('paginates filtered results client-side using pageNum/perPage')
  it('returns repositories and actionTypes derived from ALL fetched events (not filtered)')
  it('throws on non-ok upstream response with status + body')
  it('passes Authorization "token <value>" only when githubToken provided')
```

### Phase 2 — Server handlers

#### 6.7 `createGithubEventsHandler`

```
describe('createGithubEventsHandler')
  it('returns 405 + Allow:GET for non-GET methods')
  it('returns 400 when username is missing')
  it('parses page/per_page with parseNumber fallback (1 / 40)')
  it('takes the first element when query value is array')
  it('uses config.getGithubToken result over process.env.GITHUB_TOKEN')
  it('sets Cache-Control "s-maxage=300, stale-while-revalidate=3600" on success')
  it('maps "username is required" error → 400, others → 502')
```

#### 6.8 `createGithubBranchHandler` / `createGithubCommitHandler` / `createGithubContributionsHandler`

```
describe('createGithubBranchHandler')
  it('returns 405 + Allow:GET on non-GET')
  it('returns 400 when any of owner/repo/base/head is missing')
  it('returns 200 + s-maxage cache header on success')
  it('maps "Missing required parameters" → 400, upstream errors → 502')

// Mirror the same shape for commit and contributions handlers
```

### Phase 3 — Component logic (after extraction; see §7)

#### 6.9 `processEvents`

```
describe('processEvents')
  it('returns [] for empty input')
  it('renders PushEvent with action "Push" and head SHA in url')
  it('renders PullRequestEvent with title and html_url')
  it('renders IssuesEvent with title and html_url')
  it('renders IssueCommentEvent with "Commented on issue:" prefix')
  it('formats date in America/Chicago timezone')
  it('falls back to type.replace("Event","") for unknown types')
  it('filters out null entries from malformed events')
  it('produces an error placeholder for events missing created_at')
```

#### 6.10 `filterEvents`

```
describe('filterEvents')
  it('returns input when all filters empty')
  it('intersects repo + action + description filters')
  it('applies date cutoff using getFilteredDate')
  it('description match is case-insensitive substring')
```

#### 6.11 `getEventDescription`

```
describe('getEventDescription')
  it('"Pushed N commits" for PushEvent with payload.commits')
  it('PR title for PullRequestEvent')
  it('issue title for IssuesEvent')
  it('"Commented on issue: <title>" for IssueCommentEvent')
  it('returns "" for unknown types')
  it('handles missing payload sub-fields without throwing')
```

#### 6.12 `getFilteredDate`

```
describe('getFilteredDate')
  it('returns 00:00 of today for "today"')
  it('returns 00:00 of yesterday for "yesterday"')
  it('returns 7 days ago at 00:00 for "week"')
  it('returns one month ago at 00:00 for "month"')
  it('returns null (or epoch) for unknown filter — assert against current behavior')
```

### Phase 4 — Component rendering

#### 6.13 `ErrorDetails` — `src/GithubEvents/GithubEvents.tsx:232`

```
describe('ErrorDetails')
  it('renders RequestError with message and status code')
  it('renders plain string error as message')
  it('renders "Unknown Error" placeholder for unrecognized shapes')
```

#### 6.14 Event-type components (one thorough, others smoke)

```
describe('PushEvent')
  it('renders branch name and commit count')
  it('lists each commit short SHA and message')
  it('returns null when payload is missing')

describe('PullRequestEvent')
  it('fetches PR details on mount and renders PullRequestView')
  it('skips fetch for closed/merged PRs and renders available info')
  it('renders ErrorDetails on RequestError result')

describe('CreateEvent / DeleteEvent / ForkEvent / IssuesEvent / IssueCommentEvent / ProjectsV2*')
  it('renders the expected ref / title / state without throwing on missing payload fields')
```

#### 6.15 `GithubCalendar` — `src/GithubCalendar/GithubCalendar.tsx`

```
describe('GithubCalendar')
  it('renders ActivityCalendar with loading=true initially')
  it('fetches contribution data via apiUrl seam when provided')
  it('falls back to direct GraphQL when apiUrl is omitted')
  it('passes theme colors derived from MUI palette.mode')
  it('uses inputBlockSize when provided; otherwise computes from window width or container width')
  it('auto-scrolls to the most recent week after loading')
  it('never passes an empty data set to ActivityCalendar')
```

#### 6.16 `GithubBranch`, `GithubCommit`, `GithubContributorsList`

```
describe('GithubBranch / GithubCommit')
  it('renders status, ahead/behind (branch) or short ref (commit), and contributors')
  it('renders empty-state when no commits')
  it('renders truncated diff with "+ N more lines" sentinel')

describe('GithubContributorsList')
  it('renders contributors sorted as built by buildGithubContributors')
  it('renders avatar fallbacks when avatarUrl is empty')
```

---

## 7. Refactoring Recommendations for Testability

`GithubEvents.tsx` is 1,377 lines and embeds nearly all of its logic as closures inside the component. Before (or alongside) writing tests:

1. **Extract pure functions** to `src/GithubEvents/utils.ts`:
   - `processEvents` (`GithubEvents.tsx:381`) — accept `timezone` as a parameter instead of hardcoding `'America/Chicago'`
   - `filterEvents` (`GithubEvents.tsx:502`) — accept filter values as arguments, not React state
   - `getEventDescription` (`GithubEvents.tsx:525`)
   - `getFilteredDate` (`GithubEvents.tsx:539`)
   - `buildFilterOptionsFromEvents` — return values rather than calling state setters
2. **Export `parseLinkHeader`** from `getGithubEvents.ts` so it can be unit-tested directly (currently file-local).
3. **Make `react-json-view` an optional peer** or guard the `next/dynamic` import behind a feature flag — the hard dependency on Next.js inside a generic component package complicates non-Next consumers and tests.
4. **Centralize `console.log`/`console.error`** behind a debug helper (or remove) so tests can silence/assert without per-test stubbing.
5. **Inject `fetch`** into `getGithubContributions` / `getPullRequestDetails` / `githubEventsQuery` (default to `globalThis.fetch`) — eliminates global-stubbing fragility and supports multiple fetch implementations (Edge runtime, undici).
6. **Split the cache layer** in `GithubEvents.tsx` (`persistCachedEvents`, `updateCachedEventsTimestamp`, dedup via `sessionStorage`) into `src/GithubEvents/cache.ts` — currently it fights for visual real estate with rendering logic.

---

## 8. Existing Test Cleanup

The current `test/` directory contains MUI Joy/Material boilerplate copied during package scaffolding:

- `test/integration/` — `Dialog`, `Menu`, `MenuList`, `NestedMenu`, `PopperChildrenLayout`, `Select`, `TableCell`, `TableRow`. **None test this package.** Delete.
- `test/typescript/` — `OverridableComponent.spec.tsx`, `color-palette-prop.spec.tsx`, `colors.spec.ts`, `index.spec.tsx`, `styles.spec.tsx`, `moduleAugmentation/`. **None reference `@stoked-ui/github` types.** Delete or replace with this package's type-only specs.
- `test/umd/run.js` — UMD smoke test; this package does not ship a UMD bundle. Delete.
- `test/describeConformance.ts` — **keep**; reuse for `GithubBranch` / `GithubCommit` / `GithubCalendar` conformance suites once they exist.

After cleanup, fold real tests into `src/**/*.test.ts(x)` per §3.
