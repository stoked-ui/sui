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

