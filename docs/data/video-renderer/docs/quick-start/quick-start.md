---
title: Quick Start Guide
productId: video-renderer
---

# Quick Start Guide

<p class="description">Get started with the Stoked UI Video Renderer in minutes.</p>

## What You'll Build

In this guide, you'll create a simple video composition system that:
- Renders frames with Rust backend (10-50x faster than Node.js)
- Provides real-time preview in the browser with WASM
- Integrates with your existing Node.js infrastructure

## Prerequisites

```bash
# Required tools
node --version    # >= 18.0.0
cargo --version   # >= 1.70.0
```

If you don't have Rust installed:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Step 1: Install Dependencies

### For Rust Backend

```bash
cd packages/sui-video-renderer-rust/compositor
cargo build --release
```

### For WASM Frontend

```bash
cd packages/sui-video-renderer-rust/wasm-preview
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
wasm-pack build --target web --release
```

### For Node.js Integration

```bash
npm install @stoked-ui/video-renderer
# or
pnpm add @stoked-ui/video-renderer
```

## Step 2: Your First Composition (Rust)

Create a new Rust project:

```bash
cargo new my-video-app
cd my-video-app
```

Add to `Cargo.toml`:

```text
[dependencies]
video-compositor = { path = "../sui-video-renderer-rust/compositor" }
```

Create `src/main.rs`:

```rust
use video_compositor::{Compositor, Layer, Transform, Color};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Creating compositor...");
    let compositor = Compositor::new(1920, 1080)?;

    let layers = vec![
        // Dark background
        Layer::solid_color(
            Color::rgb(30, 30, 30),
            Transform::new()
        ),

        // Red rectangle
        Layer::solid_color(
            Color::rgb(255, 50, 50),
            Transform::new()
                .with_position(400.0, 300.0)
                .with_scale(0.4)
                .with_opacity(0.9)
        ),

        // Blue rectangle
        Layer::solid_color(
            Color::rgb(50, 100, 255),
            Transform::new()
                .with_position(800.0, 300.0)
                .with_scale(0.4)
                .with_opacity(0.9)
        ),
    ];

    println!("Composing frame...");
    let frame = compositor.compose(&layers)?;

    frame.save("output.png")?;
    println!("✅ Frame saved to output.png");

    Ok(())
}
```

Run it:

```bash
cargo run --release
# ✅ Frame saved to output.png
```

## Step 3: Browser Preview (WASM)

Install the WASM package in your React project:

```bash
npm install @stoked-ui/wasm-preview
```

Create a preview component:

```tsx
// src/VideoPreview.tsx
import { useWasmRenderer, createSolidColorLayer } from '@stoked-ui/wasm-preview';
import { useEffect, useState } from 'react';

export function VideoPreview() {
  const { canvasRef, renderFrame, isLoading, metrics } = useWasmRenderer(1920, 1080);
  const [layers, setLayers] = useState([
    createSolidColorLayer([30, 30, 30, 255]),
    createSolidColorLayer(
      [255, 50, 50, 255],
      { x: 400, y: 300, scale_x: 0.4, scale_y: 0.4, opacity: 0.9 }
    ),
    createSolidColorLayer(
      [50, 100, 255, 255],
      { x: 800, y: 300, scale_x: 0.4, scale_y: 0.4, opacity: 0.9 }
    ),
  ]);

  useEffect(() => {
    if (!isLoading) {
      renderFrame(layers);
    }
  }, [isLoading, layers, renderFrame]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ maxWidth: '100%', border: '1px solid #ccc' }}
      />
      {metrics && (
        <p>Performance: {metrics.lastFrameTime?.toFixed(2)}ms | {metrics.fps} FPS</p>
      )}
    </div>
  );
}
```

Use it in your app:

```tsx
// src/App.tsx
import { VideoPreview } from './VideoPreview';

export default function App() {
  return (
    <div>
      <h1>My Video Editor</h1>
      <VideoPreview />
    </div>
  );
}
```

## Step 4: Node.js Backend Integration

Create a NestJS service:

```typescript
// src/render/rust-compositor.service.ts
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

@Injectable()
export class RustCompositorService {
  private readonly cliPath = '../sui-video-renderer-rust/target/release/video-render';

  async composeFrame(layers: any[], outputPath: string): Promise<string> {
    const inputPath = `/tmp/input-${Date.now()}.json`;

    await fs.writeFile(
      inputPath,
      JSON.stringify({
        width: 1920,
        height: 1080,
        layers,
        outputPath,
      })
    );

    await execAsync(`${this.cliPath} compose --input "${inputPath}" --output "${outputPath}"`);

    await fs.unlink(inputPath);

    return outputPath;
  }
}
```

Create a controller:

```typescript
// src/render/render.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { RustCompositorService } from './rust-compositor.service';

@Controller('render')
export class RenderController {
  constructor(private readonly compositor: RustCompositorService) {}

  @Post('compose')
  async compose(@Body() body: { layers: any[] }) {
    const outputPath = `/tmp/output-${Date.now()}.png`;
    await this.compositor.composeFrame(body.layers, outputPath);

    return {
      success: true,
      outputPath,
    };
  }
}
```

## Step 5: Full Video Rendering

Extend your service to render complete videos:

```typescript
import { Injectable } from '@nestjs/common';
import { RustCompositorService } from './rust-compositor.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class VideoService {
  constructor(private readonly compositor: RustCompositorService) {}

  async renderVideo(frameCount: number, getLayersForFrame: (i: number) => any[]) {
    const outputDir = `/tmp/render-${Date.now()}`;

    // 1. Render all frames
    console.log(`Rendering ${frameCount} frames...`);

    for (let i = 0; i < frameCount; i++) {
      const layers = getLayersForFrame(i);
      const framePath = path.join(outputDir, `frame-${i.toString().padStart(4, '0')}.png`);
      await this.compositor.composeFrame(layers, framePath);

      if (i % 30 === 0) {
        console.log(`Progress: ${Math.floor((i / frameCount) * 100)}%`);
      }
    }

    // 2. Encode with FFmpeg
    console.log('Encoding video...');
    const videoPath = path.join(outputDir, 'output.mp4');

    await execAsync(`
      ffmpeg -framerate 30 \
        -i ${outputDir}/frame-%04d.png \
        -c:v libx264 \
        -preset medium \
        -crf 23 \
        -pix_fmt yuv420p \
        ${videoPath}
    `);

    console.log('✅ Video complete!');
    return videoPath;
  }
}
```

Use it:

```typescript
@Post('render-video')
async renderVideo() {
  const videoPath = await this.videoService.renderVideo(
    300, // 10 seconds at 30fps
    (i) => {
      // Animate position
      const x = (i * 5) % 1920;

      return [
        { type: 'solidColor', color: [30, 30, 30, 255], transform: { x: 0, y: 0, scale_x: 1, scale_y: 1, opacity: 1 }, z_index: 0 },
        { type: 'solidColor', color: [255, 50, 50, 255], transform: { x, y: 500, scale_x: 0.3, scale_y: 0.3, opacity: 0.9 }, z_index: 1 },
      ];
    }
  );

  return { videoPath };
}
```

## Step 6: Performance Benchmarking

Compare Rust vs Node.js performance:

### Node.js Benchmark

```bash
cd benchmark/compositor-comparison
pnpm install
pnpm bench:node
```

### Rust Benchmark

```bash
cd packages/sui-video-renderer-rust
cargo bench
open target/criterion/report/index.html
```

Expected results:
- **10-50x faster** than Node.js
- **50-70% less memory**

## Common Use Cases

### Use Case 1: Social Media Graphics

```rust
let layers = vec![
    Layer::image("template.jpg", Transform::new()),
    Layer::text(
        "Your Text Here".to_string(),
        64.0,
        Color::white(),
        Transform::new().with_position(100.0, 100.0)
    ),
    Layer::image("logo.png", Transform::new().with_position(1700.0, 50.0).with_scale(0.2)),
];
```

### Use Case 2: Video Overlays

```rust
let layers = vec![
    Layer::image("video_frame.jpg", Transform::new()),
    Layer::solid_color(
        Color::new(0, 0, 0, 128), // Semi-transparent black
        Transform::new().with_scale_xy(1.0, 0.2).with_position(0.0, 900.0)
    ),
    Layer::text(
        "Live Stream".to_string(),
        48.0,
        Color::white(),
        Transform::new().with_position(50.0, 920.0)
    ),
];
```

### Use Case 3: Thumbnail Generation

```rust
let layers = vec![
    Layer::image("video_still.jpg", Transform::new()),
    Layer::solid_color(
        Color::new(0, 0, 0, 180),
        Transform::new().with_position(0.0, 800.0).with_scale_xy(1.0, 0.26)
    ),
    Layer::text(
        "Click to Play ▶".to_string(),
        72.0,
        Color::white(),
        Transform::new().with_position(50.0, 850.0)
    ),
];
```

## Troubleshooting

### WASM module won't load

**Problem:** "WebAssembly module cannot be instantiated"

**Solution:** Ensure webpack config includes:
```javascript
config.experiments = {
  asyncWebAssembly: true,
};
```

### Rust CLI not found

**Problem:** "spawn ENOENT"

**Solution:** Build the CLI first:
```bash
cd packages/sui-video-renderer-rust/cli
cargo build --release
```

### Poor performance

**Problem:** "Rendering is slow"

**Solution:**
1. Use `cargo build --release` (not debug mode)
2. Process frames in parallel
3. Consider using native module instead of CLI subprocess

## Next Steps

### Explore Features

- [Rust Backend Examples](/video-renderer/rust-backend/) - Advanced composition techniques
- [WASM Frontend](/video-renderer/wasm-frontend/) - Interactive browser demos
- [Node.js Integration](/video-renderer/nodejs-integration/) - Production deployment patterns

### Learn More

- [API Reference](/video-renderer/api-reference/) - Complete API documentation
- [Architecture Guide](/claudedocs/rust-poc/ARCHITECTURE.md) - System design details
- [Performance Benchmarks](/claudedocs/rust-poc/README.md#performance-results) - Detailed performance data

## Community

- [GitHub Repository](https://github.com/stokedconsulting/stoked-ui)
- [Discord Community](https://discord.gg/stoked-ui)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/stoked-ui)

## Get Help

If you run into issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/stokedconsulting/stoked-ui/issues)
3. Ask on [Discord](https://discord.gg/stoked-ui)
4. Create a new [GitHub Issue](https://github.com/stokedconsulting/stoked-ui/issues/new)

___

**Congratulations!** 🎉 You've successfully set up the Stoked UI Video Renderer. You're now ready to build high-performance video applications.
