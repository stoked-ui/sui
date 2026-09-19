# SC_MODULE_SUI_VIDEO_RENDERER

**Meta version:** 0.2.0
**Package location:** `packages/sui-video-renderer/`

---

## Responsibility

`sui-video-renderer` is a Rust/WebAssembly video compositor for the Stoked UI Editor. Its design intent is to replace JavaScript canvas rendering with native-speed frame composition, targeting 60 FPS preview at 1080p with complex multi-layer scenes.

The module is **not yet integrated for production use**. The WASM binary exists in `wasm-preview/pkg/` and `sui-editor` has stubs wired up, but the full EditorEngine switch and the CLI export pipeline are still in-progress phases (see `IMPLEMENTATION_PLAN.md`).

Primary responsibilities:
- **Browser preview** — WASM module (`wasm-preview`) composites multi-layer frames into an `HTMLCanvasElement` in real time.
- **Server-side export** — CLI tool (`cli`) renders `.sue` project files to MP4/WebM via FFmpeg.
- **Core composition library** — Rust library (`compositor`) implements all pixel-level operations: blending, transforms, effects, text, keyframe animation, and frame caching.

---

## Public Interfaces / Entry Points

### WASM module — `wasm-preview/pkg/`

Built with `wasm-pack build --target bundler --out-dir pkg`. Imported by `sui-editor` as `@stoked-ui/video-renderer-wasm` (webpack alias in `docs/next.config.mjs:139`).

| Export | File | Description |
|---|---|---|
| `init()` | `wasm_preview.d.ts:79` | Initialises the WASM module; sets panic hook. Called once on module load. |
| `class PreviewRenderer` | `wasm_preview.d.ts:21` | Main renderer. Constructed with `(canvas, width, height)`. |
| `PreviewRenderer.render_frame(layersJson)` | `wasm-preview/src/lib.rs:156` | Accepts a JSON array of `WasmLayer` objects; composites and paints to canvas. |
| `PreviewRenderer.render_frame_at_time(layersJson, timeMs)` | `wasm-preview/src/lib.rs:184` | Same as `render_frame`; `timeMs` is a hint for the JS caller to seek video elements before calling. |
| `PreviewRenderer.cache_image(url, data, width, height)` | `wasm-preview/src/lib.rs:217` | Pre-loads RGBA image bytes from JS into the in-WASM image cache. |
| `PreviewRenderer.clear()` | `wasm-preview/src/lib.rs:192` | Clears the canvas. |
| `PreviewRenderer.get_metrics()` | `wasm-preview/src/lib.rs:197` | Returns JSON with `{width, height, ready, cached_images}`. |
| `PreviewRenderer.free()` | generated | Drops the WASM object; must be called on unmount to avoid memory leaks. |
| `benchmark_composition(w, h, n)` | `wasm-preview/src/lib.rs:356` | Renders `n` solid-color layers and returns elapsed ms. |
| `class Color` | `wasm-preview/src/lib.rs:36` | RGBA color helper. |

**Layer JSON schema** (`WasmLayer` in `wasm-preview/src/lib.rs:97`):
```json
{
  "id": "string",
  "type": "solidColor" | "image" | "video" | "text",
  "color": [r, g, b, a],           // solidColor only
  "video_element_id": "string",    // video only — DOM id of HTMLVideoElement
  "image_url": "string",           // image only — must be pre-cached via cache_image()
  "transform": { "x", "y", "scale_x", "scale_y", "rotation", "opacity" },
  "blend_mode": "normal|multiply|screen|overlay|...",
  "visible": true,
  "z_index": 0
}
```

### CLI tool — `cli/`

Binary name: `video-render`. Entry: `cli/src/main.rs`.

```bash
video-render render --input project.sue --output video.mp4 [--quality high] [--resolution 1920x1080] [--fps 30] [--threads 0]
video-render info   --input project.sue
```

Subcommand structs: `RenderArgs`, `InfoArgs`. Uses `rayon` for parallel frame rendering and `ffmpeg` via `cli/src/ffmpeg.rs`.

### Compositor library — `compositor/`

Native Rust library. All public symbols re-exported from `compositor/src/lib.rs`.

| Symbol | Description |
|---|---|
| `Compositor::new(width, height)` | Creates a compositor for a given output resolution. |
| `Compositor::compose(&layers) -> Frame` | Composites all visible layers into a single `Frame`. |
| `Layer::solid_color(color, transform)` | Solid fill layer. |
| `Layer::image_data(data, w, h, transform)` | Layer from raw RGBA bytes. |
| `Layer::image(path, transform)` | Layer from file (native only). |
| `Transform` | Position, scale (XY), rotation, opacity, anchor. |
| `BlendMode` | 17 modes: Normal, Multiply, Screen, Overlay, Add, Subtract, Lighten, Darken, SoftLight, HardLight, ColorDodge, ColorBurn, Difference, Exclusion, Hue, Saturation, Color, Luminosity. |
| `AnimatedLayer` / `AnimatedTransform` | Keyframe-driven layer animation. |
| `FrameCache` / `ComposedFrameCache` | LRU caches for decoded and composed frames. |
| `Prefetcher` / `ScrubbingDetector` / `PlaybackDirection` | Predictive frame prefetch helpers. |
| `Effect` / `GradientStop` | Visual effects: blur, shadow, gradient, invert, grayscale. |
| `TextRenderer` / `TextStyle` / `TextAlignment` | Text layer rendering. |
| `Timeline` / `TimelineLayer` | Timeline-to-layer mapping. |
| `Frame` | Composited frame buffer (`RgbaImage` wrapper). |
| `BufferPool` | Pre-allocated frame buffer pool (`compositor/src/compositor.rs:24`). |

---

## Products

No product doc files were specified in the generation request. The module is used by the **Editor** product (`packages/sui-editor`).

---

## Views

From `SC_VIEWS.md`, this module materially shapes:

| View | Section | Role |
|---|---|---|
| **Editor Preview (EditorView)** | §4.2 | Canvas target for WASM compositor output. The `viewer` panel hosts an `HTMLCanvasElement` that `PreviewRenderer` paints into. |
| **Editor (Full Application)** | §4.1 | `useWasmRenderer` is initialised here; `CompositorController` is registered with `EditorEngine`. |
| **Editor PWA** | §1.5 | Standalone editor embed — same WASM render path applies. |

---

## Integration Points

### Upstream (consumes)

| Dependency | Contract |
|---|---|
| `sui-editor` → `EditorEngine` | `EditorEngine` accepts `useWasmRenderer: true` option; wires `CompositorController` as a timeline controller. |
| `sui-timeline` | `CompositorController` (`packages/sui-editor/src/Controllers/CompositorController.ts`) implements `IController` from `@stoked-ui/timeline`; receives `enter / update / leave / start / stop` lifecycle calls keyed to timeline actions. |
| Browser DOM | Video layers read pixel data from `HTMLVideoElement` by DOM id via `BrowserMediaLoader.capture_video_frame()` (`wasm-preview/src/video.rs:44`). JS must seek the video element before calling `render_frame`. |
| `next.config.mjs` | `asyncWebAssembly: true` (line 126) + webpack alias `@stoked-ui/video-renderer-wasm` → `packages/sui-video-renderer/wasm-preview/pkg` (line 139). Both must stay in sync with the built pkg output. |

### Downstream (produces)

| Consumer | What it receives |
|---|---|
| `HTMLCanvasElement` (browser) | Composited RGBA frame painted via `ctx.putImageData()`. |
| FFmpeg process (CLI) | Rendered frame images piped for H.264/H.265/VP9 encoding. |
| `useWasmRenderer` hook | `canvasRef`, `renderFrame`, `renderFrameAtTime`, `startRenderLoop`, `stopRenderLoop`, `metrics`, `benchmark`. |

### Fallback path

If the WASM build is absent or fails to load, `useWasmRenderer` (`packages/sui-editor/src/WasmPreview/useWasmRenderer.ts:111`) silently substitutes a no-op `MockPreviewRenderer`. The editor continues to function with the existing JS canvas path.

---

## Key Source Files

| File | Why it matters |
|---|---|
| `wasm-preview/src/lib.rs` | WASM entry point. Defines `PreviewRenderer`, `WasmLayer`, `WasmTransform`, `Color`, and `benchmark_composition`. This is the JS/Rust boundary. |
| `wasm-preview/src/video.rs` | `BrowserMediaLoader` — captures video frames from DOM via temporary canvas and manages the in-WASM image cache. |
| `wasm-preview/pkg/wasm_preview.d.ts` | Generated TypeScript types for the WASM API. Updated automatically by `wasm-pack build`. Do not edit by hand. |
| `wasm-preview/pkg/wasm_preview_bg.wasm` | The compiled binary. Not in git; must be built locally with `wasm-pack build --target bundler --out-dir pkg`. |
| `compositor/src/lib.rs` | Re-exports entire public API of the compositor crate; defines the `Error` enum. |
| `compositor/src/compositor.rs` | `Compositor::compose()` — the main render loop. Contains `BufferPool` for allocation-free rendering. |
| `compositor/src/blend.rs` | Pixel-level blend mode implementations (17 modes). |
| `compositor/src/keyframe.rs` | `Keyframe<T>`, `AnimatedProperty<T>`, `EasingFunction` — animation interpolation engine. |
| `compositor/src/cache.rs` | `FrameCache`, `ComposedFrameCache`, `Prefetcher`, `ScrubbingDetector` — LRU caching and predictive prefetch. |
| `cli/src/main.rs` | CLI entry; parses `render` / `info` subcommands; configures rayon thread pool. |
| `cli/src/render.rs` | `RenderCommand::execute()` — batch frame rendering pipeline. |
| `cli/src/ffmpeg.rs` | FFmpeg process integration for frame-to-video encoding. |
| `packages/sui-editor/src/WasmPreview/useWasmRenderer.ts` | React hook that loads the WASM module, creates `PreviewRenderer`, drives the rAF loop, tracks metrics, and exposes the render API. |
| `packages/sui-editor/src/Controllers/CompositorController.ts` | `CompositorControl` — timeline controller bridging `IController` lifecycle to `PreviewRenderer.render_frame()`. |
| `IMPLEMENTATION_PLAN.md` | Authoritative 8-phase plan with status, performance targets, and risk table. Most phases are still in progress. |

---

## Change Impact

### WASM binary changes (`wasm-preview/`)

- **Rebuild required** after any Rust change: `cd packages/sui-video-renderer/wasm-preview && wasm-pack build --target bundler --out-dir pkg`
- The dev server does not hot-reload WASM; restart required after rebuild.
- TypeScript types in `wasm_preview.d.ts` are regenerated — check for API drift in `useWasmRenderer.ts` and `CompositorController.ts`.
- Webpack alias in `docs/next.config.mjs:139` points to `pkg/`; if the pkg output path changes, update that alias.
- `asyncWebAssembly: true` in `next.config.mjs:126` must remain set or the module will fail to load.

### Compositor library changes (`compositor/`)

- Used by both `wasm-preview` and `cli`; changes affect both consumers.
- Blend mode changes: validate with `compositor/tests/blend_accuracy.rs`.
- Transform changes: validate with `compositor/tests/transform_correctness.rs`.
- Effects changes: validate with `compositor/tests/effects_integration.rs` and `effects_validation.rs`.
- Performance regressions: run `cargo bench` (`compositor/benches/frame_composition.rs`) and compare against `benchmark/baseline.json`.

### CLI changes (`cli/`)

- Run `cli/tests/e2e.rs` against both fixture files (`simple.sue`, `animated.sue`).
- FFmpeg integration (`cli/src/ffmpeg.rs`) is sensitive to FFmpeg version; test on CI with the pinned version.

### Editor integration changes (`sui-editor/`)

- `CompositorController` layer lifecycle (`enter/update/leave`) must stay in sync with the `WasmLayer` JSON schema consumed by `PreviewRenderer.render_frame()`.
- `useWasmRenderer` hook cleanup (`renderer.free()`) is critical — WASM memory is not GC'd; leaks accumulate across hot reloads.
- If `WasmLayer.video_element_id` mapping changes, the DOM video element seek strategy in `EditorView` must be updated in parallel.

### `.sue` project file format

- `cli/src/project.rs` parses `.sue` files; `compositor/src/timeline.rs` maps them to layers. Changes to either break CLI rendering and may break preview-to-export parity.
