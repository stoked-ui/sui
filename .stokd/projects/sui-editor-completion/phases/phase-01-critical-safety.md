# Phase 1: Critical Safety & Preview Correctness

**Purpose:** Remove crash paths and fix preview dimension bugs before WASM or performance work.

**Orchestrator:** Fable assigns one basic agent per work item below. Full specs in `../prd.md` §Phase 1.

| Item | Title | Verify (summary) |
|------|-------|------------------|
| 1.1 | Remove VideoController.process.exit | `grep process.exit` empty; `editor typescript` |
| 1.2 | Implement ImageController.createNewImage | no `throw createNewImage`; `editor typescript` |
| 1.3 | Remove Editor debug artifacts | no `alert(` in editor src |
| 1.4 | Fix canvas resolution mismatch | internal buffer = file dims; `editor typescript` |
| 1.5 | Fix ProviderState.checkTriggers | `common test` ProviderState green |
| 1.6 | Resolve VideoDb openDB collision | rename to `openVideoEditorDB`; consumers updated |
| 1.7 | Fix Timeline ResizeObserver | finite `timelineWidth`; `timeline typescript` |

**Phase gate:** All 7 items verified → Fable may start Phase 2.