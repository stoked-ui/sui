# All Phases — SUI Editor Completion

See `../prd.md` for full detail. This file is the machine/orchestrator bundle.

## Phase 1: Critical Safety & Preview Correctness
- 1.1 Remove VideoController.process.exit
- 1.2 Implement ImageController.createNewImage
- 1.3 Remove Editor debug artifacts
- 1.4 Fix canvas resolution mismatch
- 1.5 Fix ProviderState.checkTriggers
- 1.6 Resolve VideoDb openDB collision
- 1.7 Fix Timeline ResizeObserver

## Phase 2: Foundation Hygiene & Dead Code Removal
- 2.1 Remove timeline console noise
- 2.2 Remove window.setSetting globals
- 2.3 Delete file-explorer MUI X dead code
- 2.4 File-explorer console + icon DRY
- 2.5 Remove common compiled .js artifacts
- 2.6 Fix Engine._dealClear BTree

## Phase 3: WASM Compositor Orchestration
- 3.1 layersToWasmJson serializer
- 3.2 WasmLayer contract smoke test
- 3.3 CompositorOrchestrator module
- 3.4 Wire orchestrator into EditorEngine
- 3.5 Disable controller draw when WASM on
- 3.6 Image cache warming for WASM
- 3.7 useWasmRenderer prop
- 3.8 EditorHero WASM smoke validation

## Phase 4: Timeline & Preview Performance
- 4.1 Scrub path engine-only updates
- 4.2 Reducer map rebuild scope
- 4.3 React.memo timeline clips
- 4.4 Horizontal viewport culling
- 4.5 Playback playhead React reduction
- 4.6 deal_data unit tests

## Phase 5: Test Infrastructure & CI Gates
- 5.1 File-explorer DnD tests
- 5.2 common LocalDb/namedId tests
- 5.3 Jest harness timeline+editor
- 5.4 CI WasmLayer + renderer gate
- 5.5 Engine scheduling tests

## Phase 6: Export, Persistence & Publishing
- 6.1 Export .sue from editor UI
- 6.2 CLI render bridge script+docs
- 6.3 OPFS storage prototype
- 6.4 Publish video-renderer-wasm
- 6.5 MediaRecorder WebM fallback

## Phase 7: Polish, Docs & Ship Validation
- 7.1 File-explorer thumbnails
- 7.2 Documentation honesty audit
- 7.3 E2E completion checklist test
- 7.4 Remove VideoDb React demo