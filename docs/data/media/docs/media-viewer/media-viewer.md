---
productId: media
title: MediaViewer
components: MediaViewer, MediaViewerHeader, MediaViewerPrimary, NextUpHeader, NowPlayingIndicator
githubLabel: 'MediaViewer'
packageName: '@stoked-ui/media'
---

# MediaViewer

<p class="description">A full-screen media viewing component with header, playback controls, and playlist support.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Introduction

The `MediaViewer` component provides a full-screen media surface for videos and images with navigation, keyboard shortcuts, adaptive quality switching, and multiple viewing modes.

Use it when a card or grid needs to expand into a focused playback experience without you rebuilding dialog state, navigation, or layout calculations from scratch.

## Import

```tsx
import { MediaViewer } from '@stoked-ui/media';
```

## Quick start

This example opens the viewer with adaptive tracks, mixed media, and a basic open/close flow.

{{"demo": "MediaViewerBasic.js", "bg": true}}

## Browsing a collection

Pass `mediaItems`, `currentIndex`, and `onNavigate` when the viewer should move through a gallery or playlist.

{{"demo": "MediaViewerCollection.js", "bg": true}}

## Choosing a launch mode

`MediaViewer` can start in `NORMAL` or `THEATER` mode. Theater mode removes the preview rail and maximizes the playback surface.

{{"demo": "MediaViewerModes.js", "bg": true}}

## Components

### MediaViewerHeader

Displays the current media item title plus navigation and close controls.

```tsx
import { MediaViewerHeader } from '@stoked-ui/media';
```

### MediaViewerPrimary

Renders the main video or image surface, including adaptive bitrate support for video items.

```tsx
import { MediaViewerPrimary } from '@stoked-ui/media';
```

### NowPlayingIndicator

Shows the currently active item inside queue-aware layouts.

```tsx
import { NowPlayingIndicator } from '@stoked-ui/media';
```

### NextUpHeader

Displays the upcoming item in the queue or gallery.

```tsx
import { NextUpHeader } from '@stoked-ui/media';
```

## Hooks

### useMediaViewerState

Manages the NORMAL -> THEATER -> FULLSCREEN transitions so double-clicks and fullscreen actions stay consistent.

```tsx
import { useMediaViewerState } from '@stoked-ui/media';

function ViewerShell() {
  const { mode, transition } = useMediaViewerState('NORMAL');

  return (
    <button onClick={() => transition('CYCLE')}>
      Current mode: {mode}
    </button>
  );
}
```

### useMediaViewerLayout

Calculates the preview rail and viewport dimensions for the current mode and screen size.

```tsx
import { useMediaViewerLayout } from '@stoked-ui/media';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `item` | `MediaItem` | - | The currently visible media record |
| `mediaItems` | `MediaItem[]` | `[]` | Optional collection used for next and previous navigation |
| `currentIndex` | `number` | `0` | Index of `item` inside `mediaItems` |
| `open` | `boolean` | - | Controls whether the dialog is mounted and visible |
| `onClose` | `() => void` | - | Called when the viewer should close |
| `onNavigate` | `(item, index) => void` | - | Called when the viewer moves to another item |
| `initialMode` | `'NORMAL' \| 'THEATER' \| 'FULLSCREEN'` | `'NORMAL'` | Starting layout mode for the viewer |
| `showPreviewCards` | `boolean` | `true` | Shows or hides the preview rail at the bottom |
| `hideNavbar` | `boolean` | `false` | Removes the built-in header spacing |
| `autoplay` | `boolean` | `true` | Starts playback automatically when the media is ready |
| `initialMuted` | `boolean` | `false` | Sets the initial mute state for video playback |
| `auth` | `IAuth` | `noOpAuth` | Enables owner-aware controls |
| `queue` | `IQueue` | `noOpQueue` | Connects the viewer to queue and next-up flows |
| `keyboard` | `IKeyboardShortcuts` | `noOpKeyboardShortcuts` | Injects a keyboard abstraction for host apps |
| `enableQueue` | `boolean` | `true` | Turns queue behavior on or off |
| `enableKeyboardShortcuts` | `boolean` | `true` | Turns keyboard shortcuts on or off |
| `apiClient` | `MediaApiClient` | - | Enables server-backed media hydration |
| `enableServerFeatures` | `boolean` | `true` | Enables media loading and metadata callbacks via the API client |
| `onMediaLoaded` | `(media: MediaItem) => void` | - | Called after server data has been loaded |
| `onMetadataLoaded` | `(metadata) => void` | - | Called when duration or dimension metadata becomes available |
