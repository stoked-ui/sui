---
productId: github
title: Github Commit
githubLabel: 'component: github commit'
packageName: '@stoked-ui/github'
---

# Github Commit

<p class="description">Render a single commit with the contributor, commit message, changed files, and a compact diff view.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Usage

```tsx
import { GithubCommit } from '@stoked-ui/github';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

<GithubCommit
  owner="stoked-ui"
  repo="sui"
  commitRef="5c90b548a6a5af958d7aa31f78a794874c007886"
  apiUrl={getApiUrl('/api/github/commit')}
/>
```

## Private snapshots

Private mode skips runtime fetching and renders from static JSON generated during docs dev/build.

```tsx
import { GithubCommit } from '@stoked-ui/github';
import commitSnapshot from '../../snapshots/github-commit-private.json';

<GithubCommit
  owner="stoked-ui"
  repo="sui"
  commitRef={commitSnapshot.ref}
  private
  data={commitSnapshot}
/>
```

The docs snapshots are refreshed with `pnpm github:snapshots`.

## Demos

### Public repo runtime

For public repositories, the component can query GitHub directly at runtime.

{{"demo": "./GithubCommitRuntimeDemo.js", "bg": "noBorder" }}

### Runtime through a docs API route

Use `apiUrl` when you want runtime fetching to flow through a server-side helper.

{{"demo": "./GithubCommitApiDemo.js", "bg": "noBorder" }}

### Private static snapshot

Use `private` and pre-generated `data` when the source repository should stay private at deploy time.

{{"demo": "./GithubCommitDemo.js", "bg": "noBorder" }}
