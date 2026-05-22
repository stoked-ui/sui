# SC_TEST — MediaCard Component

**Component:** `MediaCard` (`packages/sui-media/src/components/MediaCard`)
**Parent Package:** `@stoked-ui/media` (Jest 29 + ts-jest + jsdom)
**Priority:** Critical (workspace-wide visual surface; touches auth, payment, router, queue abstractions and the server media API)
**Date:** 2026-05-14

---

## 1. Scope

`MediaCard` is the canonical media tile across the docs site and product surfaces. The directory contains:

| File | Role | Test Posture |
|------|------|---------------|
| `MediaCard.tsx` | Presentational + behavioral root (hover preview, inline playback, owner controls, selection mode, paid gate) | Component tests |
| `VideoProgressBar.tsx` | Hover-revealed scrubber with sprite preview | Component tests |
| `ThumbnailStrip.tsx` | Sprite-frame preview row | Component tests |
| `useHybridMetadata.ts` | Client+server metadata extraction with timeouts and fallback | Hook tests |
| `useServerThumbnail.ts` | Server thumbnail generation with retry | Hook tests |
| `MediaCard.utils.ts` | Pure helpers (`calculateAspectRatio`, `formatDuration`, `timeCodeToSeconds`, `calculateSkipAmount`, `pixelsToPercentage`, `calculatePositionBounds`, `constrainPosition`, `getSpritePosition`, `reportVideoIssue`, `blobToDataURL`) | Pure unit tests |
| `MediaCard.constants.ts` | `DEFAULT_ASPECT_RATIO` and friends | Implicitly covered via utils |
| `MediaCard.types.ts` | Types only | No runtime tests |
| `MediaCard.stories.tsx` | Storybook | Visual regression target (out of Jest scope) |

The component depends on four abstraction layers (`noOpRouter`, `noOpAuth`, `noOpPayment`, `noOpQueue` defaults from `../../abstractions`) and an optional `MediaApiClient`. Tests must drive these via dependency injection rather than module mocking.

---

## 2. Current State

Two Jest specs already exist under `__tests__/`:

- `MediaCard.test.tsx` — render + payment indicator + duration + selection + inline playback + hover playback. Several tests are placeholders (`onViewClick`, `owner controls`) that render but don't assert on hover-only DOM.
- `MediaCard.utils.test.ts` — solid coverage for `calculateAspectRatio`, `formatDuration`, `timeCodeToSeconds`, `calculateSkipAmount`, `pixelsToPercentage`, `constrainPosition`, `getSpritePosition`.

**Gaps:**

1. No tests for `useHybridMetadata` (timeout, fallback, file-size threshold, server-preferred path, `onMetadataLoaded` callback).
2. No tests for `useServerThumbnail` (auto-generate gating, retry, error → `canRetry`, loading overlay).
3. No tests for `VideoProgressBar` (seek math, sprite hover frame, visibility transitions).
4. No tests for `ThumbnailStrip` rendering or sprite math edge cases.
5. Owner-controls (edit / public-toggle / delete IconButtons rendered inside the hover overlay) are never exercised — the existing test admits this.
6. Payment flow (`handlePurchase` → `payment.requestPayment`) untested.
7. `reportVideoIssue` (sessionStorage dedupe, callback shape) and `blobToDataURL` untested.
8. Keyboard handler (`handleMediaKeyDown` Space/Enter) untested.
9. Inline playback toggle (second click pauses + suppresses hover preview) untested.
10. Dark-appearance branch and `info` block source link / view count / loading metadata caption untested.

---

## 3. Critical Paths to Cover

Ranked by user-impact and regression risk:

### 3.1 Hover preview lifecycle (`MediaCard.tsx:317-349`)
The `React.useEffect` that wires `isHovering`, `isHoverPreviewSuppressed`, `isInlinePlaying`, and `mediaUrl` to play/pause is the most fragile area. Each transition must be tested:
- Mouse enter on a video card → `play()` muted, looping.
- Mouse leave → `pause()` and `currentTime` reset to 0.
- Click while hovering (`inlinePlayback`) → unmuted play, `loop=false`, `controls=true`.
- Second click while inline-playing → `pause()`, suppression flag set, no re-play on remaining hover.
- `mediaUrl` change resets `isInlinePlaying` and `isHoverPreviewSuppressed`.

Mocking strategy: `vi.spyOn(HTMLMediaElement.prototype, 'play' | 'pause')` as already established in `MediaCard.test.tsx:173`.

### 3.2 Paid-content gating (`MediaCard.tsx:141, 154, 460, 597-614`)
- `publicity === 'paid'` + `price > 0` + non-owner → no `<video>` element rendered, lock overlay shown with `{price} sats`.
- Owner of a paid item → video still renders, no overlay.
- Click on locked card invokes `payment.requestPayment` with `{ amount, currency: 'BTC', resourceId }` shape (`MediaCard.tsx:280`).

### 3.3 Selection mode (`MediaCard.tsx:167-183, 376-390`)
- `globalSelectionMode` true → root `Card.onClick` toggles `setModeState` with `{ ...prev, selectState: { selected: [_id] } }`.
- Item without `_id` → handler short-circuits, no state update.
- `isSelected` reflects checkbox `checked` prop.
- Selection mode suppresses `activateMedia` and aria-button role on the media box.

### 3.4 Owner controls visibility (`MediaCard.tsx:544-592`)
Owner = `auth.getCurrentUser()` returns a user AND `auth.isOwner(item.author)` returns true. Controls are inside the `isHovering && !minimalMode && !globalSelectionMode` overlay branch. Trigger `mouseEnter` then assert each IconButton invokes its callback with `event.stopPropagation` semantics (clicking edit must not also fire `onViewClick`).

### 3.5 Hybrid metadata fallback (`useHybridMetadata.ts`)
- File < 10MB threshold + `preferServer: false` → client path runs, server skipped.
- File > 10MB → server path attempted first; on `serverTimeout` falls back to client when `fallbackToClient: true`.
- `onMetadataLoaded` fires once with the winning source's payload.
- `source === 'server'` causes the green ✓ checkmark in the duration caption (`MediaCard.tsx:666-675`).

### 3.6 Server thumbnail generation (`useServerThumbnail.ts`)
- `autoGenerate: !item.thumbnail && !item.paidThumbnail` — must NOT trigger when either is set.
- Loading state renders the centered `CircularProgress` overlay (`MediaCard.tsx:409-426`).
- Error with `canRetry` renders the `Alert` with `Retry` button; `retry()` re-triggers the API call and the retry button's `stopPropagation` prevents card click.

### 3.7 Video progress + seek (`VideoProgressBar.tsx`)
- Visible only when `item.duration` truthy AND `isHovering` true.
- `onSeek(time)` sets `videoRef.current.currentTime`.
- Sprite preview uses `getSpritePosition(frameIndex, config)` — verify math at frame 0, frame `framesPerRow-1`, frame `framesPerRow`, last frame.

### 3.8 Keyboard activation (`MediaCard.tsx:266-273`)
- `Enter` and `Space` on the media `role="button"` call `activateMedia`; `event.preventDefault` is invoked.
- Other keys are no-ops.

---

## 4. Framework & Tooling

Use the package's existing Jest setup — do not introduce Vitest at runtime. The `vitest` import in the existing specs is rewritten to `<rootDir>/src/__tests__/vitest-shim.ts` per `packages/sui-media/jest.config.js:23`, so authors can keep the `import { describe, it, expect, vi } from 'vitest'` ergonomic.

- **Runner:** `jest` with `ts-jest` preset, `jsdom` environment.
- **DOM:** `@testing-library/react` (`render`, `screen`, `fireEvent`, `within`).
- **User interaction:** prefer `@testing-library/user-event` over `fireEvent` for click + keyboard sequences (hover overlays + keyboard activation). Add it to `sui-media` devDependencies if not present.
- **Async:** `waitFor` for effect-driven assertions on `play`/`pause` and metadata callbacks.
- **Fake timers:** `jest.useFakeTimers()` for `useHybridMetadata` timeout paths.
- **HTMLMediaElement:** stub `play`, `pause`, `load`, and assign `currentTime` via `Object.defineProperty` since jsdom does not implement them.
- **MediaApiClient:** hand-rolled object literal implementing only the methods the hook exercises (`generateThumbnail`, `getMetadata`, etc.). No `jest.mock` of the API module — inject the stub via the `apiClient` prop.
- **Abstractions:** prefer the existing `createMockAuth` factory (`../../abstractions/Auth`) and write equivalents `createMockPayment`, `createMockRouter`, `createMockQueue` if they don't exist; otherwise inline minimal IPayment/IRouter/IQueue stubs.

---

## 5. File Organization

Co-located with the existing tests under `__tests__/`:

```
MediaCard/
└── __tests__/
    ├── MediaCard.test.tsx              # existing — expand
    ├── MediaCard.utils.test.ts         # existing — keep
    ├── MediaCard.hover.test.tsx        # NEW — hover/inline playback lifecycle
    ├── MediaCard.owner.test.tsx        # NEW — owner controls + permissions
    ├── MediaCard.payment.test.tsx      # NEW — paid gating + handlePurchase
    ├── MediaCard.selection.test.tsx    # NEW — selection mode + setModeState
    ├── MediaCard.keyboard.test.tsx     # NEW — keyboard activation
    ├── VideoProgressBar.test.tsx       # NEW
    ├── ThumbnailStrip.test.tsx         # NEW
    ├── useHybridMetadata.test.ts       # NEW
    ├── useServerThumbnail.test.ts      # NEW
    └── reportVideoIssue.test.ts        # NEW
```

Naming convention: `<Subject>.<facet>.test.{ts,tsx}` for files that split a large component along behavior axes; otherwise `<File>.test.{ts,tsx}` to mirror source. Match the established `__tests__/` directory pattern rather than `*.test.tsx` co-located with source.

---

## 6. Mock & Stub Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| `IRouter`, `IAuth`, `IPayment`, `IQueue` | **Prop injection** with shared factory helpers in `__tests__/helpers/abstractions.ts` | The component already supports this via its `noOp*` defaults; no module mocking needed. |
| `MediaApiClient` | Prop-injected literal object with `jest.fn()` per method | API client is optional; injecting keeps tests deterministic and avoids HTTP layer. |
| `HTMLMediaElement.prototype.play/pause` | `jest.spyOn` per test, restored in `afterEach` | jsdom does not implement playback; spies also let us assert call shape. |
| `HTMLMediaElement.prototype.currentTime` | `Object.defineProperty` getter/setter on prototype, captured per test | Tests need to observe seek writes from `VideoProgressBar`. |
| `sessionStorage` | jsdom built-in; clear in `afterEach` | `reportVideoIssue` writes to it; cross-test bleed otherwise. |
| `navigator.userAgent` | Read-only check; tests can rely on jsdom default | Used by `reportVideoIssue` payload assertion. |
| Timers | `jest.useFakeTimers({ doNotFake: ['performance'] })` for hook timeout tests | `useHybridMetadata` has 5s/15s timeouts. |
| `URL.createObjectURL` / `FileReader` | jsdom polyfill for `FileReader`; `URL.createObjectURL` needs a stub returning a deterministic string | `blobToDataURL` and any `localBlobUrl` path. |
| MUI `Card`/`CardMedia` | Render real components | They are the system under integration; do not mock. |
| MUI icons | Render real components | Cheap, no side effects. |

**Do not** use `jest.mock('../../abstractions')` — it breaks the dependency-injection contract that makes this component portable and silently masks regressions where the component bypasses its props.

---

## 7. Coverage Targets

`packages/sui-media/jest.config.js` already enforces a global 80% threshold on branches/functions/lines/statements. For this Critical component the bar should be higher locally — enforced via `collectCoverageFrom` patterns when running directory-scoped coverage:

| Surface | Target |
|--------|--------|
| `MediaCard.tsx` | **90%** lines / **85%** branches |
| `useHybridMetadata.ts` | **90%** lines / **85%** branches (timeout + fallback branches) |
| `useServerThumbnail.ts` | **90%** lines / **85%** branches |
| `MediaCard.utils.ts` | **95%** lines / **90%** branches (pure functions, cheap to cover) |
| `VideoProgressBar.tsx` | **85%** lines |
| `ThumbnailStrip.tsx` | **85%** lines |
| Overall MediaCard directory | **≥ 90% lines** |

Run scoped coverage with:

```
pnpm --filter @stoked-ui/media test -- --coverage \
  --collectCoverageFrom='src/components/MediaCard/**/*.{ts,tsx}' \
  --collectCoverageFrom='!src/components/MediaCard/**/*.stories.tsx' \
  --collectCoverageFrom='!src/components/MediaCard/**/*.types.ts'
```

---

## 8. Test Cases to Implement First

Ordered by regression risk and ROI. The first five close real correctness gaps the existing suite cannot catch.

### Phase 1 — Behavior regressions (highest ROI)

1. **`MediaCard.hover.test.tsx`** — `cancels in-flight inline playback on second click and suppresses hover preview until next mouseenter cycle`. Reproduces the toggle in `MediaCard.tsx:246-251`.
2. **`MediaCard.hover.test.tsx`** — `rewinds currentTime to 0 on mouseLeave when readyState > 0` (`stopHoverPreview` in `MediaCard.tsx:198-212`).
3. **`MediaCard.hover.test.tsx`** — `resets inline playback state when mediaUrl changes` (`MediaCard.tsx:346-349`).
4. **`MediaCard.payment.test.tsx`** — `clicking a paid card invokes payment.requestPayment with { amount, currency: 'BTC', resourceId: item._id }` and does NOT call `onViewClick` or `router.navigate`.
5. **`MediaCard.payment.test.tsx`** — `owner of paid item bypasses payment flow and renders the video element instead of the lock overlay`.

### Phase 2 — Untested branches in the main component

6. **`MediaCard.owner.test.tsx`** — Render with `createMockAuth({ id: 'user-123' })`, `item.author = 'user-123'`, hover the card, assert edit/togglePublic/delete IconButtons present and each callback fires with `item` and event propagation stopped (no `onViewClick` side-effect).
7. **`MediaCard.owner.test.tsx`** — `togglePublic icon swaps between PublicIcon and LockIcon based on item.publicity`.
8. **`MediaCard.selection.test.tsx`** — `clicking the card root in globalSelectionMode toggles _id into modeState.selectState.selected` and `re-clicking removes it`.
9. **`MediaCard.selection.test.tsx`** — `items without _id do not mutate modeState`.
10. **`MediaCard.keyboard.test.tsx`** — `Enter` and `Space` on `[data-testid="media-card-media"]` trigger `activateMedia` and call `preventDefault`; other keys do not.
11. **`MediaCard.test.tsx`** — `info` block renders source link with `rel="noopener noreferrer"` and `target="_blank"`; existing test already covers basic link, extend to assert security attrs and the green ✓ checkmark when `metadata.source === 'server'`.

### Phase 3 — Hook coverage

12. **`useHybridMetadata.test.ts`** — `prefers client path when file < threshold and preferServer is false`.
13. **`useHybridMetadata.test.ts`** — `falls back to client when server times out and fallbackToClient is true`.
14. **`useHybridMetadata.test.ts`** — `surfaces error state with source: 'error' when both paths fail and fallbackToClient is false`.
15. **`useHybridMetadata.test.ts`** — `onMetadataLoaded fires exactly once with the winning source's payload`.
16. **`useServerThumbnail.test.ts`** — `autoGenerate is gated by absence of both item.thumbnail and item.paidThumbnail`.
17. **`useServerThumbnail.test.ts`** — `retry() resets error and re-invokes apiClient.generateThumbnail`.
18. **`useServerThumbnail.test.ts`** — `canRetry flips false after exceeding retry budget` (or whatever limit the hook enforces — confirm reading source).

### Phase 4 — Subcomponents + utils edge cases

19. **`VideoProgressBar.test.tsx`** — `seek emits time proportional to click X over container width`.
20. **`VideoProgressBar.test.tsx`** — `sprite hover frame derives from getSpritePosition with floor(t / interval)`.
21. **`ThumbnailStrip.test.tsx`** — `renders no frames when spriteConfig is undefined`.
22. **`MediaCard.utils.test.ts`** — add cases for `reportVideoIssue`: skips duplicate `videoId` in same session; serializes payload with ISO timestamp; tolerates missing `navigator` (delete on `globalThis`); swallows JSON parse failures.
23. **`MediaCard.utils.test.ts`** — add `blobToDataURL` test using `Blob([...], { type: 'image/png' })` and asserting callback receives a `data:image/png;base64,...` string.
24. **`MediaCard.utils.test.ts`** — `timeCodeToSeconds('12:34:56:78')` returns `0` for 4-segment input (current behavior — pin it).

### Phase 5 — Visual & integration (optional)

25. Storybook visual regression via Playwright snapshot on `MediaCard.stories.tsx` once Phase 1–4 pass — separate from this Jest suite, runs under `test/e2e-website/`.

---

## 9. Anti-Patterns to Avoid

- **Snapshot tests on the full DOM tree** — the MUI subtree is deep and noisy; snapshots will churn on every MUI minor bump. Prefer role/text-based queries.
- **Hovering via `fireEvent.mouseOver`** — the component listens for `mouseEnter`/`mouseLeave` on `Card`; use the matching events.
- **Mocking `useHybridMetadata` from `MediaCard.test.tsx`** — passes nothing useful; instead inject `apiClient` and let the hook run. Mock the hook only in unit tests that drive purely visual branches (loading caption rendering).
- **Asserting on `console.log` from `handlePurchase`** — the log is incidental; assert on the `payment.requestPayment` spy.
- **Relying on real timers for hook timeout tests** — flaky; use fake timers.

---

## 10. CI Wiring

The package already runs through `pnpm --filter @stoked-ui/media test` (Jest). No CI changes required for unit tests. For the directory-scoped coverage gate above, add a `test:mediacard` script to `packages/sui-media/package.json` once Phase 1 lands so PRs touching this directory can run `pnpm --filter @stoked-ui/media test:mediacard` locally and in CI matrix.
