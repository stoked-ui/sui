/**
 * Metadata Extraction Performance Optimization
 *
 * Optimizes ffprobe execution, implements timeouts, and provides
 * client vs server extraction strategies with performance benchmarking.
 *
 * Target Performance:
 * - Server extraction: < 500ms for most files
 * - Client extraction: < 1000ms for < 10MB files
 * - Server extraction for files > 10MB: < 200ms (cached)
 */

/**
 * Metadata extraction configuration
 */
export const EXTRACTION_CONFIG = {
  // ffprobe command timeout (milliseconds)
  ffprobeTimeout: 5000,

  // Maximum file size for client-side extraction
  clientMaxFileSize: 10 * 1024 * 1024, // 10MB

  // Enable extraction caching
  enableCache: true,

  // Cache duration for extracted metadata
  cacheTTL: 24 * 60 * 60 * 1000, // 24 hours

  // Pool of ffprobe workers
  workerPoolSize: 4,

  // Max concurrent extraction operations
  maxConcurrent: 8,
};

/**
 * FFProbe command optimizer
 *
 * Builds optimized ffprobe commands that extract only needed information
 */
export class FFProbeOptimizer {
  /**
   * Build optimized ffprobe command for metadata extraction
   *
   * Only extracts essential fields to minimize computation time
   *
   * @example
   * const cmd = FFProbeOptimizer.buildCommand('input.mp4', ['duration', 'width']);
   * // ffprobe -v error -select_streams v:0 -show_entries stream=duration,width ...
   */
  static buildCommand(
    filePath: string,
    fields: string[] = [
      'duration',
      'width',
      'height',
      'r_frame_rate',
      'codec_name',
    ]
  ): string {
    const selectedStreams = this.selectStreams(fields);
    const entries = this.buildEntries(fields);

    return [
      'ffprobe',
      '-v error', // Only show errors
      selectedStreams,
      `-show_entries ${entries}`,
      '-of json', // JSON output format
      `"${filePath}"`,
    ].join(' ');
  }

  /**
   * Determine which streams to select based on fields needed
   */
  private static selectStreams(fields: string[]): string {
    const hasVideoFields = fields.some((f) =>
      ['width', 'height', 'r_frame_rate', 'codec_name'].includes(f)
    );

    const hasAudioFields = fields.some((f) =>
      ['sample_rate', 'channels', 'codec_name'].includes(f)
    );

    const streams = [];
    if (hasVideoFields) streams.push('v:0');
    if (hasAudioFields) streams.push('a:0');

    return streams.length > 0 ? `-select_streams ${streams.join(',')}` : '';
  }

  /**
   * Build ffprobe -show_entries argument
   */
  private static buildEntries(fields: string[]): string {
    const streamEntries = [
      'duration',
      'width',
      'height',
      'r_frame_rate',
      'codec_name',
      'sample_rate',
      'channels',
    ].filter((f) => fields.includes(f));

    const formatEntries = ['duration', 'size', 'bit_rate'].filter((f) =>
      fields.includes(f)
    );

    const entries = [];
    if (streamEntries.length > 0) {
      entries.push(`stream=${streamEntries.join(',')}`);
    }
    if (formatEntries.length > 0) {
      entries.push(`format=${formatEntries.join(',')}`);
    }

    return entries.join(':');
  }

  /**
   * Parse ffprobe JSON output
   */
  static parseOutput(
    output: string
  ): {
    streams: any[];
    format: any;
  } {
    try {
      return JSON.parse(output);
    } catch (error) {
      throw new Error(`Failed to parse ffprobe output: ${error}`);
    }
  }

  /**
   * Extract key metadata from ffprobe output
   */
  static extractMetadata(
    output: string
  ): {
    duration: number;
    width?: number;
    height?: number;
    framerate?: number;
    codec?: string;
  } {
    const parsed = this.parseOutput(output);
    const stream = parsed.streams[0];
    const format = parsed.format;

    return {
      duration: stream?.duration || format?.duration || 0,
      width: stream?.width,
      height: stream?.height,
      framerate: stream?.r_frame_rate
        ? eval(stream.r_frame_rate)
        : undefined,
      codec: stream?.codec_name,
    };
  }
}

/**
 * Extraction performance metrics
 */
export interface ExtractionMetrics {
  method: 'client' | 'server';
  duration: number; // milliseconds
  fileSize: number; // bytes
  fileType: string;
  timestamp: number;
}

/**
 * Extraction performance tracker
 */
export class ExtractionPerformanceTracker {
  private metrics: ExtractionMetrics[] = [];
  private static instance: ExtractionPerformanceTracker;

  private constructor() {}

  static getInstance(): ExtractionPerformanceTracker {
    if (!ExtractionPerformanceTracker.instance) {
      ExtractionPerformanceTracker.instance = new ExtractionPerformanceTracker();
    }
    return ExtractionPerformanceTracker.instance;
  }

  /**
   * Record extraction metrics
   */
  record(metrics: ExtractionMetrics): void {
    this.metrics.push(metrics);

    // Keep last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  /**
   * Get extraction statistics
   */
  getStats(method?: 'client' | 'server'): ExtractionStats {
    const filtered = method
      ? this.metrics.filter((m) => m.method === method)
      : this.metrics;

    if (filtered.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p95Duration: 0,
      };
    }

    const durations = filtered.map((m) => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: filtered.length,
      avgDuration: sum / filtered.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p95Duration: durations[Math.floor(durations.length * 0.95)],
    };
  }

  /**
   * Get comparison between client and server extraction
   */
  getComparison(): {
    client: ExtractionStats;
    server: ExtractionStats;
    serverFasterPercentage: number;
  } {
    const client = this.getStats('client');
    const server = this.getStats('server');

    const clientFaster = this.metrics.filter(
      (m) =>
        m.method === 'client' &&
        this.metrics.find(
          (m2) =>
            m2.method === 'server' && m2.fileSize === m.fileSize && m.duration < m2.duration
        )
    ).length;

    return {
      client,
      server,
      serverFasterPercentage:
        this.metrics.length > 0 ? (clientFaster / this.metrics.length) * 100 : 0,
    };
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Export metrics as CSV
   */
  exportCSV(): string {
    const headers = ['method', 'duration', 'fileSize', 'fileType', 'timestamp'];
    const rows = this.metrics.map((m) => [
      m.method,
      m.duration,
      m.fileSize,
      m.fileType,
      m.timestamp,
    ]);

    return [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');
  }
}

export interface ExtractionStats {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
}

/**
 * Extraction strategy selector
 *
 * Determines whether to extract metadata on client or server
 */
export class ExtractionStrategySelector {
  /**
   * Determine optimal extraction strategy
   *
   * @param fileSize File size in bytes
   * @param fileType MIME type or file extension
   * @returns 'client' for small files, 'server' for large files
   */
  static selectStrategy(
    fileSize: number,
    fileType: string
  ): 'client' | 'server' {
    // Extract metadata on client for small media files
    if (
      fileSize <= EXTRACTION_CONFIG.clientMaxFileSize &&
      this.isClientSafeType(fileType)
    ) {
      return 'client';
    }

    // Use server for large files or complex types
    return 'server';
  }

  /**
   * Check if file type is safe for client-side extraction
   */
  private static isClientSafeType(fileType: string): boolean {
    const clientSafeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
    ];

    return clientSafeTypes.includes(fileType);
  }

  /**
   * Get extraction recommendations
   */
  static getRecommendations(
    fileSize: number,
    fileType: string
  ): ExtractionRecommendation {
    const strategy = this.selectStrategy(fileSize, fileType);

    return {
      strategy,
      reasoning:
        strategy === 'client'
          ? `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) is below client threshold (${(EXTRACTION_CONFIG.clientMaxFileSize / 1024 / 1024).toFixed(2)}MB)`
          : `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds client threshold or unsupported type`,
      estimatedDuration: strategy === 'client' ? 500 : 1000,
      cacheable: true,
    };
  }
}

export interface ExtractionRecommendation {
  strategy: 'client' | 'server';
  reasoning: string;
  estimatedDuration: number;
  cacheable: boolean;
}

export const extractionPerformanceTracker = ExtractionPerformanceTracker.getInstance();

export default {
  EXTRACTION_CONFIG,
  FFProbeOptimizer,
  ExtractionPerformanceTracker,
  ExtractionStrategySelector,
  extractionPerformanceTracker,
};
