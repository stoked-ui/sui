---
productId: media
title: MediaCard
githubLabel: 'MediaCard'
packageName: '@stoked-ui/media'
---

# MediaCard

<p class="description">A card component for displaying media items with thumbnail strips and video progress bars.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Introduction

The `MediaCard` component displays a media item as a card with a thumbnail preview, metadata, and interactive controls. For video files, it includes a thumbnail strip and progress bar.

## Usage

```tsx
import { MediaCard } from '@stoked-ui/media';

function MediaGallery() {
  return (
    <MediaCard
      title="My Video"
      src="/media/video.mp4"
      type="video/mp4"
      thumbnail="/thumbnails/video-thumb.jpg"
    />
  );
}
```

## Sub-components

### ThumbnailStrip

Displays a strip of thumbnail frames extracted from a video.

```tsx
import { ThumbnailStrip } from '@stoked-ui/media';

<ThumbnailStrip
  src="/media/video.mp4"
  count={8}
  width={120}
/>
```

### VideoProgressBar

A progress bar overlay for video playback with seek support.

```tsx
import { VideoProgressBar } from '@stoked-ui/media';

<VideoProgressBar
  duration={120}
  currentTime={45}
  onSeek={(time) => console.log('Seek to', time)}
/>
```

## Props

### MediaCard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Display title for the media item |
| `src` | `string` | — | Source URL of the media file |
| `type` | `string` | — | MIME type of the media file |
| `thumbnail` | `string` | — | Thumbnail image URL |
| `onClick` | `() => void` | — | Click handler for the card |
| `showThumbnailStrip` | `boolean` | `true` | Show thumbnail strip for videos |

### ThumbnailStrip

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Video source URL |
| `count` | `number` | `6` | Number of thumbnail frames |
| `width` | `number` | `100` | Width of each thumbnail |

### VideoProgressBar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `duration` | `number` | — | Total duration in seconds |
| `currentTime` | `number` | — | Current playback time |
| `onSeek` | `(time: number) => void` | — | Seek callback |
