# Basic Media Selection

This example demonstrates the most fundamental use case of the media selector: selecting files from the user's device and displaying them in a list.

## Features Demonstrated

- Creating a basic file input
- Handling file selection
- Converting native File objects to MediaFile objects
- Displaying selected files with their metadata

## Code Example

```tsx
import * as React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { MediaFile } from '@stoked-ui/media-selector';
import { useTheme } from '@mui/material/styles';

export default function BasicExample() {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = React.useState<MediaFile[]>([]);
  
  // Handler for file selection
  const handleFilesSelected = (files: MediaFile[]) => {
    setSelectedFiles(files);
  };
  
  // Function to trigger file selection
  const openFileSelector = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*,video/*,audio/*';
    
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const mediaFiles: MediaFile[] = [];
        
        for (let i = 0; i < target.files.length; i++) {
          const file = target.files[i];
          const mediaFile = new MediaFile({
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            file
          });
          mediaFiles.push(mediaFile);
        }
        
        handleFilesSelected(mediaFiles);
      }
    };
    
    fileInput.click();
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Media Selector Basic Example
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={openFileSelector}
        sx={{ mb: 3 }}
      >
        Select Media Files
      </Button>
      
      {selectedFiles.length > 0 && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: theme.palette.background.paper }}>
          <Typography variant="h6" gutterBottom>
            Selected Files ({selectedFiles.length})
          </Typography>
          
          {selectedFiles.map((file, index) => (
            <Box 
              key={index} 
              sx={{ 
                mb: 1, 
                p: 1, 
                borderRadius: 1,
                bgcolor: theme.palette.action.hover
              }}
            >
              <Typography>
                <strong>Name:</strong> {file.name}
              </Typography>
              <Typography>
                <strong>Type:</strong> {file.type}
              </Typography>
              <Typography>
                <strong>Size:</strong> {Math.round(file.size / 1024)} KB
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}
```

## How It Works

1. The component maintains a state array of `MediaFile` objects
2. When the user clicks the "Select Media Files" button, it programmatically creates and triggers a hidden file input
3. On file selection, it converts each native File object to a MediaFile instance
4. The selected files are displayed in a list with their name, type, and size

This pattern works well for simple file selection needs and is compatible with all modern browsers. 
