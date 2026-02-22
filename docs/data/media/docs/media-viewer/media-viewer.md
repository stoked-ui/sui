---
productId: media
title: MediaViewer
githubLabel: 'MediaViewer'
packageName: '@stoked-ui/media'
---

# MediaViewer

<p class="description">A full-screen media viewing component with header, playback controls, and playlist support.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Introduction

The `MediaViewer` component provides a complete media viewing experience. It supports images, video, and audio files with automatic format detection, playback controls, and playlist navigation.

{{"demo": "MediaViewerBasic.js"}}


## Components

### MediaViewerHeader

Displays the current media item title and navigation controls.

```tsx
import { MediaViewerHeader } from '@stoked-ui/media';
```

### MediaViewerPrimary

The main content area that renders the appropriate media player based on file type.

```tsx
import { MediaViewerPrimary } from '@stoked-ui/media';
```

### NowPlayingIndicator

Shows the currently playing item in a playlist context.

```tsx
import { NowPlayingIndicator } from '@stoked-ui/media';
```

### NextUpHeader

Displays information about the next item in the playlist.

```tsx
import { NextUpHeader } from '@stoked-ui/media';
```

## Hooks

### useMediaViewerState

Manages the state of the media viewer including current item, playback status, and playlist navigation.

```tsx
import { useMediaViewerState } from '@stoked-ui/media';

function CustomViewer({ items }) {
  const { currentItem, next, previous, isPlaying } = useMediaViewerState(items);

  return (
    <div>
      <p>Now playing: {currentItem.name}</p>
      <button onClick={previous}>Previous</button>
      <button onClick={next}>Next</button>
    </div>
  );
}
```

### useMediaViewerLayout

Controls the layout and sizing of the media viewer.

```tsx
import { useMediaViewerLayout } from '@stoked-ui/media';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MediaItem[]` | `[]` | Array of media items to display |
| `initialIndex` | `number` | `0` | Starting index in the items array |
| `autoPlay` | `boolean` | `false` | Auto-play video/audio items |
| `onItemChange` | `(item: MediaItem) => void` | — | Callback when the current item changes |
