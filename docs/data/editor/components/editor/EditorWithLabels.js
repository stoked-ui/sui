import * as React from 'react';
import { Editor, EditorProvider, Controllers } from '@stoked-ui/editor';
import Box from '@mui/material/Box';

export default function EditorWithLabels() {
  return (
    <Box sx={{ height: '400px', width: '100%', border: '1px solid #e0e0e0' }}>
      <EditorProvider controllers={Controllers}>
        <Editor
          labels={true}
        />
      </EditorProvider>
    </Box>
  );
} 