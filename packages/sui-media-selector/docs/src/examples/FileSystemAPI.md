# File System Access API Integration

This example demonstrates how to use the modern File System Access API with the media-selector component. This API provides a more powerful and flexible way to interact with the user's file system.

## Features Demonstrated

- Detecting browser support for the File System Access API
- Opening the system file picker with specific file type filters
- Loading selected files as MediaFile objects
- Saving/downloading files back to the user's system
- Error handling and user cancellation detection

## Browser Support

The File System Access API is currently supported in:
- Chrome 86+
- Edge 86+
- Opera 72+

For other browsers, you should provide a fallback method.

## Code Example

```tsx
import * as React from 'react';
import { Box, Button, Typography, Paper, Grid, Alert } from '@mui/material';
import { MediaFile } from '@stoked-ui/media-selector';
import { useTheme } from '@mui/material/styles';

export default function FileSystemAPIExample() {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = React.useState<MediaFile[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [fsApiSupported, setFsApiSupported] = React.useState<boolean>(false);
  
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
      
      // TypeScript might not recognize showOpenFilePicker
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
      
      // Process all files with Promise.all for better performance
      const files = await Promise.all(fileHandles.map(handle => handle.getFile()));
      
      const mediaFiles = files.map(file => new MediaFile({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        file
      }));
      
      setSelectedFiles(mediaFiles);
    } catch (e) {
      // Handle user cancellation
      if ((e as Error).name === 'AbortError') {
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
    } catch (e) {
      // Handle user cancellation
      if ((e as Error).name === 'AbortError') {
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
                  
                  <div style={{ flexGrow: 1 }} />
                  
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
```

## How It Works

1. The component checks if the File System Access API is supported in the user's browser
2. When the user clicks the "Select Files" button (and if the API is supported):
   - The system's file picker opens with configured file type filters
   - The user selects files, which are then loaded as `MediaFile` objects
3. For each selected file, the user can click "Save File" to:
   - Open the system's save dialog with a suggested filename and type
   - Write the file's content to the selected location

This approach provides a more integrated experience with the user's operating system and allows both reading and writing files. 
