import * as React from 'react';
import { FileExplorer, FileBase, MediaTypeEnum } from '@stoked-ui/file-explorer';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/CreateNewFolder';
import UploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Comprehensive File Explorer example demonstrating advanced functionality:
 * - Selection handling
 * - Item expansion
 * - Details panel for selected items
 * - Action buttons for file operations
 */
export default function ComprehensiveFileExplorer() {
  // Define the initial file structure
  const initialItems: FileBase[] = [
    {
      id: 'documents',
      name: 'Documents',
      type: 'folder',
      mediaType: MediaTypeEnum.FOLDER,
      size: 0,
      lastModified: new Date('2023-05-15').getTime(),
      children: [
        { 
          id: 'resume', 
          name: 'Resume.pdf', 
          type: 'file',
          mediaType: MediaTypeEnum.PDF,
          size: 1205000,
          lastModified: new Date('2023-06-10').getTime(),
        },
        { 
          id: 'cover-letter', 
          name: 'Cover Letter.docx', 
          type: 'file',
          mediaType: MediaTypeEnum.DOCUMENT,
          size: 350000,
          lastModified: new Date('2023-06-12').getTime(),
        },
        {
          id: 'project-docs',
          name: 'Project Documentation',
          type: 'folder',
          mediaType: MediaTypeEnum.FOLDER,
          size: 0,
          lastModified: new Date('2023-04-20').getTime(),
          children: [
            { 
              id: 'specs', 
              name: 'Specifications.docx', 
              type: 'file',
              mediaType: MediaTypeEnum.DOCUMENT,
              size: 2500000,
              lastModified: new Date('2023-04-18').getTime(),
            }
          ]
        }
      ]
    },
    {
      id: 'images',
      name: 'Images',
      type: 'folder',
      mediaType: MediaTypeEnum.FOLDER,
      size: 0,
      lastModified: new Date('2023-05-01').getTime(),
      children: [
        { 
          id: 'profile-pic', 
          name: 'Profile Picture.jpg', 
          type: 'file',
          mediaType: MediaTypeEnum.IMAGE,
          size: 3500000,
          lastModified: new Date('2023-05-01').getTime(),
        },
        { 
          id: 'screenshot', 
          name: 'Application Screenshot.png', 
          type: 'file',
          mediaType: MediaTypeEnum.IMAGE,
          size: 4200000,
          lastModified: new Date('2023-05-10').getTime(),
        }
      ]
    },
    {
      id: 'videos',
      name: 'Videos',
      type: 'folder',
      mediaType: MediaTypeEnum.FOLDER,
      size: 0,
      lastModified: new Date('2023-03-15').getTime(),
      children: [
        { 
          id: 'tutorial', 
          name: 'Product Tutorial.mp4', 
          type: 'file',
          mediaType: MediaTypeEnum.VIDEO,
          size: 25000000,
          lastModified: new Date('2023-03-15').getTime(),
        }
      ]
    }
  ];

  // State management
  const [items, setItems] = React.useState<FileBase[]>(initialItems);
  const [selectedItem, setSelectedItem] = React.useState<FileBase | null>(null);
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['documents']);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Format date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle item click
  const handleItemClick = (id: string): void => {
    // Find the clicked item in the data structure
    const findItem = (searchItems: FileBase[], itemId: string): FileBase | null => {
      for (const item of searchItems) {
        if (item.id === itemId) {
          return item;
        }
        if (item.children) {
          const found = findItem(item.children, itemId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };
    
    setSelectedItem(findItem(items, id));
  };

  // Handle item expansion
  const handleExpandItem = (ids: string[]): void => {
    setExpandedItems(ids);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1200 }}>
      <Typography variant="h5" gutterBottom>
        File Explorer
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Browse, select, and perform actions on files and folders.
      </Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              sx={{ mr: 1 }}
            >
              New Folder
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              size="small"
            >
              Upload
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {/* File Explorer */}
        <Grid item sx={{ width: { xs: '100%', md: '50%' } }}>
          <FileExplorer 
            items={items}
            defaultExpandedItems={expandedItems}
            onExpandItem={handleExpandItem}
            onClickItem={handleItemClick}
          />
        </Grid>
        
        {/* Details Panel */}
        <Grid item sx={{ width: { xs: '100%', md: '50%' } }}>
          <Card variant="outlined">
            <CardContent>
              {selectedItem ? (
                <React.Fragment>
                  <Typography variant="h6" gutterBottom>
                    {selectedItem.name}
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Type" 
                        secondary={selectedItem.type === 'folder' ? 'Folder' : selectedItem.mediaType}
                      />
                    </ListItem>
                    
                    {selectedItem.type === 'file' && selectedItem.size !== undefined && (
                      <ListItem>
                        <ListItemText 
                          primary="Size" 
                          secondary={formatFileSize(selectedItem.size)}
                        />
                      </ListItem>
                    )}
                    
                    {selectedItem.lastModified && (
                      <ListItem>
                        <ListItemText 
                          primary="Last Modified" 
                          secondary={formatDate(selectedItem.lastModified)}
                        />
                      </ListItem>
                    )}
                  </List>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
                    {selectedItem.type === 'file' && (
                      <IconButton aria-label="download" size="small" sx={{ mr: 1 }}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton aria-label="edit" size="small" sx={{ mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton aria-label="delete" size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </React.Fragment>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 8 }}>
                  Select a file or folder to view details
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
} 
