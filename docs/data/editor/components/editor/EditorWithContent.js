import * as React from 'react';
import { Editor, EditorFile, EditorProvider, Controllers } from '@stoked-ui/editor';
import Box from '@mui/material/Box';

export default function EditorWithContent() {
  const [file, setFile] = React.useState(null);
  
  React.useEffect(() => {
    // Create a new editor file with sample content
    const editorFile = new EditorFile({
      tracks: [
        {
          id: 'video-track',
          name: 'Video Track',
          type: 'video',
          actions: [
            { 
              id: 'video-clip-1', 
              start: 0, 
              duration: 10, 
              name: 'Intro Clip'
            }
          ]
        },
        {
          id: 'audio-track',
          name: 'Audio Track',
          type: 'audio',
          actions: [
            { 
              id: 'audio-clip-1', 
              start: 2, 
              duration: 8, 
              name: 'Background Music'
            }
          ]
        }
      ]
    });
    
    setFile(editorFile);
  }, []);
  
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
          file={file}
          fileView={true}
          labels={true}
        />
      </EditorProvider>
    </Box>
  );
} 