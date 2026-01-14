import { Injectable, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { Readable, PassThrough } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

/**
 * FFmpeg encoding options
 */
export interface FFmpegEncodingOptions {
  width: number;
  height: number;
  fps: number;
  outputPath: string;
  codec?: string;
  preset?: string;
  crf?: number;
  pixelFormat?: string;
  audioPath?: string;
  movflags?: string[];
}

/**
 * Encoding progress data
 */
export interface EncodingProgress {
  frame: number;
  fps: number;
  bitrate: string;
  time: string;
  speed: string;
  progress?: number;
}

/**
 * FFmpegEncoder Service
 *
 * Encodes video from raw RGBA frame stream using FFmpeg.
 * Handles audio mixing and format optimization.
 */
@Injectable()
export class FFmpegEncoderService {
  private readonly logger = new Logger(FFmpegEncoderService.name);

  /**
   * Create FFmpeg process for video encoding
   *
   * @param options Encoding configuration
   * @returns FFmpeg child process and stdin stream
   */
  createEncoderProcess(options: FFmpegEncodingOptions): {
    process: ChildProcess;
    stdin: NodeJS.WritableStream;
  } {
    const {
      width,
      height,
      fps,
      outputPath,
      codec = 'libx264',
      preset = 'fast',
      crf = 23,
      pixelFormat = 'yuv420p',
      audioPath,
      movflags = ['+faststart'],
    } = options;

    this.logger.log(`Starting FFmpeg encoder: ${width}x${height} @ ${fps}fps`);
    this.logger.log(`Output: ${outputPath}`);

    // Build FFmpeg arguments
    const args: string[] = [
      // Input: raw RGBA from stdin
      '-f', 'rawvideo',
      '-pix_fmt', 'rgba',
      '-s', `${width}x${height}`,
      '-r', fps.toString(),
      '-i', 'pipe:0',
    ];

    // Add audio input if provided
    if (audioPath) {
      this.logger.log(`Adding audio input: ${audioPath}`);
      args.push('-i', audioPath);
    }

    // Video encoding options
    args.push(
      '-c:v', codec,
      '-preset', preset,
      '-crf', crf.toString(),
      '-pix_fmt', pixelFormat,
    );

    // Audio encoding options
    if (audioPath) {
      args.push(
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest', // End encoding when shortest stream ends
      );
    }

    // Output format options
    if (movflags.length > 0) {
      args.push('-movflags', movflags.join(''));
    }

    // Overwrite output file
    args.push('-y');

    // Output file
    args.push(outputPath);

    this.logger.debug(`FFmpeg args: ${args.join(' ')}`);

    // Spawn FFmpeg process
    const ffmpegProcess = spawn('ffmpeg', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Handle stderr for progress monitoring
    ffmpegProcess.stderr?.on('data', (data) => {
      const message = data.toString();
      this.parseFFmpegOutput(message);
    });

    // Handle errors
    ffmpegProcess.on('error', (error) => {
      this.logger.error(`FFmpeg process error: ${error.message}`);
    });

    return {
      process: ffmpegProcess,
      stdin: ffmpegProcess.stdin!,
    };
  }

  /**
   * Encode video from async frame generator
   *
   * @param frameGenerator Async generator yielding frame buffers
   * @param options Encoding options
   * @param progressCallback Optional progress callback
   */
  async encodeFromFrameStream(
    frameGenerator: AsyncGenerator<Buffer>,
    options: FFmpegEncodingOptions,
    progressCallback?: (progress: EncodingProgress) => void,
  ): Promise<void> {
    const { process: ffmpegProcess, stdin } = this.createEncoderProcess(options);

    let frameCount = 0;

    try {
      // Write frames to FFmpeg stdin
      for await (const frameBuffer of frameGenerator) {
        stdin.write(frameBuffer);
        frameCount++;

        if (frameCount % options.fps === 0) {
          this.logger.debug(`Encoded ${frameCount} frames`);
        }
      }

      // Close stdin to signal end of input
      stdin.end();

      // Wait for FFmpeg to finish
      await this.waitForProcessCompletion(ffmpegProcess);

      this.logger.log(`Encoding complete: ${frameCount} frames encoded`);
    } catch (error) {
      this.logger.error('Encoding failed', error);
      ffmpegProcess.kill('SIGKILL');
      throw error;
    }
  }

  /**
   * Encode audio track separately
   *
   * @param inputPath Input audio file
   * @param outputPath Output audio file
   * @param options Audio encoding options
   */
  async encodeAudioTrack(
    inputPath: string,
    outputPath: string,
    options: {
      startTime?: number;
      duration?: number;
      volume?: number;
      codec?: string;
      bitrate?: string;
    } = {},
  ): Promise<void> {
    const {
      startTime,
      duration,
      volume = 1.0,
      codec = 'aac',
      bitrate = '192k',
    } = options;

    const args: string[] = ['-i', inputPath];

    // Trim audio if needed
    if (startTime !== undefined) {
      args.push('-ss', startTime.toString());
    }
    if (duration !== undefined) {
      args.push('-t', duration.toString());
    }

    // Volume adjustment
    if (volume !== 1.0) {
      args.push('-filter:a', `volume=${volume}`);
    }

    // Audio codec and bitrate
    args.push('-c:a', codec, '-b:a', bitrate);

    // Overwrite output
    args.push('-y', outputPath);

    this.logger.log(`Encoding audio: ${inputPath} -> ${outputPath}`);

    const ffmpegProcess = spawn('ffmpeg', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    await this.waitForProcessCompletion(ffmpegProcess);
  }

  /**
   * Merge video and audio files
   *
   * @param videoPath Input video file
   * @param audioPath Input audio file
   * @param outputPath Output merged file
   */
  async mergeVideoAndAudio(
    videoPath: string,
    audioPath: string,
    outputPath: string,
  ): Promise<void> {
    this.logger.log(`Merging video and audio: ${outputPath}`);

    const args = [
      '-i', videoPath,
      '-i', audioPath,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
      '-y',
      outputPath,
    ];

    const ffmpegProcess = spawn('ffmpeg', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    await this.waitForProcessCompletion(ffmpegProcess);
    this.logger.log('Merge complete');
  }

  /**
   * Mix multiple audio tracks into single audio file
   *
   * @param audioPaths Array of input audio files
   * @param outputPath Output mixed audio file
   * @param volumes Optional volume levels for each track
   */
  async mixAudioTracks(
    audioPaths: string[],
    outputPath: string,
    volumes?: number[],
  ): Promise<void> {
    if (audioPaths.length === 0) {
      throw new Error('No audio tracks to mix');
    }

    if (audioPaths.length === 1) {
      // Single track, just copy
      await fs.promises.copyFile(audioPaths[0], outputPath);
      return;
    }

    this.logger.log(`Mixing ${audioPaths.length} audio tracks`);

    const args: string[] = [];

    // Add inputs
    for (const audioPath of audioPaths) {
      args.push('-i', audioPath);
    }

    // Build filter complex for mixing
    const volumeFilters = volumes
      ? audioPaths.map((_, i) => `[${i}:a]volume=${volumes[i]}[a${i}]`).join(';')
      : '';

    const mixInputs = audioPaths.map((_, i) => `[a${i}]`).join('');
    const filterComplex = volumes
      ? `${volumeFilters};${mixInputs}amix=inputs=${audioPaths.length}:duration=longest[aout]`
      : `amix=inputs=${audioPaths.length}:duration=longest`;

    args.push(
      '-filter_complex', filterComplex,
      '-map', volumes ? '[aout]' : '0',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-y',
      outputPath,
    );

    const ffmpegProcess = spawn('ffmpeg', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    await this.waitForProcessCompletion(ffmpegProcess);
  }

  /**
   * Wait for FFmpeg process to complete
   */
  private waitForProcessCompletion(process: ChildProcess): Promise<void> {
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Parse FFmpeg output for progress monitoring
   */
  private parseFFmpegOutput(output: string): void {
    // Extract progress information from FFmpeg output
    const frameMatch = output.match(/frame=\s*(\d+)/);
    const fpsMatch = output.match(/fps=\s*([\d.]+)/);
    const bitrateMatch = output.match(/bitrate=\s*([\d.]+\w+)/);
    const timeMatch = output.match(/time=\s*([\d:.]+)/);
    const speedMatch = output.match(/speed=\s*([\d.]+x)/);

    if (frameMatch || timeMatch) {
      const progress: Partial<EncodingProgress> = {
        frame: frameMatch ? parseInt(frameMatch[1], 10) : undefined,
        fps: fpsMatch ? parseFloat(fpsMatch[1]) : undefined,
        bitrate: bitrateMatch ? bitrateMatch[1] : undefined,
        time: timeMatch ? timeMatch[1] : undefined,
        speed: speedMatch ? speedMatch[1] : undefined,
      };

      // Log progress at reasonable intervals
      if (progress.frame && progress.frame % 60 === 0) {
        this.logger.debug(
          `Encoding: frame=${progress.frame}, fps=${progress.fps}, time=${progress.time}, speed=${progress.speed}`,
        );
      }
    }

    // Log warnings and errors
    if (output.includes('error') || output.includes('Error')) {
      this.logger.warn(`FFmpeg: ${output.trim()}`);
    }
  }

  /**
   * Get video duration using FFprobe
   */
  async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const args = [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        videoPath,
      ];

      const ffprobe = spawn('ffprobe', args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let output = '';
      ffprobe.stdout?.on('data', (data) => {
        output += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          const duration = parseFloat(output.trim());
          resolve(duration);
        } else {
          reject(new Error('Failed to get video duration'));
        }
      });
    });
  }
}
