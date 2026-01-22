import { styled } from '@mui/system';
import { Avatar, Box, Card, CardContent, Skeleton } from '@mui/material';

/**
 * Root container for the MediaCard
 * Uses a card-based layout with no border radius for grid layouts
 */
export const MediaCardRoot = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: 'transparent',
  borderRadius: 0,
  boxShadow: 'none',
  border: 'none',
  '&:hover .media-overlay': {
    opacity: 1
  },
  '&:hover .title-fade': {
    opacity: 0
  },
  '& .media-overlay.preview-starting': {
    opacity: 1
  },
  // When editing is active on ANY card, dim other cards slightly
  '&.editing-active': {
    // This class is toggled via global state
  }
})) as any;

/**
 * Container for the media thumbnail/video
 * Uses shouldForwardProp to prevent 'loading' prop from being passed to DOM
 */
export const MediaContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'loading'
})<{ loading?: boolean }>(({ loading }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  opacity: loading ? 0.7 : 1,
  transition: 'opacity 0.3s ease'
})) as any;

/**
 * Styled image element for the media thumbnail
 * Uses background-image for better control over positioning and scaling
 */
export const StyledImage = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  willChange: 'transform',
  transition: 'transform 0.1s ease-out'
}) as any;

/**
 * Skeleton placeholder while image is loading
 */
export const ImageSkeleton = styled(Skeleton)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  transform: 'none'
}) as any;

/**
 * Video element for preview playback
 * Hidden by default, shown when hovering with .visible class
 */
export const StyledVideo = styled('video')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  minWidth: '100%',
  minHeight: '100%',
  width: 'auto',
  height: 'auto',
  transform: 'translate(-50%, -50%)',
  objectFit: 'cover',
  display: 'none',
  '&.visible': {
    display: 'block'
  }
}) as any;

/**
 * Overlay container for controls and actions
 * Fades in on hover
 */
export const MediaOverlay = styled('div')<{ mediaTouch: boolean }>(({ theme, mediaTouch }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)',
  opacity: mediaTouch ? 1 : 0,
  transition: 'opacity 0.2s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  zIndex: 2
})) as any;

/**
 * Overlay for selection mode
 * Shows selection state with border
 */
export const SelectOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  padding: 8,
  pointerEvents: 'none',
  '& .MuiCheckbox-root': {
    pointerEvents: 'auto'
  }
}) as any;

/**
 * Title overlay at bottom of card
 * Fades out when hovering
 */
export const TitleOverlay = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '8px',
  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  transition: 'opacity 0.2s ease-in-out'
}) as any;

/**
 * Duration badge in bottom-right corner
 */
export const DurationOverlay = styled('div')({
  position: 'absolute',
  bottom: 8,
  right: 8,
  padding: '2px 6px',
  background: 'rgba(0, 0, 0, 0.8)',
  borderRadius: 4,
  fontSize: '12px',
  fontWeight: 500,
  color: '#fff',
  zIndex: 3,
  display: 'flex',
  alignItems: 'center',
  gap: 4
}) as any;

/**
 * Upload progress container
 */
export const UploadProgressContainer = styled('div')({
  position: 'absolute',
  bottom: 8,
  left: 8,
  right: 8,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 8px',
  background: 'rgba(0, 0, 0, 0.8)',
  borderRadius: 4,
  zIndex: 4
}) as any;

/**
 * Upload progress text
 */
export const UploadProgressText = styled('span')({
  fontSize: '12px',
  fontWeight: 500,
  color: '#fff'
}) as any;

/**
 * Container for overlapping avatars (tagged users)
 */
export const AvatarsContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  display: 'flex',
  flexDirection: 'row-reverse',
  zIndex: 3,
  '& .MuiAvatar-root': {
    width: 28,
    height: 28,
    border: `2px solid ${theme.palette.background.paper}`,
    marginLeft: -8,
    '&:last-child': {
      marginLeft: 0
    }
  }
})) as any;

/**
 * Individual overlapping avatar
 */
export const OverlappingAvatar = styled(Avatar)<{ index: number }>(({ theme, index }) => ({
  width: 28,
  height: 28,
  border: `2px solid ${theme.palette.background.paper}`,
  marginLeft: index > 0 ? -8 : 0,
  zIndex: 10 - index, // First avatar on top
  fontSize: '0.75rem'
})) as any;

/**
 * Views and date overlay in top-left
 */
export const ViewsDateOverlay = styled('div')({
  position: 'absolute',
  top: 8,
  left: 8,
  padding: '2px 6px',
  background: 'rgba(0, 0, 0, 0.7)',
  borderRadius: 4,
  fontSize: '11px',
  color: 'rgba(255, 255, 255, 0.9)',
  zIndex: 3,
  display: 'flex',
  alignItems: 'center',
  gap: 8
}) as any;

/**
 * Container for FAB action buttons
 */
export const FabButtonsContainer = styled('div')({
  position: 'absolute',
  bottom: 8,
  left: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  zIndex: 5,
  '& .MuiFab-root': {
    width: 36,
    height: 36,
    minHeight: 36
  }
}) as any;

/**
 * Container for delete button
 */
export const DeleteButtonContainer = styled('div')({
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 5,
  '& .MuiFab-root': {
    width: 32,
    height: 32,
    minHeight: 32
  }
}) as any;

/**
 * Card content section below the media
 */
export const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '8px !important',
  '&:last-child': {
    paddingBottom: '8px !important'
  }
}) as any;

/**
 * Container for the media thumbnail wrapper
 * Handles the aspect ratio padding trick
 */
export const MediaThumbnail = styled('div')({
  position: 'relative',
  width: '100%',
  overflow: 'hidden'
}) as any;

/**
 * Price tag overlay for paid content
 */
export const PriceTag = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 8,
  left: 8,
  padding: '4px 8px',
  background: 'rgba(0, 0, 0, 0.85)',
  borderRadius: 4,
  fontSize: '13px',
  fontWeight: 600,
  color: '#FFD700',
  zIndex: 3,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  '& svg': {
    fontSize: '16px'
  }
})) as any;

/**
 * Processing overlay for thumbnail generation
 */
export const ProcessingOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 4,
  gap: 8
}) as any;

/**
 * Error overlay for playback issues
 */
export const ErrorOverlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 4,
  padding: theme.spacing(2),
  gap: theme.spacing(1),
  color: theme.palette.error.main
})) as any;
