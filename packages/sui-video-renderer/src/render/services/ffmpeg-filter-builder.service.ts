import { Injectable, Logger } from '@nestjs/common';
import {
  TimelineManifest,
  TimelineItem,
  FitMode,
} from '../dto/sue-format.dto';
import { VolumeKeyframeProcessorService } from './volume-keyframe-processor.service';

/**
 * FFmpeg filter complex structure
 */
export interface FilterComplex {
  /** FFmpeg input arguments (e.g., ['-i', 'video.mp4', '-i', 'audio.mp3']) */
  inputs: string[];

  /** Filter complex graph string */
  filterGraph: string;

  /** Map output streams (e.g., ['-map', '[vout]', '-map', '[aout]']) */
  outputMaps: string[];

  /** Estimated complexity (0-1) */
  complexity: number;
}

/**
 * FFmpegFilterBuilderService
 *
 * Builds FFmpeg filtergraph for compositing video/audio/image layers
 * Generates filter_complex expressions for:
 * - Background generation
 * - Video trimming and scaling
 * - Overlay composition with z-ordering
 * - Audio volume keyframes
 * - Time-based activation/deactivation
 */
@Injectable()
export class FFmpegFilterBuilderService {
  private readonly logger = new Logger(FFmpegFilterBuilderService.name);

  constructor(
    private readonly volumeProcessor: VolumeKeyframeProcessorService,
  ) {}

  /**
   * Build complete FFmpeg filter complex from timeline manifest
   */
  buildFilterComplex(manifest: TimelineManifest): FilterComplex {
    this.logger.log('Building FFmpeg filter complex');

    // Build inputs array
    const inputs: string[] = [];
    const mediaPathToIndex = new Map<string, number>();

    Array.from(manifest.mediaFiles.keys()).forEach((mediaPath, index) => {
      inputs.push('-i', mediaPath);
      mediaPathToIndex.set(mediaPath, index);
    });

    // Build filter graph
    const filters: string[] = [];

    // 1. Generate background layer
    const bgFilter = this.buildBackgroundFilter(manifest);
    filters.push(bgFilter);

    // 2. Process video/image layers
    const videoItems = manifest.items.filter(item =>
      ['video', 'image'].includes(item.controllerName),
    );

    let currentBgLabel = 'bg';
    for (let i = 0; i < videoItems.length; i++) {
      const item = videoItems[i];
      const inputIndex = mediaPathToIndex.get(item.mediaPath)!;
      const outputLabel = i === videoItems.length - 1 ? 'vout' : `bg${i + 1}`;

      const layerFilter = this.buildVideoLayerFilter(
        item,
        inputIndex,
        currentBgLabel,
        outputLabel,
        manifest.output,
      );

      filters.push(...layerFilter);
      currentBgLabel = outputLabel;
    }

    // If no video items, just format background
    if (videoItems.length === 0) {
      filters.push(`[bg]format=yuv420p[vout]`);
    }

    // 3. Process audio tracks
    const audioItems = manifest.items.filter(
      item => item.controllerName === 'audio',
    );

    if (audioItems.length > 0) {
      const audioFilter = this.buildAudioFilter(
        audioItems,
        mediaPathToIndex,
        manifest.output.duration,
      );
      filters.push(...audioFilter);
    }

    // 4. Build output maps
    const outputMaps: string[] = ['-map', '[vout]'];
    if (audioItems.length > 0) {
      outputMaps.push('-map', '[aout]');
    }

    // Calculate complexity
    const complexity = this.calculateComplexity(manifest);

    const filterGraph = filters.join(';\n');

    this.logger.log(
      `Built filter complex: ${inputs.length / 2} inputs, ${filters.length} filters, complexity: ${complexity.toFixed(2)}`,
    );

    return {
      inputs,
      filterGraph,
      outputMaps,
      complexity,
    };
  }

  /**
   * Build background layer filter
   */
  private buildBackgroundFilter(manifest: TimelineManifest): string {
    const { width, height, duration, backgroundColor } = manifest.output;

    // Parse background color
    let color = 'black';
    if (backgroundColor && backgroundColor !== 'transparent') {
      color = backgroundColor.startsWith('#')
        ? backgroundColor
        : backgroundColor;
    }

    // Generate background using color source
    // color=c=COLOR:s=WIDTHxHEIGHT:d=DURATION[bg]
    return `color=c=${color}:s=${width}x${height}:d=${duration}:r=${manifest.output.frameRate}[bg]`;
  }

  /**
   * Build video layer filter (trim, scale, overlay)
   */
  private buildVideoLayerFilter(
    item: TimelineItem,
    inputIndex: number,
    inputLabel: string,
    outputLabel: string,
    outputConfig: TimelineManifest['output'],
  ): string[] {
    const filters: string[] = [];
    const videoInput = `[${inputIndex}:v]`;

    // 1. Trim video
    const trimEnd = item.trimStart + item.outputDuration;
    let currentLabel = videoInput;

    // Apply loop if needed
    if (item.loop > 0) {
      const loopLabel = `v${inputIndex}_loop`;
      filters.push(
        `${currentLabel}loop=loop=${item.loop}:size=32767:start=0[${loopLabel}]`,
      );
      currentLabel = `[${loopLabel}]`;
    }

    // Trim and reset PTS
    const trimLabel = `v${inputIndex}_trim`;
    filters.push(
      `${currentLabel}trim=start=${item.trimStart}:end=${trimEnd},setpts=PTS-STARTPTS[${trimLabel}]`,
    );

    // 2. Scale/fit video
    const scaleLabel = `v${inputIndex}_scale`;
    const scaleFilter = this.buildScaleFilter(
      item,
      outputConfig.width,
      outputConfig.height,
    );
    filters.push(`[${trimLabel}]${scaleFilter}[${scaleLabel}]`);

    // 3. Overlay on background with time enable
    const enableExpr = `between(t,${item.start},${item.end})`;
    const x = item.x !== undefined ? item.x : 0;
    const y = item.y !== undefined ? item.y : 0;

    filters.push(
      `[${inputLabel}][${scaleLabel}]overlay=x=${x}:y=${y}:enable='${enableExpr}'[${outputLabel}]`,
    );

    return filters;
  }

  /**
   * Build scale filter based on fit mode
   */
  private buildScaleFilter(
    item: TimelineItem,
    canvasWidth: number,
    canvasHeight: number,
  ): string {
    const targetWidth = item.width || canvasWidth;
    const targetHeight = item.height || canvasHeight;

    switch (item.fit) {
      case FitMode.FILL:
        // Scale to exact dimensions, ignoring aspect ratio
        return `scale=${targetWidth}:${targetHeight}`;

      case FitMode.CONTAIN:
        // Scale to fit inside, maintain aspect ratio, add padding
        return `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2`;

      case FitMode.COVER:
        // Scale to cover, maintain aspect ratio, crop excess
        return `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight}`;

      case FitMode.NONE:
        // No scaling, just center
        return `pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2`;

      default:
        return `scale=${targetWidth}:${targetHeight}`;
    }
  }

  /**
   * Build audio filter with volume keyframes
   */
  private buildAudioFilter(
    audioItems: TimelineItem[],
    mediaPathToIndex: Map<string, number>,
    totalDuration: number,
  ): string[] {
    const filters: string[] = [];
    const processedAudioLabels: string[] = [];

    for (let i = 0; i < audioItems.length; i++) {
      const item = audioItems[i];
      const inputIndex = mediaPathToIndex.get(item.mediaPath)!;
      const audioInput = `[${inputIndex}:a]`;

      // 1. Trim audio
      const trimEnd = item.trimStart + item.outputDuration;
      const trimLabel = `a${i}_trim`;
      filters.push(
        `${audioInput}atrim=start=${item.trimStart}:end=${trimEnd},asetpts=PTS-STARTPTS[${trimLabel}]`,
      );

      // 2. Apply volume keyframes if present
      let currentLabel = `[${trimLabel}]`;
      if (item.volume && item.volume.length > 0) {
        const volumeFilter = this.volumeProcessor.generateVolumeFilter(
          item.volume,
          item.start,
        );
        if (volumeFilter) {
          const volLabel = `a${i}_vol`;
          filters.push(`[${trimLabel}]${volumeFilter}[${volLabel}]`);
          currentLabel = `[${volLabel}]`;
        }
      }

      // 3. Add delay to align with timeline start time
      if (item.start > 0) {
        const delayLabel = `a${i}_delay`;
        const delaySamples = Math.floor(item.start * 48000); // Assume 48kHz
        filters.push(
          `${currentLabel}adelay=${delaySamples}|${delaySamples}[${delayLabel}]`,
        );
        currentLabel = `[${delayLabel}]`;
      }

      processedAudioLabels.push(currentLabel);
    }

    // 4. Mix all audio tracks
    if (processedAudioLabels.length > 1) {
      const mixInput = processedAudioLabels.join('');
      filters.push(
        `${mixInput}amix=inputs=${processedAudioLabels.length}:duration=longest[aout]`,
      );
    } else if (processedAudioLabels.length === 1) {
      // Single audio track
      filters.push(`${processedAudioLabels[0]}acopy[aout]`);
    }

    return filters;
  }

  /**
   * Calculate filter complexity for estimation
   */
  private calculateComplexity(manifest: TimelineManifest): number {
    const videoLayers = manifest.items.filter(item =>
      ['video', 'image'].includes(item.controllerName),
    ).length;
    const audioTracks = manifest.items.filter(
      item => item.controllerName === 'audio',
    ).length;
    const totalDuration = manifest.output.duration;

    // Complexity factors:
    // - Video layers (each overlay adds complexity)
    // - Audio tracks (mixing adds complexity)
    // - Duration (longer = more processing)
    const layerComplexity = videoLayers * 0.2;
    const audioComplexity = audioTracks * 0.1;
    const durationComplexity = Math.min(totalDuration / 300, 0.5); // Max 5min = 0.5

    return Math.min(1.0, layerComplexity + audioComplexity + durationComplexity);
  }

  /**
   * Generate FFmpeg command arguments
   */
  buildFFmpegArgs(
    filterComplex: FilterComplex,
    outputPath: string,
    quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' = 'HIGH',
  ): string[] {
    const args: string[] = [];

    // Add inputs
    args.push(...filterComplex.inputs);

    // Add filter complex
    args.push('-filter_complex', filterComplex.filterGraph);

    // Add output maps
    args.push(...filterComplex.outputMaps);

    // Add encoding settings based on quality
    const crfValues = { LOW: 28, MEDIUM: 23, HIGH: 18, ULTRA: 15 };
    const presets = { LOW: 'veryfast', MEDIUM: 'fast', HIGH: 'medium', ULTRA: 'slow' };

    args.push(
      '-c:v', 'libx264',
      '-preset', presets[quality],
      '-crf', crfValues[quality].toString(),
      '-pix_fmt', 'yuv420p',
    );

    // Audio encoding
    if (filterComplex.outputMaps.includes('[aout]')) {
      args.push(
        '-c:a', 'aac',
        '-b:a', '192k',
        '-ar', '48000',
      );
    }

    // Output file
    args.push('-y', outputPath);

    return args;
  }
}
