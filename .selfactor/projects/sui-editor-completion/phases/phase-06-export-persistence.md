# Phase 6: Export, Persistence & Publishing

**Purpose:** Production export bridge (.sue → CLI), OPFS prototype, WASM npm strategy.

**Depends on:** Phase 3 + Phase 5 complete.

| Item | Title | Verify (summary) |
|------|-------|------------------|
| 6.1 | Export .sue from editor UI | download valid .sue JSON |
| 6.2 | CLI render bridge script+docs | simple.sue → mp4 smoke |
| 6.3 | OPFS storage prototype | flag-gated; common test green |
| 6.4 | Publish video-renderer-wasm | valid pkg/package.json |
| 6.5 | MediaRecorder WebM fallback | codec preference order |

**Phase gate:** CLI export smoke passes → Fable may start Phase 7.