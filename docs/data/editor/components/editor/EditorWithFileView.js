import * as React from 'react';
import { Editor, EditorProvider, Controllers } from '@stoked-ui/editor';
import Box from '@mui/material/Box';

export default function EditorWithFileView() {
  return (
    <Box sx={{
      height: '500px',
      width: '100%',
      border: '1px solid #e0e0e0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <EditorProvider controllers={Controllers}>
        <Editor
          fileView={true}
        />
      </EditorProvider>
    </Box>
  );
} 