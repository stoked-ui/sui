# MediaCard — User Flow Classification

> **Generated:** 2026-05-14 (fresh) | **Meta version:** 0.3.0
> **Scope:** `packages/sui-media/src/components/MediaCard`
> **Product:** `SC_PRODUCT_MEDIACARD.md` — MediaCard

A "flow" here = an end-to-end user journey that crosses one or more views (`SC_VIEWS.md`) and resolves against the `MediaCard` component surface. Because `MediaCard` is a presentational tile embedded in host pages — not a routed page — every flow starts with the card already mounted inside a parent gallery, grid, profile, or showcase. Flows below trace the user's interaction starting from that mounted card and follow side-effects through the abstraction layers (`router`, `auth`, `payment`, `queue`, `apiClient`) declared in `MediaCard.types.ts`.

Source-of-truth files referenced throughout:

- `MediaCard.tsx` — root component, all click/keyboard handlers
- `VideoProgressBar.tsx` — scrub/seek surface
- `ThumbnailStrip.tsx` — sprite hover preview
- `useHybridMetadata.ts` — client/server metadata strategy
- `useServerThumbnail.ts` — server thumbnail generation + retry
- `MediaCard.utils.ts` — `calculateAspectRatio`, `formatDuration`, `getSpritePosition`
- `MediaCard.types.ts` — `MediaCardProps`, `ExtendedMediaItem`, `MediaCardModeState`
- `../../abstractions/{Router,Auth,Payment,Queue}` — no-op defaults swap in when host omits them

Flows are grouped by intent:

1. Passive discovery (hover, preview, scrub)
2. Active playback (open viewer, inline play)
3. Ownership management (edit, delete, visibility toggle)
4. Selection & batch operations
5. Monetised access (paid content purchase)
6. Server-driven enrichment (metadata, thumbnail, retry)
7. Accessibility & keyboard navigation

All flows below reference `SC_PRODUCT_MEDIACARD.md` as their product surface.

---

## 1. Passive Discovery

### 1.1 Hover-Preview a Video Tile

- **Actor:** Anonymous or authenticated viewer
- **Goal:** Sample a video without committing to a full open — get a feel for content before clicking
- **Entry points:** Mouse pointer enters the card region in a gallery/grid host
- **Steps:**
  1. Host page mounts `MediaCard` with `item.mediaType === 'video'`, `isVisible === true`, `requiresPayment === false`.
  2. User moves pointer over the tile → `onMouseEnter` on the root `Card` sets `isHovering = true` (`MediaCard.tsx:371`).
  3. The hover `useEffect` (`MediaCard.tsx:317`) runs `playVideo(true)` on `videoRef.current` — muted, looped, no controls.
  4. The 2.7 `VideoProgressBar` becomes visible (`visible={isHovering}`) showing a 3 → 6px red bar.
  5. The 2.4 Hover Overlay Controls fade in (top-left Play, plus owner row if `isOwner`).
  6. User moves pointer off the card → `onMouseLeave` sets `isHovering = false` and clears `isHoverPreviewSuppressed`; `useEffect` calls `stopHoverPreview()` → `video.pause()` + rewind to 0.
- **Views:** 2.1 Media Card Tile · 2.2 Media Display Area (hover-preview state) · 2.4 Hover Overlay Controls · 2.7 Video Progress Bar (idle/hovering)
- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Side effects:** none — preview is muted, looped, never reports analytics

### 1.2 Scrub the Progress Bar (No Sprite)

- **Actor:** Viewer hovering a video tile
- **Goal:** Jump to a specific timestamp in the inline preview / playback
- **Entry points:** Pointer interaction with the visible `VideoProgressBar`
- **Steps:**
  1. Continues from §1.1 — `VideoProgressBar` already visible.
  2. User moves over the `HoverZone` (`VideoProgressBar.tsx`) → bar expands to 6px, knob + `TimeTooltip` appear (tooltip shown because `hasThumbnailStrip === false`).
  3. User clicks the track → `onSeek(time)` callback in `MediaCard.tsx:505` sets `videoRef.current.currentTime = time`.
  4. `onTimeUpdate` on the `<video>` (`MediaCard.tsx:470`) fires `handleTimeUpdate`, updating local `currentTime` and the fill width.
  5. User drags the knob → document-level `mousemove` / `mouseup` listeners track and finalize the seek (`isDragging` state).
- **Views:** 2.7 Video Progress Bar (hovering / dragging)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 1.3 Scrub With Sprite Thumbnail Strip

- **Actor:** Viewer hovering a video tile whose `item.scrubberSprite + scrubberSpriteConfig` are present
- **Goal:** See visual frame previews while scrubbing instead of a numeric tooltip
- **Entry points:** Hover the progress bar on a sprite-equipped video
- **Steps:**
  1. From §1.1, `VideoProgressBar` mounts `ThumbnailStrip` because `spriteUrl + spriteConfig` are truthy (`MediaCard.tsx:503`).
  2. Hovering the bar fades the strip in (`opacity 0→1`, `translateY 4px→0`).
  3. Each `ThumbnailFrame` is positioned via `getSpritePosition` (`MediaCard.utils.ts`) reading `framesPerRow`, `frameWidth`, `frameHeight` from `scrubberSpriteConfig`.
  4. Active frame (`isActive`) highlights the frame corresponding to current playback.
  5. Clicking a frame → `onSeek(time)` propagates back to `MediaCard.tsx` (same as §1.2 step 3).
- **Views:** 2.7 Video Progress Bar (sprite mode) · 2.8 Thumbnail Strip Overlay
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 1.4 Off-Screen Visibility Optimisation

- **Actor:** Host gallery using an intersection observer
- **Goal:** Avoid loading `<video>` elements for cards outside the viewport
- **Entry points:** Host toggles `isVisible` based on scroll position
- **Steps:**
  1. Host renders many cards; passes `isVisible={false}` to those outside the viewport.
  2. `canPreviewVideo` evaluates false (`MediaCard.tsx:154`) → branch in `MediaCard.tsx:460` renders `CardMedia component="img"` with `thumbnailUrl` instead of `<video>`.
  3. When the card scrolls into view, host flips `isVisible = true` → re-render swaps in the real `<video>` element; hover preview from §1.1 becomes possible.
- **Views:** 2.2 Media Display Area (hidden / image-fallback state)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

---

## 2. Active Playback

### 2.1 Open Full Media Viewer (Default Navigation)

- **Actor:** Viewer (any auth state)
- **Goal:** Open the dedicated media viewer for full playback / detail
- **Entry points:** Click the media display area, click the top-left Play button, press Enter/Space when the media area is focused
- **Steps:**
  1. User clicks the `<Box data-testid="media-card-media">` (`MediaCard.tsx:393`) OR the overlay `IconButton` with `PlayArrowIcon`.
  2. `handleMediaClick` → `activateMedia` (`MediaCard.tsx:233`).
  3. `globalSelectionMode === false`, `inlinePlayback === false` (or item is not a previewable video) → falls through to `handleViewClick`.
  4. `requiresPayment && !isOwner` is false → branch in `MediaCard.tsx:186`:
     - If `onViewClick` prop is provided → host callback is invoked with `item`. (Typical: host opens its own `MediaViewer` overlay.)
     - Otherwise → `router.navigate('/media/${item._id}')` (default: `noOpRouter` no-op; real apps inject Next.js router).
- **Views:** 2.1 Media Card Tile · 2.2 Media Display Area · 2.4 Hover Overlay Controls (play button)
- **Products:** `SC_PRODUCT_MEDIACARD.md`
- **Cross-flow:** typically continues into the `@stoked-ui/media` `MediaViewer` (out of scope here)

### 2.2 Inline Playback Inside the Card

- **Actor:** Viewer on a host that opts into in-place playback
- **Goal:** Play the video inside the card without leaving the gallery
- **Entry points:** Host passes `inlinePlayback={true}`; user clicks the media area or presses Enter/Space
- **Steps:**
  1. Mounting requirements: `mediaType === 'video'`, `inlinePlayback === true`, `canPreviewVideo === true`, `globalSelectionMode === false`.
  2. User activates the media → `activateMedia` enters the `inlinePlayback` branch (`MediaCard.tsx:240`).
  3. `setIsInlinePlaying(true)` + `setIsHoverPreviewSuppressed(false)` + `playVideo(false)` — unmuted, non-looping, native controls visible.
  4. The hover preview `useEffect` re-runs: because `isInlinePlaying === true`, it switches `video.loop = false`, `video.controls = true` and does NOT call `stopHoverPreview`.
  5. User clicks again to pause → branch in `MediaCard.tsx:246` calls `stopHoverPreview(false)` (no rewind), sets `isInlinePlaying = false`, sets `isHoverPreviewSuppressed = true` so mouse-still-hovering does not silently resume the muted preview.
  6. Video natural-ends → `<video onEnded>` (`MediaCard.tsx:471`) flips `isInlinePlaying = false`.
  7. Source change (`mediaUrl` effect, `MediaCard.tsx:346`) resets both flags so a swapped item starts clean.
- **Views:** 2.2 Media Display Area (inline-playback state)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 2.3 Keyboard Activation

- **Actor:** Keyboard-only user / accessibility tooling
- **Goal:** Activate the same play/open behaviour without a mouse
- **Entry points:** Tab to the media display area, press Enter or Space
- **Steps:**
  1. The `<Box data-testid="media-card-media">` is `role="button"` with `tabIndex={0}` and `aria-label={mediaActionLabel}` where label is `${isInlinePlaying ? 'Pause' : 'Play'} ${mediaTitle}` (`MediaCard.tsx:155`, `396`).
  2. `onKeyDown` → `handleMediaKeyDown` rejects everything except Enter / Space; otherwise `event.preventDefault()` then `activateMedia(event)` (`MediaCard.tsx:266`).
  3. Resolves through the same branch tree as §2.1 / §2.2 above.
  4. When `globalSelectionMode === true`, the box's `role` and `aria-label` are intentionally undefined and `tabIndex` is removed — the parent `Card` swallows the click for selection instead (see §4.x).
- **Views:** 2.2 Media Display Area (focus state) · 2.4 Hover Overlay Controls
- **Products:** `SC_PRODUCT_MEDIACARD.md`

---

## 3. Ownership Management

### 3.1 Edit Own Media

- **Actor:** Owner (auth user whose id matches `item.author` per `auth.isOwner`)
- **Goal:** Open the host's edit surface for this item
- **Entry points:** Hover the card → top-right Edit (pencil) icon button
- **Steps:**
  1. `currentUser = auth.getCurrentUser()`; `isOwner = auth.isOwner(item.author || '')` (`MediaCard.tsx:137–138`).
  2. User hovers → 2.4 Hover Overlay Controls render the owner row only when `isOwner && onEditClick`.
  3. Click → inner `onClick` `event.stopPropagation()` prevents bubbling to media activation, then `onEditClick(item)` is fired (`MediaCard.tsx:547`).
  4. Host responds (opens edit dialog, routes to editor, etc.).
- **Views:** 2.4 Hover Overlay Controls (owner row)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 3.2 Toggle Public / Private Visibility

- **Actor:** Owner
- **Goal:** Flip `item.publicity` between public and private
- **Entry points:** Hover → top-right Public/Lock icon
- **Steps:**
  1. Same owner gating as §3.1; requires `onTogglePublic` prop.
  2. Icon reflects current state: `item.publicity === 'public'` renders `PublicIcon`; otherwise `LockIcon` (`MediaCard.tsx:573`).
  3. Click → `event.stopPropagation()` + `onTogglePublic(item)` (host persists the change).
  4. Host typically updates `item.publicity` upstream → re-render flips the icon and (if applicable) hides the 2.6 Paid Lock for owners.
- **Views:** 2.4 Hover Overlay Controls (visibility toggle)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 3.3 Toggle Rating (Adult / GA)

- **Actor:** Owner
- **Goal:** Switch `item.rating` between mature and general-audience
- **Entry points:** Host wires `onToggleAdult` to an owner action; not currently wired into the default overlay layout
- **Steps:**
  1. Prop `onToggleAdult` is declared (`MediaCard.types.ts:291`) and accepted by `MediaCard`.
  2. Default overlay does not render this toggle (no built-in button) — flow exists for host composition.
  3. Host renders its own trigger → calls `onToggleAdult(item)` directly.
- **Views:** 2.4 Hover Overlay Controls (host-composed extension)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 3.4 Delete Own Media

- **Actor:** Owner
- **Goal:** Remove the media item
- **Entry points:** Hover → top-right Delete icon
- **Steps:**
  1. Owner row renders Delete button when `isOwner && onDeleteClick`.
  2. Click → `event.stopPropagation()` + `onDeleteClick(item)` (`MediaCard.tsx:578`).
  3. Card itself does not show a confirmation; host is expected to confirm and persist.
- **Views:** 2.4 Hover Overlay Controls (delete button)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 3.5 Hide From Personal Feed

- **Actor:** Any viewer
- **Goal:** Suppress a card from the host's current view without deleting
- **Entry points:** Host wires `onHide`; not currently rendered in the default overlay
- **Steps:**
  1. `onHide` prop is declared (`MediaCard.types.ts:294`) — typically hidden in viewer-level UX (e.g. a kebab menu the host adds).
  2. Host invokes `onHide(item)` directly.
- **Views:** 2.4 Hover Overlay Controls (host-composed)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

---

## 4. Selection & Batch Operations

### 4.1 Enter Selection Mode From The Host

- **Actor:** Host (typically a gallery toolbar)
- **Goal:** Allow batch operations across multiple cards
- **Entry points:** Host sets `globalSelectionMode={true}` on every `MediaCard`
- **Steps:**
  1. With `globalSelectionMode === true`:
     - Root `Card` cursor becomes `pointer` and its `onClick` is wired to `handleSelectionToggle` (`MediaCard.tsx:376`).
     - 2.5 Selection Checkbox Overlay renders top-left (`MediaCard.tsx:379`).
     - 2.4 Hover Overlay Controls are suppressed; `role`/`aria-label`/`tabIndex` on the media area are cleared so it no longer behaves like an activation button.
  2. The card is now in selection mode and ready for §4.2.
- **Views:** 2.1 Media Card Tile (selection state) · 2.5 Selection Checkbox Overlay
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 4.2 Toggle Selection On / Off

- **Actor:** Viewer in a selection-mode host
- **Goal:** Add / remove the card from the active selection list
- **Entry points:** Click anywhere on the card, OR click the checkbox directly
- **Steps:**
  1. Click → `handleSelectionToggle` (`MediaCard.tsx:167`).
  2. Early-out: if `item._id` is missing, the toggle is a no-op.
  3. `setModeState(prev => ...)` mutates `prev.selectState.selected`:
     - If `_id` already in the list → filter it out (deselect).
     - Otherwise → append it (select).
  4. Parent re-renders with `isSelected` flipped, MUI `Checkbox` reflects the new state.
- **Views:** 2.5 Selection Checkbox Overlay (selected / unselected)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 4.3 Batch Operation (Selection Persistence Across Cards)

- **Actor:** Host performing a multi-card action (delete, share, move…)
- **Goal:** Read the aggregate selection from `modeState`
- **Entry points:** Host toolbar buttons read `modeState.selectState.selected`
- **Steps:**
  1. Each card's selection toggle (§4.2) updates the same `modeState` object the host owns.
  2. Host iterates `modeState.selectState.selected` to perform the batch operation (the actual operation is host-level, not part of `MediaCard`).
  3. Host typically calls `setModeState({ mode: 'view' })` when done — `globalSelectionMode` flips off and overlays revert.
- **Views:** 2.5 Selection Checkbox Overlay (selected state aggregate)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

---

## 5. Monetised Access

### 5.1 Discover Paid Content (Locked Tile)

- **Actor:** Non-owner viewer
- **Goal:** Recognise that an item is gated and see the price
- **Entry points:** Card mounts with `item.publicity === 'paid'`, `item.price > 0`, viewer is not `isOwner`
- **Steps:**
  1. `requiresPayment` evaluates true (`MediaCard.tsx:141`).
  2. Render branch swaps `<video>` for an `<img>` of `paidThumbnail` (or `thumbnail`).
  3. 2.6 Paid Content Lock Overlay renders centred: large `LockIcon` + `${price} sats` caption (`MediaCard.tsx:597`).
  4. Hover preview is suppressed because `canPreviewVideo === false` when `requiresPayment === true`.
- **Views:** 2.2 Media Display Area (paid/locked) · 2.6 Paid Content Lock Overlay
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 5.2 Initiate Purchase

- **Actor:** Non-owner viewer interested in buying access
- **Goal:** Trigger a payment request through the host's `IPayment` abstraction
- **Entry points:** Click the locked tile (or its play overlay) — same activation surface as §2.1
- **Steps:**
  1. Click → `handleMediaClick` → `activateMedia` → `handleViewClick`.
  2. Branch in `MediaCard.tsx:187`: `requiresPayment && !isOwner` → `handlePurchase()`.
  3. `handlePurchase` (`MediaCard.tsx:276`) calls `payment.requestPayment({ amount: item.price, currency: 'BTC', description: 'Purchase: <title>', resourceId: item._id })`.
  4. Promise resolves → the response is currently `console.log`'d only (`MediaCard.tsx:287`). A host implementation is expected to present a payment dialog and re-render the card with the user added to `canAccess` (which flips `isOwner`-style gating off in the host's auth abstraction).
  5. Promise rejects → `console.error` (no user-facing toast yet).
- **Views:** 2.6 Paid Content Lock Overlay (click target)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 5.3 Owner Viewing Their Own Paid Content

- **Actor:** Owner of a `publicity === 'paid'` item
- **Goal:** Confirm that the lock overlay does not gate the owner
- **Entry points:** Same surface as §5.1, but `auth.isOwner(item.author)` returns true
- **Steps:**
  1. `requiresPayment && !isOwner` is false → 2.6 lock overlay is suppressed.
  2. Video preview/playback paths from §1 and §2 apply normally.
- **Views:** 2.2 Media Display Area (video preview) · 2.4 Hover Overlay Controls (owner row)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

---

## 6. Server-Driven Enrichment

### 6.1 Auto-Generate Server Thumbnail

- **Actor:** Card itself (no user input)
- **Goal:** Fill the missing thumbnail by asking the media API to generate one
- **Entry points:** Card mounts with `mediaType === 'video'`, neither `item.thumbnail` nor `item.paidThumbnail` is set, `enableServerFeatures` is truthy, and `apiClient` is provided
- **Steps:**
  1. `useServerThumbnail(item, apiClient, { autoGenerate: !item.thumbnail && !item.paidThumbnail })` mounts (`MediaCard.tsx:128`, `useServerThumbnail.ts:34`).
  2. Hook decides to request generation; sets `isLoading = true`.
  3. 2.9 Thumbnail Generation Loading Overlay renders (centred spinner over dim backdrop) — `MediaCard.tsx:409`.
  4. On success: hook returns `thumbnailUrl`; `thumbnailUrl` precedence in `MediaCard.tsx:144` prefers server thumbnail over `item.thumbnail`/`paidThumbnail`.
  5. Spinner unmounts; image/video poster updates.
- **Views:** 2.2 Media Display Area · 2.9 Thumbnail Generation Loading Overlay
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 6.2 Retry Failed Thumbnail Generation

- **Actor:** Viewer
- **Goal:** Recover from a failed thumbnail fetch without reloading the page
- **Entry points:** §6.1 fails → `serverThumbnail.error` truthy + `canRetry === true`
- **Steps:**
  1. 2.10 Thumbnail Generation Error Toast renders top-right with a "Thumbnail failed" `Alert` and a `Retry` button (`MediaCard.tsx:429`).
  2. User clicks `Retry` → `event.stopPropagation()` prevents activating the media, then `serverThumbnail.retry()` (`useServerThumbnail.ts:50`) bumps `retryCount` and clears `error` / `canRetry`.
  3. Hook re-runs the effect — back to §6.1 step 2.
  4. After exhausted retries (`canRetry === false`) the alert is suppressed; the card falls back to whatever `thumbnailUrl` resolved last (often `undefined`, showing the black backdrop).
- **Views:** 2.10 Thumbnail Generation Error Toast
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 6.3 Hybrid Metadata Resolution (Duration / Dimensions / Codec)

- **Actor:** Card itself
- **Goal:** Reconcile partial metadata from the item payload with authoritative values from the server
- **Entry points:** Card mounts for a video item that's missing `duration`, `width`, or `height` AND `enableServerFeatures && apiClient` are set
- **Steps:**
  1. `useHybridMetadata(item, apiClient, metadataStrategy, onMetadataLoaded)` runs (`useHybridMetadata.ts:45`).
  2. If item already has full metadata, hook short-circuits with `source: 'initial'`.
  3. Otherwise: decides between client-side extraction (HTML5 video probing) and server-side extraction based on file size and `metadataStrategy.preferServer`.
  4. While in flight: `metadata.isLoading === true`, the 2.3 Info Footer (when `info === true`) shows `(loading metadata...)`.
  5. On resolve: `setMetadata({ source: 'server' | 'client', ... })` updates duration/width/height; `onMetadataLoaded?.(metadata)` notifies the host.
  6. `calculateAspectRatio(metadata.width ?? item.width, metadata.height ?? item.height)` (`MediaCard.tsx:161`) updates the aspect-ratio box on the next render.
  7. When `metadata.source === 'server'`, the 2.3 Info Footer prints duration with a green `✓` ("Server-verified duration").
- **Views:** 2.1 Media Card Tile (aspect ratio update) · 2.3 Card Content / Info Footer (loading hint, ✓ mark)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 6.4 Disable Server Features (Pure-Client Mode)

- **Actor:** Host running without an API
- **Goal:** Render the card with only client-side data
- **Entry points:** Host passes `enableServerFeatures={false}` or omits `apiClient`
- **Steps:**
  1. `useHybridMetadata` and `useServerThumbnail` both receive `apiClient === undefined`.
  2. Neither hook fires its effect; 2.9 / 2.10 overlays never render; `metadata.source` stays `'initial'`.
  3. The card relies entirely on `item.thumbnail`/`paidThumbnail`/`duration`/`width`/`height` already present in the payload.
- **Views:** 2.1 Media Card Tile · 2.2 Media Display Area · 2.3 Card Content / Info Footer (no ✓, no loading hint)
- **Products:** `SC_PRODUCT_MEDIACARD.md`

---

## 7. Accessibility & Keyboard Navigation

### 7.1 Tab-Navigate Through A Gallery Of Cards

- **Actor:** Keyboard / screen-reader user
- **Goal:** Reach and operate any card without a pointer
- **Entry points:** Page load; user presses Tab
- **Steps:**
  1. Each card exposes one tab stop: the media display `<Box role="button" tabIndex={0}>` (`MediaCard.tsx:393–399`).
  2. Screen reader announces `aria-label={mediaActionLabel}` — `Play {title}` or `Pause {title}` depending on `isInlinePlaying`.
  3. Owner overlay buttons (Edit / Public / Delete) are `IconButton`s; their default MUI `aria-label`s come from the icons. When the host wants explicit labels it can wrap and pass them — the component does not currently set custom labels on the edit / delete / public buttons.
  4. In selection mode, the tab stop disappears (`tabIndex` undefined); the host's selection toolbar should provide a labelled checkbox or alternative trigger.
- **Views:** 2.1 Media Card Tile · 2.2 Media Display Area (focus state) · 2.4 Hover Overlay Controls
- **Products:** `SC_PRODUCT_MEDIACARD.md`

### 7.2 Activate With Enter Or Space

- See §2.3 above — same flow.

### 7.3 Reduced-Hover Surfaces (Touch)

- **Actor:** Touch user (no hover events)
- **Goal:** Reach the same play / open / selection affordances on touch devices
- **Entry points:** Tap the card
- **Steps:**
  1. Touch tap fires `onClick` on the media area or root card (selection mode).
  2. Because `isHovering` is mouse-driven, 2.4 Hover Overlay Controls and 2.7 Video Progress Bar may not appear on touch; the tap goes straight through to `handleViewClick`/`handleSelectionToggle`/`handlePurchase`.
  3. For owner controls on touch, hosts typically open a separate sheet — they're not directly reachable from `MediaCard` alone on touch.
- **Views:** 2.1 Media Card Tile · 2.2 Media Display Area
- **Products:** `SC_PRODUCT_MEDIACARD.md`

---

## 8. Entry-Point Index

| Entry surface | Triggers flow(s) |
|---|---|
| Pointer enters card | §1.1 Hover preview · §1.2 / §1.3 Scrub (after bar visible) |
| Pointer leaves card | Cleanup branch of §1.1 / §2.2 |
| Click / tap on media area (default) | §2.1 Open viewer · §5.2 Purchase (paid) |
| Click / tap on media area (`inlinePlayback`) | §2.2 Inline play |
| Click on root `Card` (`globalSelectionMode`) | §4.2 Toggle selection |
| Click play icon (overlay) | §2.1 / §2.2 |
| Click edit icon (overlay) | §3.1 |
| Click public/lock icon (overlay) | §3.2 |
| Click delete icon (overlay) | §3.4 |
| Checkbox (top-left, selection mode) | §4.2 |
| Click progress bar / drag scrubber | §1.2 / §1.3 |
| Click thumbnail strip frame | §1.3 (seek) |
| Click `Retry` on thumbnail error alert | §6.2 |
| Click source link in info footer | External navigation (`item.sourceUrl`, `target="_blank"`) |
| Keyboard Enter / Space on media area | §2.3 (and downstream §2.1 / §2.2) |
| Mount with `apiClient` + missing thumbnail | §6.1 (no user input) |
| Mount with `apiClient` + missing metadata | §6.3 (no user input) |
| `isVisible` prop transitions | §1.4 |

---

## 9. Abstraction Layer Touchpoints

Default abstractions (`noOpRouter`, `noOpAuth`, `noOpPayment`, `noOpQueue` from `../../abstractions`) make every flow non-destructive when a host forgets to inject real ones — the card still renders and clicks are inert.

| Abstraction | Method | Used in flow |
|---|---|---|
| `router.navigate(path)` | navigation | §2.1 (fallback when `onViewClick` omitted) |
| `auth.getCurrentUser()` | identity | §3.x ownership gating, §5.3 |
| `auth.isOwner(authorId)` | permission | §3.x, §5.1 / §5.3, §1.1 (owner overlay) |
| `payment.requestPayment({...})` | commerce | §5.2 |
| `queue.addItem({...})` | playlist | currently commented out (`MediaCard.tsx:297`) — flow reserved for future host wiring |
| `apiClient` (`MediaApiClient`) | server | §6.1 / §6.2 / §6.3 via `useServerThumbnail` and `useHybridMetadata` |
| `onUploadProgress` callback | upload | declared but not yet wired in the stub implementation; reserved for upload flow |
| `onMetadataLoaded` callback | server enrichment | §6.3 — fired when hybrid metadata resolves |

---

## 10. Flow ↔ View Coverage Matrix

| Flow | 2.1 Tile | 2.2 Display | 2.3 Footer | 2.4 Hover | 2.5 Checkbox | 2.6 Lock | 2.7 ProgBar | 2.8 Strip | 2.9 Loading | 2.10 Error |
|---|---|---|---|---|---|---|---|---|---|---|
| 1.1 Hover preview | • | • | | • | | | • | | | |
| 1.2 Scrub (no sprite) | | | | | | | • | | | |
| 1.3 Scrub (sprite) | | | | | | | • | • | | |
| 1.4 Off-screen | • | • | | | | | | | | |
| 2.1 Open viewer | • | • | | • | | | | | | |
| 2.2 Inline playback | • | • | | | | | | | | |
| 2.3 Keyboard activation | • | • | | • | | | | | | |
| 3.1 Edit | | | | • | | | | | | |
| 3.2 Toggle public | | | | • | | | | | | |
| 3.3 Toggle rating | | | | (host) | | | | | | |
| 3.4 Delete | | | | • | | | | | | |
| 3.5 Hide | | | | (host) | | | | | | |
| 4.1 Enter selection | • | | | | • | | | | | |
| 4.2 Toggle selection | • | | | | • | | | | | |
| 4.3 Batch operation | | | | | • | | | | | |
| 5.1 Locked tile | • | • | | | | • | | | | |
| 5.2 Purchase | | | | | | • | | | | |
| 5.3 Owner viewing paid | • | • | | • | | | | | | |
| 6.1 Server thumbnail | | • | | | | | | | • | |
| 6.2 Retry | | • | | | | | | | | • |
| 6.3 Hybrid metadata | • | | • | | | | | | | |
| 6.4 Pure client | • | • | • | | | | | | | |
| 7.1 Tab nav | • | • | | • | | | | | | |
| 7.3 Touch | • | • | | | | | | | | |

Each `•` cell maps the flow to the corresponding sub-view in `SC_VIEWS.md`.
