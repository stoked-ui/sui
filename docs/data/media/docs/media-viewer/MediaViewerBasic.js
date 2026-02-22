import { MediaViewer } from '@stoked-ui/media';

export default function MediaViewerPreview() {
  const mediaItems = [
    { id: '1', name: 'Video.mp4', url: '/media/video.mp4', type: 'video/mp4' },
    { id: '2', name: 'Image.jpg', url: '/media/image.jpg', type: 'image/jpeg' },
  ];

  return (
    <MediaViewer
      items={mediaItems}
      initialIndex={0}
    />
  );
}

