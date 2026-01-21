import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import { S3Service } from '../s3/s3.service';

// CommonJS modules require require() for proper typing
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpeg = require('fluent-ffmpeg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp');

/**
 * Sprite sheet configuration
 */
export interface SpriteConfig {
  totalFrames: number;
  framesPerRow: number;
  frameWidth: number;
  frameHeight: number;
  spriteSheetWidth: number;
  spriteSheetHeight: number;
  interval: number; // seconds between frames
}

/**
 * Thumbnail size configuration
 */
export enum ThumbnailSize {
  SMALL = 'small', // 160x90
  MEDIUM = 'medium', // 320x180
  LARGE = 'large', // 640x360
}

/**
 * Thumbnail generation result
 */
export interface ThumbnailResult {
  thumbnailUrl: string;
  thumbnailKey: string;
  width: number;
  height: number;
}

/**
 * Sprite sheet generation result
 */
export interface SpriteSheetResult {
  spriteSheetUrl: string;
  spriteSheetKey: string;
  vttUrl: string;
  vttKey: string;
  spriteConfig: SpriteConfig;
}

/**
 * ThumbnailGenerationService
 *
 * Handles generation of:
 * - Single thumbnails at specific timestamps
 * - Sprite sheets for video scrubbing
 * - VTT files for sprite sheet coordinates
 * - Upload to S3
 */
@Injectable()
export class ThumbnailGenerationService {
  private readonly logger = new Logger(ThumbnailGenerationService.name);

  // Thumbnail dimensions by size
  private readonly THUMBNAIL_DIMENSIONS = {
    [ThumbnailSize.SMALL]: { width: 160, height: 90 },
    [ThumbnailSize.MEDIUM]: { width: 320, height: 180 },
    [ThumbnailSize.LARGE]: { width: 640, height: 360 },
  };

  // Sprite sheet defaults
  private readonly DEFAULT_SPRITE_FRAME_WIDTH = 160;
  private readonly DEFAULT_SPRITE_FRAME_HEIGHT = 90;
  private readonly DEFAULT_FRAMES_PER_ROW = 10;

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate a single thumbnail at a specific timestamp
   */
  async generateThumbnail(
    videoPath: string,
    timestamp: number,
    size: ThumbnailSize = ThumbnailSize.MEDIUM,
    bucket: string,
    keyPrefix: string,
  ): Promise<ThumbnailResult> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'thumbnail-'));
    const tempFile = path.join(tempDir, 'thumbnail.jpg');

    try {
      this.logger.log(
        `Generating ${size} thumbnail at ${timestamp}s for ${videoPath}`,
      );

      // Extract frame using FFmpeg
      await this.extractFrame(videoPath, timestamp, tempFile);

      // Resize to target size
      const dimensions = this.THUMBNAIL_DIMENSIONS[size];
      const buffer = await sharp(tempFile)
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload to S3
      const key = `${keyPrefix}/thumbnails/${size}-${timestamp}s.jpg`;
      await this.s3Service.putObject({
        buffer,
        key,
        bucket,
        contentType: 'image/jpeg',
      });

      const thumbnailUrl = this.buildS3Url(bucket, key);

      this.logger.log(`Thumbnail uploaded to ${thumbnailUrl}`);

      return {
        thumbnailUrl,
        thumbnailKey: key,
        width: dimensions.width,
        height: dimensions.height,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate thumbnail: ${(error as Error).message}`,
      );
      throw error;
    } finally {
      // Cleanup temp files
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  /**
   * Generate multiple thumbnails at different sizes
   */
  async generateThumbnails(
    videoPath: string,
    timestamp: number,
    sizes: ThumbnailSize[],
    bucket: string,
    keyPrefix: string,
  ): Promise<ThumbnailResult[]> {
    const results: ThumbnailResult[] = [];

    for (const size of sizes) {
      const result = await this.generateThumbnail(
        videoPath,
        timestamp,
        size,
        bucket,
        keyPrefix,
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Generate sprite sheet for video scrubbing
   */
  async generateSpriteSheet(
    videoPath: string,
    duration: number,
    bucket: string,
    keyPrefix: string,
    options?: {
      frameWidth?: number;
      frameHeight?: number;
      framesPerRow?: number;
      interval?: number; // seconds between frames (default: auto-calculated)
    },
  ): Promise<SpriteSheetResult> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sprites-'));

    try {
      this.logger.log(`Generating sprite sheet for ${videoPath}`);

      // Calculate sprite generation parameters
      const frameWidth =
        options?.frameWidth || this.DEFAULT_SPRITE_FRAME_WIDTH;
      const frameHeight =
        options?.frameHeight || this.DEFAULT_SPRITE_FRAME_HEIGHT;
      const framesPerRow =
        options?.framesPerRow || this.DEFAULT_FRAMES_PER_ROW;

      // Calculate interval and total frames
      // For videos under 2 min: frame every 5 seconds
      // For videos 2-10 min: frame every 10 seconds
      // For videos over 10 min: frame every 15 seconds
      let interval = options?.interval;
      if (!interval) {
        if (duration < 120) {
          interval = 5;
        } else if (duration < 600) {
          interval = 10;
        } else {
          interval = 15;
        }
      }

      const totalFrames = Math.floor(duration / interval);
      const framesCount = Math.min(totalFrames, 100); // Cap at 100 frames

      this.logger.log(
        `Extracting ${framesCount} frames at ${interval}s intervals`,
      );

      // Extract frames
      const frameFiles = await this.extractFrames(
        videoPath,
        framesCount,
        interval,
        tempDir,
        frameWidth,
        frameHeight,
      );

      // Create sprite sheet
      const spriteSheetBuffer = await this.createSpriteSheet(
        frameFiles,
        framesPerRow,
        frameWidth,
        frameHeight,
      );

      // Calculate sprite sheet dimensions
      const rows = Math.ceil(frameFiles.length / framesPerRow);
      const spriteSheetWidth = framesPerRow * frameWidth;
      const spriteSheetHeight = rows * frameHeight;

      // Upload sprite sheet to S3
      const spriteKey = `${keyPrefix}/sprites/sprite-sheet.jpg`;
      await this.s3Service.putObject({
        buffer: spriteSheetBuffer,
        key: spriteKey,
        bucket,
        contentType: 'image/jpeg',
      });

      const spriteSheetUrl = this.buildS3Url(bucket, spriteKey);

      // Generate VTT file
      const vttContent = this.generateVTT(
        spriteSheetUrl,
        frameFiles.length,
        framesPerRow,
        frameWidth,
        frameHeight,
        interval,
      );

      // Upload VTT to S3
      const vttKey = `${keyPrefix}/sprites/sprite-sheet.vtt`;
      const vttBuffer = Buffer.from(vttContent, 'utf-8');
      await this.s3Service.putObject({
        buffer: vttBuffer,
        key: vttKey,
        bucket,
        contentType: 'text/vtt',
      });

      const vttUrl = this.buildS3Url(bucket, vttKey);

      this.logger.log(`Sprite sheet uploaded to ${spriteSheetUrl}`);

      const spriteConfig: SpriteConfig = {
        totalFrames: frameFiles.length,
        framesPerRow,
        frameWidth,
        frameHeight,
        spriteSheetWidth,
        spriteSheetHeight,
        interval,
      };

      return {
        spriteSheetUrl,
        spriteSheetKey: spriteKey,
        vttUrl,
        vttKey,
        spriteConfig,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate sprite sheet: ${(error as Error).message}`,
      );
      throw error;
    } finally {
      // Cleanup temp files
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  /**
   * Extract a single frame from video at specified timestamp
   */
  private extractFrame(
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
        .on('error', (error) => reject(error))
        .run();
    });
  }

  /**
   * Extract multiple frames from video at regular intervals
   */
  private async extractFrames(
    videoPath: string,
    frameCount: number,
    interval: number,
    outputDir: string,
    width: number,
    height: number,
  ): Promise<string[]> {
    const frameFiles: string[] = [];

    for (let i = 0; i < frameCount; i++) {
      const timestamp = i * interval;
      const framePath = path.join(outputDir, `frame-${i.toString().padStart(4, '0')}.jpg`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoPath)
          .seekInput(timestamp)
          .frames(1)
          .size(`${width}x${height}`)
          .output(framePath)
          .on('end', () => {
            frameFiles.push(framePath);
            resolve();
          })
          .on('error', (error) => reject(error))
          .run();
      });
    }

    return frameFiles;
  }

  /**
   * Combine individual frames into a single sprite sheet
   */
  private async createSpriteSheet(
    frameFiles: string[],
    framesPerRow: number,
    frameWidth: number,
    frameHeight: number,
  ): Promise<Buffer> {
    const rows = Math.ceil(frameFiles.length / framesPerRow);
    const spriteWidth = framesPerRow * frameWidth;
    const spriteHeight = rows * frameHeight;

    // Create blank sprite sheet
    const spriteSheet = sharp({
      create: {
        width: spriteWidth,
        height: spriteHeight,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    });

    // Build composite array
    const composites: Array<{ input: string; top: number; left: number }> = [];

    for (let i = 0; i < frameFiles.length; i++) {
      const row = Math.floor(i / framesPerRow);
      const col = i % framesPerRow;
      const left = col * frameWidth;
      const top = row * frameHeight;

      composites.push({
        input: frameFiles[i],
        top,
        left,
      });
    }

    // Composite all frames onto sprite sheet
    const buffer = await spriteSheet
      .composite(composites)
      .jpeg({ quality: 80 })
      .toBuffer();

    return buffer;
  }

  /**
   * Generate WebVTT file with sprite coordinates
   */
  private generateVTT(
    spriteSheetUrl: string,
    totalFrames: number,
    framesPerRow: number,
    frameWidth: number,
    frameHeight: number,
    interval: number,
  ): string {
    let vtt = 'WEBVTT\n\n';

    for (let i = 0; i < totalFrames; i++) {
      const startTime = i * interval;
      const endTime = (i + 1) * interval;

      const row = Math.floor(i / framesPerRow);
      const col = i % framesPerRow;
      const x = col * frameWidth;
      const y = row * frameHeight;

      // Format time as HH:MM:SS.mmm
      const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
      };

      vtt += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
      vtt += `${spriteSheetUrl}#xywh=${x},${y},${frameWidth},${frameHeight}\n\n`;
    }

    return vtt;
  }

  /**
   * Build S3 URL from bucket and key
   */
  private buildS3Url(bucket: string, key: string): string {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  /**
   * Get video metadata (duration, dimensions) using FFmpeg
   */
  async getVideoMetadata(
    videoPath: string,
  ): Promise<{ duration: number; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(
          (s) => s.codec_type === 'video',
        );

        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
        });
      });
    });
  }
}
