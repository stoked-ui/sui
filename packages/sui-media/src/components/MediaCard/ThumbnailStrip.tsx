import * as React from 'react';
import { styled } from '@mui/system';
import { getSpritePosition } from './MediaCard.utils';
import type { SpriteConfig } from './MediaCard.types';

/**
 * Container for the entire thumbnail strip
 * Positioned above the progress bar, hidden by default, shows on hover
 */
interface StripContainerProps {
  visible: boolean;
}

const StripContainer = styled('div', {
  name: 'ThumbnailStrip',
  slot: 'Root',
  shouldForwardProp: (prop) => prop !== 'visible',
})<StripContainerProps>(({ theme, visible }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  padding: theme.spacing(0.75, 1.5),
  pointerEvents: visible ? 'auto' : 'none',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  opacity: visible ? 1 : 0,
  transform: visible ? 'translateY(0)' : 'translateY(4px)',
  transition: 'opacity 120ms ease-out, transform 160ms ease-out',
  zIndex: 4,
  background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1),
  },
}));

/**
 * Container for thumbnails - single row, fills width, no pill/card
 * This is also the interactive area that works like a progress bar.
 */
const ThumbnailsContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  gap: theme.spacing(0.25),
  padding: 0,
  overflow: 'hidden',
  cursor: 'pointer',
}));

/**
 * Individual thumbnail frame
 * Shows a single frame from the sprite sheet
 */
interface ThumbnailFrameProps {
  spriteUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  spriteSheetWidth: number;
  spriteSheetHeight: number;
  backgroundPosition: string;
  isActive?: boolean;
}

const ThumbnailFrame = styled('div')<ThumbnailFrameProps>(
  ({
    spriteUrl,
    thumbnailWidth,
    thumbnailHeight,
    spriteSheetWidth,
    spriteSheetHeight,
    backgroundPosition,
    isActive,
  }) => ({
    position: 'relative',
    width: thumbnailWidth,
    height: thumbnailHeight,
    backgroundImage: `url(${spriteUrl})`,
    backgroundPosition,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${spriteSheetWidth}px ${spriteSheetHeight}px`,
    backgroundColor: '#000',
    borderRadius: 2,
    overflow: 'hidden',
    flexGrow: 1,
    flexShrink: 1,
    opacity: isActive ? 1 : 0.7,
    transition: 'opacity 120ms ease-out',
    '&:hover': {
      opacity: 1,
    },
  }),
);

/**
 * Time label shown inside each thumbnail (bottom-right)
 */
const TimeLabel = styled('div')({
  position: 'absolute',
  right: 4,
  bottom: 4,
  padding: '1px 4px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: 3,
  fontSize: '9px',
  fontWeight: 500,
  color: '#fff',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
});

/**
 * Wrapper for each thumbnail + label
 */
const ThumbnailWrapper = styled('div')({
  position: 'relative',
  flex: '1 1 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  padding: 0,
  background: 'transparent',
});

export interface ThumbnailStripProps {
  /** URL to the sprite sheet image */
  spriteUrl: string;
  /** Sprite sheet configuration (grid layout and frame info) */
  spriteConfig: SpriteConfig;
  /** Total video duration in seconds */
  duration: number;
  /** Current playback time in seconds */
  currentTime: number;
  /** Whether the strip should be visible */
  visible: boolean;
  /** Callback when user seeks by clicking/dragging in the strip */
  onSeek?: (time: number) => void;
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
 * ThumbnailStrip
 *
 * - Single row at the bottom
 * - No borders / cards / scaling chrome
 * - Entire row acts like a progress bar (click / drag to seek)
 * - Thumbnails sampled evenly across the full video duration
 * - Active thumbnail is highlighted based on currentTime
 */
export const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({
  spriteUrl,
  spriteConfig,
  duration,
  currentTime,
  visible,
  onSeek,
}) => {
  const { totalFrames, framesPerRow, frameWidth, frameHeight, spriteSheetWidth, spriteSheetHeight, interval } = spriteConfig;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);

  // Measure container width on mount and resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Minimum reasonable thumbnail width (px)
  const MIN_THUMBNAIL_WIDTH = 64;

  // How many thumbnails can we afford across the width?
  const maxByWidth =
    containerWidth > 0 ? Math.max(3, Math.floor(containerWidth / MIN_THUMBNAIL_WIDTH)) : totalFrames;

  // Optional: cap total thumbnails for very long videos
  const MAX_THUMBNAILS_GLOBAL = 20;

  // How many thumbnails will we actually show?
  const visibleCount = Math.min(totalFrames, maxByWidth, MAX_THUMBNAILS_GLOBAL);

  const aspectRatio = frameWidth / frameHeight;

  // Derive per-thumbnail width to evenly occupy the container
  const thumbnailWidth =
    containerWidth > 0 && visibleCount > 0
      ? Math.max(
        MIN_THUMBNAIL_WIDTH,
        Math.floor(containerWidth / visibleCount) - 4, // subtract gap tweak
      )
      : frameWidth * 0.5;

  const thumbnailHeight = Math.floor(thumbnailWidth / aspectRatio);

  // Calculate scale factor from original frame size
  const scaleFactor = thumbnailWidth / frameWidth;

  // Calculate scaled sprite sheet dimensions (entire sprite, not just one frame)
  const scaledSpriteSheetWidth = spriteSheetWidth * scaleFactor;
  const scaledSpriteSheetHeight = spriteSheetHeight * scaleFactor;

  // Calculate which frame corresponds to current playback time
  const rawActiveIndex = Math.floor(currentTime / interval);
  const activeFrameIndex = Math.max(0, Math.min(totalFrames - 1, rawActiveIndex));

  // Build all frame positions with scaling
  const allThumbnails = React.useMemo(() => {
    const thumbs: Array<{ time: number; position: string; index: number }> = [];

    for (let i = 0; i < totalFrames; i++) {
      const time = i * interval;
      const position = getSpritePosition(i, { framesPerRow, frameWidth, frameHeight });

      // Scale the background position to match the scaled sprite sheet
      const scaledPosition = position.replace(/-?\d+/g, (match) => {
        const value = parseInt(match, 10);
        return String(Math.round(value * scaleFactor));
      });

      thumbs.push({ time, position: scaledPosition, index: i });
    }

    return thumbs;
  }, [totalFrames, interval, framesPerRow, frameWidth, frameHeight, scaleFactor]);

  // Sample down to the number of visible thumbnails, evenly across the full frame range
  const visibleThumbnails = React.useMemo(() => {
    if (visibleCount <= 0) return [];

    if (visibleCount >= totalFrames) {
      // We can show all frames
      return allThumbnails;
    }

    const items: Array<{ time: number; position: string; index: number }> = [];
    const lastIndex = totalFrames - 1;

    for (let i = 0; i < visibleCount; i++) {
      const ratio = visibleCount === 1 ? 0 : i / (visibleCount - 1);
      const frameIndex = Math.round(ratio * lastIndex);
      const thumb = allThumbnails[frameIndex];
      items.push(thumb);
    }

    return items;
  }, [allThumbnails, totalFrames, visibleCount]);

  // Use the entire strip area as a scrub/progress bar
  const handleStripSeek = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onSeek || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, x / rect.width));
      const targetTime = ratio * duration;
      onSeek(targetTime);
    },
    [onSeek, duration],
  );

  // Allow click + click-drag
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return; // only while mouse button held
      handleStripSeek(e);
    },
    [handleStripSeek],
  );

  return (
    <StripContainer visible={visible}>
      <ThumbnailsContainer
        ref={containerRef}
        role="slider"
        aria-label="Video scrubber"
        aria-valuenow={Math.round(currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        onClick={handleStripSeek}
        onMouseMove={handleMouseMove}
      >
        {visibleThumbnails.map((thumb) => (
          <ThumbnailWrapper key={thumb.index}>
            <ThumbnailFrame
              spriteUrl={spriteUrl}
              thumbnailWidth={thumbnailWidth}
              thumbnailHeight={thumbnailHeight}
              spriteSheetWidth={scaledSpriteSheetWidth}
              spriteSheetHeight={scaledSpriteSheetHeight}
              backgroundPosition={thumb.position}
              isActive={thumb.index === activeFrameIndex}
              aria-label={formatTime(thumb.time)}
            />
            <TimeLabel>{formatTime(thumb.time)}</TimeLabel>
          </ThumbnailWrapper>
        ))}
      </ThumbnailsContainer>
    </StripContainer>
  );
};

export default ThumbnailStrip;
