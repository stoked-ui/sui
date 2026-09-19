# Phase 5: Test Infrastructure & CI Gates

**Purpose:** Automated falsifiability — DnD tests, Jest harnesses, CI WasmLayer gate.

**Depends on:** Phases 2–4 complete.

| Item | Title | Verify (summary) |
|------|-------|------------------|
| 5.1 | File-explorer DnD tests | ≥12 tests; file-explorer test green |
| 5.2 | common LocalDb/namedId tests | common test green |
| 5.3 | Jest harness timeline+editor | both `pnpm test` exit 0 |
| 5.4 | CI WasmLayer + renderer gate | ci.yml has build:wasm + video-renderer:test |
| 5.5 | Engine scheduling tests | ≥6 scheduling tests |

**Phase gate:** CI gates wired → Fable may start Phase 6.