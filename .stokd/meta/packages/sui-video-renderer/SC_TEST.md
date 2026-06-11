# SC_TEST: sui-video-renderer (`@stoked-ui/video-renderer-wasm` + `video-render` CLI)

> **Generated:** 2026-06-06 | **Meta version:** 0.4.0
> **Package:** `packages/sui-video-renderer` (Rust Cargo workspace, workspace version `0.1.0`, edition 2021)
> **Priority:** Medium
> **Build products:** WASM bundle in `pkg/` (consumed by `@stoked-ui/editor`) + native `video-render` CLI binary.
> See `.stokd/meta/packages/sui-video-renderer/SC_MODULE.md` for module classification and
> `packages/sui-video-renderer/.axioms.md` (`AX-MOD-VIDEO-RENDERER-001…007`) for the invariants this strategy protects.
>
> All test counts, file paths, function names, and toolchain facts below were **verified
> against the working tree on the generated date** by running the suite (see §2). This is
> a Rust workspace — it is **exempt** from the JS/Mocha umbrella runner and the
> `AX-REPO-PNPM-MONOREPO` / `AX-REPO-PACKAGE-BARREL` axioms (see `SC_MODULE.md` §intro).

`sui-video-renderer` is **not** a publishable npm package. It is a three-crate Cargo
workspace (`Cargo.toml` members: `compositor`, `wasm-preview`, `cli`):

| Crate | Path | Type | Role | Tested by |
|---|---|---|---|---|
| `video-compositor` | `compositor/` | `rlib` | Pure-Rust composition engine (blend, transform, effects, text, keyframe, timeline, cache). The single source of truth (`AX-MOD-VIDEO-RENDERER-001`). | `cargo test` (native) |
| `wasm-preview` | `wasm-preview/` | `cdylib` + `rlib` | `wasm-bindgen` glue (`PreviewRenderer`, `WasmLayer` JSON shape, `BrowserMediaLoader`). | `wasm-pack test --headless` |
| `video-renderer-cli` | `cli/` | `bin` (`video-render`) | Loads `.sue`, drives the compositor frame-by-frame, shells out to the FFmpeg binary. | `cargo test` (native) |

This package is **already well-tested** (333 passing native tests + 12 browser tests).
This strategy is therefore a **maintenance + gap-closing** plan, not a green-field one.
The pure-CPU composition math is thoroughly covered; the remaining risk is concentrated
in I/O-adjacent CLI code (`render.rs`, FFmpeg encode/audio) and the untyped
editor⇄WASM contract.

---

## 1. Framework & Tooling — use the Rust built-in harness (no extra framework)

> **Do not introduce Jest/Mocha/Vitest here.** This is a Rust workspace. The JS umbrella
> runner globs `packages/**/*.test.{js,ts,tsx}` — it never touches `.rs` files. All tests
> run under `cargo test` / `wasm-pack test`. The package is wired into the root
> `package.json` only as thin script aliases (verified):
>
> | Script | Command |
> |---|---|
> | `pnpm video-renderer:test` | `cd packages/sui-video-renderer && cargo test --workspace` |
> | `pnpm video-renderer:build` | `cargo build --release` |
> | `pnpm video-renderer:bench` | `cargo bench` |
> | `pnpm build:wasm` | `./scripts/build-wasm.sh` (canonical WASM build) |
> | `pnpm video-renderer:build-wasm` | `wasm-pack build --target web --out-dir ../pkg` (quick) |

- **Unit + integration:** Rust built-in test harness via `cargo test`. No assertion
  library needed for logic; `approx` (`compositor/[dev-dependencies]`) is available for
  float comparisons.
- **WASM:** `wasm-bindgen-test = "0.3"` (already in `wasm-preview/Cargo.toml`, dev-dep),
  run in a real headless browser via `wasm-pack test --headless --chrome`.
  `browser_integration.rs` is gated `#![cfg(target_arch = "wasm32")]` with
  `wasm_bindgen_test_configure!(run_in_browser)`.
- **Benchmarks:** Criterion (`criterion = "0.5"` dev-dep), registered as the
  `frame_composition` bench (`harness = false`) in `compositor/Cargo.toml`. Regression
  tooling lives in `benchmark/check-regression.sh` + `benchmark/baseline.json.example`.
- **Temp files:** `tempfile = "3.13"` (already a `cli` dev-dep) — never write test output
  into the workspace tree.
- **Coverage (recommended addition):** `cargo-llvm-cov`
  (`cargo install cargo-llvm-cov`; `cargo llvm-cov -p video-compositor --html`).
- **Pixel-snapshot regression (recommended addition):** `insta` with the `png` feature —
  see §7 Priority 2.

**Toolchain present on this machine (verified 2026-06-06):** `cargo 1.93.0`,
`wasm-pack 0.14.0`, `ffmpeg 8.0.1` (`/opt/homebrew/bin/ffmpeg`). FFmpeg-gated tests
**will** exercise real encoding here; on CI runners without FFmpeg they self-skip
(see §5).

---

## 2. What Is Verified Today (`cargo test --workspace --exclude wasm-preview`, 2026-06-06)

**Result: 333 passed; 0 failed; 0 ignored.** Full breakdown:

| Test binary | Source | Passed |
|---|---|---:|
| `video_compositor` unittests | all inline `#[cfg(test)]` mods in `compositor/src/*.rs` | **153** |
| `tests/blend_accuracy.rs` | all 18 blend modes vs. known pixel pairs + end-to-end | 40 |
| `tests/effects_integration.rs` | shadow + linear gradient on real images | 8 |
| `tests/effects_validation.rs` | blur / brightness / contrast / opacity / gradient | 45 |
| `tests/transform_correctness.rs` | rotation/scale/non-uniform/combined transforms | 31 |
| `video_render` unittests | all inline mods in `cli/src/*.rs` | **25** |
| `tests/e2e.rs` | `.sue` load → `to_timeline` → render; save/reload; error paths | 21 |
| Doc-tests `video_compositor` | rustdoc examples in `compositor/src/*.rs` | 10 |

> **`e2e.rs` runs 21 though the file declares 17 `#[test]`s.** It pulls `cli/src/project.rs`
> in with `#[path = "../src/project.rs"] mod project;` (`cli/tests/e2e.rs:11`), and an
> integration crate compiles with `cfg(test)` active, so `project.rs`'s 4 inline tests run
> inside the `e2e` binary too (17 + 4 = 21). Don't double-count them against `project.rs`.

> **`video_compositor` unittests = 153** is the count built with the **workspace-unified
> feature set** (the `cli` crate enables `native` on `video-compositor`, so `rayon`/`tokio`
> paths compile; `native-video` is **not** enabled). The FFmpeg-backed
> `compositor/src/video.rs` decode tests are gated behind `feature = "native-video"` and
> are **not** in this run — see §3.5 / §7 Priority 6.

### Inline `#[test]` counts per source file (for locating coverage)

| File | inline tests | File | inline tests |
|---|---:|---|---:|
| `compositor/src/cache.rs` | 39 | `compositor/src/compositor.rs` | 37 |
| `compositor/src/blend.rs` | 15 | `compositor/src/keyframe.rs` | 12 |
| `compositor/src/timeline.rs` | 12 | `compositor/src/effects.rs` | 10 |
| `compositor/src/animated.rs` | 9 | `compositor/src/text.rs` | 6 |
| `compositor/src/transform.rs` | 5 | `compositor/src/video.rs` | 3 *(native-video only)* |
| `compositor/src/{frame,types,layer}.rs` | 2 each | `compositor/src/lib.rs` | 0 |
| `cli/src/audio.rs` | 9 | `cli/src/ffmpeg.rs` | 7 |
| `cli/src/project.rs` | 4 | `cli/src/encoder.rs` | 3 |
| `cli/src/main.rs` | 2 | **`cli/src/render.rs`** | **0** ⚠ |
| `wasm-preview/src/video.rs` | 4 *(wasm32)* | `wasm-preview/src/lib.rs` | 0 |

### Browser tests (run separately via `wasm-pack`, not in the native total)

`wasm-preview/tests/browser_integration.rs` — **12** `#[wasm_bindgen_test]`s covering
`PreviewRenderer::new`, solid-color render with pixel read-back, `render_frame_at_time`,
`clear()`, unknown-layer-type skip, 100-frame stability loop, malformed-JSON `Err`,
image-cache lifecycle (`cache_image`/`is_image_cached`/`clear_image_cache`), cached-image
layer render, z-ordering, and the `Color` type. Run:
`wasm-pack test --headless --chrome packages/sui-video-renderer/wasm-preview`.

---

## 3. What Should Be Tested (critical paths, edge cases, contracts)

### 3.1 `compositor` — pure math (already strong; keep it strong)

The composition engine is the product's core and has no global state — fully
deterministic, no mocks. Covered today and worth **protecting against regression**:

- **Dimension validation** (`AX-MOD-VIDEO-RENDERER-007`): `Compositor::new(0, h)` /
  `(w, 0)` → `Error::InvalidDimensions` (`test_invalid_dimensions`).
- **Z-order + alpha:** `compose` renders only `visible` layers, ascending `z_index`
  (bottom→top), opacity → transform → blend; output is **exactly** `width × height`
  regardless of transforms.
- **Path equivalence:** `compose_tiled` is pixel-identical to `compose`;
  `compose_with_resolution_scale` differs only by resampling
  (`test_tiled_vs_standard_composition`, `test_compose_with_*_resolution_scale`).
- **Blend invariants (not "looks right"):** `Screen(black, X) == X`,
  `Multiply(white, X) == X`, `Difference(X, X) == black`, `Add` saturates, `Normal`
  over-compositing. HSL-family modes (`Hue`/`Saturation`/`Color`/`Luminosity`) compare
  with `±1`–`±2` u8 tolerance (round-trip through f32).
- **Keyframe/easing:** monotonicity of `EaseInOut`/`CubicBezier`, boundary clamping
  (t<0, t>1), `StepPosition`/hold, `Interpolate` for `Point`/`Color`.
- **Cache:** LRU eviction order, byte-accurate memory accounting, `Prefetcher`,
  `ScrubbingDetector`, `PlaybackDirection`.

### 3.2 `cli/src/render.rs` — the biggest real gap (0 inline tests) ⚠

`RenderCommand::execute()` (`render.rs:30`) is the orchestrator: load `.sue` → resolve
resolution/fps → `to_timeline` → **sequential** `for frame_idx in 0..total_frames`
render loop → encode → optional audio mux. Risk worth covering:

- **FPS-override quirk** (`render.rs:43`):
  `if self.fps == 30.0 && project.fps != 0.0 { project.fps } else { self.fps }`. A user
  who explicitly passes `--fps 30` gets the project's fps instead — a real edge that
  should be pinned by a test. **Extract this into a free `fn resolve_fps(arg_fps, project_fps) -> f64`
  so it is unit-testable** (currently inline, untestable without a refactor).
- **Audio branch selection** (`render.rs:149`): with ≥1 `TrackType::Audio` track, output
  is encoded to `{output}.tmp.mp4`, audio mixed to `{output}.tmp.wav`, then muxed and the
  temps removed. Without audio it encodes straight to `self.output`. Pin the temp-path
  naming and the cleanup.
- **Empty-frame guard** (`encode_video`, `render.rs:217`): `frames.is_empty()` →
  `bail!("No frames to encode")`.
- **End-to-end (FFmpeg-gated):** run `RenderCommand::execute()` over
  `cli/tests/fixtures/simple.sue` to a tempfile, assert the `.mp4` exists, is non-empty,
  and (via `ffprobe`) has `frame_count / fps` ≈ duration. Skip when FFmpeg is absent.

> **Correction to prior revisions of this doc:** the render loop is **sequential**, not
> "parallel via rayon", and `RenderCommand` has **no `threads` field**. The worker-thread
> resolution `if args.threads == 0 { num_cpus::get() }` lives **inline in `main.rs::main`**
> (`cli/src/main.rs:153`) and configures the global rayon pool; the parallelism it feeds is
> *inside the compositor's* `native` blend path, not the CLI frame loop. The only testable
> seam in `main.rs` is `parse_resolution` — already covered by `test_parse_resolution_valid`
> / `_invalid` (`main.rs:220`). Do **not** write a `RenderCommand { threads: 0 }` test; it
> won't compile.

### 3.3 `cli` encode / FFmpeg / audio argument shaping (covered; extend to real output)

- `encoder.rs` (3 inline): `EncoderConfig` defaults (`threads: 0` auto),
  `with_threads(8)`. **Gap:** no test asserts a real encoded artifact.
- `ffmpeg.rs` (7 inline): argument vector shaping (`-threads` present when `threads > 0`,
  codec/format/quality flags) **without invoking the binary** — keep this pattern.
- `audio.rs` (9 inline): mix arithmetic. **Gap:** no fixture-based mix of real WAVs.

### 3.4 `cli/src/project.rs` — `.sue` model (covered via `e2e.rs`)

`Project::from_file` / `to_timeline` / `save` / `print_info`, `TrackType`
(`video|image|audio|text|solidcolor`), `TrackAction` (FadeIn/FadeOut/Move/Scale/Rotate),
`TrackTransform` defaults+conversion. **Contract note (`AX-MOD-VIDEO-RENDERER-006`):**
`video` and `text` tracks are currently rejected by `to_timeline` (`bail!`). When that
changes, add fixtures and update `cli/tests/fixtures/*.sue` + `docs/cli-guide.md` in the
same change.

### 3.5 `compositor/src/video.rs` — native FFmpeg decode (gated, not in default CI)

Frame extraction is `#[cfg(not(target_arch = "wasm32"))]` and needs the `native-video`
feature (`ffmpeg-next`). The `cli` crate enables only `native`, so this path is **not
built** in `cargo test --workspace`. Its 3 inline tests run only under
`cargo test -p video-compositor --features native-video` **and** with FFmpeg present —
call this out explicitly when validating, and never assume it ran.

### 3.6 `wasm-preview` — the editor⇄WASM contract (browser-only)

Two untyped, runtime contracts with `@stoked-ui/editor` that have **no compile-time
guard** — a drift here silently mis-renders with no error:

- **`WasmLayer` JSON shape** (`AX-MOD-VIDEO-RENDERER-003`): fields
  (`id`, `type`, `color`, `video_element_id`, `image_url`,
  `transform{x,y,scale_x,scale_y,rotation,opacity}`, `blend_mode`, `visible`, `z_index`),
  the `type` strings (`solidColor|image|video|text`), and the camelCase `blend_mode`
  strings mapped in `convert_layer` (`lib.rs:241`). Must mirror
  `packages/sui-editor/src/WasmPreview/{actionMapper.ts,types.ts,wasm-module.d.ts}`.
- **`PreviewRenderer` method surface** (`AX-MOD-VIDEO-RENDERER-004`): `new`,
  `render_frame`, `render_frame_at_time`, `clear`, `get_metrics`, `cache_image`,
  `clear_image_cache`, `is_image_cached`, the `Color` class, `benchmark_composition`.

Behaviors to keep covered in `browser_integration.rs` (most already are):
malformed/truncated/wrong-shape JSON → `Err` (no panic across the JS boundary); unknown
layer type → `Ok` with the layer skipped (`convert_layer` returns `None`); empty array →
`Ok`; invisible layers dropped; image-cache lifecycle; `get_metrics().cached_images`
tracking; pixel read-back proving a solid color actually painted.

### Edge cases to call out explicitly

- Zero dimensions (`Compositor::new`, `parse_resolution`).
- `opacity` clamping outside `[0,1]`; rotation at 0/90/180/270/360/45/negative.
- Empty project / empty layer set → valid transparent `width × height` frame
  (`test_empty_project`).
- `--fps 30` colliding with the project-fps override (§3.2).
- Frame-render determinism: same frame index renders byte-identical output
  (`test_frame_rendering_consistency`).
- FFmpeg absent → CLI integration tests self-skip, not fail.
- u8 channels that round-trip through f32 → tolerance asserts, never exact equality.

### Out of scope

- Mocking the FFmpeg binary (skip via `ffmpeg_available()` instead — §5).
- `BrowserMediaLoader::capture_video_frame` with real decoded `<video>` frames (no
  seekable media in the headless harness) — verify manually on the docs site
  (`localhost:5199`, `WasmPreviewDemo`).
- The editor-side `actionMapper.ts` / `useWasmRenderer` logic (tested under
  `@stoked-ui/editor`, the consuming package).
- The WASM build/bundle pipeline (`scripts/build-wasm.sh`, `pkg/`) — validated by
  `AX-MOD-VIDEO-RENDERER-005` acceptance checks, not unit tests.

---

## 4. Test File Organization & Naming

The existing layout is idiomatic Rust and correct — keep it:

```
compositor/
  src/<module>.rs              inline #[cfg(test)] mod tests   (pure math, white-box)
  tests/<aspect>_<scope>.rs    integration tests via the PUBLIC API only
  benches/frame_composition.rs Criterion bench (harness = false)
  examples/<demo>.rs           runnable demos (double as smoke tests)
cli/
  src/<module>.rs              inline #[cfg(test)] mod tests
  tests/e2e.rs                 cross-module integration (#[path] pulls in project.rs)
  tests/fixtures/*.sue         JSON fixtures under VCS (+ test_image.png)
wasm-preview/
  src/<module>.rs              inline tests (compile/run under wasm32 only)
  tests/browser_integration.rs #[wasm_bindgen_test], #![cfg(target_arch="wasm32")]
```

**Conventions (already established — follow them):**

- Test fns: `test_<thing>_<scenario>` (`test_normal_blend_opaque_over_opaque`,
  `test_load_simple_project`, `test_render_frame_rejects_malformed_json`).
- Group inline tests in behaviour-named modules (`mod blend_mode_tests`,
  `mod eviction_tests`).
- Integration files named `<component>_<aspect>.rs`
  (`blend_accuracy.rs`, `transform_correctness.rs`, `effects_validation.rs`).
- Helpers live at the top of the test file:
  `fn fixture_path(name)` (`cli/tests/e2e.rs:26`),
  `fn ffmpeg_available()` (`cli/tests/e2e.rs:17`),
  `fn create_test_canvas()` (`browser_integration.rs:18`).
- **New integration suites should test the public re-exported surface only**
  (`compositor/src/lib.rs`) — that is the contract both adapters compile against
  (`AX-MOD-VIDEO-RENDERER-001`). Reach into private internals from inline tests, not
  integration tests.

---

## 5. Mock / Stub Strategy — prefer real inputs; skip what you can't run

| Dependency | Strategy |
|---|---|
| **Compositor inputs** | **No mocks.** Build `image::RgbaImage` directly and assert pixel bytes. Helper: `fn solid_image(w,h,[r,g,b,a]) -> RgbaImage`. The engine is pure and stateless. |
| **`.sue` projects** | **Fixtures over mocks.** Keep JSON in `cli/tests/fixtures/`; load via `fixture_path()`. For ad-hoc cases, write JSON into a `tempfile::NamedTempFile` (see `test_malformed_project_json`, `test_empty_project`). |
| **Temp output** | `tempfile::NamedTempFile` / `std::env::temp_dir()`. **Never** write into the workspace. |
| **FFmpeg binary** | **Skip, do not mock.** Guard every FFmpeg-dependent test with `if !ffmpeg_available() { return; }` (`e2e.rs:17`). Mocking FFmpeg yields tests that pass while exercising nothing. State in the validation record whether FFmpeg was present. |
| **`ffprobe`** | Same skip-guard; use it to assert duration/frame-count of real encoded output. |
| **WASM DOM (`HtmlCanvasElement`/`HtmlVideoElement`)** | **No mocks** — create real DOM nodes via `web_sys::window().document()` inside `#[wasm_bindgen_test]` (`create_test_canvas`). There is no usable `web_sys` mock. |
| **`compositor/src/video.rs` decode** | Generate a tiny fixture MP4 with `ffmpeg lavfi` at test time; gate on `feature = "native-video"` **and** `ffmpeg_available()`. |

---

## 6. Coverage Targets (Medium priority)

Measure compositor coverage with `cargo llvm-cov -p video-compositor`. The math layer is
cheap and high-value; CLI is capped by the FFmpeg dependency; WASM needs a browser and is
a separate gate.

| Crate / module | Target line cov | Rationale |
|---|---:|---|
| `video-compositor` (overall) | **80%** | Core product logic; mostly there already |
| `compositor/src/blend.rs` | 90% | Ships into every render; math must be exact |
| `compositor/src/transform.rs` | 85% | Geometric math; builder must be exhaustive |
| `compositor/src/keyframe.rs` | 85% | Easing is painful to debug after the fact |
| `compositor/src/cache.rs` | 80% | LRU/accounting bugs silently break scrubbing |
| `compositor/src/effects.rs` | 75% | Many enum branches; a few visual-only paths excluded |
| `compositor/src/compositor.rs` | 75% | Buffer pool + tile + scaled paths |
| `compositor/src/{animated,timeline}.rs` | 75% | Resolution + temporal gating |
| `compositor/src/text.rs` | 60% | Glyph rasterization is hard to pixel-assert |
| `cli` (overall) | **60%** | FFmpeg dependency limits unit testability |
| `cli/src/render.rs` | **40% → 60%** | Currently **0%**; §7 Priority 1 raises the floor |
| `wasm-preview` | **30%** | Headless-Chrome gate; treat separately |
| `compositor/src/video.rs` | excluded from the default gate | Requires `native-video` + FFmpeg |

These are **review bars, not a build gate** — there is no `llvm-cov` threshold wired into
CI today. Track them in PR review until a gate is added.

---

## 7. Specific Tests to Implement First

Ordered by risk × value. Per **AXIOM 5 (TDD)**: write each test, observe it **red**, then
implement/verify **green**; for pinning existing behavior the cycle is "test reproduces
the documented behavior, and fails if the code regresses." **Record the red→green outcome
per behavioral criterion** (`~/.stokd/SC_AXIOMS.md` §5.3). Refactors that extract a
testable function (Priority 1) are real behavior-preserving changes — write the test first.

### Priority 1 — `cli/src/render.rs` (0% today; highest gap)

1. **Refactor + test `resolve_fps`.** Extract `render.rs:43`'s inline fps logic into
   `fn resolve_fps(arg_fps: f64, project_fps: f64) -> f64`. Tests:
   `resolve_fps(30.0, 60.0) == 60.0` (the surprising override), `resolve_fps(24.0, 60.0) == 24.0`,
   `resolve_fps(30.0, 0.0) == 30.0`.
2. `test_encode_video_rejects_empty_frames` — `encode_video(&[], …)` → `Err("No frames to encode")`.
3. `test_render_command_end_to_end_mp4` *(FFmpeg-gated)* — `RenderCommand::execute()` over
   `fixtures/simple.sue` to a tempfile; assert the `.mp4` exists, is non-empty, and
   `ffprobe` reports ≈ `frame_count / fps` seconds.

### Priority 2 — `compositor/tests/snapshot.rs` (new pixel-regression gate)

Add `insta = { version = "1", features = ["png"] }` to `compositor/[dev-dependencies]`.
Use `insta::assert_binary_snapshot!` on the encoded PNG bytes of a fixed scene.

4. `test_snapshot_two_solid_layers_normal` — 64×64, red bottom + blue@0.5 top.
5. `test_snapshot_blend_mode_multiply` — same scene, `BlendMode::Multiply`.
6. `test_snapshot_effect_blur_radius_3` — solid square + `Effect::Blur { radius: 3.0 }`.

These become the drift guard for `compositor/src/{blend,effects,compositor}.rs`.

### Priority 3 — `cli/tests/encoder_output.rs` (new, FFmpeg-gated)

7. `test_encoder_writes_mp4` — render 3×64×64 frames, encode to tempdir, assert the
   artifact is non-empty and `ffprobe`-decodable.

### Priority 4 — `cli/tests/audio_mix.rs` (new, FFmpeg-gated)

8. `test_audio_mix_two_sources` — generate two short sine WAVs via `ffmpeg lavfi`, mix via
   `AudioMixer`, assert the output exists, duration == longest input, and decodes.

### Priority 5 — `wasm-preview/tests/browser_integration.rs` (extend the existing 12)

9. `test_render_frame_blend_mode_string_mapping` — feed a `solidColor` layer with
   `"blend_mode":"multiply"` and a second with an unknown string; assert no panic and that
   the unknown maps to `Normal` (guards the `AX-MOD-VIDEO-RENDERER-003` blend-mode table).
10. `test_video_layer_missing_element_id_skips` — a `"video"` layer with no
    `video_element_id` → `Ok`, layer skipped (matches `convert_layer`'s error→`None`).

### Priority 6 — `compositor/tests/video_decode.rs` (new, native-video + FFmpeg-gated)

```rust
#![cfg(all(not(target_arch = "wasm32"), feature = "native-video"))]
```
11. `test_video_decoder_extracts_first_frame` — generate a 16×16 1s MP4
    (`ffmpeg lavfi color=red`), decode the first frame, assert `16×16` and a red sample
    pixel. Document that this needs `cargo test -p video-compositor --features native-video`.

---

## 8. Cross-Package Contract Validation (tie tests to the axioms)

These are **not** caught by `cargo test` alone — they need a paired check in the consuming
package. Run them whenever `wasm-preview/src/lib.rs` or the `.sue` model changes:

| Contract | Axiom | Validation |
|---|---|---|
| Compositor public surface (`compositor/src/lib.rs`) | `AX-MOD-VIDEO-RENDERER-001` | `cargo test --workspace` + `cargo build --workspace` (both adapters compile against it) |
| WASM default build stays `wasm32`-safe (no rayon/tokio/ffmpeg/`std::fs` in default features) | `AX-MOD-VIDEO-RENDERER-002` | `cargo build -p video-compositor` (default) + `wasm-pack build --target web` succeed |
| `WasmLayer` JSON shape / `type` / `blend_mode` strings | `AX-MOD-VIDEO-RENDERER-003` | `cargo test -p wasm-preview` (browser) **and** `pnpm --filter @stoked-ui/editor typescript`; grep `packages/sui-editor/src/WasmPreview/{actionMapper.ts,types.ts}` for each changed string |
| `PreviewRenderer` method surface | `AX-MOD-VIDEO-RENDERER-004` | rebuild `pkg/` (regenerates `pkg/wasm_preview.d.ts`) + `pnpm --filter @stoked-ui/editor typescript`; update `wasm-module.d.ts` |
| Editor consumes `pkg/` via the alias | `AX-MOD-VIDEO-RENDERER-005` | `pnpm build:wasm` → `pkg/wasm_preview_bg.wasm` + `pkg/package.json` named `@stoked-ui/video-renderer-wasm`; `grep video-renderer-wasm docs/next.config.mjs`; editor preview loads with no missing-module console error |
| CLI subcommands / `.sue` model / FFmpeg dep | `AX-MOD-VIDEO-RENDERER-006` | `cargo test -p video-renderer-cli`; `cargo run -p video-renderer-cli -- info --input cli/tests/fixtures/simple.sue`; update `docs/cli-guide.md` + fixtures on schema change |
| Compositor invariants (dims, z-order, alpha, path equivalence) | `AX-MOD-VIDEO-RENDERER-007` | `cargo test -p video-compositor compositor::` (incl. `test_invalid_dimensions`, `test_tiled_vs_standard_composition`) |

---

## 9. Benchmark Regression Guard

Use the existing `benchmark/` infrastructure (Criterion + `check-regression.sh`):

```bash
# On main, capture a baseline
cargo bench -p video-compositor -- --save-baseline main
# On a PR branch
bash packages/sui-video-renderer/benchmark/check-regression.sh
```

**Acceptable regression (medium priority):** 10% overall; **hot paths ≤ 5%**
(`blend.rs`, the `native` parallel compose in `compositor.rs`, `Effect::Blur`). Watch:
`simple_composition_3_layers_1080p`, `blend_modes/blend_mode_*`,
`effects_pipeline/blur_radius_*`, multi-layer (1–50) scaling. Run benches on a dedicated
runner — shared CI timing is too noisy to gate on.

---

## 10. Running the Suite & CI Gating

From `packages/sui-video-renderer/`:

```bash
# Native — workspace minus the WASM crate (the standard gate). 333 tests, ~exits in seconds incrementally.
cargo test --workspace --exclude wasm-preview

# Or via the root alias (runs the full workspace; wasm-preview unit build is skipped on native targets)
pnpm video-renderer:test

cargo test -p video-compositor                 # compositor only
cargo test -p video-renderer-cli               # CLI unit + e2e
cargo test -p video-compositor --features native-video   # + FFmpeg decode (needs ffmpeg)
wasm-pack test --headless --chrome wasm-preview          # 12 browser tests
cargo bench -p video-compositor                          # Criterion
cargo llvm-cov -p video-compositor --html                # coverage report
```

**Recommended CI gating:**

1. `cargo test --workspace --exclude wasm-preview` — all platforms, **blocking**.
2. `cargo bench -p video-compositor` + `check-regression.sh` — dedicated runner, blocking
   on the hot-path budget in §9.
3. `wasm-pack test --headless --chrome wasm-preview` — Linux + Chromium, **non-blocking**
   initially while the headless harness stabilizes, then promote to blocking (it guards
   `AX-MOD-VIDEO-RENDERER-003/004`).
4. `cargo test -p video-compositor --features native-video` — **only** on runners with
   FFmpeg; otherwise omit (don't let a missing binary red the build).

> **Always `--exclude wasm-preview` from native `cargo test`.** It depends on `web-sys`,
> which only compiles for `wasm32`; a native `cargo test -p wasm-preview` will fail to
> build.

---

## 11. Anti-Patterns / Gotchas (carry into every test)

- **`render.rs` is sequential and has no `threads` field.** The `num_cpus`/rayon setup is
  inline in `main.rs::main` and feeds the *compositor's* parallel blend, not the CLI loop.
  Don't write a `RenderCommand { threads }` test — it won't compile (see §3.2).
- **No exact float pixel asserts after HSL conversions.** Use `±1`/`±2` u8 tolerance for
  `Hue`/`Saturation`/`Color`/`Luminosity` (and `approx` for f32).
- **Blend modes get invariants, not eyeballs:** `Screen(black,X)==X`,
  `Multiply(white,X)==X`, `Difference(X,X)==black`.
- **No `sleep()` in tests** — all compositor ops are synchronous.
- **No test writes inside the workspace** — `tempfile` only.
- **Never mock FFmpeg** — `ffmpeg_available()` skip-guard; report whether it ran.
- **`compositor/src/video.rs` is invisible to the default test run** — it needs
  `--features native-video`. Saying "compositor tests pass" does **not** cover decode.
- **`wasm-preview` cannot be `cargo test`'d natively** — `--exclude` it; use `wasm-pack`.
- **`e2e.rs` reports +4 tests from `project.rs`** via the `#[path]` include — don't be
  surprised by the count, and don't add a duplicate `project.rs` integration suite.
- **The editor⇄WASM contract has no compiler** — a `WasmLayer` field/string rename
  compiles clean and silently drops layers. Always pair the Rust change with the
  `@stoked-ui/editor` grep + `tsc` from §8.
- **Rebuild `pkg/` after any Rust change the editor must see** (`pnpm build:wasm`); a stale
  `pkg/` makes a green `cargo test` lie about what the browser runs
  (`AX-MOD-VIDEO-RENDERER-005`).
