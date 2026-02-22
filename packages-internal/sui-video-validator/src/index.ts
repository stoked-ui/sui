/**
 * @stoked-ui/video-validator
 *
 * Video rendering validation test harness with frame-by-frame comparison
 */

export { VideoValidator } from './VideoValidator';
export { BatchValidator } from './BatchValidator';
export { Reporter } from './Reporter';

export type {
  ValidationConfig,
  ValidationResult,
  FrameComparisonResult,
  ExtractedFrame,
  VideoMetadata,
  PixelMatchOptions,
  BatchValidationConfig,
  BatchValidationResult,
} from './types';
