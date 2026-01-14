import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { promises as fs } from 'fs';
import path from 'path';
import {
  ValidationConfig,
  ValidationResult,
  FrameComparisonResult,
  ExtractedFrame,
  VideoMetadata,
  PixelMatchOptions,
} from './types';

/**
 * Default validation configuration
 */
const DEFAULT_CONFIG: ValidationConfig = {
  frameCount: 8,
  passThreshold: 0.9,
  pixelMatchOptions: {
    threshold: 0.1,
    includeAA: true,
    alpha: 0.1,
    aaColor: 0.1,
    diffColor: [255, 0, 0, 255],
  },
  generateDiffs: false,
  outputDir: './validation-output',
  verbose: false,
};

/**
 * Video rendering validation test harness
 */
export class VideoValidator {
  private config: ValidationConfig;
  private tempDir: string;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.tempDir = path.join(this.config.outputDir, 'temp');
  }

  /**
   * Validate a rendered video against reference video
   */
  async validate(
    referenceVideo: string,
    outputVideo: string,
  ): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      // Ensure output directory exists
      await this.ensureDirectories();

      // Get video metadata
      const [refMetadata, outMetadata] = await Promise.all([
        this.getVideoMetadata(referenceVideo),
        this.getVideoMetadata(outputVideo),
      ]);

      this.log(`Reference: ${refMetadata.width}x${refMetadata.height} @ ${refMetadata.fps}fps, ${refMetadata.duration.toFixed(2)}s`);
      this.log(`Output: ${outMetadata.width}x${outMetadata.height} @ ${outMetadata.fps}fps, ${outMetadata.duration.toFixed(2)}s`);

      // Validate video compatibility
      this.validateCompatibility(refMetadata, outMetadata);

      // Extract frames from both videos
      const [refFrames, outFrames] = await Promise.all([
        this.extractFrames(referenceVideo, refMetadata, 'ref'),
        this.extractFrames(outputVideo, outMetadata, 'out'),
      ]);

      this.log(`Extracted ${refFrames.length} reference frames and ${outFrames.length} output frames`);

      // Compare frames
      const frameResults = await this.compareFrames(refFrames, outFrames);

      // Calculate overall score
      const overallScore = frameResults.reduce((sum, result) => sum + result.matchScore, 0) / frameResults.length;
      const passed = overallScore >= this.config.passThreshold;

      const result: ValidationResult = {
        referenceVideo,
        outputVideo,
        frameResults,
        overallScore,
        passed,
        threshold: this.config.passThreshold,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };

      // Cleanup temp files
      await this.cleanup();

      return result;
    } catch (error) {
      const result: ValidationResult = {
        referenceVideo,
        outputVideo,
        frameResults: [],
        overallScore: 0,
        passed: false,
        threshold: this.config.passThreshold,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };

      await this.cleanup();
      return result;
    }
  }

  /**
   * Get video metadata using ffprobe
   */
  private async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(new Error(`Failed to probe video ${videoPath}: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error(`No video stream found in ${videoPath}`));
          return;
        }

        const stats = require('fs').statSync(videoPath);

        resolve({
          path: videoPath,
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          fps: this.parseFPS(videoStream.r_frame_rate || '30'),
          codec: videoStream.codec_name || 'unknown',
          size: stats.size,
        });
      });
    });
  }

  /**
   * Parse frame rate string (e.g., "30/1" -> 30)
   */
  private parseFPS(fpsString: string): number {
    const parts = fpsString.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) / parseInt(parts[1], 10);
    }
    return parseFloat(fpsString);
  }

  /**
   * Validate that videos are compatible for comparison
   */
  private validateCompatibility(ref: VideoMetadata, out: VideoMetadata): void {
    if (ref.width !== out.width || ref.height !== out.height) {
      throw new Error(
        `Video dimensions mismatch: reference ${ref.width}x${ref.height}, output ${out.width}x${out.height}`,
      );
    }

    // Allow some tolerance for duration differences (1% or 0.1s)
    const durationDiff = Math.abs(ref.duration - out.duration);
    const tolerance = Math.max(ref.duration * 0.01, 0.1);

    if (durationDiff > tolerance) {
      throw new Error(
        `Video duration mismatch: reference ${ref.duration.toFixed(2)}s, output ${out.duration.toFixed(2)}s (diff: ${durationDiff.toFixed(2)}s)`,
      );
    }
  }

  /**
   * Extract frames evenly spaced throughout the video
   */
  private async extractFrames(
    videoPath: string,
    metadata: VideoMetadata,
    prefix: string,
  ): Promise<ExtractedFrame[]> {
    const frames: ExtractedFrame[] = [];
    const duration = metadata.duration;
    const frameCount = this.config.frameCount;

    // Calculate timestamps for evenly spaced frames
    // Skip first and last 5% to avoid fade in/out
    const startTime = duration * 0.05;
    const endTime = duration * 0.95;
    const interval = (endTime - startTime) / (frameCount - 1);

    for (let i = 0; i < frameCount; i++) {
      const timestamp = startTime + interval * i;
      const frameNumber = i;
      const outputPath = path.join(
        this.tempDir,
        `${prefix}_frame_${frameNumber.toString().padStart(3, '0')}.png`,
      );

      await this.extractSingleFrame(videoPath, timestamp, outputPath);

      frames.push({
        frameNumber,
        timestamp,
        path: outputPath,
        width: metadata.width,
        height: metadata.height,
      });

      this.log(`Extracted ${prefix} frame ${i + 1}/${frameCount} at ${timestamp.toFixed(2)}s`);
    }

    return frames;
  }

  /**
   * Extract a single frame at specified timestamp
   */
  private async extractSingleFrame(
    videoPath: string,
    timestamp: number,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`Frame extraction failed: ${err.message}`)))
        .run();
    });
  }

  /**
   * Compare corresponding frames from reference and output videos
   */
  private async compareFrames(
    refFrames: ExtractedFrame[],
    outFrames: ExtractedFrame[],
  ): Promise<FrameComparisonResult[]> {
    const results: FrameComparisonResult[] = [];

    for (let i = 0; i < Math.min(refFrames.length, outFrames.length); i++) {
      const result = await this.compareFrame(refFrames[i], outFrames[i]);
      results.push(result);

      this.log(
        `Frame ${i + 1}: ${(result.matchScore * 100).toFixed(2)}% match (${result.differentPixels.toLocaleString()} different pixels)`,
      );
    }

    return results;
  }

  /**
   * Compare a single pair of frames
   */
  private async compareFrame(
    refFrame: ExtractedFrame,
    outFrame: ExtractedFrame,
  ): Promise<FrameComparisonResult> {
    // Load both images as raw pixel data
    const [refImage, outImage] = await Promise.all([
      sharp(refFrame.path).raw().toBuffer({ resolveWithObject: true }),
      sharp(outFrame.path).raw().toBuffer({ resolveWithObject: true }),
    ]);

    // Ensure dimensions match
    if (
      refImage.info.width !== outImage.info.width ||
      refImage.info.height !== outImage.info.height
    ) {
      throw new Error('Frame dimensions do not match');
    }

    const width = refImage.info.width;
    const height = refImage.info.height;
    const totalPixels = width * height;

    // Prepare diff image buffer if generating diffs
    let diffBuffer: Buffer | null = null;
    let diffImagePath: string | undefined;

    if (this.config.generateDiffs) {
      diffBuffer = Buffer.alloc(width * height * 4);
    }

    // Compare pixels using pixelmatch
    const pixelMatchOpts = {
      threshold: this.config.pixelMatchOptions.threshold || 0.1,
      includeAA: this.config.pixelMatchOptions.includeAA ?? true,
      alpha: this.config.pixelMatchOptions.alpha || 0.1,
      aaColor: this.config.pixelMatchOptions.aaColor || 0.1,
      diffColor: this.config.pixelMatchOptions.diffColor || [255, 0, 0, 255],
    };

    const differentPixels = pixelmatch(
      refImage.data,
      outImage.data,
      diffBuffer,
      width,
      height,
      pixelMatchOpts as any,
    );

    // Save diff image if requested
    if (this.config.generateDiffs && diffBuffer) {
      diffImagePath = path.join(
        this.config.outputDir,
        `diff_frame_${refFrame.frameNumber.toString().padStart(3, '0')}.png`,
      );

      await sharp(diffBuffer, {
        raw: {
          width,
          height,
          channels: 4,
        },
      })
        .png()
        .toFile(diffImagePath);
    }

    const matchScore = 1 - differentPixels / totalPixels;
    const differencePercentage = (differentPixels / totalPixels) * 100;

    return {
      referenceFrame: refFrame,
      outputFrame: outFrame,
      matchScore,
      differentPixels,
      totalPixels,
      differencePercentage,
      diffImagePath,
    };
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.tempDir, { recursive: true });

    if (this.config.generateDiffs) {
      await fs.mkdir(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Clean up temporary files
   */
  private async cleanup(): Promise<void> {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Log message if verbose mode enabled
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[VideoValidator] ${message}`);
    }
  }
}
