/**
 * MediaViewer Component
 *
 * Full-screen/theater mode media viewer with queue management.
 * Framework-agnostic implementation using abstraction layers.
 *
 * This is a simplified initial version that demonstrates the core
 * architecture. Additional sub-components can be added incrementally.
 */

import * as React from 'react';
import { Dialog, Box, styled } from '@mui/material';
import type { MediaViewerProps } from './MediaViewer.types';
import { MediaViewerHeader } from './MediaViewerHeader';
import { MediaViewerPrimary } from './MediaViewerPrimary';
import { NextUpHeader } from './NextUpHeader';
import { NowPlayingIndicator } from './NowPlayingIndicator';
import { useMediaViewerState, MediaViewerMode } from './hooks/useMediaViewerState';
import { useMediaViewerLayout } from './hooks/useMediaViewerLayout';
import { noOpRouter } from '../../abstractions/Router';
import { noOpAuth } from '../../abstractions/Auth';
import { noOpQueue } from '../../abstractions/Queue';
import { noOpKeyboardShortcuts } from '../../abstractions/KeyboardShortcuts';

// ============================================================================
// Styled Components
// ============================================================================

const ViewerDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    maxWidth: 'none',
    maxHeight: 'none',
    margin: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    overflow: 'hidden',
  },
});

const ViewerContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100vw',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
});

// ============================================================================
// Component
// ============================================================================

/**
 * MediaViewer - Full-screen media viewer component
 *
 * Features:
 * - Multiple view modes (NORMAL, THEATER, FULLSCREEN)
 * - Queue integration via IQueue abstraction
 * - Keyboard shortcuts via IKeyboardShortcuts abstraction
 * - Navigation controls
 * - Responsive layout
 */
export function MediaViewer({
  item,
  mediaItems = [],
  currentIndex = 0,
  open,
  onClose,
  onNavigate,
  router = noOpRouter,
  auth = noOpAuth,
  queue = noOpQueue,
  keyboard = noOpKeyboardShortcuts,
  hideNavbar = false,
  showPreviewCards = true,
  initialMode = 'NORMAL' as MediaViewerMode,
  autoplay = true,
  initialMuted = false,
  enableQueue,
  enableKeyboardShortcuts,
}: MediaViewerProps) {
  // Set default values for optional booleans
  const _enableQueue = enableQueue ?? true;
  const _enableKeyboardShortcuts = enableKeyboardShortcuts ?? true;
  // State management
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(initialMuted);
  const [showControls, setShowControls] = React.useState(true);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Viewer state machine
  const { mode, transition, legacyState } = useMediaViewerState(initialMode);

  // Layout calculation
  const layout = useMediaViewerLayout({
    item,
    mediaItems,
    currentIndex,
    hideNavbar,
    showPreviewCards: showPreviewCards && legacyState === 0,
    fullscreenState: legacyState,
  });

  // Determine if current item is video
  const isVideo = Boolean(item.mediaType === 'video' || item.url?.includes('.mp4') || item.file?.includes('.mp4'));

  // Navigation
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < mediaItems.length - 1;

  const handlePrev = React.useCallback(() => {
    if (canGoPrev && mediaItems[currentIndex - 1]) {
      onNavigate?.(mediaItems[currentIndex - 1], currentIndex - 1);
    }
  }, [canGoPrev, currentIndex, mediaItems, onNavigate]);

  const handleNext = React.useCallback(() => {
    if (canGoNext && mediaItems[currentIndex + 1]) {
      onNavigate?.(mediaItems[currentIndex + 1], currentIndex + 1);
    }
  }, [canGoNext, currentIndex, mediaItems, onNavigate]);

  // Controls visibility
  const showControlsWithTimeout = React.useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // Fullscreen handling
  const handleFullscreenClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    transition('CYCLE');
  }, [transition]);

  const handleExitTheaterMode = React.useCallback(() => {
    transition('EXIT_TO_NORMAL');
  }, [transition]);

  // Queue integration (if enabled)
  const queueCount = React.useMemo(() => {
    if (!_enableQueue) return 0;
    return queue.items.length;
  }, [_enableQueue, queue]);

  // Media URL helper
  const getMediaUrl = React.useCallback((type: 'videos' | 'images', id: string) => {
    // Default implementation - consumers should provide their own
    return `/api/media/${type}/${id}`;
  }, []);

  // Reset loaded state when item changes
  React.useEffect(() => {
    setVideoLoaded(false);
    setImageLoaded(false);
  }, [item.id]);

  // Keyboard shortcuts (if enabled)
  React.useEffect(() => {
    if (!_enableKeyboardShortcuts || !open) return;

    const shortcuts: Record<string, () => void | boolean> = {
      'ArrowLeft': () => { handlePrev(); return true; },
      'ArrowRight': () => { handleNext(); return true; },
      'Escape': () => { transition('EXIT_TO_NORMAL'); return true; },
      'f': () => { transition('CYCLE'); return true; },
    };

    const cleanup: (() => void)[] = [];
    Object.entries(shortcuts).forEach(([key, handler]) => {
      const unregisterFn = keyboard.register(key, handler);
      if (unregisterFn) {
        cleanup.push(unregisterFn);
      }
    });

    return () => {
      cleanup.forEach(fn => fn());
    };
  }, [_enableKeyboardShortcuts, open, handlePrev, handleNext, transition, keyboard]);

  return (
    <ViewerDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
        },
      }}
    >
      <ViewerContainer onMouseMove={showControlsWithTimeout}>
        <MediaViewerHeader
          item={item}
          isVideo={isVideo}
          showControls={showControls}
          showMetadata={!isVideo}
          fullscreenState={legacyState}
          onClose={onClose}
          onExitTheaterMode={handleExitTheaterMode}
          videoRef={videoRef}
        />

        <MediaViewerPrimary
          item={item}
          isVideo={isVideo}
          showPreviewCards={showPreviewCards && legacyState === 0}
          showControls={showControls}
          fullscreenState={legacyState}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          videoLoaded={videoLoaded}
          setVideoLoaded={setVideoLoaded}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          isMuted={isMuted}
          imageLoaded={imageLoaded}
          setImageLoaded={setImageLoaded}
          videoRef={videoRef}
          onPrev={handlePrev}
          onNext={handleNext}
          onFullscreenClick={handleFullscreenClick}
          showControlsWithTimeout={showControlsWithTimeout}
          getMediaUrl={getMediaUrl}
        />

        {/* Queue integration */}
        {_enableQueue && showPreviewCards && legacyState === 0 && mediaItems.length > 1 && (
          <Box sx={{ position: 'absolute', bottom: 16, width: '90%', maxWidth: '1200px' }}>
            <NextUpHeader queueCount={queueCount} show={true} />
          </Box>
        )}
      </ViewerContainer>
    </ViewerDialog>
  );
}

// Re-export types and hooks for convenience
export type { MediaViewerProps, MediaItem, MediaViewerMode } from './MediaViewer.types';
export { useMediaViewerState, useMediaViewerLayout } from './hooks';
export { MediaViewerHeader } from './MediaViewerHeader';
export { MediaViewerPrimary } from './MediaViewerPrimary';
export { NextUpHeader } from './NextUpHeader';
export { NowPlayingIndicator } from './NowPlayingIndicator';

export default MediaViewer;
