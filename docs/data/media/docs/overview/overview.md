---
productId: media
title: Media Components
githubLabel: 'Media Components'
packageName: '@stoked-ui/media'
---

# Overview

<p class="description">Comprehensive media management library for React with framework-agnostic abstractions, modern file handling APIs, and reactive UI components.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

:::warning
This package replaces `@stoked-ui/media-selector`. See the [Migration Guide](/media/docs/migration/) for upgrade instructions.
:::

## Installation

```bash
npm install @stoked-ui/media
# or
pnpm add @stoked-ui/media
# or
yarn add @stoked-ui/media
```

## Features

- **MediaFile** — Enhanced file handling with automatic metadata extraction for images, video, and audio
- **MediaViewer** — Full-screen media viewing component with playback controls and playlists
- **MediaCard** — Card component for displaying media items with thumbnail strips and progress bars
- **MediaApiClient** — API client with React hooks built on TanStack Query for communicating with `@stoked-ui/media-api`
- **WebFile & FileSystemApi** — Modern File System Access API integration for persistent file management
- **Framework Abstractions** — Pluggable interfaces for routing, authentication, payments, queues, and keyboard shortcuts

## Available components

### MediaViewer

A full-screen media viewing component with header, controls, and playlist support.

```jsx
import { MediaViewer } from '@stoked-ui/media';
```

### MediaCard

A card component for displaying media items with thumbnail strips and video progress bars.

```jsx
import { MediaCard } from '@stoked-ui/media';
```

### MediaFile

Enhanced file class with automatic type detection and metadata extraction.

```jsx
import { MediaFile } from '@stoked-ui/media';
```

## What's next

- Check the [MediaViewer docs](/media/docs/media-viewer/) for live demos and usage
- Check the [MediaCard docs](/media/docs/media-card/) for card display options
- Check the [Migration Guide](/media/docs/migration/) to upgrade from `@stoked-ui/media-selector`
- See the [Roadmap](/media/docs/roadmap/) for upcoming features
