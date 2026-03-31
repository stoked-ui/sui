---
productId: github
title: Github Branch
githubLabel: 'component: github branch'
packageName: '@stoked-ui/github'
---

# Github Branch

<p class="description">Compare a branch against its base branch, including contributors, commits, changed files, and a compact diff view.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Usage

```tsx
import { GithubBranch } from '@stoked-ui/github';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

<GithubBranch
  owner="stoked-ui"
  repo="sui"
  base="main"
  head="bug/fixAutoDeploySite"
  apiUrl={getApiUrl('/api/github/branch')}
/>
```

## Private snapshots

Private mode consumes the generated snapshot JSON instead of fetching at runtime.

```tsx
import { GithubBranch } from '@stoked-ui/github';
import branchSnapshot from '../../snapshots/github-branch-private.json';

<GithubBranch
  owner="stoked-ui"
  repo="sui"
  base={branchSnapshot.baseRef}
  head={branchSnapshot.headRef}
  private
  data={branchSnapshot}
/>
```

The docs snapshots are refreshed with `pnpm github:snapshots`.

## Demos

### Public repo runtime

For public repositories, the component can query GitHub directly at runtime.

{{"demo": "./GithubBranchRuntimeDemo.js", "bg": "noBorder" }}

### Runtime through a docs API route

Use `apiUrl` when you want runtime fetching to flow through a server-side helper.

{{"demo": "./GithubBranchApiDemo.js", "bg": "noBorder" }}

### Private static snapshot

Use `private` and pre-generated `data` when the source branch data should stay static in the exported site.

{{"demo": "./GithubBranchDemo.js", "bg": "noBorder" }}
