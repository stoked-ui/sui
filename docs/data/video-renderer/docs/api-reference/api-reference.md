---
title: API Reference
productId: video-renderer
---

# API Reference

<p class="description">Complete API documentation for the Stoked UI Video Renderer across Rust, WASM, and TypeScript interfaces.</p>

## Rust Compositor API

### Core Types

#### Compositor

Main compositor instance for frame composition.

```rust
pub struct Compositor {
    width: u32,
    height: u32,
    background: Color,
}

impl Compositor {
    /// Create a new compositor with specified dimensions
    pub fn new(width: u32, height: u32) -> Result<Self, CompositorError>;

    /// Set background color
    pub fn with_background(self, color: Color) -> Self;

    /// Compose a single frame from layers
    pub fn compose(&self, layers: &[Layer]) -> Result<Frame, CompositorError>;

    /// Compose multiple frames in parallel
    pub fn compose_batch(&self, batch: Vec<Vec<Layer>>) -> Result<Vec<Frame>, CompositorError>;
}
```

**Example**:
```rust
let compositor = Compositor::new(1920, 1080)?
    .with_background(Color::black());
```

#### Layer

Represents a compositable layer.

```rust
pub struct Layer {
    pub content: LayerContent,
    pub transform: Transform,
    pub blend_mode: BlendMode,
    pub visible: bool,
    pub z_index: i32,
}

pub enum LayerContent {
    SolidColor(Color),
    Image(ImageData),
    Text(TextData),
}

impl Layer {
    /// Create a solid color layer
    pub fn solid_color(color: Color, transform: Transform) -> Self;

    /// Create an image layer from file path
    pub fn image(path: impl AsRef<Path>, transform: Transform) -> Result<Self, CompositorError>;

    /// Create an image layer from raw data
    pub fn from_image_data(data: Vec<u8>, width: u32, height: u32, transform: Transform) -> Self;

    /// Set blend mode
    pub fn with_blend_mode(self, mode: BlendMode) -> Self;

    /// Set visibility
    pub fn with_visible(self, visible: bool) -> Self;

    /// Set z-index
    pub fn with_z_index(self, z: i32) -> Self;
}
```

**Example**:
```rust
let layer = Layer::solid_color(Color::rgb(255, 0, 0), Transform::new())
    .with_blend_mode(BlendMode::Multiply)
    .with_z_index(1);
```

#### Transform

Transformation properties for layers.

```rust
pub struct Transform {
    pub x: f32,
    pub y: f32,
    pub scale_x: f32,
    pub scale_y: f32,
    pub rotation: f32,  // degrees
    pub opacity: f32,   // 0.0 to 1.0
}

impl Transform {
    /// Create default transform (0, 0, 1x, 1x, 0°, 100%)
    pub fn new() -> Self;

    /// Set position
    pub fn with_position(self, x: f32, y: f32) -> Self;

    /// Set uniform scale
    pub fn with_scale(self, scale: f32) -> Self;

    /// Set non-uniform scale
    pub fn with_scale_xy(self, scale_x: f32, scale_y: f32) -> Self;

    /// Set rotation in degrees
    pub fn with_rotation(self, degrees: f32) -> Self;

    /// Set opacity (0.0 to 1.0)
    pub fn with_opacity(self, opacity: f32) -> Self;
}
```

**Example**:
```rust
let transform = Transform::new()
    .with_position(100.0, 200.0)
    .with_scale(0.5)
    .with_rotation(45.0)
    .with_opacity(0.8);
```

#### Color

RGBA color representation.

```rust
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

impl Color {
    /// Create RGBA color
    pub fn new(r: u8, g: u8, b: u8, a: u8) -> Self;

    /// Create RGB color (alpha = 255)
    pub fn rgb(r: u8, g: u8, b: u8) -> Self;

    /// Predefined colors
    pub fn black() -> Self;
    pub fn white() -> Self;
    pub fn transparent() -> Self;
}
```

**Example**:
```rust
let red = Color::rgb(255, 0, 0);
let semi_transparent_blue = Color::new(0, 0, 255, 128);
```

#### BlendMode

Layer blending modes.

```rust
pub enum BlendMode {
    Normal,      // Standard alpha blending
    Multiply,    // Darkens by multiplying colors
    Screen,      // Lightens by inverting and multiplying
    Overlay,     // Combines multiply and screen
    Add,         // Adds color values
    Subtract,    // Subtracts color values
    Lighten,     // Takes lighter of two colors
    Darken,      // Takes darker of two colors
}
```

**Example**:
```rust
let layer = Layer::solid_color(color, transform)
    .with_blend_mode(BlendMode::Multiply);
```

#### Frame

Composed output frame.

```rust
pub struct Frame {
    data: RgbaImage,
}

impl Frame {
    /// Save frame to PNG file
    pub fn save(&self, path: impl AsRef<Path>) -> Result<(), CompositorError>;

    /// Get frame as raw RGBA bytes
    pub fn as_bytes(&self) -> &[u8];

    /// Get frame dimensions
    pub fn dimensions(&self) -> (u32, u32);

    /// Get underlying image
    pub fn image(&self) -> &RgbaImage;
}
```

**Example**:
```rust
let frame = compositor.compose(&layers)?;
frame.save("output.png")?;
let bytes = frame.as_bytes();
let (width, height) = frame.dimensions();
```

### Effects

Image effects that can be applied to layers.

```rust
pub enum Effect {
    Blur { radius: f32 },
    Brightness { amount: f32 },      // -1.0 to 1.0
    Contrast { amount: f32 },        // -1.0 to 1.0
    Saturation { amount: f32 },      // -1.0 to 1.0
    HueRotate { degrees: f32 },      // 0.0 to 360.0
}

impl Effect {
    /// Apply effect to image
    pub fn apply(&self, image: &RgbaImage) -> Result<RgbaImage, CompositorError>;
}
```

**Example**:
```rust
let blur = Effect::Blur { radius: 10.0 };
let brightened = Effect::Brightness { amount: 0.3 };
let image = blur.apply(&image)?;
let image = brightened.apply(&image)?;
```

### Error Types

```rust
pub enum CompositorError {
    InvalidDimensions(u32, u32),
    ImageLoadError(String),
    ImageSaveError(String),
    CompositionError(String),
    EffectError(String),
}

impl std::error::Error for CompositorError {}
impl std::fmt::Display for CompositorError {
    // Standard error formatting
}
```

___

## WASM Preview API

### PreviewRenderer

Browser-based WASM renderer.

```typescript
class PreviewRenderer {
  /**
   * Create a new WASM renderer
   * @param canvas - HTML canvas element for rendering
   * @param width - Canvas width in pixels
   * @param height - Canvas height in pixels
   */
  constructor(canvas: HTMLCanvasElement, width: number, height: number);

  /**
   * Render a frame from layer data
   * @param layersJson - JSON string of WasmLayer[]
   */
  render_frame(layersJson: string): void;

  /**
   * Clear the canvas
   */
  clear(): void;

  /**
   * Get performance metrics as JSON
   */
  get_metrics(): string;

  /**
   * Free WASM memory (call when done)
   */
  free(): void;
}
```

**Example**:
```typescript
import init, { PreviewRenderer } from '@stoked-ui/wasm-preview';

await init();
const canvas = document.getElementById('preview') as HTMLCanvasElement;
const renderer = new PreviewRenderer(canvas, 1920, 1080);

const layers = [
  {
    id: 'bg',
    type: 'solidColor',
    color: [50, 50, 50, 255],
    transform: { x: 0, y: 0, scale_x: 1, scale_y: 1, rotation: 0, opacity: 1 },
    blend_mode: 'normal',
    visible: true,
    z_index: 0,
  }
];

renderer.render_frame(JSON.stringify(layers));
```

### WASM Types

#### WasmLayer

```typescript
interface WasmLayer {
  id: string;
  type: 'solidColor' | 'image' | 'text';

  // For solidColor type
  color?: [number, number, number, number]; // RGBA 0-255

  // For image type
  imagePath?: string;

  // Transform properties
  transform: {
    x: number;
    y: number;
    scale_x: number;
    scale_y: number;
    rotation: number;  // degrees
    opacity: number;   // 0.0 to 1.0
  };

  // Blending and visibility
  blend_mode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'add' | 'lighten' | 'darken';
  visible: boolean;
  z_index: number;
}
```

#### RenderMetrics

```typescript
interface RenderMetrics {
  width: number;
  height: number;
  ready: boolean;
  lastFrameTime?: number;  // milliseconds
  fps?: number;
}
```

___

## TypeScript/React API

### useWasmRenderer Hook

React hook for WASM renderer integration.

```typescript
interface UseWasmRendererResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  renderFrame: (layers: WasmLayer[]) => void;
  clear: () => void;
  isLoading: boolean;
  error: Error | null;
  metrics: RenderMetrics | null;
  benchmark: (layerCount: number) => Promise<number>;
}

function useWasmRenderer(
  width: number,
  height: number
): UseWasmRendererResult;
```

**Parameters**:
- `width` - Canvas width in pixels
- `height` - Canvas height in pixels

**Returns**:
- `canvasRef` - Ref to attach to canvas element
- `renderFrame` - Function to render layers
- `clear` - Clear the canvas
- `isLoading` - WASM module loading state
- `error` - Error state if initialization fails
- `metrics` - Performance metrics
- `benchmark` - Run performance benchmark

**Example**:
```typescript
import { useWasmRenderer } from '@stoked-ui/wasm-preview';

function VideoPreview() {
  const { canvasRef, renderFrame, isLoading, metrics } = useWasmRenderer(1920, 1080);

  useEffect(() => {
    if (!isLoading) {
      renderFrame([
        {
          id: 'bg',
          type: 'solidColor',
          color: [30, 30, 30, 255],
          transform: { x: 0, y: 0, scale_x: 1, scale_y: 1, rotation: 0, opacity: 1 },
          blend_mode: 'normal',
          visible: true,
          z_index: 0,
        }
      ]);
    }
  }, [isLoading, renderFrame]);

  return <canvas ref={canvasRef} />;
}
```

### Helper Functions

#### createSolidColorLayer

```typescript
function createSolidColorLayer(
  color: [number, number, number, number],
  transform?: Partial<WasmLayer['transform']>,
  options?: { zIndex?: number; blendMode?: WasmLayer['blend_mode'] }
): WasmLayer;
```

**Example**:
```typescript
const layer = createSolidColorLayer(
  [255, 0, 0, 255],
  { x: 100, y: 100, scale_x: 0.5, scale_y: 0.5 },
  { zIndex: 1, blendMode: 'multiply' }
);
```

___

## Node.js Integration API

### RustCompositorService (NestJS)

Service for integrating Rust compositor via CLI.

```typescript
interface CompositionRequest {
  width: number;
  height: number;
  layers: LayerData[];
  outputPath: string;
}

interface LayerData {
  type: 'solidColor' | 'image';
  color?: [number, number, number, number];
  imagePath?: string;
  transform: {
    x: number;
    y: number;
    scale_x: number;
    scale_y: number;
    rotation: number;
    opacity: number;
  };
  blend_mode?: string;
  z_index: number;
}

@Injectable()
class RustCompositorService {
  /**
   * Compose a single frame
   */
  async composeFrame(request: CompositionRequest): Promise<string>;

  /**
   * Compose multiple frames in batch
   */
  async composeBatch(requests: CompositionRequest[]): Promise<string[]>;
}
```

**Example**:
```typescript
@Injectable()
export class VideoService {
  constructor(private compositor: RustCompositorService) {}

  async renderFrame() {
    const result = await this.compositor.composeFrame({
      width: 1920,
      height: 1080,
      layers: [
        {
          type: 'solidColor',
          color: [255, 0, 0, 255],
          transform: { x: 100, y: 100, scale_x: 0.5, scale_y: 0.5, rotation: 0, opacity: 1 },
          z_index: 0,
        }
      ],
      outputPath: '/tmp/output.png',
    });

    return result;
  }
}
```

___

## CLI API

### Command Line Interface

```bash
# Compose a single frame
video-render compose --input <json-file> --output <png-file>

# Benchmark performance
video-render bench --layers <count> --iterations <count>

# Get version info
video-render --version
```

### Input JSON Format

```json
{
  "width": 1920,
  "height": 1080,
  "layers": [
    {
      "type": "solidColor",
      "color": [255, 0, 0, 255],
      "transform": {
        "x": 100,
        "y": 100,
        "scale_x": 0.5,
        "scale_y": 0.5,
        "rotation": 0,
        "opacity": 1.0
      },
      "blend_mode": "normal",
      "z_index": 0
    }
  ],
  "outputPath": "/tmp/output.png"
}
```

___

## Performance Characteristics

### Rust Compositor

| Operation | Performance | Notes |
|-----------|-------------|-------|
| Simple frame (3 layers, 1080p) | ~4ms | 11x faster than Node.js |
| Complex frame (10 layers, 1080p) | ~12ms | 10x faster than Node.js |
| 4K frame (5 layers) | ~25ms | 11x faster than Node.js |
| Batch processing (100 frames) | Parallel | Uses all CPU cores |

### WASM Preview

| Metric | Value | Notes |
|--------|-------|-------|
| Bundle size (gzipped) | ~95KB | Includes compositor |
| Initial load time | <100ms | One-time WASM compilation |
| Frame rendering (1080p) | <16ms | 60 FPS sustained |
| Memory usage | ~50MB | For 1080p canvas |

### Memory Management

```typescript
// WASM cleanup
renderer.free(); // Call when done to free WASM memory

// React cleanup
useEffect(() => {
  return () => {
    rendererRef.current?.free();
  };
}, []);
```

___

## Type Definitions

### Complete TypeScript Types

```typescript
// Layer types
type LayerType = 'solidColor' | 'image' | 'text';
type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'add' | 'lighten' | 'darken';

// Color as RGBA tuple
type Color = [number, number, number, number];

// Transform interface
interface Transform {
  x: number;
  y: number;
  scale_x: number;
  scale_y: number;
  rotation: number;
  opacity: number;
}

// Complete layer interface
interface WasmLayer {
  id: string;
  type: LayerType;
  color?: Color;
  imagePath?: string;
  transform: Transform;
  blend_mode?: BlendMode;
  visible: boolean;
  z_index: number;
}

// Metrics interface
interface RenderMetrics {
  width: number;
  height: number;
  ready: boolean;
  lastFrameTime?: number;
  fps?: number;
}

// Error types
class CompositorError extends Error {
  constructor(message: string);
}

class WasmLoadError extends Error {
  constructor(message: string);
}
```

___

## Best Practices

### Rust Backend

```rust
// ✅ Good: Reuse compositor instance
let compositor = Compositor::new(1920, 1080)?;
for layers in frames {
    let frame = compositor.compose(&layers)?;
    frame.save(path)?;
}

// ❌ Bad: Create new compositor each time
for layers in frames {
    let compositor = Compositor::new(1920, 1080)?;
    let frame = compositor.compose(&layers)?;
}
```

### WASM Preview

```typescript
// ✅ Good: Single renderer, multiple renders
const renderer = new PreviewRenderer(canvas, 1920, 1080);
layers.forEach(layerSet => renderer.render_frame(JSON.stringify(layerSet)));

// ❌ Bad: Multiple renderers
layers.forEach(layerSet => {
    const renderer = new PreviewRenderer(canvas, 1920, 1080);
    renderer.render_frame(JSON.stringify(layerSet));
});
```

### React Integration

```typescript
// ✅ Good: Memoize layers
const layers = useMemo(() => generateLayers(props), [props]);
useEffect(() => renderFrame(layers), [layers, renderFrame]);

// ❌ Bad: Recreate layers every render
useEffect(() => {
    const layers = generateLayers(props); // New array every time
    renderFrame(layers);
});
```

___

## Next Steps

- [Quick Start Guide](/video-renderer/quick-start/) - Get started with implementation
- [Rust Backend Examples](/video-renderer/rust-backend/) - Server-side composition examples
- [WASM Frontend Examples](/video-renderer/wasm-frontend/) - Browser preview examples
- [Node.js Integration](/video-renderer/nodejs-integration/) - Backend service integration
