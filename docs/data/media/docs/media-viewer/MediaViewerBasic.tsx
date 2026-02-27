import * as React from 'react';
import { Button } from '@mui/material';
import { MediaViewer } from '@stoked-ui/media';
import type { MediaItem } from '@stoked-ui/media';

const VIDEO_URL = 'https://cdn.stokedconsulting.com/products/flux/assets/flux-desktop-preview-3840x2160.mp4';

/**
 * Demo media item with multiple resolution tracks.
 * In production these would be separate encoded files;
 * here they all point to the same source so the adaptive
 * bitrate UI is exercised without needing real variants.
 */
const demoItem: MediaItem = {
  id: 'demo-video-1',
  title: 'Stock Loop — Adaptive Bitrate Demo',
  mediaType: 'video',
  url: VIDEO_URL,
  file: VIDEO_URL,
  width: 1920,
  height: 1080,
  tracks: [
        { url: 'https://cdn.stokedconsulting.com/products/flux/assets/flux-desktop-preview-854x480.mp4', width: 854, height: 480, bitrate: 1500000, label: '480p' },
    { url: 'https://cdn.stokedconsulting.com/products/flux/assets/flux-desktop-preview-1280x720.mp4', width: 1280, height: 720, bitrate: 3000000, label: '720p' },
    { url: 'https://cdn.stokedconsulting.com/products/flux/assets/flux-desktop-preview-1920x1080.mp4', width: 1920, height: 1080, bitrate: 6000000, label: '1080p' },
    { url: 'https://cdn.stokedconsulting.com/products/flux/assets/flux-desktop-preview-3840x2160.mp4', width: 3840, height: 2160, bitrate: 12000000, label: '4K' },
  ],
};

const mediaItems: MediaItem[] = [
  demoItem,
  {
    id: 'demo-image-1',
    title: 'Sample Image',
    mediaType: 'image',
    url: '/static/branding/mui-x/card.png',
    width: 800,
    height: 600,
  },
];

export default function MediaViewerBasic() {
  const [open, setOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  return (
    <div>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Media Viewer
      </Button>
      <MediaViewer
        item={mediaItems[currentIndex]}
        mediaItems={mediaItems}
        currentIndex={currentIndex}
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={(_item, index) => setCurrentIndex(index)}
        autoplay
      />
    </div>
  );
}
