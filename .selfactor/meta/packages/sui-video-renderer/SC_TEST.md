# SC_TEST — sui-video-renderer Testing Strategy

**Package:** `packages/sui-video-renderer`
**Language:** Rust (workspace with 3 crates)
**Priority:** Medium
**Last updated:** 2026-03-21

---

## 1. Package Overview

The package is a Rust workspace containing three crates:

| Crate | Type | Purpose |
|---|---|---|
| `compositor` | library | Core frame composition engine |
| `wasm-preview` | library (WASM target) | Browser bindings via `wasm-bindgen` |
| `cli` | binary | `.sue` project file renderer (FFmpeg pipeline) |

### Source Modules

**compositor/src/**
- `lib.rs` — Public API surface, `Error` enum
- `types.rs` — `Color`, `Point`, `Size`, `Rect`
- `blend.rs` — `BlendMode` enum, 18 per-pixel blend operations, HSL helpers
- `transform.rs` — `Transform` (position/scale/rotation/opacity/anchor/skew), builder pattern
- `keyframe.rs` — `AnimatedProperty<T>`, `Keyframe<T>`, `EasingFunction`, `Interpolate` trait
- `effects.rs` — `Effect` enum (13 variants), per-pixel filter implementations
- `animated.rs` — `AnimatedLayer`, `AnimatedTransform`, `resolve_at()`
- `cache.rs` — `FrameCache` (LRU + memory budget), `ComposedFrameCache`, `Prefetcher`, `ScrubbingDetector`
- `frame.rs` — `Frame` wrapper
- `layer.rs` — `Layer` (solid_color/image/text constructors), z-index, blend mode, effects
- `text.rs` — `TextRenderer`, `TextStyle`, `TextAlignment`, `TextShadow`, `Stroke`
- `timeline.rs` — `Timeline`, `TimelineLayer` (time bounds, enable/disable)
- `video.rs` — native video frame extraction (non-WASM)

**wasm-preview/src/**
- `video.rs` — `BrowserMediaLoader` (canvas-based frame capture, image caching)

**cli/src/**
- `project.rs` — `.sue` JSON format: `Project`, `ProjectTrack`, `TrackType`, `TrackAction`, `TrackTransform`
- `render.rs`, `encoder.rs`, `audio.rs`, `ffmpeg.rs` — rendering pipeline

---

## 2. What Exists Today

### Inline unit tests (`#[cfg(test)]` blocks inside source files)
| File | Tests |
|---|---|
| `compositor/src/types.rs` | Color creation, `Rect::contains` |
| `compositor/src/blend.rs` | Normal, Multiply, serde round-trip, ColorDodge, ColorBurn, Difference, Exclusion, SoftLight, HardLight, Hue, Saturation, Color, Luminosity |
| `compositor/src/transform.rs` | Default identity, builder, opacity clamping, skew |
| `compositor/src/keyframe.rs` | Linear, EaseInOut, CubicBezier monotonic, Steps(End), Hold, boundary clamping, Point/Color interpolation |
| `compositor/src/effects.rs` | Brightness, blur edge, shadow creation, linear/radial gradient, invert, grayscale, sepia, chromatic aberration, color matrix identity |

### Integration tests
| File | Coverage |
|---|---|
| `compositor/tests/blend_accuracy.rs` | All 18 blend modes with known pixel pairs; layer composition blend tests |
| `compositor/tests/transform_correctness.rs` | Rotation 0/90/180/270/360/45/neg, scale identity/2x/0.5/10x/non-uniform, combined transforms, edge cases |
| `compositor/tests/effects_integration.rs` | Shadow, linear gradient (uses temp image files) |
| `compositor/tests/effects_validation.rs` | Blur, brightness, contrast, opacity, gradients |
| `cli/tests/e2e.rs` | Project load/parse, timeline creation, single/sequence frame render, serialization, empty project, rendering consistency |

### Benchmarks (Criterion)
`compositor/benches/frame_composition.rs` — composition at 1080p/4K, 10 blend modes in a group, effects pipeline (blur, shadow, color filter, multi-effect), animated composition, layer count scaling (1–50 layers).

---

## 3. Coverage Gaps

The following paths have **zero or near-zero** test coverage as of this analysis:

### 3.1 `FrameCache` / `ComposedFrameCache` (`cache.rs`)
- LRU eviction under budget pressure
- `insert` replacing existing key (memory accounting correctness)
- `set_max_memory` triggering eviction
- `clear()` resets `current_memory_bytes`
- `Prefetcher` and `ScrubbingDetector` logic

### 3.2 `AnimatedLayer` / `AnimatedTransform` (`animated.rs`)
- `resolve_at()` reading from per-property `AnimatedProperty`
- Static transform round-trip via `AnimatedTransform::from_static`
- Builder methods (`with_position_x_keyframes`, `with_opacity_keyframes`, etc.)
- Time clamping before first / after last keyframe

### 3.3 `Timeline` / `TimelineLayer` (`timeline.rs`)
- `TimelineLayer::is_active_at` boundary (exactly at `start_ms`, at `end_ms`)
- `TimelineLayer::enabled = false` skipped during render
- `Timeline::render_frame_at` with layers that start/end mid-timeline
- `Timeline::frame_count()` arithmetic at non-integer durations/fps combos

### 3.4 `TextRenderer` (`text.rs`)
- Text layer renders non-empty pixel output
- Font size changes pixel area
- `TextAlignment` affects horizontal position
- `TextShadow` produces offset colored pixels

### 3.5 `effects.rs` edge cases
- `Effect::Blur { radius: 0.0 }` — identity (no change to image)
- `Effect::LinearGradient { stops: vec![] }` — returns image unchanged
- `Effect::Saturation { amount: -1.0 }` — full desaturation (should equal Grayscale)
- `Effect::ColorMatrix` with extreme values (clamp to 0–255)
- `Effect::ChromaticAberration { intensity: 0.0 }` — identity

### 3.6 `compositor/src/video.rs` (native only)
- Frame extraction from a real video file (requires fixture)
- Error on unreadable/missing video file

### 3.7 `wasm-preview/src/video.rs`
- `BrowserMediaLoader` requires a browser DOM — must use `wasm-bindgen-test` with `--chrome` or be excluded from native CI

### 3.8 CLI crates (`cli/src/`)
- `audio.rs` mixing logic — no unit tests
- `encoder.rs` — output file integrity
- `ffmpeg.rs` integration — skipped unless FFmpeg present (existing e2e does gate on `ffmpeg_available()`)
- Missing fixture: `multilayer.sue` referenced in e2e but file not found in `cli/tests/fixtures/`

---

## 4. Recommended Test Framework & Tooling

### Primary: Rust built-in test harness
All unit and integration tests run with `cargo test`. No additional framework needed for pure logic.

```bash
# Run all compositor tests
cargo test -p video-compositor

# Run CLI e2e tests
cargo test -p video-renderer-cli

# Run with output (useful for debugging)
cargo test -p video-compositor -- --nocapture
```

### Benchmarks: Criterion
Already wired. Run with:
```bash
cargo bench -p video-compositor
```

### WASM tests: `wasm-bindgen-test`
For `wasm-preview` code that uses `web-sys` APIs, use:
```toml
# wasm-preview/Cargo.toml [dev-dependencies]
wasm-bindgen-test = "0.3"
```
```bash
wasm-pack test --headless --chrome packages/sui-video-renderer/wasm-preview
```
Gate all browser-DOM tests with `#[wasm_bindgen_test]` and exclude them from native CI.

### Snapshot / pixel regression: `insta` (optional, recommended)
For visual correctness tests on composed frames, consider `insta` for snapshot testing:
```toml
insta = { version = "1", features = ["png"] }
```
This prevents regressions when blend/effect math changes.

### Benchmark regression: existing `benchmark/check-regression.sh`
The `benchmark/` directory contains `check-regression.sh` and `baseline.json.example`. Use these to gate PRs against a stored baseline.

---

## 5. Test File Organization & Naming Conventions

Follow the existing pattern already established:

```
compositor/
  src/
    blend.rs            # inline #[cfg(test)] for pure math
    keyframe.rs         # inline #[cfg(test)] for interpolation math
    cache.rs            # ADD inline #[cfg(test)] — no external deps needed
    animated.rs         # ADD inline #[cfg(test)] — no file I/O needed
    timeline.rs         # ADD inline #[cfg(test)]
    text.rs             # ADD inline #[cfg(test)] with small synthetic images
  tests/
    blend_accuracy.rs       # existing — full 18-mode accuracy
    transform_correctness.rs # existing — geometric correctness
    effects_integration.rs   # existing — effects with real image I/O
    effects_validation.rs    # existing — effect output checking
    cache_behavior.rs        # NEW — LRU eviction, memory accounting
    animated_layer.rs        # NEW — AnimatedLayer and AnimatedTransform
    timeline_rendering.rs    # NEW — TimelineLayer activity, multi-layer render
    text_rendering.rs        # NEW — TextRenderer visual output

cli/
  tests/
    e2e.rs              # existing — project lifecycle
    fixtures/
      simple.sue        # existing
      animated.sue      # existing
      multilayer.sue    # MISSING — must be created (see §6)
```

**Naming conventions:**
- Test functions: `test_<thing>_<scenario>` (e.g., `test_cache_evicts_lru_on_budget_exceeded`)
- Test modules: named after the behavior group (e.g., `mod eviction_tests`, `mod interpolation_tests`)
- Integration test files: `<component>_<aspect>.rs`

---

## 6. Mock / Stub Strategy

### What NOT to mock
The compositor is pure CPU-side image math with no network or global state. Mock nothing — all behavior is deterministic. Tests create real `RgbaImage` instances in memory.

### Image fixtures
Create synthetic images programmatically (as the existing tests do):
```rust
fn solid_image(w: u32, h: u32, color: [u8; 4]) -> RgbaImage {
    let mut img = RgbaImage::new(w, h);
    img.pixels_mut().for_each(|p| *p = Rgba(color));
    img
}
```

### File fixtures
CLI tests need `.sue` JSON files in `cli/tests/fixtures/`. The missing `multilayer.sue` must be created (the e2e test at line 95 expects it). Create it as:
```json
{
  "name": "Multi-Layer Project",
  "duration_ms": 5000.0,
  "fps": 30.0,
  "width": 1920,
  "height": 1080,
  "tracks": [
    { "name": "Background", "track_type": "solid_color", "start_ms": 0.0, "end_ms": 5000.0, "color": [0, 0, 0, 255], "transform": {} },
    { "name": "Image Layer", "track_type": "image", "start_ms": 1000.0, "end_ms": 4000.0, "file_path": "test_image.png", "transform": { "x": 100.0, "y": 50.0 } },
    { "name": "Overlay", "track_type": "solid_color", "start_ms": 2000.0, "end_ms": 5000.0, "color": [255, 255, 255, 128], "transform": { "opacity": 0.5 } }
  ]
}
```

### FFmpeg-dependent tests
Continue the existing `ffmpeg_available()` guard pattern. Do not mock FFmpeg — skip the test entirely when the binary is absent.

### WASM DOM
There is no practical mock for `web_sys::HtmlVideoElement`. Tests for `wasm-preview/src/video.rs` should be `#[wasm_bindgen_test]` tests run under a headless Chromium. For native CI, exclude this crate from `cargo test` with `--exclude wasm-preview`.

---

## 7. Coverage Targets (Medium Priority)

| Crate / Module | Target Line Coverage | Rationale |
|---|---|---|
| `compositor` (overall) | 70% | Core product logic |
| `blend.rs` | 90% | Mathematical correctness is critical |
| `keyframe.rs` | 85% | Animation interpolation, easing edge cases |
| `transform.rs` | 85% | Geometric math, builder correctness |
| `effects.rs` | 75% | Many variant branches; visual validation matters |
| `cache.rs` | 80% | Eviction correctness is not trivially visible |
| `animated.rs` | 70% | Property resolution path |
| `timeline.rs` | 70% | Temporal activity gating |
| `text.rs` | 60% | Font rendering is hard to pixel-test precisely |
| `cli` (overall) | 50% | Heavy FFmpeg dependency limits unit testability |
| `wasm-preview` | 30% | Browser-only; unit tests require headless Chrome |

Measure coverage with:
```bash
cargo llvm-cov --package video-compositor --html
```
(`cargo-llvm-cov` must be installed via `cargo install cargo-llvm-cov`)

---

## 8. Specific Test Cases to Implement First

Ordered by risk/value:

### Priority 1 — `cache.rs` (currently untested, actively used in playback)

**File:** `compositor/src/cache.rs` (inline `#[cfg(test)]`)

```rust
// test_cache_insert_and_retrieve
// Insert a frame, assert get() returns it.

// test_cache_lru_evicts_oldest
// Insert frames A, B, C with budget for 2. Assert A is evicted, B and C remain.

// test_cache_memory_accounting_on_insert
// Insert 1080p frame, assert memory_usage() == 1920 * 1080 * 4.

// test_cache_memory_accounting_on_eviction
// Exceed budget, assert memory_usage() drops back below max.

// test_cache_overwrite_updates_memory
// Insert key K with frame F1, then insert K with F2 (different size).
// Assert memory_usage() reflects F2's size, not F1 + F2.

// test_cache_clear_resets_memory
// Fill cache, call clear(), assert len() == 0 and memory_usage() == 0.

// test_cache_set_max_memory_triggers_eviction
// Fill cache to 80% capacity, reduce max by 50%, assert items evicted.
```

### Priority 2 — `animated.rs` (untested, core to keyframe animation)

**File:** `compositor/tests/animated_layer.rs` (new integration test)

```rust
// test_animated_transform_from_static_preserves_values
// Build Transform with position (100, 200), scale 2.0, rotation 45.
// AnimatedTransform::from_static(&t), resolve_at(0.0).
// Assert resolved position == (100, 200), scale == (2, 2), rotation == 45.

// test_animated_layer_position_interpolates
// Add keyframes: x=0 at t=0, x=100 at t=1000.
// Resolve at t=500, assert x ≈ 50.

// test_animated_layer_opacity_interpolates
// Add keyframes: opacity=1.0 at t=0, opacity=0.0 at t=1000.
// Resolve at t=250, assert opacity ≈ 0.75.

// test_animated_layer_rotation_wraps
// Add keyframes: rotation=0 at t=0, rotation=360 at t=1000.
// Resolve at t=500, assert rotation ≈ 180.

// test_animated_layer_clamps_before_first_keyframe
// Add position_x keyframes starting at t=500.
// Resolve at t=0, assert value == keyframe[0] value.

// test_animated_layer_clamps_after_last_keyframe
// Add position_x keyframes ending at t=1000.
// Resolve at t=2000, assert value == last keyframe value.
```

### Priority 3 — `timeline.rs` boundary conditions

**File:** `compositor/tests/timeline_rendering.rs` (new)

```rust
// test_timeline_layer_active_at_start_boundary
// Layer start=500, end=2000. is_active_at(500) == true, is_active_at(499) == false.

// test_timeline_layer_inactive_at_end_boundary
// Layer start=0, end=1000. is_active_at(1000) == false, is_active_at(999) == true.

// test_timeline_layer_disabled_never_active
// enabled=false. is_active_at(500) == false even within bounds.

// test_timeline_render_frame_at_excludes_inactive_layer
// Add two layers: layer A from 0–1000ms (red), layer B from 1000–2000ms (blue).
// render_frame_at(500) should have red pixels but no blue.
// render_frame_at(1500) should have blue pixels but no red.

// test_timeline_frame_count_30fps_3s
// Timeline 3000ms, 30fps. frame_count() == 90.

// test_timeline_frame_count_non_integer
// Timeline 1001ms, 30fps. frame_count() == ceil(1001/1000 * 30) — verify no off-by-one.
```

### Priority 4 — `effects.rs` identity and edge cases

**File:** `compositor/src/effects.rs` (extend existing `#[cfg(test)]`)

```rust
// test_blur_zero_radius_is_identity
// Apply Blur { radius: 0.0 } to a known image. Assert output == input pixel values.

// test_linear_gradient_empty_stops_is_identity
// Apply LinearGradient { angle: 0.0, stops: vec![] }. Assert no pixel changed.

// test_saturation_minus_one_matches_grayscale
// Apply Saturation { amount: -1.0 } and Grayscale to same image.
// Assert pixel outputs are identical (within ±1 for rounding).

// test_chromatic_aberration_zero_is_identity
// Apply ChromaticAberration { intensity: 0.0 }. Assert no pixel shifted.

// test_color_matrix_full_red
// Matrix that zeroes G and B channels. Assert all result pixels have G==0, B==0.

// test_hue_rotate_360_is_identity
// Apply HueRotate { degrees: 360.0 }. Assert pixels unchanged (within ±2 for float round-trip).
```

### Priority 5 — `text.rs` basic rendering

**File:** `compositor/tests/text_rendering.rs` (new)

```rust
// test_text_layer_produces_non_empty_pixels
// Compositor 200x100 with a text layer "Hello". Assert at least one non-transparent pixel.

// test_text_layer_color_is_applied
// Text layer with Color::red(). Assert rendered pixels have R > G and R > B.

// test_larger_font_occupies_more_pixels
// Render same text at 12pt and 48pt. Assert 48pt has more opaque pixels.

// test_text_alignment_left_has_leftmost_pixels
// Left-aligned text in 400px-wide compositor. Assert opaque pixels appear in left half.
```

### Priority 6 — Missing CLI fixture

**Action (not a test, but required for existing tests to pass):**
Create `cli/tests/fixtures/multilayer.sue` — see §6 above. The e2e test `test_load_multilayer_project` at `cli/tests/e2e.rs:94` will panic with a missing file until this exists.

---

## 9. Benchmark Regression Guard

Use the existing infrastructure in `benchmark/`:

```bash
# Save baseline (run on main branch first)
cargo bench -p video-compositor -- --save-baseline main 2>/dev/null

# On a feature branch
bash packages/sui-video-renderer/benchmark/check-regression.sh
```

Acceptable regression threshold: **10%** for medium priority. Performance-sensitive paths (blend ops, parallel composition) should not regress more than 5%.

Key benchmarks to track:
- `simple_composition_3_layers_1080p` — baseline composition throughput
- `blend_modes/blend_mode_*` — per-blend-mode overhead
- `effects_pipeline/blur_radius_5` — Gaussian blur (most expensive effect)
- `parallel_composition/frames_100` — batch render scaling

---

## 10. Running the Full Test Suite

```bash
# From the package root
cd packages/sui-video-renderer

# All crates (excludes wasm-preview from native builds)
cargo test --workspace --exclude wasm-preview

# Only compositor
cargo test -p video-compositor

# Only CLI e2e
cargo test -p video-renderer-cli

# With coverage (requires cargo-llvm-cov)
cargo llvm-cov --package video-compositor --html --output-dir target/coverage

# WASM tests (requires wasm-pack and Chrome)
wasm-pack test --headless --chrome wasm-preview
```

### CI recommendation
Gate PRs on:
1. `cargo test --workspace --exclude wasm-preview` (all platforms)
2. `cargo bench -p video-compositor -- --save-baseline current` followed by regression check (Linux only, on dedicated runner for stable timing)
3. WASM test suite as a separate optional job

---

## 11. Known Anti-Patterns to Avoid

- **Do not assert exact float pixel values** across platform builds — use `±1` or `±2` tolerance for u8 channels that go through float round-trips (e.g., HSL conversions).
- **Do not use `sleep()` in tests** — all compositor operations are synchronous.
- **Do not write test output files to the workspace** — use `std::env::temp_dir()` as the existing integration tests do, and clean up in the test body.
- **Do not test blend mode "looks right"** — use known mathematical invariants (screen(black, X) == X, multiply(white, X) == X, difference(X, X) == black).
- **Do not import `wasm-bindgen` or `web-sys` in non-WASM tests** — the `compositor` crate conditionally compiles `video.rs` with `#[cfg(not(target_arch = "wasm32"))]`.
