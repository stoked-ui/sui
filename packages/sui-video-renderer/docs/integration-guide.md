# Integration Guide

This guide will help you integrate the Rust/WASM video renderer into your application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Building the WASM Module](#building-the-wasm-module)
- [Adding to a React Project](#adding-to-a-react-project)
- [Enabling in EditorEngine](#enabling-in-editorengine)
- [Fallback Configuration](#fallback-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before integrating the video renderer, ensure you have the following installed:

### Required Tools

- **Rust Toolchain** (1.70 or later)
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- **wasm-pack** (for building WASM modules)
  ```bash
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
  ```

- **Node.js** (18.x or later)
  ```bash
  # Using nvm
  nvm install 18
  nvm use 18
  ```

### Verify Installation

```bash
rustc --version   # Should show 1.70+
wasm-pack --version
node --version    # Should show v18.x or later
```

## Building the WASM Module

### Development Build

For local development with faster build times:

```bash
cd packages/sui-video-renderer/wasm-preview
wasm-pack build --target web --dev
```

This creates a `pkg` directory with the WASM module and JavaScript bindings.

### Production Build

For optimized production builds:

```bash
cd packages/sui-video-renderer/wasm-preview
wasm-pack build --target web --release
```

The production build includes:
- Size optimizations (`opt-level = "z"`)
- Link-time optimization (LTO)
- Dead code elimination
- Binary size reduction (typically 40-60% smaller)

### Build Artifacts

After building, the `pkg` directory contains:

```
pkg/
├── wasm_preview.js          # JavaScript bindings
├── wasm_preview.d.ts        # TypeScript definitions
├── wasm_preview_bg.wasm     # WebAssembly binary
└── package.json             # NPM package metadata
```

## Adding to a React Project

### 1. Install the WASM Package

Add the WASM package to your project:

```bash
# If publishing to npm
npm install @stoked-ui/video-renderer-wasm

# Or link locally during development
cd packages/sui-video-renderer/wasm-preview/pkg
npm link

cd your-react-project
npm link @stoked-ui/video-renderer-wasm
```

### 2. Import and Initialize

Create a WASM renderer hook:

```typescript
// hooks/useWasmRenderer.ts
import { useEffect, useRef, useState } from 'react';
import init, { PreviewRenderer } from '@stoked-ui/video-renderer-wasm';

export function useWasmRenderer(canvasRef: React.RefObject<HTMLCanvasElement>, width: number, height: number) {
  const [renderer, setRenderer] = useState<PreviewRenderer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initWasm() {
      try {
        // Initialize WASM module
        await init();

        if (!mounted || !canvasRef.current) return;

        // Create renderer
        const r = new PreviewRenderer(canvasRef.current, width, height);

        if (mounted) {
          setRenderer(r);
          setIsReady(true);
        }
      } catch (err) {
        console.error('Failed to initialize WASM renderer:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      }
    }

    initWasm();

    return () => {
      mounted = false;
      setRenderer(null);
      setIsReady(false);
    };
  }, [canvasRef, width, height]);

  return { renderer, isReady, error };
}
```

### 3. Use in Your Component

```typescript
// components/VideoPreview.tsx
import React, { useRef, useEffect } from 'react';
import { useWasmRenderer } from '../hooks/useWasmRenderer';

interface Layer {
  id: string;
  type: 'solidColor' | 'image' | 'video' | 'text';
  transform: {
    x: number;
    y: number;
    scale_x: number;
    scale_y: number;
    rotation: number;
    opacity: number;
  };
  // ... other properties
}

export function VideoPreview({ layers }: { layers: Layer[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { renderer, isReady, error } = useWasmRenderer(canvasRef, 1920, 1080);

  useEffect(() => {
    if (!renderer || !isReady) return;

    try {
      // Render frame
      const layersJson = JSON.stringify(layers);
      renderer.render_frame(layersJson);
    } catch (err) {
      console.error('Render error:', err);
    }
  }, [renderer, isReady, layers]);

  if (error) {
    return <div>WASM Error: {error}</div>;
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
      {!isReady && <div>Loading renderer...</div>}
    </div>
  );
}
```

## Enabling in EditorEngine

Configure the EditorEngine to use the WASM renderer:

```typescript
// EditorEngine configuration
import { EditorEngine } from '@stoked-ui/editor';

const engine = new EditorEngine({
  // Enable WASM renderer
  useWasmRenderer: true,

  // WASM renderer configuration
  wasmRenderer: {
    // Use reduced resolution during scrubbing for better performance
    scrubbingResolutionScale: 0.5,

    // Maximum cache size in MB
    maxCacheSize: 512,

    // Enable buffer pooling
    enableBufferPool: true,
    bufferPoolSize: 10,

    // Enable tile-based rendering for large compositions
    enableTileRendering: true,
    tileSize: 256,
  },

  // Fallback to canvas renderer if WASM fails
  fallbackToCanvas: true,
});
```

### Auto-detect WASM Support

```typescript
async function detectWasmSupport(): Promise<boolean> {
  try {
    if (typeof WebAssembly === 'undefined') {
      return false;
    }

    // Check for required WASM features
    const module = new WebAssembly.Module(
      new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0])
    );

    return module instanceof WebAssembly.Module;
  } catch {
    return false;
  }
}

// Use WASM if supported
const supportsWasm = await detectWasmSupport();
const engine = new EditorEngine({
  useWasmRenderer: supportsWasm,
  fallbackToCanvas: true,
});
```

## Fallback Configuration

Implement graceful fallback to Canvas-based rendering:

```typescript
class RenderManager {
  private wasmRenderer: PreviewRenderer | null = null;
  private canvasRenderer: CanvasRenderer | null = null;

  async initialize(canvas: HTMLCanvasElement) {
    try {
      // Try WASM first
      await init();
      this.wasmRenderer = new PreviewRenderer(canvas, 1920, 1080);
      console.log('Using WASM renderer');
    } catch (err) {
      console.warn('WASM renderer failed, falling back to Canvas:', err);
      this.canvasRenderer = new CanvasRenderer(canvas, 1920, 1080);
      console.log('Using Canvas renderer');
    }
  }

  render(layers: Layer[]) {
    if (this.wasmRenderer) {
      const layersJson = JSON.stringify(layers);
      this.wasmRenderer.render_frame(layersJson);
    } else if (this.canvasRenderer) {
      this.canvasRenderer.render(layers);
    } else {
      throw new Error('No renderer available');
    }
  }

  getMetrics() {
    if (this.wasmRenderer) {
      return JSON.parse(this.wasmRenderer.get_metrics());
    }
    return { renderer: 'canvas' };
  }
}
```

## Troubleshooting

### Common Issues

#### WASM Module Fails to Load

**Problem:** `RuntimeError: unreachable` or `LinkError`

**Solution:**
1. Ensure WASM was built with matching Rust version
2. Check browser compatibility (requires WASM 1.0 support)
3. Verify WASM file is served with correct MIME type: `application/wasm`

```nginx
# nginx configuration
location ~* \.wasm$ {
    types { application/wasm wasm; }
}
```

#### Memory Issues

**Problem:** `RuntimeError: memory access out of bounds`

**Solution:**
1. Reduce cache size in configuration
2. Lower resolution scale during scrubbing
3. Check for memory leaks in layer cleanup

```typescript
// Reduce memory usage
const engine = new EditorEngine({
  wasmRenderer: {
    maxCacheSize: 256,  // Reduce from 512MB
    scrubbingResolutionScale: 0.25,  // Reduce from 0.5
  },
});
```

#### Slow Performance

**Problem:** Rendering is slower than expected

**Solution:**
1. Enable buffer pooling
2. Use tile-based rendering for large compositions
3. Reduce layer count or complexity
4. Profile with browser DevTools

```typescript
// Performance optimizations
const engine = new EditorEngine({
  wasmRenderer: {
    enableBufferPool: true,
    bufferPoolSize: 20,
    enableTileRendering: true,
    tileSize: 256,
  },
});
```

#### CORS Issues with Images

**Problem:** `SecurityError: Cross-origin image load denied`

**Solution:**
1. Serve images from same origin
2. Configure CORS headers on image server
3. Use proxy for external images

```typescript
// Proxy external images
const proxyUrl = (url: string) => {
  if (url.startsWith('http')) {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};
```

#### TypeScript Errors

**Problem:** Type definitions not found

**Solution:**
1. Ensure `wasm_preview.d.ts` is in the package
2. Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@stoked-ui/video-renderer-wasm"]
  }
}
```

### Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 57+ | Full support |
| Firefox | 52+ | Full support |
| Safari | 11+ | Full support |
| Edge | 79+ | Full support |
| IE | Not supported | No WASM support |

### Performance Expectations

**Target Performance:**
- 60 fps playback at 1080p (5-10 layers)
- 30 fps scrubbing at 1080p (10-20 layers)
- 16ms frame budget (60 fps)
- 33ms frame budget (30 fps)

**Optimization Checklist:**
- [ ] Buffer pooling enabled
- [ ] Tile rendering enabled for complex scenes
- [ ] Resolution scaling during scrubbing
- [ ] Layer count optimized
- [ ] Image cache configured appropriately

## Next Steps

- Read the [Performance Guide](./performance-guide.md) for optimization tips
- Check the [CLI Guide](./cli-guide.md) for command-line rendering
- Review the [API Documentation](https://docs.rs/video-compositor) for detailed API reference
