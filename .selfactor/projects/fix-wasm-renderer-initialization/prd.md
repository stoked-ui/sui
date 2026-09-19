# Product Requirements Document (Sequential)

## 0. Source Context
**Derived From:** Problem Description
**Feature Name:** Fix WASM Video Renderer Initialization & Enable Offline Rendering
**PRD Owner:** stoked
**Last Updated:** 2026-03-04

### Feature Brief Summary
The Rust/WASM video renderer built in project #11 fails to initialize when loaded in the home page editor. The root causes are: (1) a JSON field naming mismatch between TypeScript (camelCase) and Rust (snake_case), (2) build script output directory not matching the webpack alias, and (3) missing offline rendering integration. This project fixes the init errors, aligns the data serialization, and wires up a browser-based offline render/export pipeline.

---

## 1. Objectives & Constraints
### Objectives
- Fix WASM renderer initialization so it loads without console errors on the home page editor
- Align JSON serialization between CompositorController (TypeScript) and WasmLayer (Rust) so render_frame succeeds
- Fix build script to output to the correct `wasm-preview/pkg/` directory that the webpack alias points to
- Enable offline video rendering/export using the WASM compositor in the browser

### Constraints
- Must not break the existing Canvas fallback rendering path
- Must maintain backwards compatibility with the existing EditorEngine API
- WASM binary must remain under 1.5 MB (currently 910 KB)
- Offline rendering must work entirely client-side (no server dependency)
- Must work with Next.js SSR disabled (`dynamic` with `ssr: false`)

---

## 1.5 Required Toolchain

| Tool | Min Version | Install Command | Verify Command |
|------|------------|-----------------|----------------|
| node | 18+ | `nvm install 18` | `node --version` |
| rust | 1.70+ | `rustup update stable` | `rustc --version` |
| wasm-pack | 0.12+ | `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf \| sh` | `wasm-pack --version` |
| pnpm | 8+ | `npm i -g pnpm` | `pnpm --version` |

---

## 2. Execution Phases

> Phases below are ordered and sequential.
> A phase cannot begin until all acceptance criteria of the previous phase are met.

---

## Phase 1: Fix WASM Module Loading
**Purpose:** Eliminate the initialization error so the WASM module loads successfully in the browser.

### 1.1 Fix Build Script Output Directory
The build script (`packages/sui-video-renderer/scripts/build-wasm.sh`) outputs to `../pkg` (top-level `packages/sui-video-renderer/pkg/`), but the webpack alias `@stoked-ui/video-renderer-wasm` points to `packages/sui-video-renderer/wasm-preview/pkg`. These must match.

**Implementation Details**
- Update `build-wasm.sh` to output directly to `wasm-preview/pkg/` (the location webpack expects)
- OR update the webpack alias in `docs/next.config.mjs` to point to the correct build output
- Ensure the `pkg/package.json` name field is set to `wasm-preview` (matching what wasm-pack generates for bundler target)
- Verify the `.wasm` binary, `.js` glue, and `.d.ts` types are all in the resolved directory

**Acceptance Criteria**
- AC-1.1.a: After running the build script, all WASM artifacts (`.wasm`, `.js`, `.d.ts`) exist in the directory resolved by the `@stoked-ui/video-renderer-wasm` webpack alias
- AC-1.1.b: `import('@stoked-ui/video-renderer-wasm')` resolves successfully in the Next.js dev server without "Module not found" errors

**Acceptance Tests**
- Test-1.1.a: Run `pnpm build:wasm` (or the build script), then verify `ls packages/sui-video-renderer/wasm-preview/pkg/wasm_preview_bg.wasm` returns a file > 500 KB
- Test-1.1.b: Start dev server (`pnpm docs:dev`), load `http://localhost:5199`, open browser console — no "Module not found" or "Cannot find module" errors related to `video-renderer-wasm`

**Verification Commands**
```bash
# Verify build output location matches alias
ls -la packages/sui-video-renderer/wasm-preview/pkg/wasm_preview_bg.wasm
ls -la packages/sui-video-renderer/wasm-preview/pkg/wasm_preview.js
ls -la packages/sui-video-renderer/wasm-preview/pkg/wasm_preview.d.ts
```

### 1.2 Verify WASM Init Sequence in EditorEngine
The `initWasmRenderer()` method must complete without throwing. Currently, even if the module loads, the `PreviewRenderer` constructor may fail if the canvas is not yet in the DOM or if the import path is wrong.

**Implementation Details**
- Ensure `this.renderer` (the canvas element) is non-null before calling `initWasmRenderer()`
- Add a guard in the `viewer` setter to defer WASM init until the canvas is attached to the DOM
- Verify the `PreviewRenderer` constructor receives valid width/height (> 0)
- Log successful init: `[EditorEngine] WASM renderer initialized successfully`

**Acceptance Criteria**
- AC-1.2.a: Loading the home page at `http://localhost:5199` shows `[EditorEngine] WASM renderer initialized successfully` in the console (not a fallback message)
- AC-1.2.b: No `[EditorEngine] Failed to initialize WASM renderer` error appears in the console
- AC-1.2.c: `EditorEngine._useWasm` remains `true` after initialization (not fallen back to Canvas)

**Acceptance Tests**
- Test-1.2.a: Open `http://localhost:5199`, open DevTools console, filter for "EditorEngine" — verify init success message appears
- Test-1.2.b: In console, access the EditorEngine instance and verify `engine._useWasm === true`

**Verification Commands**
```bash
# Check for init error patterns in EditorEngine source
grep -n "Failed to initialize WASM" packages/sui-editor/src/EditorEngine/EditorEngine.ts
```

---

## Phase 2: Fix JSON Serialization Mismatch
**Purpose:** The WASM renderer receives layer data as JSON but Rust expects snake_case field names while TypeScript sends camelCase. This causes `serde_json` parse failures at runtime.

### 2.1 Align CompositorLayer Serialization with Rust WasmLayer
The `CompositorController.renderComposite()` serializes `CompositorLayer` objects using camelCase (`zIndex`, `blendMode`, `scaleX`, `scaleY`), but Rust's `WasmLayer` struct expects snake_case (`z_index`, `blend_mode`, `scale_x`, `scale_y`).

**Implementation Details**
- Option A (preferred): Add `#[serde(rename_all = "camelCase")]` to the Rust `WasmLayer` struct so it accepts camelCase JSON — this is the least-invasive change
- Option B: Transform the TypeScript layer objects to snake_case before JSON.stringify — adds runtime overhead
- Option C: Keep both — use `#[serde(alias = "zIndex")]` on each field for backwards compat
- Update the `CompositorLayer` TypeScript interface to document which fields map to Rust
- Handle nested structures: `content.elementId` → Rust expects `video_element_id` at the top level

**Acceptance Criteria**
- AC-2.1.a: Calling `renderer.render_frame(JSON.stringify(layers))` with a `CompositorLayer[]` array (camelCase fields) does NOT throw a serde parse error
- AC-2.1.b: A layer with `{ id: "test", type: "video", zIndex: 1, blendMode: "normal", transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 } }` is correctly deserialized by Rust and rendered without error

**Acceptance Tests**
- Test-2.1.a: In the browser console, call `renderer.render_frame(JSON.stringify([{id:"test",type:"image",zIndex:0,blendMode:"normal",opacity:1,visible:true,transform:{x:0,y:0,width:1920,height:1080,scaleX:1,scaleY:1,rotation:0}}]))` — no error thrown
- Test-2.1.b: Load the home page editor with the example project, press play — frames render through the WASM compositor (visible in canvas, verified via `renderer.get_metrics()` showing frame_count > 0)

**Verification Commands**
```bash
# After rebuilding WASM, check serde attributes
grep -n "rename_all\|alias\|camelCase" packages/sui-video-renderer/wasm-preview/src/lib.rs
grep -n "rename_all\|alias\|camelCase" packages/sui-video-renderer/compositor/src/layer.rs
```

### 2.2 Handle Missing Image Cache Gracefully
The Rust renderer throws `"Image not found in cache"` when an image layer is rendered without a prior `cache_image()` call. The CompositorController doesn't pre-cache images.

**Implementation Details**
- In `CompositorController`, when a layer of type `image` enters (on the `enter` lifecycle event), call `renderer.cache_image(url, imageElement)` to pre-load it into the Rust-side cache
- Handle the case where `load_image_url()` returns `Err("not yet implemented")` — fall back to passing image data via canvas drawImage
- Add error handling in Rust to skip uncached image layers with a warning instead of throwing

**Acceptance Criteria**
- AC-2.2.a: An image layer in the timeline does not cause a thrown exception during `render_frame` — it either renders correctly or is skipped with a console warning
- AC-2.2.b: When an image layer enters the timeline, `cache_image()` is called before the first `render_frame` that includes that layer

**Acceptance Tests**
- Test-2.2.a: Load a project with image layers, press play — no "Image not found in cache" error in console
- Test-2.2.b: Add a new image layer to the timeline at runtime, play through it — no errors

---

## Phase 3: Enable Offline Video Export via WASM
**Purpose:** Provide a browser-based offline rendering pipeline that uses the WASM compositor to render frames and encode them into a downloadable video file.

### 3.1 Implement Frame-by-Frame WASM Rendering for Export
The existing `recordVideo()` method uses `canvas.captureStream()` + `MediaRecorder`. The WASM compositor can render frames at arbitrary times without real-time playback, enabling faster-than-realtime offline export.

**Implementation Details**
- Add an `exportVideo(options)` method to `EditorEngine` that:
  1. Iterates through the project timeline at the target FPS (e.g., 30fps)
  2. For each frame time, calls `renderer.render_frame_at_time(layersJson, timeMs)` to composite the frame
  3. Captures the canvas pixel data after each render
  4. Feeds frames to a `VideoEncoder` (WebCodecs API) or falls back to `MediaRecorder` with manual frame stepping
- Support configurable resolution, FPS, and output format
- Show progress events (frame count, percentage, estimated time remaining)

**Acceptance Criteria**
- AC-3.1.a: Calling `engine.exportVideo({ fps: 30, format: 'mp4' })` renders all frames without real-time playback and produces a downloadable blob
- AC-3.1.b: The exported video has the correct duration (within 100ms of the project timeline duration)
- AC-3.1.c: The exported video contains rendered frames from the WASM compositor (not blank/black frames)

**Acceptance Tests**
- Test-3.1.a: In the home page editor, trigger export — a file download starts within 30 seconds for a 10-second project
- Test-3.1.b: Open the exported file in a video player — verify it plays and shows the expected content
- Test-3.1.c: Compare a screenshot from the WASM canvas at t=5s with the same frame in the exported video — they match visually

### 3.2 Wire Export UI into Editor
Connect the offline export to the editor's UI so users can trigger and monitor exports.

**Implementation Details**
- Add an "Export" button or menu option in the Editor toolbar
- Show a progress dialog during export with: progress bar, current frame / total frames, cancel button
- On completion, trigger a browser download of the rendered video
- Handle errors gracefully — if WASM export fails, offer fallback to the existing MediaRecorder path

**Acceptance Criteria**
- AC-3.2.a: The Editor UI has a visible export control that triggers `exportVideo()`
- AC-3.2.b: During export, a progress indicator shows the current rendering progress (updates at least every 10 frames)
- AC-3.2.c: Cancelling an in-progress export stops rendering and does not produce a partial download

**Acceptance Tests**
- Test-3.2.a: Click the export button in the editor — export starts and progress is visible
- Test-3.2.b: Start an export, click cancel before completion — export stops, no download triggered
- Test-3.2.c: Complete an export — browser download dialog appears with a video file

---

## 3. Completion Criteria

All of the following must be true:
1. The WASM renderer initializes successfully on the home page editor (no console errors)
2. The WASM renderer receives and processes layer data correctly (JSON serialization aligned)
3. Playing the example project renders frames through the WASM compositor
4. Offline video export produces a valid, playable video file
5. The existing Canvas fallback path still works when WASM is disabled
6. No regressions in the editor's existing playback, recording, or UI functionality
