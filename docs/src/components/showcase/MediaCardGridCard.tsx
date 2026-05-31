import * as React from 'react';
import Box from '@mui/material/Box';
import Paper, { PaperProps } from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MediaCard } from '@stoked-ui/media';

const VIDEO_URL = 'https://cdn.stokd.cloud/products/flux/assets/flux-desktop-preview-1280x720.mp4';

const ITEMS = [
  {
    _id: 'consulting-media-1',
    title: 'Client onboarding reel',
    author: 'stoked-consulting',
    mediaType: 'video' as const,
    file: VIDEO_URL,
    url: VIDEO_URL,
    duration: 96,
    views: 324,
    publicity: 'public' as const,
  },
  {
    _id: 'consulting-media-2',
    title: 'Q3 product update',
    author: 'stoked-consulting',
    mediaType: 'video' as const,
    file: VIDEO_URL,
    url: VIDEO_URL,
    duration: 142,
    views: 507,
    publicity: 'public' as const,
  },
];

type MediaCardGridCardProps = PaperProps & {
  id?: string;
};

export default function MediaCardGridCard({ sx, ...other }: MediaCardGridCardProps) {
  const [modeState, setModeState] = React.useState<any>({ mode: 'view' });
  return (
    <Paper
      variant="outlined"
      sx={[
        (theme) => ({
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          ...theme.applyDarkStyles({
            bgcolor: 'primaryDark.900',
            borderColor: 'primaryDark.700',
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>
          Media
        </Typography>
      </Box>
      <Stack spacing={1.5}>
        {ITEMS.map((item) => (
          <MediaCard
            key={item._id}
            item={item as any}
            modeState={modeState}
            setModeState={setModeState}
            info
          />
        ))}
      </Stack>
    </Paper>
  );
}
