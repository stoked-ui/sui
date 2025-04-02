import * as React from 'react';
import { Editor } from '@stoked-ui/sui-editor';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function EditorUsage() {
  return (
    <Stack spacing={3}>
      <Typography variant="body1">
        The Editor component provides a complete media editing interface with integrated timeline,
        file browser, and preview capabilities.
      </Typography>
      
      <Box sx={{ height: '500px', width: '100%', border: '1px solid #e0e0e0' }}>
        <Editor 
          fileView={true}
          labels={true}
        />
      </Box>
    </Stack>
  );
} 
