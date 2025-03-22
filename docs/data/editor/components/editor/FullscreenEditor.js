import * as React from 'react';
import { Editor } from '@stoked-ui/sui-editor';
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
    <Box sx={{ height: '400px', width: '100%', border: '1px solid #e0e0e0' }}>
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        </Button>
      </Box>
      
      <Editor 
        fullscreen={isFullscreen}
        labels={true}
      />
    </Box>
  );
} 