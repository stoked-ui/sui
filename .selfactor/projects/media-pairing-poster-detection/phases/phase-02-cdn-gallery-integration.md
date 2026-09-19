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

