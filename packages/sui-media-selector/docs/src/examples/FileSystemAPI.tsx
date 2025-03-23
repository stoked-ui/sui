import * as React from 'react';
import { useState } from 'react';
import { Box, Button, Typography, Paper, Grid, Alert } from '@mui/material';
import { MediaFile } from '@stoked-ui/media-selector';
import { useTheme } from '@mui/material/styles';

/**
 * An advanced example demonstrating the use of the File System Access API 
 * with the MediaSelector component.
 */
export default function FileSystemAPIExample() {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fsApiSupported, setFsApiSupported] = useState<boolean>(false);
  
  // Check if File System API is supported
  React.useEffect(() => {
    setFsApiSupported('showOpenFilePicker' in window);
  }, []);
  
  // Function to handle file selection using the File System Access API
  const handleFileSelection = async () => {
    if (!fsApiSupported) {
      setError('File System Access API is not supported in this browser.');
      return;
    }
    
    try {
      setError(null);
      
      // @ts-ignore - TypeScript might not recognize showOpenFilePicker
      const fileHandles = await window.showOpenFilePicker({
        multiple: true,
        types: [
          {
            description: 'Images',
            accept: {
              'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
            }
          },
          {
            description: 'Videos',
            accept: {
              'video/*': ['.mp4', '.webm', '.avi', '.mov']
            }
          },
          {
            description: 'Audio',
            accept: {
              'audio/*': ['.mp3', '.wav', '.ogg']
            }
          }
        ]
      });
      
      const mediaFiles: MediaFile[] = [];
      
      for (const fileHandle of fileHandles) {
        const file = await fileHandle.getFile();
        
        const mediaFile = new MediaFile({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          file: file
        });
        
        mediaFiles.push(mediaFile);
      }
      
      setSelectedFiles(mediaFiles);
    } catch (e) {
      console.error('Error selecting files:', e);
      
      // Handle user cancellation
      if ((e as Error).name === 'AbortError') {
        console.log('User cancelled file selection');
        return;
      }
      
      setError(`Error selecting files: ${(e as Error).message || 'Unknown error'}`);
    }
  };
  
  // Function to save a file using the File System Access API
  const handleSaveFile = async (file: MediaFile) => {
    if (!fsApiSupported) {
      setError('File System Access API is not supported in this browser.');
      return;
    }
    
    try {
      setError(null);
      
      // @ts-ignore - TypeScript might not recognize showSaveFilePicker
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: file.name,
        types: [{
          description: file.type.split('/')[0] || 'File',
          accept: {
            [file.type]: [`.${file.name.split('.').pop()}`]
          }
        }]
      });
      
      const writable = await fileHandle.createWritable();
      await writable.write(await file.file.arrayBuffer());
      await writable.close();
      
      console.log('File saved successfully:', file.name);
    } catch (e) {
      console.error('Error saving file:', e);
      
      // Handle user cancellation
      if ((e as Error).name === 'AbortError') {
        console.log('User cancelled file saving');
        return;
      }
      
      setError(`Error saving file: ${(e as Error).message || 'Unknown error'}`);
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        File System Access API Example
      </Typography>
      
      {!fsApiSupported && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your browser does not support the File System Access API. This example may not work correctly.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button 
        variant="contained" 
        onClick={handleFileSelection}
        sx={{ mb: 3, mr: 2 }}
        disabled={!fsApiSupported}
      >
        Select Files Using File System API
      </Button>
      
      {selectedFiles.length > 0 && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: theme.palette.background.paper }}>
          <Typography variant="h6" gutterBottom>
            Selected Files ({selectedFiles.length})
          </Typography>
          
          <Grid container spacing={2}>
            {selectedFiles.map((file, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 1,
                    bgcolor: theme.palette.action.hover,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {file.name}
                  </Typography>
                  <Typography variant="body2">
                    Type: {file.type || 'Unknown'}
                  </Typography>
                  <Typography variant="body2">
                    Size: {Math.round(file.size / 1024)} KB
                  </Typography>
                  
                  <Box sx={{ flexGrow: 1 }} />
                  
                  <Button 
                    variant="outlined"
                    size="small"
                    onClick={() => handleSaveFile(file)}
                    sx={{ mt: 2, alignSelf: 'flex-start' }}
                    disabled={!fsApiSupported}
                  >
                    Save File
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
} 
