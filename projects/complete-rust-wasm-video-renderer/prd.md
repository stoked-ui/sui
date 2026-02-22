# Product Requirements Document: Complete Rust/WASM Video Renderer

---

## Section 0: Source Context

| Field | Value |
|---|---|
| **Source PFB** | `/Users/stoked/work/stoked-ui/projects/complete-rust-wasm-video-renderer/pfb.md` |
| **Implementation Plan** | `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/IMPLEMENTATION_PLAN.md` |
| **Architecture Document** | `/Users/stoked/work/stoked-ui/claudedocs/rust-poc/ARCHITECTURE.md` |
| **Document Status** | PRD - Ready for execution |
| **Created** | 2026-02-16 |
| **Owner** | Stoked Consulting |
| **Estimated Duration** | 8 weeks (Phases 1-8) |

### POC Status Summary

The proof-of-concept Rust/WASM video compositor has been validated with the following results:

- **Compositor library**: ~95% complete (284 lines in `compositor.rs`, 214 lines in `blend.rs`, 245 lines in `effects.rs`, 168 lines in `layer.rs`, 141 lines in `transform.rs`, 96 lines in `frame.rs`, 129 lines in `types.rs`)
- **WASM bindings**: 100% complete (282 lines in `wasm-preview/src/lib.rs`)
- **React integration scaffolding**: In place (`useWasmRenderer.ts` - 234 lines, `WasmPreviewDemo.tsx` - 282 lines) but using a `MockPreviewRenderer`
- **Benchmark suite**: 4 scenarios established in `frame_composition.rs` (165 lines)
- **Benchmark results**: 10-11x speedup over Node.js/Sharp across all tested scenarios

### Known Gaps Requiring Production Work

| Gap | Current State | Location |
|---|---|---|
| Rotation | Logs warning, returns unrotated image | `compositor/src/compositor.rs:142-148` |
| Text rendering | Logs warning, skips entirely | `compositor/src/compositor.rs:104-108` |
| Shadow effects | Returns clone of input (no-op) | `compositor/src/effects.rs:45-48` |
| Blend modes | 8 of 16+ implemented | `compositor/src/blend.rs` |
| WASM module | Mock class in React hook | `sui-editor/src/WasmPreview/useWasmRenderer.ts:90-99` |
| CLI export | `Cargo.toml` exists, NO `main.rs` | `cli/Cargo.toml` (config only) |
| Video frames | No FFmpeg integration, no frame extraction | Not started |
| Animation/keyframes | No system exists | Not started |

---

## Section 1: Objectives & Constraints

### 1.1 Primary Objectives

1. **Real-time browser preview at 60 FPS.** Compose 10 layers at 1920x1080 within a 16ms frame budget using the WASM renderer, replacing the current `MockPreviewRenderer` in `useWasmRenderer.ts`.
2. **Production-quality video export.** Deliver a CLI tool (`cli/src/main.rs`) that reads `.sue` project files and outputs encoded video (H.264/H.265) via FFmpeg, with audio mixing and progress reporting.
3. **Full feature parity with professional compositors.** Complete rotation, text rendering, 16+ blend modes, shadow/gradient effects, and a keyframe-driven animation system.
4. **Seamless EditorEngine integration.** Create a `CompositorController` implementing `IController` (from `@stoked-ui/timeline`), integrate into the `EditorEngine` render loop (in `EditorEngine.ts`), and provide graceful fallback to Canvas when WASM is unavailable.

### 1.2 Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Preview FPS (1080p, 10 layers) | 60 FPS sustained | Criterion benchmark + browser Performance API |
| Frame composition time | < 16ms | `performance.now()` in render loop |
| WASM bundle size (gzipped) | < 100KB (~450KB uncompressed) | Build output measurement |
| Memory usage (1080p complex project) | < 200MB browser, < 2GB server | Browser DevTools, `/proc/status` |
| Time to first frame | < 100ms | User Timing API |
| Rust vs. Node.js speedup | 10-50x (varies by scenario) | Benchmark comparison suite |
| Memory reduction vs. Node.js | 50-70% | Benchmark comparison suite |
| Test coverage (compositor crate) | > 80% | `cargo tarpaulin` |
| Export audio/video sync | Within 1 frame tolerance | Automated A/V sync test |
| Browser compatibility | Chrome, Firefox, Safari, Edge | Automated browser test matrix |
| No memory leaks | Pass 1-hour stress test | Browser DevTools heap snapshots |

### 1.3 Constraints

1. **WASM bundle size must stay under 500KB uncompressed (~100KB gzipped).** Font data for text rendering is the primary risk to this budget.
2. **No WASM threads (SharedArrayBuffer).** Cross-origin isolation headers may not be available in all deployment contexts. `rayon` parallelism is native-only.
3. **No video encoding in the browser.** The WASM preview is composition-only. Full video export requires the server-side CLI tool.
4. **Rust toolchain required.** Contributors must have Rust, `wasm-pack`, and `wasm-opt` installed.
5. **Browser memory limits.** Composition at 1080p requires ~8MB per frame buffer (1920 * 1080 * 4 bytes). The renderer must stay under 200MB total with multiple buffers.
6. **Canvas fallback must remain functional.** The existing `drawImage`-based rendering path in `EditorEngine.ts` and controllers (e.g., `VideoController.ts`) must continue working when WASM is unavailable.

### 1.4 Out of Scope

- GPU rendering via WebGPU/wgpu (future optimization)
- WebCodecs API integration (limited browser support, deferred)
- Native Node.js module via napi-rs (subprocess approach first)
- Real-time collaborative editing
- Mobile-native rendering (WASM in mobile browsers is in scope; native iOS/Android is not)
- DRM/content protection
- Cloud rendering infrastructure (Kubernetes, auto-scaling)
- Plugin/extension system for custom effects

---

## Section 2: Execution Phases

---

### Phase 1: Core Compositor Completion (Weeks 1-2)

**Purpose:** Complete the compositor library to production quality by implementing all missing rendering capabilities -- rotation with anti-aliasing, text rendering via font rasterization, 16+ Photoshop-compatible blend modes, and full shadow/gradient/filter effects. This phase transforms the 95%-complete POC into a feature-complete composition engine.

---

#### 1.1 Rotation & Transform Completion

**skillLevel:** mid-level engineer

**Implementation Details:**

Complete the rotation implementation that is currently stubbed out in `compositor/src/compositor.rs` (lines 142-148, which log a warning and return the unrotated image). The `Transform` struct in `compositor/src/transform.rs` already has `rotation: f32` and `anchor: Point` fields defined but unused during composition.

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/compositor.rs` -- Replace the rotation warning block (lines 142-148) with actual rotation using `imageproc::geometric_transformations::rotate_about_center`
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/transform.rs` -- Add `skew: Point` field to the `Transform` struct and update `Default`, `is_identity()`, and builder methods

**Rotation implementation:**
- Use `imageproc::geometric_transformations::rotate_about_center` with `Interpolation::Bilinear` for anti-aliased rotation
- Add fast paths for common angles: 90 degrees (`image::imageops::rotate90`), 180 degrees (`image::imageops::rotate180`), 270 degrees (`image::imageops::rotate270`)
- Respect the `anchor` field in `Transform` (currently defaulting to `Point::new(0.5, 0.5)` center) by translating before and after rotation

**Anchor point implementation:**
- The `anchor` field already exists on the `Transform` struct at `transform.rs:23` with default `(0.5, 0.5)`
- Apply anchor-relative positioning: translate the layer so the anchor point is at the origin, apply scale/rotation, then translate back
- Support both percentage (0.0-1.0 relative to layer bounds) and absolute pixel values (detect by checking if values > 1.0)

**Skew/shear implementation:**
- Add `skew: Point` field to `Transform` with default `(0.0, 0.0)` representing horizontal and vertical skew in degrees
- Implement matrix-based affine transformation using `imageproc::geometric_transformations::warp` with a custom projection matrix combining translate, scale, rotate, and skew

**Acceptance Criteria:**

- AC-1.1.A: Rotating a 200x200 solid color layer by 45 degrees -> The output image contains non-axis-aligned edges with anti-aliased pixels (no jagged stairstepping), and the rotated layer is composited at the correct position respecting the anchor point.
- AC-1.1.B: Rotating a layer by exactly 90, 180, or 270 degrees -> The fast path is used (no Bilinear interpolation overhead), and the output matches `image::imageops::rotate90/180/270` exactly.
- AC-1.1.C: Setting anchor to `(0.0, 0.0)` (top-left) and rotating 45 degrees -> The layer rotates around its top-left corner, not its center.
- AC-1.1.D: Applying horizontal skew of 30 degrees -> The output image shows a parallelogram-shaped transformation of the original rectangular layer.
- AC-1.1.E: Calling `Transform::default()` -> `is_identity()` returns `true` (including the new `skew` field at zero).

**Acceptance Tests:**

- Test-1.1.A: Unit test -- Create a 200x200 red solid on a 400x400 black background. Rotate 45 degrees around center anchor. Assert: pixels along the rotated edge are not pure red or pure black (anti-aliased). Assert: the center pixel of the rotated region is red.
- Test-1.1.B: Unit test -- Create a 100x200 image with left half red, right half blue. Rotate 90 degrees. Assert: output matches `imageops::rotate90` output byte-for-byte.
- Test-1.1.C: Unit test -- Create a 100x100 layer at position (100, 100) with anchor `(0.0, 0.0)`. Rotate 90 degrees. Assert: the pixel at (100, 100) is still the layer color (rotation pivot did not move).
- Test-1.1.D: Unit test -- Create a 100x100 red layer. Apply horizontal skew of 30 degrees. Assert: the output bounding box width is greater than 100 pixels. Assert: pixel at original center is red.
- Test-1.1.E: Unit test -- Assert `Transform::default().is_identity() == true` and `Transform::new().with_skew(10.0, 0.0).is_identity() == false`.

---

#### 1.2 Text Rendering

**skillLevel:** senior engineer

**Implementation Details:**

Create a new text rendering module to replace the stub at `compositor/src/compositor.rs:104-108` (which logs a warning and skips all text layers). The `LayerContent::Text` variant in `compositor/src/layer.rs:20-25` already defines `text`, `font_size`, `color`, and `font_family` fields.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/text.rs` -- New module for text rasterization

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/lib.rs` -- Add `pub mod text;` and `pub use text::TextRenderer;`
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/layer.rs` -- Extend `LayerContent::Text` with `alignment`, `line_height`, `letter_spacing`, `wrap_width`, `stroke`, `shadow` fields
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/compositor.rs` -- Replace the text warning block with actual rendering calls
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/Cargo.toml` -- Add `fontdue = "0.9"` dependency

**Text rendering approach:**
- Use `fontdue` crate (lighter than `rusttype`, pure Rust, no system dependencies) for glyph rasterization
- Implement `TextRenderer` struct with font caching using a `HashMap<(String, u16), fontdue::Font>` keyed by (font_family, size_bucket)
- Rasterize text to an `RgbaImage` which is then composited like any other image layer

**TextStyle struct:**
```rust
pub struct TextStyle {
    pub font_family: String,
    pub font_size: f32,
    pub font_weight: u16,       // 100-900
    pub color: Color,
    pub alignment: TextAlignment, // Left, Center, Right, Justify
    pub line_height: f32,        // multiplier, default 1.2
    pub letter_spacing: f32,     // pixels
    pub wrap_width: Option<f32>, // None = no wrap
    pub stroke: Option<Stroke>,  // outline
    pub shadow: Option<TextShadow>,
}
```

**Font loading strategy:**
- Bundle a default font (e.g., Noto Sans Regular, ~500KB TTF) embedded via `include_bytes!` for guaranteed availability
- Support loading additional fonts from file paths (native) or `Uint8Array` (WASM)
- Cache parsed `fontdue::Font` objects for reuse across frames

**Acceptance Criteria:**

- AC-1.2.A: Creating a text layer with "Hello World" at 48px -> The compositor renders readable text onto the output frame at the specified position with the specified color.
- AC-1.2.B: Setting text alignment to Center with a wrap width of 400px -> Multi-line text is centered within the 400px bounding box.
- AC-1.2.C: Adding a 2px white stroke to black text -> Each glyph has a visible white outline around the text characters.
- AC-1.2.D: The default embedded font renders without requiring any external font files -> Text layers work out of the box with no file system dependencies.
- AC-1.2.E: Rendering the same text 100 times -> Subsequent renders reuse the cached font, with cache hit rate > 99%.

**Acceptance Tests:**

- Test-1.2.A: Unit test -- Create a text layer "Test" at 48px white on a 200x100 black background. Assert: at least one pixel in the expected text region is white (255, 255, 255, 255). Assert: pixels outside the text bounding box are black.
- Test-1.2.B: Unit test -- Create two text layers: one left-aligned, one center-aligned, both with the same text, wrap width 400px. Assert: the leftmost non-background pixel of the center-aligned text is further right than the left-aligned text.
- Test-1.2.C: Unit test -- Create text "A" at 96px with 4px white stroke on black background. Assert: pixels immediately outside the glyph boundary are white (stroke). Assert: pixels further away are black (background).
- Test-1.2.D: Integration test -- Create a `TextRenderer` with no external font paths. Render text "ABC". Assert: no errors, output contains non-transparent pixels.
- Test-1.2.E: Benchmark test -- Render "Lorem ipsum" 100 times. Assert: total time for renders 2-100 is less than 50% of the time for render 1 (proving cache effectiveness).

---

#### 1.3 Advanced Blend Modes

**skillLevel:** engineer

**Implementation Details:**

Extend the `BlendMode` enum in `compositor/src/blend.rs` (currently 8 modes: Normal, Multiply, Screen, Overlay, Add, Subtract, Lighten, Darken) to include all Photoshop-compatible blend modes. The existing blend architecture at `blend.rs:33-69` uses a `blend(&self, bottom, top) -> [u8; 4]` pattern that converts to float, applies the mode, and converts back.

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/blend.rs` -- Add new enum variants and blend functions
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/wasm-preview/src/lib.rs` -- Update the `convert_layer` match arm at line 200-208 to handle new blend mode strings

**New blend modes to implement:**
1. **SoftLight** -- Combination of Dodge and Burn: `if top < 0.5: result = 2*base*top + base^2*(1-2*top)` else `result = 2*base*(1-top) + sqrt(base)*(2*top-1)`
2. **HardLight** -- Overlay with layers swapped: `if top < 0.5: 2*base*top` else `1-2*(1-base)*(1-top)`
3. **ColorDodge** -- `base / (1 - top)` clamped to 1.0
4. **ColorBurn** -- `1 - (1 - base) / top` clamped to 0.0
5. **Difference** -- `|base - top|`
6. **Exclusion** -- `base + top - 2*base*top`
7. **Hue** -- Preserve hue of top, saturation and luminosity of bottom (requires HSL conversion)
8. **Saturation** -- Preserve saturation of top, hue and luminosity of bottom
9. **Color** -- Preserve hue and saturation of top, luminosity of bottom
10. **Luminosity** -- Preserve luminosity of top, hue and saturation of bottom

The HSL-dependent modes (Hue, Saturation, Color, Luminosity) can reuse the existing `rgb_to_hsl` and `hsl_to_rgb` helper functions already implemented in `effects.rs:134-201`.

**Acceptance Criteria:**

- AC-1.3.A: `BlendMode` enum contains at least 18 variants (8 existing + 10 new) -> All variants are serializable/deserializable via serde.
- AC-1.3.B: Blending white (255,255,255) over mid-gray (128,128,128) with ColorDodge -> Result is white (255,255,255) due to dodge formula.
- AC-1.3.C: Blending identical colors with Difference mode -> Result is black (0,0,0,alpha) for all channels.
- AC-1.3.D: Blending a pure red top layer (255,0,0) over a blue bottom (0,0,255) with Hue mode -> Result has the hue of red but the luminosity of blue.
- AC-1.3.E: WASM `convert_layer` correctly maps string "softLight" to `BlendMode::SoftLight` -> Layer is rendered with the correct blend mode in browser preview.

**Acceptance Tests:**

- Test-1.3.A: Unit test -- Iterate all `BlendMode` variants. For each, serialize to JSON and deserialize back. Assert: round-trip succeeds for all 18+ variants.
- Test-1.3.B: Unit test -- `BlendMode::ColorDodge.blend([128,128,128,255], [255,255,255,255])` returns `[255,255,255,255]`.
- Test-1.3.C: Unit test -- `BlendMode::Difference.blend([100,150,200,255], [100,150,200,255])` returns `[0,0,0,255]`.
- Test-1.3.D: Unit test -- `BlendMode::Hue.blend([0,0,255,255], [255,0,0,255])`. Convert result to HSL. Assert: hue matches red's hue (within 5 degree tolerance). Assert: luminosity matches blue's luminosity (within 5% tolerance).
- Test-1.3.E: Unit test (WASM) -- Pass JSON layer with `"blend_mode": "softLight"` to `PreviewRenderer.render_frame()`. Assert: no error. Assert: the render completes and the resulting pixel values differ from Normal blend.

---

#### 1.4 Enhanced Effects

**skillLevel:** mid-level engineer

**Implementation Details:**

Complete the effects pipeline in `compositor/src/effects.rs`. Currently, shadows return a clone at line 45-48 (`Effect::Shadow { .. } => Ok(image.clone())`). Additionally, gradient support and color filter effects are missing entirely.

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/effects.rs` -- Implement shadow rendering, add gradient and color filter variants to the `Effect` enum
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/compositor.rs` -- Update `render_layer` to handle shadow as a pre-composite step (render shadow layer beneath the source)

**Shadow implementation:**
- Create a shadow image by: (a) duplicating the source alpha channel, (b) filling with shadow color, (c) applying Gaussian blur with the shadow's blur radius, (d) offsetting by `(offset_x, offset_y)`
- Composite the shadow layer beneath the source layer in the composition stack
- Support both outer shadows (default) and inner shadows (invert the alpha mask)

**New `Effect` variants to add:**
```rust
// Gradients
Effect::LinearGradient { angle: f32, stops: Vec<GradientStop> }
Effect::RadialGradient { center: Point, radius: f32, stops: Vec<GradientStop> }

// Color filters
Effect::Invert
Effect::Grayscale
Effect::Sepia { intensity: f32 }
Effect::ColorMatrix { matrix: [f32; 20] }  // 4x5 color matrix
Effect::ChromaticAberration { intensity: f32 }
```

**GradientStop struct:**
```rust
pub struct GradientStop {
    pub position: f32,  // 0.0 to 1.0
    pub color: Color,
}
```

**Gradient rendering:** Render the gradient to a same-size `RgbaImage`, then use it as a mask or overlay (configurable). Linear gradients rotate based on angle; radial gradients interpolate from center outward.

**Chromatic aberration:** Offset the R channel by `+intensity` pixels and the B channel by `-intensity` pixels horizontally, leaving G in place.

**Acceptance Criteria:**

- AC-1.4.A: Applying `Effect::Shadow { offset_x: 5.0, offset_y: 5.0, blur: 10.0, color: [0,0,0,128] }` to a white square -> A dark, blurred shadow appears offset 5px right and 5px down behind the square.
- AC-1.4.B: Applying a linear gradient at 0 degrees with stops at [0.0, red] and [1.0, blue] to a 100px wide layer -> The left edge is red, the right edge is blue, and the middle is a smooth interpolation.
- AC-1.4.C: Applying `Effect::Invert` to a pure red pixel (255,0,0) -> Result is cyan (0,255,255).
- AC-1.4.D: Applying `Effect::Grayscale` to a colored image -> All output pixels satisfy `r == g == b` (within rounding tolerance of 1).
- AC-1.4.E: Applying `Effect::Sepia { intensity: 1.0 }` to a grayscale image -> Output has a warm brownish tone; red channel > green channel > blue channel for non-black pixels.
- AC-1.4.F: Applying `Effect::ChromaticAberration { intensity: 3.0 }` -> The R and B channels are visibly offset from the G channel by 3 pixels in opposite directions.

**Acceptance Tests:**

- Test-1.4.A: Unit test -- Create a 50x50 white square on a 200x200 transparent background. Apply shadow with offset (10, 10), blur 5.0, color black. Assert: pixel at (60, 60) has alpha > 0 (shadow present). Assert: pixel at (25, 25) is white (original square). Assert: pixel at (0, 0) is transparent (no shadow).
- Test-1.4.B: Unit test -- Apply linear gradient 0 degrees, stops [(0.0, red), (1.0, blue)] to 100x10 image. Assert: pixel at (0, 5) red channel > 200. Assert: pixel at (99, 5) blue channel > 200. Assert: pixel at (50, 5) has both red and blue channels between 50 and 200.
- Test-1.4.C: Unit test -- `Effect::Invert.apply(&red_image)`. Assert: pixel at (0,0) == `[0, 255, 255, 255]`.
- Test-1.4.D: Unit test -- Create a 10x10 image with varied colors. Apply `Effect::Grayscale`. For each pixel, assert `abs(r - g) <= 1 && abs(g - b) <= 1`.
- Test-1.4.E: Unit test -- Create a 10x10 image with pixel (128,128,128,255). Apply `Effect::Sepia { intensity: 1.0 }`. Assert: output `r > g > b`.
- Test-1.4.F: Unit test -- Create a vertical white line (1px wide) on black background. Apply chromatic aberration intensity 3. Assert: a red line appears 3px to the right of center, and a blue line appears 3px to the left.

---

### Phase 2: Video Frame Support (Weeks 2-3)

**Purpose:** Enable the compositor to handle video content by integrating FFmpeg for native frame extraction, building an LRU frame cache for smooth playback, and implementing browser-side video frame capture via HTMLVideoElement and OffscreenCanvas. This phase transforms a static image compositor into a video-capable rendering engine.

---

#### 2.1 FFmpeg Integration

**skillLevel:** senior engineer

**Implementation Details:**

Create a new video source module for native builds that uses the `ffmpeg-next` crate (Rust bindings to FFmpeg) to decode video frames at arbitrary timestamps. This is for the server-side CLI and native benchmarks only -- it will be feature-gated behind `#[cfg(not(target_arch = "wasm32"))]`.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/video.rs` -- Video source abstraction with FFmpeg decoder

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/lib.rs` -- Add `#[cfg(not(target_arch = "wasm32"))] pub mod video;`
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/layer.rs` -- Add `LayerContent::Video { path: PathBuf, timestamp_ms: u64 }` variant
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/Cargo.toml` -- Add `ffmpeg-next = { version = "7.0", optional = true }` with feature flag `native-video`
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/Cargo.toml` -- Add `ffmpeg-next` to workspace dependencies

**VideoSource implementation:**
```rust
pub struct VideoSource {
    path: PathBuf,
    decoder: ffmpeg::codec::decoder::Video,
    input_ctx: ffmpeg::format::context::Input,
    stream_index: usize,
    fps: f64,
    duration_ms: u64,
    width: u32,
    height: u32,
}

impl VideoSource {
    pub fn open(path: &Path) -> Result<Self>;
    pub fn get_frame(&mut self, timestamp_ms: u64) -> Result<RgbaImage>;
    pub fn duration(&self) -> u64;
    pub fn fps(&self) -> f64;
}
```

- Open video file with `ffmpeg::format::input(path)`
- Find best video stream, create decoder from codec parameters
- Seek to timestamp using `input_ctx.seek(timestamp, ..)`
- Decode frames using `decoder.send_packet()` / `decoder.receive_frame()`
- Convert decoded `ffmpeg::frame::Video` to `RgbaImage` using `ffmpeg::software::scaling::Context` (SWS_BILINEAR)
- Support codecs: H.264, H.265/HEVC, VP9, AV1

**Acceptance Criteria:**

- AC-2.1.A: `VideoSource::open("test.mp4")` on a valid H.264 file -> Returns `Ok(source)` with correct `width`, `height`, `fps`, and `duration_ms`.
- AC-2.1.B: `source.get_frame(1000)` on a 30fps video -> Returns an `RgbaImage` representing the frame closest to the 1-second mark, with dimensions matching the video's native resolution.
- AC-2.1.C: `source.get_frame(0)` followed by `source.get_frame(duration_ms)` -> Both return valid frames (first frame and last frame).
- AC-2.1.D: Opening a VP9 WebM file -> Succeeds and returns frames with the correct codec handling.
- AC-2.1.E: Opening a nonexistent file -> Returns `Err` with a descriptive error message.

**Acceptance Tests:**

- Test-2.1.A: Integration test -- Use `ffmpeg` CLI to generate a 5-second 30fps 320x240 H.264 test video with known frame content (e.g., frame counter). Open with `VideoSource::open`. Assert: fps == 30.0, duration within 100ms of 5000ms, width == 320, height == 240.
- Test-2.1.B: Integration test -- Extract frame at t=1000ms from the test video. Assert: returned `RgbaImage` has correct dimensions. Assert: pixel values are non-zero (not a black frame, assuming the test video has content).
- Test-2.1.C: Integration test -- Extract frame at t=0 and t=duration. Assert: both succeed. Assert: the two frames have different pixel content (assuming the video is not a single static frame).
- Test-2.1.D: Integration test -- Generate a VP9 WebM test file. Open and extract a frame. Assert: succeeds without error.
- Test-2.1.E: Unit test -- `VideoSource::open("/nonexistent/path.mp4")`. Assert: returns `Err`.

---

#### 2.2 Frame Caching System

**skillLevel:** mid-level engineer

**Implementation Details:**

Build an LRU frame cache that sits between the compositor and the video source to avoid redundant frame decodes during timeline scrubbing and playback.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/cache.rs` -- LRU cache implementation with background prefetching

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/lib.rs` -- Add `pub mod cache;`
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/Cargo.toml` -- Add `lru = "0.12"` dependency

**Cache implementation:**
```rust
pub struct FrameCache {
    cache: lru::LruCache<CacheKey, Arc<RgbaImage>>,
    max_memory_bytes: usize,
    current_memory_bytes: usize,
}

#[derive(Hash, Eq, PartialEq)]
pub struct CacheKey {
    source_id: String,
    timestamp_ms: u64,
}

impl FrameCache {
    pub fn new(max_memory_bytes: usize) -> Self;
    pub fn get(&mut self, key: &CacheKey) -> Option<Arc<RgbaImage>>;
    pub fn insert(&mut self, key: CacheKey, frame: RgbaImage);
    pub fn memory_usage(&self) -> usize;
    pub fn clear(&mut self);
    pub fn evict_to_budget(&mut self);
}
```

- Default cache size: 512MB (configurable), enough for ~60 frames at 1080p
- LRU eviction when memory budget is exceeded
- Background prefetching: given a current timestamp and playback direction, prefetch the next N frames (configurable, default 10) in a background thread using `rayon::spawn`
- Thread-safe access via `Arc<Mutex<FrameCache>>` for the prefetching thread

**Acceptance Criteria:**

- AC-2.2.A: Inserting 100 frames into a cache with a 50-frame memory budget -> Cache size never exceeds 50 frames; oldest accessed frames are evicted.
- AC-2.2.B: Requesting the same frame twice -> Second request returns the cached `Arc<RgbaImage>` without re-decoding (cache hit).
- AC-2.2.C: `cache.memory_usage()` after inserting a 1920x1080 frame -> Reports approximately 8,294,400 bytes (1920 * 1080 * 4).
- AC-2.2.D: Prefetching frames 10-20 while displaying frame 10 -> Frames 11-20 are available in cache by the time the playhead reaches them.
- AC-2.2.E: `cache.clear()` -> Memory usage drops to 0 and all subsequent `get()` calls return `None`.

**Acceptance Tests:**

- Test-2.2.A: Unit test -- Create cache with max 50 * 8MB budget. Insert 100 unique 1920x1080 frames. Assert: `cache.len() <= 50`. Assert: most recently accessed 50 frames are still retrievable.
- Test-2.2.B: Unit test -- Insert frame with key ("video1", 1000). Call `get` twice. Assert: both return `Some`. Assert: the `Arc` reference count indicates shared ownership (no re-allocation).
- Test-2.2.C: Unit test -- Insert one 1920x1080 frame. Assert: `memory_usage()` is within 1% of 1920*1080*4.
- Test-2.2.D: Integration test -- Start prefetch for timestamps [1000, 1033, 1066, ...] (30fps intervals). Wait 500ms. Assert: at least 5 of the prefetched frames are in cache.
- Test-2.2.E: Unit test -- Insert 10 frames. Call `clear()`. Assert: `memory_usage() == 0`. Assert: `get` for any of the 10 keys returns `None`.

---

#### 2.3 Browser Video Integration

**skillLevel:** mid-level engineer

**Implementation Details:**

Implement video frame capture in the WASM module using HTMLVideoElement and OffscreenCanvas, plus URL-based image loading via the Fetch API. This is the browser-side equivalent of the native FFmpeg integration.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/wasm-preview/src/video.rs` -- Browser video frame capture

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/wasm-preview/src/lib.rs` -- Add `mod video;`, extend `WasmLayer` to include `video_element_id` and `image_url` fields, update `convert_layer` to handle "video" and "image" layer types (currently only "solidColor" at lines 211-227)
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/wasm-preview/Cargo.toml` -- Add `web-sys` features: `HtmlVideoElement`, `OffscreenCanvas`, `OffscreenCanvasRenderingContext2d`, `Blob`, `Response`, `Headers`

**Video frame capture approach:**
1. Receive an `HtmlVideoElement` reference via `web_sys::HtmlVideoElement`
2. Create an `OffscreenCanvas` at the video's natural dimensions
3. Call `offscreen_ctx.draw_image_with_html_video_element(video_el, 0.0, 0.0)`
4. Read pixel data via `offscreen_ctx.get_image_data(0, 0, width, height)`
5. Convert to compositor `Frame` format

**URL image loading approach:**
1. Use `web_sys::window().fetch_with_str(url)` to fetch the image
2. Convert response to `Blob`, then to `ImageBitmap`
3. Draw to OffscreenCanvas and extract pixel data
4. Cache the loaded image by URL in a `HashMap<String, RgbaImage>`

**Acceptance Criteria:**

- AC-2.3.A: Passing a `WasmLayer` with type "video" and a valid `video_element_id` -> The compositor captures the current frame from the referenced `<video>` element and composites it at the specified transform.
- AC-2.3.B: Passing a `WasmLayer` with type "image" and a `url` field -> The compositor loads the image from the URL, caches it, and composites it.
- AC-2.3.C: Loading the same image URL twice -> The second load returns the cached version (no network request).
- AC-2.3.D: Passing a video element ID that does not exist in the DOM -> Returns a descriptive error via `JsValue`, does not panic.

**Acceptance Tests:**

- Test-2.3.A: Browser integration test (wasm-pack test) -- Create a `<video>` element with a known test video, seek to t=1s. Pass layer JSON with type "video" referencing the element. Assert: `render_frame` succeeds without error. Assert: rendered canvas is not all black (has video content).
- Test-2.3.B: Browser integration test -- Serve a test PNG image via a local test server. Pass layer JSON with type "image" and the URL. Assert: `render_frame` succeeds. Assert: canvas contains pixels from the image.
- Test-2.3.C: Browser integration test -- Load the same image URL twice via two render calls. Use browser Performance API to verify the second call does not trigger a network fetch.
- Test-2.3.D: Browser integration test -- Pass layer JSON with `video_element_id: "nonexistent"`. Assert: `render_frame` returns a `JsValue` error (not a panic).

---

### Phase 3: Animation & Keyframes (Weeks 3-4)

**Purpose:** Build a keyframe-based animation system that interpolates layer properties over time, enabling smooth animated transitions for all transform and effect parameters. This transforms the compositor from a static frame renderer into a time-aware animation engine suitable for video editing.

---

#### 3.1 Keyframe Data Structure & Interpolation Engine

**skillLevel:** senior engineer

**Implementation Details:**

Create the foundational keyframe system with time-value pairs, multiple easing functions, and a generic interpolation engine.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/keyframe.rs` -- Keyframe system with interpolation

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/lib.rs` -- Add `pub mod keyframe;` and public exports
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/Cargo.toml` -- Add `ezing = "0.1"` for easing functions

**Core data structures:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Keyframe<T: Interpolate> {
    pub time_ms: f64,
    pub value: T,
    pub easing: EasingFunction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EasingFunction {
    Linear,
    EaseIn,
    EaseOut,
    EaseInOut,
    CubicBezier(f32, f32, f32, f32),
    Steps(u32, StepPosition),
    Hold,  // No interpolation, hold previous value
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StepPosition { Start, End }

pub trait Interpolate: Clone {
    fn lerp(a: &Self, b: &Self, t: f32) -> Self;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimatedProperty<T: Interpolate> {
    keyframes: Vec<Keyframe<T>>,
}

impl<T: Interpolate> AnimatedProperty<T> {
    pub fn value_at(&self, time_ms: f64) -> T;
    pub fn is_static(&self) -> bool;  // true if 0 or 1 keyframes
    pub fn add_keyframe(&mut self, keyframe: Keyframe<T>);
}
```

**Interpolation logic:**
1. Find the two keyframes bracketing the current time
2. Calculate normalized progress `t = (time - k1.time) / (k2.time - k1.time)`
3. Apply easing function to `t` (using `ezing` crate for standard curves, manual implementation for `CubicBezier`)
4. Call `T::lerp(k1.value, k2.value, eased_t)`
5. Before first keyframe: return first keyframe value. After last: return last keyframe value.

**Implement `Interpolate` for:**
- `f32` (scalar lerp)
- `Point` (component-wise lerp)
- `Color` (component-wise lerp in 0-255 space)

**CubicBezier implementation:** Use De Casteljau's algorithm or Newton-Raphson iteration to evaluate the bezier curve `B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3` where P0=(0,0), P3=(1,1), and P1=(x1,y1), P2=(x2,y2) are the control points.

**Acceptance Criteria:**

- AC-3.1.A: An `AnimatedProperty<f32>` with keyframes at t=0 (value=0.0) and t=1000 (value=100.0) with Linear easing -> `value_at(500.0)` returns `50.0`.
- AC-3.1.B: EaseInOut easing between 0.0 and 1.0 -> `value_at(midpoint)` returns approximately 0.5, but values near the start are closer to 0 than linear, and values near the end are closer to 1 than linear.
- AC-3.1.C: `CubicBezier(0.25, 0.1, 0.25, 1.0)` (CSS ease) -> Produces a smooth curve that starts slow, speeds up, and ends at exactly the target value.
- AC-3.1.D: `Steps(4, End)` easing -> Value jumps in 4 discrete steps, with each step occurring at 25% intervals.
- AC-3.1.E: `Hold` easing -> Value stays at the first keyframe's value until the next keyframe's time, then jumps instantly.
- AC-3.1.F: Querying `value_at` before the first keyframe -> Returns the first keyframe's value. After the last keyframe -> Returns the last keyframe's value.

**Acceptance Tests:**

- Test-3.1.A: Unit test -- Create `AnimatedProperty<f32>` with keyframes [(0, 0.0, Linear), (1000, 100.0, Linear)]. Assert: `value_at(0.0) == 0.0`, `value_at(500.0) == 50.0`, `value_at(1000.0) == 100.0`.
- Test-3.1.B: Unit test -- Create with EaseInOut. Assert: `value_at(250) < 25.0` (slower start). Assert: `value_at(750) > 75.0` (faster middle). Assert: `abs(value_at(500) - 50.0) < 2.0`.
- Test-3.1.C: Unit test -- Create with CubicBezier(0.25, 0.1, 0.25, 1.0). Assert: `value_at(0.0) == 0.0`. Assert: `value_at(1000.0) == 100.0`. Assert: the curve is monotonically increasing (sample at 10 evenly spaced points).
- Test-3.1.D: Unit test -- Create with Steps(4, End). Assert: `value_at(0) == 0.0`. Assert: `value_at(249) == 0.0`. Assert: `value_at(250) == 25.0`. Assert: `value_at(999) == 75.0`. Assert: `value_at(1000) == 100.0`.
- Test-3.1.E: Unit test -- Create with Hold. Assert: `value_at(0) == 0.0`. Assert: `value_at(999) == 0.0`. Assert: `value_at(1000) == 100.0`.
- Test-3.1.F: Unit test -- Create with keyframes at t=500 and t=1000. Assert: `value_at(0) == value_at(500)` (before first). Assert: `value_at(2000) == value_at(1000)` (after last).

---

#### 3.2 Property Animation Support

**skillLevel:** mid-level engineer

**Implementation Details:**

Create an `AnimatedLayer` struct that wraps a `Layer` with animated properties, enabling per-frame interpolation of all transform and effect parameters.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/animated.rs` -- AnimatedLayer with property animation

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/lib.rs` -- Add `pub mod animated;`
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/compositor.rs` -- Add `compose_at_time(&self, layers: &[AnimatedLayer], time_ms: f64)` method

**AnimatedLayer struct:**
```rust
pub struct AnimatedLayer {
    pub base: Layer,
    pub animated_transform: AnimatedTransform,
    pub animated_effects: Vec<AnimatedEffect>,
}

pub struct AnimatedTransform {
    pub position_x: AnimatedProperty<f32>,
    pub position_y: AnimatedProperty<f32>,
    pub scale_x: AnimatedProperty<f32>,
    pub scale_y: AnimatedProperty<f32>,
    pub rotation: AnimatedProperty<f32>,
    pub opacity: AnimatedProperty<f32>,
    pub anchor_x: AnimatedProperty<f32>,
    pub anchor_y: AnimatedProperty<f32>,
}

impl AnimatedTransform {
    pub fn resolve_at(&self, time_ms: f64) -> Transform;
    pub fn is_static(&self) -> bool;
}
```

**Animatable transform properties:** position (x, y), scale (x, y), rotation, opacity, anchor point (x, y), skew (x, y)

**Animatable effect properties:** blur radius, shadow offset_x, shadow offset_y, shadow blur, brightness, contrast, saturation, hue rotation

**`compose_at_time` method:** For each `AnimatedLayer`, call `animated_transform.resolve_at(time_ms)` to get the concrete `Transform` for that frame, resolve animated effects, then delegate to the existing `compose` method with the resolved static layers.

**Acceptance Criteria:**

- AC-3.2.A: An `AnimatedLayer` with position animated from (0,0) at t=0 to (100,0) at t=1000 -> Composing at t=500 places the layer at approximately (50, 0).
- AC-3.2.B: An `AnimatedLayer` with opacity animated from 1.0 at t=0 to 0.0 at t=1000 -> Composing at t=500 renders the layer at approximately 50% opacity.
- AC-3.2.C: An `AnimatedLayer` with static transform (no keyframes) -> `is_static()` returns `true` and `resolve_at` returns the base transform for any time value.
- AC-3.2.D: An `AnimatedLayer` with animated blur radius from 0 to 20 -> Composing at t=500 applies a blur radius of approximately 10.

**Acceptance Tests:**

- Test-3.2.A: Unit test -- Create `AnimatedLayer` with position_x keyframes [(0, 0.0), (1000, 100.0)]. Compose at t=500 on a 200x200 canvas. Assert: the layer's center pixel is at approximately x=50.
- Test-3.2.B: Unit test -- Create `AnimatedLayer` with opacity keyframes [(0, 1.0), (1000, 0.0)]. Compose at t=500. Assert: the layer's pixel alpha values are approximately 128 (50% of 255).
- Test-3.2.C: Unit test -- Create `AnimatedLayer` with no keyframes (empty `AnimatedTransform`). Assert: `is_static() == true`. Assert: `resolve_at(0) == resolve_at(999999)`.
- Test-3.2.D: Unit test -- Create `AnimatedLayer` with blur animated from 0 to 20 over 1000ms. Compose at t=500. Compare edge sharpness to a layer with static blur=10. Assert: results are visually equivalent (pixel difference < 5 per channel).

---

#### 3.3 Timeline Integration

**skillLevel:** mid-level engineer

**Implementation Details:**

Create the mapping layer that converts `EditorAction` objects (from `@stoked-ui/timeline`) into compositor `AnimatedLayer` objects, handling action timing (start/end), enable/disable state, and per-action keyframes.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/timeline.rs` -- Timeline-to-compositor mapping (native)
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/WasmPreview/actionMapper.ts` -- TypeScript action-to-layer mapper for WASM

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/lib.rs` -- Add `pub mod timeline;`

**ActionMapper implementation (TypeScript side):**
```typescript
export class ActionMapper {
    static actionToWasmLayer(action: IEditorAction, track: IEditorTrack, currentTime: number): WasmLayer | null;
    static resolveKeyframes(action: IEditorAction, time: number): WasmTransform;
    static isActionActive(action: IEditorAction, time: number): boolean;
}
```

- Map `action.start` and `action.end` to layer visibility (only include in composition when `start <= time <= end`)
- Convert action properties (`x`, `y`, `width`, `height`, `fit`, `blendMode`) to `WasmTransform` and layer config
- Handle `action.disabled` by excluding from the layer list
- Support action-level keyframe data (stored in action metadata or a dedicated keyframe property)

**Timeline struct (Rust side for CLI export):**
```rust
pub struct Timeline {
    pub duration_ms: f64,
    pub fps: f64,
    pub width: u32,
    pub height: u32,
    pub layers: Vec<TimelineLayer>,
}

pub struct TimelineLayer {
    pub animated_layer: AnimatedLayer,
    pub start_ms: f64,
    pub end_ms: f64,
}

impl Timeline {
    pub fn frame_count(&self) -> u64;
    pub fn frame_at(&self, frame_index: u64) -> f64;  // returns time_ms
    pub fn active_layers_at(&self, time_ms: f64) -> Vec<&AnimatedLayer>;
}
```

**Acceptance Criteria:**

- AC-3.3.A: An action with `start=1000, end=5000` -> `isActionActive(action, 500)` returns `false`, `isActionActive(action, 3000)` returns `true`.
- AC-3.3.B: A disabled action -> `actionToWasmLayer` returns `null` regardless of time.
- AC-3.3.C: A video track action with `fit="cover"` and `blendMode="multiply"` -> The generated `WasmLayer` has correct scale values for cover fit and `blend_mode: "multiply"`.
- AC-3.3.D: `Timeline.active_layers_at(3000)` with layers spanning [0-5000] and [4000-8000] -> Returns only the first layer.

**Acceptance Tests:**

- Test-3.3.A: Unit test (TS) -- Create an action with start=1000, end=5000. Assert: `ActionMapper.isActionActive(action, 500) === false`. Assert: `ActionMapper.isActionActive(action, 3000) === true`. Assert: `ActionMapper.isActionActive(action, 5001) === false`.
- Test-3.3.B: Unit test (TS) -- Create a disabled action. Assert: `ActionMapper.actionToWasmLayer(action, track, anyTime) === null`.
- Test-3.3.C: Unit test (TS) -- Create an action with fit="cover", blendMode="multiply", width=1920, height=1080 on a 1920x1080 render. Assert: generated layer has `blend_mode === "multiply"`. Assert: transform scale produces cover behavior.
- Test-3.3.D: Unit test (Rust) -- Create `Timeline` with two `TimelineLayer`s: [0-5000] and [4000-8000]. Assert: `active_layers_at(3000).len() == 1`. Assert: `active_layers_at(4500).len() == 2`.

---

### Phase 4: WASM Build & Integration (Weeks 4-5)

**Purpose:** Establish the complete WASM build pipeline from Rust source to npm package, replace the mock WASM module in the React hook with the real compiled WASM, and implement proper frame scheduling with memory management. This phase delivers a working `@stoked-ui/video-renderer-wasm` npm package.

---

#### 4.1 WASM Build Pipeline

**skillLevel:** engineer

**Implementation Details:**

Set up the wasm-pack build configuration, create monorepo build scripts, and configure the npm package for the WASM output.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/scripts/build-wasm.sh` -- Build script for WASM compilation
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/pkg/package.json` -- npm package configuration for WASM distribution

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/wasm-preview/Cargo.toml` -- Ensure `crate-type = ["cdylib"]` and optimize for size
- `/Users/stoked/work/stoked-ui/package.json` -- Add `build:wasm` script to root monorepo scripts

**Build script (`build-wasm.sh`):**
```bash
#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../wasm-preview"
wasm-pack build --target web --out-dir ../pkg --release
# Optimize WASM binary size
wasm-opt -O3 ../pkg/sui_video_renderer_bg.wasm -o ../pkg/sui_video_renderer_bg.wasm
echo "WASM build complete. Output in pkg/"
ls -lh ../pkg/*.wasm
```

**wasm-preview/Cargo.toml additions:**
```toml
[lib]
crate-type = ["cdylib", "rlib"]

[profile.release]
opt-level = "s"       # Optimize for size
lto = true
```

**npm package (`pkg/package.json`):**
```json
{
  "name": "@stoked-ui/video-renderer-wasm",
  "version": "0.1.0",
  "files": ["*.js", "*.wasm", "*.d.ts"],
  "main": "sui_video_renderer.js",
  "types": "sui_video_renderer.d.ts",
  "sideEffects": ["*.wasm"],
  "module": "sui_video_renderer.js"
}
```

**Acceptance Criteria:**

- AC-4.1.A: Running `./scripts/build-wasm.sh` -> Produces `pkg/sui_video_renderer_bg.wasm`, `pkg/sui_video_renderer.js`, and `pkg/sui_video_renderer.d.ts` without errors.
- AC-4.1.B: The `.wasm` file size -> Under 500KB uncompressed, under 100KB gzipped.
- AC-4.1.C: The generated `sui_video_renderer.d.ts` -> Contains TypeScript type definitions for `PreviewRenderer`, `Color`, and `benchmark_composition`.
- AC-4.1.D: `import init, { PreviewRenderer } from '@stoked-ui/video-renderer-wasm'` in a bundler (webpack/vite) -> Resolves and compiles without errors.

**Acceptance Tests:**

- Test-4.1.A: CI test -- Run `build-wasm.sh`. Assert: exit code 0. Assert: all three output files exist in `pkg/`.
- Test-4.1.B: CI test -- After build, check `wc -c pkg/sui_video_renderer_bg.wasm`. Assert: < 500000 bytes. Check `gzip -c pkg/sui_video_renderer_bg.wasm | wc -c`. Assert: < 100000 bytes.
- Test-4.1.C: CI test -- Parse `pkg/sui_video_renderer.d.ts`. Assert: contains `export class PreviewRenderer`. Assert: contains `export function benchmark_composition`.
- Test-4.1.D: Integration test -- Create a minimal Vite project that imports from `@stoked-ui/video-renderer-wasm`. Run `vite build`. Assert: build succeeds.

---

#### 4.2 TypeScript Bindings

**skillLevel:** engineer

**Implementation Details:**

Create complete TypeScript type definitions that match the WASM bindings and replace the mock module in the existing React integration.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/WasmPreview/types.ts` -- Comprehensive type definitions for the WASM renderer API

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/WasmPreview/useWasmRenderer.ts` -- Replace mock module (lines 89-99) with real WASM import

**Expanded type definitions:**
```typescript
export interface CompositorLayer {
    id: string;
    type: 'video' | 'image' | 'solid' | 'text';
    content: LayerContent;
    transform: LayerTransform;
    effects: LayerEffect[];
    blendMode: BlendMode;
    visible: boolean;
    zIndex: number;
    keyframes?: LayerKeyframes;
}

export interface LayerTransform {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    anchorX: number;
    anchorY: number;
    opacity: number;
    skewX: number;
    skewY: number;
}

export type BlendMode =
    | 'normal' | 'multiply' | 'screen' | 'overlay'
    | 'add' | 'subtract' | 'lighten' | 'darken'
    | 'softLight' | 'hardLight' | 'colorDodge' | 'colorBurn'
    | 'difference' | 'exclusion'
    | 'hue' | 'saturation' | 'color' | 'luminosity';

export interface LayerKeyframes {
    positionX?: Keyframe<number>[];
    positionY?: Keyframe<number>[];
    scaleX?: Keyframe<number>[];
    scaleY?: Keyframe<number>[];
    rotation?: Keyframe<number>[];
    opacity?: Keyframe<number>[];
}

export interface Keyframe<T> {
    timeMs: number;
    value: T;
    easing: EasingType;
}
```

**Acceptance Criteria:**

- AC-4.2.A: The `types.ts` file exports all types needed for the WASM renderer API -> `CompositorLayer`, `LayerTransform`, `BlendMode`, `LayerKeyframes`, `Keyframe`, `EasingType` are all importable.
- AC-4.2.B: All 18 blend modes are represented in the `BlendMode` type union -> TypeScript compiler errors if an invalid blend mode string is passed.
- AC-4.2.C: The generated WASM `.d.ts` types and the manually written `types.ts` are structurally compatible -> No type errors when mapping between them.

**Acceptance Tests:**

- Test-4.2.A: TypeScript compilation test -- Import all types from `types.ts`. Assert: no TypeScript errors. Assert: all exported types are accessible.
- Test-4.2.B: TypeScript compilation test -- Attempt to assign `"invalid"` to a `BlendMode` typed variable. Assert: TypeScript compiler error.
- Test-4.2.C: TypeScript compilation test -- Create a `CompositorLayer` object, convert it to the `WasmLayer` format expected by `PreviewRenderer.render_frame`. Assert: no type errors in the conversion.

---

#### 4.3 React Hook Updates

**skillLevel:** mid-level engineer

**Implementation Details:**

Replace the `MockPreviewRenderer` in `useWasmRenderer.ts` (lines 89-99) with the real WASM module, add `requestAnimationFrame` render loop with time sync, and implement proper memory management.

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/WasmPreview/useWasmRenderer.ts` -- Complete rewrite of the WASM loading section

**Key changes:**

1. **Replace mock with real import (lines 82-113):**
```typescript
async function loadWasm() {
    const wasmModule = await import('@stoked-ui/video-renderer-wasm');
    await wasmModule.default();  // Initialize WASM
    if (canvasRef.current) {
        const renderer = new wasmModule.PreviewRenderer(canvasRef.current, width, height);
        rendererRef.current = renderer;
    }
}
```

2. **Add render loop with frame scheduling:**
```typescript
const startRenderLoop = useCallback((getLayers: () => WasmLayer[], getTime: () => number) => {
    let rafId: number;
    const loop = () => {
        const layers = getLayers();
        const time = getTime();
        renderFrame(layers);
        rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
}, [renderFrame]);
```

3. **Memory management on unmount:**
```typescript
return () => {
    cancelled = true;
    if (renderLoopCleanup.current) renderLoopCleanup.current();
    if (rendererRef.current) {
        rendererRef.current.free();  // Calls wasm_bindgen destructor
        rendererRef.current = null;
    }
};
```

4. **Frame dropping:** If the previous frame is still rendering when the next `requestAnimationFrame` fires, skip the frame to maintain responsiveness.

5. **Memory budget:** Monitor WASM memory usage via `WebAssembly.Memory.buffer.byteLength` and trigger cache eviction when approaching the budget (200MB default).

**Acceptance Criteria:**

- AC-4.3.A: Loading the WASM module -> `isLoading` transitions from `true` to `false`, and `rendererRef.current` is a real `PreviewRenderer` instance (not mock).
- AC-4.3.B: Calling `renderFrame` with layers -> The canvas shows rendered content (not blank), and `metrics.lastFrameTime` is populated with a real timing value.
- AC-4.3.C: Unmounting the component -> `rendererRef.current.free()` is called, and no WASM memory leaks are detected.
- AC-4.3.D: If WASM fails to load -> `error` state is set with a descriptive message, and the component can fall back to Canvas rendering.
- AC-4.3.E: The render loop drops frames when composition takes > 16ms -> FPS counter never shows more than 60, and the UI remains responsive.

**Acceptance Tests:**

- Test-4.3.A: Integration test (React Testing Library) -- Render a component using `useWasmRenderer`. Wait for `isLoading === false`. Assert: `rendererRef.current` is not null. Assert: `rendererRef.current.get_metrics()` returns valid JSON.
- Test-4.3.B: Integration test -- After WASM loads, call `renderFrame` with a solid color layer. Read canvas pixels via `ctx.getImageData`. Assert: pixels match the expected solid color.
- Test-4.3.C: Integration test -- Mount and unmount the component. Assert: `free()` was called on the renderer. Assert: no "detached ArrayBuffer" errors in console.
- Test-4.3.D: Integration test -- Mock WASM import to throw. Assert: `error` state is set. Assert: `isLoading` is false.
- Test-4.3.E: Performance test -- Render 1000 frames in a tight loop with artificial 20ms composition time. Assert: average FPS does not exceed 60. Assert: no frames are visually corrupted.

---

### Phase 5: EditorEngine Integration (Weeks 5-6)

**Purpose:** Integrate the WASM compositor into the existing `EditorEngine` render pipeline by creating a `CompositorController`, modifying the engine to support dual rendering modes (WASM and Canvas), and mapping editor track types to compositor layer types. This phase connects the rendering engine to the editing UI.

---

#### 5.1 CompositorController

**skillLevel:** senior engineer

**Implementation Details:**

Create a new controller implementing the `IController` interface (defined in `/Users/stoked/work/stoked-ui/packages/sui-timeline/src/Controller/Controller.types.ts`) that manages compositor layers through the enter/update/leave lifecycle.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/Controllers/CompositorController.ts` -- IController implementation for WASM compositor

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/Controllers/Controllers.ts` -- Register CompositorController (conditionally, when WASM is enabled)
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/Controllers/index.ts` -- Export CompositorController

**The `IController` interface requires (from `Controller.types.ts:6-21`):**
- `start(params)`, `stop(params)`, `enter(params)`, `leave(params)`, `update(params)`
- `preload(params): Promise<ITimelineAction>`
- `getItem(params): any`
- `id: string`, `logging: boolean`, `color?: string`

**CompositorController implementation:**
```typescript
export class CompositorController implements IController {
    id = 'compositor';
    logging = false;
    color = '#4a90d9';
    private renderer: PreviewRendererInstance | null = null;
    private activeLayers: Map<string, WasmLayer> = new Map();

    setRenderer(renderer: PreviewRendererInstance) {
        this.renderer = renderer;
    }

    enter(params: ControllerParams) {
        const layer = ActionMapper.actionToWasmLayer(params.action, params.track, params.time);
        if (layer) {
            this.activeLayers.set(params.action.id, layer);
            this.renderComposite();
        }
    }

    update(params: ControllerParams) {
        const layer = this.activeLayers.get(params.action.id);
        if (layer) {
            const updatedLayer = ActionMapper.updateLayerAtTime(layer, params.action, params.time);
            this.activeLayers.set(params.action.id, updatedLayer);
            this.renderComposite();
        }
    }

    leave(params: ControllerParams) {
        this.activeLayers.delete(params.action.id);
        this.renderComposite();
    }

    private renderComposite() {
        if (!this.renderer) return;
        const layers = Array.from(this.activeLayers.values())
            .sort((a, b) => a.z_index - b.z_index);
        this.renderer.render_frame(JSON.stringify(layers));
    }
}
```

**Integration with existing controllers:** The `CompositorController` wraps the existing controller pattern. When WASM is enabled, instead of each controller calling `engine.renderCtx.drawImage()` directly (as `VideoController.draw()` does at `VideoController.ts:200`), the compositor controller aggregates all layers and renders them in a single WASM composition pass.

**Acceptance Criteria:**

- AC-5.1.A: Calling `enter` with a video action -> The action is converted to a `WasmLayer` and added to the active layers map, and `renderComposite` is called.
- AC-5.1.B: Calling `update` at different times -> The layer's transform is updated based on time-interpolated keyframes, and the composite is re-rendered.
- AC-5.1.C: Calling `leave` -> The layer is removed from active layers and the composite is re-rendered without it.
- AC-5.1.D: Multiple simultaneous active layers with different z-indices -> Layers are composited in z-index order (lowest first).
- AC-5.1.E: `setRenderer(null)` followed by `enter` -> No crash; `renderComposite` is a no-op when renderer is null.

**Acceptance Tests:**

- Test-5.1.A: Unit test -- Create `CompositorController` with a mock renderer. Call `enter` with a video action. Assert: `activeLayers.size === 1`. Assert: mock renderer's `render_frame` was called once.
- Test-5.1.B: Unit test -- Add a layer via `enter`, then call `update` at a different time. Assert: the layer's transform values differ from the initial values. Assert: `render_frame` was called again.
- Test-5.1.C: Unit test -- Add a layer via `enter`, then call `leave`. Assert: `activeLayers.size === 0`. Assert: `render_frame` was called with an empty layer array.
- Test-5.1.D: Unit test -- Add 3 layers with z-indices 2, 0, 1. Assert: the JSON passed to `render_frame` has layers sorted [0, 1, 2].
- Test-5.1.E: Unit test -- Create controller without calling `setRenderer`. Call `enter`. Assert: no error thrown.

---

#### 5.2 EditorEngine Modifications

**skillLevel:** senior engineer

**Implementation Details:**

Modify `EditorEngine` (at `/Users/stoked/work/stoked-ui/packages/sui-editor/src/EditorEngine/EditorEngine.ts`) to support an optional WASM renderer mode alongside the existing Canvas rendering.

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/EditorEngine/EditorEngine.ts` -- Add WASM renderer option, compositor render loop, fallback logic
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/EditorEngine/EditorEngine.types.ts` -- Add `WasmRendererConfig` and `useWasmRenderer` to interfaces

**EditorEngine changes:**
1. Add `useWasmRenderer?: boolean` and `wasmRendererConfig?: WasmRendererConfig` to constructor params
2. Add `_compositorController: CompositorController | null` field
3. In `setTime` (line 358), when WASM is enabled, delegate to compositor controller's batch render instead of per-controller canvas draws
4. In `_dealEnter` (line 389), when WASM is enabled, route through CompositorController

**WasmRendererConfig interface:**
```typescript
export interface WasmRendererConfig {
    enabled: boolean;
    maxMemoryMB?: number;       // Default 200
    fallbackToCanvas?: boolean; // Default true
    debugMode?: boolean;        // Show FPS overlay, memory usage
}
```

**Fallback logic:**
```typescript
private async initRenderer() {
    if (this._wasmConfig?.enabled) {
        try {
            const wasm = await import('@stoked-ui/video-renderer-wasm');
            await wasm.default();
            // ... init PreviewRenderer
            this._useWasm = true;
        } catch (err) {
            console.warn('WASM renderer unavailable, falling back to Canvas:', err);
            if (this._wasmConfig.fallbackToCanvas !== false) {
                this._useWasm = false;
            }
        }
    }
}
```

**Acceptance Criteria:**

- AC-5.2.A: Setting `useWasmRenderer: true` in EditorEngine options -> The engine initializes the WASM renderer and uses the CompositorController for rendering.
- AC-5.2.B: Setting `useWasmRenderer: true` when WASM is unavailable (e.g., old browser) -> The engine falls back to Canvas rendering with a console warning.
- AC-5.2.C: Calling `setTime` in WASM mode -> The compositor re-renders the frame at the new time, updating all animated layer properties.
- AC-5.2.D: Playing a timeline with WASM enabled -> The preview updates at 60 FPS via the requestAnimationFrame loop.
- AC-5.2.E: All existing Canvas-based features continue to work when WASM is disabled -> No regressions in the default rendering path.

**Acceptance Tests:**

- Test-5.2.A: Integration test -- Create `EditorEngine` with `useWasmRenderer: true`. Assert: `_compositorController` is not null. Assert: `_useWasm` is true.
- Test-5.2.B: Integration test -- Create `EditorEngine` with `useWasmRenderer: true` but mock WASM import to fail. Assert: `_useWasm` is false. Assert: console.warn was called with "WASM renderer unavailable".
- Test-5.2.C: Integration test -- Set up a timeline with actions. Call `setTime(500)`. Assert: the CompositorController's `update` was called for each active action.
- Test-5.2.D: Performance test -- Play a 5-second timeline with 3 layers. Measure FPS. Assert: average FPS >= 50 (allowing some slack for test environment).
- Test-5.2.E: Regression test -- Run the existing editor test suite with `useWasmRenderer: false`. Assert: all existing tests pass without modification.

---

#### 5.3 Track Type Mapping

**skillLevel:** engineer

**Implementation Details:**

Implement the mapping from editor track types to compositor layer types, handling the visual representation of each track type.

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/WasmPreview/actionMapper.ts` (created in Phase 3.3) -- Add track-type-specific mapping logic

**Track type to layer type mapping:**

| Editor Track Type | Compositor Layer Type | Visual Handling |
|---|---|---|
| `video` | `VideoLayer` | Capture frame from HTMLVideoElement via OffscreenCanvas, pass as ImageData |
| `image` | `ImageLayer` | Load from URL or file reference, cache in WASM |
| `text` | `TextLayer` | Pass text properties to WASM text renderer |
| `audio` | No visual layer | Skip compositor; audio handled by Howler.js (existing) |
| `effect` | `EffectLayer` | Apply as effects on the composition output |

**Per-type mapping details:**
- **Video tracks:** Use the existing `VideoController`'s `getItem` pattern to get the `HTMLVideoElement`, but instead of drawing to canvas via `drawImage`, pass the element reference to WASM for frame capture via the mechanism built in Phase 2.3.
- **Image tracks:** Convert the track's `file.url` to a layer with `type: "image"` and the URL.
- **Text tracks:** Extract text content and styling from action properties, map to `type: "text"` with font parameters.

**Acceptance Criteria:**

- AC-5.3.A: A video track action -> Generates a `WasmLayer` with `type: "video"` and a reference to the video element.
- AC-5.3.B: An image track action -> Generates a `WasmLayer` with `type: "image"` and the source URL.
- AC-5.3.C: A text track action -> Generates a `WasmLayer` with `type: "text"` and all text styling properties.
- AC-5.3.D: An audio track action -> Returns `null` (no visual layer generated).
- AC-5.3.E: An action with `fit: "cover"` -> The generated layer transform correctly scales the content to cover the render dimensions while preserving aspect ratio.

**Acceptance Tests:**

- Test-5.3.A: Unit test -- Create a video track action with source element ID. Call `actionToWasmLayer`. Assert: `result.type === "video"`. Assert: `result.video_element_id` matches the source ID.
- Test-5.3.B: Unit test -- Create an image track action with URL "https://example.com/img.png". Assert: `result.type === "image"`. Assert: `result.url === "https://example.com/img.png"`.
- Test-5.3.C: Unit test -- Create a text track action with text "Hello", fontSize 24, color white. Assert: `result.type === "text"`. Assert: `result.text === "Hello"`. Assert: `result.font_size === 24`.
- Test-5.3.D: Unit test -- Create an audio track action. Assert: `actionToWasmLayer(action, track, time) === null`.
- Test-5.3.E: Unit test -- Create a video action with width=3840, height=2160, fit="cover" on a 1920x1080 render. Assert: the generated transform's scale values produce a 1920x1080 output that covers the frame (no letterboxing).

---

### Phase 6: Performance Optimization (Weeks 6-7)

**Purpose:** Optimize the rendering pipeline for production performance targets by implementing parallel composition, memory pooling, intelligent caching, and establishing a benchmark suite for regression detection. This phase ensures the renderer meets the 60 FPS / 16ms frame budget consistently.

---

#### 6.1 Parallel Rendering & Memory

**skillLevel:** senior engineer

**Implementation Details:**

Optimize the compositor's hot path for performance. Currently `blend_image_at` in `compositor.rs:188-224` iterates pixels sequentially. This phase adds rayon parallelism (native only), frame buffer pooling, and texture atlasing.

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/compositor.rs` -- Add parallel pixel processing, buffer pool, tile-based rendering

**Parallel composition (native only, gated behind `#[cfg(not(target_arch = "wasm32"))]`):**
- Replace the sequential pixel loop in `blend_image_at` with `rayon::par_chunks_mut` for row-parallel blending
- Tile-based rendering: divide the output frame into tiles (e.g., 256x256), process tiles in parallel, each tile only composites layers that intersect it

**Frame buffer pooling:**
```rust
pub struct BufferPool {
    buffers: Vec<RgbaImage>,
    width: u32,
    height: u32,
}

impl BufferPool {
    pub fn acquire(&mut self) -> RgbaImage;  // Returns a buffer or allocates new
    pub fn release(&mut self, buffer: RgbaImage);  // Returns buffer to pool
}
```
- Eliminate per-frame allocation of `RgbaImage` in the render loop
- Pre-allocate a pool of 4-8 buffers matching output dimensions
- The `compose` method acquires from pool, renders, and the caller releases after use

**Texture atlasing:**
- Combine small images (< 256x256) into a single atlas texture
- Reduce the number of individual layer compositions for UIs with many small icons/thumbnails

**Acceptance Criteria:**

- AC-6.1.A: Composing 10 layers at 1080p with rayon enabled -> Frame time is at least 2x faster than single-threaded on a 4-core machine.
- AC-6.1.B: Buffer pool with 4 pre-allocated buffers -> No heap allocations during a 1000-frame render loop (measured via custom allocator or allocation counter).
- AC-6.1.C: Compositing 20 small (64x64) layers -> Texture atlasing reduces the effective layer count for blending operations.
- AC-6.1.D: Tile-based rendering of a scene where only 2 of 10 layers overlap the top-left quadrant -> The top-left tile only processes 2 layers, not all 10.

**Acceptance Tests:**

- Test-6.1.A: Benchmark test -- Run `bench_complex_composition` with and without rayon. Assert: parallel version is >= 1.5x faster on CI machine (4+ cores).
- Test-6.1.B: Unit test -- Create `BufferPool` with capacity 4. Call `acquire` 4 times, then `release` all 4, then `acquire` 4 more. Assert: no new allocations on the second acquire cycle (buffer addresses match).
- Test-6.1.C: Unit test -- Create 20 layers of 64x64 images. With atlasing, assert: internal atlas contains all 20 images in a single texture. Assert: composition time is less than compositing 20 individual layers.
- Test-6.1.D: Unit test -- Create 10 layers, only 2 overlap tile (0,0)-(256,256). Render with tile-based approach. Assert: tile (0,0) processes exactly 2 layers.

---

#### 6.2 Caching Strategy

**skillLevel:** mid-level engineer

**Implementation Details:**

Implement multi-level caching to avoid redundant computation during timeline scrubbing and playback.

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/src/cache.rs` (created in Phase 2.2) -- Add composed frame cache and resolution scaling

**Composed frame cache:**
- Cache the fully composed output frame keyed by a hash of all layer states (transform, effects, content)
- Invalidate when any layer property changes
- Useful for scrubbing back to previously viewed frames

**Decoded media cache:**
- Already built in Phase 2.2; this phase adds predictive prefetching
- Prefetch strategy: given playhead position and direction, prefetch N frames ahead and evict M frames behind
- Memory budget: configurable, default 256MB for decoded media

**Resolution scaling:**
- During scrubbing (rapid time changes), render at 50% resolution for speed
- During playback, render at full resolution
- During export, always render at full resolution
- Scale detection: if `setTime` is called more than 30 times per second without playing, assume scrubbing mode

**Acceptance Criteria:**

- AC-6.2.A: Scrubbing to the same frame twice -> Second render returns the cached composed frame in < 1ms.
- AC-6.2.B: Changing any layer property -> The composed frame cache entry is invalidated and the next render produces a fresh frame.
- AC-6.2.C: Scrubbing rapidly (> 30 setTime calls/sec) -> Resolution automatically drops to 50%, and frame times decrease proportionally.
- AC-6.2.D: Playing forward at 30fps -> Prefetcher stays 10+ frames ahead of the playhead.
- AC-6.2.E: Total cache memory usage -> Never exceeds the configured budget.

**Acceptance Tests:**

- Test-6.2.A: Performance test -- Compose a frame, then compose the identical frame again. Assert: second call takes < 1ms (vs. first call > 5ms).
- Test-6.2.B: Unit test -- Compose a frame, modify one layer's opacity, compose again. Assert: the result differs from the cached frame.
- Test-6.2.C: Integration test -- Call `setTime` 60 times in 1 second. Assert: the internal resolution flag switches to "scrubbing". Assert: rendered frame dimensions are 960x540 (half of 1920x1080).
- Test-6.2.D: Integration test -- Start playback. After 1 second, check cache contents. Assert: frames for the next 10 frame times are present in cache.
- Test-6.2.E: Stress test -- Load a project with 100 video frames at 4K resolution into the cache. Assert: `cache.memory_usage()` never exceeds the configured budget.

---

#### 6.3 Benchmarking Suite

**skillLevel:** engineer

**Implementation Details:**

Extend the existing Criterion benchmark suite (at `compositor/benches/frame_composition.rs`, 165 lines) and add WASM-vs-Canvas comparison tests.

**Files to modify:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/benches/frame_composition.rs` -- Add new benchmark scenarios for text, video frames, animated layers, and parallel rendering

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/benchmark/wasm-vs-canvas.html` -- Browser benchmark page comparing WASM and Canvas rendering
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/benchmark/wasm-vs-canvas.js` -- Benchmark script

**New Criterion benchmarks:**
- `bench_text_rendering` -- 5 text layers at various sizes
- `bench_blend_modes` -- 10 layers using all blend modes
- `bench_effects_pipeline` -- Layers with blur + shadow + color filters
- `bench_animated_composition` -- 10 animated layers, compose 100 consecutive frames
- `bench_video_frame_decode` -- Extract 100 frames from a test video

**Browser comparison benchmark:**
- Render the same scene (10 solid color layers, 1080p) using both WASM and Canvas 2D
- Measure: average frame time, p95 frame time, memory usage, frames per second
- Output results as JSON for CI tracking

**Regression detection:**
- Store benchmark results in a JSON file committed to the repo
- CI compares current results against baseline; flag if any metric regresses by > 10%

**Acceptance Criteria:**

- AC-6.3.A: `cargo bench` runs all benchmark scenarios without errors -> Generates HTML reports in `target/criterion/`.
- AC-6.3.B: WASM benchmark in Chrome at 1080p with 10 layers -> Average frame time < 16ms.
- AC-6.3.C: Regression detection -> If a code change increases frame time by > 10%, the CI check outputs a warning.
- AC-6.3.D: WASM vs Canvas comparison -> WASM frame time is at least 2x faster than equivalent Canvas 2D rendering.

**Acceptance Tests:**

- Test-6.3.A: CI test -- Run `cargo bench --bench frame_composition`. Assert: exit code 0. Assert: `target/criterion/` directory contains HTML reports.
- Test-6.3.B: Browser test -- Open `wasm-vs-canvas.html` in headless Chrome. Assert: WASM average frame time < 16ms. Assert: results JSON is written to stdout.
- Test-6.3.C: CI test -- Modify a benchmark baseline to simulate regression. Run comparison. Assert: CI check outputs a regression warning.
- Test-6.3.D: Browser test -- Compare WASM and Canvas results from the same benchmark run. Assert: `wasm_avg_ms < canvas_avg_ms / 2`.

---

### Phase 7: Export Pipeline (Weeks 7-8)

**Purpose:** Build the server-side CLI tool for video export by implementing `cli/src/main.rs` (which currently does not exist despite having a `Cargo.toml`), integrating FFmpeg for video encoding, and implementing audio extraction and mixing. This phase delivers the production video export capability.

---

#### 7.1 CLI Implementation

**skillLevel:** mid-level engineer

**Implementation Details:**

Create the CLI entry point that the server-side export pipeline will invoke. The `cli/Cargo.toml` already exists at `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/cli/Cargo.toml` with all dependencies configured (clap, indicatif, tokio, etc.) but there is no `main.rs`.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/cli/src/main.rs` -- CLI entry point with clap argument parsing
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/cli/src/render.rs` -- Render command implementation
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/cli/src/project.rs` -- .sue project file parser

**CLI interface:**
```bash
# Basic render
video-render render --input project.sue --output video.mp4

# With options
video-render render \
    --input project.sue \
    --output video.mp4 \
    --quality high \
    --resolution 1920x1080 \
    --format mp4 \
    --codec h264 \
    --fps 30 \
    --threads 4 \
    --progress json
```

**main.rs structure:**
```rust
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "video-render", about = "Stoked UI Video Renderer CLI")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Render {
        #[arg(short, long)]
        input: PathBuf,
        #[arg(short, long)]
        output: PathBuf,
        #[arg(long, default_value = "high")]
        quality: Quality,
        #[arg(long)]
        resolution: Option<String>,
        #[arg(long, default_value = "mp4")]
        format: OutputFormat,
        #[arg(long, default_value = "h264")]
        codec: Codec,
        #[arg(long, default_value = "30")]
        fps: u32,
        #[arg(long)]
        threads: Option<usize>,
        #[arg(long, default_value = "text")]
        progress: ProgressFormat,
    },
    Info {
        #[arg(short, long)]
        input: PathBuf,
    },
}
```

**Progress reporting:**
- Text mode: `indicatif` progress bar with frame count, elapsed time, ETA
- JSON mode: one JSON object per line with `{ "frame": N, "total": M, "percent": P, "fps": F }`
- Both modes report to stderr, keeping stdout clean for piping

**Acceptance Criteria:**

- AC-7.1.A: `video-render --help` -> Displays usage information with all subcommands and options.
- AC-7.1.B: `video-render render --input test.sue --output test.mp4` with a valid project file -> Exits with code 0 and produces a video file.
- AC-7.1.C: `video-render info --input test.sue` -> Prints project metadata (duration, resolution, track count, layer count).
- AC-7.1.D: `video-render render ... --progress json` -> Outputs one JSON line per frame to stderr with frame number, total, and percentage.
- AC-7.1.E: Invalid input file -> Exits with code 1 and a descriptive error message.

**Acceptance Tests:**

- Test-7.1.A: Integration test -- Run `video-render --help`. Assert: exit code 0. Assert: output contains "render" and "info" subcommands.
- Test-7.1.B: Integration test -- Create a minimal .sue project file with 1 solid color layer, 1-second duration. Run `video-render render`. Assert: exit code 0. Assert: output file exists and is > 0 bytes.
- Test-7.1.C: Integration test -- Run `video-render info --input test.sue`. Assert: output contains "duration", "resolution", and "tracks".
- Test-7.1.D: Integration test -- Run render with `--progress json`. Parse each stderr line as JSON. Assert: `frame` increases monotonically. Assert: `percent` reaches 100 at completion.
- Test-7.1.E: Integration test -- Run `video-render render --input nonexistent.sue`. Assert: exit code 1. Assert: stderr contains "not found" or similar error.

---

#### 7.2 FFmpeg Video Encoding

**skillLevel:** senior engineer

**Implementation Details:**

Implement the frame-to-video encoding pipeline that takes composed frames from the compositor and encodes them into a video file via FFmpeg.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/cli/src/ffmpeg.rs` -- FFmpeg encoding integration
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/cli/src/encoder.rs` -- Frame-to-encoder pipe abstraction

**Encoding approach:** Spawn FFmpeg as a subprocess and pipe raw RGBA frames to its stdin. This approach:
- Avoids linking FFmpeg libraries (simpler build)
- Provides maximum codec/format flexibility
- Is robust and well-tested in production environments

```rust
pub struct VideoEncoder {
    ffmpeg_process: Child,
    stdin: ChildStdin,
    width: u32,
    height: u32,
    fps: u32,
    frames_written: u64,
}

impl VideoEncoder {
    pub fn new(config: EncoderConfig) -> Result<Self> {
        let mut cmd = Command::new("ffmpeg");
        cmd.args([
            "-y",
            "-f", "rawvideo",
            "-pixel_format", "rgba",
            "-video_size", &format!("{}x{}", config.width, config.height),
            "-framerate", &config.fps.to_string(),
            "-i", "pipe:0",
            "-c:v", &config.codec.to_ffmpeg_name(),
            "-crf", &config.quality.to_crf().to_string(),
            "-pix_fmt", "yuv420p",
            &config.output_path.to_str().unwrap(),
        ]);
        // ...
    }

    pub fn write_frame(&mut self, frame: &Frame) -> Result<()>;
    pub fn finish(self) -> Result<()>;
}
```

**Quality presets:**

| Preset | H.264 CRF | H.265 CRF | Description |
|---|---|---|---|
| `low` | 28 | 32 | Fastest encoding, smaller files |
| `medium` | 23 | 28 | Balanced quality/size |
| `high` | 18 | 22 | High quality, larger files |
| `lossless` | 0 | 0 | Maximum quality |

**Parallel frame rendering:**
- Use `rayon` to compose frames in parallel across CPU cores
- Feed composed frames to FFmpeg sequentially (FFmpeg requires sequential input)
- Double-buffer: compose batch N+1 while encoding batch N

**Acceptance Criteria:**

- AC-7.2.A: Encoding 100 frames at 1080p with H.264 high quality -> Produces a valid MP4 file playable in standard video players.
- AC-7.2.B: Encoding with H.265 codec -> Produces a valid MP4 file with HEVC encoding.
- AC-7.2.C: Quality preset "high" produces larger file than "low" for the same content -> File size difference is at least 2x.
- AC-7.2.D: Encoding 1000 frames with 4 threads -> Completes in less time than single-threaded (at least 1.5x speedup).
- AC-7.2.E: FFmpeg not installed -> `VideoEncoder::new` returns an error with message "ffmpeg not found in PATH".

**Acceptance Tests:**

- Test-7.2.A: Integration test -- Compose 100 solid color frames. Encode to MP4 H.264. Assert: file exists. Assert: `ffprobe` reports 100 frames, H.264 codec, correct resolution.
- Test-7.2.B: Integration test -- Same as above with H.265. Assert: `ffprobe` reports HEVC codec.
- Test-7.2.C: Integration test -- Encode same content at "high" and "low". Assert: high quality file is at least 2x larger.
- Test-7.2.D: Benchmark test -- Encode 1000 frames single-threaded and multi-threaded. Assert: multi-threaded is at least 1.5x faster.
- Test-7.2.E: Unit test -- Set PATH to empty, attempt `VideoEncoder::new`. Assert: returns `Err` containing "ffmpeg".

---

#### 7.3 Audio Handling

**skillLevel:** mid-level engineer

**Implementation Details:**

Implement audio extraction from video sources and multi-track audio mixing for the export pipeline. Audio is handled by FFmpeg's filter complex for mixing.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/cli/src/audio.rs` -- Audio extraction and mixing

**Audio pipeline approach:**
1. Extract audio from each video source using FFmpeg: `ffmpeg -i input.mp4 -vn -acodec pcm_s16le temp_audio.wav`
2. Apply timeline timing: offset each audio track by its action's `start` time
3. Mix all audio tracks using FFmpeg's `amix` filter: `ffmpeg -i audio1.wav -i audio2.wav -filter_complex "amix=inputs=2" mixed.wav`
4. Mux the mixed audio with the encoded video: `ffmpeg -i video.mp4 -i mixed.wav -c:v copy -c:a aac output.mp4`

```rust
pub struct AudioMixer {
    tracks: Vec<AudioTrack>,
    output_sample_rate: u32,
}

pub struct AudioTrack {
    source_path: PathBuf,
    start_ms: f64,
    end_ms: f64,
    volume: f32,
}

impl AudioMixer {
    pub fn add_track(&mut self, track: AudioTrack);
    pub fn mix_to_file(&self, output_path: &Path) -> Result<()>;
    pub fn mux_with_video(&self, video_path: &Path, output_path: &Path) -> Result<()>;
}
```

**Acceptance Criteria:**

- AC-7.3.A: Exporting a project with one video track that has audio -> The output video contains the original audio track, synced to the video.
- AC-7.3.B: Exporting a project with two overlapping video tracks that have audio -> Both audio tracks are mixed together in the output.
- AC-7.3.C: An audio track starting at t=2000ms in the timeline -> The audio in the output is silent for the first 2 seconds, then the track audio begins.
- AC-7.3.D: Audio/video sync -> The audio and video are synchronized within 1 frame tolerance (33ms at 30fps).

**Acceptance Tests:**

- Test-7.3.A: Integration test -- Create a .sue project with one video track (with audio). Export. Assert: `ffprobe` reports both video and audio streams. Assert: audio duration matches video duration (within 100ms).
- Test-7.3.B: Integration test -- Create a project with two overlapping audio-bearing video tracks. Export. Assert: `ffprobe` reports one audio stream. Assert: audio waveform analysis shows mixed content from both sources.
- Test-7.3.C: Integration test -- Create a project with an audio track starting at t=2000ms. Export. Assert: the first 1.9 seconds of audio are silence (amplitude < -60dB). Assert: audio content begins between 1.9-2.1 seconds.
- Test-7.3.D: Integration test -- Export a project with a known audio spike (e.g., a click) at a specific visual event (e.g., a layer appearing). Assert: the audio spike and visual event are within 33ms of each other.

---

### Phase 8: Testing & Documentation (Week 8)

**Purpose:** Achieve production readiness through comprehensive testing (unit, integration, end-to-end, browser compatibility, memory leak detection) and complete API documentation for all public interfaces. This phase ensures the renderer is reliable, well-documented, and maintainable.

---

#### 8.1 Unit & Integration Tests

**skillLevel:** mid-level engineer

**Implementation Details:**

Write comprehensive tests for the compositor library, WASM module, and EditorEngine integration. The existing test coverage is limited to basic functionality in each module's `#[cfg(test)] mod tests` blocks.

**Files to modify/create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/tests/blend_accuracy.rs` -- Detailed blend mode accuracy tests
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/tests/transform_correctness.rs` -- Transform operation tests
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/compositor/tests/effects_validation.rs` -- Effect output validation
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/wasm-preview/tests/web.rs` -- WASM browser compatibility tests
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/WasmPreview/__tests__/useWasmRenderer.test.ts` -- React hook tests
- `/Users/stoked/work/stoked-ui/packages/sui-editor/src/Controllers/__tests__/CompositorController.test.ts` -- Controller tests

**Blend mode accuracy tests:**
- For each blend mode, test with known input/output pairs from the W3C compositing specification
- Test edge cases: fully transparent top, fully transparent bottom, identical colors, pure black, pure white
- Test alpha compositing correctness: pre-multiplied vs straight alpha

**Transform tests:**
- Rotation at 0, 45, 90, 180, 270, 360 degrees
- Scale at 0.5, 1.0, 2.0, 10.0
- Combined transforms: rotate + scale + translate
- Anchor point variations: corners, center, arbitrary positions

**WASM browser tests (via `wasm-pack test --headless --chrome`):**
- Module initialization
- PreviewRenderer creation
- Frame rendering
- Memory cleanup
- Error handling for invalid inputs

**Memory leak detection:**
- Use `wasm-pack test` with `--features memory-profiling`
- Render 1000 frames, check that WASM memory does not grow unboundedly
- Verify that `free()` releases all allocated memory

**Acceptance Criteria:**

- AC-8.1.A: `cargo test --workspace` -> All tests pass with 0 failures.
- AC-8.1.B: `cargo tarpaulin --workspace` -> Reports >= 80% line coverage for the `compositor` crate.
- AC-8.1.C: `wasm-pack test --headless --chrome` -> All WASM tests pass in headless Chrome.
- AC-8.1.D: Memory leak test (1000 frame renders in WASM) -> Memory growth is < 10MB over the test duration (no unbounded growth).
- AC-8.1.E: React hook tests -> All pass with React Testing Library, covering load, render, error, and cleanup paths.

**Acceptance Tests:**

- Test-8.1.A: CI test -- Run `cargo test --workspace`. Assert: exit code 0. Assert: output contains "test result: ok".
- Test-8.1.B: CI test -- Run `cargo tarpaulin --workspace --out Json`. Parse JSON output. Assert: `compositor` crate coverage >= 80%.
- Test-8.1.C: CI test -- Run `wasm-pack test --headless --chrome --release`. Assert: all tests pass.
- Test-8.1.D: Integration test -- In a headless browser, render 1000 frames via WASM. Record `WebAssembly.Memory.buffer.byteLength` before and after. Assert: growth < 10MB.
- Test-8.1.E: CI test -- Run `npx jest --testPathPattern=WasmPreview`. Assert: all tests pass.

---

#### 8.2 End-to-End Tests

**skillLevel:** mid-level engineer

**Implementation Details:**

Build end-to-end test scenarios that exercise the full pipeline from project file to rendered output, verifying visual correctness, audio/video sync, and export quality.

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/cli/tests/e2e.rs` -- Full pipeline integration tests
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/cli/tests/fixtures/` -- Test project files and expected output references

**E2E test scenarios:**

1. **Simple render:** 1 solid color layer, 3-second duration, 30fps -> Verify frame count, resolution, codec
2. **Multi-layer render:** 5 layers (2 video, 2 image, 1 text) with various blend modes -> Verify all layers appear
3. **Animation render:** Animated position/opacity over 5 seconds -> Verify keyframe interpolation in output
4. **Audio sync:** Video with audio, verify sync within 1 frame
5. **Quality comparison:** Render at "low" and "high" quality, verify PSNR difference

**Visual regression testing:**
- Render a reference frame at a known time
- Compare output against a reference image using pixel-wise PSNR (Peak Signal-to-Noise Ratio)
- Threshold: PSNR > 40dB (imperceptible difference)

**Acceptance Criteria:**

- AC-8.2.A: Simple render test -> Output video has correct frame count (duration * fps), correct resolution, and correct codec.
- AC-8.2.B: Multi-layer render -> A frame captured from the output at a known time matches the expected visual composition (PSNR > 40dB vs. reference).
- AC-8.2.C: Animation render -> Frames at 0%, 50%, and 100% of the animation duration show the expected interpolated positions.
- AC-8.2.D: Audio sync test -> Audio waveform analysis confirms sync within 33ms (1 frame at 30fps).
- AC-8.2.E: All E2E tests complete within 5 minutes on CI -> Reasonable execution time for the test suite.

**Acceptance Tests:**

- Test-8.2.A: Integration test -- Render `fixtures/simple.sue`. Assert: `ffprobe` reports 90 frames (3s * 30fps), 1920x1080, H.264.
- Test-8.2.B: Integration test -- Render `fixtures/multilayer.sue`. Extract frame at t=1500ms. Compare against `fixtures/multilayer_reference.png`. Assert: PSNR > 40dB.
- Test-8.2.C: Integration test -- Render `fixtures/animated.sue`. Extract frames at t=0, t=2500, t=5000. Assert: the animated layer's position changes across the three frames. Assert: t=2500 position is approximately halfway between t=0 and t=5000.
- Test-8.2.D: Integration test -- Render `fixtures/audio_sync.sue`. Use `ffprobe` to verify audio stream exists. Analyze audio onset vs. visual event timing. Assert: difference < 33ms.
- Test-8.2.E: CI test -- Run all E2E tests with a 5-minute timeout. Assert: all complete within the timeout.

---

#### 8.3 API Documentation & Guides

**skillLevel:** engineer

**Implementation Details:**

Write comprehensive documentation for all public APIs and create integration guides for consumers of the renderer.

**Files to modify:**
- All Rust source files in `compositor/src/` -- Add `///` doc comments to all public types, methods, and functions
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/wasm-preview/src/lib.rs` -- Add doc comments to all `#[wasm_bindgen]` functions

**Files to create:**
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/docs/integration-guide.md` -- Guide for integrating WASM renderer into sui-editor
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/docs/performance-guide.md` -- Performance tuning tips
- `/Users/stoked/work/stoked-ui/packages/sui-video-renderer/docs/cli-guide.md` -- CLI usage documentation

**Rust doc comments:** Every public struct, enum, trait, function, and method must have a `///` doc comment explaining its purpose, parameters, return values, and providing a usage example where appropriate. Run `cargo doc --no-deps --document-private-items` to generate HTML documentation.

**TypeScript docs:** Add JSDoc comments to all exported types and functions in:
- `useWasmRenderer.ts`
- `types.ts`
- `actionMapper.ts`
- `CompositorController.ts`

**Integration guide contents:**
1. Prerequisites (Rust, wasm-pack, wasm-opt installation)
2. Building the WASM module
3. Adding to your React project
4. Enabling WASM rendering in EditorEngine
5. Configuring fallback behavior
6. Troubleshooting common issues

**Performance guide contents:**
1. Understanding the frame budget (16ms for 60fps)
2. Layer count recommendations by resolution
3. Memory management best practices
4. Cache configuration tuning
5. When to use resolution scaling
6. Profiling with Criterion and browser DevTools

**Acceptance Criteria:**

- AC-8.3.A: `cargo doc --no-deps` -> Compiles without warnings about missing documentation on public items.
- AC-8.3.B: Every public function in the `compositor` crate has a doc comment with at least one sentence of description.
- AC-8.3.C: The integration guide covers all steps from prerequisites to a working WASM render in the editor.
- AC-8.3.D: The performance guide includes concrete recommendations with measurable targets.
- AC-8.3.E: The CLI guide documents all commands, flags, and quality presets with examples.

**Acceptance Tests:**

- Test-8.3.A: CI test -- Run `RUSTDOCFLAGS="-D warnings" cargo doc --no-deps`. Assert: exit code 0 (no missing doc warnings).
- Test-8.3.B: Script test -- Parse all public functions in `compositor/src/*.rs`. Assert: each has a `///` comment on the line before `pub fn`.
- Test-8.3.C: Manual review -- Follow the integration guide from scratch on a clean machine. Assert: the WASM renderer is operational in the editor at the end.
- Test-8.3.D: Manual review -- Each performance recommendation in the guide cites a measurable metric (e.g., "keep layer count under 15 for 60fps at 1080p").
- Test-8.3.E: Manual review -- The CLI guide documents `render`, `info`, `--quality`, `--codec`, `--resolution`, `--fps`, `--progress`, `--threads` with examples.

---

## Section 3: Completion Criteria

The project is considered complete when ALL of the following are satisfied:

### Functional Completeness
- [ ] All 8 phases have been implemented and all acceptance criteria are met
- [ ] The `MockPreviewRenderer` in `useWasmRenderer.ts` has been fully replaced with the real WASM module
- [ ] The CLI at `cli/src/main.rs` exists and can render a `.sue` project to a video file
- [ ] All 18+ blend modes produce output matching the W3C compositing specification
- [ ] Text rendering works with the embedded default font with no external dependencies
- [ ] Rotation, skew, and anchor point transforms are fully functional
- [ ] Shadow effects render correctly (not returning a clone)
- [ ] The keyframe/animation system interpolates all transform and effect properties over time
- [ ] The `CompositorController` is integrated into `EditorEngine` with working enter/update/leave lifecycle

### Performance
- [ ] 60 FPS sustained at 1080p with 10 layers in Chrome (measured by benchmark suite)
- [ ] Frame composition time < 16ms (measured by Criterion benchmarks)
- [ ] WASM bundle < 500KB uncompressed, < 100KB gzipped
- [ ] Memory usage < 200MB for a complex 1080p project in the browser
- [ ] Time to first frame < 100ms
- [ ] No memory leaks in a 1-hour stress test

### Quality
- [ ] `cargo test --workspace` passes with 0 failures
- [ ] `cargo tarpaulin` reports >= 80% coverage for the `compositor` crate
- [ ] `wasm-pack test --headless --chrome` passes all WASM tests
- [ ] All E2E export tests pass (visual correctness, A/V sync)
- [ ] Browser compatibility verified in Chrome, Firefox, Safari, Edge
- [ ] `cargo doc --no-deps` compiles without missing-doc warnings

### Integration
- [ ] EditorEngine works correctly in both WASM and Canvas modes
- [ ] Graceful fallback from WASM to Canvas works when WASM is unavailable
- [ ] All existing editor tests pass without modification (no regressions)
- [ ] The npm package `@stoked-ui/video-renderer-wasm` is published and importable

---

## Section 4: Rollout & Validation

### 4.1 Rollout Strategy

**Stage 1: Internal Testing (Week 8)**
- Deploy WASM renderer behind a feature flag (`useWasmRenderer: false` by default)
- Internal team tests with real projects on the staging environment
- Monitor memory usage, FPS, and error rates

**Stage 2: Beta Release (Week 9)**
- Enable WASM renderer as opt-in for beta users
- `WasmRendererConfig.enabled = true` must be explicitly set
- Canvas fallback active by default (`fallbackToCanvas: true`)
- Collect performance metrics from real-world usage

**Stage 3: General Availability (Week 10)**
- Enable WASM renderer by default (with Canvas fallback still active)
- Update documentation with real-world performance data
- Publish `@stoked-ui/video-renderer-wasm` to npm

### 4.2 Validation Checklist

- [ ] Staging deployment with feature flag works correctly
- [ ] Real user projects render at 60 FPS in staging
- [ ] Export pipeline produces correct output for 3+ real project files
- [ ] No WASM-related errors in Sentry/error tracking for 48 hours
- [ ] Memory usage stays within budget over 1-hour editing sessions
- [ ] Canvas fallback triggers correctly in Safari Private Browsing (which may block WASM)

### 4.3 Monitoring

| Metric | Tool | Alert Threshold |
|---|---|---|
| WASM init failure rate | Sentry | > 5% of sessions |
| Average frame time | Custom Analytics | > 20ms (below 50fps) |
| Memory usage | Performance Observer API | > 250MB |
| Canvas fallback rate | Custom Analytics | > 10% (investigate browser compat) |
| Export job failure rate | Server monitoring | > 2% |
| Export A/V sync drift | Automated test | > 66ms (2 frames at 30fps) |

---

## Section 5: Open Questions

1. **Font bundling strategy for WASM.** Should fonts be embedded in the WASM binary (increasing bundle size by ~500KB per font), loaded lazily from a CDN, or rendered to ImageData on the JavaScript side before passing to the compositor? The WASM bundle size constraint of <500KB (uncompressed) is in direct tension with embedding even one font. **Recommendation:** Embed one minimal font (Noto Sans subset, ~100KB), lazy-load additional fonts from CDN.

2. **Project file format stability.** Is the `.sue` format finalized, or will it evolve? The CLI export tool's parser must track format changes. **Recommendation:** Version the format with a `"version": 1` field in the file header; the CLI should reject unsupported versions with a clear error.

3. **WebCodecs API timeline.** When will browser support for WebCodecs be sufficient to replace the OffscreenCanvas `drawImage` approach for video frame extraction? As of 2026-02, Chrome and Edge support it, but Firefox and Safari support is limited. **Recommendation:** Keep the OffscreenCanvas approach as primary, add WebCodecs as an optional optimization behind feature detection.

4. **napi-rs migration timeline.** The subprocess approach for NestJS integration adds ~50ms per invocation. At what video processing volume does migrating to napi-rs (FFI) become worthwhile? **Recommendation:** Revisit after 6 months of production usage; the subprocess overhead is amortized over multi-second render jobs and is not a bottleneck for batch export.

5. **WASM threading (SharedArrayBuffer).** Can we require Cross-Origin Isolation headers in the deployment environment? If so, `wasm-bindgen-rayon` could enable multi-threaded WASM composition. **Recommendation:** Do not require COOP/COEP headers for the initial release. Target it as a Phase 6 stretch goal with a feature flag.

6. **WebGPU acceleration.** Should Phase 6 include a WebGPU prototype via `wgpu`? **Decision needed:** This is explicitly out of scope per PFB section 4, but could provide 5-10x additional improvement. **Recommendation:** Defer to a follow-up initiative after this project ships.

7. **Keyframe data persistence.** Where do keyframe animations live in the data model? Options: (a) stored in `IEditorAction` metadata, (b) in a separate animation track type, (c) in the `.sue` project file as a dedicated section. **Recommendation:** Store in `IEditorAction` as a `keyframes` property, which is automatically persisted in the `.sue` file with the rest of the action data.

8. **Audio mixing implementation.** Should audio mixing be handled by FFmpeg filter complex or by a Rust audio library (e.g., `rodio`)? **Recommendation:** Use FFmpeg `amix` filter for simplicity and proven reliability. A Rust-native approach offers more control but adds significant complexity for limited benefit.

9. **Benchmark regression CI.** Should benchmark results be tracked in CI to detect performance regressions automatically? **Recommendation:** Yes, store baseline results in `benchmark/baselines/` and compare on each PR. Flag regressions > 10% as CI warnings (not failures, since benchmark variance is inherent).

10. **Deployment environment for CLI.** What is the target server environment? **Recommendation:** Package as a Docker image with FFmpeg bundled. Support Lambda via SST for small jobs (< 5 minutes, < 10GB memory). Document both deployment options in the CLI guide.
