# Module: sui-video-renderer (`@stoked-ui/video-renderer-wasm` + `video-render` CLI)

> **Generated:** meta version 0.4.0 | **Last refreshed:** 2026-06-06 (TIMED REFRESH)
> **Package location:** `packages/sui-video-renderer/`
> **Language / build:** Rust (Cargo workspace, edition 2021, workspace version `0.1.0`) → WebAssembly (`wasm-pack`, target `web`) + native CLI binary.
> **Companion docs:** `.stokd/meta/packages/sui-video-renderer/SC_TEST.md`, `packages/sui-video-renderer/.axioms.md`, in-repo guides under `packages/sui-video-renderer/docs/`.

This is **not** a publishable `@stoked-ui/*` npm package built through the Babel/Turbo
pipeline. It is a self-contained Rust Cargo workspace whose build product (a WASM
bundle in `pkg/`) is consumed by `@stoked-ui/editor` as a file dependency, and whose
CLI binary (`video-render`) renders `.sue` projects offline. As such it is exempt from
`AX-REPO-PNPM-MONOREPO` / `AX-REPO-PACKAGE-BARREL` and is governed instead by
`AX-REPO-WASM-RENDERER-DEP` and `AX-PROD-SUI-004`.

---

## 1. Responsibility

The design intent is to **replace JavaScript canvas composition with native-speed
multi-layer frame composition**, shared by two runtimes from one engine:

- **Browser preview** — a small WASM module (`PreviewRenderer`) composes layers in
  WebAssembly and paints the result to a 2D canvas, giving the editor real-time
  preview/scrubbing without a JS render loop.
- **Offline / server export** — a native CLI (`video-render`) loads a `.sue` project,
  renders every frame through the same compositor, and pipes frames to FFmpeg for
  H.264/H.265/VP9 encoding (with optional audio mux).

Primary responsibilities:

1. **Frame composition** — z-ordered multi-layer blend (18 blend modes), transforms
   (position/scale/rotation/opacity/anchor/skew), effects (blur, shadow, gradients,
   color matrix, invert/grayscale/sepia, chromatic aberration), and text rendering
   (`fontdue`).
2. **Animation** — keyframed properties (`AnimatedProperty<T>`, easing functions) and a
   `Timeline`/`TimelineLayer` model mapping time → resolved static layers.
3. **Performance plumbing** — buffer pooling, tile-based rendering, resolution scaling
   for scrubbing, LRU frame/media caches, prefetching, and (native only) rayon-parallel
   blending.
4. **Runtime bridges** — WASM bridge (`PreviewRenderer` + `WasmLayer` JSON shape,
   `BrowserMediaLoader` for HTMLVideoElement frame capture) and CLI bridge (`.sue`
   parser, render driver, FFmpeg encoder/audio mixer).

A single rlib, `video-compositor`, is the source of truth; the WASM and CLI crates are
thin adapters over it. The compositor itself is **stateless with respect to time** — the
caller seeks media and selects the layer set; the compositor just composes what it is given.

---

## 2. Workspace layout & crates

`Cargo.toml` (workspace root) declares three members:

| Crate | Path | Crate type | Role |
|---|---|---|---|
| `video-compositor` | `compositor/` | `rlib` | Pure-Rust composition engine. Shared by both adapters. `wasm32`-safe by default; `native` / `native-video` features add rayon/tokio/FFmpeg. |
| `wasm-preview` | `wasm-preview/` | `cdylib` + `rlib` | `wasm-bindgen` glue exposing `PreviewRenderer` to JS. Built to `pkg/` and surfaced as `@stoked-ui/video-renderer-wasm`. `opt-level = "z"` for bundle size. |
| `video-renderer-cli` | `cli/` | `bin` (`video-render`) | Native CLI: loads `.sue`, drives the compositor frame-by-frame, encodes via FFmpeg. Depends on `video-compositor` with `features = ["native"]`. |

Cargo features on `video-compositor`: `default = []` (WASM-safe), `native = ["rayon",
"tokio"]`, `native-video = ["ffmpeg-next", "native"]`.

---

## 3. Public interfaces / entry points

### `video-compositor` (Rust API — `compositor/src/lib.rs`)

Re-exported public surface (the contract for both adapters):

- `Compositor` — `new(w, h) -> Result<Compositor>`, builders `with_background` /
  `with_buffer_pool` / `with_tile_rendering`; `compose(&[Layer])`,
  `compose_batch`, `compose_at_time(&[AnimatedLayer], time_ms)`,
  `compose_with_resolution_scale`, `compose_tiled`.
- `Layer` + `LayerContent` (`Image` / `SolidColor` / `Text` / `ImageData` /
  `Video`*) with constructors `image` / `solid_color` / `image_data` / `text` /
  `video`* and builders `with_blend_mode` / `with_z_index` / `with_visible` /
  `with_effects`.
- `Transform`, `BlendMode` (18 variants), `Effect` + `GradientStop`, `Frame`.
- `Timeline`, `TimelineLayer` (temporal bounds + `enabled`, `is_active_at`,
  `frame_count`, `frame_time`, `render_frame` / `render_frame_at`).
- `AnimatedLayer`, `AnimatedTransform`; `AnimatedProperty`, `Keyframe`,
  `EasingFunction`, `Interpolate`, `StepPosition`.
- `cache`: `FrameCache`, `ComposedFrameCache`, `Prefetcher`, `PlaybackDirection`,
  `ScrubbingDetector`.
- `text`: `TextRenderer`, `TextStyle`, `TextAlignment`, `TextShadow`, `Stroke`.
- `types`: `Color`, `Point`, `Rect`, `Size`.
- `Error` (thiserror) + `Result<T>` — variants `Image`, `Io`, `InvalidDimensions`,
  `InvalidLayer`, `Effect`, `Render`, `InvalidTransform`.

\* `Video` content and `Layer::video` are gated `#[cfg(not(target_arch = "wasm32"))]`;
frame decode requires the `native-video` feature.

### `wasm-preview` (JS-facing — `wasm-preview/src/lib.rs`, exported as `@stoked-ui/video-renderer-wasm`)

- `init()` — `#[wasm_bindgen(start)]`; installs the panic hook. Also exported as the
  default `__wbg_init` for explicit `await init()`.
- `PreviewRenderer` class:
  - `new(canvas: HTMLCanvasElement, width, height)`
  - `render_frame(layers_json: string)` — parses a `WasmLayer[]` JSON string, converts
    to compositor `Layer`s, composes, and `put_image_data` to the canvas.
  - `render_frame_at_time(layers_json, time_ms)` — currently delegates to `render_frame`
    (the JS caller seeks video elements before calling; the compositor is time-stateless).
  - `clear()`, `get_metrics() -> string` (JSON), `cache_image(url, data, w, h)`,
    `clear_image_cache()`, `is_image_cached(url) -> bool`.
- `Color` class (`new`, `rgb`); `benchmark_composition(width, height, layer_count)`.
- **`WasmLayer` JSON shape** (the cross-language contract): `{ id, type, color?,
  video_element_id?, image_url?, transform{ x,y,scale_x,scale_y,rotation,opacity },
  blend_mode?, visible, z_index }`. `type` ∈ `"solidColor" | "image" | "video" |
  "text"`; `blend_mode` is the camelCase string mapped in `convert_layer`.
- `BrowserMediaLoader` (`wasm-preview/src/video.rs`) — `capture_video_frame(id)` draws an
  `HTMLVideoElement` to a temp canvas and extracts RGBA; image cache by URL (`cache_image`,
  `get_cached_image`, `is_cached`, `clear_cache`).

### `video-renderer-cli` (`cli/src/main.rs`, binary `video-render`)

- `video-render render --input <file>.sue --output <file> [--quality low|medium|high|lossless]
  [--resolution WxH] [--format mp4|webm|mov] [--codec h264|h265|vp9] [--fps N]
  [--threads N] [--progress text|json]`
- `video-render info --input <file>.sue` — prints project metadata/tracks.
- `.sue` project model (`cli/src/project.rs`): `Project` { name, duration_ms, fps, width,
  height, tracks[], metadata }, `ProjectTrack`, `TrackType`
  (`video|image|audio|text|solidcolor`), `TrackAction` (FadeIn/FadeOut/Move/Scale/Rotate),
  `TrackTransform`. `Project::to_timeline` builds a `Timeline`; **video and text tracks are
  not yet supported** (`anyhow::bail!`), audio tracks are routed to the audio pipeline.

---

## 4. Products

- **SC_PRODUCT_STOKED_UI_SUI.md** — the only product doc that uses this module.
  - Listed as item 4 of the product surface: "A native Rust video renderer
    (`packages/sui-video-renderer`) that compiles to WASM for in-browser preview/render
    and ships a CLI binary (`video-render`)."
  - `video-render` is enumerated among the product's CLI binaries.
  - Build commands `pnpm video-renderer:build-wasm` / `pnpm build:wasm` and the WASM
    file-dependency relationship are documented in the product doc and codified in
    `AX-PROD-SUI-004` and the repo axiom `AX-REPO-WASM-RENDERER-DEP`.

---

## 5. Views

This module renders pixels into a canvas owned by other packages; it does not own a React
view. From `.stokd/meta/SC_VIEWS.md`:

- **§9.2 EditorView (Stage)** — the WASM `PreviewRenderer` paints composed frames onto the
  editor stage canvas; materially shapes the `previewing` state. (`§9.1 Editor (Root)`
  hosts it; `WasmPreview` is dynamically imported.)
- **`WasmPreviewDemo`** (`packages/sui-editor/src/WasmPreview/WasmPreviewDemo.tsx`) — the
  standalone demo surface that exercises `useWasmRenderer` end-to-end.
- **§22 Video Renderer Docs Site** — `docs/pages/video-renderer/docs/` (overview,
  quick-start, api-reference, rust-backend, wasm-frontend, nodejs-integration) documents
  this module but is authored in the docs app, not here.

---

## 6. Integration points

### Downstream (consumers of this module)

- **`@stoked-ui/editor`** is the primary consumer:
  - `EditorEngine.initWasmRenderer()` (`packages/sui-editor/src/EditorEngine/EditorEngine.ts`)
    dynamically `import('@stoked-ui/video-renderer-wasm')`, `await init()`, then
    `new PreviewRenderer(canvas, w, h)` and hands it to `CompositorController`.
  - `packages/sui-editor/src/WasmPreview/` — `useWasmRenderer` hook (mock fallback +
    dynamic WASM import), `actionMapper.ts` (`actionToWasmLayer` builds the `WasmLayer`
    JSON), `types.ts`, `wasm-module.d.ts` (hand-written ambient typings mirroring
    `pkg/wasm_preview.d.ts`).
  - `packages/sui-editor/src/Controllers/CompositorController.ts` drives `render_frame`.
- **`docs/next.config.mjs`** — webpack alias `@stoked-ui/video-renderer-wasm` →
  `packages/sui-video-renderer/pkg` and `experiments.asyncWebAssembly: true`. Editor
  preview/render flows degrade if the `pkg/` artifact is missing; `next.config.mjs`
  changes require a dev-server restart (not HMR).

### Upstream (this module depends on)

- **Rust crates:** `image`/`imageproc`/`fast_image_resize` (raster + transforms),
  `resvg`/`usvg`/`tiny-skia` (SVG), `fontdue` (text glyphs), `lru` (caches), `rayon`
  (native parallelism), `tokio` (native async), `ffmpeg-next` (native video decode, behind
  `native-video`), `wasm-bindgen`/`web-sys`/`js-sys`/`console_error_panic_hook` (WASM).
- **Browser APIs (WASM):** `HtmlCanvasElement`, `CanvasRenderingContext2d`,
  `HtmlVideoElement`, `ImageData` via `web-sys`.
- **External binary (CLI):** the **FFmpeg** executable on `PATH` — required for encoding
  and audio mux (`cli/src/ffmpeg.rs`, `cli/src/encoder.rs`, `cli/src/audio.rs`).

### Build / tooling contracts

- `pnpm build:wasm` → `scripts/build-wasm.sh`: cleans `pkg/`, runs
  `wasm-pack build --target web --out-dir ../pkg --release`, optionally `wasm-opt -Oz`,
  then **rewrites `pkg/package.json`** `name` → `@stoked-ui/video-renderer-wasm` and the
  `files`/`sideEffects` lists.
- `pnpm video-renderer:build-wasm` → `wasm-pack build --target web --out-dir ../pkg`
  (no metadata rewrite, no wasm-opt).
- `pnpm video-renderer:build` (`cargo build --release`),
  `pnpm video-renderer:test` (`cargo test --workspace`),
  `pnpm video-renderer:bench` (`cargo bench`).
- Built artifact filenames are `wasm_preview*` (crate name `wasm-preview`); resolution to
  the editor is by **path alias**, not by the npm package `name` field.

---

## 7. Key source files

### Composition engine (`compositor/src/`)

- `lib.rs` — public re-exports, `Error`/`Result`. The compositor contract.
- `compositor.rs` — `Compositor` (compose pipeline, z-sort, opacity, transform application,
  blend), `BufferPool`, tile rendering, resolution scaling, parallel vs sequential blend
  (`cfg`-gated on `rayon`/`wasm32`). Largest file; 37 inline unit tests. Public methods:
  `new`, `with_background`/`with_buffer_pool`/`with_tile_rendering`, `compose`,
  `compose_batch`, `compose_at_time`, `compose_with_resolution_scale`, `compose_tiled`.
- `layer.rs` — `Layer`/`LayerContent`, constructors/builders, `load_image()`.
- `blend.rs` — `BlendMode` (Normal, Multiply, Screen, Overlay, Add, Subtract, Lighten,
  Darken, SoftLight, HardLight, ColorDodge, ColorBurn, Difference, Exclusion, Hue,
  Saturation, Color, Luminosity) and the per-pixel `blend()` math.
- `transform.rs` — `Transform` (position/scale/rotation/opacity/anchor/skew) + builders.
- `effects.rs` — `Effect` enum + `GradientStop`; `apply()` and `create_shadow()`.
- `text.rs` — `TextRenderer`/`TextStyle` (fontdue), alignment, wrapping, stroke, shadow.
- `keyframe.rs` / `animated.rs` — keyframe interpolation and `AnimatedLayer::resolve_at`.
- `timeline.rs` — `Timeline`/`TimelineLayer` (time bounds, active-layer selection,
  global→local time, `render_frame[_at]`).
- `cache.rs` — `FrameCache`, `ComposedFrameCache`, `Prefetcher`, `ScrubbingDetector`.
- `frame.rs` / `types.rs` — `Frame` (RgbaImage wrapper) and `Color`/`Point`/`Rect`/`Size`.
- `video.rs` — native FFmpeg-backed frame extraction (`cfg(not(wasm32))`).

### WASM bridge (`wasm-preview/src/`)

- `lib.rs` — `PreviewRenderer`, `WasmLayer`/`WasmTransform`, `convert_layer` (string →
  enum mapping for layer type & blend mode), `init`, `benchmark_composition`.
- `video.rs` — `BrowserMediaLoader` (video-frame capture + image cache).

### CLI (`cli/src/`)

- `main.rs` — clap CLI (`render` / `info`), `parse_resolution`, rayon thread pool setup.
- `project.rs` — `.sue` JSON model + `to_timeline`.
- `render.rs` — frame-by-frame render driver, progress (text/json), audio-mux orchestration.
- `encoder.rs` / `ffmpeg.rs` / `audio.rs` — FFmpeg encode config, invocation, audio mix/mux.

### Build / generated

- `scripts/build-wasm.sh` — canonical WASM build + metadata fix.
- `pkg/` — generated WASM artifact consumed by the editor (`wasm_preview_bg.wasm`,
  `wasm_preview.js`, `wasm_preview_bg.js`, `wasm_preview.d.ts`, `package.json`). Checked in.
- `Cargo.toml` (root + per-crate), `IMPLEMENTATION_PLAN.md` (historical 8-phase plan;
  aspirational, not a current status doc).

---

## 8. Change impact — what to validate when this module changes

- **Compositor API (`compositor/src/lib.rs` re-exports):** both `wasm-preview` and `cli`
  compile against it. Run `cargo test --workspace`. A signature change breaks one or both
  adapters at compile time — coordinate in the same change.
- **`WasmLayer` JSON shape / `layer_type` strings / `blend_mode` strings
  (`wasm-preview/src/lib.rs`):** this is a runtime, untyped contract with the editor's
  `actionMapper.ts`. A field rename or new layer type that is not mirrored in
  `packages/sui-editor/src/WasmPreview/actionMapper.ts` + `types.ts` silently drops or
  mis-renders layers (no compile error). Update both sides and `wasm-module.d.ts`.
- **`PreviewRenderer` method signatures:** mirror changes into
  `packages/sui-editor/src/WasmPreview/wasm-module.d.ts` and the `PreviewRendererInstance`
  interfaces in `EditorEngine.ts` / `CompositorController.ts` / `useWasmRenderer.ts`.
- **WASM build artifact (`pkg/`):** after Rust changes, **rebuild** (`pnpm build:wasm`),
  or the editor consumes a stale `pkg/`. Editor preview is the observable check
  (`AX-PROD-SUI-004` / `AX-REPO-WASM-RENDERER-DEP`). Keep `experiments.asyncWebAssembly`
  and the alias path in `docs/next.config.mjs`.
- **`wasm32` safety:** never add `rayon`/`tokio`/`ffmpeg-next`/`std::fs` to a code path
  reachable from the default (WASM) build. Native-only code must stay behind
  `#[cfg(not(target_arch = "wasm32"))]` or the `native`/`native-video` features. Verify
  the WASM build still compiles (`wasm-pack build`).
- **`.sue` format (`cli/src/project.rs`):** the JSON model is shared with editor project
  serialization and the CLI fixtures (`cli/tests/fixtures/*.sue`). Schema changes need the
  CLI `info`/`render` paths and fixtures updated; run `cargo test -p video-renderer-cli`.
- **CLI encode/audio:** FFmpeg argument shaping is unit-tested without invoking the binary;
  true e2e (`cli/tests/e2e.rs`) is gated on FFmpeg being installed. State explicitly when
  FFmpeg was/wasn't available during validation.
- **Build-script metadata:** if crate names or output filenames change, update
  `scripts/build-wasm.sh` (the `name`/`files`/`sideEffects` rewrite) and the
  `docs/next.config.mjs` alias together.
