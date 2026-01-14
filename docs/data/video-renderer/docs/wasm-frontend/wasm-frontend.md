---
title: WASM Frontend Examples
productId: video-renderer
---

# WASM Frontend Examples

<p class="description">Real-time video preview in the browser using WebAssembly for 60 FPS performance.</p>

## Installation

```bash
npm install @stoked-ui/wasm-preview
# or
yarn add @stoked-ui/wasm-preview
# or
pnpm add @stoked-ui/wasm-preview
```

## Basic Usage (React)

### Simple Preview Component

```tsx
import { useWasmRenderer, createSolidColorLayer } from '@stoked-ui/wasm-preview';
import { useEffect } from 'react';

export function VideoPreview() {
  const { canvasRef, renderFrame, isLoading, error, metrics } = useWasmRenderer(1920, 1080);

  useEffect(() => {
    if (!isLoading && !error) {
      const layers = [
        // Background
        createSolidColorLayer([50, 50, 50, 255]),

        // Red box
        createSolidColorLayer(
          [255, 0, 0, 255],
          { x: 100, y: 100, scale_x: 0.5, scale_y: 0.5, opacity: 0.8 }
        ),
      ];

      renderFrame(layers);
    }
  }, [isLoading, error, renderFrame]);

  if (isLoading) return <div>Loading WASM module...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc' }}
      />
      {metrics && (
        <div>
          Performance: {metrics.lastFrameTime?.toFixed(2)}ms | {metrics.fps} FPS
        </div>
      )}
    </div>
  );
}
```

## Advanced Examples

### Interactive Layer Editor

```tsx
import { useState, useEffect } from 'react';
import { useWasmRenderer, createSolidColorLayer, type WasmLayer } from '@stoked-ui/wasm-preview';

export function LayerEditor() {
  const { canvasRef, renderFrame, metrics } = useWasmRenderer(1920, 1080);
  const [layers, setLayers] = useState<WasmLayer[]>([
    createSolidColorLayer([50, 50, 50, 255], {}, { zIndex: 0 }),
  ]);

  // Re-render when layers change
  useEffect(() => {
    renderFrame(layers);
  }, [layers, renderFrame]);

  const addLayer = () => {
    setLayers([
      ...layers,
      createSolidColorLayer(
        [
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          255,
        ],
        {
          x: Math.random() * 500,
          y: Math.random() * 500,
          scale_x: 0.3,
          scale_y: 0.3,
          opacity: 0.7,
        },
        { zIndex: layers.length }
      ),
    ]);
  };

  const updateLayerOpacity = (index: number, opacity: number) => {
    setLayers(
      layers.map((layer, i) =>
        i === index
          ? { ...layer, transform: { ...layer.transform, opacity } }
          : layer
      )
    );
  };

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <canvas ref={canvasRef} width={1920} height={1080} style={{ maxWidth: 600 }} />
      <div>
        <button onClick={addLayer}>Add Random Layer</button>
        <h3>Layers ({layers.length})</h3>
        {layers.map((layer, index) => (
          <div key={layer.id} style={{ marginBottom: 10 }}>
            <strong>Layer {index}</strong>
            <br />
            Opacity: {layer.transform.opacity.toFixed(2)}
            <br />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={layer.transform.opacity}
              onChange={(e) => updateLayerOpacity(index, parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Animated Preview

```tsx
import { useWasmRenderer, createSolidColorLayer } from '@stoked-ui/wasm-preview';
import { useEffect, useRef, useState } from 'react';

export function AnimatedPreview() {
  const { canvasRef, renderFrame } = useWasmRenderer(1920, 1080);
  const [isPlaying, setIsPlaying] = useState(false);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      frameRef.current += 1;
      const x = (frameRef.current * 5) % 1920;

      const layers = [
        // Background
        createSolidColorLayer([30, 30, 30, 255]),

        // Moving box
        createSolidColorLayer(
          [255, 100, 50, 255],
          {
            x,
            y: 500,
            scale_x: 0.3,
            scale_y: 0.3,
            opacity: 1.0,
          }
        ),
      ];

      renderFrame(layers);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, renderFrame]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid #000' }} />
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
```

## Blend Modes

### All Blend Modes Example

```tsx
import { useWasmRenderer, type WasmLayer } from '@stoked-ui/wasm-preview';
import { useEffect } from 'react';

const blendModes: WasmLayer['blend_mode'][] = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'add',
  'lighten',
  'darken',
];

export function BlendModesDemo() {
  const { canvasRef, renderFrame } = useWasmRenderer(1920, 1080);

  useEffect(() => {
    const layers: WasmLayer[] = [
      // Base layer
      {
        id: 'base',
        type: 'solidColor',
        color: [100, 100, 255, 255],
        transform: { x: 0, y: 0, scale_x: 1, scale_y: 1, rotation: 0, opacity: 1 },
        blend_mode: 'normal',
        visible: true,
        z_index: 0,
      },
      // Overlay layer
      {
        id: 'overlay',
        type: 'solidColor',
        color: [255, 100, 100, 255],
        transform: { x: 400, y: 300, scale_x: 0.6, scale_y: 0.6, rotation: 0, opacity: 1 },
        blend_mode: 'multiply', // Try different modes!
        visible: true,
        z_index: 1,
      },
    ];

    renderFrame(layers);
  }, [renderFrame]);

  return <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />;
}
```

## Performance Benchmark

### Built-in Benchmark Function

```tsx
import { useWasmRenderer } from '@stoked-ui/wasm-preview';
import { useState } from 'react';

export function PerformanceBenchmark() {
  const { benchmark } = useWasmRenderer(1920, 1080);
  const [results, setResults] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = async () => {
    setIsRunning(true);
    try {
      const time = await benchmark(10); // 10 layers
      setResults(time);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div>
      <button onClick={runBenchmark} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Run Benchmark'}
      </button>
      {results !== null && (
        <div>
          <strong>Result:</strong> {results.toFixed(2)}ms to compose 10 layers
          <br />
          <strong>FPS:</strong> {(1000 / results).toFixed(0)} frames/second
        </div>
      )}
    </div>
  );
}
```

## Vanilla JavaScript (No React)

### Direct WASM Usage

```javascript
import init, { PreviewRenderer } from '@stoked-ui/wasm-preview';

async function setupPreview() {
  // Initialize WASM module
  await init();

  // Get canvas element
  const canvas = document.getElementById('preview-canvas');

  // Create renderer
  const renderer = new PreviewRenderer(canvas, 1920, 1080);

  // Define layers
  const layers = [
    {
      id: 'bg',
      type: 'solidColor',
      color: [50, 50, 50, 255],
      transform: { x: 0, y: 0, scale_x: 1, scale_y: 1, rotation: 0, opacity: 1 },
      blend_mode: 'normal',
      visible: true,
      z_index: 0,
    },
    {
      id: 'box',
      type: 'solidColor',
      color: [255, 0, 0, 255],
      transform: { x: 100, y: 100, scale_x: 0.5, scale_y: 0.5, rotation: 0, opacity: 0.8 },
      blend_mode: 'normal',
      visible: true,
      z_index: 1,
    },
  ];

  // Render frame
  renderer.render_frame(JSON.stringify(layers));

  // Get performance metrics
  const metrics = JSON.parse(renderer.get_metrics());
  console.log('Renderer metrics:', metrics);

  // Clean up when done
  // renderer.free();
}

setupPreview();
```

## TypeScript Types

### Complete Type Definitions

```typescript
// Transform interface
interface WasmTransform {
  x: number;
  y: number;
  scale_x: number;
  scale_y: number;
  rotation: number; // degrees
  opacity: number; // 0.0 to 1.0
}

// Layer interface
interface WasmLayer {
  id: string;
  type: 'solidColor' | 'image' | 'text';
  color?: [number, number, number, number]; // RGBA
  imagePath?: string;
  transform: WasmTransform;
  blend_mode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'add' | 'lighten' | 'darken';
  visible: boolean;
  z_index: number;
}

// Performance metrics
interface RenderMetrics {
  width: number;
  height: number;
  ready: boolean;
  lastFrameTime?: number; // milliseconds
  fps?: number;
}

// WASM renderer interface
interface PreviewRenderer {
  render_frame(layersJson: string): void;
  clear(): void;
  get_metrics(): string; // JSON string
  free(): void;
}
```

## Bundle Size Optimization

### Lazy Loading WASM Module

```tsx
import { lazy, Suspense } from 'react';

// Lazy load the preview component
const LazyVideoPreview = lazy(() => import('./components/VideoPreview'));

export function App() {
  return (
    <Suspense fallback={<div>Loading video editor...</div>}>
      <LazyVideoPreview />
    </Suspense>
  );
}
```

### Webpack Configuration

```javascript
// next.config.js or webpack.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    // Don't include WASM in server builds
    if (isServer) {
      config.externals.push('@stoked-ui/wasm-preview');
    }

    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
};
```

## Error Handling

### Robust Error Handling

```tsx
import { useWasmRenderer } from '@stoked-ui/wasm-preview';
import { useEffect } from 'react';

export function SafePreview() {
  const { canvasRef, renderFrame, error, isLoading } = useWasmRenderer(1920, 1080);

  useEffect(() => {
    if (isLoading || error) return;

    try {
      const layers = [
        /* your layers */
      ];
      renderFrame(layers);
    } catch (err) {
      console.error('Render failed:', err);
      // Handle error (show fallback UI, retry, etc.)
    }
  }, [isLoading, error, renderFrame]);

  if (error) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        <h3>Preview Unavailable</h3>
        <p>{error.message}</p>
        <details>
          <summary>Error Details</summary>
          <pre>{error.stack}</pre>
        </details>
      </div>
    );
  }

  return <canvas ref={canvasRef} />;
}
```

## Performance Tips

### Optimizing Render Performance

```tsx
import { useWasmRenderer } from '@stoked-ui/wasm-preview';
import { useMemo, useCallback } from 'react';

export function OptimizedPreview({ projectData }) {
  const { canvasRef, renderFrame } = useWasmRenderer(1920, 1080);

  // Memoize layer generation
  const layers = useMemo(() => {
    return projectData.elements.map((element) => ({
      id: element.id,
      type: element.type,
      color: element.color,
      transform: element.transform,
      blend_mode: element.blendMode,
      visible: element.visible,
      z_index: element.zIndex,
    }));
  }, [projectData]);

  // Memoize render callback
  const render = useCallback(() => {
    renderFrame(layers);
  }, [layers, renderFrame]);

  useEffect(() => {
    render();
  }, [render]);

  return <canvas ref={canvasRef} />;
}
```

### Throttling Updates

```tsx
import { useWasmRenderer } from '@stoked-ui/wasm-preview';
import { useEffect, useRef } from 'react';
import { throttle } from 'lodash';

export function ThrottledPreview({ layers }) {
  const { canvasRef, renderFrame } = useWasmRenderer(1920, 1080);

  // Throttle renders to 30 FPS max
  const throttledRender = useRef(
    throttle((layers) => {
      renderFrame(layers);
    }, 33) // ~30 FPS
  );

  useEffect(() => {
    throttledRender.current(layers);
  }, [layers]);

  return <canvas ref={canvasRef} />;
}
```

## Browser Compatibility

### Feature Detection

```tsx
function checkWasmSupport(): boolean {
  try {
    if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
      if (module instanceof WebAssembly.Module) {
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
      }
    }
  } catch (e) {}
  return false;
}

export function ConditionalPreview() {
  const isSupported = checkWasmSupport();

  if (!isSupported) {
    return (
      <div>
        <p>WebAssembly is not supported in your browser.</p>
        <p>Please use a modern browser (Chrome 57+, Firefox 52+, Safari 11+, Edge 16+).</p>
      </div>
    );
  }

  return <VideoPreview />;
}
```

## Next Steps

- Explore [Node.js Integration](/video-renderer/nodejs-integration/) for backend services
- Check out [API Reference](/video-renderer/api-reference/) for complete documentation
- Try the [Quick Start Guide](/video-renderer/quick-start/) for a step-by-step tutorial
