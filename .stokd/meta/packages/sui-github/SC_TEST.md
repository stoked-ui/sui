# Testing Strategy: `@stoked-ui/github`

**Package:** `packages/sui-github`
**Priority:** Medium
**Current Coverage:** 0% (existing test files are MUI boilerplate — none test this package's actual code)

---

## 1. What Should Be Tested

### 1.1 Critical Paths

| Area | Source | Why Critical |
|------|--------|-------------|
| `getPullRequestDetails` | `src/apiHandlers/getPullRequestDetails.ts` | Core data-fetching logic — parses GitHub API responses, processes diffs, handles rate limits |
| `processEvents` | `src/GithubEvents/GithubEvents.tsx:433` | Transforms raw `GitHubEvent[]` into `DisplayEventDetails[]` — date formatting, event type routing, error resilience |
| `parseLinkHeader` | `src/GithubEvents/GithubEvents.tsx:58` | Pagination depends on correct Link header parsing |
| `githubEventsQuery` | `src/GithubEvents/GithubEvents.tsx:82` | Standalone async function that drives all event fetching — filtering, pagination, error handling |
| `filterEvents` | `src/GithubEvents/GithubEvents.tsx:554` | Client-side filtering by repo, action, description, date |
| `getFilteredDate` | `src/GithubEvents/GithubEvents.tsx:591` | Date filter cutoff calculation (today/yesterday/week/month) |
| `getEventDescription` | `src/GithubEvents/GithubEvents.tsx:577` | Maps event types to human-readable descriptions |
| Caching logic | `src/GithubEvents/GithubEvents.tsx:611-821` | localStorage/sessionStorage cache with 8-hour staleness |

### 1.2 Edge Cases

- **`getPullRequestDetails`:** missing params, rate limit 403, empty patch text, `file.status` mapping (`removed` → `deleted`), no GITHUB_TOKEN env var
- **`processEvents`:** null/undefined events in array, missing `created_at`, missing `payload` sub-fields, unknown event types falling to default branch
- **`parseLinkHeader`:** null header, malformed header, header with only `next`, header with only `last`, header with both
- **`githubEventsQuery`:** empty response pages, API errors mid-pagination, all filter combinations, zero results after filtering
- **`filterEvents`:** combined filters (repo + action + date + description), no matching events, empty filter strings
- **`getFilteredDate`:** all named filters (`today`, `yesterday`, `week`, `month`), unknown filter string returning `null`
- **Cache:** stale cache (>8 hours), fresh cache, missing cache key, corrupt localStorage JSON, session-level fetch dedup
- **Event type components:** each should handle `null`/missing fields in `event.payload` gracefully (already return `null` in some cases)

### 1.3 Integration Points

- GitHub REST API (`api.github.com/users/{user}/events`, `api.github.com/repos/{owner}/{repo}/pulls/{number}`)
- `react-activity-calendar` in `GithubCalendar`
- `next/dynamic` import for `react-json-view` (SSR avoidance)
- `localStorage` / `sessionStorage` caching
- MUI theme integration (`useTheme`, `styled`)
- `date-fns` / `date-fns-tz` timezone handling
- `@stoked-ui/common` resize hooks (`useResize`, `useResizeWindow`)

---

## 2. Test Framework and Tooling

### Recommended Stack

| Tool | Purpose | Rationale |
|------|---------|-----------|
| **Jest** | Test runner | Already configured across the monorepo (`ts-jest` preset, `jsdom` environment) |
| **@testing-library/react** | Component rendering | Used by sibling packages (`sui-common`, `sui-media`) |
| **@testing-library/jest-dom** | DOM matchers | Already a dev dependency in sibling packages |
| **jest-fetch-mock** or manual `global.fetch` mock | API mocking | All GitHub API calls use native `fetch` — lightweight mock is sufficient |

### Configuration

Create `packages/sui-github/jest.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx)',
    '**/?(*.)+(spec|test).+(ts|tsx)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterSetup: ['<rootDir>/src/__tests__/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/', '/src/__tests__/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 70,
      statements: 70,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\\.d\\.ts$',
    'index\\.ts$',
    '\\.stories\\.tsx$',
  ],
};
```

Create `packages/sui-github/src/__tests__/setup.ts`:

```ts
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock localStorage and sessionStorage
const storageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((i: number) => Object.keys(store)[i] ?? null),
  };
};

Object.defineProperty(window, 'localStorage', { value: storageMock() });
Object.defineProperty(window, 'sessionStorage', { value: storageMock() });

// Mock global fetch
global.fetch = jest.fn();
```

---

## 3. Test File Organization

```
packages/sui-github/src/
├── __tests__/
│   ├── setup.ts                              # Jest setup (mocks, DOM APIs)
│   └── fixtures/
│       ├── githubEvents.ts                   # Mock GitHubEvent[] arrays
│       ├── pullRequestDetails.ts             # Mock PR API responses
│       └── contributionData.ts               # Mock activity calendar data
├── apiHandlers/
│   └── __tests__/
│       └── getPullRequestDetails.test.ts     # Unit tests for API handler
├── GithubEvents/
│   ├── __tests__/
│   │   ├── processEvents.test.ts             # Pure function extraction tests
│   │   ├── parseLinkHeader.test.ts           # Link header parser tests
│   │   ├── filterEvents.test.ts              # Client-side filter logic
│   │   ├── githubEventsQuery.test.ts         # Standalone query function tests
│   │   └── GithubEvents.test.tsx             # Component integration tests
│   └── EventTypes/
│       └── __tests__/
│           ├── PushEvent.test.tsx
│           ├── PullRequestEvent.test.tsx
│           ├── CreateEvent.test.tsx
│           ├── DeleteEvent.test.tsx
│           ├── IssuesEvent.test.tsx
│           └── IssueCommentEvent.test.tsx
└── GithubCalendar/
    └── __tests__/
        └── GithubCalendar.test.tsx           # Component rendering tests
```

### Naming Conventions

- Test files: `<ModuleName>.test.ts(x)` — co-located in `__tests__/` directories adjacent to source
- Fixtures: `src/__tests__/fixtures/<name>.ts` — shared across all tests
- Describe blocks: `describe('<ComponentOrFunction>', () => { ... })`
- Test names: `it('should <expected behavior> when <condition>', ...)`

---

## 4. Mock/Stub Strategy

### 4.1 External API Calls

All GitHub API calls go through native `fetch`. Mock at the global level:

```ts
// In each test file or setup
beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});
```

Provide factory functions in fixtures for common responses:

```ts
// src/__tests__/fixtures/githubEvents.ts
export function mockGitHubEvent(overrides?: Partial<GitHubEvent>): GitHubEvent {
  return {
    id: '12345',
    type: 'PushEvent',
    repo: { name: 'owner/repo' },
    created_at: '2026-03-01T12:00:00Z',
    payload: {
      commits: [{ sha: 'abc123', message: 'test commit' }],
      head: 'abc123',
    },
    ...overrides,
  };
}

export function mockPullRequestEvent(overrides?: Partial<GitHubEvent>): GitHubEvent {
  return mockGitHubEvent({
    type: 'PullRequestEvent',
    payload: {
      action: 'opened',
      pull_request: {
        title: 'Test PR',
        html_url: 'https://github.com/owner/repo/pull/1',
        number: 1,
        state: 'open',
        merged: false,
        user: { login: 'testuser', avatar_url: 'https://example.com/avatar.png' },
        head: { ref: 'feature-branch', sha: 'abc123', repo: { full_name: 'owner/repo' } },
        base: { ref: 'main', sha: 'def456', repo: { full_name: 'owner/repo' } },
      },
    },
    ...overrides,
  });
}
```

### 4.2 `next/dynamic`

Mock the `next/dynamic` import since this package has a hard dependency on Next.js for SSR-safe dynamic imports:

```ts
// In jest.config.js moduleNameMapper or in test setup
jest.mock('next/dynamic', () => {
  return function dynamic(loader: () => Promise<any>) {
    let Component: any = null;
    loader().then((mod: any) => { Component = mod.default || mod; });
    return function DynamicComponent(props: any) {
      return Component ? <Component {...props} /> : null;
    };
  };
});
```

### 4.3 MUI Theme

Wrap components in a ThemeProvider for rendering tests:

```ts
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}
```

### 4.4 `@stoked-ui/common` Hooks

Mock resize hooks to return controlled values:

```ts
jest.mock('@stoked-ui/common', () => ({
  useResize: jest.fn(() => ({ width: 800, height: 600 })),
  useResizeWindow: jest.fn(() => [1024, jest.fn()]),
}));
```

### 4.5 `date-fns` / `date-fns-tz`

Do **not** mock these — they are pure functions and produce deterministic output for fixed inputs. Use fixed ISO date strings in test data to get predictable formatted results.

### 4.6 `react-activity-calendar`

Mock for `GithubCalendar` tests to avoid rendering the full SVG calendar:

```ts
jest.mock('react-activity-calendar', () => ({
  ActivityCalendar: ({ data, loading }: any) => (
    <div data-testid="activity-calendar" data-loading={loading}>
      {data.length} contributions
    </div>
  ),
}));
```

### 4.7 `process.env`

For `getPullRequestDetails` which reads `GITHUB_TOKEN`:

```ts
const originalEnv = process.env;
beforeEach(() => { process.env = { ...originalEnv }; });
afterEach(() => { process.env = originalEnv; });

it('should include auth header when GITHUB_TOKEN is set', () => {
  process.env.GITHUB_TOKEN = 'test-token-123';
  // ...
});
```

---

## 5. Coverage Targets

Given medium priority and alpha status (`0.0.0-a.0`):

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Statements** | 70% | Focus on testable pure logic; UI rendering is secondary |
| **Branches** | 60% | Many branches are error-handling fallbacks — test the primary paths first |
| **Functions** | 60% | Event type components are repetitive — test the pattern, not every variant |
| **Lines** | 70% | Aligns with statement coverage |

### Coverage Exclusions

- `index.ts` re-export files
- MUI `styled()` component definitions (visual-only)
- `console.log` / `console.error` debug statements (dozens throughout — should be cleaned up separately)
- The existing `test/` directory (MUI boilerplate — not this package's tests)

---

## 6. Priority Test Cases — Implement First

### Phase 1: Pure Functions (no React, no DOM)

These can be extracted or tested via module internals. Highest ROI, lowest complexity.

#### 6.1 `getPullRequestDetails` — `src/apiHandlers/getPullRequestDetails.ts`

```
describe('getPullRequestDetails')
  it('should return PullRequestDetails with commits and processed files on success')
  it('should return RequestError when owner param is missing')
  it('should return RequestError when repo param is missing')
  it('should return RequestError when pull_number param is missing')
  it('should include Authorization header when GITHUB_TOKEN env is set')
  it('should omit Authorization header when GITHUB_TOKEN env is not set')
  it('should throw descriptive error on 403 rate limit response')
  it('should throw on non-ok response with status and body text')
  it('should parse file.patch into typed diff lines (addition/deletion/context)')
  it('should map file.status "removed" to type "deleted"')
  it('should map file.status "added" to type "added"')
  it('should handle files with no patch (empty diff array)')
  it('should return RequestError on network/fetch failure')
```

#### 6.2 `parseLinkHeader` — `src/GithubEvents/GithubEvents.tsx:58`

> **Note:** This function is not currently exported. Either export it for testing, or test it indirectly through `githubEventsQuery`. Recommendation: extract to a utility file and export.

```
describe('parseLinkHeader')
  it('should return empty object for null header')
  it('should parse header with next and last links')
  it('should parse header with only next link')
  it('should parse header with only last link')
  it('should ignore non-next/last rel values')
  it('should handle malformed header gracefully')
```

#### 6.3 `getFilteredDate` — `src/GithubEvents/GithubEvents.tsx:591`

> **Note:** Currently a closure inside the component. Recommend extracting to a standalone utility.

```
describe('getFilteredDate')
  it('should return start of today for "today" filter')
  it('should return 24 hours ago for "yesterday" filter')
  it('should return 7 days ago for "week" filter')
  it('should return null for unknown filter string')
```

#### 6.4 `getEventDescription` — `src/GithubEvents/GithubEvents.tsx:577`

```
describe('getEventDescription')
  it('should return commit count string for PushEvent')
  it('should return PR title for PullRequestEvent')
  it('should return issue title for IssuesEvent')
  it('should return "Commented on issue: <title>" for IssueCommentEvent')
  it('should return empty string for unknown event type')
  it('should handle PushEvent with no commits gracefully')
```

### Phase 2: Data Processing Logic

#### 6.5 `processEvents` — `src/GithubEvents/GithubEvents.tsx:433`

> **Note:** Currently a closure. Recommend extracting to a standalone exported function.

```
describe('processEvents')
  it('should return empty array for empty input')
  it('should transform PushEvent into DisplayEventDetails with correct action/description/url')
  it('should transform PullRequestEvent with correct title and html_url')
  it('should transform IssuesEvent with correct title and html_url')
  it('should transform IssueCommentEvent with "Commented on issue:" prefix')
  it('should use "America/Chicago" timezone for date formatting')
  it('should fall back to type.replace("Event","") for unknown event types')
  it('should filter out null entries from malformed events')
  it('should produce error placeholder for events with missing created_at')
  it('should handle event with missing payload sub-fields without crashing')
```

#### 6.6 `githubEventsQuery` — `src/GithubEvents/GithubEvents.tsx:82`

```
describe('githubEventsQuery')
  it('should fetch events from GitHub API for the given user')
  it('should paginate through all available pages up to maxPages')
  it('should stop pagination when response has no Link next header')
  it('should stop pagination when response returns 0 events')
  it('should filter by repo name when repo param is provided')
  it('should filter by action type when action param is provided')
  it('should filter by date cutoff for "today" date param')
  it('should filter by date cutoff for "week" date param')
  it('should filter by description substring when description param is provided')
  it('should return repositories and actionTypes derived from all fetched events')
  it('should apply client-side pagination (startIndex/endIndex) to filtered results')
  it('should throw on non-ok API response')
  it('should include auth header when githubToken is provided')
```

### Phase 3: Component Rendering

#### 6.7 Event Type Components

Test one representative component thoroughly, then lighter coverage for the rest.

```
describe('PushEvent')
  it('should render branch name and commit count')
  it('should render each commit SHA and message')
  it('should return null when event has no payload')

describe('CreateEvent')
  it('should render ref_type and ref name')
  it('should link to the repository')

describe('IssuesEvent')
  it('should render issue number, title, and state')
  it('should render labels with correct colors')

describe('IssueCommentEvent')
  it('should render comment body and commenter avatar')
  it('should show issue title and state')

describe('PullRequestEvent')
  it('should fetch PR details and render PullRequestView on mount')
  it('should skip fetch for closed/merged PRs and show available info')
  it('should show error details on fetch failure')
```

#### 6.8 `ErrorDetails` — `src/GithubEvents/GithubEvents.tsx:284`

```
describe('ErrorDetails')
  it('should render RequestError with message and status')
  it('should render string error as plain message')
  it('should render "Unknown Error" for non-string, non-RequestError input')
```

#### 6.9 `GithubCalendar` — `src/GithubCalendar/GithubCalendar.tsx`

```
describe('GithubCalendar')
  it('should render ActivityCalendar with loading state initially')
  it('should fetch contribution data on mount')
  it('should pass correct theme colors based on MUI palette.mode')
  it('should use inputBlockSize when provided')
  it('should calculate blockSize from window width in windowMode')
  it('should calculate blockSize from container width in containerMode')
  it('should auto-scroll to rightmost position after loading')
```

---

## 7. Refactoring Recommendations for Testability

Several critical functions are currently closures inside the `GithubEvents` component, making them impossible to unit test in isolation. Before (or alongside) writing tests:

1. **Extract pure functions** to a shared utility file (`src/GithubEvents/utils.ts`):
   - `parseLinkHeader`
   - `processEvents` (pass timezone as parameter instead of hardcoding)
   - `getFilteredDate`
   - `getEventDescription`
   - `filterEvents` (accept filter values as parameters instead of reading React state)
   - `buildFilterOptionsFromEvents` (return values instead of calling setters)

2. **Fix the broken import** in `src/GithubEvents/EventTypes/PullRequest/PullRequestEvent.tsx:13`:
   ```ts
   // Current (broken):
   import { getPullRequestDetails } from 'packages/sui-github/src/apiHandlers';
   // Should be:
   import { getPullRequestDetails } from '../../../apiHandlers';
   ```

3. **Remove `next/dynamic` hard dependency** — replace with a generic lazy-loading pattern or make `react-json-view` an optional peer dependency.

4. **Parameterize the hardcoded username** in `GithubCalendar.tsx:91`:
   ```ts
   // Current (hardcoded):
   fetch('https://github-contributions-api.jogruber.de/v4/brian-stoker?yr=last')
   // Should accept a prop:
   fetch(`https://github-contributions-api.jogruber.de/v4/${githubUser}?yr=last`)
   ```

---

## 8. Existing Test Cleanup

The current `test/` directory contains only MUI boilerplate tests (Dialog, Menu, MenuList, Select, Table, etc.) and MUI TypeScript augmentation specs. **None of these test this package's code.**

Recommendation:
- Delete or move the `test/integration/` files — they test MUI internals, not `@stoked-ui/github`
- Keep `test/typescript/` specs only if they validate this package's type augmentations (review each)
- Keep `test/describeConformance.ts` only if conformance tests will be written for this package's components
