/**
 * Configuration for frame comparison tolerance
 */
export interface PixelMatchOptions {
  /**
   * Pixel difference threshold (0-1)
   * Higher values are more permissive
   * @default 0.1
   */
  threshold: number;

  /**
   * Include antialiasing detection
   * @default true
   */
  includeAA: boolean;

  /**
   * Alpha channel threshold
   * @default 0.1
   */
  alpha: number;

  /**
   * Antialiasing detection threshold
   * @default 0.1
   */
  aaColor: number;

  /**
   * Diff mask color [r, g, b, a]
   * @default [255, 0, 0, 255]
   */
  diffColor: [number, number, number, number];
}

/**
 * Frame extraction result
 */
export interface ExtractedFrame {
  /** Frame number (0-based) */
  frameNumber: number;

  /** Timestamp in seconds */
  timestamp: number;

  /** File path to extracted frame */
  path: string;

  /** Frame width in pixels */
  width: number;

  /** Frame height in pixels */
  height: number;
}

/**
 * Frame comparison result
 */
export interface FrameComparisonResult {
  /** Reference frame info */
  referenceFrame: ExtractedFrame;

  /** Output frame info */
  outputFrame: ExtractedFrame;

  /** Match score (0.0 - 1.0) */
  matchScore: number;

  /** Number of different pixels */
  differentPixels: number;

  /** Total pixels compared */
  totalPixels: number;

  /** Percentage of different pixels */
  differencePercentage: number;

  /** Path to visual diff image (if generated) */
  diffImagePath?: string;
}

/**
 * Video validation configuration
 */
export interface ValidationConfig {
  /** Number of frames to extract and compare */
  frameCount: number;

  /** Pass threshold (0.0 - 1.0) */
  passThreshold: number;

  /** Pixel match tolerance options */
  pixelMatchOptions: Partial<PixelMatchOptions>;

  /** Generate visual diff images */
  generateDiffs: boolean;

  /** Output directory for reports and diffs */
  outputDir: string;

  /** Verbose logging */
  verbose: boolean;
}

/**
 * Video validation result
 */
export interface ValidationResult {
  /** Reference video path */
  referenceVideo: string;

  /** Output video path */
  outputVideo: string;

  /** Individual frame comparison results */
  frameResults: FrameComparisonResult[];

  /** Overall average match score */
  overallScore: number;

  /** Pass/fail status */
  passed: boolean;

  /** Pass threshold used */
  threshold: number;

  /** Validation timestamp */
  timestamp: Date;

  /** Validation duration in milliseconds */
  duration: number;

  /** Error message if validation failed */
  error?: string;
}

/**
 * Video metadata
 */
export interface VideoMetadata {
  /** Video file path */
  path: string;

  /** Duration in seconds */
  duration: number;

  /** Width in pixels */
  width: number;

  /** Height in pixels */
  height: number;

  /** Frame rate (fps) */
  fps: number;

  /** Video codec */
  codec: string;

  /** File size in bytes */
  size: number;
}

/**
 * Batch validation configuration
 */
export interface BatchValidationConfig {
  /** Array of validation pairs */
  validations: Array<{
    reference: string;
    output: string;
    name?: string;
  }>;

  /** Base validation config */
  config: Partial<ValidationConfig>;

  /** Parallel execution limit */
  concurrency: number;
}

/**
 * Batch validation result
 */
export interface BatchValidationResult {
  /** Individual validation results */
  results: ValidationResult[];

  /** Overall pass rate */
  passRate: number;

  /** Total validations run */
  totalValidations: number;

  /** Number of passed validations */
  passedValidations: number;

  /** Number of failed validations */
  failedValidations: number;

  /** Batch execution timestamp */
  timestamp: Date;

  /** Total batch duration in milliseconds */
  duration: number;
}
