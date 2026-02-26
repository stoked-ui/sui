import * as React from 'react';
import Button from '@mui/material/Button';
import { MediaViewer } from '@stoked-ui/media';

export default function MediaViewerPreview() {
  const [open, setOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const mediaItems = [
    { id: '1', title: 'Sample Image', url: '/static/logo.png', mediaType: 'image' },
    { id: '2', title: 'Another Image', url: '/static/logo.png', mediaType: 'image' },
  ];

  return (
    <div>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Media Viewer
      </Button>
      <MediaViewer
        open={open}
        onClose={() => setOpen(false)}
        item={mediaItems[currentIndex]}
        mediaItems={mediaItems}
        currentIndex={currentIndex}
        onNavigate={(_, index) => setCurrentIndex(index)}
      />
    </div>
  );
}
