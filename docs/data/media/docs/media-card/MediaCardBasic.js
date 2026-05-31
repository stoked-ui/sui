import * as React from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { MediaCard } from '@stoked-ui/media';

const VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4';

const item = {
  _id: 'media-card-basic',
  title: 'City lights timelapse',
  author: 'creator-1',
  mediaType: 'video',
  file: VIDEO_URL,
  url: VIDEO_URL,
  duration: 184,
  views: 921,
  publicity: 'public',
};

export default function MediaCardBasic() {
  const [modeState, setModeState] = React.useState({ mode: 'view' });
  const [status, setStatus] = React.useState('Hover the card to reveal actions.');

  return (
    <Stack spacing={2} sx={{ maxWidth: 360, width: '100%' }}>
      <MediaCard
        item={item}
        modeState={modeState}
        setModeState={setModeState}
        info
        onViewClick={(nextItem) => setStatus(`Open requested for "${nextItem.title}".`)}
      />
      <Alert severity="info" variant="outlined">
        {status}
      </Alert>
    </Stack>
  );
}
