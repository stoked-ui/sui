import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { VideoProgressBar } from '@stoked-ui/media';

function createSpriteUrl() {
  const frameWidth = 160;
  const frameHeight = 90;
  const framesPerRow = 4;
  const colors = ['#1d4ed8', '#0369a1', '#0f766e', '#7c2d12', '#9f1239', '#5b21b6', '#166534', '#a16207'];

  const frames = colors.map((color, index) => {
    const x = (index % framesPerRow) * frameWidth;
    const y = Math.floor(index / framesPerRow) * frameHeight;

    return `
      <g transform="translate(${x} ${y})">
        <rect width="${frameWidth}" height="${frameHeight}" rx="12" fill="${color}" />
        <circle cx="${frameWidth / 2}" cy="${frameHeight / 2}" r="18" fill="rgba(255,255,255,0.24)" />
        <text x="${frameWidth / 2}" y="${frameHeight / 2 + 8}" text-anchor="middle" font-size="22" font-family="IBM Plex Sans, Arial" fill="#fff">${index + 1}</text>
      </g>
    `;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="180" viewBox="0 0 640 180">${frames}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const duration = 160;
const spriteConfig = {
  totalFrames: 8,
  framesPerRow: 4,
  frameWidth: 160,
  frameHeight: 90,
  spriteSheetWidth: 640,
  spriteSheetHeight: 180,
  interval: duration / 8,
};

export default function VideoProgressBarBasic() {
  const [currentTime, setCurrentTime] = React.useState(56);
  const spriteUrl = React.useMemo(() => createSpriteUrl(), []);

  return (
    <Stack spacing={2}>
      <Typography color="text.secondary" variant="body2">
        Hover the scrubber to reveal the thumbnail strip, or click the bar to jump to a new timestamp.
      </Typography>
      <Box
        sx={{
          position: 'relative',
          minHeight: 220,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f172a, #1e293b 55%, #334155)',
        }}
      >
        <Box
          sx={{
            color: '#fff',
            p: 2,
          }}
        >
          <Typography variant="h6">Preview timeline</Typography>
          <Typography color="rgba(255,255,255,0.72)" variant="body2">
            Current time: {Math.round(currentTime)}s / {duration}s
          </Typography>
        </Box>
        <VideoProgressBar
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
