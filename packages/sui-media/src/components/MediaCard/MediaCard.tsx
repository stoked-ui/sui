import * as React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Checkbox,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';
import { noOpRouter, noOpAuth, noOpPayment, noOpQueue } from '../../abstractions';
import type { MediaCardProps } from './MediaCard.types';
import { VideoProgressBar } from './VideoProgressBar';
import { calculateAspectRatio, formatDuration } from './MediaCard.utils';
import { useHybridMetadata } from './useHybridMetadata';
import { useServerThumbnail } from './useServerThumbnail';

/**
 * MediaCard Component
 *
 * A card component for displaying media items (images/videos) with:
 * - Thumbnail display
 * - Video progress tracking
 * - Interactive controls (play, edit, delete, etc.)
 * - Selection mode support
 * - Payment integration for paid content
 * - Queue management integration
 *
 * This is a SIMPLIFIED STUB implementation demonstrating the abstraction layer integration.
 * The full v3 implementation is 4,426 lines and includes:
 * - Advanced poster editing with drag/zoom
 * - Thumbnail strip hover previews
 * - Complex video playback controls
 * - MediaClass branding overlays
 * - Real-time metadata processing
 * - Extensive accessibility features
 *
 * This stub provides the core structure and prop interface for further development.
 *
 * @example
 * ```tsx
 * import { MediaCard } from '@stoked-ui/media';
 * import { useRouter, useAuth, usePayment, useQueue } from './hooks';
 *
 * function MyMediaGallery() {
 *   const router = useRouter();
 *   const auth = useAuth();
 *   const payment = usePayment();
 *   const queue = useQueue();
 *
 *   return (
 *     <MediaCard
 *       item={mediaItem}
 *       modeState={{ mode: 'view' }}
 *       setModeState={setModeState}
 *       router={router}
 *       auth={auth}
 *       payment={payment}
 *       queue={queue}
 *       onViewClick={(item) => console.log('View:', item)}
 *       onEditClick={(item) => console.log('Edit:', item)}
 *     />
 *   );
 * }
 * ```
 */
export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  modeState,
  setModeState,
  className,
  info = false,
  isVisible = true,
  minimalMode = false,
  displayMode,
  globalSelectionMode = false,
  isSelected = false,
  sx,
  contentSx,
  appearance = 'default',
  squareMode = false,
  inlinePlayback = false,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onTogglePublic,
  onToggleAdult,
  onHide,
  router = noOpRouter,
  auth = noOpAuth,
  payment = noOpPayment,
  queue = noOpQueue,
  mediaBaseUrl = '',
  thumbnailBaseUrl = '',
  enableKeyboardShortcuts = false,
  // API Integration (Work Item 4.2)
  apiClient,
  enableServerFeatures = true,
  onUploadProgress,
  onMetadataLoaded,
  metadataStrategy,
}) => {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isHovering, setIsHovering] = React.useState(false);
  const [isInlinePlaying, setIsInlinePlaying] = React.useState(false);
  const [isHoverPreviewSuppressed, setIsHoverPreviewSuppressed] = React.useState(false);
  const [generatedPoster, setGeneratedPoster] = React.useState<string>();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isDarkAppearance = appearance === 'dark';

  // Hybrid metadata extraction (client + server)
  const metadata = useHybridMetadata(
    item,
    enableServerFeatures ? apiClient : undefined,
    metadataStrategy,
    onMetadataLoaded,
  );

  // Server thumbnail generation
  const serverThumbnail = useServerThumbnail(
    item,
    enableServerFeatures ? apiClient : undefined,
    {
      autoGenerate: !item.thumbnail && !item.paidThumbnail,
    },
  );

  // Determine if current user owns this media
  const currentUser = auth.getCurrentUser();
  const isOwner = currentUser ? auth.isOwner(item.author || '') : false;

  // Check if media requires payment
  const requiresPayment = item.publicity === 'paid' && item.price && item.price > 0;

  // Build media URL
  const mediaUrl = item.file ? `${mediaBaseUrl || ''}${item.file}` : item.url;
  const canPreviewVideo = item.mediaType === 'video' && isVisible && !requiresPayment;

  // Build thumbnail URL (prefer server thumbnail from API)
  const thumbnailUrl = serverThumbnail.thumbnailUrl
    ? serverThumbnail.thumbnailUrl
    : item.thumbnail
      ? `${thumbnailBaseUrl || ''}${item.thumbnail}`
      : item.paidThumbnail
        ? `${thumbnailBaseUrl || ''}${item.paidThumbnail}`
        : generatedPoster;

  // Extract a frame from video as fallback thumbnail
  const extractVideoFrame = React.useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !canPreviewVideo || thumbnailUrl || generatedPoster) {
      return;
    }

    const extractFrame = () => {
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;
        ctx.drawImage(video, 0, 0);
        setGeneratedPoster(canvas.toDataURL());
      } catch (err) {
        // Silently ignore canvas errors (CORS, etc.)
      }
    };

    if (video.readyState >= 2) {
      extractFrame();
    } else {
      video.addEventListener('loadedmetadata', extractFrame, { once: true });
    }
  }, [canPreviewVideo, thumbnailUrl, generatedPoster]);
  const mediaTitle = item.title || 'Untitled';
  const mediaActionLabel = `${isInlinePlaying ? 'Pause' : 'Play'} ${mediaTitle}`;

  // Calculate aspect ratio for card (use server metadata if available)
  const aspectRatio = squareMode
    ? 100
    : calculateAspectRatio(
        metadata.width ?? item.width,
        metadata.height ?? item.height,
      );

  // Handle selection toggle
  const handleSelectionToggle = () => {
    if (!item._id) return;

    setModeState((prev) => {
      const selected = prev.selectState?.selected || [];
      const isCurrentlySelected = selected.includes(item._id!);

      return {
        ...prev,
        selectState: {
          selected: isCurrentlySelected
            ? selected.filter((id) => id !== item._id)
            : [...selected, item._id!],
        },
      };
    });
  };

  // Handle view/play click
  const handleViewClick = () => {
    if (requiresPayment && !isOwner) {
      // Trigger payment flow
      handlePurchase();
    } else if (onViewClick) {
      onViewClick(item);
    } else {
      // Navigate to media viewer
      router.navigate(`/media/${item._id}`);
    }
  };

  const stopHoverPreview = React.useCallback((rewind = true) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.pause();
    if (rewind && video.readyState > 0 && video.currentTime > 0) {
      try {
        video.currentTime = 0;
      } catch {
        // Ignore rewind failures from partially loaded media.
      }
    }
  }, []);

  const playVideo = React.useCallback((muted: boolean) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = muted;
    video.playsInline = true;
    video.loop = muted;
    video.controls = !muted;

    const playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => {
        // Ignore autoplay rejections so the card still renders normally.
      });
    }
  }, []);

  const activateMedia = (event?: React.SyntheticEvent) => {
    if (globalSelectionMode) {
      return;
    }

    event?.stopPropagation();

    if (item.mediaType === 'video' && inlinePlayback && canPreviewVideo) {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      if (isInlinePlaying && !video.paused) {
        stopHoverPreview(false);
        setIsInlinePlaying(false);
        setIsHoverPreviewSuppressed(true);
        return;
      }

      setIsInlinePlaying(true);
      setIsHoverPreviewSuppressed(false);
      playVideo(false);
      return;
    }

    handleViewClick();
  };

  const handleMediaClick = (event: React.MouseEvent) => {
    activateMedia(event);
  };

  const handleMediaKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    activateMedia(event);
  };

  // Handle purchase flow
  const handlePurchase = async () => {
    if (!item._id || !item.price) return;

    try {
      const paymentRequest = await payment.requestPayment({
        amount: item.price,
        currency: 'BTC',
        description: `Purchase: ${item.title || 'Media'}`,
        resourceId: item._id,
      });

      console.log('Payment requested:', paymentRequest);

      // In a real implementation, you would show a payment dialog here
      // and verify the payment before granting access
    } catch (error) {
      console.error('Payment request failed:', error);
    }
  };

  // Handle add to queue
  // const handleAddToQueue = () => {
  //   if (!item._id) return;
  //   queue.addItem({
  //     id: item._id,
  //     type: item.mediaType,
  //     title: item.title,
  //     src: mediaUrl,
  //     thumbnail: thumbnailUrl,
  //     duration: item.duration,
  //     metadata: item,
  //   });
  // };

  // Handle video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  React.useEffect(() => {
    const video = videoRef.current;

    if (!video || !canPreviewVideo) {
      return;
    }

    if (isInlinePlaying) {
      video.loop = false;
      video.controls = true;
      return;
    }

    if (isHovering && !isHoverPreviewSuppressed) {
      playVideo(true);
      return;
    }

    stopHoverPreview();
  }, [
    canPreviewVideo,
    isHovering,
    isHoverPreviewSuppressed,
    isInlinePlaying,
    mediaUrl,
    playVideo,
    stopHoverPreview,
  ]);

  React.useEffect(() => {
    extractVideoFrame();
  }, [extractVideoFrame]);

  React.useEffect(() => {
    setIsInlinePlaying(false);
    setIsHoverPreviewSuppressed(false);
  }, [mediaUrl]);

  return (
    <Card
      className={className}
      sx={[
        {
          position: 'relative',
          width: '100%',
          cursor: globalSelectionMode ? 'pointer' : 'default',
          overflow: 'hidden',
        },
        isDarkAppearance
          ? {
              color: '#f8fafc',
              backgroundColor: 'rgba(15, 23, 42, 0.94)',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.32)',
            }
          : {},
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsHoverPreviewSuppressed(false);
      }}
      onClick={globalSelectionMode ? handleSelectionToggle : undefined}
    >
      {/* Selection checkbox (in selection mode) */}
      {globalSelectionMode && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 10,
          }}
        >
          <Checkbox checked={isSelected} onChange={handleSelectionToggle} />
        </Box>
      )}

      {/* Media display area */}
      <Box
        data-testid="media-card-media"
        role={globalSelectionMode ? undefined : 'button'}
        aria-label={globalSelectionMode ? undefined : mediaActionLabel}
        tabIndex={globalSelectionMode ? undefined : 0}
        onClick={handleMediaClick}
        onKeyDown={handleMediaKeyDown}
        sx={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${aspectRatio}%`,
          backgroundColor: '#000',
          overflow: 'hidden',
        }}
      >
        {/* Loading state for thumbnail generation */}
        {serverThumbnail.isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 8,
            }}
          >
            <CircularProgress size={40} sx={{ color: '#fff' }} />
          </Box>
        )}

        {/* Error state for thumbnail generation */}
        {serverThumbnail.error && serverThumbnail.canRetry && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 9,
            }}
          >
            <Alert
              severity="error"
              sx={{ backgroundColor: 'rgba(211, 47, 47, 0.9)' }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    serverThumbnail.retry();
                  }}
                  startIcon={<RefreshIcon />}
                >
                  Retry
                </Button>
              }
            >
              Thumbnail failed
            </Alert>
          </Box>
        )}

        {/* Hidden canvas for frame extraction */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {item.mediaType === 'video' && isVisible && !requiresPayment ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            poster={thumbnailUrl}
            muted
            playsInline
            loop={!isInlinePlaying}
            controls={isInlinePlaying}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsInlinePlaying(false)}
            onLoadedMetadata={extractVideoFrame}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <CardMedia
            component="img"
            image={thumbnailUrl}
            alt={item.title || 'Media'}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Video progress bar */}
        {item.mediaType === 'video' && item.duration && (
          <VideoProgressBar
            currentTime={currentTime}
            duration={item.duration}
            visible={isHovering}
            spriteUrl={item.scrubberSprite}
            spriteConfig={item.scrubberSpriteConfig}
            onSeek={(time) => {
              if (videoRef.current) {
                videoRef.current.currentTime = time;
              }
            }}
          />
        )}

        {/* Overlay controls (on hover) */}
        {!minimalMode && isHovering && !globalSelectionMode && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: 1,
              zIndex: 5,
            }}
          >
            {/* Top left: Play button */}
            <IconButton
              aria-label={mediaActionLabel}
              onClick={handleMediaClick}
              sx={{
                color: '#fff',
                backgroundColor: 'rgba(0,0,0,0.5)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <PlayArrowIcon />
            </IconButton>

            {/* Top right: Owner controls */}
            {isOwner && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {onEditClick && (
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditClick(item);
                    }}
                    sx={{
                      color: '#fff',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {onTogglePublic && (
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      onTogglePublic(item);
                    }}
                    sx={{
                      color: '#fff',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    {item.publicity === 'public' ? <PublicIcon /> : <LockIcon />}
                  </IconButton>
                )}
                {onDeleteClick && (
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteClick(item);
                    }}
                    sx={{
                      color: '#fff',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Paid content indicator */}
        {requiresPayment && !isOwner && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#fff',
              zIndex: 6,
            }}
          >
            <LockIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2">
              {item.price} sats
            </Typography>
          </Box>
        )}
      </Box>

      {/* Card content (title, info) */}
      {info && (
        <CardContent
          sx={[
            {
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
              px: 2,
              py: 1.75,
              '&:last-child': { pb: 1.75 },
            },
            isDarkAppearance
              ? {
                  backgroundColor: 'rgba(15, 23, 42, 0.98)',
                }
              : {},
            ...(Array.isArray(contentSx) ? contentSx : contentSx ? [contentSx] : []),
          ]}
        >
          <Typography
            variant="body2"
            sx={{
              color: isDarkAppearance ? '#f8fafc' : undefined,
              fontWeight: 600,
              lineHeight: 1.35,
            }}
          >
            {mediaTitle}
          </Typography>
          {item.description && (
            <Typography
              variant="body2"
              sx={{
                color: isDarkAppearance ? 'rgba(226, 232, 240, 0.78)' : 'text.secondary',
                lineHeight: 1.45,
              }}
            >
              {item.description}
            </Typography>
          )}
          {item.mediaType === 'video' && (metadata.duration ?? item.duration) && (
            <Typography
              variant="caption"
              sx={{
                color: isDarkAppearance ? 'rgba(226, 232, 240, 0.68)' : 'text.secondary',
              }}
            >
              {formatDuration(metadata.duration ?? item.duration!)}
              {metadata.source === 'server' && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 0.5, color: 'success.main' }}
                  title="Server-verified duration"
                >
                  ✓
                </Typography>
              )}
            </Typography>
          )}
          {item.views !== undefined && (
            <Typography
              variant="caption"
              sx={{
                color: isDarkAppearance ? 'rgba(226, 232, 240, 0.68)' : 'text.secondary',
              }}
            >
              {item.views} views
            </Typography>
          )}
          {item.sourceUrl && (
            <Typography
              component="a"
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              sx={{
                color: isDarkAppearance ? '#38bdf8' : 'primary.main',
                textDecoration: 'none',
                overflowWrap: 'anywhere',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {item.sourceLabel || item.sourceUrl}
            </Typography>
          )}
          {metadata.isLoading && (
            <Typography
              variant="caption"
              sx={{
                color: isDarkAppearance ? 'rgba(226, 232, 240, 0.68)' : 'text.secondary',
              }}
            >
              (loading metadata...)
            </Typography>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default MediaCard;
