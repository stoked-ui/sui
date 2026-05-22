# MediaCard — Recommendations

Workspace: `packages/sui-media/src/components/MediaCard/`
Scope analyzed: `MediaCard.tsx` (721 LOC), `VideoProgressBar.tsx` (371 LOC), `ThumbnailStrip.tsx` (328 LOC), `MediaCard.types.ts` (353 LOC), `MediaCard.utils.ts` (212 LOC), `MediaCard.constants.ts` (53 LOC), `useHybridMetadata.ts` (154 LOC), `useServerThumbnail.ts` (119 LOC), `__tests__/` (2 files, 354 LOC).

The component self-identifies as a "SIMPLIFIED STUB" of a 4,426-line v3 (see `MediaCard.tsx:38-47`). Most recommendations below distinguish between *finishing the stub correctly* and *raising quality of what exists today*.

---

## 1. Code Quality

### 1.1 Dead/unused props that mislead consumers
The public `MediaCardProps` API advertises features the implementation never uses. Either wire them up or remove them — leaving them as silent no-ops is a foot-gun.

| Prop | Defined | Used? |
|---|---|---|
| `displayMode` | `MediaCard.tsx:84` | Never read after destructuring |
| `enableKeyboardShortcuts` | `MediaCard.tsx:104` | Never read |
| `onUploadProgress` | `MediaCard.tsx:108` | Never invoked |
| `onToggleAdult` | `MediaCard.tsx:96` | No UI control invokes it |
| `onHide` | `MediaCard.tsx:97` | No UI control invokes it |
| `queue` | `MediaCard.tsx:101` | Commented out at `MediaCard.tsx:297-308` |

**Action:** Remove from `MediaCardProps` until implementation lands, or wire each through to a hover-overlay button.

### 1.2 Commented-out code
`MediaCard.tsx:297-308` keeps a commented `handleAddToQueue`. Either implement and ship, or delete it — comments rot.

### 1.3 Truthy coercion bug in payment gating
`MediaCard.tsx:141`:
```ts
const requiresPayment = item.publicity === 'paid' && item.price && item.price > 0;
```
This evaluates to `false | 0 | true` (the literal number `0` for falsy `price`). Although later usages (`if (requiresPayment && !isOwner)`) treat it as boolean, the type is `boolean | number | undefined`. Coerce explicitly: `Boolean(item.publicity === 'paid' && item.price && item.price > 0)`.

### 1.4 Inline `console` calls in hot paths
`MediaCard.tsx:287, 292` use `console.log` / `console.error` inside `handlePurchase`. Should funnel through `payment` abstraction or a callback prop (`onPaymentError`) so host apps can hook logging/telemetry.

`useHybridMetadata.ts:131` and `useServerThumbnail.ts:97` log errors directly. Prefer surfacing the error string in the returned state (already partially done) and let consumers decide.

### 1.5 Duplicated `formatTime`
`VideoProgressBar.tsx:137-148` and `ThumbnailStrip.tsx:148-159` each define an identical `formatTime`, while a generalized `formatDuration` already exists in `MediaCard.utils.ts:21`. Consolidate — keep one in `MediaCard.utils.ts` and import.

### 1.6 Style strategy is fractured
Three styling mechanisms coexist:
- `MediaCard.styles.ts` (362 LOC) — appears unused by `MediaCard.tsx`.
- `MediaCard.module.css` (58 LOC) — also unused.
- Inline `sx` arrays inside `MediaCard.tsx`.

Pick one. The remaining files should be deleted (or, if they hold v3 styles, moved into the main file when their components are restored).

### 1.7 Stubbed constants
`MediaCard.constants.ts:6-53` declares `DEBUG_POSTER_TRANSFORM`, `HOVER_PREVIEW_DELAY`, `MAX_THUMBNAIL_GENERATION_ATTEMPTS`, `DEFAULT_THUMBNAIL_TIME`, `PLAYBACK_SPEED_LEVELS`, `DOUBLE_CLICK_THRESHOLD`, `SMALL_CARD_WIDTH_THRESHOLD`, `globalEditingState` — none are referenced by `MediaCard.tsx`. Either consume them where they belong, or move them to whichever v3 file restores those features.

### 1.8 Hook dependency hazards
- `useHybridMetadata.ts:151` lists `onMetadataLoaded` in the effect deps. Consumers passing an inline function will trigger an infinite refetch loop. Either wrap with `useEffectEvent`/`useCallback` guidance in JSDoc, or stash it in a ref.
- `useServerThumbnail.ts:113` lists `state.thumbnailUrl` in deps while also writing it in the same effect — classic re-entry risk. Move `state.thumbnailUrl` read out of the effect or store the last URL in a ref.
- `useServerThumbnail.ts` never resets `retryCount` after a successful fetch — the next legitimate change of `item._id` can re-trigger using a stale `retryCount` value.

### 1.9 Stale closure in `playVideo`
`MediaCard.tsx:214-231` captures no state and is `useCallback`'d empty — fine — but pairs of `video.controls = !muted` and `video.loop = muted` are then overridden in the same-tick effect at `MediaCard.tsx:317-344`. The dual-source-of-truth for `controls`/`loop` makes the lifecycle hard to reason about. Centralize all `video.*` mutations in the effect; let `playVideo` only call `video.play()`.

---

## 2. Architecture

### 2.1 `MediaCard.tsx` does too much
At 721 lines it owns: presentation, hover-state, inline playback, payment flow, owner controls, selection state, content body, hybrid metadata, server thumbnails. Extract:

- `MediaCardMedia` — the inner `<Box data-testid="media-card-media">` block including the `<video>`/`<img>` switch, hover overlay, paid overlay, progress bar. (`MediaCard.tsx:393-615`)
- `MediaCardOwnerControls` — the `isOwner && (...)` block. (`MediaCard.tsx:544-592`)
- `MediaCardContent` — the `info && (...)` `<CardContent>`. (`MediaCard.tsx:618-716`)
- `MediaCardLockedOverlay` — paid-gate UI. (`MediaCard.tsx:597-614`)
- `useInlineVideoPreview(videoRef, { canPreview, isHovering, isInlinePlaying })` — encapsulates the play/pause/loop/controls coordination at `MediaCard.tsx:317-344`.

This makes the file `<300 LOC` and each piece testable in isolation.

### 2.2 `useHybridMetadata` is not hybrid
The hook's JSDoc (`useHybridMetadata.ts:1-9`) promises *client-side extraction for immediate preview* and *server-side for accuracy*. The implementation only fetches server metadata. Either:

- Implement client extraction (HTMLVideoElement `loadedmetadata` event) and the `preferServer` decision tree, OR
- Rename to `useServerMetadata` and update the JSDoc + the `MediaCard.tsx:120` call site.

The current state silently lies about behavior.

### 2.3 `MediaApiClient` coupling
`useHybridMetadata.ts` and `useServerThumbnail.ts` both depend on a concrete `MediaApiClient` (`../../api`). For a component package meant to plug into any host, prefer narrow interfaces (`MetadataExtractor`, `ThumbnailGenerator`) like the existing `IRouter`/`IAuth`/`IPayment`/`IQueue` abstractions in `packages/sui-media/src/abstractions/`. This keeps the abstraction story consistent.

### 2.4 Selection state lives in two places
`globalSelectionMode` (prop) and `modeState.mode === 'select'` both encode roughly the same idea; `globalSelectionMode` is what actually drives rendering (`MediaCard.tsx:379, 395, 514`). Consider deprecating `modeState.mode` or making `globalSelectionMode` derived. Two sources of truth invite bugs.

### 2.5 `globalEditingState` mutable singleton
`MediaCard.constants.ts:50-53` exports a module-scoped mutable object. Even though it isn't used yet, shipping this as a public surface is risky — multiple React trees in the same JS context (e.g., SSR + hydration, microfrontends, Storybook) will share state. If/when this gets used, wrap it in React context or a small subscribable store.

---

## 3. Tests & Documentation

### 3.1 Existing tests have empty bodies
`__tests__/MediaCard.test.tsx:73-96, 149-163` set up renders and then assert nothing (only comments saying "this is a simplified test"). These pass vacuously and provide false coverage signal. Either fill in `expect(...)` calls or delete them.

### 3.2 Missing test coverage
- **Selection toggle behavior** — no test exercises `handleSelectionToggle` (`MediaCard.tsx:167-183`), including the de-duplication when an id already exists in `selected`.
- **Hover-preview state machine** — `isHovering` × `isInlinePlaying` × `isHoverPreviewSuppressed` (`MediaCard.tsx:317-344`) has multiple interacting branches and no coverage.
- **Payment flow** — `handlePurchase` (`MediaCard.tsx:276-294`) is never exercised; mock the `payment` abstraction.
- **Server thumbnail retry path** — `useServerThumbnail.ts:50-53` retry logic and `Retry` button render at `MediaCard.tsx:438-456`.
- **`useHybridMetadata` hook unit tests** — none exist. Cover the `preferServer` branch, the `item._id` missing throw, the `AbortController` timeout, and the `onMetadataLoaded` callback.
- **`VideoProgressBar`** and **`ThumbnailStrip`** — no test files at all. Cover seek arithmetic (`calculateSeekTime`), drag start/move/up, and the `aria-valuenow` reporting.
- **Keyboard activation** — `handleMediaKeyDown` (`MediaCard.tsx:266-273`) for `Enter`/`Space` is untested.
- **`reportVideoIssue`** in `MediaCard.utils.ts:68-112` — sessionStorage de-duplication is untested.
- **`timeCodeToSeconds('invalid')` returns `NaN`** is asserted (`MediaCard.utils.test.ts:63`) but callers should know — surface this in JSDoc.

### 3.3 Documentation drift
`README.md:486-514` documents "MediaClass Branding" with `beforeIdent`/`afterIdent`/`videoBug` — none of which the stub implements. `README.md:559-565` lists "Performance Considerations" referring to viewport-based lazy loading; only the `isVisible` prop exists, and it merely gates the video render — there's no IntersectionObserver wired up. Add a banner to the README clarifying which features are stubbed vs. implemented, mirroring the JSDoc note at `MediaCard.tsx:38-47`.

### 3.4 JSDoc lies about props
The MediaCardProps section in `README.md` documents `enableKeyboardShortcuts`, `onUploadProgress`, etc., as functional. Update or remove (see §1.1).

---

## 4. Security

### 4.1 `sourceUrl` rendered without validation
`MediaCard.tsx:688-704` renders `item.sourceUrl` into `<a href>`. If `ExtendedMediaItem` data comes from user-generated content, a `javascript:` URL is partially mitigated by React 16.9+ warnings but is not blocked. Validate scheme:
```ts
const safeHref = /^https?:\/\//i.test(item.sourceUrl ?? '') ? item.sourceUrl : undefined;
```

### 4.2 Base URL concatenation
`MediaCard.tsx:144-153` does string concatenation: `${thumbnailBaseUrl}${item.thumbnail}` and `${mediaBaseUrl}${item.file}`. If `item.thumbnail` is an attacker-controlled absolute URL (`https://evil.com/...`) it overrides the base entirely. Use the `URL` constructor:
```ts
const url = new URL(item.thumbnail, thumbnailBaseUrl).toString();
```
and validate that the resolved origin matches an allowlist when the host app needs it. At minimum, document that callers must sanitize `item.thumbnail`/`item.file` upstream.

### 4.3 `mediaUrl` written to `<video src>` without type/origin check
`MediaCard.tsx:463`. Same family of concern as 4.2 — combined with `preload="metadata"`, the browser will issue a GET to any URL the data field contains. Consider an `allowedHosts` config (CSP would be the proper host-side fix).

### 4.4 `sessionStorage` JSON parse
`MediaCard.utils.ts:86`: `JSON.parse(reportedVideos)` is wrapped in try/catch — fine — but if storage is poisoned, the resulting `reportedList` is `unknown`. Validate it's an array of strings before `includes`/`push`.

---

## 5. Performance

### 5.1 `timeupdate` causes excessive re-renders
`MediaCard.tsx:311-315` sets `currentTime` on every browser `timeupdate` (≥4 Hz). The `<VideoProgressBar>` and the whole `MediaCard` re-render at that rate. Mitigations:

- Throttle to ~10 Hz with a ref + rAF, OR
- Push `currentTime` into a ref and pass via context to `VideoProgressBar`, OR
- Mark `VideoProgressBar` as `React.memo` and split the `currentTime`-sensitive subtree.

### 5.2 Drag mousemove unthrottled
`VideoProgressBar.tsx:265-283` calls `onSeek` on every document mousemove while dragging — for a `<video>` consumer this means a `currentTime` write per pointer pixel. Throttle via rAF.

### 5.3 Inline `sx` array recreated each render
`MediaCard.tsx:354-370` and `:620-635` build new `sx` arrays per render. With many cards in a grid this hurts MUI's style cache. Memoize via `React.useMemo`, or hoist invariant pieces to module scope.

### 5.4 No `React.memo` on `MediaCard`
A typical consumer renders dozens-to-hundreds of cards. Wrap the default export with `React.memo` and provide a `propsAreEqual` comparator that compares `item._id`, `isSelected`, `globalSelectionMode`, and identity of callbacks.

### 5.5 Window resize listener not debounced
`ThumbnailStrip.tsx:183-193` measures container width on every resize event. Debounce ~50 ms, or switch to `ResizeObserver`.

### 5.6 Eager video metadata fetch
`MediaCard.tsx:469` sets `preload="metadata"` for every visible video card. In a long gallery this is bandwidth-heavy. Gate behind `IntersectionObserver` (the `isVisible` prop suggests the host is expected to do this — document that requirement clearly, or do it in-component).

### 5.7 Multiple `useState` per render
`MediaCard.tsx:112-115` holds four boolean-ish useState calls that interact. Collapse into a `useReducer` whose action set documents the state machine (`hover-start`, `hover-end`, `inline-play`, `inline-pause`, `media-changed`).

---

## 6. Accessibility

### 6.1 Missing `aria-label`s on icon buttons
Owner controls at `MediaCard.tsx:546-590` use `<IconButton>` without `aria-label` for edit, public-toggle, delete. Add (e.g., `aria-label="Edit {{title}}"`).

### 6.2 Selection checkbox has no label
`MediaCard.tsx:388`: `<Checkbox checked={isSelected} onChange={handleSelectionToggle} />` has neither `inputProps={{ 'aria-label': ... }}` nor a visible label. Screen readers announce "checkbox" only.

### 6.3 `role="slider"` lacks `aria-valuetext`
`VideoProgressBar.tsx:349-353` and `ThumbnailStrip.tsx:300-304` set `aria-valuenow={progress%}` but a screen reader will read "37" with no unit. Add `aria-valuetext={formatDuration(currentTime)} of {formatDuration(duration)}`.

### 6.4 No keyboard seek
The slider role is set but `ArrowLeft`/`ArrowRight`/`Home`/`End` aren't handled — required by ARIA APG for slider. Add `onKeyDown` to seek by `calculateSkipAmount(duration)`.

### 6.5 Paid lock relies on icon + color
`MediaCard.tsx:597-614` shows a lock icon and "{price} sats" text. Add `role="img" aria-label="Locked — {{price}} sats to unlock"` to make the gate explicit to AT.

### 6.6 Selection-mode card needs role
When `globalSelectionMode` is true (`MediaCard.tsx:376`), the whole `<Card>` becomes clickable but has no role/label. Add `role="checkbox" aria-checked={isSelected} aria-label={mediaTitle}` and remove the inner button's tabindex in that mode (already done) to keep a single tab stop.

---

## 7. Quick-Win Punch List

Ordered by ROI (effort low → high, value high → low):

1. **Fix `requiresPayment` coercion** (`MediaCard.tsx:141`) — 1 line.
2. **Delete unused props** from `MediaCardProps` (`displayMode`, `enableKeyboardShortcuts`, `onUploadProgress`, `onToggleAdult`, `onHide`, commented queue) — clarifies API contract.
3. **Fill in or delete vacuous tests** (`MediaCard.test.tsx:73-96, 149-163`).
4. **Consolidate `formatTime` → `formatDuration`** across `VideoProgressBar.tsx`, `ThumbnailStrip.tsx`.
5. **Validate `sourceUrl` scheme** (`MediaCard.tsx:688`).
6. **Memo `sx` arrays** + wrap `MediaCard` in `React.memo`.
7. **Throttle `setCurrentTime` and drag mousemove**.
8. **Rename `useHybridMetadata` → `useServerMetadata`** (or implement client side).
9. **Extract `MediaCardMedia` / `MediaCardOwnerControls` / `MediaCardContent`** subcomponents.
10. **Write tests for selection, hover-preview, payment, hooks** (see §3.2).

---

## 8. Forward-Looking

The component carries a v3 backlog inferred from `MediaCard.tsx:38-47`, the constants file (§1.7), and `README.md` features (§3.3). Before reintroducing those (poster editing, MediaClass branding, scrubber sprite generation, keyboard shortcuts), nail down the architecture in §2 — restoring 4,000+ LOC onto today's structure will recreate the maintenance cliff.
