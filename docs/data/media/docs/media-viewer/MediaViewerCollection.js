import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MediaViewer } from '@stoked-ui/media';

const VIDEO_URL = 'https://cdn.stokedconsulting.com/products/flux/assets/flux-desktop-preview-1920x1080.mp4';

const mediaItems = [
  {
    id: 'viewer-collection-video-1',
    title: 'Opening scene',
    mediaType: 'video',
    url: VIDEO_URL,
    file: VIDEO_URL,
    width: 1920,
    height: 1080,
  },
  {
    id: 'viewer-collection-image-1',
    title: 'Storyboard frame',
    mediaType: 'video',
    url: VIDEO_URL,
    file: VIDEO_URL,
    width: 1200,
    height: 900,
  },
  {
    id: 'viewer-collection-video-2',
    title: 'Final delivery',
    mediaType: 'video',
    url: VIDEO_URL,
    file: VIDEO_URL,
    width: 1920,
    height: 1080,
  },
];

export default function MediaViewerCollection() {
  const [open, setOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  return (
    <Stack spacing={2}>
      <Typography color="text.secondary" variant="body2">
        Open a mixed collection, then use previous and next controls or the preview rail to move between assets.
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {mediaItems.map((item, index) => (
          <Button
            key={item.id}
            onClick={() => {
              setCurrentIndex(index);
              setOpen(true);
            }}
            variant={currentIndex === index ? 'contained' : 'outlined'}
          >
            {item.title}
          </Button>
        ))}
      </Stack>
      <MediaViewer
        item={mediaItems[currentIndex]}
        mediaItems={mediaItems}
        currentIndex={currentIndex}
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={(_item, index) => setCurrentIndex(index)}
        showPreviewCards
      />
    </Stack>
  );
}
