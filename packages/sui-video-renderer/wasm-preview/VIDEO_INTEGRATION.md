# Browser Video Integration

This document describes the browser video frame capture and image loading functionality added to the WASM Preview Renderer.

## Overview

The WASM Preview Renderer now supports three layer types:
- **Solid Color**: Static color rectangles
- **Video**: Real-time video frame capture from HTMLVideoElement
- **Image**: Static images loaded from URLs (cached)

## Architecture

### BrowserMediaLoader (`src/video.rs`)

The `BrowserMediaLoader` handles all browser-specific media operations:

#### Video Frame Capture
- Captures frames from `HTMLVideoElement` using a temporary canvas
- Converts video frames to RGBA pixel data
- Returns pixel data with dimensions

**Process:**
1. Get video element from DOM by ID
2. Create temporary canvas at video's natural dimensions
3. Draw current video frame to canvas using `drawImage()`
4. Extract pixel data using `getImageData()`
5. Return RGBA pixel array

#### Image Caching
- Stores pre-loaded images in memory
- Avoids redundant fetches for the same URL
- Manages cache lifecycle

**Cache Structure:**
- `image_cache: HashMap<String, Vec<u8>>` - URL to RGBA pixel data
- `image_dimensions: HashMap<String, (u32, u32)>` - URL to dimensions

### Layer Types

#### Video Layer

```json
{
  "id": "video-layer-1",
  "type": "video",
  "video_element_id": "my-video",
  "transform": {
    "x": 0.0,
    "y": 0.0,
    "scale_x": 1.0,
    "scale_y": 1.0,
    "rotation": 0.0,
    "opacity": 1.0
  },
  "blend_mode": "normal",
  "visible": true,
  "z_index": 1
}
```

**Fields:**
- `video_element_id`: DOM ID of the HTMLVideoElement to capture frames from

**Requirements:**
- Video element must exist in the DOM
- Video must be loaded (have valid dimensions > 0)
- Video does not need to be playing (captures current frame)

#### Image Layer

```json
{
  "id": "image-layer-1",
  "type": "image",
  "image_url": "https://example.com/image.png",
  "transform": {
    "x": 100.0,
    "y": 100.0,
    "scale_x": 0.5,
    "scale_y": 0.5,
    "rotation": 0.0,
    "opacity": 0.8
  },
  "blend_mode": "overlay",
  "visible": true,
  "z_index": 2
}
```

**Fields:**
- `image_url`: URL of the image (must be pre-cached)

**Requirements:**
- Image must be pre-loaded using `PreviewRenderer.cache_image()`
- RGBA pixel data must be provided from JavaScript

## Usage

### 1. Setup HTML

```html
<canvas id="preview-canvas"></canvas>
<video id="main-video" src="video.mp4" autoplay muted loop></video>
```

### 2. Initialize Renderer

```javascript
import init, { PreviewRenderer } from './wasm-preview/pkg';

await init();

const canvas = document.getElementById('preview-canvas');
const renderer = new PreviewRenderer(canvas, 1920, 1080);
```

### 3. Pre-load Images (if using image layers)

```javascript
async function loadImage(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  const img = await createImageBitmap(blob);

  // Create temporary canvas to get pixel data
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  const ctx = tempCanvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // Get RGBA pixel data
  const imageData = ctx.getImageData(0, 0, img.width, img.height);

  // Cache in WASM
  renderer.cache_image(url, imageData.data, img.width, img.height);
}

await loadImage('https://example.com/overlay.png');
```

### 4. Render Frames

```javascript
const layers = [
  {
    id: 'background',
    type: 'solidColor',
    color: [0, 0, 0, 255],
    transform: { x: 0, y: 0, scale_x: 1, scale_y: 1, rotation: 0, opacity: 1 },
    visible: true,
    z_index: 0
  },
  {
    id: 'video',
    type: 'video',
    video_element_id: 'main-video',
    transform: { x: 0, y: 0, scale_x: 1, scale_y: 1, rotation: 0, opacity: 1 },
    visible: true,
    z_index: 1
  },
  {
    id: 'overlay',
    type: 'image',
    image_url: 'https://example.com/overlay.png',
    transform: { x: 100, y: 100, scale_x: 0.5, scale_y: 0.5, rotation: 0, opacity: 0.7 },
    blend_mode: 'overlay',
    visible: true,
    z_index: 2
  }
];

// Render frame (call this in requestAnimationFrame for real-time preview)
renderer.render_frame(JSON.stringify(layers));
```

### 5. Real-time Preview Loop

```javascript
function animate() {
  // Re-render on each frame for real-time video preview
  renderer.render_frame(JSON.stringify(layers));
  requestAnimationFrame(animate);
}

animate();
```

## Performance Considerations

### Video Frame Capture
- **Cost**: ~1-5ms per frame (1080p)
- **Bottleneck**: Canvas drawImage() and getImageData()
- **Optimization**: Only capture when needed, not every animation frame if video is paused

### Image Caching
- **Memory**: ~8MB per 1080p RGBA image
- **Recommendation**: Clear cache for unused images
- **Method**: `renderer.clear_image_cache()` or remove specific entries

### Composition
- **Target**: < 16ms per frame for 60fps
- **Actual**: ~5-10ms for 5 layers at 1080p (depends on blend modes)

## Error Handling

All operations return `Result<T, JsValue>` with descriptive errors:

### Video Frame Capture Errors
- Missing video element: `"Video element not found: {id}"`
- Invalid element type: `"Element {id} is not a video element"`
- Invalid dimensions: `"Video element {id} has invalid dimensions: 0x0"`
- Canvas errors: `"Failed to create canvas"`, `"Failed to get image data"`

### Image Layer Errors
- Not cached: `"Image not found in cache: {url}. Use cache_image() to pre-load images."`
- Missing URL: `"Image layer missing image_url"`

### Handling Errors in JavaScript

```javascript
try {
  renderer.render_frame(layersJson);
} catch (error) {
  console.error('Render failed:', error);
  // Handle error (show error message, use fallback, etc.)
}
```

## Browser Compatibility

Requires modern browsers with:
- WebAssembly support
- HTMLVideoElement
- Canvas 2D API
- OffscreenCanvas (optional, for future async optimizations)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 15+
- Edge 90+

## Future Enhancements

### Phase 3 (Async Image Loading)
- Implement `load_image_url()` using Fetch API
- Automatic caching on first use
- Progress callbacks for loading

### Phase 4 (Performance Optimizations)
- OffscreenCanvas for video capture (avoid main thread blocking)
- WebGL-based composition for faster blending
- Worker-based image pre-processing

### Phase 5 (Advanced Features)
- Video frame caching (avoid re-capturing identical frames)
- Smart cache eviction (LRU)
- Image format conversion (WebP, AVIF)
- Lazy loading for image layers

## Testing

Browser tests are located in `tests/browser_integration.rs`.

**Run tests:**
```bash
wasm-pack test --headless --chrome
```

**Test coverage:**
- Video frame capture (success and error cases)
- Image caching (add, retrieve, clear)
- Layer rendering (all layer types)
- Mixed layer composition
- Performance benchmarks

## API Reference

### PreviewRenderer

#### Methods

##### `cache_image(url: String, data: Vec<u8>, width: u32, height: u32)`
Pre-load an image for use in image layers.

**Parameters:**
- `url`: Image URL (used as cache key)
- `data`: RGBA pixel data (must be `width * height * 4` bytes)
- `width`: Image width in pixels
- `height`: Image height in pixels

##### `clear_image_cache()`
Clear all cached images.

##### `is_image_cached(url: &str) -> bool`
Check if an image URL is cached.

##### `get_metrics() -> String`
Get renderer metrics as JSON string.

**Returns:**
```json
{
  "width": 1920,
  "height": 1080,
  "ready": true,
  "cached_images": 5
}
```

### BrowserMediaLoader (Internal)

#### Methods

##### `capture_video_frame(video_element_id: &str) -> Result<(Vec<u8>, u32, u32), JsValue>`
Capture a single frame from an HTMLVideoElement.

**Returns:** Tuple of (RGBA pixel data, width, height)

##### `get_cached_image(url: &str) -> Option<(&[u8], u32, u32)>`
Get a cached image by URL.

**Returns:** Tuple of (pixel data slice, width, height) or None

##### `cache_image(url: String, data: Vec<u8>, width: u32, height: u32)`
Cache an image for later use.

##### `clear_cache()`
Clear all cached images.

##### `cache_size() -> usize`
Get the number of cached images.

##### `is_cached(url: &str) -> bool`
Check if an image URL is cached.

## Examples

See `examples/` directory for complete examples:
- `video-preview.html` - Real-time video preview with overlay
- `multi-video.html` - Multiple video sources
- `image-composition.html` - Static image composition
