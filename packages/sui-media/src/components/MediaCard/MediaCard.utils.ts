import { DEFAULT_ASPECT_RATIO } from './MediaCard.constants';

/**
 * Calculate aspect ratio from dimensions
 * @param width - Width in pixels
 * @param height - Height in pixels
 * @returns Aspect ratio as percentage (for padding-bottom trick)
 */
export const calculateAspectRatio = (width?: number, height?: number): number => {
  if (width && height && width > 0) {
    return (height / width) * 100;
  }
  return DEFAULT_ASPECT_RATIO;
};

/**
 * Format duration in seconds to MM:SS or HH:MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted time string
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Convert timecode string (e.g., "01:23:45" or "1:23") to seconds
 * @param timecode - Time string in HH:MM:SS or MM:SS format
 * @returns Total seconds
 */
export const timeCodeToSeconds = (timecode: string): number => {
  const parts = timecode.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

/**
 * Report a video playback issue
 *
 * This function tracks reported issues in session storage and optionally
 * calls an onReportIssue callback to send the report to a backend.
 *
 * @param videoId - The ID of the video with issues
 * @param errorInfo - Description of the error
 * @param onReportIssue - Optional callback to report the issue to backend
 */
export function reportVideoIssue(
  videoId: string,
  errorInfo: string,
  onReportIssue?: (issue: {
    videoId: string;
    issueType: string;
    errorInfo: string;
    userAgent: string;
    timestamp: string;
  }) => void | Promise<void>
) {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    // Avoid double-reporting the same video in the same session
    const reportedVideos = sessionStorage.getItem('reportedVideoIssues') || '[]';
    const reportedList = JSON.parse(reportedVideos) as string[];

    if (reportedList.includes(videoId)) {
      return; // Already reported this session
    }

    // Add to local session storage to prevent duplicate reports
    reportedList.push(videoId);
    sessionStorage.setItem('reportedVideoIssues', JSON.stringify(reportedList));

    // Call the optional reporting callback
    if (onReportIssue) {
      onReportIssue({
        videoId,
        issueType: 'playback_error',
        errorInfo,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    // Silent failure in production
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[MediaCard] Failed to report video issue for ${videoId}:`, err);
    }
  }
}

/**
 * Convert a Blob to a data URL
 * @param blob - The blob to convert
 * @param callback - Callback function receiving the data URL
 */
export function blobToDataURL(blob: Blob, callback: (dataURL: string) => void) {
  const reader = new FileReader();
  reader.onload = function (e) {
    callback(e.target?.result as string);
  };
  reader.readAsDataURL(blob);
}

/**
 * Calculate skip amount based on video duration
 * Shorter videos (<10 min) skip 1/5 of duration
 * Longer videos skip 1/10 of duration
 *
 * @param duration - Video duration in seconds
 * @returns Skip amount in seconds
 */
export const calculateSkipAmount = (duration: number): number => {
  if (!duration || duration <= 0) return 0;
  const durationMinutes = duration / 60;
  return durationMinutes < 10 ? duration / 5 : duration / 10;
};

/**
 * Convert pixel delta to percentage for background-position
 * @param pixelDelta - Change in pixels
 * @param containerSize - Container dimension in pixels
 * @param imageScale - Current scale factor
 * @returns Percentage change
 */
export const pixelsToPercentage = (
  pixelDelta: number,
  containerSize: number,
  imageScale: number = 1
): number => {
  // With background-size: cover and scale applied, calculate percentage change
  const scaledImageSize = containerSize * Math.max(1, imageScale);
  const percentageChange = (pixelDelta / scaledImageSize) * 100;
  return percentageChange;
};

/**
 * Calculate valid position bounds to ensure full coverage
 * Background position percentages work as follows:
 * - 0% = left/top edge of image aligns with left/top edge of container
 * - 50% = center of image aligns with center of container
 * - 100% = right/bottom edge aligns with right/bottom edge
 *
 * @param _scale - Current scale (unused but kept for API consistency)
 * @returns Position bounds object
 */
export const calculatePositionBounds = (_scale: number = 1) => {
  return {
    x: { min: 0, max: 100 },
    y: { min: 0, max: 100 }
  };
};

/**
 * Apply position constraints to ensure coverage
 * @param position - Current position
 * @param scale - Current scale
 * @returns Constrained position
 */
export const constrainPosition = (
  position: { x: number; y: number },
  scale: number = 1
): { x: number; y: number } => {
  const bounds = calculatePositionBounds(scale);
  return {
    x: Math.max(bounds.x.min, Math.min(bounds.x.max, position.x)),
    y: Math.max(bounds.y.min, Math.min(bounds.y.max, position.y))
  };
};

/**
 * Get sprite sheet position for a specific frame
 * @param frameIndex - Index of the frame to display
 * @param config - Sprite configuration
 * @returns CSS background-position string
 */
export function getSpritePosition(
  frameIndex: number,
  config: {
    framesPerRow: number;
    frameWidth: number;
    frameHeight: number;
  }
): string {
  const row = Math.floor(frameIndex / config.framesPerRow);
  const col = frameIndex % config.framesPerRow;
  const x = -(col * config.frameWidth);
  const y = -(row * config.frameHeight);
  return `${x}px ${y}px`;
}
