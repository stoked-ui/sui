# Media Pairing & Poster Auto-Detection

## 0. Source Context
**Derived From:** Problem Description (inline brief + annotated screenshot of CDN gallery "6 FILES")
**Feature Name:** Media Pairing & Poster Auto-Detection
**PRD Owner:** Brian Stoker
**Last Updated:** 2026-05-31

### Feature Brief Summary
Media listings currently render every object as its own card. When a directory holds a
video and an image that share a basename (e.g. `golden-streams.mp4` + `golden-streams.png`),
the image is almost always a poster/thumbnail for the video and renders as a redundant
second card. This feature detects video+image basename pairs, uses the image as the
video card's poster, and collapses the redundant image card out of the listing — while
preserving access to the image's own actions through a thumbnail affordance (FAB + menu)
on the surviving video card. Scope is the `@stoked-ui/media` `MediaCard` component, the
`sui-cdn` `CdnBrowser` gallery view, and the docs examples that exercise them.

---

## 1. Objectives & Constraints

### Objectives
- **O1 — Pair detection:** Deterministically group video+image objects that share a
  case-insensitive basename within the same directory/collection, classifying the image
  as the video's poster.
- **O2 — Collapse redundant cards:** Skip rendering the paired image as its own card in
  the gallery/listing display, so a 6-object directory with 3 pairs shows 3 cards.
- **O3 — Auto-poster:** Use the paired image as the poster/thumbnail for the video card,
  taking precedence over first-frame canvas extraction and the generic play placeholder.
- **O4 — Preserve affordances:** Surface a thumbnail affordance (FAB) on the paired card
  that opens a menu exposing the actions the image would have had as a standalone item
  (view thumbnail, thumbnail permissions, delete thumbnail, copy path, etc.).
- **O5 — Honest counts:** Keep file-count / total-size and empty-state messaging coherent
  once images are collapsed (a collapsed poster is not "missing", it is attributed to its
  video).

### Constraints
- **C1:** Pairing is presentation-layer only. No S3/CDN object is renamed, moved, or
  deleted as a side effect of pairing. Destructive actions remain explicit and gated.
- **C2:** Backward compatible. Existing `MediaCard` props and `CdnObject` shapes must keep
  working; new behavior is additive and default-safe. Directories with no pairs render
  exactly as today.
- **C3:** Admin-gated actions (permissions, delete) in the thumbnail menu obey the same
  `canManage` rule already used by `CdnBrowser` GalleryCard. No new privilege paths.
- **C4:** Reuse the existing `getFileKind` classifier (video = mp4/mov/webm/m4v;
  image = png/jpg/jpeg/gif/svg/webp/avif) as the single source of truth for kind.
- **C5:** Pairing/collapse must be toggleable (off → today's behavior) so the docs can
  demonstrate both states and a directory author can opt out.
- **C6:** No new runtime dependencies. Standard monorepo toolchain only.

---

## 1.5 Required Toolchain

> Standard Node.js / TypeScript monorepo toolchain. No additional system dependencies.

| Tool | Min Version | Install Command | Verify Command |
|------|------------|-----------------|----------------|
| node | 18+ | `nvm install 18` | `node --version` |
| pnpm | 8+ | `corepack enable && corepack prepare pnpm@latest --activate` | `pnpm --version` |
| TypeScript | repo-pinned | `pnpm install` (workspace) | `pnpm --filter @stoked-ui/cdn typescript --version` |

Primary verification commands used throughout this PRD:
- Pairing util unit tests (sui-cdn, mocha): `pnpm test:unit:no-docs` (scoped via grep below)
- MediaCard tests (sui-media, jest): `pnpm --filter @stoked-ui/media test`
- Type checks: `pnpm --filter @stoked-ui/cdn typescript` and `pnpm --filter @stoked-ui/media typescript`
- Lint: `pnpm eslint`

---

## 2. Execution Phases

> Phases are ordered and sequential. A phase cannot begin until all acceptance criteria of
> the previous phase are met. Foundation (pure pairing logic) → CDN gallery integration →
> thumbnail affordance/menu → MediaCard component → docs.

---

## Phase 1: Pairing Foundation (pure logic)

**Purpose:** Establish a single, well-tested, framework-agnostic pairing function before any
UI consumes it. Both `CdnBrowser` and `MediaCard` must share one definition of "what is a
pair" so the two surfaces never diverge. This phase has no React and no rendering.

### 1.1 Pairing utility

**Implementation Details**
- **Systems affected:** new util in `packages/sui-cdn/src/utils/` (e.g. `pairMedia.ts`),
  exported from the package index so `sui-media` and docs can import it. Reuses
  `getFileKind` from `utils/contents.ts`.
- **Inputs:** an array of objects each exposing at least `{ path, name }` (superset of
  `CdnObject`). A generic signature `pairMedia<T extends { path: string }>(objects: T[], opts?)`.
- **Outputs:** a stable structure, e.g.
  `{ items: Array<{ video?: T; image?: T; poster?: T; kind: 'pair'|'video'|'image'|'other' }>, skipped: T[] }`
  where `skipped` lists image objects collapsed into a video. Original input order is
  preserved for the surviving primary item of each group.
- **Core logic (basename key):** strip the directory prefix and the final extension,
  lowercase the remainder → grouping key. For each key, partition members by
  `getFileKind`. A group forms a `pair` only when it has exactly one video member and at
  least one image member; the chosen poster is the first image by stable sort (name asc).
- **Failure modes / edge cases:**
  - Image with no matching video → render normally (not skipped).
  - Multiple images for one video → first (sorted) becomes poster; the rest are NOT
    skipped by default (configurable via `opts.collapseAllImages`), to avoid hiding
    distinct assets silently.
  - Multiple videos sharing one basename (e.g. `.mp4` + `.webm`) → no single owner;
    treat as `other`/no-pair (do not skip the image, do not collapse the videos) and
    expose this in the result so callers can log it.
  - Case-insensitive basenames (`Train.PNG` pairs with `train.mp4`).
  - Cross-directory: only objects sharing the same directory prefix may pair.
  - Empty input → `{ items: [], skipped: [] }`.
- **Performance:** single pass O(n) grouping with a Map; no nested scans.

**Acceptance Criteria**

_Structural:_
- AC-1.1.a: `golden-streams.mp4` + `golden-streams.png` in the same prefix → one `pair`
  item with `video=mp4`, `poster=png`; the png appears in `skipped`.
- AC-1.1.b: An image with no basename-matching video → an `image` item, NOT in `skipped`.
- AC-1.1.c: `Train.PNG` + `train.mp4` → paired (case-insensitive key).
- AC-1.1.d: Two images for one video → poster = first by sort; second image is an `image`
  item and NOT skipped, unless `opts.collapseAllImages` is set.
- AC-1.1.e: Two videos sharing a basename → no pair; image (if any) NOT skipped; result
  flags the ambiguous group.
- AC-1.1.f: Objects in different prefixes with the same basename do NOT pair.
- AC-1.1.g: Output preserves input order of surviving primary items.

_Executable:_
- AC-1.1.h: `pnpm --filter @stoked-ui/cdn typescript` exits 0.
- AC-1.1.i: `pnpm test:unit:no-docs -- --grep pairMedia` runs the new suite, all pass (exit 0).

**Acceptance Tests**
- Test-1.1.a: Unit test — happy-path 3-pair fixture mirrors the screenshot (golden-streams,
  normal-guy, train) → 3 surviving cards, 3 skipped images.
- Test-1.1.b: Unit test — each edge case in AC-1.1.b…f has a dedicated assertion.
- Test-1.1.c: Unit test — order preservation and stable poster selection.

**Verification Commands**
```bash
pnpm --filter @stoked-ui/cdn typescript
pnpm test:unit:no-docs -- --grep pairMedia
```

### 1.2 Count/size reconciliation helper

**Implementation Details**
- **Dependencies on 1.1:** consumes `pairMedia` output.
- **Logic:** helper returning display totals after collapse — `visibleCount` (surviving
  cards), `collapsedCount` (skipped posters), and `totalBytes` computed across ALL objects
  (including collapsed posters, since the bytes still exist in the bucket) OR across visible
  only — decision recorded as Open Question Q1; default = count bytes of all objects so the
  "Visible size" stat stays truthful to storage.
- **Side effects:** none (pure).

**Acceptance Criteria**
- AC-1.2.a: For the 6-object/3-pair fixture → `visibleCount=3`, `collapsedCount=3`.
- AC-1.2.b: `totalBytes` equals the documented rule (default: sum of all 6 objects).
- AC-1.2.c: With pairing disabled → `visibleCount=6`, `collapsedCount=0`.

**Acceptance Tests**
- Test-1.2.a: Unit test on the fixture asserting all three counters.
- Test-1.2.b: Regression test — pairing-off path equals pre-feature totals.

**Verification Commands**
```bash
pnpm test:unit:no-docs -- --grep pairMedia
```

---

## Phase 2: CDN Gallery Integration

**Purpose:** Apply pairing to the surface in the screenshot — the `CdnBrowser` gallery
(`media-gallery` / `GalleryCard`). Cannot start until Phase 1 yields a trusted pairing
function and counters.

### 2.1 Collapse paired images in the gallery + apply poster

**Implementation Details**
- **Systems affected:** `packages/sui-cdn/src/CdnBrowser/CdnBrowser.tsx` (gallery render
  path, `visible.objects.map`), `GalleryCardProps`.
- **Logic:** before mapping gallery objects, run `pairMedia(visible.objects)`. Render one
  card per surviving primary; pass the paired image's `url` into `GalleryCard` as a new
  `posterUrl` prop. In `GalleryCard`, when `posterUrl` is present and the kind is video,
  set it as the `<video poster={posterUrl}>` and as the still shown before hover (replaces
  the current `currentTime = 0.1` first-frame seek as the resting frame). Image-only and
  other cards render unchanged.
- **Counts:** the objects toolbar count and hero "Visible items"/"Visible size" use the
  Phase 1 counters. Toolbar shows e.g. `3 files` with collapsed posters attributed to
  their videos (optionally `3 files · 3 posters` — see 3.x menu copy).
- **Toggle:** gallery honors a `pairMedia`/collapse toggle (default ON in gallery view).
  List/table view is unaffected (still shows every object) per C5 scope.
- **Failure modes:** poster URL 404 → `<video>` falls back to its own first frame (browser
  default); no crash. Pairing off → identical to today.

**Acceptance Criteria**
- AC-2.1.a: Loading the 3-pair fixture in gallery view → 3 cards rendered, 0 standalone png
  cards.
- AC-2.1.b: Each video card's `<video>` has `poster` set to its paired image URL.
- AC-2.1.c: Objects toolbar reads `3 files` (not 6) when collapsed.
- AC-2.1.d: An unpaired image in the same directory still renders its own card.
- AC-2.1.e: With pairing toggled off → 6 cards, behavior identical to pre-feature.

**Acceptance Tests**
- Test-2.1.a: Component/render test mounting `CdnBrowser` with a mocked `getContents`
  returning the 6-object fixture; assert card count and poster attributes.
- Test-2.1.b: Regression test — directory with zero pairs renders unchanged.

**Verification Commands**
```bash
pnpm --filter @stoked-ui/cdn typescript
pnpm test:unit:no-docs -- --grep "CdnBrowser|pairMedia"
pnpm eslint
```

### 2.2 Mock data + dev fixture

**Implementation Details**
- **Dependencies on 2.1.** Add the screenshot's paired objects to
  `packages/sui-cdn/src/data/mockContents.ts` (and `packages-internal/cdn/src/data/mockContents.js`
  if used by the demo) so the feature is demonstrable: `golden-streams.{mp4,png}`,
  `normal-guy.{mp4,png}`, `train.{mp4,png}` under a `samples/` prefix.
- **Side effects:** none beyond fixture data.

**Acceptance Criteria**
- AC-2.2.a: Mock contents include the three video+image pairs under a shared prefix.
- AC-2.2.b: Rendering the mock prefix in gallery view shows 3 collapsed cards.

**Acceptance Tests**
- Test-2.2.a: Snapshot/DOM test over the mock prefix asserting 3 cards.

**Verification Commands**
```bash
pnpm --filter @stoked-ui/cdn typescript
pnpm test:unit:no-docs -- --grep CdnBrowser
```

---

## Phase 3: Thumbnail Affordance (FAB + action menu)

**Purpose:** A collapsed image must not lose the actions it had as a standalone item. This
phase adds the affordance the user requested. Cannot start until Phase 2 establishes which
card owns which poster.

### 3.1 Thumbnail FAB on paired cards

**Implementation Details**
- **Systems affected:** `GalleryCard` in `CdnBrowser.tsx` (Phase 4 mirrors this in
  `MediaCard`). Render a small floating action button on the card ONLY when a paired
  poster exists (`posterUrl` present). The FAB visually signals "this card has an attached
  thumbnail asset." Reuse existing icon-button styling conventions; do not introduce MUI
  into `sui-cdn` (it currently uses plain `<button>`/SVG).
- **Inputs:** `posterObject` (the skipped image `CdnObject`: path, url, name), `canManage`,
  and the same handler set GalleryCard already receives (`onDelete`, `onPermissions`,
  `onDragStart`, copy-path). New optional callbacks may be threaded for poster-specific ops
  so the parent operates on the image's path, not the video's.
- **Placement/behavior:** FAB positioned in a corner of the thumbnail (e.g. bottom-right),
  visible on hover/focus, keyboard reachable (`tabIndex`, `aria-haspopup="menu"`,
  `aria-expanded`). Clicking toggles the menu in 3.2.
- **Failure modes:** no poster → no FAB. Menu open state is local to the card.

**Acceptance Criteria**
- AC-3.1.a: A paired (collapsed-poster) card renders exactly one thumbnail FAB.
- AC-3.1.b: A non-paired card (image-only, or video with no poster) renders NO FAB.
- AC-3.1.c: FAB is focusable and exposes `aria-haspopup="menu"`.

**Acceptance Tests**
- Test-3.1.a: Render test asserts FAB presence/absence across paired vs unpaired cards.
- Test-3.1.b: a11y test asserts FAB ARIA attributes and keyboard focusability.

**Verification Commands**
```bash
pnpm --filter @stoked-ui/cdn typescript
pnpm test:unit:no-docs -- --grep CdnBrowser
```

### 3.2 Thumbnail action menu

**Implementation Details**
- **Dependencies on 3.1.** The FAB opens a menu whose items are exactly the actions the
  image would have had as its own card, operating on the POSTER object's path/url:
  - **View thumbnail** — opens `posterObject.url` (new tab), always available.
  - **Copy thumbnail path** — copies the poster's public URL.
  - **Thumbnail permissions** — `onPermissions(posterObject.path)`; admin-only (`canManage`).
  - **Delete thumbnail** — `onDelete(posterObject.path)` with the existing confirm; admin-only.
  - (Optional) **Rename thumbnail** — reuse rename flow on the poster path; admin-only.
  - (Optional) **Detach / show as separate card** — local toggle that un-collapses just this
    image for the current session (no storage write). Captured as Open Question Q2.
- **Gating:** management items hidden when `!canManage`, matching standalone GalleryCard.
- **Logic:** menu actions delegate to the SAME handlers the standalone card used, just with
  the poster's path — so permissions/delete affect the image object, never the video.
- **Failure modes:** delete of poster → on success, `refreshContents()` re-runs pairing;
  the video card then falls back to first-frame (no poster). Menu closes on action, Escape,
  outside-click, and blur.

**Acceptance Criteria**
- AC-3.2.a: Menu lists View, Copy path, Permissions, Delete for the poster (admin).
- AC-3.2.b: As non-admin (`canManage=false`) → only View + Copy path are present.
- AC-3.2.c: "Delete thumbnail" invokes the delete handler with the POSTER's path, not the
  video's path.
- AC-3.2.d: "Thumbnail permissions" invokes the permissions handler with the poster's path.
- AC-3.2.e: After the poster is deleted and contents refresh, the video card renders with no
  poster (first-frame fallback) and no FAB.
- AC-3.2.f: Menu closes on Escape and outside click.

**Acceptance Tests**
- Test-3.2.a: Render+interaction test — admin menu contents and per-item handler payloads
  (assert path === poster path).
- Test-3.2.b: Render test — non-admin menu omits management items.
- Test-3.2.c: Integration test — delete poster → mocked refresh → FAB and poster gone.

**Verification Commands**
```bash
pnpm --filter @stoked-ui/cdn typescript
pnpm test:unit:no-docs -- --grep CdnBrowser
pnpm eslint
```

---

## Phase 4: MediaCard Component Integration

**Purpose:** Bring the same pairing-poster + thumbnail-affordance behavior to the
`@stoked-ui/media` `MediaCard` used by the docs and downstream apps. Cannot start until the
pairing util (Phase 1) and the affordance UX (Phase 3) are settled, so MediaCard mirrors
rather than reinvents.

### 4.1 Poster precedence + pairing-aware item

**Implementation Details**
- **Systems affected:** `packages/sui-media/src/components/MediaCard/MediaCard.tsx`, its
  types, and any list/gallery wrapper that maps items. Two integration shapes supported:
  1. **Caller-paired:** a list component runs `pairMedia` and passes the chosen image as
     `item.thumbnail`/`item.poster` + a `posterObject` for the affordance.
  2. **Self-contained:** `MediaCard` accepts an optional `pairedImage` prop carrying the
     poster URL + the image's identity/handlers.
- **Poster precedence (update `thumbnailUrl` resolution):**
  `serverThumbnail → item.thumbnail/paidThumbnail → pairedImage poster → generatedPoster
  (first-frame) → none`. The paired image must rank ABOVE first-frame extraction, so
  `extractVideoFrame` is skipped when a paired poster exists.
- **Failure modes:** paired poster fails to load → fall through to first-frame extraction
  (existing path). No paired image → existing behavior byte-for-byte.

**Acceptance Criteria**
- AC-4.1.a: When a `pairedImage` poster is provided → `<video poster>` / `<img>` uses it and
  `extractVideoFrame` does not run.
- AC-4.1.b: Server thumbnail still wins over a paired image (precedence order honored).
- AC-4.1.c: No paired image and no server thumbnail → first-frame extraction still runs
  (no regression).

**Acceptance Tests**
- Test-4.1.a: Jest/RTL test asserting poster source precedence across the 4 cases.
- Test-4.1.b: Regression test — existing `MediaCardBasic` behavior unchanged with no pair.

**Verification Commands**
```bash
pnpm --filter @stoked-ui/media typescript
pnpm --filter @stoked-ui/media test
```

### 4.2 Thumbnail affordance in MediaCard

**Implementation Details**
- **Dependencies on 4.1 + Phase 3 UX.** When `pairedImage` is present, render a thumbnail
  FAB whose menu mirrors Phase 3: View thumbnail, (owner) Edit/Permissions-equivalent,
  Delete thumbnail — wired to new optional callbacks
  (`onPosterView`, `onPosterDelete`, `onPosterPermissions`, etc.). Owner gating reuses the
  existing `isOwner` logic already in MediaCard (mirrors `canManage`).
- **Consistency:** menu item labels/order match the CDN menu so the two surfaces feel
  identical.
- **Failure modes:** callbacks optional; absent callback → that menu item hidden. No
  `pairedImage` → no FAB (existing card unchanged).

**Acceptance Criteria**
- AC-4.2.a: `pairedImage` present → MediaCard shows a thumbnail FAB; absent → none.
- AC-4.2.b: Menu item handlers fire with the poster's identity.
- AC-4.2.c: Owner-only items hidden when `isOwner` is false.

**Acceptance Tests**
- Test-4.2.a: RTL test — FAB presence and menu contents (owner vs non-owner).
- Test-4.2.b: RTL test — handler invocation payloads reference the poster.

**Verification Commands**
```bash
pnpm --filter @stoked-ui/media typescript
pnpm --filter @stoked-ui/media test
pnpm eslint
```

---

## Phase 5: Docs Examples & Documentation

**Purpose:** Demonstrate and document the behavior in the docs site. Cannot start until the
component behavior (Phases 2–4) is final, so examples reflect shipped APIs.

### 5.1 Docs demo for pairing + thumbnail affordance

**Implementation Details**
- **Systems affected:** `docs/data/media/docs/media-card/` (new demo, e.g.
  `MediaCardPairedPoster.js` + `.tsx`), referenced from `media-card.md`; optionally a
  CdnBrowser gallery demo if one exists in docs. Add the demo to `docs/data/pages.ts` nav if
  a new page is introduced (otherwise inline in the existing media-card page).
- **Content:** a card with a paired image poster, showing the FAB + menu and a toggle for
  pairing on/off so the redundant-image-collapse is visible side by side.
- **Failure modes:** demos must run under the docs lint/build (eslint, no console errors).

**Acceptance Criteria**
- AC-5.1.a: New demo renders a paired MediaCard with a working thumbnail FAB/menu.
- AC-5.1.b: `media-card.md` documents pairing rules, poster precedence, and the menu
  actions.
- AC-5.1.c: `.js` and `.tsx` demo variants exist and are consistent (per repo convention).

**Acceptance Tests**
- Test-5.1.a: Docs lint/build over the new demo passes.
- Test-5.1.b: Manual/visual check (screenshot) matches the intended affordance.

**Verification Commands**
```bash
pnpm eslint
pnpm --filter @stoked-ui/media typescript
# Optional local visual check:
# pnpm --filter stokedui-com dev   # serves docs on port 5199
```

---

## 3. Completion Criteria
The project is considered complete when:
- All phase acceptance criteria pass.
- All acceptance tests are green (verified by executing the commands, not by reading code):
  - `pnpm test:unit:no-docs -- --grep "pairMedia|CdnBrowser"` exits 0.
  - `pnpm --filter @stoked-ui/media test` exits 0.
- All Verification Commands from every work item exit 0.
- Type checks pass: `pnpm --filter @stoked-ui/cdn typescript` and
  `pnpm --filter @stoked-ui/media typescript`.
- Lint passes: `pnpm eslint`.
- The screenshot scenario reproduces: a 6-object directory with 3 video+image pairs renders
  3 cards, each posters from its image, each exposing a thumbnail FAB whose menu performs the
  image's standalone actions (view / permissions / delete) against the image object.
- No standalone image card for a paired image; unpaired images still render normally.
- Pairing toggled off reproduces pre-feature behavior exactly (no regressions).
- No open P0/P1 issues remain.

---

## 4. Rollout & Validation

### Rollout Strategy
- **Additive + default-safe:** pairing util ships inert (Phase 1). UI consumption is gated by
  a toggle/prop (C5). Gallery enables collapse by default; list/table view unaffected.
- **Progressive exposure:** land Phases 1–2 (logic + CDN gallery) first behind the toggle,
  validate against real S3 directories, then enable MediaCard (Phase 4) and docs (Phase 5).
- **No data migration:** purely presentational; nothing in storage changes.

### Post-Launch Validation
- **Metrics to monitor:** gallery render correctness (card count vs object count where pairs
  exist), absence of console/runtime errors from poster 404s, no increase in failed
  delete/permissions calls (ensuring menu actions target the right object path).
- **Rollback triggers:**
  - Any case where a thumbnail-menu Delete/Permissions targets the VIDEO instead of the image.
  - Pairing collapses a legitimately distinct image (false-positive grouping) reported by a user.
  - Counts/size become misleading enough to confuse directory management.
- **Rollback mechanism:** flip the pairing toggle off (restores per-object rendering) without
  reverting code; full revert is a clean removal since the feature is additive.

---

## 5. Open Questions
- **Q1 — Size accounting:** Should "Visible size" include collapsed poster bytes (storage
  truth, default) or only surviving primary objects (visual truth)? Default chosen: include
  all bytes; revisit if it confuses the management view.
- **Q2 — Detach action:** Do we want a per-card "show image as its own card" session toggle
  in the thumbnail menu, or is collapse always implicit? Default: omit for v1, add if
  requested.
- **Q3 — Multiple posters:** When a video has >1 candidate image, is first-by-name the right
  poster, and should the extras be collapsed (`collapseAllImages`) or shown? Default: first
  is poster, extras shown as their own cards.
- **Q4 — Ambiguous video groups:** Two videos sharing a basename — should the image attach to
  one (which?) or none? Default: none (no pairing), surfaced in the util result for logging.
- **Q5 — List/table view:** Should pairing collapse also apply to the CDN list/table view, or
  remain gallery-only? Default: gallery-only for v1 (matches the screenshot surface).
- **Q6 — Pairing scope key:** Confirm basename strips only the final extension (so
  `clip.v2.mp4` ↔ `clip.v2.png` pair on key `clip.v2`). Default: strip final extension only.

---
