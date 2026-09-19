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

