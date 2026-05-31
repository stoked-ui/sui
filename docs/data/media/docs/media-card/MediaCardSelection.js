import * as React from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { MediaCard } from '@stoked-ui/media';

const VIDEO_URL = 'https://cdn.stokd.cloud/products/flux/assets/flux-desktop-preview-1280x720.mp4';

const items = [
  {
    _id: 'media-card-selection-1',
    title: 'Behind the scenes',
    author: 'creator-1',
    mediaType: 'video',
    file: VIDEO_URL,
    url: VIDEO_URL,
    duration: 96,
    views: 324,
    publicity: 'public',
  },
  {
    _id: 'media-card-selection-2',
    title: 'Storyboards',
    author: 'creator-1',
    mediaType: 'video',
    file: VIDEO_URL,
    url: VIDEO_URL,
    width: 1200,
    height: 900,
    views: 188,
    publicity: 'public',
  },
  {
    _id: 'media-card-selection-3',
    title: 'Color pass',
    author: 'creator-1',
    mediaType: 'video',
    file: VIDEO_URL,
    url: VIDEO_URL,
    duration: 142,
    views: 507,
    publicity: 'public',
  },
];

export default function MediaCardSelection() {
  const [modeState, setModeState] = React.useState({
    mode: 'select',
    selectState: { selected: ['media-card-selection-2'] },
  });

  const selected = modeState.selectState?.selected || [];
  const selectionMode = modeState.mode === 'select';

  const toggleMode = () => {
    setModeState((previous) => ({
      ...previous,
      mode: previous.mode === 'select' ? 'view' : 'select',
      selectState: previous.selectState || { selected: [] },
    }));
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={toggleMode}>
          {selectionMode ? 'Return to view mode' : 'Enable selection mode'}
        </Button>
        <Chip color="primary" label={`${selected.length} selected`} />
      </Stack>
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item key={item._id} xs={12} md={4}>
            <MediaCard
              item={item}
              modeState={modeState}
              setModeState={setModeState}
              globalSelectionMode={selectionMode}
              isSelected={selected.includes(item._id)}
              squareMode
              info
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
