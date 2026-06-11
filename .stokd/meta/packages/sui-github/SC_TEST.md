# SC_TEST: sui-github (`@stoked-ui/github`)

> **Generated:** 2026-06-06 | **Meta version:** 0.4.0
> **Package:** `packages/sui-github` (`@stoked-ui/github` v0.1.0-alpha.11.3)
> **Priority:** Medium
> **Source entry (barrel):** `packages/sui-github/src/index.ts`
> See `.stokd/meta/packages/sui-github/SC_MODULE.md` for module classification and
> `packages/sui-github/.axioms.md` for the module invariants this strategy protects
> (`AX-MOD-GITHUB-001` … `AX-MOD-GITHUB-008`).
>
> All file paths, line numbers, exports, and test-stack conventions below were
> verified against the working tree on the generated date.

`@stoked-ui/github` is a set of **React components for rendering GitHub data**
(contribution calendar, event feed, commit and branch-compare views) plus a matching
set of **server-side fetchers and Next.js API handler factories** that keep
`GITHUB_TOKEN` off the client. The package has **zero meaningful test coverage today**:
everything under `test/` is MUI Joy/Material scaffolding boilerplate (`Dialog`, `Menu`,
`Select`, `Table`, `OverridableComponent`, `moduleAugmentation/…`) copied at package
creation — none of it imports `@stoked-ui/github` source. There are **no co-located
`src/**/*.test.*` files** and **no `test` script** in `package.json` (verified).

The package splits cleanly into four testable layers behind one barrel:

1. **Pure normalizers / parsers** — `src/apiHandlers/githubApi.ts` (the single source of
   truth for the `GithubCommitData` / `GithubBranchData` wire shape, per `AX-MOD-GITHUB-003`).
2. **Server fetchers** — `getGithubContributions`, `getCommitDetails`,
   `getBranchCompareDetails`, `getPullRequestDetails`, `githubEventsQuery`. Network I/O
   over native `fetch` (REST + one GraphQL call); token-bearing, **server-only** (`AX-MOD-GITHUB-006`).
3. **Handler factories** — `createGithub{Events,Branch,Commit,Contributions}Handler`. The
   Next.js API seam: method gate, param validation, error→status mapping, cache headers.
   Their query-string contract is symmetric with the components (`AX-MOD-GITHUB-002`).
4. **React components** — `GithubEvents` (1,377 LOC, embeds nearly all event logic + a
   localStorage cache), `GithubCalendar`, `GithubBranch`, `GithubCommit`,
   `GithubContributorsList`, and the per-type renderers under `GithubEvents/EventTypes/`.

### Source surface (verified LOC / line anchors)

| Module | File | LOC | Key exports / functions (line) |
|--------|------|-----|--------------------------------|
| Pure normalizers | `src/apiHandlers/githubApi.ts` | 226 | `fetchGithubResource` (`:33`), `parseGithubDiff` (`:59`), `normalizeGithubFile` (`:107`), `normalizeGithubCommit` (`:148`), `buildGithubContributors` (`:165`), `summarizeGithubStats` (`:201`), `getGithubMessageSummary` (`:216`), `getGithubShortRef` (`:220`); internal `getGithubHeaders` (`:19`), `toFileChangeType` (`:96`), `getGithubIdentity` (`:128`) |
| Contributions fetcher | `src/apiHandlers/getGithubContributions.ts` | 176 | default `getGithubContributions` (`:102`); internal `isValidDateInput` (`:57`), `toDateRange` (`:65`), `buildContributionTotals` (`:83`), `buildCountLabel` (`:91`), `CONTRIBUTION_LEVEL_MAP` (`:30`) |
| Commit fetcher | `src/apiHandlers/getCommitDetails.ts` | 56 | default `getCommitDetails` (`:18`) |
| Branch-compare fetcher | `src/apiHandlers/getBranchCompareDetails.ts` | 49 | default `getBranchCompareDetails` (`:17`) |
| PR fetcher | `src/apiHandlers/getPullRequestDetails.ts` | 121 | default `getPullRequestDetails` (`:4`) — returns (not throws) `RequestError` |
| Events query | `src/apiHandlers/getGithubEvents.ts` | 174 | `githubEventsQuery` (`:27`, also default `:174`), type `EventsQuery` (`:3`); **file-local** `parseLinkHeader` (`:12`, not exported) |
| Events handler | `src/apiHandlers/createGithubEventsHandler.ts` | 66 | default factory (`:29`); internal `getQueryValue` (`:20`), `parseNumber` (`:24`) |
| Branch handler | `src/apiHandlers/createGithubBranchHandler.ts` | 46 | default factory (`:20`) |
| Commit handler | `src/apiHandlers/createGithubCommitHandler.ts` | 45 | default factory (`:20`) |
| Contributions handler | `src/apiHandlers/createGithubContributionsHandler.ts` | 61 | default factory (`:24`) |
| Component fetch helper | `src/components/fetchGithubViewData.ts` | 15 | default `fetchGithubViewData` (`:1`) — `apiUrl` proxy fetch |
| Contributors list | `src/components/GithubContributorsList.tsx` | 65 | default `GithubContributorsList` (`:24`) |
| Event feed | `src/GithubEvents/GithubEvents.tsx` | 1,377 | default `GithubEvents`; exported `ErrorDetails` (`:232`); embedded `JsonFallbackView` (`:157`), `processEvents` (`:381`), `filterEvents` (`:502`), `getEventDescription` (`:525`), `getFilteredDate` (`:539`); cache `persistCachedEvents` (`:115`), `updateCachedEventsTimestamp` (`:138`); SSR-safe storage wrappers `getStorageItem` (`:65`), `setStorageItem` (`:74`), `removeStorageItem` (`:87`), `getStorageKeys` (`:95`) |
| Calendar | `src/GithubCalendar/GithubCalendar.tsx` | 464 | default `GithubCalendar` (`:126`); internal `buildApiUrl` (`:113`) |
| Branch view | `src/GithubBranch/GithubBranch.tsx` | 175 | default `GithubBranch` |
| Commit view | `src/GithubCommit/GithubCommit.tsx` | 171 | default `GithubCommit` |
| Wire types | `src/types/github.ts` | 196 | `GitHubEvent`, `EventDetails`, `CachedData`, `Github{ChangedFile,DiffLine,Contributor,CommitListItem,CommitStats,CommitData,BranchData,ContributionDay,ContributionsResponse}`, `PullRequestDetails`, `GithubFileHighlight` |
| Per-type renderers | `src/GithubEvents/EventTypes/**` | — | `PushEvent`, `DeleteEvent`, `CreateEvent`, `IssuesEvent`, `IssueCommentEvent`, `PullRequest/{PullRequestEvent,PullRequestView,CommitsList,FileChanges}`; **inert** `ForkEvent`, `ProjectsV2*Event` (exist but not wired — `AX-MOD-GITHUB-008`) |
| Barrel | `src/index.ts` | 19 | The public contract (see `AX-MOD-GITHUB-001`) |

> **Refresh note (2026-06-06):** the prior strategy referenced `react-json-view`
> loaded via `next/dynamic`. That dependency has been **removed from `src/`** — the raw
> payload panel is now the in-package, SSR-safe `JsonFallbackView` (`GithubEvents.tsx:157`,
> wired at `:1370`), which `JSON.stringify`s into a `<pre>`. `react-json-view` remains a
> dead entry in `package.json` and is a removal candidate. No `src/` file imports
> `next/dynamic` or `react-json-view` (verified). Any future SSR-unsafe dependency must
> still go behind `next/dynamic({ ssr: false })` per `AX-MOD-GITHUB-007`.

---

## 1. Framework & Tooling — use the umbrella Mocha runner

| Tool | Purpose | Why |
|------|---------|-----|
| **Mocha 10** | Test runner | The monorepo CI gate. Co-located `packages/**/*.test.{js,ts,tsx}` are picked up by root `pnpm test:unit` / `pnpm test:coverage` with **no per-package wiring**. |
| **Chai 4** | Assertions | Already a devDependency (`package.json:83`; `@types/chai:79`). |
| **Sinon 15** | Stubs / spies / fake timers | Resolves hoisted from the root (`sinon@15.2.0` verified at `node_modules/sinon`). Used to stub `global.fetch`, freeze the clock, silence `console`. |
| **`@stoked-ui/internal-test-utils`** | `createRenderer` (JSDOM-backed render/act), `describeConformance` | Already a devDependency (`package.json:78`); `test/describeConformance.ts` already wires it. Sibling browser packages (`sui-file-explorer`, `sui-editor`) follow the same pattern. |
| **JSDOM** | DOM + `localStorage` / `sessionStorage` | Provided by the root `.mocharc.js` `require` hook `@stoked-ui/internal-test-utils/setupJSDOM`. |

> **Do NOT introduce Jest here.** `@stoked-ui/github` is a **publishable** package; the
> root Mocha glob (`packages/**/*.test.{js,ts,tsx}`) would try to run any Jest spec and
> fail on Jest globals. Jest is reserved for `sui-media` / `sui-common` only (standalone
> stacks). Stay on Mocha + Chai + Sinon.

### devDependencies — already sufficient

`package.json` already carries `@stoked-ui/internal-test-utils`, `chai`, `@types/chai`,
`@types/react-transition-group`, `@types/prop-types`, and `typescript`. **Nothing must be
added** to start writing tests. `sinon` resolves from the root hoist; add an explicit
`"sinon": "^15.2.0"` only for hygiene if desired. Do **not** add `jest`, `ts-jest`,
`@types/jest`, or a `react-activity-calendar` stub package.

### Do NOT add a (broken) per-package `test` script

The browser-package family deliberately ships **no** `scripts.test` (verified:
`sui-github`, `sui-file-explorer`, `sui-editor`, `sui-timeline` all have
`scripts.test === undefined`). A naive `"test": "mocha 'src/**/*.test.{ts,tsx}'"` run from
`packages/sui-github/` would **fail** — Mocha resolves config from CWD and does not walk
up, so it would miss the root `.mocharc.js` `require` hooks (no Babel transform → TS/TSX
won't compile; no JSDOM → no DOM/`localStorage`). Run from the repo root instead:

```bash
# whole package
cross-env NODE_ENV=test mocha --config .mocharc.js 'packages/sui-github/src/**/*.test.{ts,tsx}'
# one file, focused
cross-env NODE_ENV=test mocha --config .mocharc.js 'packages/sui-github/src/apiHandlers/githubApi.test.ts'
```

The structural acceptance check for every axiom is also already wired:
`pnpm --filter @stoked-ui/github typescript` and `pnpm --filter @stoked-ui/github build`.

### TDD is mandatory (red → green)

Per `~/.stokd/SC_AXIOMS.md` §5, every behavioral change needs a test that is **observed
to fail before** the implementation and **pass after**. For this package that maps onto:
write the normalizer/handler/query test against a fixture, watch it go **red** (e.g. the
function doesn't yet handle the missing-`filename` fallback), implement, watch it go
**green**. Record the per-criterion pass/fail **outcome** (e.g. `red, green`) — not the
full output. Do not weaken a test to make a task look done.

---

## 2. What Should Be Tested

### Tier 1 — Pure normalizers (`src/apiHandlers/githubApi.ts`) — highest ROI, no I/O, no React

These are the single source of truth for the rendered shape (`AX-MOD-GITHUB-003`); a bug
here cascades into every commit/branch/PR view. Fully deterministic — test by direct call.

| Function | What to assert |
|----------|----------------|
| `fetchGithubResource` (`:33`) | default headers (`User-Agent`, `Accept`); adds `Authorization: token <v>` **iff** `process.env.GITHUB_TOKEN` set; 403 + `x-ratelimit-remaining: 0` → `"GitHub rate limit exceeded. Resets at …"` (reset epoch → localized date); other non-ok → response body text (or `GitHub API error: <status>`); 200 → parsed JSON. |
| `parseGithubDiff` (`:59`) | `undefined` patch → `[]`; lines starting `+`/`-` → `addition`/`deletion`, else `context`; sequential 1-based `lineNumber`; appends `"... N more diff lines"` sentinel only when `patchLines.length > maxLines`; custom `maxLines` honored. **Edge:** `+++`/`---` hunk headers also start with `+`/`-` and are classified as addition/deletion — assert the *current* behavior, don't assume header-stripping. |
| `normalizeGithubFile` (`:107`) | `filename` → `path` → `'unknown'` fallback chain; status `added`→`added`, `removed`→`deleted`, anything else→`modified`; pre-supplied `diff` short-circuits `parseGithubDiff`; missing `additions`/`deletions` default to `0`. |
| `normalizeGithubCommit` (`:148`) | `id` = `sha` → `node_id` → identity login; author name/login/avatar resolved through `getGithubIdentity` (`commit.author` vs `commit.commit.author`); `date` from `commit.commit.author.date` → `committer.date` → `''`; `url` from `html_url` → `''`. |
| `buildGithubContributors` (`:165`) | aggregates by `login||name` key; `contributions` increment; sort by count **desc**, then `login` **asc**; `'Unknown author'` upgraded when a later commit supplies a real name; empty `avatarUrl` filled from a later commit. |
| `summarizeGithubStats` (`:201`) | empty `[]` → all zeros; sums `additions`/`deletions`/`changedFiles`. |
| `getGithubMessageSummary` (`:216`) | first line trimmed; empty/whitespace → `'Untitled commit'`. |
| `getGithubShortRef` (`:220`) | truncates to `length` (default 7) when longer; returns ref unchanged when shorter; `''` for empty ref. |

### Tier 2 — Server fetchers (network over `fetch`)

| Function | What to assert |
|----------|----------------|
| `getCommitDetails` (`getCommitDetails.ts:18`) | throws `"Missing required parameters: owner, repo, ref"` on any missing param; hits `/repos/:owner/:repo/commits/:ref` with `encodeURIComponent(ref)`; returns full `GithubCommitData` (repo, ref, shortRef, summary, message, committedAt, contributor, single-element `commits`, files, stats); constructs fallback `html_url` when API omits one; **contributor fallback** when `buildGithubContributors([commit])` returns `[]`. |
| `getBranchCompareDetails` (`getBranchCompareDetails.ts:17`) | throws on missing `owner/repo/base/head`; encodes `base`/`head` into `…/compare/base...head`; `status`/`aheadBy`/`behindBy`/`totalCommits` defaults (`'unknown'`/`0`/`commits.length`); contributors built from `compare.commits`; empty `commits`/`files` → empty arrays; URL fallback when `html_url` missing. |
| `getPullRequestDetails` (`getPullRequestDetails.ts:4`) | **returns** (never throws) `RequestError(400)` on missing `owner/repo/pull_number`; issues **three sequential** fetches (`/pulls/:n`, `/pulls/:n/commits`, `/pulls/:n/files`); adds `Authorization` iff token set; 403 rate-limit → thrown internally → returned `RequestError(500)` with reset string in message; parses `file.patch` into typed diff lines; maps `file.status` removed→deleted / added→added / else→modified; `fetch` rejection → `RequestError(500)`. |
| `getGithubContributions` (`getGithubContributions.ts:102`) | throws on missing `githubUser`; throws `"GitHub token not configured"` when no token in arg **or** env; `toDateRange`: invalid/missing `from` → 1-year-back window, `from > to` throws `"must be before"`; POSTs to `api.github.com/graphql` with `Authorization: Bearer …` + `User-Agent`; non-ok → message from payload; `payload.errors[]` joined and thrown; missing `contributionCalendar` → `"No contribution calendar returned for …"`; `CONTRIBUTION_LEVEL_MAP` NONE..FOURTH→0..4 (unknown level → `0`); contributions sorted by date asc; `buildContributionTotals` groups by year; `buildCountLabel` same-year vs cross-year phrasing. |
| `githubEventsQuery` (`getGithubEvents.ts:27`) | paginates while `Link rel="next"` present, capped at `maxPages=30`; stops on empty page; dedups by `event.id` across pages; `repo` filter on `event.repo.name`; `action` filter on `type.replace('Event','')`; `date` cutoff for `today`/`yesterday`/`week`/`month` (start-of-day) and default epoch; `description` case-insensitive substring over the derived description; **client-side** slice using 1-based `pageNum`/`perPage`; `repositories`/`actionTypes` facets derived from **all fetched** events (not the filtered set); `total_pages = ceil(filtered/perPage)`; non-ok upstream → throws `GitHub API error: <status> - <body>`; `Authorization` only when `githubToken` passed. |
| `parseLinkHeader` (`getGithubEvents.ts:12`) | `null` → `{}`; extracts `next`/`last` URLs; ignores other `rel`; tolerates malformed entries. **Currently file-local** — see §7 to export for direct unit testing. |
| `fetchGithubViewData` (`fetchGithubViewData.ts:1`) | appends params with `?`/`&` separator depending on existing query; non-ok → throws `errorBody.message` (or `'Failed to fetch GitHub data'` when the body isn't JSON); returns parsed JSON. |

### Tier 3 — Handler factories (the Next.js API seam, `AX-MOD-GITHUB-002` / `-006`)

All four share the same skeleton: method gate → param validation → delegate → cache header
→ error→status mapping. Test with a **plain mock `req`/`res`** (no Next.js import needed).

| Factory | What to assert |
|---------|----------------|
| `createGithubEventsHandler` (`:29`) | non-GET → 405 + `Allow: GET`; missing `username` → 400; `parseNumber` fallbacks (`page`→1, `per_page`→40) and rejects ≤0 / non-finite; array-valued query → first element; `config.getGithubToken(req)` **overrides** `process.env.GITHUB_TOKEN`; success → 200 + `Cache-Control: s-maxage=300, stale-while-revalidate=3600`; error message containing `"username is required"` → 400, else → 502. |
| `createGithubBranchHandler` (`:20`) | non-GET → 405 + `Allow: GET`; any missing of `owner/repo/base/head` → 400; success → 200 + `s-maxage=300, swr=3600`; `"Missing required parameters"` → 400, else → 502. |
| `createGithubCommitHandler` (`:20`) | same gate; missing `owner/repo/ref` → 400; same cache header + error mapping. |
| `createGithubContributionsHandler` (`:24`) | non-GET → 405; missing `username` → 400; success → 200 + `Cache-Control: s-maxage=3600, swr=86400`; richer error mapping → `"username is required"`→400, `"No contribution calendar returned"`→404, `"GitHub token not configured"`→500, else→502; `config.getGithubToken` override. |

> **`AX-MOD-GITHUB-002` symmetry check:** assert that each handler reads exactly the
> params its component sends (events: `username,page,per_page,repo,action,date,description`;
> commit: `owner,repo,ref`; branch: `owner,repo,base,head`; contributions:
> `username,from,to`). A drift here silently breaks the `apiUrl` proxy seam.

### Tier 4 — `GithubEvents` logic + cache (after extraction; see §7)

| Unit | What to assert |
|------|----------------|
| `processEvents` (`:381`) | `[]` for empty input; `PushEvent`→action with commit count, head SHA in url; `PullRequestEvent`→PR title + `html_url`; `IssuesEvent`→issue title; `IssueCommentEvent`→`"Commented on issue:"` prefix; date formatted in `America/Chicago` (currently hardcoded — parameterize per §7); unknown type → `type.replace('Event','')`; null entries filtered; missing `created_at` → error placeholder, never a throw. |
| `filterEvents` (`:502`) | empty filters → input unchanged; repo + action + description intersect; date cutoff via `getFilteredDate`; description match case-insensitive. |
| `getEventDescription` (`:525`) | `"Pushed N commits"` (Push), PR title, issue title, `"Commented on issue: …"`; `''` for unknown; tolerates missing `payload` sub-fields. |
| `getFilteredDate` (`:539`) | `today`→00:00 today; `yesterday`→00:00 prev day; `week`/`month`→back-dated 00:00; unknown → assert *current* return (null vs epoch). Freeze the clock with `sinon.useFakeTimers`. |
| Cache: `persistCachedEvents` (`:115`), `updateCachedEventsTimestamp` (`:138`) | truncates to the configured limit; SSR-safe storage wrappers (`:65`–`:95`) swallow `localStorage` failures (`getStorageItem` returns `null`, `setStorageItem` returns `false`, key removed on write failure); `_session_fetched` flag in `sessionStorage` dedups parallel cold loads (`AX-MOD-GITHUB-004` — schema is **unversioned in-key**, so test that a corrupt/stale payload resets gracefully rather than crashing). |

### Tier 5 — Component rendering (render via `createRenderer`)

| Component | What to assert |
|-----------|----------------|
| `ErrorDetails` (`GithubEvents.tsx:232`, exported) | renders `RequestError` (message + status), plain-string error, and an unknown shape without throwing. Cheapest component test — it's already exported, start here. |
| `GithubEvents` detail panel (dispatch `:1357`–`:1370`) | the `actionType` ternary chain routes `PullRequestEvent`/`PushEvent`/`DeleteEvent`/`CreateEvent`/`IssuesEvent`/`IssueCommentEvent` to their renderers, and **any other type falls through to `JsonFallbackView`** (raw `JSON.stringify` in `<pre>`) — never blank, never thrown (`AX-MOD-GITHUB-008`). Drive with a Fork / ProjectsV2 fixture to prove the fallback. |
| Per-type renderers (`EventTypes/**`) | one thorough (`PushEvent`: branch + per-commit short SHA/message; `null`/placeholder on missing `payload`), the rest smoke (`CreateEvent`, `DeleteEvent`, `IssuesEvent`, `IssueCommentEvent`, `PullRequest/PullRequestEvent`). `ForkEvent` / `ProjectsV2*` are **inert** — assert they stay unwired (no dispatch arm). |
| `GithubCalendar` (`:126`) | renders `ActivityCalendar` with `loading` initially; fetches via `apiUrl` seam (`buildApiUrl` adds `?`/`&username=`) when `apiUrl` set, else direct path; never passes an empty data set; theme colors derived from MUI `palette.mode`. |
| `GithubCommit` / `GithubBranch` | all **three** modes (direct fetch, `apiUrl` proxy, snapshot `data` prop) hydrate the same `GithubCommitData`/`GithubBranchData` and render identical views (`AX-MOD-GITHUB-003`); empty-state when no commits; truncated diff shows the `"… more"` sentinel. |
| `GithubContributorsList` (`:24`) | returns `null` for empty list; renders one card per contributor; `"1 commit"` vs `"N commits"` pluralization; hides the secondary name when it equals `login`. |

### Edge cases to call out explicitly

- **Token leakage (`AX-MOD-GITHUB-006`):** add a guard test / grep assertion that no
  component file (`GithubCalendar`, `GithubEvents`, `GithubCommit`, `GithubBranch`) reads
  `process.env.GITHUB_TOKEN` — every hit must be inside `apiHandlers/`.
- **`githubEventsQuery` runs in the browser too:** `GithubEvents.tsx:29` imports it
  directly for direct-fetch mode, so it must not depend on Node-only globals.
- **Rate-limit branch:** `403 + x-ratelimit-remaining: 0` has a distinct, user-facing
  message in both `fetchGithubResource` and `getPullRequestDetails` — cover both.
- **30-page cap + dedup:** `githubEventsQuery` can fetch up to 30×100 events; assert the
  cap halts pagination and the `Map`-by-`id` dedup collapses duplicates across pages.
- **Encoded refs containing `/`:** branch names like `feature/x` must survive
  `encodeURIComponent` in commit/compare paths.

### Out of scope

- The MUI scaffolding under `test/integration/`, `test/typescript/`, `test/umd/` — these
  test MUI, not this package. **Delete** (see §6, cleanup step). Keep `test/describeConformance.ts`.
- `styled(...)` declarations and pure presentational JSX (visual-only).
- `react-activity-calendar`'s internal SVG rendering — stub it (see §4); test only the
  props this package passes.
- Live network calls — everything goes through a stubbed `fetch`.

---

## 3. Test File Organization & Naming

Co-locate `*.test.ts(x)` next to source (the convention in `sui-file-explorer`/`sui-editor`):

```
packages/sui-github/
├── src/
│   ├── apiHandlers/
│   │   ├── githubApi.test.ts
│   │   ├── getGithubContributions.test.ts
│   │   ├── getCommitDetails.test.ts
│   │   ├── getBranchCompareDetails.test.ts
│   │   ├── getPullRequestDetails.test.ts
│   │   ├── getGithubEvents.test.ts            # githubEventsQuery + parseLinkHeader
│   │   ├── createGithubEventsHandler.test.ts
│   │   ├── createGithubBranchHandler.test.ts
│   │   ├── createGithubCommitHandler.test.ts
│   │   └── createGithubContributionsHandler.test.ts
│   ├── components/
│   │   ├── fetchGithubViewData.test.ts
│   │   └── GithubContributorsList.test.tsx
│   ├── GithubEvents/
│   │   ├── GithubEvents.test.tsx              # ErrorDetails + detail-panel dispatch + cache
│   │   ├── utils.test.ts                      # processEvents/filterEvents/… after extraction (§7)
│   │   └── EventTypes/
│   │       ├── PushEvent.test.tsx             # thorough
│   │       └── PullRequest/PullRequestEvent.test.tsx
│   ├── GithubCalendar/GithubCalendar.test.tsx
│   ├── GithubBranch/GithubBranch.test.tsx
│   └── GithubCommit/GithubCommit.test.tsx
└── test/
    ├── describeConformance.ts                 # keep
    └── fixtures/                              # NEW — shared mock payloads
        ├── githubEvents.ts                    # pushEvent(), pullRequestEvent(), issuesEvent(), …
        ├── commitResponse.ts                  # raw /commits/:ref payload
        ├── compareResponse.ts                 # raw /compare payload
        ├── pullRequest.ts                     # raw /pulls/:n + commits + files
        └── contributionGraphql.ts             # raw GraphQL contributionCalendar payload
```

**Naming:** `describe('<function|Component>')`, `it('<behavior> when <condition>')`.
Fixtures export factory functions taking `Partial<T>` overrides so each test mutates only
the field under test.

---

## 4. Mock & Stub Strategy

### 4.1 `global.fetch` (Sinon)

```ts
import sinon from 'sinon';

let fetchStub: sinon.SinonStub;
beforeEach(() => { fetchStub = sinon.stub(globalThis, 'fetch'); });
afterEach(() => { fetchStub.restore(); });

function jsonResponse(body: unknown, init: { status?: number; headers?: Record<string,string> } = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
}
```

Drive multi-call flows with `fetchStub.onCall(n).resolves(...)`:
`getPullRequestDetails` = 3 calls (pull, commits, files); `githubEventsQuery` = N pages
then an empty page (or a response whose `Link` header omits `rel="next"`). Use the real
`Response` so `.ok`, `.status`, `.headers.get(...)`, `.json()`, `.text()` all behave.

### 4.2 `process.env.GITHUB_TOKEN`

```ts
const original = process.env.GITHUB_TOKEN;
afterEach(() => {
  if (original === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = original;
});
```

### 4.3 Handler `req`/`res` doubles

The handlers depend only on a tiny structural interface — no Next.js import:

```ts
function mockRes() {
  const res: any = { statusCode: 0, body: undefined, headers: {} as Record<string,string> };
  res.setHeader = (k: string, v: string) => { res.headers[k] = v; };
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (b: unknown) => { res.body = b; };
  return res;
}
const req = { method: 'GET', query: { username: 'octocat' } };
```

Stub the underlying fetcher (e.g. `githubEventsQuery`) at the module boundary, or let it
hit the stubbed `fetch` and assert end-to-end. For `config.getGithubToken` override tests,
pass `createGithubEventsHandler({ getGithubToken: () => 'cfg-token' })` and assert it wins
over a set `process.env.GITHUB_TOKEN`.

### 4.4 Clock (Sinon fake timers)

Required for `getFilteredDate`, `processEvents` (zoned formatting), `toDateRange`, and the
`date`-filter branch of `githubEventsQuery`:

```ts
const clock = sinon.useFakeTimers(new Date('2026-03-15T10:00:00Z').getTime());
afterEach(() => clock.restore());
```

Do **not** mock `date-fns` / `date-fns-tz` — they are pure and deterministic.

### 4.5 Storage

JSDOM supplies `localStorage` / `sessionStorage`. Clear between tests:

```ts
afterEach(() => { localStorage.clear(); sessionStorage.clear(); });
```

To exercise the SSR-safe failure path (`setStorageItem` returning `false`, key removed),
stub `localStorage.setItem` to throw and assert the cache degrades silently.

### 4.6 MUI theme + `react-activity-calendar`

```tsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);
```

`GithubCalendar` imports `ActivityCalendar` **directly** (no `next/dynamic`). To assert
props without the SVG renderer, intercept the module via a Babel/require-cache replacement
(no Jest `jest.mock` available) — or, preferably, render `GithubCalendar` and assert on the
`apiUrl`/data wiring through the stubbed `fetch` rather than reaching into the calendar's DOM.

### 4.7 `console` noise

`getGithubEvents.ts` and `getPullRequestDetails.ts` are chatty (`console.log`/`console.error`).
Stub them per suite to keep output clean and to assert error logging where relevant:

```ts
let logStub: sinon.SinonStub, errStub: sinon.SinonStub;
beforeEach(() => { logStub = sinon.stub(console, 'log'); errStub = sinon.stub(console, 'error'); });
afterEach(() => { logStub.restore(); errStub.restore(); });
```

### 4.8 What NOT to mock

`JsonFallbackView` is in-package and SSR-safe — render it for real. There is **no**
`next/dynamic` / `react-json-view` to mock anymore (verified). The normalizers in
`githubApi.ts` are pure — call them directly, never stub them in fetcher tests (that would
defeat the `AX-MOD-GITHUB-003` "single source of truth" guarantee).

---

## 5. Coverage Targets

Medium priority, prerelease (`0.1.0-alpha.11.3`). Bias hard toward Tier 1–3 (pure logic +
fetchers + handlers); UI coverage is secondary.

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Statements** | 70% | Normalizers, fetchers, and handlers are highly testable. |
| **Branches** | 60% | Many branches are error / rate-limit / fallback arms — cover happy path + the key error path of each. |
| **Functions** | 65% | The per-type renderers share a pattern; sample, don't enumerate. |
| **Lines** | 70% | Tracks statements. |

**Floor before any new feature work:** `githubApi.ts` ≈ 90%+ (it's pure and load-bearing),
and every handler factory's 405 / 400 / success / error-mapping arms covered.

### Coverage exclusions

- `src/index.ts` and per-folder `index.ts` re-exports.
- `styled(...)` declarations (visual-only).
- Debug `console.log`/`console.error` lines.
- Legacy MUI boilerplate under `test/integration/`, `test/typescript/`, `test/umd/` (delete).

---

## 6. Specific Test Cases to Implement First

Ordered by ROI. Each phase is a self-contained red→green cycle.

### Phase 0 — Cleanup (no behavior, structural)

Delete the scaffolding that tests MUI, not this package:
`test/integration/**`, `test/typescript/**`, `test/umd/**`. **Keep** `test/describeConformance.ts`.
This stops the root runner from spending CI time on `Dialog`/`Menu`/`Select`/etc.

### Phase 1 — `githubApi.test.ts` (pure, ~1–2 h, locks the foundation)

```
describe('parseGithubDiff')
  it('returns [] for undefined patch')
  it('classifies +/-/other lines and numbers them from 1')
  it('appends "... N more diff lines" only when over maxLines')
describe('normalizeGithubFile')
  it('maps added/removed/other status; filename→path→"unknown"; defaults counts to 0')
  it('passes through a pre-supplied diff without re-parsing the patch')
describe('normalizeGithubCommit')
  it('resolves id/author/date/url across api-author vs commit-author shapes')
describe('buildGithubContributors')
  it('aggregates by login, sorts by count desc then login asc')
  it('upgrades "Unknown author" and backfills avatarUrl from a later commit')
describe('summarizeGithubStats') it('zeros on empty; sums otherwise')
describe('getGithubMessageSummary') it('first line; "Untitled commit" when empty')
describe('getGithubShortRef') it('truncates/passes through/empty')
describe('fetchGithubResource')   // uses fetch stub + GITHUB_TOKEN guard
  it('omits Authorization without a token; adds "token <v>" with one')
  it('throws the rate-limit message on 403 + remaining=0')
  it('throws the body text on other non-ok; returns JSON on 200')
```

### Phase 2 — Fetchers (`get*Details` / `getGithubContributions` / `getGithubEvents`)

```
describe('getCommitDetails')
  it('throws on missing params; encodes ref; returns full GithubCommitData; html_url + contributor fallbacks')
describe('getBranchCompareDetails')
  it('throws on missing params; encodes base...head; default status/ahead/behind/total; empty arrays')
describe('getPullRequestDetails')
  it('returns RequestError(400) on missing params (does not throw)')
  it('issues 3 sequential fetches and merges commits_list + processed files')
  it('returns RequestError(500) on rate-limit and on fetch rejection')
describe('getGithubContributions')
  it('throws on missing user / missing token / from>to')
  it('defaults to a 1-year window; maps quartile levels 0..4; sorts by date; year totals + countLabel')
  it('surfaces GraphQL errors and missing-calendar')
describe('parseLinkHeader')  // export it first (see §7)
  it('null→{}; extracts next/last; ignores other rels; tolerates malformed')
describe('githubEventsQuery')
  it('paginates on Link rel=next up to 30 pages; stops on empty page; dedups by id')
  it('filters by repo/action/date/description; facets from ALL events; ceil total_pages')
  it('throws on non-ok upstream; sends Authorization only with a token')
```

### Phase 3 — Handler factories

```
describe('createGithubEventsHandler')
  it('405+Allow:GET on non-GET; 400 on missing username')
  it('parseNumber fallbacks (1/40), rejects <=0/non-finite; array query → first element')
  it('config.getGithubToken overrides process.env; sets s-maxage=300,swr=3600 on success')
  it('maps "username is required"→400 else→502')
describe('createGithubBranchHandler / createGithubCommitHandler')
  it('405 / 400 on missing params / 200+cache / "Missing required parameters"→400 else 502')
describe('createGithubContributionsHandler')
  it('richer mapping: username→400, no-calendar→404, no-token→500, else→502; s-maxage=3600,swr=86400')
```

### Phase 4 — Components

```
describe('ErrorDetails')             // already exported — cheapest
  it('renders RequestError / plain string / unknown shape without throwing')
describe('GithubContributorsList')
  it('null on empty; one card each; "1 commit" vs "N commits"; hides redundant name')
describe('GithubEvents detail panel')
  it('routes known actionTypes to their renderers')
  it('falls through unknown actionType (Fork/ProjectsV2) to JsonFallbackView, no throw')   // AX-MOD-GITHUB-008
describe('GithubCalendar')
  it('renders ActivityCalendar loading; fetches via apiUrl seam vs direct; never passes empty data')
describe('PushEvent')                // thorough; others smoke
  it('renders branch + per-commit SHA/message; returns null on missing payload')
```

### Phase 5 — `GithubEvents` internals + cache (after §7 extraction)

```
describe('processEvents / filterEvents / getEventDescription / getFilteredDate')  // clock frozen
describe('cache')
  it('persistCachedEvents truncates to the limit')
  it('storage-write failure removes the key and degrades silently')
  it('corrupt/stale CachedData is reset rather than crashing (AX-MOD-GITHUB-004)')
```

---

## 7. Refactoring for Testability (do alongside, not instead of, tests)

`GithubEvents.tsx` (1,377 LOC) embeds nearly all logic as closures inside the component,
which forces full-component renders to test pure logic. Low-risk extractions that unlock
direct unit tests:

1. **Extract pure functions** to `src/GithubEvents/utils.ts`: `processEvents` (`:381`,
   take `timezone` as a parameter instead of hardcoding `'America/Chicago'`), `filterEvents`
   (`:502`, take filter values as args not React state), `getEventDescription` (`:525`),
   `getFilteredDate` (`:539`). Re-import them into the component unchanged.
2. **Export `parseLinkHeader`** from `getGithubEvents.ts` (currently file-local at `:12`)
   so it is unit-testable without driving a full multi-page fetch.
3. **Split the cache** (`persistCachedEvents`/`updateCachedEventsTimestamp`/storage wrappers,
   `:65`–`:155`) into `src/GithubEvents/cache.ts` — and consider stamping a schema version
   into the cache key to satisfy `AX-MOD-GITHUB-004` (the key `github_events_<username>` has
   no embedded version today).
4. **Inject `fetch`** into the fetchers (default `globalThis.fetch`) to replace global
   stubbing with parameter passing — also helps Edge/undici consumers.
5. **Remove the dead `react-json-view` dependency** from `package.json` (no longer imported
   in `src/`, per the 2026-06-06 refresh and `AX-MOD-GITHUB-007`).
6. **Route the `console.log`/`console.error` debug spam** through a single debug helper (or
   delete it) so tests don't each need to stub `console`.

> Extractions 1–3 are pure relocations (no behavior change) — they are exempt from the
> red→green requirement themselves, but the relocated functions then get their own
> behavioral tests in Phase 5.

---

## 8. Axiom → Test Mapping

Each module invariant in `packages/sui-github/.axioms.md` should have at least one guarding
test or check:

| Axiom | Guarding test / check |
|-------|------------------------|
| `AX-MOD-GITHUB-001` (barrel is the contract) | `pnpm --filter @stoked-ui/github typescript` + a test importing every named export from `@stoked-ui/github` and asserting it is defined. |
| `AX-MOD-GITHUB-002` (component↔handler query symmetry) | Handler tests assert the exact param set each factory reads (Tier 3); pair with the component fetch-URL assertions. |
| `AX-MOD-GITHUB-003` (3 modes → 1 shape) | `GithubCommit`/`GithubBranch` tests asserting direct / `apiUrl` / `data` modes hydrate identical `Github*Data`; normalizer tests in Phase 1. |
| `AX-MOD-GITHUB-004` (unversioned cache key) | Phase 5 cache test: corrupt/stale `CachedData` resets gracefully. |
| `AX-MOD-GITHUB-005` (new event type needs renderer + dispatcher + filter) | When adding a type: renderer test + a `processEvents`/dispatch test + a `githubEventsQuery` facet test, in lockstep. |
| `AX-MOD-GITHUB-006` (token is server-only) | Guard test / grep: no component reads `process.env.GITHUB_TOKEN`; `fetchGithubResource`/handlers carry it. |
| `AX-MOD-GITHUB-007` (SSR-unsafe deps behind `next/dynamic`) | Grep assertion: no `react-json-view` / `next/dynamic` in `src/`; `JsonFallbackView` renders SSR-safe. |
| `AX-MOD-GITHUB-008` (unhandled types → `JsonFallbackView`, never crash) | Phase 4 detail-panel test driving a Fork/ProjectsV2 fixture through the fallback arm. |
