/**
 * MediaViewerHeader Component
 *
 * Displays header information for MediaViewer with:
 * - Close/Exit controls (top-right)
 * - Video title bar (for videos)
 * - Media info (for images)
 *
 * Framework-agnostic version using only MUI dependencies.
 */

import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/system';
import * as React from 'react';
import type { MediaItem } from './MediaViewer.types';

// ============================================================================
// Styled Components
// ============================================================================

const TopRightControls = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fullscreenState',
})<{ fullscreenState?: 0 | 1 | 2 }>(({ theme, fullscreenState = 0 }) => ({
  position: 'absolute',
  top: fullscreenState >= 1 ? '8px' : '12px',
  right: fullscreenState >= 1 ? '12px' : 'calc(2.5vw + 12px)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  zIndex: 15,
  [theme.breakpoints.down('sm')]: {
    top: '8px',
    right: '8px',
    gap: '6px',
  },
}));

const TopRightButton = styled(IconButton)({
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  width: '36px',
  height: '36px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  '& svg': {
    width: '18px',
    height: '18px',
  },
});

const VideoTitleBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fullscreenState',
})<{ fullscreenState?: 0 | 1 | 2 }>(({ theme, fullscreenState = 0 }) => ({
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '1rem 1rem 2rem 1rem',
  background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6), transparent)',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  width: fullscreenState >= 1 ? '100vw' : '95vw',
  maxWidth: '100%',
  borderRadius: fullscreenState >= 1 ? '0' : '8px 8px 0 0',
  boxSizing: 'border-box',
  opacity: 1,
  transition: 'opacity 0.3s ease-in-out',
  zIndex: 5,
  pointerEvents: 'auto',
  '&.controls-hidden': {
    opacity: 0,
    pointerEvents: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '0.75rem 0.75rem 1.5rem 0.75rem',
    width: fullscreenState >= 1 ? '100vw' : '98vw',
  },
}));

const MediaInfo = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fullscreenState',
})<{ fullscreenState?: 0 | 1 | 2 }>(({ theme, fullscreenState = 0 }) => ({
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: fullscreenState >= 1 ? '100vw' : '95vw',
  maxWidth: '100%',
  background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6), transparent)',
  color: 'white',
  padding: '1rem 1rem 2rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  borderRadius: fullscreenState >= 1 ? '0' : '8px 8px 0 0',
  boxSizing: 'border-box',
  zIndex: 5,
  pointerEvents: 'none',
  opacity: 1,
  transition: 'opacity 0.3s ease-in-out',
  '&.controls-hidden': {
    opacity: 0,
  },
  [theme.breakpoints.down('sm')]: {
    padding: '0.75rem 0.75rem 1.5rem 0.75rem',
    width: fullscreenState >= 1 ? '100vw' : '98vw',
    gap: '0.25rem',
  },
}));

// ============================================================================
// Component Props
// ============================================================================

export interface MediaViewerHeaderProps {
  /** Media item data */
  item: MediaItem;
  /** Whether the media is a video (affects which header to show) */
  isVideo: boolean;
  /** Whether to show controls (affects VideoTitleBar visibility) */
  showControls: boolean;
  /** Whether to show metadata (affects MediaInfo visibility) */
  showMetadata: boolean;
  /** Fullscreen state (0=normal, 1=viewport-max, 2=fullscreen) */
  fullscreenState: 0 | 1 | 2;
  /** Close handler */
  onClose: () => void;
  /** Exit theater mode handler */
  onExitTheaterMode: () => void;
  /** Video ref for pausing on close (optional) */
  videoRef?: React.RefObject<HTMLVideoElement>;
}

// ============================================================================
// Component
// ============================================================================

export function MediaViewerHeader({
  item,
  isVideo,
  showControls,
  showMetadata,
  fullscreenState,
  onClose,
  onExitTheaterMode,
  videoRef,
}: MediaViewerHeaderProps) {
  /**
   * Handle close with video cleanup
   */
  const handleClose = () => {
    // Stop video playback before closing to prevent audio during animation
    if (videoRef?.current) {
      const video = videoRef.current;
      video.pause();
      video.muted = true;
    }

    onClose();
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Close button - always visible */}
      <TopRightControls fullscreenState={fullscreenState}>
        {fullscreenState >= 1 && (
          <TopRightButton onClick={onExitTheaterMode} aria-label="Exit Theater Mode" sx={{ mr: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
              EXIT
            </Typography>
          </TopRightButton>
        )}
        <TopRightButton onClick={handleClose} aria-label="Close">
          <CloseIcon />
        </TopRightButton>
      </TopRightControls>

      {/* Video title bar - only for videos */}
      {isVideo && (
        <VideoTitleBar
          className={!showControls ? 'controls-hidden' : ''}
          fullscreenState={fullscreenState}
        >
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 0.5, textAlign: 'left' }}>
              {item.title || 'Untitled'}
            </Typography>
            {(item.views !== undefined || item.createdAt) && (
              <Typography
                variant="body2"
                sx={{ fontSize: '0.875rem', opacity: 0.8, mb: item.description ? 0.5 : 0, textAlign: 'left' }}
              >
                {item.views !== undefined && item.createdAt
                  ? `${item.views} views · ${formatDate(item.createdAt)}`
                  : item.views !== undefined
                    ? `${item.views} views`
                    : item.createdAt
                      ? formatDate(item.createdAt)
                      : null}
              </Typography>
            )}
            {item.description && (
              <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'left' }}>
                {item.description}
              </Typography>
            )}
          </Box>
        </VideoTitleBar>
      )}

      {/* Media info - only for images */}
      {!isVideo && showMetadata && (
        <MediaInfo
          className={!showControls ? 'controls-hidden' : ''}
          fullscreenState={fullscreenState}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
            <Typography variant="h6" sx={{ textAlign: 'left' }}>{item.title || 'Untitled'}</Typography>
            {(item.views !== undefined || item.createdAt) && (
              <Typography
                variant="body2"
                sx={{ fontSize: '0.875rem', opacity: 0.8, textAlign: 'left' }}
              >
                {item.views !== undefined && item.createdAt
                  ? `${item.views} views · ${formatDate(item.createdAt)}`
                  : item.views !== undefined
                    ? `${item.views} views`
                    : item.createdAt
                      ? formatDate(item.createdAt)
                      : null}
              </Typography>
            )}
          </Box>
          {item.description && (
            <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'left' }}>
              {item.description}
            </Typography>
          )}
        </MediaInfo>
      )}
    </>
  );
}

export default MediaViewerHeader;
