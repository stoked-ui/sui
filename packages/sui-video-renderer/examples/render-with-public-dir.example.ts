/**
 * Example: Render a .sue project with web paths
 *
 * This demonstrates how to render a .sue file that uses web paths
 * like /static/editor/video.mp4 by providing a publicDir parameter
 */

import {
  SueParserService,
  FFmpegFilterBuilderService,
  FFmpegRendererService,
  VolumeKeyframeProcessorService,
} from '../src/render/services';
import * as path from 'path';

async function renderWithPublicDir() {
  // Initialize services
  const sueParser = new SueParserService();
  const volumeProcessor = new VolumeKeyframeProcessorService();
  const filterBuilder = new FFmpegFilterBuilderService(volumeProcessor);
  const ffmpegRenderer = new FFmpegRendererService();

  // Path to your .sue file (e.g., ~/multiverse.sue)
  const sueFilePath = path.join(process.env.HOME || '', 'multiverse.sue');

  // Path to your public directory where static files are served from
  // For stoked-ui docs: /Users/yourname/work/stoked-ui/docs/public
  const publicDir = path.join(process.cwd(), 'docs/public');

  console.log(`Parsing ${sueFilePath}...`);
  console.log(`Using public directory: ${publicDir}`);

  // Parse .sue file with publicDir to resolve /static/... paths
  const manifest = await sueParser.parseFile(sueFilePath, publicDir);
  console.log(`✓ Parsed timeline with ${manifest.items.length} items\n`);

  // Validate timeline (will check if resolved media files exist)
  console.log('Validating timeline...');
  await sueParser.validateTimeline(manifest);
  console.log('✓ Timeline validation passed\n');

  // Show resolved media paths
  console.log('Resolved media files:');
  manifest.mediaFiles.forEach((label, filePath) => {
    console.log(`  ${label} -> ${filePath}`);
  });
  console.log('');

  // Build filtergraph
  console.log('Building FFmpeg filtergraph...');
  const filterComplex = filterBuilder.buildFilterComplex(manifest);
  console.log(`✓ Built filter with ${filterComplex.inputs.length / 2} inputs\n`);

  // Build FFmpeg args
  const outputPath = path.join(process.env.HOME || '', 'rendered-multiverse.mp4');
  const quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' = 'HIGH';
  const args = filterBuilder.buildFFmpegArgs(filterComplex, outputPath, quality);

  console.log('FFmpeg Command Preview:');
  console.log(`ffmpeg ${args.slice(0, 10).join(' ')} ...\n`);

  // Execute render
  console.log(`Starting render to: ${outputPath}\n`);
  const startTime = Date.now();

  const result = await ffmpegRenderer.render(
    'multiverse-render',
    filterComplex,
    outputPath,
    quality,
    manifest.output.duration,
    (progress) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const eta = progress.speed > 0
        ? ((manifest.output.duration - progress.time) / progress.speed).toFixed(1)
        : '?';

      process.stdout.write(
        `\r[${progress.percentage.toFixed(1)}%] ` +
        `Frame: ${progress.frame} | ` +
        `FPS: ${progress.fps.toFixed(1)} | ` +
        `Speed: ${progress.speed.toFixed(2)}x | ` +
        `Elapsed: ${elapsed}s | ` +
        `ETA: ${eta}s`,
      );
    },
  );

  console.log('\n');

  if (result.success) {
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('✓ Render completed successfully!');
    console.log(`  - Output: ${result.output}`);
    console.log(`  - Total time: ${totalTime}s`);
  } else {
    console.error('✗ Render failed:');
    console.error(`  ${result.error}`);
    process.exit(1);
  }
}

// Run example
renderWithPublicDir()
  .then(() => {
    console.log('\nExample completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nExample failed:', error);
    process.exit(1);
  });
