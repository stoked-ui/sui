import * as React from 'react';
import { styled } from '@mui/system';
import { ThumbnailStrip } from './ThumbnailStrip';
import type { SpriteConfig } from './MediaCard.types';

/**
 * Container for the progress bar
 * Positioned at the bottom of the media card, expands on hover
 */
const ProgressBarContainer = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 3,
  backgroundColor: 'rgba(255, 255, 255, 0.25)',
  cursor: 'pointer',
  zIndex: 15,
  transition: 'height 0.15s ease, opacity 0.2s ease',
  opacity: 0.9,
  '&:hover': {
    height: 6,
    opacity: 1
  }
});

/**
 * Invisible hover zone that extends above the progress bar
 * Makes it easier to trigger the thumbnail strip and progress bar without precise hovering
 */
const HoverZone = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 100, // Extended to accommodate thumbnail strip
  zIndex: 14, // Below progress bar but above other content
  pointerEvents: 'auto',
  cursor: 'pointer'
});

/**
 * Progress fill bar
 * Width is controlled by the progress percentage
 */
const ProgressBarFill = styled('div')<{ progress: number }>(({ progress }) => ({
  height: '100%',
  width: `${Math.min(100, Math.max(0, progress))}%`,
  backgroundColor: 'rgba(244, 67, 54, 0.95)', // Red accent
  transition: 'width 0.1s linear',
  position: 'relative'
}));

/**
 * Scrubber handle that appears on hover or during drag
 */
const ProgressScrubber = styled('div')<{ isDragging?: boolean }>(({ isDragging }) => ({
  position: 'absolute',
  right: -6,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: '#f44336',
  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  opacity: isDragging ? 1 : 0,
  transition: 'opacity 0.15s ease, transform 0.1s ease',
  '.progress-bar-container:hover &': {
    opacity: 1
  },
  ...(isDragging && {
    transform: 'translateY(-50%) scale(1.2)',
  })
}));

/**
 * Time tooltip that shows on hover
 */
const TimeTooltip = styled('div')({
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginBottom: 8,
  padding: '2px 6px',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  borderRadius: 4,
  fontSize: '11px',
  fontWeight: 500,
  color: '#fff',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  opacity: 0,
  transition: 'opacity 0.15s ease',
  '.progress-bar-container:hover &': {
    opacity: 1
  }
});

/**
 * Container for the entire progress bar and thumbnail strip area
 * This wrapper allows both components to share hover state
 */
const ProgressAreaWrapper = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 14
});

export interface VideoProgressBarProps {
  /** Current playback position in seconds */
  currentTime: number;
  /** Total video duration in seconds */
  duration: number;
  /** Whether the progress bar should be visible */
  visible: boolean;
  /** Callback when user clicks to seek */
  onSeek?: (time: number) => void;
  /** Whether clicking seeks the video (default: true) */
  interactive?: boolean;
  /** Show time tooltip on hover (default: true) */
  showTooltip?: boolean;
  /** URL to the sprite sheet image (if available) */
  spriteUrl?: string;
  /** Sprite sheet configuration (grid layout and frame info) */
  spriteConfig?: SpriteConfig;
  /** Hide the thumbnail strip (e.g., in minimal mode) */
  hideThumbnailStrip?: boolean;
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds) || seconds < 0) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * VideoProgressBar - A minimal progress indicator for video previews
 *
 * Features:
 * - Shows current playback progress as a red bar
 * - Expands on hover for easier interaction
 * - Click to seek (when interactive=true)
 * - Shows thumbnail strip on hover (when sprite available)
 * - Falls back to time tooltip when sprite not available
 * - Accessible with ARIA attributes
 */
export const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  currentTime,
  duration,
  visible,
  onSeek,
  interactive = true,
  showTooltip = true,
  spriteUrl,
  spriteConfig,
  hideThumbnailStrip = false
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = React.useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = React.useState<number>(0);
  const [isHovering, setIsHovering] = React.useState<boolean>(false);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const isDraggingRef = React.useRef<boolean>(false); // Ref for event handlers

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Check if sprite preview is available and should be shown
  const hasThumbnailStrip = !!(spriteUrl && spriteConfig) && !hideThumbnailStrip;

  // Handle click to seek
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !onSeek || !containerRef.current || duration <= 0) return;

      e.stopPropagation();
      e.preventDefault();

      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const seekTime = percentage * duration;

      onSeek(seekTime);
    },
    [interactive, onSeek, duration]
  );

  // Handle mouse move for hover preview
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || duration <= 0) return;

      const rect = containerRef.current.getBoundingClientRect();
      const hoverX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, hoverX / rect.width));

      setHoverTime(percentage * duration);
      setHoverPosition(percentage * 100);
    },
    [duration]
  );

  const handleMouseEnter = React.useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    // Don't clear hover state while dragging - user may drag outside the bar
    if (isDraggingRef.current) return;
    setHoverTime(null);
    setIsHovering(false);
  }, []);

  // Calculate seek time from mouse position
  const calculateSeekTime = React.useCallback(
    (clientX: number): number => {
      if (!containerRef.current || duration <= 0) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const posX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, posX / rect.width));
      return percentage * duration;
    },
    [duration]
  );

  // Handle drag start (mousedown on progress bar)
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !onSeek || duration <= 0) return;

      // Prevent native drag behavior and stop propagation to dropzone
      e.preventDefault();
      e.stopPropagation();

      // Start dragging
      setIsDragging(true);
      isDraggingRef.current = true;

      // Seek immediately to clicked position
      const seekTime = calculateSeekTime(e.clientX);
      onSeek(seekTime);
    },
    [interactive, onSeek, duration, calculateSeekTime]
  );

  // Handle drag move (document-level mousemove while dragging)
  React.useEffect(() => {
    if (!isDragging) return;

    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !onSeek) return;

      // Prevent any default behavior
      e.preventDefault();
      e.stopPropagation();

      const seekTime = calculateSeekTime(e.clientX);
      onSeek(seekTime);

      // Update hover position for visual feedback
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const posX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, posX / rect.width));
        setHoverTime(percentage * duration);
        setHoverPosition(percentage * 100);
      }
    };

    const handleDocumentMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      // Prevent any default behavior
      e.preventDefault();
      e.stopPropagation();

      // Stop dragging
      setIsDragging(false);
      isDraggingRef.current = false;
    };

    // Add document-level listeners for drag tracking
    document.addEventListener('mousemove', handleDocumentMouseMove, { capture: true });
    document.addEventListener('mouseup', handleDocumentMouseUp, { capture: true });

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleDocumentMouseUp, { capture: true });
    };
  }, [isDragging, onSeek, duration, calculateSeekTime]);

  // Prevent native drag behavior (which could trigger dropzone)
  const handleDragStart = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  if (!visible) return null;

  return (
    <ProgressAreaWrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail strip - shows all sprite frames in a row */}
      {hasThumbnailStrip && (
        <ThumbnailStrip
          spriteUrl={spriteUrl}
          spriteConfig={spriteConfig}
          duration={duration}
          currentTime={currentTime}
          visible={isHovering}
          onSeek={onSeek}
        />
      )}

      {/* Invisible hover zone for easier thumbnail strip triggering */}
      <HoverZone
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onDragStart={handleDragStart}
        draggable={false}
      />

      <ProgressBarContainer
        ref={containerRef}
        className="progress-bar-container"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onDragStart={handleDragStart}
        draggable={false}
        role="slider"
        aria-label="Video progress - drag to seek"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ cursor: interactive ? (isDragging ? 'grabbing' : 'pointer') : 'default' }}
      >
        <ProgressBarFill progress={progress}>
          <ProgressScrubber isDragging={isDragging} />
        </ProgressBarFill>

        {/* Time tooltip - only shown when no thumbnail strip available */}
        {!hasThumbnailStrip && showTooltip && hoverTime !== null && (
          <TimeTooltip style={{ left: `${hoverPosition}%` }}>
            {formatTime(hoverTime)}
          </TimeTooltip>
        )}
      </ProgressBarContainer>
    </ProgressAreaWrapper>
  );
};

export default VideoProgressBar;
