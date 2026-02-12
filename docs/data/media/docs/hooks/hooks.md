---
productId: media
title: Hooks
githubLabel: 'Media Hooks'
packageName: '@stoked-ui/media'
---

# Hooks

<p class="description">React hooks provided by the @stoked-ui/media package.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## UI Hooks

### useMediaViewerState

Manages the state of the MediaViewer component including current item, playback, and playlist navigation.

```tsx
import { useMediaViewerState } from '@stoked-ui/media';

const {
  currentItem,
  currentIndex,
  isPlaying,
  next,
  previous,
  setIndex,
  play,
  pause,
  toggle,
} = useMediaViewerState(items, { initialIndex: 0 });
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `items` | `MediaItem[]` | Array of media items |
| `options.initialIndex` | `number` | Starting index (default: 0) |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `currentItem` | `MediaItem` | The currently active item |
| `currentIndex` | `number` | Index of the current item |
| `isPlaying` | `boolean` | Whether media is currently playing |
| `next` | `() => void` | Advance to next item |
| `previous` | `() => void` | Go to previous item |
| `setIndex` | `(index: number) => void` | Jump to a specific index |
| `play` | `() => void` | Start playback |
| `pause` | `() => void` | Pause playback |
| `toggle` | `() => void` | Toggle play/pause |

### useMediaViewerLayout

Controls the layout dimensions and responsive behavior of the MediaViewer.

```tsx
import { useMediaViewerLayout } from '@stoked-ui/media';

const { containerRef, dimensions, isFullscreen, toggleFullscreen } =
  useMediaViewerLayout();
```

## API Hooks

See the [API Client](/media/docs/api-client/) page for the TanStack Query-based hooks:

- `useMediaUpload` — Upload files with progress tracking
- `useMediaList` — Fetch paginated media lists
- `useMediaItem` — Fetch a single media item
- `useMediaUpdate` — Update media metadata
- `useMediaDelete` — Delete media items
