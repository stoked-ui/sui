import * as React from 'react';
import Box from '@mui/material/Box';

export default function FluxPreviewVideo() {
  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        '& video': {
          display: 'block',
          width: '100%',
          height: 'auto',
          borderRadius: 2,
        },
      }}
    >
      <video
        src="https://cdn.stokd.cloud/products/flux/assets/flux-preview_en.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
    </Box>
  );
}
