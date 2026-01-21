/**
 * Metadata Extraction Service
 *
 * Orchestrates metadata extraction for video, audio, and image files.
 * Handles async processing and error tracking.
 */

import { Injectable, Logger } from '@nestjs/common';
import { VideoProcessingService, VideoMetadata, AudioMetadata } from './video-processing.service';
import { spawn } from 'child_process';

/**
 * Image metadata interface
 */
export interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  exif?: Record<string, any>;
}

/**
 * Combined metadata result
 */
export interface ExtractedMetadata {
  type: 'video' | 'audio' | 'image';
  video?: VideoMetadata;
  audio?: AudioMetadata;
  image?: ImageMetadata;
  extractedAt: Date;
}

/**
 * Execute a command using spawn with proper argument handling
 */
function spawnAsync(
  command: string,
  args: string[],
  timeout: number = 60000,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    let stdout = '';
    let stderr = '';
    let killed = false;

    const timeoutId = setTimeout(() => {
      killed = true;
      proc.kill('SIGKILL');
      reject(new Error(`Process timed out after ${timeout}ms`));
    }, timeout);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timeoutId);
      if (killed) return;

      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const errorOutput =
          [stderr, stdout].filter(Boolean).join('\n').trim() || '(no output)';
        reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

@Injectable()
export class MetadataExtractionService {
  private readonly logger = new Logger(MetadataExtractionService.name);

  constructor(private readonly videoProcessingService: VideoProcessingService) {}

  /**
   * Extract metadata from a media file based on its MIME type
   *
   * @param fileUrl - URL or path to the media file
   * @param mimeType - MIME type of the file
   * @returns Extracted metadata
   */
  async extractMetadata(
    fileUrl: string,
    mimeType: string,
  ): Promise<ExtractedMetadata> {
    this.logger.log(`Extracting metadata for ${mimeType} file`);

    try {
      if (mimeType.startsWith('video/')) {
        return await this.extractVideoMetadata(fileUrl);
      } else if (mimeType.startsWith('audio/')) {
        return await this.extractAudioMetadata(fileUrl);
      } else if (mimeType.startsWith('image/')) {
        return await this.extractImageMetadata(fileUrl);
      } else {
        throw new Error(`Unsupported MIME type: ${mimeType}`);
      }
    } catch (error) {
      this.logger.error('Metadata extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract video metadata
   */
  private async extractVideoMetadata(
    videoUrl: string,
  ): Promise<ExtractedMetadata> {
    const metadata = await this.videoProcessingService.processVideoFile(
      videoUrl,
    );

    return {
      type: 'video',
      video: metadata,
      extractedAt: new Date(),
    };
  }

  /**
   * Extract audio metadata
   */
  private async extractAudioMetadata(
    audioUrl: string,
  ): Promise<ExtractedMetadata> {
    const metadata = await this.videoProcessingService.processAudioFile(
      audioUrl,
    );

    return {
      type: 'audio',
      audio: metadata,
      extractedAt: new Date(),
    };
  }

  /**
   * Extract image metadata including EXIF data
   */
  private async extractImageMetadata(
    imageUrl: string,
  ): Promise<ExtractedMetadata> {
    try {
      // Use ffprobe for basic image information
      const { stdout } = await spawnAsync('ffprobe', [
        '-v',
        'error',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        imageUrl,
      ]);

      const data = JSON.parse(stdout);
      const videoStream = data.streams?.find(
        (s: any) => s.codec_type === 'video',
      );

      const metadata: ImageMetadata = {
        width: videoStream?.width,
        height: videoStream?.height,
        format: videoStream?.codec_name,
      };

      // Try to extract EXIF data using exiftool if available
      try {
        const { stdout: exifOutput } = await spawnAsync(
          'exiftool',
          ['-json', imageUrl],
          30000,
        );
        const exifData = JSON.parse(exifOutput);
        if (exifData && exifData.length > 0) {
          metadata.exif = exifData[0];
        }
      } catch (exifError) {
        // EXIF extraction is optional - log but don't fail
        this.logger.debug('EXIF extraction failed (exiftool may not be installed):', exifError);
      }

      return {
        type: 'image',
        image: metadata,
        extractedAt: new Date(),
      };
    } catch (error) {
      const sanitizedUrl = imageUrl.split('?')[0];
      this.logger.error('Error processing image:', sanitizedUrl);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to process image (${sanitizedUrl}): ${message}`);
    }
  }

  /**
   * Validate that required tools are available
   */
  async validateTools(): Promise<{
    ffprobe: boolean;
    exiftool: boolean;
  }> {
    const results = {
      ffprobe: false,
      exiftool: false,
    };

    // Check ffprobe
    try {
      await spawnAsync('ffprobe', ['-version'], 5000);
      results.ffprobe = true;
    } catch (error) {
      this.logger.warn('ffprobe not available');
    }

    // Check exiftool
    try {
      await spawnAsync('exiftool', ['-ver'], 5000);
      results.exiftool = true;
    } catch (error) {
      this.logger.warn('exiftool not available (EXIF data extraction will be skipped)');
    }

    return results;
  }
}
