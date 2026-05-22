# @stoked-ui/github

React components and server-safe helpers for rendering GitHub contribution, event, commit, and branch comparison data in Stoked UI applications.

## Installation

```bash
pnpm add @stoked-ui/github react react-dom
```

Peer dependencies:

- `@mui/material`, `@mui/icons-material`, Emotion, React, and React DOM

Runtime dependencies include `react-activity-calendar`, Octokit types/error helpers, `date-fns`, `date-fns-tz`, `@stoked-ui/common`, and MUI system utilities.

## Quick Start

Render a contribution calendar:

```tsx
import { GithubCalendar } from '@stoked-ui/github';

export function ProfileActivity() {
  return <GithubCalendar githubUser="stoked-ui" apiUrl="/api/github/contributions" />;
}
```

Render public events:

```tsx
import { GithubEvents } from '@stoked-ui/github';

export function ActivityFeed() {
  return <GithubEvents githubUser="stoked-ui" apiUrl="/api/github/events" eventsPerPage={25} />;
}
```

Use API handlers in a Next.js pages API route:

```ts
import { createGithubContributionsHandler } from '@stoked-ui/github';

export default createGithubContributionsHandler();
```

## Primary Exports

- Components: `GithubCalendar`, `GithubEvents`, `GithubCommit`, and `GithubBranch`.
- Handler factories: `createGithubContributionsHandler`, `createGithubEventsHandler`, `createGithubCommitHandler`, and `createGithubBranchHandler`.
- Data helpers: `getGithubContributions`, `getGithubEvents`, `githubEventsQuery`, `getPullRequestDetails`, `getCommitDetails`, and `getBranchCompareDetails`.
- Types: `EventsQuery`, `GithubBranchData`, `GithubCommitData`, and `GithubFileHighlight`.

## Integration Notes

- `GithubCalendar` can call an `apiUrl` proxy or fall back to the public contribution API for public-only usage.
- `GithubEvents` caches event data in browser storage and can use either direct GitHub public APIs or an `apiUrl` proxy.
- `GithubCommit` and `GithubBranch` can render from direct GitHub REST data, an API proxy, or supplied snapshot data for private repository displays.
- Keep GitHub tokens on the server. Use the handler factories or your own API route to read `GITHUB_TOKEN` server-side.
- Components are display-oriented and depend on MUI theme context for the best visual result.

## Local Development

```bash
pnpm --filter @stoked-ui/github build
pnpm --filter @stoked-ui/github typescript
pnpm --filter @stoked-ui/github dev
```

## Related Docs

- Product docs: `https://sui.stokd.cloud/github/docs`
- Source: `packages/sui-github/src`

## License

MIT
