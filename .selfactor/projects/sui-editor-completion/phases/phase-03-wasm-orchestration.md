# Phase 3: WASM Compositor Orchestration

**Purpose:** Wire Rust WASM compositor into real editor preview — highest leverage completion step.

**Depends on:** Phases 1–2 complete.

| Item | Title | Verify (summary) |
|------|-------|------------------|
| 3.1 | layersToWasmJson serializer | snake_case `video_element_id`; editor tests |
| 3.2 | WasmLayer contract smoke test | `build:wasm` + `video-renderer:test` |
| 3.3 | CompositorOrchestrator module | mock render_frame once per frame |
| 3.4 | Wire orchestrator into EditorEngine | tick calls orchestrator when WASM on |
| 3.5 | Disable controller draw when WASM on | no drawImage when orchestrator active |
| 3.6 | Image cache warming for WASM | cache_image on preload |
| 3.7 | useWasmRenderer prop | EditorProvider + docs typescript |
| 3.8 | EditorHero WASM smoke validation | build:wasm + integration test green |

**Phase gate:** EditorHero WASM path works → Fable may start Phase 4.