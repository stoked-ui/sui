import { Injectable, Logger } from '@nestjs/common';
import { SueManifestDto } from '../dto';
import { ChromiumRendererService, CapturedFrame } from './chromium-renderer.service';
import { FFmpegEncoderService, FFmpegEncodingOptions } from './ffmpeg-encoder.service';
import { TimelineEvaluatorService } from './timeline-evaluator.service';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Render job configuration
 */
export interface RenderJobConfig {
  manifest: SueManifestDto;
  outputPath: string;
  fps?: number;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  onProgress?: (progress: RenderProgress) => void;
}

/**
 * Render progress data
 */
export interface RenderProgress {
  phase: string;
  progress: number;
  currentFrame?: number;
  totalFrames?: number;
  estimatedTimeRemaining?: number;
}

/**
 * Quality preset configurations
 */
const QUALITY_PRESETS = {
  low: { preset: 'ultrafast', crf: 28 },
  medium: { preset: 'fast', crf: 23 },
  high: { preset: 'medium', crf: 20 },
  ultra: { preset: 'slow', crf: 18 },
};

/**
 * FrameStreamPipeline Service
 *
 * Orchestrates the complete rendering pipeline:
 * 1. Initialize Chromium renderer
 * 2. Stream frames from canvas
 * 3. Pipe raw RGBA to FFmpeg
 * 4. Handle audio separately
 * 5. Merge video + audio
 * 6. Cleanup temporary files
 */
@Injectable()
export class FrameStreamPipelineService {
  private readonly logger = new Logger(FrameStreamPipelineService.name);

  constructor(
    private readonly chromiumRenderer: ChromiumRendererService,
    private readonly ffmpegEncoder: FFmpegEncoderService,
    private readonly timelineEvaluator: TimelineEvaluatorService,
  ) {}

  /**
   * Execute complete rendering pipeline
   *
   * @param config Render job configuration
   * @returns Path to rendered video file
   */
  async render(config: RenderJobConfig): Promise<string> {
    const startTime = Date.now();
    const { manifest, outputPath, fps = 60, quality = 'medium', onProgress } = config;

    this.logger.log(`Starting render pipeline: ${outputPath}`);
    this.logger.log(`Configuration: ${fps}fps, quality=${quality}`);

    try {
      // Phase 1: Calculate duration and frame count
      this.updateProgress(onProgress, {
        phase: 'initialization',
        progress: 0,
      });

      const duration = this.timelineEvaluator.calculateDuration(manifest);
      const totalFrames = Math.ceil(duration * fps);

      this.logger.log(`Rendering ${totalFrames} frames (${duration}s @ ${fps}fps)`);

      // Phase 2: Initialize Chromium renderer
      this.updateProgress(onProgress, {
        phase: 'initializing_renderer',
        progress: 5,
      });

      const page = await this.chromiumRenderer.initializeRenderPage(manifest);

      // Phase 3: Prepare output paths
      const tempVideoPath = this.getTempPath(outputPath, 'video');
      const tempAudioPath = this.getTempPath(outputPath, 'audio');
      const hasAudio = this.hasAudioTracks(manifest);

      // Phase 4: Render and encode video
      this.updateProgress(onProgress, {
        phase: 'rendering_frames',
        progress: 10,
        totalFrames,
      });

      await this.renderAndEncodeVideo(
        manifest,
        tempVideoPath,
        fps,
        quality,
        duration,
        (frameProgress) => {
          const progress = 10 + (frameProgress * 70); // 10-80%
          this.updateProgress(onProgress, {
            phase: 'rendering_frames',
            progress,
            currentFrame: frameProgress * totalFrames,
            totalFrames,
            estimatedTimeRemaining: this.estimateTimeRemaining(
              startTime,
              frameProgress,
            ),
          });
        },
      );

      // Phase 5: Handle audio (if present)
      if (hasAudio) {
        this.updateProgress(onProgress, {
          phase: 'encoding_audio',
          progress: 80,
        });

        await this.processAudioTracks(manifest, tempAudioPath, duration);

        // Phase 6: Merge video and audio
        this.updateProgress(onProgress, {
          phase: 'merging',
          progress: 90,
        });

        await this.ffmpegEncoder.mergeVideoAndAudio(
          tempVideoPath,
          tempAudioPath,
          outputPath,
        );

        // Cleanup temp files
        await this.cleanupTempFiles([tempVideoPath, tempAudioPath]);
      } else {
        // No audio, just rename temp video to final output
        await fs.promises.rename(tempVideoPath, outputPath);
      }

      // Phase 7: Cleanup and finalize
      await this.chromiumRenderer.closeBrowser();

      this.updateProgress(onProgress, {
        phase: 'completed',
        progress: 100,
      });

      const renderTime = (Date.now() - startTime) / 1000;
      this.logger.log(`Rendering complete in ${renderTime.toFixed(2)}s: ${outputPath}`);

      return outputPath;
    } catch (error) {
      this.logger.error('Rendering failed', error);
      await this.chromiumRenderer.closeBrowser();
      throw error;
    }
  }

  /**
   * Render frames and encode to video
   */
  private async renderAndEncodeVideo(
    manifest: SueManifestDto,
    outputPath: string,
    fps: number,
    quality: string,
    duration: number,
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    const qualityPreset = QUALITY_PRESETS[quality] || QUALITY_PRESETS.medium;

    // Create frame generator
    const frameGenerator = this.chromiumRenderer.renderFrameSequence(
      manifest,
      fps,
      duration,
    );

    // Convert to buffer generator for FFmpeg
    const bufferGenerator = this.createBufferGenerator(
      frameGenerator,
      fps,
      duration,
      onProgress,
    );

    // Encode video
    const encodingOptions: FFmpegEncodingOptions = {
      width: manifest.width,
      height: manifest.height,
      fps,
      outputPath,
      codec: 'libx264',
      preset: qualityPreset.preset,
      crf: qualityPreset.crf,
      pixelFormat: 'yuv420p',
      movflags: ['+faststart'],
    };

    await this.ffmpegEncoder.encodeFromFrameStream(bufferGenerator, encodingOptions);
  }

  /**
   * Create buffer generator with progress tracking
   */
  private async *createBufferGenerator(
    frameGenerator: AsyncGenerator<CapturedFrame>,
    fps: number,
    duration: number,
    onProgress?: (progress: number) => void,
  ): AsyncGenerator<Buffer> {
    const totalFrames = Math.ceil(duration * fps);
    let frameCount = 0;

    for await (const frame of frameGenerator) {
      yield frame.buffer;

      frameCount++;
      if (onProgress && frameCount % fps === 0) {
        const progress = frameCount / totalFrames;
        onProgress(progress);
      }
    }
  }

  /**
   * Process audio tracks from manifest
   */
  private async processAudioTracks(
    manifest: SueManifestDto,
    outputPath: string,
    duration: number,
  ): Promise<void> {
    // Extract audio tracks from manifest
    const audioTracks = manifest.tracks.filter(
      (track) => track.controllerName === 'audio',
    );

    if (audioTracks.length === 0) {
      return;
    }

    this.logger.log(`Processing ${audioTracks.length} audio tracks`);

    if (audioTracks.length === 1) {
      // Single audio track
      const track = audioTracks[0];
      const action = track.actions[0];

      await this.ffmpegEncoder.encodeAudioTrack(track.url, outputPath, {
        startTime: action?.trimStart || 0,
        duration: action?.duration || duration,
        volume: this.getAverageVolume(action),
      });
    } else {
      // Multiple audio tracks - mix them
      const tempAudioPaths: string[] = [];
      const volumes: number[] = [];

      for (let i = 0; i < audioTracks.length; i++) {
        const track = audioTracks[i];
        const action = track.actions[0];
        const tempPath = this.getTempPath(outputPath, `audio_${i}`);

        await this.ffmpegEncoder.encodeAudioTrack(track.url, tempPath, {
          startTime: action?.trimStart || 0,
          duration: action?.duration || duration,
          volume: this.getAverageVolume(action),
        });

        tempAudioPaths.push(tempPath);
        volumes.push(this.getAverageVolume(action));
      }

      // Mix all audio tracks
      await this.ffmpegEncoder.mixAudioTracks(tempAudioPaths, outputPath, volumes);

      // Cleanup temp audio files
      await this.cleanupTempFiles(tempAudioPaths);
    }
  }

  /**
   * Check if manifest has audio tracks
   */
  private hasAudioTracks(manifest: SueManifestDto): boolean {
    return manifest.tracks.some((track) => track.controllerName === 'audio');
  }

  /**
   * Get average volume from action volume keyframes
   */
  private getAverageVolume(action: any): number {
    if (!action?.volume || action.volume.length === 0) {
      return 1.0;
    }

    const totalVolume = action.volume.reduce((sum, keyframe) => sum + keyframe[0], 0);
    return totalVolume / action.volume.length;
  }

  /**
   * Generate temporary file path
   */
  private getTempPath(basePath: string, suffix: string): string {
    const dir = path.dirname(basePath);
    const ext = path.extname(basePath);
    const basename = path.basename(basePath, ext);
    return path.join(dir, `${basename}_temp_${suffix}${ext}`);
  }

  /**
   * Cleanup temporary files
   */
  private async cleanupTempFiles(paths: string[]): Promise<void> {
    for (const filePath of paths) {
      try {
        await fs.promises.unlink(filePath);
        this.logger.debug(`Deleted temp file: ${filePath}`);
      } catch (error) {
        this.logger.warn(`Failed to delete temp file: ${filePath}`);
      }
    }
  }

  /**
   * Estimate time remaining based on current progress
   */
  private estimateTimeRemaining(startTime: number, progress: number): number {
    if (progress === 0) {
      return 0;
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const totalEstimated = elapsed / progress;
    return Math.max(0, totalEstimated - elapsed);
  }

  /**
   * Update progress callback
   */
  private updateProgress(
    callback: ((progress: RenderProgress) => void) | undefined,
    progress: RenderProgress,
  ): void {
    if (callback) {
      callback(progress);
    }
  }

  /**
   * Render with parallel segment processing (optimization)
   * Splits timeline into segments and renders in parallel
   */
  async renderParallel(
    config: RenderJobConfig,
    segmentCount: number = 4,
  ): Promise<string> {
    const { manifest, outputPath, fps = 60, quality = 'medium' } = config;

    this.logger.log(`Starting parallel render with ${segmentCount} segments`);

    const duration = this.timelineEvaluator.calculateDuration(manifest);
    const segmentDuration = duration / segmentCount;

    // Render segments in parallel
    const segmentPaths: string[] = [];
    const renderPromises: Promise<void>[] = [];

    for (let i = 0; i < segmentCount; i++) {
      const segmentStart = i * segmentDuration;
      const segmentEnd = Math.min((i + 1) * segmentDuration, duration);
      const segmentPath = this.getTempPath(outputPath, `segment_${i}`);

      segmentPaths.push(segmentPath);

      // Create segment manifest
      const segmentManifest = this.createSegmentManifest(
        manifest,
        segmentStart,
        segmentEnd,
      );

      // Render segment
      const segmentConfig: RenderJobConfig = {
        manifest: segmentManifest,
        outputPath: segmentPath,
        fps,
        quality,
      };

      renderPromises.push(
        this.render(segmentConfig).then(() => undefined)
      );
    }

    // Wait for all segments to complete
    await Promise.all(renderPromises);

    // Concatenate segments
    await this.concatenateVideoSegments(segmentPaths, outputPath);

    // Cleanup segment files
    await this.cleanupTempFiles(segmentPaths);

    this.logger.log(`Parallel rendering complete: ${outputPath}`);
    return outputPath;
  }

  /**
   * Create segment manifest for parallel processing
   */
  private createSegmentManifest(
    manifest: SueManifestDto,
    startTime: number,
    endTime: number,
  ): SueManifestDto {
    // Clone manifest and adjust action times
    const segmentManifest = JSON.parse(JSON.stringify(manifest));

    for (const track of segmentManifest.tracks) {
      track.actions = track.actions
        .filter((action) => action.end > startTime && action.start < endTime)
        .map((action) => ({
          ...action,
          start: Math.max(0, action.start - startTime),
          end: Math.min(endTime - startTime, action.end - startTime),
        }));
    }

    segmentManifest.duration = endTime - startTime;

    return segmentManifest;
  }

  /**
   * Concatenate video segments using FFmpeg
   */
  private async concatenateVideoSegments(
    segmentPaths: string[],
    outputPath: string,
  ): Promise<void> {
    this.logger.log(`Concatenating ${segmentPaths.length} video segments`);

    // Create concat file list
    const concatListPath = this.getTempPath(outputPath, 'concat_list.txt');
    const concatContent = segmentPaths.map((p) => `file '${p}'`).join('\n');
    await fs.promises.writeFile(concatListPath, concatContent);

    // Use FFmpeg concat demuxer
    const { spawn } = require('child_process');
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatListPath,
      '-c', 'copy',
      '-y',
      outputPath,
    ]);

    await new Promise<void>((resolve, reject) => {
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg concatenation failed with code ${code}`));
        }
      });
    });

    // Cleanup concat list
    await fs.promises.unlink(concatListPath);
  }
}
