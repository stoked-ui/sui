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
import { Dialog, Box, styled, CircularProgress, Alert, AlertTitle } from '@mui/material';
import type { MediaViewerProps, MediaItem } from './MediaViewer.types';
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
  item: initialItem,
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
  // API Integration (Work Item 4.2)
  apiClient,
  enableServerFeatures = true,
  onMediaLoaded,
  onMetadataLoaded,
}: MediaViewerProps) {
  // Set default values for optional booleans
  const _enableQueue = enableQueue ?? true;
  const _enableKeyboardShortcuts = enableKeyboardShortcuts ?? true;

  // API state management
  const [item, setItem] = React.useState<MediaItem>(initialItem);
  const [isLoadingMedia, setIsLoadingMedia] = React.useState(false);
  const [mediaLoadError, setMediaLoadError] = React.useState<string | undefined>();

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

  // Load media from API when item changes (if API client is available)
  React.useEffect(() => {
    // Reset item to initialItem when it changes
    setItem(initialItem);

    // Skip if no API client or server features disabled
    if (!apiClient || !enableServerFeatures || !initialItem.id) {
      setMediaLoadError(undefined);
      setIsLoadingMedia(false);
      return;
    }

    // Load full media details from API
    let cancelled = false;
    setIsLoadingMedia(true);
    setMediaLoadError(undefined);

    const loadMedia = async () => {
      try {
        const mediaData = await apiClient.getMedia(initialItem.id);

        if (cancelled) return;

        // Map API response to MediaItem interface
        const loadedItem: MediaItem = {
          id: mediaData._id || initialItem.id,
          title: mediaData.title,
          description: mediaData.description,
          url: mediaData.file,
          file: mediaData.file,
          thumbnail: mediaData.thumbnail,
          width: mediaData.width,
          height: mediaData.height,
          duration: mediaData.duration,
          views: mediaData.views,
          publicity: mediaData.publicity,
          mediaType: mediaData.mediaType,
          ...initialItem,
        };

        setItem(loadedItem);
        setIsLoadingMedia(false);

        // Notify parent
        if (onMediaLoaded) {
          onMediaLoaded(loadedItem);
        }

        // Notify metadata callback if metadata is available
        if (onMetadataLoaded && (mediaData.duration || mediaData.width || mediaData.height)) {
          onMetadataLoaded({
            duration: mediaData.duration,
            width: mediaData.width,
            height: mediaData.height,
          });
        }
      } catch (error) {
        if (cancelled) return;

        console.error('Failed to load media from API:', error);
        setMediaLoadError(error instanceof Error ? error.message : 'Failed to load media');
        setIsLoadingMedia(false);
      }
    };

    loadMedia();

    return () => {
      cancelled = true;
    };
  }, [initialItem, apiClient, enableServerFeatures, onMediaLoaded, onMetadataLoaded]);

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
        {/* Loading state */}
        {isLoadingMedia && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
            }}
          >
            <CircularProgress size={60} sx={{ color: '#fff' }} />
            <Box sx={{ color: '#fff', opacity: 0.7 }}>
              Loading media from server...
            </Box>
          </Box>
        )}

        {/* Error state */}
        {mediaLoadError && !isLoadingMedia && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: 3,
            }}
          >
            <Alert severity="error" sx={{ maxWidth: 600 }}>
              <AlertTitle>Failed to Load Media</AlertTitle>
              {mediaLoadError}
              <br />
              <br />
              Displaying cached data. Some features may be unavailable.
            </Alert>
          </Box>
        )}

        {/* Main content (show if not loading or if error with fallback) */}
        {!isLoadingMedia && (
          <>
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
          </>
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
