# sui-video-renderer Implementation Plan

## Overview

High-performance Rust/WASM video compositor for the Stoked UI Editor, providing real-time preview rendering in the browser and server-side video export capabilities.

**Goal**: Replace JavaScript canvas rendering with native-speed WASM composition, achieving 60 FPS preview at 1080p with complex multi-layer compositions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         sui-video-renderer                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   compositor    │  │  wasm-preview   │  │      cli        │         │
│  │   (Rust lib)    │  │  (WASM module)  │  │  (Native tool)  │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           └────────────────────┼────────────────────┘                   │
│                                │                                        │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          sui-editor                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  EditorEngine   │  │   EditorView    │  │  WasmPreview    │         │
│  │  (Playback)     │  │   (Canvas)      │  │  (Integration)  │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           └────────────────────┴────────────────────┘                   │
│                                │                                        │
│                                ▼                                        │
│                    ┌─────────────────────┐                              │
│                    │   Timeline/Tracks   │                              │
│                    │   (sui-timeline)    │                              │
│                    └─────────────────────┘                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Core Compositor Completion (Week 1-2)

### 1.1 Complete Transform Operations

**File**: `compositor/src/transform.rs`

- [ ] **Implement rotation** - Currently skipped in POC
  - Use `imageproc::geometric_transformations::rotate_about_center`
  - Handle rotation with proper anti-aliasing
  - Optimize for common angles (90, 180, 270 degrees)

- [ ] **Add anchor point support**
  - Transform origin for scale/rotate operations
  - Support percentage and pixel values
  - Default to center (0.5, 0.5)

- [ ] **Implement skew/shear transforms**
  - Horizontal and vertical skew
  - Matrix-based transformation

```rust
pub struct Transform {
    pub position: Point,
    pub scale: Point,
    pub rotation: f32,      // degrees
    pub anchor: Point,      // 0.0-1.0 relative to layer bounds
    pub skew: Point,        // horizontal/vertical skew
    pub opacity: f32,
}
```

### 1.2 Text Rendering

**File**: `compositor/src/text.rs` (new)

- [ ] **Integrate font rendering**
  - Add `rusttype` or `fontdue` for glyph rendering
  - Support TrueType/OpenType fonts
  - Implement font caching for performance

- [ ] **Text layer support**
  - Font family, size, weight, style
  - Text alignment (left, center, right, justify)
  - Line height and letter spacing
  - Text wrapping and overflow handling

- [ ] **Rich text features**
  - Multiple styles within single text block
  - Text stroke/outline
  - Drop shadow on text

```rust
pub struct TextStyle {
    pub font_family: String,
    pub font_size: f32,
    pub font_weight: u16,
    pub color: Color,
    pub alignment: TextAlignment,
    pub line_height: f32,
    pub letter_spacing: f32,
    pub stroke: Option<Stroke>,
    pub shadow: Option<Shadow>,
}
```

### 1.3 Additional Blend Modes

**File**: `compositor/src/blend.rs`

- [ ] **Photoshop-compatible modes**
  - SoftLight, HardLight
  - ColorDodge, ColorBurn
  - Difference, Exclusion
  - Hue, Saturation, Color, Luminosity

- [ ] **Optimize blend operations**
  - SIMD acceleration where available
  - Pre-multiply alpha for faster blending
  - Lookup tables for common operations

### 1.4 Enhanced Effects

**File**: `compositor/src/effects.rs`

- [ ] **Complete shadow implementation**
  - Render shadow as separate layer
  - Blur shadow with configurable radius
  - Support inner and outer shadows

- [ ] **Add gradient support**
  - Linear gradients with multiple stops
  - Radial gradients
  - Angle/position configuration

- [ ] **Additional filters**
  - Invert colors
  - Grayscale conversion
  - Sepia tone
  - Color matrix transformations

- [ ] **Chromatic aberration**
  - RGB channel offset
  - Configurable intensity

---

## Phase 2: Video Frame Support (Week 2-3)

### 2.1 Video Frame Extraction

**File**: `compositor/src/video.rs` (new)

- [ ] **FFmpeg integration for native builds**
  - Use `ffmpeg-next` crate for frame extraction
  - Decode video at specific timestamps
  - Handle various codecs (H.264, H.265, VP9, AV1)

- [ ] **Frame caching system**
  - LRU cache for decoded frames
  - Configurable cache size
  - Background prefetching for smooth playback

```rust
pub struct VideoSource {
    path: PathBuf,
    decoder: VideoDecoder,
    cache: LruCache<u64, Frame>,  // timestamp -> frame
    fps: f32,
    duration: f32,
}

impl VideoSource {
    pub fn get_frame(&mut self, timestamp_ms: u64) -> Result<&Frame>;
    pub fn prefetch(&mut self, start_ms: u64, end_ms: u64);
}
```

### 2.2 Browser Video Integration (WASM)

**File**: `wasm-preview/src/video.rs` (new)

- [ ] **HTMLVideoElement frame capture**
  - Use `OffscreenCanvas` for video frame extraction
  - `drawImage` from video to canvas
  - Handle video seek and timing

- [ ] **WebCodecs API integration** (future)
  - Direct frame access without canvas round-trip
  - Hardware-accelerated decoding

### 2.3 Image Layer Enhancements

**File**: `compositor/src/layer.rs`

- [ ] **URL-based image loading in WASM**
  - Fetch API for remote images
  - Image decoding in WASM
  - Caching fetched images

- [ ] **Image format support**
  - JPEG, PNG, WebP, GIF (first frame)
  - SVG via `resvg` (already in deps)

---

## Phase 3: Animation & Keyframes (Week 3-4)

### 3.1 Keyframe System

**File**: `compositor/src/keyframe.rs` (new)

- [ ] **Keyframe data structure**
  - Time-value pairs
  - Support all animatable properties
  - Multiple easing functions

- [ ] **Interpolation engine**
  - Linear interpolation
  - Bezier curve easing
  - Step/hold keyframes
  - Spring physics (optional)

```rust
pub struct Keyframe<T> {
    pub time: f32,          // milliseconds
    pub value: T,
    pub easing: EasingFunction,
}

pub enum EasingFunction {
    Linear,
    EaseIn,
    EaseOut,
    EaseInOut,
    CubicBezier(f32, f32, f32, f32),
    Steps(u32, StepPosition),
}

pub struct AnimatedProperty<T> {
    keyframes: Vec<Keyframe<T>>,
}

impl<T: Interpolate> AnimatedProperty<T> {
    pub fn value_at(&self, time: f32) -> T;
}
```

### 3.2 Property Animation Support

- [ ] **Animatable transform properties**
  - Position (x, y)
  - Scale (x, y)
  - Rotation
  - Opacity
  - Anchor point

- [ ] **Animatable effect properties**
  - Blur radius
  - Shadow offset/blur
  - Color adjustments
  - Gradient positions

### 3.3 Timeline Integration

- [ ] **Action-to-layer mapping**
  - Convert EditorAction to compositor Layer
  - Map action timing to keyframes
  - Handle action enable/disable

---

## Phase 4: WASM Build & Integration (Week 4-5)

### 4.1 WASM Build Pipeline

**Files**: `wasm-preview/Cargo.toml`, build scripts

- [ ] **wasm-pack configuration**
  - Target: `web` (ES modules)
  - Optimize for size: `wasm-opt -O3`
  - Generate TypeScript definitions

- [ ] **Build script for monorepo**
  ```bash
  # packages/sui-video-renderer/build-wasm.sh
  cd wasm-preview
  wasm-pack build --target web --out-dir ../pkg
  ```

- [ ] **npm package setup**
  - `package.json` for WASM distribution
  - Export TypeScript types
  - Include initialization helpers

### 4.2 TypeScript Bindings

**File**: `packages/sui-editor/src/WasmPreview/types.ts` (update)

- [ ] **Complete type definitions**
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
  }
  ```

### 4.3 React Hook Updates

**File**: `packages/sui-editor/src/WasmPreview/useWasmRenderer.ts`

- [ ] **Replace mock with real WASM**
  ```typescript
  import init, { PreviewRenderer } from '@stoked-ui/video-renderer-wasm';

  useEffect(() => {
    async function loadWasm() {
      await init();  // Initialize WASM module
      const renderer = new PreviewRenderer(canvas, width, height);
      rendererRef.current = renderer;
    }
    loadWasm();
  }, []);
  ```

- [ ] **Add frame scheduling**
  - RequestAnimationFrame loop
  - Time synchronization with EditorEngine
  - Frame dropping for performance

- [ ] **Memory management**
  - Proper cleanup on unmount
  - Limit memory usage
  - Garbage collection hints

---

## Phase 5: EditorEngine Integration (Week 5-6)

### 5.1 Compositor Controller

**File**: `packages/sui-editor/src/Controllers/CompositorController.ts` (new)

- [ ] **Create compositor controller**
  ```typescript
  export class CompositorController implements IController {
    private renderer: PreviewRenderer;

    enter(params: ControllerParams) {
      // Add layer to compositor
      this.renderer.addLayer(this.actionToLayer(params.action));
    }

    update(params: ControllerParams) {
      // Update layer transforms/effects at current time
      this.renderer.updateLayer(params.action.id, {
        time: params.time,
        transform: this.interpolateTransform(params.action, params.time),
      });
    }

    leave(params: ControllerParams) {
      // Remove layer from compositor
      this.renderer.removeLayer(params.action.id);
    }
  }
  ```

### 5.2 EditorEngine Modifications

**File**: `packages/sui-editor/src/EditorEngine/EditorEngine.ts`

- [ ] **Add WASM renderer option**
  ```typescript
  export interface EditorEngineOptions extends EngineOptions {
    useWasmRenderer?: boolean;
    wasmRendererConfig?: WasmRendererConfig;
  }
  ```

- [ ] **Compositor render loop**
  - Replace `drawImage` calls with compositor commands
  - Batch layer updates for efficiency
  - Handle compositor errors gracefully

- [ ] **Fallback to canvas**
  - Detect WASM support
  - Graceful degradation if WASM fails
  - Performance comparison mode

### 5.3 Track Type Integration

- [ ] **Map track types to layer types**
  | EditorTrack Type | Compositor Layer Type |
  |------------------|----------------------|
  | video            | VideoLayer           |
  | image            | ImageLayer           |
  | audio            | (no visual layer)    |
  | text             | TextLayer            |
  | effect           | EffectLayer          |

---

## Phase 6: Performance Optimization (Week 6-7)

### 6.1 Parallel Frame Composition

**File**: `compositor/src/compositor.rs`

- [ ] **Multi-threaded rendering**
  - Use `rayon` for parallel layer processing
  - Tile-based rendering for large frames
  - Background thread for prefetching

- [ ] **Batch operations**
  - Compose multiple frames in parallel
  - Share immutable layer data across threads

### 6.2 Memory Optimization

- [ ] **Frame buffer pooling**
  - Reuse allocated buffers
  - Avoid allocation during render loop

- [ ] **Texture atlasing**
  - Combine small images into atlas
  - Reduce draw calls

- [ ] **Resolution scaling**
  - Render at lower resolution during scrubbing
  - Full resolution for playback/export

### 6.3 Caching Strategy

- [ ] **Composed frame cache**
  - Cache static portions of composition
  - Invalidate on layer changes
  - LRU eviction policy

- [ ] **Decoded media cache**
  - Cache video frames around playhead
  - Predictive prefetching
  - Memory budget management

### 6.4 Benchmarking

- [ ] **Performance metrics**
  - Frame composition time
  - Memory usage
  - Cache hit rates
  - FPS counter

- [ ] **Comparison tests**
  - WASM vs JavaScript canvas
  - Different layer counts
  - Various resolutions

---

## Phase 7: Export Pipeline (Week 7-8)

### 7.1 Server-Side Rendering

**File**: `cli/src/main.rs`

- [ ] **CLI renderer**
  ```bash
  sui-video-renderer render \
    --input project.sue \
    --output video.mp4 \
    --quality high \
    --resolution 1920x1080
  ```

- [ ] **Batch frame rendering**
  - Render all frames to images
  - Progress reporting
  - Parallel rendering across cores

### 7.2 FFmpeg Integration

- [ ] **Frame-to-video encoding**
  - Pipe rendered frames to FFmpeg
  - H.264/H.265 encoding
  - Quality presets (CRF values)

- [ ] **Audio handling**
  - Extract audio from video sources
  - Mix multiple audio tracks
  - Sync with video timeline

### 7.3 Export API (Optional)

- [ ] **REST endpoint for rendering**
  - Submit .sue file
  - Poll for progress
  - Download completed video

- [ ] **Queue-based processing**
  - Handle multiple export requests
  - Priority queue
  - Progress webhooks

---

## Phase 8: Testing & Documentation (Week 8)

### 8.1 Unit Tests

- [ ] **Compositor tests**
  - Blend mode accuracy
  - Transform correctness
  - Effect output validation

- [ ] **WASM tests**
  - Browser compatibility
  - Memory leak detection
  - Performance regression tests

### 8.2 Integration Tests

- [ ] **Editor integration**
  - Layer lifecycle (enter/update/leave)
  - Time synchronization
  - Action-to-layer mapping

- [ ] **Export tests**
  - Full pipeline render
  - Audio/video sync verification
  - Quality comparison

### 8.3 Documentation

- [ ] **API documentation**
  - Rust docs for compositor
  - TypeScript docs for WASM bindings
  - Integration guide for sui-editor

- [ ] **Performance guide**
  - Best practices for layer composition
  - Memory management tips
  - Troubleshooting guide

---

## File Structure (Final)

```
packages/sui-video-renderer/
├── Cargo.toml                    # Workspace manifest
├── IMPLEMENTATION_PLAN.md        # This file
├── README.md                     # Package documentation
│
├── compositor/                   # Core Rust library
│   ├── Cargo.toml
│   ├── src/
│   │   ├── lib.rs               # Public API
│   │   ├── compositor.rs        # Main compositor
│   │   ├── layer.rs             # Layer types
│   │   ├── transform.rs         # Transform operations
│   │   ├── blend.rs             # Blend modes
│   │   ├── effects.rs           # Visual effects
│   │   ├── text.rs              # Text rendering (new)
│   │   ├── video.rs             # Video frame handling (new)
│   │   ├── keyframe.rs          # Animation system (new)
│   │   ├── cache.rs             # Frame/media caching (new)
│   │   ├── frame.rs             # Frame buffer
│   │   └── types.rs             # Common types
│   └── benches/
│       └── frame_composition.rs  # Performance benchmarks
│
├── wasm-preview/                 # WASM module for browser
│   ├── Cargo.toml
│   ├── src/
│   │   ├── lib.rs               # WASM bindings
│   │   ├── video.rs             # Browser video handling (new)
│   │   └── bindings.rs          # JS interop helpers (new)
│   └── tests/
│       └── web.rs               # Browser tests
│
├── cli/                          # Command-line tool
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs              # CLI entry point
│   │   ├── render.rs            # Render command
│   │   └── ffmpeg.rs            # FFmpeg integration
│   └── tests/
│       └── integration.rs
│
├── pkg/                          # WASM build output (generated)
│   ├── package.json
│   ├── sui_video_renderer.js
│   ├── sui_video_renderer.d.ts
│   └── sui_video_renderer_bg.wasm
│
└── scripts/
    ├── build-wasm.sh            # WASM build script
    └── test-wasm.sh             # Browser test runner
```

---

## Dependencies to Add

### Rust (Cargo.toml)

```toml
[workspace.dependencies]
# Text rendering
fontdue = "0.8"
# or
rusttype = "0.9"

# Video handling (native only)
ffmpeg-next = "7.0"

# Additional image processing
palette = "0.7"  # Color space conversions

# Animation
interpolation = "0.2"
ezing = "0.1"
```

### JavaScript (package.json for pkg/)

```json
{
  "name": "@stoked-ui/video-renderer-wasm",
  "version": "0.1.0",
  "files": ["*.js", "*.wasm", "*.d.ts"],
  "main": "sui_video_renderer.js",
  "types": "sui_video_renderer.d.ts",
  "sideEffects": ["*.wasm"]
}
```

---

## Success Criteria

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Preview FPS (1080p, 10 layers) | 60 FPS | Benchmark suite |
| Frame composition time | < 16ms | Performance.now() |
| WASM bundle size | < 500KB gzipped | Build output |
| Memory usage (1080p) | < 200MB | Browser DevTools |
| Time to first frame | < 100ms | User timing API |

### Functional Requirements

- [ ] All existing editor features work with WASM renderer
- [ ] Graceful fallback when WASM unavailable
- [ ] Export produces identical output to preview
- [ ] No visual artifacts in composed frames
- [ ] Audio/video sync within 1 frame tolerance

### Quality Requirements

- [ ] Test coverage > 80% for compositor
- [ ] No memory leaks in 1-hour stress test
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Documentation complete for all public APIs

---

## Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| WASM performance not meeting targets | Medium | High | Profile early, optimize hot paths, consider WebGPU |
| Video frame extraction unreliable | Medium | Medium | Multiple fallback strategies, graceful degradation |
| Browser compatibility issues | Low | Medium | Feature detection, polyfills, graceful fallback |
| Memory pressure with large projects | Medium | High | Streaming composition, aggressive caching eviction |

### Schedule Risks

| Risk | Mitigation |
|------|------------|
| Text rendering complexity | Use existing font libraries, defer advanced features |
| FFmpeg integration challenges | Start with image sequence export, add FFmpeg later |
| Integration complexity | Incremental integration, feature flags |

---

## Getting Started

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack
cargo install wasm-pack

# Install wasm-opt (for size optimization)
cargo install wasm-opt
```

### Build Commands

```bash
# Build compositor library
cd packages/sui-video-renderer
cargo build --release

# Build WASM module
cd wasm-preview
wasm-pack build --target web --out-dir ../pkg

# Run tests
cargo test --workspace

# Run benchmarks
cargo bench
```

### Integration Test

```bash
# Start editor with WASM renderer enabled
cd packages/sui-editor
WASM_RENDERER=true pnpm dev
```

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Core Compositor | 2 weeks | Complete transforms, text, effects |
| Phase 2: Video Frames | 1 week | Video layer support |
| Phase 3: Animation | 1 week | Keyframe system |
| Phase 4: WASM Build | 1 week | Working WASM module |
| Phase 5: Editor Integration | 1 week | EditorEngine with WASM |
| Phase 6: Optimization | 1 week | Performance targets met |
| Phase 7: Export Pipeline | 1 week | CLI video export |
| Phase 8: Testing & Docs | 1 week | Production ready |

**Total: 8 weeks**
