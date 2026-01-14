/**
 * Node.js Frame Compositor Benchmark
 *
 * This implements the same frame composition logic as the Rust version
 * using Sharp for image processing.
 */

import sharp from 'sharp';
import { performance } from 'perf_hooks';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Simple frame compositor using Sharp
 */
class NodeCompositor {
  constructor(width, height, backgroundColor = { r: 0, g: 0, b: 0, alpha: 0 }) {
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
  }

  /**
   * Create a blank canvas with background color
   */
  async createBackground() {
    return sharp({
      create: {
        width: this.width,
        height: this.height,
        channels: 4,
        background: this.backgroundColor,
      },
    });
  }

  /**
   * Compose a single frame from layers
   *
   * @param {Array<Layer>} layers - Array of layer objects
   * @returns {Promise<sharp.Sharp>} Composited image
   */
  async compose(layers) {
    let canvas = await this.createBackground();

    // Sort layers by z-index
    const sortedLayers = layers
      .filter((l) => l.visible !== false)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Composite each layer
    const composites = [];

    for (const layer of sortedLayers) {
      if (layer.type === 'image') {
        const composite = await this.prepareImageLayer(layer);
        if (composite) {
          composites.push(composite);
        }
      } else if (layer.type === 'solidColor') {
        const composite = await this.prepareSolidColorLayer(layer);
        if (composite) {
          composites.push(composite);
        }
      }
    }

    // Apply all composites in one operation for better performance
    if (composites.length > 0) {
      canvas = canvas.composite(composites);
    }

    return canvas;
  }

  /**
   * Prepare an image layer for compositing
   */
  async prepareImageLayer(layer) {
    try {
      let image = sharp(layer.imagePath);

      // Get dimensions
      const metadata = await image.metadata();
      let { width, height } = metadata;

      // Apply scale transform
      if (layer.transform?.scale) {
        const scaleX = layer.transform.scale.x || 1.0;
        const scaleY = layer.transform.scale.y || 1.0;
        width = Math.round(width * scaleX);
        height = Math.round(height * scaleY);
        image = image.resize(width, height, { fit: 'fill' });
      }

      // Apply opacity
      if (layer.transform?.opacity !== undefined && layer.transform.opacity < 1.0) {
        const alpha = Math.round(layer.transform.opacity * 255);
        image = image.composite([
          {
            input: Buffer.from([255, 255, 255, alpha]),
            raw: {
              width: 1,
              height: 1,
              channels: 4,
            },
            tile: true,
            blend: 'dest-in',
          },
        ]);
      }

      // Get position
      const x = Math.round(layer.transform?.position?.x || 0);
      const y = Math.round(layer.transform?.position?.y || 0);

      return {
        input: await image.toBuffer(),
        top: y,
        left: x,
        blend: this.getBlendMode(layer.blendMode),
      };
    } catch (error) {
      console.error(`Failed to process image layer: ${error.message}`);
      return null;
    }
  }

  /**
   * Prepare a solid color layer
   */
  async prepareSolidColorLayer(layer) {
    const width = Math.round(this.width * (layer.transform?.scale?.x || 1.0));
    const height = Math.round(this.height * (layer.transform?.scale?.y || 1.0));

    let color = layer.color;

    // Apply opacity to color
    if (layer.transform?.opacity !== undefined) {
      color = {
        ...color,
        alpha: (color.alpha || 1.0) * layer.transform.opacity,
      };
    }

    const image = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: color,
      },
    });

    const x = Math.round(layer.transform?.position?.x || 0);
    const y = Math.round(layer.transform?.position?.y || 0);

    return {
      input: await image.toBuffer(),
      top: y,
      left: x,
      blend: this.getBlendMode(layer.blendMode),
    };
  }

  /**
   * Map blend mode to Sharp's blend options
   */
  getBlendMode(mode) {
    const blendMap = {
      normal: 'over',
      multiply: 'multiply',
      screen: 'screen',
      overlay: 'overlay',
      add: 'add',
      lighten: 'lighten',
      darken: 'darken',
    };

    return blendMap[mode] || 'over';
  }
}

/**
 * Benchmark scenarios
 */
const scenarios = [
  {
    name: 'Simple Composition (3 layers, 1080p)',
    width: 1920,
    height: 1080,
    layers: [
      {
        type: 'solidColor',
        color: { r: 50, g: 50, b: 50, alpha: 1 },
        transform: { scale: { x: 1, y: 1 } },
        zIndex: 0,
      },
      {
        type: 'solidColor',
        color: { r: 255, g: 0, b: 0, alpha: 1 },
        transform: { position: { x: 100, y: 100 }, scale: { x: 0.5, y: 0.5 }, opacity: 0.8 },
        zIndex: 1,
      },
      {
        type: 'solidColor',
        color: { r: 0, g: 255, b: 0, alpha: 1 },
        transform: { position: { x: 200, y: 200 }, scale: { x: 0.3, y: 0.3 }, opacity: 0.6 },
        zIndex: 2,
      },
    ],
    iterations: 100,
  },
  {
    name: 'Complex Composition (10 layers, 1080p)',
    width: 1920,
    height: 1080,
    layers: Array.from({ length: 10 }, (_, i) => ({
      type: 'solidColor',
      color: {
        r: Math.floor(Math.random() * 255),
        g: Math.floor(Math.random() * 255),
        b: Math.floor(Math.random() * 255),
        alpha: 1,
      },
      transform: {
        position: { x: i * 50, y: i * 50 },
        scale: { x: 0.8 - i * 0.05, y: 0.8 - i * 0.05 },
        opacity: 1.0 - i * 0.08,
      },
      blendMode: ['normal', 'multiply', 'screen', 'overlay'][i % 4],
      zIndex: i,
    })),
    iterations: 50,
  },
  {
    name: 'High Resolution (5 layers, 4K)',
    width: 3840,
    height: 2160,
    layers: [
      {
        type: 'solidColor',
        color: { r: 0, g: 0, b: 0, alpha: 1 },
        transform: { scale: { x: 1, y: 1 } },
        zIndex: 0,
      },
      {
        type: 'solidColor',
        color: { r: 255, g: 100, b: 50, alpha: 1 },
        transform: { position: { x: 500, y: 500 }, scale: { x: 0.6, y: 0.6 } },
        zIndex: 1,
      },
      {
        type: 'solidColor',
        color: { r: 50, g: 150, b: 255, alpha: 1 },
        transform: { position: { x: 1000, y: 500 }, scale: { x: 0.6, y: 0.6 } },
        blendMode: 'multiply',
        zIndex: 2,
      },
      {
        type: 'solidColor',
        color: { r: 100, g: 255, b: 100, alpha: 1 },
        transform: { position: { x: 750, y: 1000 }, scale: { x: 0.4, y: 0.4 }, opacity: 0.7 },
        blendMode: 'overlay',
        zIndex: 3,
      },
      {
        type: 'solidColor',
        color: { r: 255, g: 255, b: 255, alpha: 1 },
        transform: { position: { x: 1500, y: 1500 }, scale: { x: 0.3, y: 0.3 }, opacity: 0.5 },
        zIndex: 4,
      },
    ],
    iterations: 20,
  },
];

/**
 * Run a single benchmark scenario
 */
async function runScenario(scenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Scenario: ${scenario.name}`);
  console.log(`${'='.repeat(60)}`);

  const compositor = new NodeCompositor(scenario.width, scenario.height);

  const times = [];
  let totalMemoryDelta = 0;

  for (let i = 0; i < scenario.iterations; i++) {
    const memBefore = process.memoryUsage().heapUsed;
    const start = performance.now();

    const frame = await compositor.compose(scenario.layers);
    await frame.png().toBuffer(); // Force completion

    const end = performance.now();
    const memAfter = process.memoryUsage().heapUsed;

    const duration = end - start;
    const memDelta = memAfter - memBefore;

    times.push(duration);
    totalMemoryDelta += memDelta;

    if ((i + 1) % 10 === 0 || i === scenario.iterations - 1) {
      process.stdout.write(`\rProgress: ${i + 1}/${scenario.iterations} frames`);
    }
  }

  console.log('\n');

  // Calculate statistics
  times.sort((a, b) => a - b);
  const min = times[0];
  const max = times[times.length - 1];
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];
  const avgMemory = totalMemoryDelta / scenario.iterations;

  const results = {
    scenario: scenario.name,
    iterations: scenario.iterations,
    dimensions: `${scenario.width}x${scenario.height}`,
    layers: scenario.layers.length,
    timing: {
      min: min.toFixed(2),
      max: max.toFixed(2),
      mean: mean.toFixed(2),
      p50: p50.toFixed(2),
      p95: p95.toFixed(2),
      p99: p99.toFixed(2),
    },
    memory: {
      avgDelta: (avgMemory / 1024 / 1024).toFixed(2) + ' MB',
    },
    throughput: {
      framesPerSecond: (1000 / mean).toFixed(2),
      estimatedMinutePer1000Frames: ((mean * 1000) / 60000).toFixed(2),
    },
  };

  console.log('Results:');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

/**
 * Main benchmark runner
 */
async function main() {
  console.log('Node.js Frame Compositor Benchmark');
  console.log('===================================\n');
  console.log(`Node.js version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Arch: ${process.arch}`);
  console.log(`CPUs: ${require('os').cpus().length}`);
  console.log(`Memory: ${(require('os').totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);

  const allResults = [];

  for (const scenario of scenarios) {
    const results = await runScenario(scenario);
    allResults.push(results);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Wait a bit between scenarios
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Save results to file
  const outputDir = join(process.cwd(), 'results');
  await mkdir(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = join(outputDir, `node-results-${timestamp}.json`);

  await writeFile(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        platform: {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        results: allResults,
      },
      null,
      2
    )
  );

  console.log(`\n✅ Results saved to: ${outputPath}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Benchmark failed:', error);
    process.exit(1);
  });
}

export { NodeCompositor, scenarios };
