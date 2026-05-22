# MediaCard — View Classification

> **Generated:** 2026-05-14 (fresh) | **Meta version:** 0.3.0
> **Scope:** `packages/sui-media/src/components/MediaCard`
> **Product:** `SC_PRODUCT_MEDIACARD.md` — MediaCard

A "view" here = a distinct rendered surface that a user can directly perceive. `MediaCard` is a single composite component, but it composes multiple overlay surfaces (overlay controls, progress bar, thumbnail strip) and renders meaningfully different layouts based on media type, ownership, payment, selection, and server-fetch state. Each of those is documented below as a sub-view.

The component is consumed embedded inside host pages (galleries, grids, profile pages) rather than as a routed page, so the views here are component-internal surfaces — not URLs.

---

## 1. View Inventory

| # | View | Source | Trigger |
|---|------|--------|---------|
| 1 | Media Card Tile (root surface) | `MediaCard.tsx` | Always rendered |
| 2 | Media Display Area | `MediaCard.tsx` (lines 393–615) | Always rendered inside tile |
| 3 | Card Content / Info Footer | `MediaCard.tsx` (lines 618–716) | Rendered when `info={true}` |
| 4 | Hover Overlay Controls | `MediaCard.tsx` (lines 514–594) | `isHovering && !minimalMode && !globalSelectionMode` |
| 5 | Selection Checkbox Overlay | `MediaCard.tsx` (lines 378–390) | `globalSelectionMode === true` |
| 6 | Paid Content Lock Overlay | `MediaCard.tsx` (lines 597–614) | `requiresPayment && !isOwner` |
| 7 | Video Progress Bar Overlay | `VideoProgressBar.tsx` | `mediaType === 'video' && item.duration` (visible on hover) |
| 8 | Thumbnail Strip Overlay | `ThumbnailStrip.tsx` | Progress bar visible AND `spriteUrl + spriteConfig` present |
| 9 | Thumbnail Generation Loading Overlay | `MediaCard.tsx` (lines 409–426) | `serverThumbnail.isLoading` |
| 10 | Thumbnail Generation Error Toast | `MediaCard.tsx` (lines 429–458) | `serverThumbnail.error && serverThumbnail.canRetry` |

---

## 2. View Details

### 2.1 Media Card Tile (Root Surface)

- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Location:** `MediaCard.tsx` — root `<Card>` (lines 351–718)
- **Regions:**
  | Zone | Component / Role |
  |------|------------------|
  | Outer frame | MUI `Card` with conditional dark `appearance` styling |
  | Selection overlay (top-left) | `Checkbox` (when `globalSelectionMode`) |
  | Media display area | `<Box data-testid="media-card-media">` containing `<video>` or `CardMedia` |
  | Info footer | `CardContent` with title, description, duration, views, source link |
- **States:**
  - **Default (light)** — `appearance === 'default'`
  - **Dark surface** — `appearance === 'dark'` adds slate-blue background, white text, glow shadow
  - **Selection mode** — `globalSelectionMode === true` swaps tile cursor to `pointer`, click toggles selection instead of activating media
  - **Square mode** — `squareMode === true` forces 1:1 aspect ratio (`aspectRatio = 100`)
  - **Minimal mode** — `minimalMode === true` suppresses hover overlay controls
  - **Hidden / out-of-viewport** — `isVisible === false` swaps `<video>` for an `<img>` thumbnail to avoid loading media off-screen

### 2.2 Media Display Area

- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Location:** `MediaCard.tsx` (lines 393–615)
- **Regions:**
  | Zone | Component / Role |
  |------|------------------|
  | Aspect-ratio box | `<Box>` with `paddingBottom: ${aspectRatio}%` |
  | Video element | `<video ref={videoRef}>` with `poster`, `muted`, `playsInline`, `preload="metadata"` |
  | Image fallback | `CardMedia component="img"` (used for images, hidden videos, and paid non-owner views) |
  | Progress bar | `<VideoProgressBar>` (see view 7) |
  | Hover overlay | Action button row (see view 4) |
  | Lock overlay | Paid-content gate (see view 6) |
- **States:**
  - **Image item** — `mediaType === 'image'` renders `CardMedia` only
  - **Video — preview-eligible** — `mediaType === 'video' && isVisible && !requiresPayment` renders `<video>`; muted hover preview loops
  - **Video — paid/locked for non-owner** — falls back to image (`paidThumbnail` if present)
  - **Video — hidden** — `isVisible === false` renders image (poster only)
  - **Hover preview playing** — `isHovering && !isHoverPreviewSuppressed && !isInlinePlaying` — muted, looped, no controls
  - **Inline playback** — `inlinePlayback === true` + click activates `isInlinePlaying`: native controls, unmuted, non-looping
  - **Inline playback paused** — clicking again while playing pauses and sets `isHoverPreviewSuppressed` so hover does not resume
  - **No-thumbnail-available** — `thumbnailUrl` undefined: black `backgroundColor: '#000'` shows through

### 2.3 Card Content / Info Footer

- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Location:** `MediaCard.tsx` (lines 618–716)
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Title | `Typography variant="body2"` (`item.title` or "Untitled") |
  | Description | `Typography variant="body2"` (optional, `item.description`) |
  | Duration | `Typography variant="caption"` via `formatDuration(...)`, with server-verified `✓` mark when `metadata.source === 'server'` |
  | Views | `Typography variant="caption"` (`item.views`) |
  | Source link | `Typography component="a"` to `item.sourceUrl` with `sourceLabel` fallback |
  | Metadata loading hint | `(loading metadata...)` caption |
- **States:**
  - **Hidden** — `info === false` (default) skips this block entirely
  - **Light / Dark** — `appearance` switches caption / link colors (`#38bdf8` link on dark, `primary.main` on light)
  - **Populated** — at least title rendered
  - **Loading metadata** — `metadata.isLoading === true` appends the loading caption
  - **Server-verified duration** — `metadata.source === 'server'` adds inline `success.main` checkmark
  - **No views / no description / no source** — corresponding rows are omitted

### 2.4 Hover Overlay Controls

- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Location:** `MediaCard.tsx` (lines 514–594)
- **Regions:**
  | Zone | Component / Action |
  |------|--------------------|
  | Top-left | `IconButton` with `PlayArrowIcon` → `handleMediaClick` |
  | Top-right (owner only) | Row of `IconButton`s: `EditIcon`, `PublicIcon`/`LockIcon`, `DeleteIcon` |
  | Gradient backdrop | `linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)` |
- **States:**
  - **Hidden** — `!isHovering || minimalMode || globalSelectionMode`
  - **Viewer (non-owner)** — only play button shown (top-left)
  - **Owner** — play button + edit/public/delete row when corresponding `on*Click` handlers are provided
  - **Public toggle variants** — icon flips between `PublicIcon` (currently public) and `LockIcon` (private/other)
  - **Partial owner controls** — each owner button only renders if its callback prop is present
  - **Action labels** — play button uses `${isInlinePlaying ? 'Pause' : 'Play'} ${mediaTitle}` for a11y

### 2.5 Selection Checkbox Overlay

- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Location:** `MediaCard.tsx` (lines 378–390)
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Top-left absolute (z=10) | MUI `Checkbox` |
- **States:**
  - **Hidden** — `globalSelectionMode === false`
  - **Unselected** — `isSelected === false`
  - **Selected** — `isSelected === true` (also reflected in `modeState.selectState.selected`)
  - **No-op (missing `_id`)** — `handleSelectionToggle` returns early when `item._id` is undefined

### 2.6 Paid Content Lock Overlay

- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Location:** `MediaCard.tsx` (lines 597–614)
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Center, absolutely positioned | `LockIcon` (48px) + price `Typography` ("`{price}` sats") |
- **States:**
  - **Visible** — `requiresPayment && !isOwner` (i.e. `publicity === 'paid'` && `price > 0` && current user is not the owner)
  - **Hidden for owner** — `auth.isOwner(item.author)` returns true
  - **Hidden for non-paid** — `publicity !== 'paid'` or `price === 0/undefined`
  - **Click → purchase flow** — `handleViewClick` invokes `payment.requestPayment(...)`; failures log to console (no UI yet)

### 2.7 Video Progress Bar Overlay

- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Location:** `VideoProgressBar.tsx` (entire file)
- **Regions:**
  | Zone | Component (styled) | Role |
  |------|--------------------|------|
  | Wrapper | `ProgressAreaWrapper` | Owns shared hover state |
  | Hover zone | `HoverZone` (100px tall, invisible) | Extends interactive area above the bar |
  | Bar track | `ProgressBarContainer` (3px, expands to 6px on hover) | Click/drag target, `role="slider"` |
  | Fill | `ProgressBarFill` (red `#f44336`) | Width = `currentTime / duration` |
  | Scrubber knob | `ProgressScrubber` (12px circle) | Appears on hover/drag |
  | Time tooltip | `TimeTooltip` | Shown only when no sprite/thumbnail strip |
- **States:**
  - **Hidden** — `visible === false` (component returns `null`); also gated by parent on `isHovering`
  - **Idle** — visible but no hover/drag: thin red bar, no knob, no tooltip
  - **Hovering** — bar expands to 6px, knob and tooltip become visible
  - **Dragging** — `isDragging === true`: cursor `grabbing`, knob scaled 1.2×, document-level listeners track seek; `mouseleave` does not clear hover until release
  - **Sprite available** — `hasThumbnailStrip === true`: tooltip suppressed in favor of `ThumbnailStrip`
  - **No sprite** — tooltip rendered with `formatTime(hoverTime)` (`MM:SS` or `HH:MM:SS`)
  - **Non-interactive** — `interactive === false` or no `onSeek` callback: clicks/drags ignored, cursor reverts to `default`
  - **Zero duration** — `duration <= 0` ignores click/drag; `progress` clamped to `[0, 100]`

### 2.8 Thumbnail Strip Overlay

- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Location:** `ThumbnailStrip.tsx`
- **Regions:**
  | Zone | Component (styled) |
  |------|--------------------|
  | Strip container | `StripContainer` (absolute, full-width, gradient backdrop) |
  | Frames row | `ThumbnailsContainer` (flex row, gap 0.25, click-seekable) |
  | Individual frames | `ThumbnailFrame` (CSS sprite-positioned via `MediaCard.utils#getSpritePosition`) |
- **States:**
  - **Hidden** — `visible === false` or strip suppressed by `hideThumbnailStrip` on `VideoProgressBar`
  - **Visible** — `visible === true` fades in (`opacity 0→1`, `translateY 4px→0`)
  - **Frame highlighted** — `isActive` frame corresponds to current playback position
  - **Responsive** — `theme.breakpoints.down('sm')` tightens padding
  - **Click-to-seek** — strip itself is interactive cursor `pointer` and forwards seek to `onSeek`

### 2.9 Thumbnail Generation Loading Overlay

- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Location:** `MediaCard.tsx` (lines 409–426) — backed by `useServerThumbnail.ts`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Full-area dim backdrop | `<Box>` with `rgba(0,0,0,0.7)` |
  | Centered spinner | `CircularProgress size={40}` white |
- **States:**
  - **Visible** — `serverThumbnail.isLoading === true` (auto-generating because `item.thumbnail` and `item.paidThumbnail` are both falsy)
  - **Hidden** — once `serverThumbnail.thumbnailUrl` resolves OR `isLoading` flips to false
  - **Bypassed** — `enableServerFeatures === false` or no `apiClient` (hook is given `undefined`, loading never trips)

### 2.10 Thumbnail Generation Error Toast

- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Location:** `MediaCard.tsx` (lines 429–458)
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Top-right corner | MUI `Alert severity="error"` with translucent red background |
  | Retry control | `Button` with `RefreshIcon` → `serverThumbnail.retry()` |
- **States:**
  - **Hidden** — `serverThumbnail.error` falsy OR `canRetry === false`
  - **Retryable error** — both flags true; "Thumbnail failed" alert with `Retry` button (stops propagation so retry click doesn't activate media)
  - **Non-retryable / exhausted retries** — `canRetry === false`: alert is suppressed; card falls back to whatever `thumbnailUrl` resolved last

---

## 3. State Combinations (Cheat-Sheet)

The same `MediaCard` instance can be in several orthogonal state axes simultaneously. The matrix below names each axis and notes which views/regions it gates.

| Axis | Values | Affects |
|------|--------|---------|
| Media type | `image` \| `video` \| `album` | 2.2 (video vs `<img>`), 2.7 (only video), 2.8 (only video w/ sprite) |
| Visibility | `isVisible` true/false | 2.2 (falls back to image when off-screen) |
| Ownership | `isOwner` true/false | 2.4 (owner controls), 2.6 (lock for non-owners only) |
| Publicity / paywall | `public` \| `private` \| `paid` \| `subscription` | 2.6 (paid-only), 2.4 toggle icon |
| Selection mode | `globalSelectionMode` true/false | 2.5 visible, 2.4 hidden, root click hijacked |
| Minimal mode | `minimalMode` true/false | 2.4 hidden when minimal |
| Info footer | `info` true/false | 2.3 |
| Inline playback | `inlinePlayback` + `isInlinePlaying` | 2.2 controls/loop/muted flags |
| Hover | `isHovering`, `isHoverPreviewSuppressed` | 2.2 hover preview, 2.4, 2.7 visibility |
| Server-thumbnail | `serverThumbnail.{isLoading,error,canRetry,thumbnailUrl}` | 2.9, 2.10, thumbnail URL precedence |
| Metadata source | `metadata.{isLoading, source, duration, width, height}` | 2.3 footer (✓ mark, loading hint), aspect ratio |
| Appearance | `default` \| `dark` | 2.1 frame, 2.3 footer text/link colors |
| Square mode | `squareMode` true/false | 2.1 / 2.2 aspect ratio |

---

## 4. Storybook Coverage

`MediaCard.stories.tsx` exposes each of the above as an isolated visual story. Cross-reference for QA:

| Story export | Demonstrates views |
|--------------|--------------------|
| `BasicVideo` / `BasicImage` | 2.1, 2.2, 2.3 default light state |
| `SquareMode` | 2.1 with forced 1:1 aspect |
| `OwnerContent` | 2.4 owner controls (edit/public/delete) |
| `ViewerContent` | 2.4 viewer (play-only) |
| `PaidContent` | 2.6 lock overlay for non-owner |
| `OwnPaidContent` | 2.6 hidden because owner |
| `WithPaymentIntegration` | 2.6 → `payment.requestPayment` flow |
| `WithQueueIntegration` | 2.4 view click → queue side effect |
| `SelectionMode` | 2.5 checkbox + multi-tile selection |
| `MinimalMode` | 2.4 suppressed via `minimalMode` |
| `VideoWithProgressTracking` | 2.7 + 2.8 (sprite hover strip) |
| `CustomStyling` | 2.1 `sx` override |
| `GridLayout` | 2.1 + 2.2 in square grid |
| `WithRouterIntegration` | 2.2 → `router.navigate('/media/:id')` default |
| `CompleteIntegration` | All views with auth + payment + queue + router |

Loading and error overlays (2.9, 2.10) are driven by `useServerThumbnail` and currently have no dedicated story — they appear only against a live `apiClient`.
