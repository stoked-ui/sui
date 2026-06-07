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

