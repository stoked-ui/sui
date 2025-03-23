import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { App, MediaFile, WebFile } from '@stoked-ui/media-selector';
import { useTheme } from '@mui/material/styles';

/**
 * A basic example of using the MediaSelector component.
 * This example demonstrates how to:
 * 1. Setup basic media selection
 * 2. Handle selected files
 * 3. Display information about selected media
 */
export default function BasicExample() {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  
  // Handler for file selection
  const handleFilesSelected = (files: MediaFile[]) => {
    setSelectedFiles(files);
    console.log('Files selected:', files);
  };
  
  // Function to trigger file selection
  const openFileSelector = async () => {
    try {
      // This is a placeholder - actual implementation would depend on your App implementation
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.accept = 'image/*,video/*,audio/*';
      
      fileInput.onchange = async (e) => {
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
              // You would use your actual WebFile implementation here
              file: file
            });
            mediaFiles.push(mediaFile);
          }
          
          handleFilesSelected(mediaFiles);
        }
      };
      
      fileInput.click();
    } catch (error) {
      console.error('Error selecting files:', error);
    }
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
