/**
 * Video Processing Service
 *
 * Handles server-side video metadata extraction using ffprobe.
 * Safe command execution using spawn to prevent injection vulnerabilities.
 */

import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';

/**
 * Video metadata interface
 */
export interface VideoMetadata {
  codec?: string;
  container?: string;
  bitrate?: number;
  duration?: number;
  width?: number;
  height?: number;
  framerate?: number;
  moovAtomPosition?: 'start' | 'end';
}

/**
 * Audio metadata interface
 */
export interface AudioMetadata {
  codec?: string;
  bitrate?: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
}

/**
 * Execute a command using spawn with proper argument handling.
 * Unlike exec, spawn doesn't use shell interpolation, making it safe for URLs with special characters.
 */
function spawnAsync(
  command: string,
  args: string[],
  timeout: number = 120000,
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
        // Include both stderr and stdout in error for better debugging
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
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name);

  /**
   * Process video file and extract metadata using ffprobe
   *
   * @param videoUrl - URL or path to the video file
   * @returns Video metadata including codec, container, bitrate, duration, dimensions
   */
  async processVideoFile(videoUrl: string): Promise<VideoMetadata> {
    try {
      const hasSignature = videoUrl.includes('X-Amz-Signature');
      this.logger.debug('Processing video URL', {
        hasSignature,
        urlLength: videoUrl.length,
        baseUrl: videoUrl.split('?')[0],
      });

      if (!hasSignature && videoUrl.startsWith('http')) {
        this.logger.warn('URL appears to be missing AWS signature');
      }

      // Use ffprobe with spawnAsync to safely handle URLs with special characters
      // Note: Using 'error' log level instead of 'quiet' to capture errors while still getting JSON
      const { stdout, stderr } = await spawnAsync(
        'ffprobe',
        [
          '-v',
          'error',
          '-reconnect',
          '1',
          '-reconnect_streamed',
          '1',
          '-reconnect_delay_max',
          '5',
          '-analyzeduration',
          '10M',
          '-probesize',
          '10M',
          '-print_format',
          'json',
          '-show_format',
          '-show_streams',
          videoUrl,
        ],
        60000, // 60 second timeout for remote URLs
      );

      if (stderr) {
        this.logger.warn('ffprobe stderr:', stderr);
      }

      const data = JSON.parse(stdout);
      const videoStream = data.streams?.find(
        (s: any) => s.codec_type === 'video',
      );

      if (!videoStream) {
        throw new Error('No video stream found');
      }

      const metadata: VideoMetadata = {
        codec: this.normalizeCodec(videoStream.codec_name),
        container: this.detectContainer(data.format?.format_name),
        bitrate: data.format?.bit_rate
          ? Math.round(parseInt(data.format.bit_rate) / 1000)
          : undefined,
        duration: data.format?.duration
          ? parseFloat(data.format.duration)
          : undefined,
        width: videoStream.width,
        height: videoStream.height,
        framerate: this.parseFramerate(videoStream.r_frame_rate),
      };

      // Detect moov atom position for MP4 files
      if (metadata.container === 'mp4') {
        metadata.moovAtomPosition = await this.detectMoovAtomPosition(videoUrl);
      }

      return metadata;
    } catch (error) {
      // Log sanitized URL (hide query params which contain AWS signatures)
      const sanitizedUrl = videoUrl.split('?')[0];
      this.logger.error('Error processing video:', sanitizedUrl);
      this.logger.error('Error details:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to process video (${sanitizedUrl}): ${message}`);
    }
  }

  /**
   * Process audio file and extract metadata using ffprobe
   *
   * @param audioUrl - URL or path to the audio file
   * @returns Audio metadata including codec, bitrate, duration
   */
  async processAudioFile(audioUrl: string): Promise<AudioMetadata> {
    try {
      const { stdout, stderr } = await spawnAsync(
        'ffprobe',
        [
          '-v',
          'error',
          '-print_format',
          'json',
          '-show_format',
          '-show_streams',
          audioUrl,
        ],
        60000,
      );

      if (stderr) {
        this.logger.warn('ffprobe stderr:', stderr);
      }

      const data = JSON.parse(stdout);
      const audioStream = data.streams?.find(
        (s: any) => s.codec_type === 'audio',
      );

      if (!audioStream) {
        throw new Error('No audio stream found');
      }

      return {
        codec: audioStream.codec_name,
        bitrate: audioStream.bit_rate
          ? Math.round(parseInt(audioStream.bit_rate) / 1000)
          : undefined,
        duration: data.format?.duration
          ? parseFloat(data.format.duration)
          : undefined,
        sampleRate: audioStream.sample_rate
          ? parseInt(audioStream.sample_rate)
          : undefined,
        channels: audioStream.channels,
      };
    } catch (error) {
      const sanitizedUrl = audioUrl.split('?')[0];
      this.logger.error('Error processing audio:', sanitizedUrl);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to process audio (${sanitizedUrl}): ${message}`);
    }
  }

  /**
   * Get video duration using ffprobe
   *
   * @param videoUrl - URL or path to the video file
   * @returns Duration in seconds
   */
  async getVideoDuration(videoUrl: string): Promise<number> {
    try {
      const { stdout } = await spawnAsync('ffprobe', [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_format',
        videoUrl,
      ]);

      const data = JSON.parse(stdout);
      const duration = parseFloat(data.format?.duration || '0');

      return duration;
    } catch (error) {
      this.logger.error('Error getting duration:', error);
      throw new Error(
        `Failed to get video duration: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Normalize codec name to standard format
   */
  private normalizeCodec(codecName: string): string {
    const normalized = codecName.toLowerCase();

    if (normalized.includes('h264') || normalized.includes('avc')) {
      return 'h264';
    }
    if (normalized.includes('h265') || normalized.includes('hevc')) {
      return 'h265';
    }
    if (normalized.includes('vp8')) {
      return 'vp8';
    }
    if (normalized.includes('vp9')) {
      return 'vp9';
    }
    if (normalized.includes('av1')) {
      return 'av1';
    }

    return normalized;
  }

  /**
   * Detect container format from ffprobe format name
   */
  private detectContainer(
    formatName: string,
  ): 'mp4' | 'mov' | 'webm' | 'mkv' | undefined {
    if (!formatName) return undefined;

    const format = formatName.toLowerCase();

    if (format.includes('mp4')) return 'mp4';
    if (format.includes('mov') || format.includes('quicktime')) return 'mov';
    if (format.includes('webm')) return 'webm';
    if (format.includes('matroska') || format.includes('mkv')) return 'mkv';

    return undefined;
  }

  /**
   * Parse framerate from ffprobe fraction format (e.g., "30/1" or "30000/1001")
   */
  private parseFramerate(framerateStr: string): number | undefined {
    if (!framerateStr) return undefined;

    try {
      const parts = framerateStr.split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        return Math.round((num / den) * 100) / 100;
      }
      return parseFloat(framerateStr);
    } catch {
      return undefined;
    }
  }

  /**
   * Detect moov atom position in MP4 files
   *
   * The moov atom contains metadata and should ideally be at the start
   * for progressive playback. If at the end, larger initial chunks help.
   */
  private async detectMoovAtomPosition(
    videoUrl: string,
  ): Promise<'start' | 'end'> {
    try {
      const { stdout } = await spawnAsync('ffprobe', [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_packets',
        '-read_intervals',
        '%+#1',
        videoUrl,
      ]);

      // If we can read packets immediately, moov is likely at start
      const data = JSON.parse(stdout);
      return data.packets && data.packets.length > 0 ? 'start' : 'end';
    } catch (error) {
      // Default to 'end' if detection fails (conservative approach)
      return 'end';
    }
  }
}
