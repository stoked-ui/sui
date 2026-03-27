import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MediaViewer } from '@stoked-ui/media';

const item = {
  id: 'viewer-modes-video',
  title: 'Launch mode comparison',
  mediaType: 'video',
  url: 'https://cdn.stokedconsulting.com/products/flux/assets/flux-desktop-preview-1280x720.mp4',
  file: 'https://cdn.stokedconsulting.com/products/flux/assets/flux-desktop-preview-1280x720.mp4',
  thumbnail: '/static/branding/mui-x/card.png',
  width: 1280,
  height: 720,
};

export default function MediaViewerModes() {
  const [open, setOpen] = React.useState(false);
  const [viewerMode, setViewerMode] = React.useState('NORMAL');
  const [instanceKey, setInstanceKey] = React.useState(0);

  const openViewer = (nextMode) => {
    setViewerMode(nextMode);
    setInstanceKey((value) => value + 1);
    setOpen(true);
  };

  return (
    <Stack spacing={2}>
      <Typography color="text.secondary" variant="body2">
        Use the same media source with different starting layouts. Theater mode opens without the bottom preview rail.
      </Typography>
      <ButtonGroup variant="outlined">
        <Button onClick={() => openViewer('NORMAL')}>Open in normal mode</Button>
        <Button onClick={() => openViewer('THEATER')}>Open in theater mode</Button>
      </ButtonGroup>
      <MediaViewer
        key={instanceKey}
        item={item}
        mediaItems={[item]}
        currentIndex={0}
        open={open}
        onClose={() => setOpen(false)}
        initialMode={viewerMode}
        showPreviewCards={viewerMode === 'NORMAL'}
      />
    </Stack>
  );
}
