import * as React from 'react';
import { FileExplorer, FileBase, MediaTypeEnum } from '@stoked-ui/file-explorer';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 * Basic File Explorer example demonstrating the core functionality.
 */
export default function BasicFileExplorer() {
  // Sample file structure
  const items: FileBase[] = [
    {
      id: 'documents',
      name: 'Documents',
      type: 'folder',
      mediaType: MediaTypeEnum.FOLDER,
      children: [
        { 
          id: 'resume', 
          name: 'Resume.pdf', 
          type: 'file',
          mediaType: MediaTypeEnum.PDF,
        },
        { 
          id: 'cover-letter', 
          name: 'Cover Letter.docx', 
          type: 'file',
          mediaType: MediaTypeEnum.DOCUMENT,
        }
      ]
    },
    {
      id: 'images',
      name: 'Images',
      type: 'folder',
      mediaType: MediaTypeEnum.FOLDER,
      children: [
        { 
          id: 'profile-pic', 
          name: 'Profile Picture.jpg', 
          type: 'file',
          mediaType: MediaTypeEnum.IMAGE,
        }
      ]
    }
  ];

  return (
    <Paper sx={{ p: 2, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        Simple File Explorer
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <FileExplorer 
          items={items}
          defaultExpandedItems={['documents']}
        />
      </Box>
    </Paper>
  );
} 
