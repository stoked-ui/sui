# @stoked-ui/video-renderer-wasm

Generated WebAssembly package for the Stoked UI video renderer preview path.

This package is produced from `packages/sui-video-renderer/wasm-preview` by `wasm-pack` and is consumed by `@stoked-ui/editor` as an optional browser preview renderer. It exposes a `PreviewRenderer` class that paints composited frames into an `HTMLCanvasElement`.

## Installation

```bash
pnpm add @stoked-ui/video-renderer-wasm
```

In this monorepo, `@stoked-ui/editor` references it as an optional file dependency:

```json
"@stoked-ui/video-renderer-wasm": "file:../sui-video-renderer/pkg"
```

## Quick Start

```ts
import { init, PreviewRenderer } from '@stoked-ui/video-renderer-wasm';

init();

const canvas = document.querySelector('canvas');
if (!canvas) {
  throw new Error('Canvas element not found');
}

const renderer = new PreviewRenderer(canvas, 1920, 1080);

renderer.render_frame(JSON.stringify([
  {
    id: 'background',
    type: 'solidColor',
    color: [20, 20, 24, 255],
    transform: { x: 0, y: 0, scale_x: 1, scale_y: 1, rotation: 0, opacity: 1 },
    blend_mode: 'normal',
    visible: true,
    z_index: 0,
  },
]));

renderer.free();
```

## Primary Exports

- `init()` named function that initializes the module panic hook.
- `PreviewRenderer` class:
  - `constructor(canvas, width, height)`
  - `render_frame(layers_json)`
  - `render_frame_at_time(layers_json, time_ms)`
  - `cache_image(url, data, width, height)`
  - `is_image_cached(url)`
  - `clear_image_cache()`
  - `clear()`
  - `get_metrics()`
  - `free()`
- `Color` class and `Color.rgb(r, g, b)`.
- `benchmark_composition(width, height, layer_count)`.

## Layer Data

`render_frame` receives a JSON string containing ordered layer objects. Current layer fields include:

- `id`
- `type`: `solidColor`, `image`, `video`, or `text`
- `color` for solid-color layers
- `image_url` for cached image layers
- `video_element_id` for video layers
- `transform` with position, scale, rotation, and opacity
- `blend_mode`
- `visible`
- `z_index`

Image layers must be cached first with `cache_image()`. Video layers depend on the caller preparing and seeking the referenced browser `HTMLVideoElement`.

## Integration Notes

- This is generated package output. Edit Rust sources under `packages/sui-video-renderer/wasm-preview`, then rebuild with `wasm-pack`.
- Browser bundlers must support WebAssembly module loading.
- Call `free()` when disposing a renderer to release WASM memory.
- `get_metrics()` returns a JSON string describing renderer state such as width, height, readiness, and cached image count.
- `@stoked-ui/editor` falls back to its JavaScript canvas path if this optional package is unavailable.

## Local Development

From the WASM source package:

```bash
cd packages/sui-video-renderer/wasm-preview
wasm-pack build --target bundler --out-dir ../pkg
```

Related renderer validation lives in `packages/sui-video-renderer/compositor`, `packages/sui-video-renderer/cli`, and `packages/sui-video-renderer/benchmark`.

## License

MIT
