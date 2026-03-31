---
productId: github
title: Github Calendar
githubLabel: 'component: github calendar'
packageName: '@stoked-ui/github'
---

# Github Calendar

<p class="description">The Github components lets users view various aspects of github information.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Api

`GithubCalendar` accepts a `githubUser` and can either:

- use a server-side proxy endpoint via `apiUrl`
- fall back to the public contributions API for public-only data

### Local proxy example

```jsx
import { GithubCalendar } from '@stoked-ui/github/GithubCalendar';
```

```jsx
<GithubCalendar githubUser="brian-stoker" apiUrl="/api/github/contributions" />
```

{{"demo": "./GithubCalendarDemo.js"}}

### External API example

If another domain exposes the same response contract, point `apiUrl` there:

```jsx
<GithubCalendar
  githubUser="brian-stoker"
  apiUrl="https://brianstoker.com/api/github/contributions"
/>
```
