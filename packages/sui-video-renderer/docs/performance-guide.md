# Performance Guide

This guide provides best practices and optimization strategies for achieving optimal performance with the Rust/WASM video renderer.

## Table of Contents

- [Performance Targets](#performance-targets)
- [Frame Budget](#frame-budget)
- [Layer Optimization](#layer-optimization)
- [Memory Management](#memory-management)
- [Resolution Scaling](#resolution-scaling)
- [Tile-Based Rendering](#tile-based-rendering)
- [Profiling](#profiling)
- [Best Practices](#best-practices)

## Performance Targets

### Target Frame Rates

| Scenario | Target FPS | Frame Budget | Layer Count |
|----------|-----------|--------------|-------------|
| Playback (Simple) | 60 fps | 16.67ms | 5-10 layers |
| Playback (Complex) | 30 fps | 33.33ms | 10-20 layers |
| Scrubbing | 30 fps | 33.33ms | 5-15 layers |
| Preview | 24 fps | 41.67ms | 20+ layers |

### Frame Budget Breakdown

For 60 fps (16ms budget):
- Composition: 8-10ms
- Blending: 3-4ms
- Effects: 2-3ms
- Canvas draw: 1-2ms

For 30 fps (33ms budget):
- Composition: 15-20ms
- Blending: 6-8ms
- Effects: 4-6ms
- Canvas draw: 2-3ms

## Frame Budget

Understanding frame budgets is critical for smooth playback:

### 60 FPS (Real-time Playback)

```
Frame Budget: 16.67ms
├─ Decode (if video): 4-6ms
├─ Compose layers: 6-8ms
├─ Apply effects: 2-3ms
└─ Draw to canvas: 2-3ms
```

**Recommendations for 60 FPS:**
- Keep layer count ≤ 10
- Minimize complex effects (blur, shadows)
- Use buffer pooling
- Enable tile rendering only for static layers

### 30 FPS (Standard Playback)

```
Frame Budget: 33.33ms
├─ Decode (if video): 8-12ms
├─ Compose layers: 12-16ms
├─ Apply effects: 4-6ms
└─ Draw to canvas: 3-4ms
```

**Recommendations for 30 FPS:**
- Layer count ≤ 20
- Moderate effects usage
- Full resolution rendering
- Buffer pooling + tile rendering

## Layer Optimization

### Recommended Layer Counts

| Resolution | Optimal | Maximum | Notes |
|------------|---------|---------|-------|
| 1080p | 5-10 | ~50 | Without effects |
| 1080p | 3-7 | ~30 | With blur/shadows |
| 4K | 3-5 | ~20 | Simple compositions |
| 4K | 2-3 | ~10 | With effects |

### Layer Complexity Guidelines

**Simple Layers (Fast):**
- Solid colors
- Static images (no transforms)
- Pre-rendered text

**Medium Layers:**
- Transformed images
- Simple effects (brightness, contrast)
- Text with basic styling

**Complex Layers (Slow):**
- Blur effects (radius > 10)
- Multiple shadows
- Video with effects
- Large text with stroke + shadow

### Optimization Strategies

#### 1. Pre-compose Static Layers

```rust
use video_compositor::{Compositor, Layer, ComposedFrameCache, ComposedFrameCacheKey};

// Pre-compose static background layers
let mut cache = ComposedFrameCache::new(256 * 1024 * 1024);

let background_layers = vec![
    Layer::image("background.png", Transform::default()),
    Layer::image("overlay.png", Transform::default()),
];

let key = ComposedFrameCacheKey::from_state(&background_layers);

// Check cache first
if let Some(cached) = cache.get(&key) {
    // Use cached background
} else {
    // Compose and cache
    let background = compositor.compose(&background_layers)?;
    cache.insert(key, background.into_image());
}
```

#### 2. Layer Visibility Culling

```rust
// Only render visible layers
let visible_layers: Vec<Layer> = all_layers
    .into_iter()
    .filter(|layer| {
        layer.visible &&
        layer.transform.opacity > 0.01 &&
        layer_in_viewport(layer, viewport_bounds)
    })
    .collect();

compositor.compose(&visible_layers)?;
```

#### 3. Effect Budgeting

```rust
// Limit expensive effects based on performance mode
fn apply_effects(layer: &mut Layer, performance_mode: PerformanceMode) {
    match performance_mode {
        PerformanceMode::High => {
            // Full quality effects
            layer = layer.with_effect(Effect::Blur { radius: 20.0 });
        }
        PerformanceMode::Medium => {
            // Reduced quality
            layer = layer.with_effect(Effect::Blur { radius: 10.0 });
        }
        PerformanceMode::Low => {
            // Skip expensive effects
            // No blur
        }
    }
}
```

## Memory Management

### Buffer Pool Configuration

Buffer pools reduce allocation overhead during rendering:

```rust
use video_compositor::Compositor;

// Create compositor with buffer pool
let compositor = Compositor::new(1920, 1080)?
    .with_buffer_pool(10);  // Pre-allocate 10 buffers

// Pool stats
// Memory per buffer: 1920 * 1080 * 4 bytes = ~8.3 MB
// Total pool memory: 10 * 8.3 MB = ~83 MB
```

**Recommendations:**
- **5-10 buffers**: For standard playback
- **15-20 buffers**: For scrubbing/seek operations
- **3-5 buffers**: For memory-constrained devices

### Cache Tuning

Frame caches store decoded frames to avoid redundant work:

```rust
use video_compositor::FrameCache;

// Configure cache based on use case
let cache = FrameCache::new(
    512 * 1024 * 1024  // 512 MB budget
);

// Typical frame sizes at 1080p (RGBA):
// 1920x1080x4 = ~8.3 MB per frame
// 512 MB cache = ~60 frames cached
```

**Cache Size Recommendations:**

| Use Case | Cache Size | Frames (1080p) |
|----------|-----------|----------------|
| Playback | 256 MB | ~30 frames |
| Scrubbing | 512 MB | ~60 frames |
| Preview | 128 MB | ~15 frames |
| Low Memory | 64 MB | ~7 frames |

### Memory Budget Calculator

```rust
fn calculate_memory_budget(
    width: u32,
    height: u32,
    target_cached_frames: usize,
    buffer_pool_size: usize,
) -> usize {
    let bytes_per_frame = (width * height * 4) as usize;

    let cache_budget = bytes_per_frame * target_cached_frames;
    let pool_budget = bytes_per_frame * buffer_pool_size;

    cache_budget + pool_budget
}

// Example: 1080p, 60 cached frames, 10 buffer pool
let total_mb = calculate_memory_budget(1920, 1080, 60, 10) / (1024 * 1024);
println!("Total memory: {} MB", total_mb);  // ~580 MB
```

## Resolution Scaling

Use resolution scaling during scrubbing for better performance:

```rust
use video_compositor::{Compositor, ScrubbingDetector};

let compositor = Compositor::new(1920, 1080)?;
let mut scrubbing_detector = ScrubbingDetector::new();

// Track each setTime call
scrubbing_detector.track_call();

// Get suggested scale factor
let scale = scrubbing_detector.suggested_resolution_scale();

// Render with resolution scaling
if scale < 1.0 {
    let frame = compositor.compose_with_resolution_scale(&layers, scale)?;
} else {
    let frame = compositor.compose(&layers)?;
}
```

### Scaling Recommendations

| Scrubbing Speed | Scale Factor | Resolution (from 1080p) |
|----------------|--------------|-------------------------|
| Slow (< 10 fps) | 1.0 | 1920x1080 (full) |
| Medium (10-30 fps) | 0.75 | 1440x810 |
| Fast (30-60 fps) | 0.5 | 960x540 |
| Very Fast (> 60 fps) | 0.25 | 480x270 |

### Custom Scrubbing Detection

```rust
use video_compositor::ScrubbingDetector;

// Create detector with custom thresholds
let mut detector = ScrubbingDetector::with_settings(
    30.0,  // 30 calls/sec threshold
    0.5    // 50% resolution during scrubbing
);

// Track timeline seeks
detector.track_call();

if detector.is_scrubbing() {
    println!("Scrubbing detected! Using {}x resolution",
        detector.suggested_resolution_scale());
}
```

## Tile-Based Rendering

Tile-based rendering improves performance for large compositions:

```rust
use video_compositor::Compositor;

let compositor = Compositor::new(3840, 2160)?  // 4K
    .with_tile_rendering(512);  // 512x512 tiles

// Automatically uses tile rendering
let frame = compositor.compose_tiled(&layers)?;
```

### When to Use Tile Rendering

**Enable for:**
- Resolutions ≥ 4K
- Layer count > 20
- Mostly static layers
- Scenes with large empty areas

**Disable for:**
- Resolutions < 1080p
- Highly dynamic scenes
- Layer count < 10
- Frequent full-frame effects

### Tile Size Selection

| Resolution | Recommended Tile Size | Tiles (approx) |
|------------|----------------------|----------------|
| 1080p | 256x256 | 7x5 = 35 |
| 1440p | 384x384 | 5x4 = 20 |
| 4K | 512x512 | 8x5 = 40 |
| 8K | 1024x1024 | 8x5 = 40 |

**Formula:**
```rust
fn optimal_tile_size(width: u32, height: u32) -> u32 {
    let total_pixels = width * height;

    match total_pixels {
        ..=2_073_600 => 256,        // ≤ 1080p
        ..=3_686_400 => 384,        // ≤ 1440p
        ..=8_294_400 => 512,        // ≤ 4K
        _ => 1024,                   // > 4K
    }
}
```

## Profiling

### Using Criterion Benchmarks

Run the built-in benchmarks:

```bash
cd packages/sui-video-renderer/compositor
cargo bench
```

Sample output:
```
compose/5_layers          time:   [8.234 ms 8.301 ms 8.374 ms]
compose/10_layers         time:   [15.127 ms 15.243 ms 15.371 ms]
compose/20_layers         time:   [29.845 ms 30.124 ms 30.421 ms]

blend/normal              time:   [1.234 μs 1.251 μs 1.271 μs]
blend/multiply            time:   [1.445 μs 1.467 μs 1.493 μs]

effects/blur_radius_5     time:   [4.123 ms 4.187 ms 4.256 ms]
effects/blur_radius_10    time:   [12.567 ms 12.689 ms 12.821 ms]
```

### Browser DevTools Profiling (WASM)

#### Chrome DevTools

1. Open DevTools → Performance tab
2. Click Record
3. Perform rendering operations
4. Stop recording
5. Analyze flame graph

**Key Metrics to Watch:**
- `PreviewRenderer::render_frame` - Should be < 16ms for 60fps
- `Compositor::compose` - Main composition time
- `Effect::apply` - Effect processing time

#### Firefox DevTools

1. Open DevTools → Performance tab
2. Enable "Record Allocations"
3. Profile rendering
4. Check memory allocations

**Red Flags:**
- Frequent garbage collection
- Memory growth over time
- Allocation spikes during rendering

### Custom Performance Monitoring

```typescript
// Add performance tracking to your render loop
class PerformanceMonitor {
  private frameTimes: number[] = [];
  private readonly maxSamples = 60;

  recordFrame(duration: number) {
    this.frameTimes.push(duration);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }

  getStats() {
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const max = Math.max(...this.frameTimes);
    const fps = 1000 / avg;

    return {
      avgFrameTime: avg.toFixed(2) + 'ms',
      maxFrameTime: max.toFixed(2) + 'ms',
      fps: fps.toFixed(1),
      target: avg < 16.67 ? '60fps ✓' : avg < 33.33 ? '30fps ✓' : 'Slow ✗',
    };
  }
}

// Usage
const monitor = new PerformanceMonitor();

function render(layers: Layer[]) {
  const start = performance.now();

  renderer.render_frame(JSON.stringify(layers));

  const duration = performance.now() - start;
  monitor.recordFrame(duration);

  console.log(monitor.getStats());
}
```

## Best Practices

### 1. Lazy Loading and Prefetching

```rust
use video_compositor::Prefetcher;

let mut prefetcher = Prefetcher::new(10);  // Prefetch 10 frames

// Track playhead position
prefetcher.track_position(current_time_ms);

// Get predicted frames to prefetch
if let Some((direction, timestamps)) = prefetcher.predict_next_frames(current_time_ms) {
    for timestamp in timestamps {
        // Prefetch in background
        tokio::spawn(async move {
            prefetch_frame(timestamp).await;
        });
    }
}
```

### 2. Progressive Enhancement

```rust
// Start with low quality, upgrade progressively
async fn render_progressive(layers: &[Layer]) -> Result<Frame> {
    // Quick low-res preview
    let preview = compositor.compose_with_resolution_scale(layers, 0.25)?;
    display_frame(&preview);

    // Upgrade to medium quality
    tokio::time::sleep(Duration::from_millis(50)).await;
    let medium = compositor.compose_with_resolution_scale(layers, 0.5)?;
    display_frame(&medium);

    // Final full quality
    tokio::time::sleep(Duration::from_millis(100)).await;
    let full = compositor.compose(layers)?;
    display_frame(&full);

    Ok(full)
}
```

### 3. Effect Debouncing

```typescript
// Debounce expensive operations
import { debounce } from 'lodash';

const debouncedRender = debounce((layers: Layer[]) => {
  renderer.render_frame(JSON.stringify(layers));
}, 16); // ~60fps max

// Usage
function onLayerChange(layers: Layer[]) {
  debouncedRender(layers);
}
```

### 4. Batch Operations

```rust
// Batch multiple frame compositions
let frames = compositor.compose_batch(vec![
    layers_at_frame_0,
    layers_at_frame_1,
    layers_at_frame_2,
])?;

// Uses rayon for parallel processing
```

### 5. Memory Cleanup

```rust
// Periodically clear caches
fn cleanup_caches(
    frame_cache: &mut FrameCache,
    composed_cache: &mut ComposedFrameCache
) {
    // Reduce memory pressure
    frame_cache.set_max_memory(256 * 1024 * 1024);  // 256 MB
    composed_cache.clear();  // Clear composed frame cache
}
```

## Performance Checklist

Before deploying, verify:

- [ ] Buffer pool size appropriate for use case
- [ ] Cache budget set based on available memory
- [ ] Tile rendering enabled for 4K+ resolutions
- [ ] Resolution scaling enabled for scrubbing
- [ ] Layer count optimized (< 20 for smooth playback)
- [ ] Complex effects limited or disabled during scrubbing
- [ ] Prefetching enabled for predictable playback
- [ ] Performance monitoring in place
- [ ] Tested on target devices/browsers
- [ ] Fallback to canvas renderer works correctly

## Troubleshooting Performance Issues

### Issue: Choppy Playback

**Diagnosis:**
```typescript
const stats = monitor.getStats();
console.log(`Avg frame time: ${stats.avgFrameTime}`);
// If > 33ms, target 30fps
// If > 16ms but < 33ms, target 30fps
```

**Solutions:**
1. Reduce layer count
2. Enable resolution scaling
3. Disable expensive effects
4. Increase buffer pool size

### Issue: High Memory Usage

**Diagnosis:**
```rust
println!("Cache memory: {} MB", cache.memory_usage() / (1024 * 1024));
println!("Cached frames: {}", cache.len());
```

**Solutions:**
1. Reduce cache size
2. Clear cache periodically
3. Reduce buffer pool size
4. Lower resolution

### Issue: Slow Scrubbing

**Diagnosis:**
```rust
let is_scrubbing = scrubbing_detector.is_scrubbing();
let scale = scrubbing_detector.suggested_resolution_scale();
println!("Scrubbing: {}, Scale: {}", is_scrubbing, scale);
```

**Solutions:**
1. Enable aggressive resolution scaling (0.25x)
2. Reduce layer count
3. Increase prefetch distance
4. Use frame cache

## Additional Resources

- [Integration Guide](./integration-guide.md) - Setup and configuration
- [CLI Guide](./cli-guide.md) - Command-line rendering
- [Criterion Benchmarks](https://bheisler.github.io/criterion.rs/book/) - Benchmark framework
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/performance/) - Performance profiling
