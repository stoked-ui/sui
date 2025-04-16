---
productId: github
title: Github Components
githubLabel: 'Github Components'
packageName: '@stoked-ui/github'
---

# Overview

<p class="description">The Github components lets users view various aspects of github information.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Available components

The Stoked UI Github package exposes two different components:

 - GithubCalendar
 - GithubEvents

### Github Calendar

```jsx
import { GithubCalendar } from '@stoked-ui/github/GithubCalendar';
```

The Github Calendar component is built on top of the react-github-calendar component.

{{"demo": "../github-calendar/GithubCalendarDemo.js"}}

### Github Events

```jsx
import { GithubEvents } from '@stoked-ui/github/GithubEvents';
```

The Github Events component displays and provides access to a given user's recent github events:


{{"demo": "../github-events/GithubEventsDemo.js", "bg": "noBorder" }}