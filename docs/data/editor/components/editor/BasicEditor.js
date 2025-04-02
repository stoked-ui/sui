import * as React from 'react';
import { Editor } from '@stoked-ui/sui-editor';
import Box from '@mui/material/Box';

export default function BasicEditor() {
  return (
    <Box sx={{ height: '400px', width: '100%', border: '1px solid #e0e0e0' }}>
      <Editor />
    </Box>
  );
} 
