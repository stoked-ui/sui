---
productId: media
title: MediaCard
components: MediaCard, ThumbnailStrip, VideoProgressBar
githubLabel: 'MediaCard'
packageName: '@stoked-ui/media'
---

# MediaCard

<p class="description">A card component for displaying media items with thumbnail strips and video progress bars.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Introduction

The `MediaCard` component renders a single media item with a poster, metadata, hover actions, and optional purchase or selection flows. It is designed for gallery views where cards need to stay visually lightweight while still exposing richer controls on demand.

Each card is driven by three core inputs:

- `item` describes the asset to render.
- `modeState` keeps track of whether the grid is in view mode or batch selection mode.
- `setModeState` lets the card update shared selection state without owning the full gallery.

## Import

```tsx
import { MediaCard, ThumbnailStrip, VideoProgressBar } from '@stoked-ui/media';
```

## Basic usage

Start with a single `item`, then opt into the extra behaviors you need with props like `info`, `squareMode`, or the abstraction adapters (`auth`, `payment`, `router`, `queue`).

{{"demo": "MediaCardBasic.js", "bg": true}}

## Grid and selection flows

For batch actions, lift `modeState` to the parent gallery and pass `globalSelectionMode` plus `isSelected` for each card. This keeps selection logic consistent whether the grid is a masonry layout, a simple list, or a virtualized collection.

{{"demo": "MediaCardSelection.js", "bg": true}}

## Monetized and gated content

Locked content uses the same card surface. A paid card becomes purchasable when you provide a `payment` adapter and mark the item with `publicity: 'paid'` and a `price`.

{{"demo": "MediaCardMonetization.js", "bg": true}}

## Sub-components

### ThumbnailStrip

`ThumbnailStrip` renders a scrubber rail from a sprite sheet. It is useful when you already have server-generated frames and want a lightweight timeline preview without mounting a full player.

{{"demo": "ThumbnailStripBasic.js", "bg": true}}

### VideoProgressBar

`VideoProgressBar` is the hover-aware progress indicator used by `MediaCard`. You can also mount it directly in custom video surfaces when you want seek behavior and optional sprite previews without the rest of the card chrome.

{{"demo": "VideoProgressBarBasic.js", "bg": true}}

## Props

### MediaCard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `item` | `ExtendedMediaItem` | - | Media record used to render title, URLs, metadata, and access state |
| `modeState` | `MediaCardModeState` | - | Shared gallery mode state (`view` or `select`) |
| `setModeState` | `Dispatch<SetStateAction<MediaCardModeState>>` | - | Updates the lifted gallery mode and selection state |
| `info` | `boolean` | `false` | Shows the title, duration, and view count block below the poster |
| `minimalMode` | `boolean` | `false` | Removes the hover action overlay for tighter grid layouts |
| `squareMode` | `boolean` | `false` | Forces a 1:1 aspect ratio for gallery tiles |
| `globalSelectionMode` | `boolean` | `false` | Enables checkbox-style selection behavior across a grid |
| `isSelected` | `boolean` | `false` | Marks the card as selected when `globalSelectionMode` is enabled |
| `auth` | `IAuth` | `noOpAuth` | Lets the card reveal owner-only controls |
| `payment` | `IPayment` | `noOpPayment` | Handles purchases for paid content |
| `router` | `IRouter` | `noOpRouter` | Handles navigation when the card opens a detail page |
| `queue` | `IQueue` | `noOpQueue` | Connects the card to a playback queue |
| `apiClient` | `MediaApiClient` | - | Enables server-backed metadata and thumbnail generation |
| `enableServerFeatures` | `boolean` | `true` | Turns hybrid metadata and thumbnail generation on or off |
| `metadataStrategy` | `object` | - | Fine-tunes when metadata should prefer client or server extraction |

### ThumbnailStrip

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spriteUrl` | `string` | - | URL or data URI for the sprite sheet image |
| `spriteConfig` | `SpriteConfig` | - | Grid metadata for frame count, frame size, and sampling interval |
| `duration` | `number` | - | Total clip length in seconds |
| `currentTime` | `number` | - | Current playback position |
| `visible` | `boolean` | - | Controls whether the rail is interactive and visible |
| `onSeek` | `(time: number) => void` | - | Callback fired when the user scrubs a frame |

### VideoProgressBar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentTime` | `number` | - | Current playback position in seconds |
| `duration` | `number` | - | Total clip duration in seconds |
| `visible` | `boolean` | - | Controls whether the bar should be rendered |
| `onSeek` | `(time: number) => void` | - | Called when the user clicks or drags the scrubber |
| `interactive` | `boolean` | `true` | Disables click-to-seek when set to `false` |
| `showTooltip` | `boolean` | `true` | Shows the hover timestamp tooltip |
| `spriteUrl` | `string` | - | Optional sprite sheet image for hover previews |
| `spriteConfig` | `SpriteConfig` | - | Sprite metadata used with `spriteUrl` |
| `hideThumbnailStrip` | `boolean` | `false` | Prevents the hover strip from rendering even when sprite data exists |
