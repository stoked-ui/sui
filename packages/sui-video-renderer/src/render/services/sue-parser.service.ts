import { Injectable, Logger } from '@nestjs/common';
import {
  TimelineItem,
  TimelineManifest,
  FitMode,
  BlendMode,
  SueFormatDto,
} from '../dto/sue-format.dto';

// Alias for compatibility
type SueProjectDto = SueFormatDto;
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

/**
 * SueParserService
 *
 * Parses .sue JSON files and extracts deterministic timeline manifest
 * for FFmpeg filtergraph generation
 */
@Injectable()
export class SueParserService {
  private readonly logger = new Logger(SueParserService.name);

  /**
   * Parse .sue file from disk
   * Supports both:
   * - Plain JSON .sue files with external file references
   * - Binary .sue files with embedded media (extracts to temp directory)
   *
   * @param filePath Path to the .sue file
   * @param publicDir Optional base directory for resolving web paths (e.g., '/static/...')
   */
  async parseFile(filePath: string, publicDir?: string): Promise<TimelineManifest> {
    this.logger.log(`Parsing .sue file: ${filePath}`);

    // Try to detect if this is a binary .sue file with embedded media
    const buffer = await fs.readFile(filePath);
    const firstFourBytes = buffer.slice(0, 4);

    // Check if it starts with metadata length (binary format)
    // Binary format won't start with '{' (0x7B) or whitespace
    const isBinary = firstFourBytes[0] !== 0x7B && firstFourBytes[0] !== 0x20 && firstFourBytes[0] !== 0x0A;

    let sueProject: SueProjectDto;
    let extractedMediaDir: string | undefined;

    if (isBinary) {
      this.logger.log('Detected binary .sue file with embedded media');
      const result = await this.extractEmbeddedMedia(buffer, filePath);
      sueProject = result.metadata;
      extractedMediaDir = result.mediaDir;
      this.logger.log(`Extracted ${result.fileCount} media files to: ${extractedMediaDir}`);
    } else {
      // Plain JSON format
      const content = buffer.toString('utf-8');
      sueProject = JSON.parse(content);
    }

    // Use extracted media dir as publicDir if available
    return this.parseProject(sueProject, extractedMediaDir || publicDir);
  }

  /**
   * Extract embedded media from binary .sue file
   * Binary format: [4 bytes: metadata length][metadata JSON][media files...]
   */
  private async extractEmbeddedMedia(
    buffer: Buffer,
    sourcePath: string
  ): Promise<{ metadata: SueProjectDto; mediaDir: string; fileCount: number }> {
    const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    // Read metadata length (first 4 bytes, little-endian)
    const metadataLength = dataView.getUint32(0, true);

    // Extract JSON metadata
    const metadataStart = 4;
    const metadataEnd = metadataStart + metadataLength;
    const metadataBuffer = buffer.slice(metadataStart, metadataEnd);
    const metadataText = metadataBuffer.toString('utf-8');
    const metadata: SueProjectDto = JSON.parse(metadataText);

    // Create temp directory for extracted media
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sue-media-'));

    // Extract each embedded file
    let currentOffset = metadataEnd;
    const extractedFiles: Record<string, string> = {};

    for (const fileMeta of metadata.filesMeta) {
      const fileSize = fileMeta.size;
      const fileName = fileMeta.name;
      const fileData = buffer.slice(currentOffset, currentOffset + fileSize);

      const outputPath = path.join(tmpDir, fileName);
      await fs.writeFile(outputPath, fileData);

      extractedFiles[fileName] = outputPath;
      this.logger.debug(`Extracted: ${fileName} → ${outputPath}`);

      currentOffset += fileSize;
    }

    // Update track URLs to point to extracted files
    for (const track of metadata.tracks) {
      const originalUrl = track.url;

      // Try to match by filename
      for (const [fileName, filePath] of Object.entries(extractedFiles)) {
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        if (originalUrl.includes(nameWithoutExt)) {
          track.url = filePath;
          this.logger.debug(`Remapped: ${originalUrl} → ${filePath}`);
          break;
        }
      }
    }

    return {
      metadata,
      mediaDir: tmpDir,
      fileCount: metadata.filesMeta.length
    };
  }

  /**
   * Parse SueProjectDto into TimelineManifest
   * @param project The SUE project data
   * @param publicDir Optional base directory for resolving web paths (e.g., '/static/...')
   */
  parseProject(project: SueProjectDto, publicDir?: string): TimelineManifest {
    this.logger.log(`Parsing project: ${project.name} (v${project.version})`);

    // Extract all timeline items from tracks
    const timelineItems: TimelineItem[] = [];
    const mediaFilesSet = new Set<string>();
    let hasAudio = false;
    let hasVideo = false;

    for (const track of project.tracks) {
      const isAudioTrack = track.controllerName === 'audio';
      const isVideoTrack = ['video', 'image'].includes(track.controllerName);

      if (isAudioTrack) hasAudio = true;
      if (isVideoTrack) hasVideo = true;

      for (const action of track.actions) {
        // Resolve media path (handle both absolute paths and URLs)
        const mediaPath = this.resolveMediaPath(track.url, publicDir);
        mediaFilesSet.add(mediaPath);

        // Calculate output duration
        const outputDuration = action.end - action.start;

        // Create timeline item
        const item: TimelineItem = {
          z: action.z,
          trackId: track.id,
          controllerName: track.controllerName,
          mediaPath,
          start: action.start,
          end: action.end,
          trimStart: action.trimStart,
          outputDuration,
          volume: action.volume,
          fit: action.fit || FitMode.FILL,
          blendMode: action.blendMode || BlendMode.NORMAL,
          loop: action.loop || 0,
          width: action.width,
          height: action.height,
          x: action.x,
          y: action.y,
        };

        timelineItems.push(item);
      }
    }

    // Sort by z-order (lower z = bottom layer, rendered first)
    timelineItems.sort((a, b) => a.z - b.z);

    // Calculate total duration (max end time)
    const totalDuration = Math.max(
      ...timelineItems.map(item => item.end),
      0,
    );

    // Create media file index map
    const mediaFiles = new Map<string, string>();
    Array.from(mediaFilesSet).forEach((filePath, index) => {
      mediaFiles.set(filePath, `[${index}:v]`); // FFmpeg input label
    });

    const manifest: TimelineManifest = {
      output: {
        width: project.width,
        height: project.height,
        frameRate: project.frameRate || 30,
        duration: project.duration || totalDuration,
        backgroundColor: project.backgroundColor,
      },
      items: timelineItems,
      mediaFiles,
      hasAudio,
      hasVideo,
    };

    this.logger.log(
      `Parsed ${timelineItems.length} timeline items, ${mediaFiles.size} unique media files, duration: ${manifest.output.duration}s`,
    );

    return manifest;
  }

  /**
   * Resolve media path to local filesystem path
   * Handles URLs, relative paths, web paths, and absolute paths
   * @param url The URL/path from the track
   * @param publicDir Optional base directory for resolving web paths
   */
  private resolveMediaPath(url: string, publicDir?: string): string {
    // If it's a URL (http/https), assume it's already downloaded locally
    // In production, you'd download these first
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Extract filename from URL
      const filename = path.basename(new URL(url).pathname);
      // Assume downloaded to temp directory
      return `/tmp/media/${filename}`;
    }

    // Handle web paths like /static/..., /public/..., /assets/...
    // These need to be resolved relative to the public directory
    if (url.startsWith('/') && publicDir) {
      // Remove leading slash and join with publicDir
      const relativePath = url.substring(1);
      return path.join(publicDir, relativePath);
    }

    // Handle relative paths (convert to absolute)
    if (!path.isAbsolute(url)) {
      return path.resolve(url);
    }

    // Already absolute path
    return url;
  }

  /**
   * Validate timeline consistency
   * Ensures timeline items don't have overlapping times, missing media, etc.
   */
  async validateTimeline(manifest: TimelineManifest): Promise<void> {
    this.logger.debug('Validating timeline manifest');

    // Check for negative durations
    for (const item of manifest.items) {
      if (item.outputDuration < 0) {
        throw new Error(
          `Invalid timeline item: negative duration (start=${item.start}, end=${item.end})`,
        );
      }

      if (item.trimStart < 0) {
        throw new Error(
          `Invalid timeline item: negative trimStart (${item.trimStart})`,
        );
      }
    }

    // Validate media files exist
    for (const [mediaPath] of manifest.mediaFiles) {
      try {
        await fs.access(mediaPath);
      } catch (error) {
        throw new Error(`Media file not found: ${mediaPath}`);
      }
    }

    // Validate output dimensions
    if (manifest.output.width <= 0 || manifest.output.height <= 0) {
      throw new Error(
        `Invalid output dimensions: ${manifest.output.width}x${manifest.output.height}`,
      );
    }

    if (manifest.output.frameRate <= 0) {
      throw new Error(`Invalid frame rate: ${manifest.output.frameRate}`);
    }

    this.logger.debug('Timeline validation passed');
  }

  /**
   * Get timeline statistics for estimation
   */
  getTimelineStats(manifest: TimelineManifest): {
    totalItems: number;
    totalDuration: number;
    mediaFileCount: number;
    hasAudio: boolean;
    hasVideo: boolean;
    complexity: number; // 0-1 score
  } {
    const totalItems = manifest.items.length;
    const totalDuration = manifest.output.duration;
    const mediaFileCount = manifest.mediaFiles.size;

    // Calculate complexity score based on:
    // - Number of overlapping layers
    // - Number of media files
    // - Timeline item count
    const maxOverlap = this.calculateMaxOverlap(manifest.items);
    const complexity = Math.min(
      1.0,
      (maxOverlap * 0.3 + mediaFileCount * 0.05 + totalItems * 0.02),
    );

    return {
      totalItems,
      totalDuration,
      mediaFileCount,
      hasAudio: manifest.hasAudio,
      hasVideo: manifest.hasVideo,
      complexity,
    };
  }

  /**
   * Calculate maximum number of overlapping timeline items at any point
   */
  private calculateMaxOverlap(items: TimelineItem[]): number {
    const events: Array<{ time: number; type: 'start' | 'end' }> = [];

    for (const item of items) {
      events.push({ time: item.start, type: 'start' });
      events.push({ time: item.end, type: 'end' });
    }

    events.sort((a, b) => {
      if (a.time !== b.time) return a.time - b.time;
      return a.type === 'start' ? 1 : -1; // end before start at same time
    });

    let currentOverlap = 0;
    let maxOverlap = 0;

    for (const event of events) {
      if (event.type === 'start') {
        currentOverlap++;
        maxOverlap = Math.max(maxOverlap, currentOverlap);
      } else {
        currentOverlap--;
      }
    }

    return maxOverlap;
  }
}
