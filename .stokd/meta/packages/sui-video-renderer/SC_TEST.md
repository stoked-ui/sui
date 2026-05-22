# SC_TEST — sui-video-renderer Testing Strategy

**Package:** `packages/sui-video-renderer`
**Language:** Rust (workspace, three crates)
**Priority:** Medium
**Last refreshed:** 2026-05-21

---

## 1. Package Overview

`sui-video-renderer` is a Cargo workspace at
`packages/sui-video-renderer/Cargo.toml` containing three crates:

| Crate | Path | Type | Purpose |
|---|---|---|---|
| `video-compositor` | `compositor/` | rlib | Pure-Rust frame composition engine. Used by both browser preview and CLI export. |
| `wasm-preview` | `wasm-preview/` | cdylib + rlib | `wasm-bindgen` glue exposing `PreviewRenderer` to JavaScript. Compiled to WASM via `scripts/build-wasm.sh`. |
| `video-renderer-cli` | `cli/` | bin (`video-render`) | Native CLI that loads `.sue` project files, drives the compositor, and shells out to FFmpeg for encoding. |

### Source modules (relevant to test planning)

```
compositor/src/
  lib.rs             public surface, Error enum
  types.rs           Color, Point, Rect, Size
  frame.rs           Frame wrapper around RgbaImage
  blend.rs           BlendMode (18 modes), HSL helpers
  transform.rs       Transform (position/scale/rotation/opacity/anchor/skew)
  effects.rs         Effect enum (blur, shadow, gradients, color matrix, …)
  layer.rs           Layer (solid_color | image | image_data | text), z-index, blend, effects
  text.rs            TextRenderer, TextStyle, TextAlignment, TextShadow, Stroke
  keyframe.rs        AnimatedProperty<T>, Keyframe<T>, EasingFunction, Interpolate trait
  animated.rs        AnimatedLayer, AnimatedTransform, resolve_at()
  cache.rs           FrameCache, ComposedFrameCache, Prefetcher, ScrubbingDetector
  timeline.rs        Timeline, TimelineLayer (time bounds, enable/disable)
  compositor.rs      Compositor::new / compose / compose_into, BufferPool, Tile
  video.rs           native FFmpeg-backed frame extraction (cfg(not(target_arch="wasm32")))

wasm-preview/src/
  lib.rs             PreviewRenderer (wasm-bindgen), WasmLayer JSON shape, benchmark_composition
  video.rs           BrowserMediaLoader (HTMLVideoElement → RGBA, image cache)

cli/src/
  main.rs            clap CLI (render | info)
  project.rs         .sue JSON model (Project, ProjectTrack, TrackType, TrackAction, TrackTransform)
  render.rs          frame-by-frame render driver, parallel via rayon
  encoder.rs         frame → encoded video (PNG sequence, raw)
  ffmpeg.rs          FFmpeg invocation (mux, encode)
  audio.rs           audio mix + extract using FFmpeg
```

---

## 2. What Exists Today (verified 2026-05-21)

### Inline unit tests (`#[cfg(test)] mod tests` at the bottom of each source file)

| File | `#[test]` count | Notes |
|---|---:|---|
| `compositor/src/types.rs` | 3 | `Color`, `Rect::contains` |
| `compositor/src/frame.rs` | 3 | `Frame` round-trip |
| `compositor/src/blend.rs` | 16 | All 18 modes spot-checked, serde round-trip |
| `compositor/src/transform.rs` | 6 | Identity, builder, opacity clamp, skew |
| `compositor/src/effects.rs` | 11 | Brightness/blur/shadow/gradient/invert/grayscale/sepia/chromatic-aberration/color-matrix |
| `compositor/src/keyframe.rs` | 13 | Linear, EaseInOut, CubicBezier monotonic, Steps, Hold, boundary clamping, Point/Color interp |
| `compositor/src/animated.rs` | 10 | `AnimatedLayer` resolve, `AnimatedTransform::from_static` round-trip |
| `compositor/src/cache.rs` | 40 | LRU eviction, memory accounting, `Prefetcher`, `ScrubbingDetector` |
| `compositor/src/timeline.rs` | 13 | `is_active_at`, `frame_count`, render-frame paths |
| `compositor/src/text.rs` | 7 | Style builder, alignment, shadow geometry |
| `compositor/src/layer.rs` | 3 | Constructors, builder ordering |
| `compositor/src/compositor.rs` | 38 | `BufferPool`, tile splitting, compose paths |
| `compositor/src/video.rs` | 4 | Native FFmpeg extraction (gated on the binary) |
| `cli/src/main.rs` | 3 | CLI value parsing |
| `cli/src/project.rs` | 5 | `.sue` JSON model |
| `cli/src/encoder.rs` | 4 | Frame encoder paths |
| `cli/src/audio.rs` | 10 | Audio mix arithmetic |
| `cli/src/ffmpeg.rs` | 8 | FFmpeg argument shaping (does not invoke the binary) |
| `wasm-preview/src/video.rs` | 5 | (compiled but only meaningful under `wasm32`) |

### Integration tests

| File | Coverage |
|---|---|
| `compositor/tests/blend_accuracy.rs` (564 LOC, 40 tests) | All 18 blend modes against known pixel pairs, plus end-to-end layer blends |
| `compositor/tests/transform_correctness.rs` (677 LOC, 31 tests) | Rotation 0/90/180/270/360/45/neg, scale identity/2×/0.5×/10×, non-uniform, combined transforms |
| `compositor/tests/effects_integration.rs` (274 LOC, 8 tests) | Shadow + linear gradient on real images |
| `compositor/tests/effects_validation.rs` (846 LOC, 45 tests) | Blur, brightness, contrast, opacity, gradient stops |
| `cli/tests/e2e.rs` (582 LOC, 17 tests) | `Project::from_file` for `simple.sue` / `multilayer.sue` / `animated.sue`, `to_timeline`, single + sequence render, save+reload, malformed JSON, missing file |
| `wasm-preview/tests/browser_integration.rs` (505 LOC, 12 tests, gated on `target_arch = "wasm32"`) | `PreviewRenderer` creation, solid color render, image cache lifecycle, `benchmark_composition` |

### CLI fixtures

`cli/tests/fixtures/` contains `simple.sue`, `multilayer.sue`, `animated.sue`,
`test_image.png`. (The earlier missing-`multilayer.sue` gap noted in prior
revisions of this doc has been closed.)

### Benchmarks (Criterion)

`compositor/benches/frame_composition.rs` registered as the `frame_composition`
bench in `compositor/Cargo.toml`. Covers simple/complex composition at 1080p
and 4K, all blend modes, effects pipelines, and 1–50 layer scaling.

### Regression tooling

`benchmark/check-regression.sh` and `benchmark/baseline.json.example` provide a
regression gate against a stored baseline. `benchmark/wasm-vs-canvas.html` is a
manual perf comparison harness for the WASM build.

---

## 3. Coverage Gaps Worth Closing

The bulk of pure-CPU math is well covered. Remaining gaps are concentrated in
I/O-adjacent and platform-specific code paths.

### 3.1 `cli/src/render.rs` (296 LOC, no inline tests)
- Parallel frame render driver (`RenderCommand`) is exercised only indirectly
  through `e2e.rs` rendering a handful of frames. Add coverage for:
  - Worker count = 0 → `num_cpus::get()` resolution
  - Cancellation / partial failure semantics if any
  - Progress reporting boundaries (first frame, last frame, mid-sequence)

### 3.2 `cli/src/encoder.rs` end-to-end output integrity
- Inline tests cover argument shaping. Add an integration test that writes a
  PNG sequence and asserts file count + dimensions; gate FFmpeg-dependent
  variants behind `ffmpeg_available()` (already used in `e2e.rs:17`).

### 3.3 `cli/src/audio.rs` mix arithmetic vs. real samples
- Inline arithmetic tests exist. No fixture-based test mixes two short WAVs and
  asserts the output exists with expected duration. Add one gated on FFmpeg.

### 3.4 `compositor/src/video.rs` (native FFmpeg path)
- Four inline tests, but no real video fixture is loaded. Add one integration
  test that decodes the first frame of a tiny generated MP4 and asserts
  dimensions; gate on FFmpeg availability and feature `native-video`.

### 3.5 `wasm-preview/src/video.rs` (`BrowserMediaLoader`)
- DOM-bound code only meaningful under `target_arch = "wasm32"`. Existing
  `browser_integration.rs` covers cache lifecycle but not `capture_video_frame`
  (no `<video>` element with frames in the headless harness). This is
  acceptable — manually verify against the docs site at `localhost:5199`.

### 3.6 `wasm-preview/src/lib.rs` JSON layer parsing
- `PreviewRenderer::render_frame` parses `WasmLayer` JSON. The existing browser
  test covers `solidColor`. Add a `#[wasm_bindgen_test]` that feeds in a
  malformed JSON and asserts `Err(JsValue)` rather than panicking.

### 3.7 Snapshot regression for composition output
- No pixel snapshot suite. A small `insta`-based snapshot per blend mode (e.g.
  three layers, fixed seed, 64×64 output) would catch unintended regressions
  in `compositor.rs` rasterization paths.

---

## 4. Recommended Frameworks & Tooling

### Primary — Rust built-in test harness
All unit and integration tests run under `cargo test`. No additional framework
is needed for pure logic.

```bash
cargo test --workspace --exclude wasm-preview        # native CI
cargo test -p video-compositor                       # compositor only
cargo test -p video-renderer-cli                     # CLI e2e
cargo test -p video-compositor -- --nocapture        # debugging
```

### Benchmarks — Criterion
Already wired (`[[bench]]` in `compositor/Cargo.toml`).

```bash
cargo bench -p video-compositor
```

### WASM tests — `wasm-bindgen-test` + `wasm-pack`
Already wired (`wasm-bindgen-test = "0.3"` in `wasm-preview/Cargo.toml`,
`#![cfg(target_arch = "wasm32")]` and `wasm_bindgen_test_configure!(run_in_browser)`
in `browser_integration.rs`).

```bash
wasm-pack test --headless --chrome packages/sui-video-renderer/wasm-preview
```

Always exclude `wasm-preview` from native `cargo test --workspace` runs (see §10).

### Snapshot testing — `insta` (recommended new addition)
For visual regression on composed frames:

```toml
# compositor/Cargo.toml [dev-dependencies]
insta = { version = "1", features = ["png"] }
```

Use `insta::assert_binary_snapshot!` against the encoded PNG bytes.

### Coverage — `cargo-llvm-cov`
```bash
cargo install cargo-llvm-cov
cargo llvm-cov --package video-compositor --html --output-dir target/coverage
```

### Regression gate — existing `benchmark/check-regression.sh`
Stage a baseline on `main`, then run the script on PR branches.

---

## 5. Test File Organization & Naming

The existing layout is the right pattern — keep using it:

```
compositor/
  src/<module>.rs              inline #[cfg(test)] mod tests for pure math
  tests/<aspect>_<scope>.rs    integration tests using only the public API
  benches/<topic>.rs           Criterion benches
  examples/<demo>.rs           runnable demos (also useful as smoke tests)

cli/
  src/<module>.rs              inline #[cfg(test)] mod tests
  tests/e2e.rs                 cross-module integration via Project::from_file
  tests/fixtures/*.sue         JSON fixtures kept under VCS

wasm-preview/
  src/<module>.rs              inline tests fine; will only run under wasm32
  tests/browser_integration.rs #[wasm_bindgen_test], gated on target_arch="wasm32"
```

### Naming conventions (already established in the codebase)

- Test functions: `test_<thing>_<scenario>`
  e.g. `test_normal_blend_opaque_over_opaque`, `test_load_simple_project`.
- Test modules: behaviour-grouped — `mod blend_mode_tests`, `mod eviction_tests`.
- Integration files: `<component>_<aspect>.rs` — `blend_accuracy.rs`,
  `transform_correctness.rs`, `effects_validation.rs`.
- Helpers stay at the top of the test file (e.g. `fn fixture_path` in
  `cli/tests/e2e.rs:26`, `fn create_test_canvas` in `wasm-preview/tests/browser_integration.rs:18`).

---

## 6. Mock / Stub Strategy

### Compositor — do not mock anything
The `video-compositor` crate is pure CPU image math with no global state.
Construct `RgbaImage` directly and assert pixel bytes. Use a tiny helper:

```rust
fn solid_image(w: u32, h: u32, color: [u8; 4]) -> image::RgbaImage {
    let mut img = image::RgbaImage::new(w, h);
    img.pixels_mut().for_each(|p| *p = image::Rgba(color));
    img
}
```

### CLI — fixtures over mocks
Keep `.sue` JSON in `cli/tests/fixtures/`. The pattern is:

```rust
fn fixture_path(name: &str) -> PathBuf {
    let mut p = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    p.push("tests"); p.push("fixtures"); p.push(name);
    p
}
```
(See `cli/tests/e2e.rs:26`.)

For temp output, use `tempfile::NamedTempFile` (already a dev-dependency) —
never write to the workspace.

### FFmpeg — skip, do not mock
Use the existing guard:

```rust
fn ffmpeg_available() -> bool {
    std::process::Command::new("ffmpeg").arg("-version").output()
        .map(|o| o.status.success()).unwrap_or(false)
}

#[test]
fn test_audio_mix_real_samples() {
    if !ffmpeg_available() { return; }
    // …
}
```
(See `cli/tests/e2e.rs:17`.)

### WASM DOM — no mocks; run in headless Chrome
There is no usable mock for `web_sys::HtmlVideoElement`. Use
`#[wasm_bindgen_test]` and create real DOM nodes via `web_sys::window()`
inside the test (see `create_test_canvas` in `browser_integration.rs:18`).

---

## 7. Coverage Targets (Medium Priority)

| Crate / Module | Target Line Coverage | Rationale |
|---|---:|---|
| `compositor` (overall) | **75 %** | Core product logic, mostly already there |
| `compositor/src/blend.rs` | 90 % | Mathematical correctness ships into every render |
| `compositor/src/keyframe.rs` | 85 % | Easing math is hard to debug after the fact |
| `compositor/src/transform.rs` | 85 % | Geometric math, builder must be exhaustively right |
| `compositor/src/effects.rs` | 75 % | Many enum branches; a few visual-only paths excluded |
| `compositor/src/cache.rs` | 80 % | LRU + memory accounting silently breaks scrubbing |
| `compositor/src/animated.rs` | 75 % | Per-property resolution path |
| `compositor/src/timeline.rs` | 70 % | Temporal gating |
| `compositor/src/text.rs` | 60 % | Glyph rasterization is hard to pixel-test |
| `compositor/src/compositor.rs` | 70 % | Buffer pool + tile composition |
| `cli` (overall) | **55 %** | FFmpeg dependency limits unit testability |
| `wasm-preview` | **30 %** | Requires headless Chrome; treat as a separate gate |

Measure with `cargo llvm-cov --package video-compositor`.

---

## 8. Specific Tests to Add Next

Ordered by risk × value. Each is a concrete file/function-level addition.

### Priority 1 — `cli/src/render.rs` (no inline coverage today)

**File:** `cli/src/render.rs` (extend with `#[cfg(test)] mod tests`)

```rust
// test_render_command_resolves_zero_threads_to_cpu_count
//   RenderCommand { threads: 0, … }; after init, worker count == num_cpus::get().

// test_render_command_emits_progress_at_first_and_last_frame
//   Drive a 5-frame render with a recording observer; assert progress callback
//   fires for frames 0 and 4 (boundary indices).

// test_render_command_propagates_compose_error
//   Inject a Project whose layer references a missing image; assert the render
//   returns Err containing the path.
```

### Priority 2 — `compositor/tests/snapshot.rs` (new — pixel regression gate)

**File:** `compositor/tests/snapshot.rs` (new integration test using `insta`)

```rust
// test_snapshot_two_solid_layers_normal
//   Compositor 64x64; red bottom + blue top at 0.5 opacity. assert_binary_snapshot
//   on the encoded PNG.

// test_snapshot_blend_mode_multiply
//   Same fixed scene, blend = Multiply. Stored snapshot prevents drift in
//   blend.rs::Multiply::blend implementation.

// test_snapshot_effect_blur_radius_3
//   Solid square; apply Effect::Blur { radius: 3.0 }. Snapshot the output.
```

These snapshots become the regression gate for any change to
`compositor/src/{blend,effects,compositor}.rs`.

### Priority 3 — `cli/src/encoder.rs` end-to-end output

**File:** `cli/tests/encoder_output.rs` (new integration test)

```rust
// test_encoder_writes_png_sequence
//   Render 3 frames at 64x64; encode to a tempdir; assert 3 *.png files
//   exist with correct dimensions.

// test_encoder_mp4_via_ffmpeg
//   if ffmpeg_available() { … }; assert the resulting .mp4 is non-empty and
//   has duration ≈ frame_count / fps using `ffprobe`.
```

### Priority 4 — `cli/src/audio.rs` real-sample mix

**File:** `cli/tests/audio_mix.rs` (new, FFmpeg-gated)

```rust
// test_audio_mix_two_sources
//   if !ffmpeg_available() { return; }
//   Generate two short sine WAVs via ffmpeg lavfi; mix; assert output exists,
//   duration matches longest input, and is decodable.
```

### Priority 5 — `wasm-preview` malformed JSON path

**File:** `wasm-preview/tests/browser_integration.rs` (extend)

```rust
// test_render_frame_rejects_malformed_json
//   PreviewRenderer::new(...).render_frame("{ not json").is_err()
//   — ensures we don't panic into the JS side.

// test_render_frame_unknown_layer_type_skips_layer
//   layers_json with type "magic"; render_frame returns Ok(()), no panic;
//   metrics.cached_images unchanged.
```

### Priority 6 — `compositor/src/video.rs` real frame decode

**File:** `compositor/tests/video_decode.rs` (new, native-only, FFmpeg-gated)

```rust
#![cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
// test_video_decoder_extracts_first_frame
//   Generate a 16x16 1-second mp4 via ffmpeg lavfi color=red;
//   decode first frame; assert dimensions == 16x16 and a red sample pixel.
```

---

## 9. Benchmark Regression Guard

Use the existing `benchmark/` infrastructure:

```bash
# On main, capture a baseline
cargo bench -p video-compositor -- --save-baseline main

# On a PR branch
bash packages/sui-video-renderer/benchmark/check-regression.sh
```

**Acceptable regression** (medium priority): 10 % overall.
**Hot paths** (`blend.rs`, parallel composition in `compositor.rs`,
`Effect::Blur`): no more than 5 %.

Track these specifically:
- `simple_composition_3_layers_1080p`
- `blend_modes/blend_mode_*`
- `effects_pipeline/blur_radius_5`
- `parallel_composition/frames_100`

---

## 10. Running the Suite

From the package root (`packages/sui-video-renderer`):

```bash
# Native CI — workspace minus the WASM crate
cargo test --workspace --exclude wasm-preview

# Compositor in isolation
cargo test -p video-compositor

# CLI e2e
cargo test -p video-renderer-cli

# Coverage report
cargo llvm-cov --package video-compositor --html --output-dir target/coverage

# Benchmarks
cargo bench -p video-compositor

# Browser tests
wasm-pack test --headless --chrome wasm-preview
```

### CI gating recommendation

1. `cargo test --workspace --exclude wasm-preview` — all platforms, blocking.
2. `cargo bench -p video-compositor` + `benchmark/check-regression.sh` — Linux,
   dedicated runner for stable timing, blocking.
3. `wasm-pack test --headless --chrome wasm-preview` — Linux with Chromium,
   non-blocking initially while the harness stabilizes.

---

## 11. Anti-patterns to Avoid

- **No exact float pixel asserts after HSL conversions.** Use `±1` or `±2`
  tolerance for u8 channels that round-trip through f32 (e.g. `BlendMode::Hue`,
  `BlendMode::Saturation`, `BlendMode::Color`, `BlendMode::Luminosity`).
- **No `sleep()` in tests.** All compositor operations are synchronous.
- **No test output writes inside the workspace.** Use `tempfile::NamedTempFile`
  / `std::env::temp_dir()` (the e2e suite already does this).
- **No "looks right" assertions for blend modes.** Use mathematical invariants:
  `Screen(black, X) == X`, `Multiply(white, X) == X`, `Difference(X, X) == black`.
- **No `wasm-bindgen` / `web-sys` imports in `compositor` tests.** The crate
  guards `compositor/src/video.rs` with `#[cfg(not(target_arch = "wasm32"))]`;
  keep it that way — WASM-bound code lives in `wasm-preview` only.
- **No mocking FFmpeg.** Skip via `ffmpeg_available()` when absent; mocking
  produces tests that pass but exercise nothing real.
