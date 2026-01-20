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

const TopRightControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
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

const VideoTitleBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: '0.75rem',
  background: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  display: 'flex',
  alignItems: 'flex-start',
  width: '100%',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
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
    padding: '0.5rem',
  },
}));

const MediaInfo = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '90vw',
  backgroundColor: '#121212',
  color: 'white',
  padding: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderRadius: '8px',
  marginTop: '8px',
  boxSizing: 'border-box',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.75rem',
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
      <TopRightControls>
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
        <VideoTitleBar className={!showControls ? 'controls-hidden' : ''}>
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
        <MediaInfo className="media-info">
          <Box>
            <Typography variant="h6">{item.title || 'Untitled'}</Typography>
            {item.description && <Typography variant="body2">{item.description}</Typography>}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {item.views !== undefined && (
              <Typography variant="body2">
                {item.views} {item.views === 1 ? 'view' : 'views'}
              </Typography>
            )}
            {item.createdAt && <Typography variant="body2">{formatDate(item.createdAt)}</Typography>}
          </Box>
        </MediaInfo>
      )}
    </>
  );
}

export default MediaViewerHeader;
