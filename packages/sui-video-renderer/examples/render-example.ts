/**
 * Example: Render a .sue project using FFmpeg pipeline
 *
 * This demonstrates the complete rendering workflow:
 * 1. Parse .sue file
 * 2. Build FFmpeg filtergraph
 * 3. Execute render with progress tracking
 * 4. Upload to S3
 */

import {
  SueParserService,
  FFmpegFilterBuilderService,
  FFmpegRendererService,
  VolumeKeyframeProcessorService,
} from '../src/render/services';
import { RenderQuality } from '../src/render/dto';
import * as path from 'path';

async function renderExample() {
  // Initialize services
  const sueParser = new SueParserService();
  const volumeProcessor = new VolumeKeyframeProcessorService();
  const filterBuilder = new FFmpegFilterBuilderService(volumeProcessor);
  const ffmpegRenderer = new FFmpegRendererService();

  // Check FFmpeg availability
  console.log('Checking FFmpeg installation...');
  const ffmpegStatus = await ffmpegRenderer.validateFFmpeg();
  if (!ffmpegStatus.installed) {
    throw new Error('FFmpeg not installed. Please install FFmpeg 4.4+');
  }
  console.log(`✓ FFmpeg ${ffmpegStatus.version} detected\n`);

  // Parse .sue file
  const sueFilePath = path.join(__dirname, 'sample-project.sue.json');
  console.log(`Parsing ${sueFilePath}...`);
  const manifest = await sueParser.parseFile(sueFilePath);
  console.log(`✓ Parsed timeline with ${manifest.items.length} items\n`);

  // Validate timeline
  console.log('Validating timeline...');
  await sueParser.validateTimeline(manifest);
  console.log('✓ Timeline validation passed\n');

  // Get statistics
  const stats = sueParser.getTimelineStats(manifest);
  console.log('Timeline Statistics:');
  console.log(`  - Total items: ${stats.totalItems}`);
  console.log(`  - Duration: ${stats.totalDuration}s`);
  console.log(`  - Media files: ${stats.mediaFileCount}`);
  console.log(`  - Has video: ${stats.hasVideo}`);
  console.log(`  - Has audio: ${stats.hasAudio}`);
  console.log(`  - Complexity: ${(stats.complexity * 100).toFixed(1)}%\n`);

  // Build filtergraph
  console.log('Building FFmpeg filtergraph...');
  const filterComplex = filterBuilder.buildFilterComplex(manifest);
  console.log(`✓ Built filter with ${filterComplex.inputs.length / 2} inputs\n`);

  // Show generated filtergraph (for debugging)
  if (process.env.DEBUG) {
    console.log('Filter Graph:');
    console.log(filterComplex.filterGraph);
    console.log('\n');
  }

  // Build FFmpeg args
  const outputPath = path.join(__dirname, '../output/rendered-video.mp4');
  const quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' = 'HIGH';
  const args = filterBuilder.buildFFmpegArgs(filterComplex, outputPath, quality);

  console.log('FFmpeg Command:');
  console.log(`ffmpeg ${args.join(' ')}\n`);

  // Execute render
  console.log(`Starting render (Quality: ${quality})...\n`);
  const startTime = Date.now();

  const result = await ffmpegRenderer.render(
    'example-job-001',
    filterComplex,
    outputPath,
    quality,
    manifest.output.duration,
    (progress) => {
      // Progress callback
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

  // Check result
  if (result.success) {
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('✓ Render completed successfully!');
    console.log(`  - Output: ${result.output}`);
    console.log(`  - Total time: ${totalTime}s`);
    if (result.stats) {
      console.log(`  - Total frames: ${result.stats.totalFrames}`);
      console.log(`  - Average FPS: ${result.stats.averageFps.toFixed(1)}`);
    }
  } else {
    console.error('✗ Render failed:');
    console.error(`  ${result.error}`);
    process.exit(1);
  }
}

// Run example
renderExample()
  .then(() => {
    console.log('\nExample completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nExample failed:', error);
    process.exit(1);
  });
