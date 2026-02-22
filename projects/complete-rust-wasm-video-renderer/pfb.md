# Product Feature Brief: Complete Rust/WASM Video Renderer

---

## 1. Feature Overview

| Field            | Value                                                        |
|------------------|--------------------------------------------------------------|
| **Feature Name** | Complete Rust/WASM Video Renderer                            |
| **Owner**        | Stoked Consulting                                            |
| **Status**       | POC Complete, Production Implementation Planned              |
| **Target Release** | TBD (estimated 8 weeks from start of Phase 1)              |
| **Summary**      | Complete the Rust/WASM Video Renderer for the Stoked UI Editor, bringing the existing proof-of-concept compositor library to production quality. The renderer provides a dual-target architecture: a WASM module for real-time 60 FPS browser preview and a native Rust binary for high-performance server-side video export via FFmpeg. The POC has demonstrated 10-11x speedup over Node.js/Sharp across all tested scenarios, with the compositor library at approximately 95% completion. This initiative covers 8 phases of work to reach production readiness: completing the core compositor, adding video frame support, building an animation/keyframe system, establishing the WASM build pipeline, integrating with the EditorEngine, optimizing performance, building the export pipeline, and comprehensive testing and documentation. |

---

## 2. Problem Statement

### What problem does this solve?

The Stoked UI Editor currently relies on JavaScript Canvas API calls for video preview rendering and has no native high-performance export pipeline. This approach has fundamental performance limitations:

- **Canvas rendering cannot sustain 60 FPS** at 1080p with complex multi-layer compositions (10+ layers with blend modes, transforms, and effects).
- **No server-side export pipeline exists** as a native binary. The CLI crate has a `Cargo.toml` but no `main.rs` -- there is literally no export implementation.
- **The React integration uses a mock WASM module.** The `useWasmRenderer.ts` hook (200 lines) has fully defined TypeScript types and interfaces but instantiates a `MockPreviewRenderer` class that performs no actual rendering.
- **Text rendering is completely stubbed.** The compositor logs a warning and skips all text layers.
- **Rotation is unimplemented.** The compositor logs a warning and returns the unrotated image.
- **Shadow effects return a clone of the input** with no actual shadow rendering.
- **Only 8 blend modes exist** out of the 16+ that professional video editors expect (missing SoftLight, HardLight, ColorDodge, ColorBurn, Difference, Exclusion, Hue, Saturation, Color, Luminosity).
- **No animation or keyframe system exists.** Layer properties are static; there is no interpolation between values over time, which is essential for a video editor.
- **No video frame extraction.** The compositor only handles solid colors and static images. There is no FFmpeg integration for decoding video frames, no frame caching, and no browser-side video element frame capture.

### Who is affected?

- **End users of the Stoked UI Editor** who need real-time visual feedback while editing video timelines with multiple layers, effects, and transitions.
- **Content creators** who need to export finalized video projects at high quality without relying on external tools.
- **The development team** maintaining the editor, who currently lack a performant rendering abstraction and must work around Canvas API limitations.

### Why now?

- The POC has validated the architecture. Preliminary benchmarks show **11x speedup** for simple compositions (3 layers, 1080p: 4ms Rust vs. 45ms Node.js), **10x for complex** (10 layers: 12ms vs. 120ms), and **11x for high-resolution** (5 layers, 4K: 25ms vs. 280ms). Memory usage is reduced by approximately 70% (150MB vs. 500MB for complex projects).
- The compositor library is 95% complete with a clean, tested architecture. The core composition loop, blend modes, effects pipeline, frame buffer, and type system are all functional and unit-tested.
- The WASM bindings are 100% complete (282 lines in `wasm-preview/src/lib.rs`) with proper `wasm-bindgen` annotations, Canvas rendering integration, and a benchmark function.
- The React integration scaffolding is in place. `WasmPreviewDemo.tsx` (282 lines) is a fully interactive demo component with layer management, opacity controls, blend mode selection, and benchmark execution -- it just needs the mock replaced with the real WASM module.
- The Rust workspace, build configuration, and Criterion benchmark suite are all established and working.
- Completing this work now avoids accumulating technical debt in the rendering path as new editor features (text overlays, animations, transitions) are added on top of the JavaScript Canvas approach.

---

## 3. Goals & Success Metrics

### Primary Goals

1. **Real-time browser preview at 60 FPS.** Compose 10 layers at 1920x1080 within a 16ms frame budget using the WASM renderer.
2. **Production-quality video export.** Deliver a CLI tool that reads `.sue` project files and outputs encoded video (H.264/H.265) via FFmpeg, with audio mixing and progress reporting.
3. **Full feature parity with professional compositors.** Rotation, text rendering, 16+ blend modes, complete shadow/gradient effects, and a keyframe-driven animation system.
4. **Seamless EditorEngine integration.** Replace mock WASM calls with real renderer, implement the `CompositorController`, and provide graceful fallback to Canvas when WASM is unavailable.

### Success Metrics

| Metric                              | Target                    | Measurement Method                   |
|-------------------------------------|---------------------------|--------------------------------------|
| Preview FPS (1080p, 10 layers)      | 60 FPS sustained          | Criterion benchmark + browser Performance API |
| Frame composition time              | < 16ms                    | `performance.now()` in render loop   |
| WASM bundle size (gzipped)          | < 100KB (~450KB uncompressed, < 500KB target) | Build output measurement |
| Memory usage (1080p complex project)| < 200MB browser, < 2GB server | Browser DevTools, `/proc/status`    |
| Time to first frame                 | < 100ms                   | User Timing API                      |
| Rust vs. Node.js speedup            | 10-50x (varies by scenario)| Benchmark comparison suite          |
| Memory reduction vs. Node.js        | 50-70%                    | Benchmark comparison suite           |
| Test coverage (compositor crate)    | > 80%                     | `cargo tarpaulin`                    |
| Export audio/video sync             | Within 1 frame tolerance  | Automated A/V sync test              |
| Browser compatibility               | Chrome, Firefox, Safari, Edge | Automated browser test matrix     |
| No memory leaks                     | Pass 1-hour stress test   | Browser DevTools heap snapshots      |

### Stretch Goals

- 4K preview at 30 FPS in the browser.
- GPU acceleration via `wgpu` for the composition pipeline.
- WebCodecs API integration for hardware-accelerated video frame decoding (bypassing the Canvas `drawImage` round-trip).
- SIMD-accelerated blend operations.
- Spring physics easing in the keyframe system.

---

## 4. User Experience & Scope

### In Scope

**Phase 1: Core Compositor Completion (Weeks 1-2)**
- Implement rotation using `imageproc::geometric_transformations::rotate_about_center` with anti-aliasing and optimized fast paths for 90/180/270 degrees.
- Add anchor point support (percentage and pixel values, default center 0.5, 0.5).
- Implement skew/shear transforms via matrix-based transformation.
- Integrate text rendering via `rusttype` or `fontdue` with TrueType/OpenType support, font caching, text alignment, line height, letter spacing, wrapping, stroke/outline, and drop shadow.
- Add 8+ additional Photoshop-compatible blend modes: SoftLight, HardLight, ColorDodge, ColorBurn, Difference, Exclusion, Hue, Saturation, Color, Luminosity.
- Complete shadow implementation: render as separate layer, configurable blur radius, inner and outer shadows.
- Add gradient support (linear with multiple stops, radial, angle/position configuration).
- Add color filters: invert, grayscale, sepia, color matrix transformations, chromatic aberration.

**Phase 2: Video Frame Support (Weeks 2-3)**
- FFmpeg integration via `ffmpeg-next` crate for native frame extraction (H.264, H.265, VP9, AV1).
- LRU frame cache with configurable size and background prefetching.
- Browser video integration: HTMLVideoElement frame capture via OffscreenCanvas and `drawImage`.
- URL-based image loading in WASM via Fetch API with caching.
- Extended image format support: JPEG, PNG, WebP, GIF (first frame), SVG via `resvg`.

**Phase 3: Animation & Keyframes (Weeks 3-4)**
- Keyframe data structure: time-value pairs for all animatable properties.
- Interpolation engine: linear, cubic bezier easing, step/hold keyframes.
- Standard easing functions: EaseIn, EaseOut, EaseInOut, CubicBezier(f32, f32, f32, f32), Steps.
- Animatable transform properties: position, scale, rotation, opacity, anchor point.
- Animatable effect properties: blur radius, shadow offset/blur, color adjustments, gradient positions.
- Action-to-layer mapping: convert EditorAction to compositor Layer, map action timing to keyframes, handle action enable/disable.

**Phase 4: WASM Build & Integration (Weeks 4-5)**
- `wasm-pack` build pipeline targeting ES modules with `wasm-opt -O3` size optimization.
- Build script (`build-wasm.sh`) for the monorepo.
- npm package setup (`@stoked-ui/video-renderer-wasm`) with TypeScript type exports and initialization helpers.
- Replace mock WASM module in `useWasmRenderer.ts` with real `import init, { PreviewRenderer } from '@stoked-ui/video-renderer-wasm'`.
- Add `requestAnimationFrame` render loop with time synchronization to EditorEngine and frame dropping.
- Memory management: proper cleanup on unmount, memory budget limits, GC hints.

**Phase 5: EditorEngine Integration (Weeks 5-6)**
- Create `CompositorController` implementing the `IController` interface with `enter`, `update`, and `leave` lifecycle methods.
- Modify `EditorEngine` to accept `useWasmRenderer` option with `WasmRendererConfig`.
- Implement the compositor render loop replacing `drawImage` calls with compositor commands, with batched layer updates.
- Graceful fallback: detect WASM support, degrade to Canvas if WASM fails, optional performance comparison mode.
- Track type mapping: video -> VideoLayer, image -> ImageLayer, text -> TextLayer, effect -> EffectLayer, audio -> no visual layer.

**Phase 6: Performance Optimization (Weeks 6-7)**
- Parallel frame composition using `rayon` for multi-threaded layer processing and tile-based rendering.
- Frame buffer pooling to eliminate allocations during the render loop.
- Texture atlasing to reduce draw calls for small images.
- Resolution scaling: lower resolution during scrubbing, full resolution for playback/export.
- Composed frame cache with LRU eviction, invalidation on layer changes.
- Decoded media cache with predictive prefetching around the playhead and memory budget management.
- Performance benchmarking: frame composition time, memory usage, cache hit rates, FPS counter.
- Comparison tests: WASM vs. JavaScript Canvas at various layer counts and resolutions.

**Phase 7: Export Pipeline (Weeks 7-8)**
- Implement `cli/src/main.rs` using `clap` for argument parsing and `indicatif` for progress bars.
- CLI commands: `render` (input `.sue` file, output video, quality presets, resolution selection).
- Batch frame rendering with parallel execution across CPU cores and progress reporting.
- FFmpeg integration: pipe rendered frames for H.264/H.265 encoding with CRF quality presets.
- Audio handling: extract audio from video sources, mix multiple audio tracks, sync with video timeline.
- Optional REST export API with job submission, progress polling, and download endpoints.

**Phase 8: Testing & Documentation (Week 8)**
- Unit tests: blend mode accuracy, transform correctness, effect output validation.
- WASM tests: browser compatibility, memory leak detection, performance regression tests.
- Integration tests: layer lifecycle (enter/update/leave), time synchronization, action-to-layer mapping, full export pipeline, audio/video sync verification.
- API documentation: Rust docs for compositor (`cargo doc`), TypeScript docs for WASM bindings, integration guide for `sui-editor`.
- Performance guide: best practices, memory management tips, troubleshooting.

### Out of Scope

- **GPU rendering via WebGPU/wgpu.** This is a future optimization, not part of the initial production release. The CPU-based approach has already demonstrated sufficient performance.
- **WebCodecs API integration.** This emerging API provides direct frame access without canvas round-trip but has limited browser support and is deferred to a follow-up initiative.
- **Native Node.js module via napi-rs.** The initial backend integration uses subprocess communication for simplicity and isolation. Migration to FFI is a production optimization if latency becomes an issue.
- **Real-time collaborative editing.** Multi-user timeline editing is a separate product feature.
- **Mobile-native rendering.** WASM in mobile browsers is in scope; native iOS/Android rendering is not.
- **DRM/content protection.** Encrypted media handling is out of scope.
- **Cloud rendering infrastructure.** Kubernetes deployment, auto-scaling, and queue-based processing are operational concerns handled separately.

---

## 5. Assumptions & Constraints

### Assumptions

1. **The POC benchmark results are representative.** The 10-11x speedup and 70% memory reduction observed in preliminary testing with solid color layers will hold (within reasonable variance) when extended to image and video layers with effects.
2. **Browser WASM support is adequate.** All target browsers (Chrome, Firefox, Safari, Edge) support WebAssembly with sufficient memory limits for 1080p composition. The WASM module will initialize within 2 seconds.
3. **The existing `sui-timeline` and `EditorEngine` architecture can accommodate the `CompositorController`.** The `IController` interface pattern used in the editor supports the enter/update/leave lifecycle needed for compositor integration.
4. **FFmpeg is available on the server.** The export pipeline assumes FFmpeg is installed and accessible in the system PATH on the deployment environment. The Docker image will bundle it.
5. **Font files (TTF/OTF) will be bundled or available at known paths.** Text rendering requires access to font data; we assume a reasonable set of system fonts or bundled fonts.
6. **The `.sue` project file format is stable enough to serve as the CLI input format.** Changes to the project format may require CLI updates.

### Constraints

1. **WASM bundle size must stay under 500KB uncompressed (~100KB gzipped).** The WASM module runs in the browser and must be fast to load. Text rendering font data is the primary risk to this budget.
2. **The WASM module cannot use threads (SharedArrayBuffer).** Cross-origin isolation headers are required for `SharedArrayBuffer`, which may not be available in all deployment contexts. Parallel rendering in WASM is therefore deferred; `rayon` parallelism is native-only.
3. **No video encoding in the browser.** The WASM preview is composition-only. Full video export requires the server-side CLI tool.
4. **Rust toolchain is required for development.** Contributors working on the renderer must have Rust, `wasm-pack`, and `wasm-opt` installed. This is a new toolchain requirement for the team.
5. **The monorepo build system must integrate Rust builds.** The `pnpm` workspace and existing build scripts need to be extended to trigger `wasm-pack build` and copy WASM artifacts.
6. **Browser memory limits.** Composition at 1080p requires approximately 8MB per frame buffer (1920 * 1080 * 4 bytes). With multiple buffers for blending, the renderer must stay under 200MB total.

---

## 6. Risks & Mitigations

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| WASM performance not meeting 60 FPS target at 1080p with complex compositions | Medium | High | Profile early in Phase 1 using the existing Criterion benchmark suite. Optimize hot paths (blend operations, pixel iteration). If CPU-bound, consider WebGPU acceleration as a follow-up. Resolution scaling during scrubbing provides a fallback. |
| Text rendering blows the WASM bundle size budget | Medium | Medium | Use `fontdue` (lighter than `rusttype`) with minimal glyph sets. Lazy-load font data. Consider rendering text to image on the JS side and passing as ImageData if bundle size is critical. |
| Video frame extraction unreliable across codecs and containers | Medium | Medium | Support the most common codecs first (H.264, VP9). Implement multiple fallback strategies: FFmpeg native for server, OffscreenCanvas `drawImage` for browser. Graceful degradation to thumbnail if frame extraction fails. |
| Browser compatibility issues with WASM or Canvas APIs | Low | Medium | Feature detection at initialization. If `WebAssembly` is unavailable, fall back to Canvas-only rendering. Test against all target browsers continuously. |
| Memory pressure with large projects (20+ layers, 4K) | Medium | High | Implement aggressive LRU cache eviction. Render at reduced resolution when memory is constrained. Use frame buffer pooling to avoid allocation during render loops. Set a configurable memory budget with monitoring. |
| FFmpeg integration complexity for the export pipeline | Medium | Medium | Start with image sequence export (render frames to PNG, call FFmpeg externally). This decouples the compositor from FFmpeg linking. Upgrade to pipe-based encoding once the frame pipeline is stable. |
| Animation system complexity affecting frame timing accuracy | Low | High | Use monotonic time sources. Align keyframe evaluation with the editor's time model. Write extensive timing tests comparing expected vs. actual interpolated values. |

### Schedule Risks

| Risk | Mitigation |
|------|------------|
| Text rendering takes longer than 2 weeks | Use existing font libraries (`fontdue` or `rusttype`). Defer advanced features (rich text, multi-style blocks) to a follow-up. Ship with basic single-style text first. |
| EditorEngine integration reveals architectural incompatibilities | Begin Phase 5 prototyping during Phase 3 to surface issues early. The `CompositorController` can be developed in parallel with the keyframe system. |
| Total scope exceeds 8-week estimate | Phases are prioritized. If schedule pressure emerges, Phase 7 (export pipeline) and Phase 8 (documentation) can be partially deferred. The browser preview (Phases 1-6) is the highest-value deliverable. |

---

## 7. Dependencies

### Internal Dependencies

| Dependency | Package | Relationship |
|-----------|---------|--------------|
| **EditorEngine** | `@stoked-ui/sui-editor` | Phase 5 requires modifications to `EditorEngine.ts` to add WASM renderer option and the compositor render loop. |
| **Timeline/Tracks** | `@stoked-ui/sui-timeline` | Phase 3 (animation) and Phase 5 (integration) depend on the track/action data model in `TimelineProvider`. |
| **Editor Actions** | `@stoked-ui/sui-editor` | The `CompositorController` must map `EditorAction` objects to compositor `Layer` instances. |
| **Build System** | Root `package.json`, `pnpm-workspace.yaml` | The monorepo build must be extended to include Rust/WASM build steps. |
| **`.sue` Project Format** | `@stoked-ui/sui-editor` | The CLI export tool must parse this format. Changes to the format require CLI updates. |

### External Dependencies

| Dependency | Version | Purpose | Risk |
|-----------|---------|---------|------|
| **Rust toolchain** | Stable (edition 2021) | Compiler for compositor, WASM, and CLI | Low -- stable releases, wide adoption |
| **wasm-pack** | Latest | WASM build tool generating TS bindings | Low -- maintained by the Rust WASM working group |
| **wasm-bindgen** | 0.2 | JS/TS interop for WASM | Low -- core Rust WASM infrastructure |
| **image** | 0.25 | Rust image processing | Low -- widely used, stable API |
| **imageproc** | 0.25 | Advanced image processing (rotation, blur) | Low -- companion to `image` crate |
| **rayon** | 1.10 | Parallel processing for batch rendering | Low -- standard parallelism library |
| **serde / serde_json** | 1.0 | Serialization for layer data and project files | Low -- ubiquitous in Rust |
| **criterion** | (dev) | Benchmarking framework | Low -- standard Rust benchmarking |
| **FFmpeg** | 6.x+ | Video encoding/decoding (server-side only) | Medium -- external binary dependency, must be bundled in deployment |
| **ffmpeg-next** | 7.0 | Rust FFmpeg bindings for native video handling | Medium -- depends on system FFmpeg libraries |
| **fontdue** or **rusttype** | Latest | Font rendering for text layers | Low -- pure Rust, no system dependencies |
| **clap** | 4.5 | CLI argument parsing | Low -- standard Rust CLI library |
| **web-sys** | 0.3 | Browser API bindings for WASM | Low -- official Rust WASM bindings |
| **resvg** | 0.43 | SVG rendering | Low -- already in workspace dependencies |
| **Sharp** (Node.js) | Latest | Benchmark comparison only | Low -- not a production dependency |

---

## 8. Open Questions

1. **Font bundling strategy for WASM.** Should fonts be embedded in the WASM binary (increasing bundle size), loaded lazily from a CDN, or rendered to ImageData on the JavaScript side before passing to the compositor? Each approach has different trade-offs for bundle size, latency, and rendering quality.

2. **Project file format stability.** Is the `.sue` format finalized, or will it evolve? The CLI export tool's parser will need to track format changes. Should we version the format?

3. **WebCodecs API timeline.** When will browser support for WebCodecs be sufficient to replace the OffscreenCanvas `drawImage` approach for video frame extraction? This affects whether we invest in the Canvas-based approach or wait.

4. **napi-rs migration timeline.** The subprocess approach for NestJS integration adds ~50ms per invocation. At what video processing volume does migrating to napi-rs (FFI) become worthwhile? The architecture document suggests starting with subprocess and migrating later.

5. **WASM threading (SharedArrayBuffer).** Can we require Cross-Origin Isolation headers in the deployment environment? If so, `wasm-bindgen-rayon` could enable multi-threaded WASM composition, significantly improving performance for complex scenes.

6. **WebGPU acceleration.** Should Phase 6 (Performance Optimization) include a WebGPU prototype via `wgpu`, or is this definitively a follow-up initiative? Preliminary signals suggest WebGPU could provide another 5-10x improvement for the blend/composite pipeline.

7. **Keyframe data persistence.** Where do keyframe animations live in the data model? Are they stored in the timeline actions, in a separate animation track, or in the `.sue` project file? This affects Phase 3 architecture.

8. **Audio mixing implementation.** The export pipeline needs audio mixing. Should this be handled by FFmpeg directly (passing multiple `-i` flags with a filter complex), or should the Rust CLI implement its own audio mixing? FFmpeg is more capable but harder to control programmatically.

9. **Benchmark regression testing.** Should benchmark results be tracked in CI to detect performance regressions automatically? If so, what is the acceptable variance threshold before a build is flagged?

10. **Deployment environment for CLI.** What is the target server environment? Bare metal, Docker, AWS Lambda, or all of the above? Lambda has a 15-minute timeout and 10GB memory limit, which constrains export job size. The architecture document mentions both Docker and Lambda via SST.

---

## 9. Non-Goals

- **Replacing the existing Canvas rendering path entirely.** The Canvas fallback must remain functional for browsers without WASM support or when WASM initialization fails. This is a progressive enhancement, not a replacement.
- **Real-time video encoding in the browser.** Video encoding is computationally expensive and is handled exclusively by the server-side CLI tool. The browser WASM module is for preview composition only.
- **Supporting every video codec.** The export pipeline targets H.264 and H.265 with optional VP9. Exotic codecs (ProRes, DNxHR, AV1 encoding) are deferred.
- **Building a general-purpose video editing engine.** This renderer is specifically designed for the Stoked UI Editor's composition model. It is not intended as a standalone library for arbitrary video editing applications.
- **Mobile-native rendering.** While WASM in mobile browsers is supported, native iOS/Android rendering SDKs are not part of this initiative.
- **Streaming/live rendering.** Real-time streaming output (e.g., RTMP) is not in scope. The export pipeline produces file-based output.
- **Plugin/extension system for custom effects.** Users cannot define custom blend modes or effects. The set of supported operations is fixed at compile time.
- **Backward compatibility with pre-WASM editor versions.** The WASM renderer is additive. Older editor builds continue using Canvas. There is no migration path for in-flight renders.

---

## 10. Notes & References

### Existing Code Inventory

| File | Location | Lines | Status |
|------|----------|-------|--------|
| `compositor.rs` | `packages/sui-video-renderer/compositor/src/` | 284 | 95% -- rotation unimplemented, text skipped |
| `blend.rs` | `packages/sui-video-renderer/compositor/src/` | 214 | 100% -- 8 blend modes implemented and tested |
| `effects.rs` | `packages/sui-video-renderer/compositor/src/` | 245 | 90% -- shadow returns clone, all other effects functional |
| `layer.rs` | `packages/sui-video-renderer/compositor/src/` | 168 | 95% -- text rendering stubbed, all other layer types work |
| `transform.rs` | `packages/sui-video-renderer/compositor/src/` | 141 | 95% -- rotation field exists but unused in composition |
| `frame.rs` | `packages/sui-video-renderer/compositor/src/` | 96 | 100% -- complete frame buffer with pixel ops and save |
| `types.rs` | `packages/sui-video-renderer/compositor/src/` | 129 | 100% -- Color, Point, Size, Rect all complete |
| `lib.rs` (wasm) | `packages/sui-video-renderer/wasm-preview/src/` | 282 | 100% -- full WASM bindings with Canvas rendering |
| `Cargo.toml` (workspace) | `packages/sui-video-renderer/` | 54 | 100% -- workspace with all dependencies configured |
| `Cargo.toml` (cli) | `packages/sui-video-renderer/cli/` | 28 | Config only -- NO `main.rs` exists |
| `useWasmRenderer.ts` | `packages/sui-editor/src/WasmPreview/` | 234 | Types complete, uses mock WASM module |
| `WasmPreviewDemo.tsx` | `packages/sui-editor/src/WasmPreview/` | 282 | Fully functional demo component |
| `frame_composition.rs` | `packages/sui-video-renderer/compositor/benches/` | 165 | 4 benchmark scenarios (simple, complex, highres, parallel) |
| `compositor-bench.js` | `benchmark/compositor-comparison/node/` | 415 | Node.js/Sharp comparison benchmark |

### POC Benchmark Results (Preliminary)

| Scenario | Node.js (Sharp) | Rust | Speedup | Memory (Node) | Memory (Rust) |
|----------|----------------|------|---------|---------------|---------------|
| Simple (3 layers, 1080p) | ~45ms | ~4ms | 11x | ~500MB | ~150MB |
| Complex (10 layers, 1080p) | ~120ms | ~12ms | 10x | ~500MB | ~150MB |
| High-res (5 layers, 4K) | ~280ms | ~25ms | 11x | ~500MB | ~150MB |

WASM browser preview: 60 FPS sustained at 1080p. Bundle size: ~450KB uncompressed, ~95KB gzipped. Initial load: <2 seconds.

### Architecture Diagram

```
Frontend (Browser)                          Backend (Server)
+-----------------------------------+       +-----------------------------------+
|  React Video Editor UI (TS)       |       |  NestJS API Gateway               |
|  +-----------------------------+  |       |  +-----------------------------+  |
|  | Timeline | Layers | Export  |  |       |  | Job Queue (Bull + Redis)    |  |
|  +-----------------------------+  |       |  +-----------------------------+  |
|            |                      |       |            |                      |
|            v                      |       |            v                      |
|  +-----------------------------+  |       |  +-----------------------------+  |
|  | WASM Preview Renderer       |  |       |  | Rust Rendering Engine       |  |
|  | (Rust -> WASM)              |  |       |  | (Native binary)             |  |
|  | - Frame composition         |  |  .sue |  | - Frame Compositor          |  |
|  | - Real-time preview         |  | ----> |  | - Timeline Calculator       |  |
|  | - Canvas/WebGL output       |  |       |  | - Parallel Frame Pipeline   |  |
|  | - NO video encoding         |  |       |  +-----------------------------+  |
|  +-----------------------------+  |       |            |                      |
+-----------------------------------+       |            v                      |
                                            |  +-----------------------------+  |
                                            |  | FFmpeg Encoder              |  |
                                            |  | - H.264/H.265              |  |
                                            |  | - Audio mixing             |  |
                                            |  | - MP4/WebM muxing          |  |
                                            |  +-----------------------------+  |
                                            +-----------------------------------+
```

### Crate Dependency Graph

```
video-compositor (lib)
    |-- image 0.25
    |-- imageproc 0.25
    |-- rayon 1.10
    |-- serde 1.0
    |-- serde_json 1.0
    |-- thiserror 1.0
    |-- tracing 0.1
    |-- uuid
    +-- resvg 0.43

wasm-preview (cdylib)
    |-- video-compositor (path)
    |-- wasm-bindgen 0.2
    |-- web-sys 0.3
    |-- console_error_panic_hook 0.1
    |-- js-sys
    +-- serde_json 1.0

video-renderer-cli (bin)
    |-- video-compositor (path)
    |-- clap 4.5
    |-- indicatif 0.17
    |-- tokio 1.40
    |-- serde 1.0
    |-- serde_json 1.0
    |-- anyhow 1.0
    |-- tracing 0.1
    +-- tracing-subscriber 0.3
```

### Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| Phase 1: Core Compositor Completion | 2 weeks | Rotation, text rendering, 16+ blend modes, complete effects |
| Phase 2: Video Frame Support | 1 week | FFmpeg frame extraction, LRU cache, browser video capture |
| Phase 3: Animation & Keyframes | 1 week | Keyframe system, interpolation engine, easing functions |
| Phase 4: WASM Build & Integration | 1 week | Working npm package with TS types, real WASM in React hook |
| Phase 5: EditorEngine Integration | 1 week | CompositorController, render loop, fallback to Canvas |
| Phase 6: Performance Optimization | 1 week | Parallel rendering, caching, buffer pooling, benchmarks |
| Phase 7: Export Pipeline | 1 week | CLI with FFmpeg encoding, audio mixing, progress reporting |
| Phase 8: Testing & Documentation | 1 week | >80% test coverage, browser compat, API docs |
| **Total** | **8 weeks** | |

### Cost Estimate

| Item | Estimate |
|------|----------|
| Development (8 weeks at 40 hrs/week at $100/hr) | $32,000 - $56,000 |
| Estimated infrastructure savings (50% reduction at scale) | ~$1,500/month |
| ROI breakeven (high volume >1000 hrs/month processing) | 12-18 months |

### Reference Documents

- **Implementation Plan:** `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/IMPLEMENTATION_PLAN.md`
- **Architecture:** `/Users/stoked/work/stoked-ui/claudedocs/rust-poc/ARCHITECTURE.md`
- **Setup Guide:** `/Users/stoked/work/stoked-ui/claudedocs/rust-poc/SETUP_GUIDE.md`
- **POC README:** `/Users/stoked/work/stoked-ui/claudedocs/rust-poc/README.md`

### External References

- [image-rs documentation](https://docs.rs/image)
- [wasm-bindgen guide](https://rustwasm.github.io/wasm-bindgen/)
- [FFmpeg Rust bindings (ffmpeg-next)](https://github.com/zmwangx/rust-ffmpeg)
- [Canvas API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [WebCodecs API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [Criterion.rs benchmarking](https://bheisler.github.io/criterion.rs/book/)
