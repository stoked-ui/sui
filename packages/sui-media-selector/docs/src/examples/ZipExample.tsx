import * as React from 'react';
import { useState } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { MediaFile } from '@stoked-ui/media-selector';
import { unzipFiles, zipFiles } from '@stoked-ui/media-selector/zip';
import { useTheme } from '@mui/material/styles';

/**
 * Example demonstrating how to use the zip functionality of the MediaSelector.
 * This example shows how to:
 * 1. Zip multiple files into a single zip file
 * 2. Unzip a zip file into multiple files
 */
export default function ZipExample() {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [zipFile, setZipFile] = useState<MediaFile | null>(null);
  const [unzippedFiles, setUnzippedFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Function to select files
  const handleFileSelection = () => {
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
      const mediaFiles = extractedFiles.map(file => {
        return new MediaFile({
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          lastModified: file.lastModified,
          file
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
              <Box>
                <Typography variant="body1">{file.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(file.size / 1024)} KB
                </Typography>
              </Box>
              
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
            <Box>
              <Typography variant="body1">{zipFile.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(zipFile.size / 1024)} KB
              </Typography>
            </Box>
            
            <Box>
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
                variant="contained"
                disabled={loading}
              >
                Unzip
              </Button>
            </Box>
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
              <Box>
                <Typography variant="body1">{file.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(file.size / 1024)} KB
                </Typography>
              </Box>
              
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
