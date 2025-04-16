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

Api calls are made internally within the component using the public github api. Alternatively you can consume the exported api call handlers and host it behind your own private api and include your github token which will allow you to consume event data from private repos.

```jsx
import { GithubEvents } from '@stoked-ui/github/GithubEvents';
```