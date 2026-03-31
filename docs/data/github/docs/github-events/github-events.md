---
productId: github
title: Github Events
githubLabel: 'component: github events'
packageName: '@stoked-ui/github'
---

# Github Events

<p class="description">The provides insight into a users github event history.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Api

Api calls can be made directly to the public GitHub API, or you can point `apiUrl` at a server-side proxy that reads `GITHUB_TOKEN` on the backend so the browser never receives the token.

```jsx
import { GithubEvents } from '@stoked-ui/github/GithubEvents';
```

```jsx
<GithubEvents
  githubUser="brian-stoker"
  eventsPerPage={15}
  apiUrl="/api/github/events"
/>
```
