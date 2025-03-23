# Zip File Creation and Extraction

This example demonstrates how to use the zip utilities provided by the media-selector package to create zip archives from multiple files and extract files from existing archives.

## Features Demonstrated

- Selecting multiple files from the user's device
- Creating a zip archive from the selected files
- Downloading the created zip file
- Extracting files from a zip archive
- Displaying and managing both original files and extracted files

## Code Example

```tsx
import * as React from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { MediaFile } from '@stoked-ui/media-selector';
import { zipFiles, unzipFiles } from '@stoked-ui/media-selector/zip';
import { useTheme } from '@mui/material/styles';

export default function ZipExample() {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = React.useState<MediaFile[]>([]);
  const [zipFile, setZipFile] = React.useState<MediaFile | null>(null);
  const [unzippedFiles, setUnzippedFiles] = React.useState<MediaFile[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  // Function to select files
  const handleFileSelection = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*,video/*,audio/*';
    
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const mediaFiles = Array.from(target.files).map(file => {
          return new MediaFile({
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            file
          });
        });
        
        setSelectedFiles(mediaFiles);
      }
    };
    
    fileInput.click();
  };
  
  // Function to create a zip file from selected files
  const createZipFile = async () => {
    if (selectedFiles.length === 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Extract native File objects from MediaFiles
      const files = selectedFiles.map(mediaFile => mediaFile.file);
      
      // Create zip file
      const zipBlob = await zipFiles(files);
      
      // Create a MediaFile from the zip blob
      const zipMediaFile = new MediaFile({
        name: 'archive.zip',
        type: 'application/zip',
        size: zipBlob.size,
        lastModified: Date.now(),
        file: new File([zipBlob], 'archive.zip', { type: 'application/zip' })
      });
      
      setZipFile(zipMediaFile);
    } catch (error) {
      console.error('Error creating zip file:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to unzip a file
  const handleUnzipFile = async () => {
    if (!zipFile) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Get the native File object
      const file = zipFile.file;
      
      // Unzip the file
      const extractedFiles = await unzipFiles(file);
      
      // Convert to MediaFile objects
      const mediaFiles = extractedFiles.map(extractedFile => {
        return new MediaFile({
          name: extractedFile.name,
          type: extractedFile.type || 'application/octet-stream',
          size: extractedFile.size,
          lastModified: extractedFile.lastModified,
          file: extractedFile
        });
      });
      
      setUnzippedFiles(mediaFiles);
    } catch (error) {
      console.error('Error unzipping file:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to download a file
  const downloadFile = (file: MediaFile) => {
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Zip Functionality Example
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="contained" 
          onClick={handleFileSelection}
          sx={{ mr: 2 }}
        >
          Select Files
        </Button>
        
        <Button 
          variant="contained" 
          onClick={createZipFile}
          disabled={selectedFiles.length === 0 || loading}
          color="primary"
        >
          Create Zip
        </Button>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {selectedFiles.length > 0 && (
        <Paper sx={{ p: 2, mb: 4, bgcolor: theme.palette.background.paper }}>
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
                bgcolor: theme.palette.action.hover,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <Typography variant="body1">{file.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(file.size / 1024)} KB
                </Typography>
              </div>
              
              <Button 
                size="small" 
                onClick={() => downloadFile(file)}
              >
                Download
              </Button>
            </Box>
          ))}
        </Paper>
      )}
      
      {zipFile && (
        <Paper sx={{ p: 2, mb: 4, bgcolor: theme.palette.background.paper }}>
          <Typography variant="h6" gutterBottom>
            Zip File
          </Typography>
          
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: 1,
              bgcolor: theme.palette.action.hover,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <Typography variant="body1">{zipFile.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(zipFile.size / 1024)} KB
              </Typography>
            </div>
            
            <div>
              <Button 
                size="small" 
                onClick={() => downloadFile(zipFile)}
                sx={{ mr: 1 }}
              >
                Download
              </Button>
              
              <Button 
                size="small" 
                onClick={handleUnzipFile}
                variant="outlined"
                disabled={loading}
              >
                Unzip
              </Button>
            </div>
          </Box>
        </Paper>
      )}
      
      {unzippedFiles.length > 0 && (
        <Paper sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
          <Typography variant="h6" gutterBottom>
            Unzipped Files ({unzippedFiles.length})
          </Typography>
          
          {unzippedFiles.map((file, index) => (
            <Box 
              key={index} 
              sx={{ 
                mb: 1, 
                p: 1, 
                borderRadius: 1,
                bgcolor: theme.palette.action.hover,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <Typography variant="body1">{file.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(file.size / 1024)} KB
                </Typography>
              </div>
              
              <Button 
                size="small" 
                onClick={() => downloadFile(file)}
              >
                Download
              </Button>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}
```

## How It Works

1. **File Selection:**
   - User selects files via a standard file input
   - Selected files are converted to `MediaFile` objects

2. **Zip Creation:**
   - When "Create Zip" is clicked, the `zipFiles` utility creates a zip archive from selected files
   - The resulting Blob is wrapped in a `MediaFile` object for easy handling

3. **Unzipping:**
   - When "Unzip" is clicked, the `unzipFiles` utility extracts all files from the zip archive
   - Extracted files are converted to `MediaFile` objects

4. **File Download:**
   - Any file (original, zip, or extracted) can be downloaded using a temporary object URL

This example demonstrates the full lifecycle of working with zip files - from selection to compression, extraction, and download. 
