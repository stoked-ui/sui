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

