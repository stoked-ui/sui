import * as React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, IconButton, Checkbox } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import { noOpRouter, noOpAuth, noOpPayment, noOpQueue } from '../../abstractions';
import type { MediaCardProps } from './MediaCard.types';
import { VideoProgressBar } from './VideoProgressBar';
import { calculateAspectRatio, formatDuration } from './MediaCard.utils';
import './MediaCard.animations.css';

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
  squareMode = false,
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
}) => {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isHovering, setIsHovering] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Determine if current user owns this media
  const currentUser = auth.getCurrentUser();
  const isOwner = currentUser ? auth.isOwner(item.author || '') : false;

  // Check if media requires payment
  const requiresPayment = item.publicity === 'paid' && item.price && item.price > 0;

  // Build thumbnail URL
  const thumbnailUrl = item.thumbnail
    ? `${thumbnailBaseUrl || ''}${item.thumbnail}`
    : item.paidThumbnail
      ? `${thumbnailBaseUrl || ''}${item.paidThumbnail}`
      : undefined;

  // Build media URL
  const mediaUrl = item.file ? `${mediaBaseUrl || ''}${item.file}` : item.url;

  // Calculate aspect ratio for card
  const aspectRatio = squareMode ? 100 : calculateAspectRatio(item.width, item.height);

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
  const handleAddToQueue = () => {
    if (!item._id) return;

    queue.addItem({
      id: item._id,
      type: item.mediaType,
      title: item.title,
      src: mediaUrl,
      thumbnail: thumbnailUrl,
      duration: item.duration,
      metadata: item,
    });
  };

  // Handle video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  return (
    <Card
      className={className}
      sx={{
        position: 'relative',
        width: '100%',
        cursor: globalSelectionMode ? 'pointer' : 'default',
        ...sx,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
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
        sx={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${aspectRatio}%`,
          backgroundColor: '#000',
          overflow: 'hidden',
        }}
      >
        {item.mediaType === 'video' && isVisible && !requiresPayment ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            poster={thumbnailUrl}
            onTimeUpdate={handleTimeUpdate}
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
              onClick={handleViewClick}
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
                    onClick={() => onEditClick(item)}
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
                    onClick={() => onTogglePublic(item)}
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
                    onClick={() => onDeleteClick(item)}
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
        <CardContent>
          <Typography variant="body2" noWrap>
            {item.title || 'Untitled'}
          </Typography>
          {item.mediaType === 'video' && item.duration && (
            <Typography variant="caption" color="text.secondary">
              {formatDuration(item.duration)}
            </Typography>
          )}
          {item.views !== undefined && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {item.views} views
            </Typography>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default MediaCard;
