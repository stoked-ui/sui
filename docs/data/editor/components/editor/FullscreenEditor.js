import * as React from 'react';
import { Editor, EditorProvider, Controllers } from '@stoked-ui/editor';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

export default function FullscreenEditor() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        </Button>
      </Box>

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
            fullscreen={isFullscreen}
            labels={true}
          />
        </EditorProvider>
      </Box>
    </Box>
  );
} 