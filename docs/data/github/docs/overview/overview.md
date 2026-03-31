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

The Stoked UI Github package exposes four components:

 - [GithubCalendar](./github-calendar/)
 - [GithubEvents](./github-events/)
 - [GithubCommit](./github-commit/)
 - [GithubBranch](./github-branch/)

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

### Github Commit

```jsx
import { GithubCommit } from '@stoked-ui/github/GithubCommit';
```

The Github Commit component renders a single commit view with the contributor, commit message, changed files, and a minimal diff:

Simple static example:

{{"demo": "../github-commit/GithubCommitDemo.js", "bg": "noBorder" }}

### Github Branch

```jsx
import { GithubBranch } from '@stoked-ui/github/GithubBranch';
```

The Github Branch component compares a branch to its base branch and highlights contributors, commits, changed files, and a minimal diff:

Simple static example:

{{"demo": "../github-branch/GithubBranchDemo.js", "bg": "noBorder" }}
