/**
 * MediaViewerPrimary Component
 *
 * Handles primary media display with:
 * - Video/Image rendering with skeleton loading
 * - Navigation buttons (prev/next)
 * - Video event handlers and state management
 * - Fullscreen state adaptation
 *
 * Framework-agnostic version - simplified for package migration.
 */

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, IconButton, Skeleton } from '@mui/material';
import { styled } from '@mui/system';
import * as React from 'react';
import type { MediaItem } from './MediaViewer.types';

// ============================================================================
// Styled Components
// ============================================================================

const VideoWithTitleContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  alignItems: 'center',
  width: '100%',
  maxWidth: '100%',
  height: 'auto',
  minHeight: '400px',
  flex: '1 1 auto',
  boxSizing: 'border-box',
});

const StyledVideo = styled('video', {
  shouldForwardProp: (prop) => prop !== 'fullscreenState' && prop !== 'noPreview',
})<{ fullscreenState?: 0 | 1 | 2; noPreview?: boolean }>(({ fullscreenState, noPreview }) => ({
  width: fullscreenState === 1 ? '100vw' : '100%',
  maxWidth: fullscreenState === 1 ? '100vw' : '100%',
  height: 'auto',
  maxHeight:
    (fullscreenState ?? 0) === 2
      ? '100vh'
      : (fullscreenState ?? 0) === 1
        ? '95vh'
        : noPreview
          ? '90vh'
          : '80vh',
  minHeight: '300px',
  borderRadius: (fullscreenState ?? 0) >= 1 ? '0' : '8px',
  objectFit: 'contain',
  backgroundColor: 'black',
  display: 'block',
}));

const StyledImage = styled('img', {
  shouldForwardProp: (prop) => prop !== 'fullscreenState' && prop !== 'noPreview',
})<{ fullscreenState?: 0 | 1 | 2; noPreview?: boolean }>(({ fullscreenState, noPreview }) => ({
  width: '100%',
  maxWidth: '100%',
  height: 'auto',
  maxHeight:
    (fullscreenState ?? 0) === 2
      ? '100vh'
      : (fullscreenState ?? 0) === 1
        ? '95vh'
        : noPreview
          ? '90vh'
          : '80vh',
  minHeight: '300px',
  borderRadius: (fullscreenState ?? 0) >= 1 ? '0' : '0 0 8px 8px',
  objectFit: 'contain',
  backgroundColor: 'black',
  display: 'block',
}));

const VideoSkeleton = styled(Skeleton, {
  shouldForwardProp: (prop) => prop !== 'fullscreenState' && prop !== 'noPreview',
})<{ fullscreenState?: 0 | 1 | 2; noPreview?: boolean }>(({ theme, fullscreenState, noPreview }) => ({
  width: '100%',
  maxWidth: '100%',
  height: 'auto',
  maxHeight:
    fullscreenState === 2 ? '100vh' : (fullscreenState ?? 0) === 1 ? '95vh' : noPreview ? '90vh' : '80vh',
  minHeight: '300px',
  aspectRatio: '16/9',
  borderRadius: (fullscreenState ?? 0) >= 1 ? '0' : '8px',
  transform: 'none',
  '&.MuiSkeleton-root': {
    transform: 'scale(1)',
  },
  [theme.breakpoints.down('md')]: {
    minHeight: '250px',
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: '200px',
  },
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 10,
  opacity: 1,
  transition: 'opacity 0.3s ease-in-out',
  '&.controls-hidden': {
    opacity: 0,
    pointerEvents: 'none',
  },
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  [theme.breakpoints.down('sm')]: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const PrevButton = styled(NavigationButton)({
  left: -56,
  justifyContent: 'center',
  alignItems: 'center',
  '& svg': {
    transform: 'translateX(4px)',
  },
});

const NextButton = styled(NavigationButton)({
  right: -56,
  justifyContent: 'center',
  alignItems: 'center',
});

// ============================================================================
// Component Props
// ============================================================================

export interface MediaViewerPrimaryProps {
  /** Media item data */
  item: MediaItem;
  /** Whether media is a video */
  isVideo: boolean;
  /** Whether to show preview cards */
  showPreviewCards: boolean;
  /** Whether to show controls */
  showControls: boolean;
  /** Fullscreen state */
  fullscreenState: 0 | 1 | 2;
  /** Can navigate to previous item */
  canGoPrev: boolean;
  /** Can navigate to next item */
  canGoNext: boolean;
  /** Whether video is loaded */
  videoLoaded: boolean;
  /** Set video loaded state */
  setVideoLoaded: (loaded: boolean) => void;
  /** Whether video is playing */
  isPlaying: boolean;
  /** Set playing state */
  setIsPlaying: (playing: boolean) => void;
  /** Whether video is muted */
  isMuted: boolean;
  /** Whether image is loaded */
  imageLoaded: boolean;
  /** Set image loaded state */
  setImageLoaded: (loaded: boolean) => void;
  /** Video ref */
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Previous item handler */
  onPrev: () => void;
  /** Next item handler */
  onNext: () => void;
  /** Fullscreen click handler */
  onFullscreenClick: (e: React.MouseEvent) => void;
  /** Show controls with timeout */
  showControlsWithTimeout: () => void;
  /** Function to get media URL */
  getMediaUrl: (type: 'videos' | 'images', id: string) => string;
}

// ============================================================================
// Component
// ============================================================================

export function MediaViewerPrimary({
  item,
  isVideo,
  showPreviewCards,
  showControls,
  fullscreenState,
  canGoPrev,
  canGoNext,
  videoLoaded,
  setVideoLoaded,
  isPlaying,
  setIsPlaying,
  isMuted,
  imageLoaded,
  setImageLoaded,
  videoRef,
  onPrev,
  onNext,
  onFullscreenClick,
  showControlsWithTimeout,
  getMediaUrl,
}: MediaViewerPrimaryProps) {
  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <VideoWithTitleContainer>
      {/* Navigation buttons */}
      {canGoPrev && (
        <PrevButton
          className={!showControls ? 'controls-hidden' : ''}
          onClick={() => {
            showControlsWithTimeout();
            onPrev();
          }}
          aria-label="Previous"
        >
          <ArrowBackIosIcon />
        </PrevButton>
      )}

      {canGoNext && (
        <NextButton
          className={!showControls ? 'controls-hidden' : ''}
          onClick={() => {
            showControlsWithTimeout();
            onNext();
          }}
          aria-label="Next"
        >
          <ArrowForwardIosIcon />
        </NextButton>
      )}

      {/* Media display */}
      {isVideo && (item.id || item.url || item.file) ? (
        <>
          {!videoLoaded && (
            <VideoSkeleton
              variant="rectangular"
              animation="wave"
              fullscreenState={fullscreenState}
              noPreview={!showPreviewCards}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&::after': {
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                },
              }}
            />
          )}

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 'auto',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              pointerEvents: videoLoaded ? 'auto' : 'none',
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFullscreenClick(e as React.MouseEvent);
            }}
          >
            <StyledVideo
              controls
              preload="metadata"
              ref={videoRef}
              playsInline
              autoPlay
              muted={isMuted}
              fullscreenState={fullscreenState}
              noPreview={!showPreviewCards}
              onClick={handleVideoClick}
              onPlay={() => {
                setIsPlaying(true);
                showControlsWithTimeout();
              }}
              onPause={() => setIsPlaying(false)}
              onLoadedData={() => setVideoLoaded(true)}
              onCanPlayThrough={() => setVideoLoaded(true)}
              onError={() => setVideoLoaded(true)}
              onMouseMove={showControlsWithTimeout}
              onMouseEnter={showControlsWithTimeout}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFullscreenClick(e as React.MouseEvent);
              }}
            >
              <source src={item.id ? getMediaUrl('videos', item.id) : item.url || item.file} type="video/mp4" />
            </StyledVideo>
          </Box>
        </>
      ) : (
        <>
          {!imageLoaded && (
            <VideoSkeleton
              variant="rectangular"
              animation="wave"
              fullscreenState={fullscreenState}
              noPreview={!showPreviewCards}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&::after': {
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                },
              }}
            />
          )}

          <StyledImage
            src={item.id ? getMediaUrl('images', item.id) : item.url || item.thumbnail || '/placeholders/600x400.png'}
            alt={item.title || 'Media'}
            fullscreenState={fullscreenState}
            noPreview={!showPreviewCards}
            style={{ display: imageLoaded ? 'block' : 'none' }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </>
      )}
    </VideoWithTitleContainer>
  );
}

export default MediaViewerPrimary;
