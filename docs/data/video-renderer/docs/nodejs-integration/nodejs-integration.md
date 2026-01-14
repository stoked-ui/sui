---
title: Node.js Integration
productId: video-renderer
---

# Node.js Integration

<p class="description">Integrate Rust video compositor with your Node.js/NestJS backend for high-performance video rendering.</p>

## Architecture Options

### Option 1: CLI Subprocess (Recommended for Getting Started)

```
NestJS Service → spawn Rust CLI → Process → Return result
```

**Pros:** Simple, isolated, easy to debug
**Cons:** Process spawn overhead (~50ms)

### Option 2: Native Module (Production)

```
NestJS Service → FFI call → Rust library → Direct memory access
```

**Pros:** Fastest, shared memory
**Cons:** Complex setup, platform-specific builds

## CLI Integration (NestJS)

### Installation

```bash
# Build Rust CLI
cd packages/sui-video-renderer-rust/cli
cargo build --release

# The binary will be at target/release/video-render
```

### Basic Service

```typescript
// src/render/services/rust-compositor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

export interface CompositionRequest {
  width: number;
  height: number;
  layers: LayerData[];
  outputPath: string;
}

export interface LayerData {
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
export class RustCompositorService {
  private readonly logger = new Logger(RustCompositorService.name);
  private readonly cliPath: string;

  constructor() {
    // Path to Rust CLI binary
    this.cliPath = path.resolve(
      __dirname,
      '../../../sui-video-renderer-rust/target/release/video-render'
    );
  }

  async composeFrame(request: CompositionRequest): Promise<string> {
    this.logger.log(`Composing frame: ${request.width}x${request.height}`);

    // Create temp input file
    const inputPath = `/tmp/composition-${Date.now()}.json`;
    await fs.writeFile(inputPath, JSON.stringify(request));

    try {
      // Execute Rust CLI
      const command = `${this.cliPath} compose --input "${inputPath}" --output "${request.outputPath}"`;

      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(command);
      const duration = Date.now() - startTime;

      this.logger.log(`Composition completed in ${duration}ms`);

      if (stderr) {
        this.logger.warn(`Rust CLI stderr: ${stderr}`);
      }

      // Clean up temp file
      await fs.unlink(inputPath);

      return request.outputPath;
    } catch (error) {
      this.logger.error(`Composition failed: ${error.message}`);
      throw new Error(`Rust composition failed: ${error.message}`);
    }
  }

  async composeBatch(requests: CompositionRequest[]): Promise<string[]> {
    this.logger.log(`Batch composing ${requests.length} frames`);

    // Process in parallel with concurrency limit
    const concurrency = 4;
    const results: string[] = [];

    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((req) => this.composeFrame(req))
      );
      results.push(...batchResults);
    }

    return results;
  }
}
```

### Controller Example

```typescript
// src/render/render.controller.ts
import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { RustCompositorService } from './services/rust-compositor.service';

@Controller('render')
export class RenderController {
  constructor(private readonly compositor: RustCompositorService) {}

  @Post('compose')
  async composeFrame(@Body() body: any) {
    const result = await this.compositor.composeFrame({
      width: body.width || 1920,
      height: body.height || 1080,
      layers: body.layers || [],
      outputPath: `/tmp/output-${Date.now()}.png`,
    });

    return {
      success: true,
      outputPath: result,
    };
  }

  @Post('batch')
  async composeBatch(@Body() body: { frames: any[] }) {
    const requests = body.frames.map((frame, index) => ({
      width: frame.width || 1920,
      height: frame.height || 1080,
      layers: frame.layers || [],
      outputPath: `/tmp/output-${Date.now()}-${index}.png`,
    }));

    const results = await this.compositor.composeBatch(requests);

    return {
      success: true,
      count: results.length,
      outputs: results,
    };
  }
}
```

### Queue Integration (Bull)

```typescript
// src/render/processors/composition.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { RustCompositorService } from '../services/rust-compositor.service';

export interface CompositionJob {
  projectId: string;
  frames: any[];
  outputDir: string;
}

@Processor('composition')
export class CompositionProcessor {
  private readonly logger = new Logger(CompositionProcessor.name);

  constructor(private readonly compositor: RustCompositorService) {}

  @Process('render-frames')
  async handleRenderFrames(job: Job<CompositionJob>) {
    this.logger.log(`Processing job ${job.id} for project ${job.data.projectId}`);

    const { frames, outputDir } = job.data;

    // Update progress
    await job.progress(0);

    const requests = frames.map((frame, index) => ({
      width: frame.width,
      height: frame.height,
      layers: frame.layers,
      outputPath: `${outputDir}/frame-${index.toString().padStart(4, '0')}.png`,
    }));

    // Process with progress updates
    const total = requests.length;
    const results: string[] = [];

    for (let i = 0; i < requests.length; i++) {
      const result = await this.compositor.composeFrame(requests[i]);
      results.push(result);

      // Update progress
      const progress = Math.floor(((i + 1) / total) * 100);
      await job.progress(progress);
    }

    this.logger.log(`Completed job ${job.id}, rendered ${results.length} frames`);

    return {
      projectId: job.data.projectId,
      frameCount: results.length,
      outputs: results,
    };
  }
}
```

## Express.js Integration

### Simple Express Server

```javascript
// server.js
const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);
const app = express();

app.use(express.json());

const CLI_PATH = path.resolve(__dirname, '../sui-video-renderer-rust/target/release/video-render');

app.post('/api/compose', async (req, res) => {
  try {
    const { width = 1920, height = 1080, layers = [] } = req.body;

    // Create temp files
    const inputPath = `/tmp/input-${Date.now()}.json`;
    const outputPath = `/tmp/output-${Date.now()}.png`;

    await fs.writeFile(
      inputPath,
      JSON.stringify({ width, height, layers, outputPath })
    );

    // Run Rust CLI
    const startTime = Date.now();
    await execAsync(`${CLI_PATH} compose --input "${inputPath}" --output "${outputPath}"`);
    const duration = Date.now() - startTime;

    // Clean up input
    await fs.unlink(inputPath);

    res.json({
      success: true,
      duration,
      outputPath,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Native Module Integration (Advanced)

### Using napi-rs

```bash
# Install napi-rs CLI
npm install -g @napi-rs/cli

# Create native module
cd packages/sui-video-renderer-rust
napi new --name compositor-native
```

### Rust Native Module

```rust
// native/src/lib.rs
#![deny(clippy::all)]

use napi::bindgen_prelude::*;
use napi_derive::napi;
use video_compositor::{Compositor, Layer, Transform, Color};

#[napi(object)]
pub struct LayerData {
  pub layer_type: String,
  pub color: Option<Vec<u8>>,
  pub image_path: Option<String>,
  pub transform: TransformData,
  pub z_index: i32,
}

#[napi(object)]
pub struct TransformData {
  pub x: f64,
  pub y: f64,
  pub scale_x: f64,
  pub scale_y: f64,
  pub opacity: f64,
}

#[napi]
pub struct NativeCompositor {
  compositor: Compositor,
}

#[napi]
impl NativeCompositor {
  #[napi(constructor)]
  pub fn new(width: u32, height: u32) -> Result<Self> {
    let compositor = Compositor::new(width, height)
      .map_err(|e| Error::from_reason(format!("Failed to create compositor: {}", e)))?;

    Ok(Self { compositor })
  }

  #[napi]
  pub fn compose(&self, layers_data: Vec<LayerData>) -> Result<Buffer> {
    // Convert LayerData to Layer
    let layers: Vec<Layer> = layers_data
      .iter()
      .map(|data| self.convert_layer(data))
      .collect::<Result<Vec<_>>>()?;

    // Compose frame
    let frame = self.compositor.compose(&layers)
      .map_err(|e| Error::from_reason(format!("Composition failed: {}", e)))?;

    // Convert to PNG bytes
    let mut bytes: Vec<u8> = Vec::new();
    frame.image().write_to(&mut std::io::Cursor::new(&mut bytes), image::ImageOutputFormat::Png)
      .map_err(|e| Error::from_reason(format!("Failed to encode PNG: {}", e)))?;

    Ok(Buffer::from(bytes))
  }

  fn convert_layer(&self, data: &LayerData) -> Result<Layer> {
    let transform = Transform::new()
      .with_position(data.transform.x as f32, data.transform.y as f32)
      .with_scale_xy(data.transform.scale_x as f32, data.transform.scale_y as f32)
      .with_opacity(data.transform.opacity as f32);

    match data.layer_type.as_str() {
      "solidColor" => {
        let color = data.color.as_ref()
          .ok_or_else(|| Error::from_reason("Missing color"))?;
        Ok(Layer::solid_color(
          Color::new(color[0], color[1], color[2], color[3]),
          transform
        ))
      }
      "image" => {
        let path = data.image_path.as_ref()
          .ok_or_else(|| Error::from_reason("Missing image path"))?;
        Ok(Layer::image(path, transform))
      }
      _ => Err(Error::from_reason("Unknown layer type")),
    }
  }
}
```

### TypeScript Usage

```typescript
// Using the native module
import { NativeCompositor } from './native/index.node';

const compositor = new NativeCompositor(1920, 1080);

const layers = [
  {
    layer_type: 'solidColor',
    color: [50, 50, 50, 255],
    transform: { x: 0, y: 0, scale_x: 1, scale_y: 1, opacity: 1 },
    z_index: 0,
  },
  {
    layer_type: 'solidColor',
    color: [255, 0, 0, 255],
    transform: { x: 100, y: 100, scale_x: 0.5, scale_y: 0.5, opacity: 0.8 },
    z_index: 1,
  },
];

// Get PNG buffer directly
const pngBuffer = compositor.compose(layers);

// Save or upload
await fs.writeFile('output.png', pngBuffer);
```

## Complete Video Pipeline

### End-to-End Example

```typescript
// src/render/services/video-pipeline.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RustCompositorService } from './rust-compositor.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class VideoPipelineService {
  private readonly logger = new Logger(VideoPipelineService.name);

  constructor(private readonly compositor: RustCompositorService) {}

  async renderVideo(projectData: any): Promise<string> {
    const { width, height, frameRate, duration, timeline } = projectData;
    const frameCount = Math.floor(frameRate * duration);
    const outputDir = `/tmp/render-${Date.now()}`;

    // 1. Generate frames with Rust
    this.logger.log(`Rendering ${frameCount} frames...`);

    const frameRequests = Array.from({ length: frameCount }, (_, i) => {
      const time = i / frameRate;
      const layers = this.getLayersAtTime(timeline, time);

      return {
        width,
        height,
        layers,
        outputPath: path.join(outputDir, `frame-${i.toString().padStart(4, '0')}.png`),
      };
    });

    // Render all frames (parallelized internally)
    await this.compositor.composeBatch(frameRequests);

    // 2. Encode with FFmpeg
    this.logger.log('Encoding video with FFmpeg...');
    const videoPath = path.join(outputDir, 'output.mp4');

    await execAsync(`
      ffmpeg -framerate ${frameRate} \
        -i ${outputDir}/frame-%04d.png \
        -c:v libx264 \
        -preset medium \
        -crf 23 \
        -pix_fmt yuv420p \
        ${videoPath}
    `);

    this.logger.log('Video rendering complete!');
    return videoPath;
  }

  private getLayersAtTime(timeline: any[], time: number): any[] {
    // Your timeline logic here
    return timeline
      .filter((layer) => layer.startTime <= time && layer.endTime >= time)
      .map((layer) => ({
        type: layer.type,
        color: layer.color,
        imagePath: layer.imagePath,
        transform: this.interpolateTransform(layer, time),
        z_index: layer.zIndex,
      }));
  }

  private interpolateTransform(layer: any, time: number): any {
    // Your animation interpolation logic
    return layer.transform;
  }
}
```

## Performance Monitoring

### Metrics Collection

```typescript
// src/render/services/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('composition_duration_seconds')
    private readonly compositionDuration: Histogram
  ) {}

  recordComposition(duration: number, layerCount: number, success: boolean) {
    this.compositionDuration.observe(
      {
        layer_count: layerCount.toString(),
        success: success.toString(),
      },
      duration / 1000 // Convert to seconds
    );
  }
}
```

## Error Handling

### Robust Error Handling

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { RustCompositorService } from './rust-compositor.service';

@Injectable()
export class SafeCompositorService {
  private readonly logger = new Logger(SafeCompositorService.name);

  constructor(private readonly compositor: RustCompositorService) {}

  async safeCompose(request: any): Promise<string | null> {
    try {
      return await this.compositor.composeFrame(request);
    } catch (error) {
      this.logger.error(`Composition failed: ${error.message}`, error.stack);

      // Try fallback strategy
      if (error.message.includes('image not found')) {
        this.logger.warn('Retrying with placeholder images...');
        return await this.composeWithPlaceholders(request);
      }

      // Report to monitoring
      this.reportError(error);

      return null;
    }
  }

  private async composeWithPlaceholders(request: any): Promise<string> {
    // Fallback implementation
    throw new Error('Not implemented');
  }

  private reportError(error: Error) {
    // Send to Sentry, CloudWatch, etc.
  }
}
```

## Next Steps

- Explore [Rust Backend Examples](/video-renderer/rust-backend/) for more compositor features
- Check out [WASM Frontend](/video-renderer/wasm-frontend/) for browser integration
- Read the [API Reference](/video-renderer/api-reference/) for complete documentation
- Try the [Quick Start Guide](/video-renderer/quick-start/) for step-by-step setup
