import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ThumbnailStrip } from '@stoked-ui/media';

function createSpriteUrl() {
  const frameWidth = 160;
  const frameHeight = 90;
  const framesPerRow = 4;
  const colors = ['#2563eb', '#0f766e', '#7c3aed', '#ea580c', '#dc2626', '#0891b2', '#65a30d', '#9333ea'];

  const frames = colors.map((color, index) => {
    const x = (index % framesPerRow) * frameWidth;
    const y = Math.floor(index / framesPerRow) * frameHeight;

    return `
      <g transform="translate(${x} ${y})">
        <rect width="${frameWidth}" height="${frameHeight}" rx="12" fill="${color}" />
        <rect x="10" y="10" width="${frameWidth - 20}" height="${frameHeight - 20}" rx="10" fill="rgba(255,255,255,0.16)" />
        <text x="${frameWidth / 2}" y="${frameHeight / 2 + 8}" text-anchor="middle" font-size="28" font-family="IBM Plex Sans, Arial" fill="#fff">${index + 1}</text>
      </g>
    `;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="180" viewBox="0 0 640 180">${frames}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const duration = 120;
const spriteConfig = {
  totalFrames: 8,
  framesPerRow: 4,
  frameWidth: 160,
  frameHeight: 90,
  spriteSheetWidth: 640,
  spriteSheetHeight: 180,
  interval: duration / 8,
};

export default function ThumbnailStripBasic() {
  const [currentTime, setCurrentTime] = React.useState(45);
  const spriteUrl = React.useMemo(() => createSpriteUrl(), []);

  return (
    <Stack spacing={2}>
      <Typography color="text.secondary" variant="body2">
        The strip uses a sprite sheet plus layout metadata. Drag the slider or click a frame to scrub.
      </Typography>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          bgcolor: 'grey.900',
          minHeight: 108,
          p: 2,
        }}
      >
        <ThumbnailStrip
          currentTime={currentTime}
          duration={duration}
          visible
          spriteUrl={spriteUrl}
          spriteConfig={spriteConfig}
          onSeek={setCurrentTime}
        />
      </Box>
      <Slider
        max={duration}
        min={0}
        onChange={(_event, value) => setCurrentTime(value)}
        value={currentTime}
        valueLabelDisplay="auto"
      />
    </Stack>
  );
}
