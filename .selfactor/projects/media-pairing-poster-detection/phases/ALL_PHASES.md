# Phase 1: Pairing Foundation (pure logic)

**Purpose:** Establish a single, well-tested, framework-agnostic pairing function before any UI consumes it.

## 1.1 Pairing utility (pairMedia)

- **Status:** pending
- **Dependencies:** none
- **Implementation:** New util packages/sui-cdn/src/utils/pairMedia.ts reusing getFileKind. O(n) basename grouping (strip dir prefix + final extension, lowercase). A group is a pair only with exactly one video + >=1 image; poster = first image by name sort. Handle: unpaired image, multi-image, multi-video ambiguity, case-insensitivity, cross-directory, empty input.
- **Acceptance:** AC-1.1.a..g structural (pairing, case-insensitive, multi-image, multi-video, cross-dir, order); AC-1.1.h tsc exits 0; AC-1.1.i pairMedia unit suite passes.
- **Verify:**
  - `pnpm --filter @stoked-ui/cdn typescript`
  - `pnpm test:unit:no-docs -- --grep pairMedia`

## 1.2 Count/size reconciliation helper

- **Status:** pending
- **Dependencies:** 1
- **Implementation:** Pure helper over pairMedia output returning visibleCount, collapsedCount, totalBytes (default: bytes of all objects). Pairing-off path equals pre-feature totals.
- **Acceptance:** AC-1.2.a visibleCount=3/collapsedCount=3 on fixture; AC-1.2.b totalBytes rule; AC-1.2.c pairing-off => 6/0.
- **Verify:**
  - `pnpm test:unit:no-docs -- --grep pairMedia`

---

# Phase 2: CDN Gallery Integration

**Purpose:** Apply pairing to the CdnBrowser gallery (the screenshot surface).

## 2.1 Collapse paired images in gallery + apply poster

- **Status:** pending
- **Dependencies:** 1.1, 1.2
- **Implementation:** Run pairMedia over gallery objects in CdnBrowser.tsx; render one card per surviving primary; pass posterUrl into GalleryCard => <video poster> + resting still. Toolbar/hero counts use Phase 1 counters. Collapse toggle (default ON in gallery). Poster 404 => first-frame fallback.
- **Acceptance:** AC-2.1.a 3 cards/0 png; AC-2.1.b poster set; AC-2.1.c toolbar "3 files"; AC-2.1.d unpaired image renders; AC-2.1.e toggle-off => 6 cards.
- **Verify:**
  - `pnpm --filter @stoked-ui/cdn typescript`
  - `pnpm test:unit:no-docs -- --grep "CdnBrowser|pairMedia"`
  - `pnpm eslint`

## 2.2 Mock data + dev fixture

- **Status:** pending
- **Dependencies:** 2.1
- **Implementation:** Add golden-streams/normal-guy/train .mp4+.png pairs under a samples/ prefix to mockContents (sui-cdn and packages-internal/cdn) so the feature is demonstrable.
- **Acceptance:** AC-2.2.a mock has 3 pairs; AC-2.2.b gallery shows 3 collapsed cards.
- **Verify:**
  - `pnpm --filter @stoked-ui/cdn typescript`
  - `pnpm test:unit:no-docs -- --grep CdnBrowser`

---

# Phase 3: Thumbnail Affordance (FAB + action menu)

**Purpose:** Preserve the collapsed image’s standalone actions via a thumbnail FAB + menu.

## 3.1 Thumbnail FAB on paired cards

- **Status:** pending
- **Dependencies:** 2.1
- **Implementation:** Render a floating action button on a card ONLY when a paired poster exists. Plain button/SVG (no MUI in sui-cdn). Corner placement, hover/focus visible, keyboard reachable, aria-haspopup="menu"/aria-expanded.
- **Acceptance:** AC-3.1.a one FAB on paired card; AC-3.1.b none on unpaired; AC-3.1.c FAB focusable + aria-haspopup.
- **Verify:**
  - `pnpm --filter @stoked-ui/cdn typescript`
  - `pnpm test:unit:no-docs -- --grep CdnBrowser`

## 3.2 Thumbnail action menu

- **Status:** pending
- **Dependencies:** 3.1
- **Implementation:** FAB opens a menu acting on the POSTER object path: View thumbnail, Copy path (always); Permissions, Delete (admin/canManage). Delegate to existing handlers with poster path, never the video path. After poster delete + refresh, video falls back to first-frame and FAB disappears. Close on Escape/outside-click/blur.
- **Acceptance:** AC-3.2.a admin items; AC-3.2.b non-admin only View+Copy; AC-3.2.c delete uses poster path; AC-3.2.d permissions uses poster path; AC-3.2.e post-delete fallback; AC-3.2.f closes on Escape/outside.
- **Verify:**
  - `pnpm --filter @stoked-ui/cdn typescript`
  - `pnpm test:unit:no-docs -- --grep CdnBrowser`
  - `pnpm eslint`

---

# Phase 4: MediaCard Component Integration

**Purpose:** Bring pairing-poster + thumbnail affordance to @stoked-ui/media MediaCard.

## 4.1 Poster precedence + pairing-aware item

- **Status:** pending
- **Dependencies:** 1.1, 3.2
- **Implementation:** MediaCard.tsx thumbnailUrl precedence: serverThumbnail > item.thumbnail/paidThumbnail > pairedImage poster > generatedPoster(first-frame) > none. Skip extractVideoFrame when paired poster exists. Support caller-paired and self-contained (pairedImage prop) shapes.
- **Acceptance:** AC-4.1.a pairedImage used + no first-frame; AC-4.1.b server thumbnail still wins; AC-4.1.c no pair/no server => first-frame still runs.
- **Verify:**
  - `pnpm --filter @stoked-ui/media typescript`
  - `pnpm --filter @stoked-ui/media test`

## 4.2 Thumbnail affordance in MediaCard

- **Status:** pending
- **Dependencies:** 4.1
- **Implementation:** When pairedImage present, render thumbnail FAB whose menu mirrors Phase 3 (View, owner Edit/Permissions, Delete) wired to onPosterView/onPosterDelete/onPosterPermissions. Owner gating via existing isOwner. Labels/order match the CDN menu.
- **Acceptance:** AC-4.2.a FAB iff pairedImage; AC-4.2.b handlers fire with poster identity; AC-4.2.c owner-only items hidden for non-owner.
- **Verify:**
  - `pnpm --filter @stoked-ui/media typescript`
  - `pnpm --filter @stoked-ui/media test`
  - `pnpm eslint`

---

# Phase 5: Docs Examples & Documentation

**Purpose:** Demonstrate and document the shipped behavior in the docs site.

## 5.1 Docs demo for pairing + thumbnail affordance

- **Status:** pending
- **Dependencies:** 2.1, 4.2
- **Implementation:** New demo docs/data/media/docs/media-card/MediaCardPairedPoster.{js,tsx} referenced from media-card.md, with a pairing on/off toggle and the FAB menu. Update media-card.md to document pairing rules, poster precedence, and menu actions.
- **Acceptance:** AC-5.1.a demo renders paired card + working FAB/menu; AC-5.1.b md documents rules; AC-5.1.c .js and .tsx variants consistent.
- **Verify:**
  - `pnpm eslint`
  - `pnpm --filter @stoked-ui/media typescript`

