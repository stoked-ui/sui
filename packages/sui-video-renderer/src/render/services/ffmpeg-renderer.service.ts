import { Injectable, Logger } from '@nestjs/common';
import { FilterComplex } from './ffmpeg-filter-builder.service';
import { spawn, ChildProcess } from 'child_process';
import * as stream from 'stream';

/**
 * FFmpeg progress information
 */
export interface FFmpegProgress {
  /** Current frame number */
  frame: number;

  /** Current frames per second */
  fps: number;

  /** Current time position (seconds) */
  time: number;

  /** Processing speed (x realtime) */
  speed: number;

  /** Progress percentage (0-100) */
  percentage: number;

  /** Phase description */
  phase: string;
}

/**
 * FFmpeg render result
 */
export interface RenderResult {
  /** Success status */
  success: boolean;

  /** Output file path or stream */
  output?: string | stream.Readable;

  /** Error message if failed */
  error?: string;

  /** Final statistics */
  stats?: {
    totalFrames: number;
    totalTime: number;
    averageFps: number;
  };
}

/**
 * FFmpegRendererService
 *
 * Executes FFmpeg with filtergraph and handles:
 * - Progress tracking from stderr
 * - Streaming output to S3
 * - Error handling and retries
 * - Process cancellation
 */
@Injectable()
export class FFmpegRendererService {
  private readonly logger = new Logger(FFmpegRendererService.name);
  private activeProcesses = new Map<string, ChildProcess>();

  /**
   * Render video using FFmpeg filtergraph
   */
  async render(
    jobId: string,
    filterComplex: FilterComplex,
    outputPath: string,
    quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA',
    totalDuration: number,
    onProgress?: (progress: FFmpegProgress) => void,
  ): Promise<RenderResult> {
    this.logger.log(`Starting FFmpeg render for job: ${jobId}`);

    return new Promise((resolve, reject) => {
      const args = this.buildFFmpegArgs(filterComplex, outputPath, quality);

      this.logger.debug(`FFmpeg command: ffmpeg ${args.join(' ')}`);

      // Spawn FFmpeg process
      const ffmpegProcess = spawn('ffmpeg', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.activeProcesses.set(jobId, ffmpegProcess);

      let stderrData = '';
      let lastProgress: FFmpegProgress | null = null;

      // Capture stderr for progress tracking
      ffmpegProcess.stderr?.on('data', (data: Buffer) => {
        stderrData += data.toString();

        // Parse progress from stderr
        const progress = this.parseProgress(data.toString(), totalDuration);
        if (progress && onProgress) {
          lastProgress = progress;
          onProgress(progress);
        }
      });

      // Capture stdout (not used for normal rendering)
      ffmpegProcess.stdout?.on('data', (data: Buffer) => {
        this.logger.debug(`FFmpeg stdout: ${data.toString()}`);
      });

      // Handle process completion
      ffmpegProcess.on('close', (code) => {
        this.activeProcesses.delete(jobId);

        if (code === 0) {
          this.logger.log(`FFmpeg render completed successfully: ${jobId}`);

          const stats = lastProgress
            ? {
                totalFrames: lastProgress.frame,
                totalTime: lastProgress.time,
                averageFps: lastProgress.fps,
              }
            : undefined;

          resolve({
            success: true,
            output: outputPath,
            stats,
          });
        } else {
          this.logger.error(
            `FFmpeg render failed with code ${code}: ${jobId}`,
          );

          // Extract error message from stderr
          const errorMessage = this.extractErrorMessage(stderrData);

          resolve({
            success: false,
            error: errorMessage || `FFmpeg exited with code ${code}`,
          });
        }
      });

      // Handle process errors
      ffmpegProcess.on('error', (error) => {
        this.activeProcesses.delete(jobId);
        this.logger.error(`FFmpeg process error: ${error.message}`);

        resolve({
          success: false,
          error: `FFmpeg process error: ${error.message}`,
        });
      });
    });
  }

  /**
   * Render with streaming output (for S3 upload)
   */
  async renderToStream(
    jobId: string,
    filterComplex: FilterComplex,
    quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA',
    totalDuration: number,
    onProgress?: (progress: FFmpegProgress) => void,
  ): Promise<RenderResult> {
    this.logger.log(`Starting FFmpeg streaming render for job: ${jobId}`);

    return new Promise((resolve, reject) => {
      // Use pipe:1 for stdout streaming
      const args = this.buildFFmpegArgs(filterComplex, 'pipe:1', quality);

      this.logger.debug(`FFmpeg streaming command: ffmpeg ${args.join(' ')}`);

      const ffmpegProcess = spawn('ffmpeg', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.activeProcesses.set(jobId, ffmpegProcess);

      let stderrData = '';
      let lastProgress: FFmpegProgress | null = null;

      // Capture stderr for progress
      ffmpegProcess.stderr?.on('data', (data: Buffer) => {
        stderrData += data.toString();

        const progress = this.parseProgress(data.toString(), totalDuration);
        if (progress && onProgress) {
          lastProgress = progress;
          onProgress(progress);
        }
      });

      // Handle process errors
      ffmpegProcess.on('error', (error) => {
        this.activeProcesses.delete(jobId);
        this.logger.error(`FFmpeg streaming error: ${error.message}`);

        resolve({
          success: false,
          error: `FFmpeg process error: ${error.message}`,
        });
      });

      ffmpegProcess.on('close', (code) => {
        this.activeProcesses.delete(jobId);

        if (code !== 0) {
          this.logger.error(
            `FFmpeg streaming failed with code ${code}: ${jobId}`,
          );

          const errorMessage = this.extractErrorMessage(stderrData);
          resolve({
            success: false,
            error: errorMessage || `FFmpeg exited with code ${code}`,
          });
        }
      });

      // Return stdout stream immediately
      if (ffmpegProcess.stdout) {
        resolve({
          success: true,
          output: ffmpegProcess.stdout,
        });
      } else {
        resolve({
          success: false,
          error: 'Failed to create FFmpeg stdout stream',
        });
      }
    });
  }

  /**
   * Cancel active render job
   */
  async cancelRender(jobId: string): Promise<void> {
    const process = this.activeProcesses.get(jobId);

    if (process) {
      this.logger.log(`Canceling FFmpeg render: ${jobId}`);
      process.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (this.activeProcesses.has(jobId)) {
          this.logger.warn(`Force killing FFmpeg process: ${jobId}`);
          process.kill('SIGKILL');
        }
      }, 5000);

      this.activeProcesses.delete(jobId);
    }
  }

  /**
   * Parse FFmpeg progress from stderr output
   */
  private parseProgress(
    stderr: string,
    totalDuration: number,
  ): FFmpegProgress | null {
    // FFmpeg progress format:
    // frame=  123 fps= 30 q=28.0 size=    1024kB time=00:00:04.10 bitrate=2048.0kbits/s speed=1.00x

    const frameMatch = stderr.match(/frame=\s*(\d+)/);
    const fpsMatch = stderr.match(/fps=\s*(\d+\.?\d*)/);
    const timeMatch = stderr.match(/time=(\d+):(\d+):(\d+\.\d+)/);
    const speedMatch = stderr.match(/speed=\s*(\d+\.?\d*)x/);

    if (!frameMatch || !timeMatch) {
      return null;
    }

    const frame = parseInt(frameMatch[1], 10);
    const fps = fpsMatch ? parseFloat(fpsMatch[1]) : 0;
    const speed = speedMatch ? parseFloat(speedMatch[1]) : 0;

    // Parse time from HH:MM:SS.ms format
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseFloat(timeMatch[3]);
    const time = hours * 3600 + minutes * 60 + seconds;

    // Calculate percentage
    const percentage = totalDuration > 0
      ? Math.min(100, (time / totalDuration) * 100)
      : 0;

    // Determine phase
    let phase = 'Rendering';
    if (percentage < 10) {
      phase = 'Starting render';
    } else if (percentage > 90) {
      phase = 'Finalizing';
    }

    return {
      frame,
      fps,
      time,
      speed,
      percentage,
      phase,
    };
  }

  /**
   * Extract error message from FFmpeg stderr
   */
  private extractErrorMessage(stderr: string): string {
    // Look for common FFmpeg error patterns
    const errorPatterns = [
      /Error.*$/m,
      /.*: No such file or directory/m,
      /Invalid.*$/m,
      /Unable to.*$/m,
      /Failed to.*$/m,
    ];

    for (const pattern of errorPatterns) {
      const match = stderr.match(pattern);
      if (match) {
        return match[0];
      }
    }

    // Return last few lines of stderr
    const lines = stderr.trim().split('\n');
    return lines.slice(-3).join('\n');
  }

  /**
   * Build FFmpeg arguments
   */
  private buildFFmpegArgs(
    filterComplex: FilterComplex,
    outputPath: string,
    quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA',
  ): string[] {
    const args: string[] = [];

    // Add inputs
    args.push(...filterComplex.inputs);

    // Add filter complex
    args.push('-filter_complex', filterComplex.filterGraph);

    // Add output maps
    args.push(...filterComplex.outputMaps);

    // Add encoding settings
    const crfValues = { LOW: 28, MEDIUM: 23, HIGH: 18, ULTRA: 15 };
    const presets = {
      LOW: 'veryfast',
      MEDIUM: 'fast',
      HIGH: 'medium',
      ULTRA: 'slow',
    };

    args.push(
      '-c:v',
      'libx264',
      '-preset',
      presets[quality],
      '-crf',
      crfValues[quality].toString(),
      '-pix_fmt',
      'yuv420p',
    );

    // Audio encoding (if present)
    if (filterComplex.outputMaps.includes('[aout]')) {
      args.push('-c:a', 'aac', '-b:a', '192k', '-ar', '48000');
    }

    // Progress reporting
    args.push('-progress', 'pipe:2', '-stats');

    // Hardware acceleration (if available)
    // args.push('-hwaccel', 'auto');

    // Overwrite output
    args.push('-y', outputPath);

    return args;
  }

  /**
   * Validate FFmpeg is installed and get version
   */
  async validateFFmpeg(): Promise<{ installed: boolean; version?: string }> {
    return new Promise((resolve) => {
      const process = spawn('ffmpeg', ['-version']);

      let output = '';

      process.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          const versionMatch = output.match(/ffmpeg version ([\d.]+)/);
          resolve({
            installed: true,
            version: versionMatch ? versionMatch[1] : 'unknown',
          });
        } else {
          resolve({ installed: false });
        }
      });

      process.on('error', () => {
        resolve({ installed: false });
      });
    });
  }
}
