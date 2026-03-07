import * as React from 'react';
import { Box, Typography, CircularProgress, Alert, AlertTitle } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import { styled } from '@mui/material/styles';
import { MediaCard, MediaCardDisplayMode } from '../MediaCard';
import { MediaViewer } from '../MediaViewer';
import { useMediaGallery } from '../../hooks/useMediaGallery';
import type { MediaGalleryProps } from './MediaGallery.types';
import type { ExtendedMediaItem, MediaCardModeState } from '../MediaCard/MediaCard.types';

const GalleryContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
}));

/**
 * MediaGallery Component
 * 
 * A comprehensive gallery for displaying media items from various data sources.
 * Supports:
 * - Direct data array
 * - REST API endpoint (with API key support)
 * - S3 bucket proxy
 * 
 * Features:
 * - Masonry grid layout
 * - Integrated MediaCard with hover controls
 * - Integrated MediaViewer for full-screen playback
 * - Loading and error states
 */
export const MediaGallery: React.FC<MediaGalleryProps> = (props) => {
  const {
    source = { endpoint: '/api/sui-media' },
    title,
    columns = { xs: 1, sm: 2, md: 3, lg: 4 },
    gap = 2,
    displayMode = 'otherContent',
    showTitles = true,
    showMetadata = true,
    allowSelection = false,
    onItemClick,
    onSelectionChange,
    router,
    auth,
    payment,
    queue,
    sx,
    className,
  } = props;

  // 1. Fetch data from source
  const { data: items = [], isLoading, error } = useMediaGallery(source);

  // 2. Local state for selection and viewer
  const [modeState, setModeState] = React.useState<MediaCardModeState>({
    mode: allowSelection ? 'select' : 'view',
    selectState: { selected: [] },
  });

  const [viewerItem, setViewerItem] = React.useState<ExtendedMediaItem | null>(null);
  const [viewerOpen, setViewerOpen] = React.useState(false);

  // 3. Handle card click (open viewer by default)
  const handleCardClick = (item: ExtendedMediaItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      setViewerItem(item);
      setViewerOpen(true);
    }
  };

  // 4. Handle selection changes
  React.useEffect(() => {
    if (onSelectionChange && modeState.selectState?.selected) {
      onSelectionChange(modeState.selectState.selected);
    }
  }, [modeState.selectState?.selected, onSelectionChange]);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8, ...sx }} className={className}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2, ...sx }} className={className}>
        <Alert severity="error">
          <AlertTitle>Failed to Load Gallery</AlertTitle>
          {error instanceof Error ? error.message : 'An unknown error occurred while fetching media items.'}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <Box sx={{ p: 8, textAlign: 'center', opacity: 0.7, ...sx }} className={className}>
        <Typography variant="h6">No media items found.</Typography>
        <Typography variant="body2">Try adjusting your source configuration or filters.</Typography>
      </Box>
    );
  }

  return (
    <GalleryContainer sx={sx} className={className}>
      {title && (
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          {title}
        </Typography>
      )}

      <Masonry columns={columns} spacing={gap}>
        {items.map((item, index) => {
          const itemId = item._id || (item as any).id;
          return (
            <MediaCard
              key={itemId || `media-${index}`}
              item={item}
              modeState={modeState}
              setModeState={setModeState}
              displayMode={displayMode as MediaCardDisplayMode}
              info={showMetadata}
              minimalMode={!showTitles}
              onViewClick={handleCardClick}
              router={router}
              auth={auth}
              payment={payment}
              queue={queue}
              isSelected={modeState.selectState?.selected.includes(itemId || '')}
              globalSelectionMode={allowSelection}
            />
          );
        })}
      </Masonry>

      {/* Media Viewer Dialog */}
      {viewerItem && (
        <MediaViewer
          item={viewerItem as any}
          mediaItems={items as any}
          currentIndex={items.findIndex(i => {
            const iId = i._id || (i as any).id;
            const vId = viewerItem._id || (viewerItem as any).id;
            return iId === vId;
          })}
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          onNavigate={(item) => setViewerItem(item as any)}
          router={router}
          auth={auth}
          queue={queue}
        />
      )}
    </GalleryContainer>
  );
};

export default MediaGallery;
