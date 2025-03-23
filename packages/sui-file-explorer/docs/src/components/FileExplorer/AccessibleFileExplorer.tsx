import * as React from 'react';
import { FileExplorer, FileBase, MediaTypeEnum } from '@stoked-ui/file-explorer';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

/**
 * Accessible File Explorer example demonstrating keyboard navigation support
 * and screen reader friendly interactions.
 */
export default function AccessibleFileExplorer() {
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

  // State for tracking focused and selected items
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['documents']);
  const [message, setMessage] = React.useState<string | null>(null);
  
  // Find an item by ID in the hierarchy
  const findItem = (itemId: string, itemList: FileBase[]): FileBase | null => {
    for (const item of itemList) {
      if (item.id === itemId) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = findItem(itemId, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle keyboard interactions
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!selectedItemId) return;
    
    const selectedItem = findItem(selectedItemId, items);
    if (!selectedItem) return;
    
    switch (event.key) {
      case 'Enter':
        // For folders: toggle expansion
        if (selectedItem.type === 'folder') {
          if (expandedItems.includes(selectedItemId)) {
            setExpandedItems(expandedItems.filter(id => id !== selectedItemId));
            setMessage(`Folder ${selectedItem.name} collapsed`);
          } else {
            setExpandedItems([...expandedItems, selectedItemId]);
            setMessage(`Folder ${selectedItem.name} expanded`);
          }
        } 
        // For files: simulate opening
        else {
          setMessage(`Opening file: ${selectedItem.name}`);
        }
        break;
        
      case 'ArrowRight':
        // Expand folder if collapsed
        if (selectedItem.type === 'folder' && !expandedItems.includes(selectedItemId)) {
          setExpandedItems([...expandedItems, selectedItemId]);
          setMessage(`Folder ${selectedItem.name} expanded`);
        }
        break;
        
      case 'ArrowLeft':
        // Collapse folder if expanded
        if (selectedItem.type === 'folder' && expandedItems.includes(selectedItemId)) {
          setExpandedItems(expandedItems.filter(id => id !== selectedItemId));
          setMessage(`Folder ${selectedItem.name} collapsed`);
        }
        break;
        
      default:
        break;
    }
  };

  // Handle item selection
  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
    const item = findItem(id, items);
    setMessage(`Selected ${item?.type}: ${item?.name}`);
  };

  // Handle item expansion/collapse
  const handleExpandItem = (ids: string[]) => {
    setExpandedItems(ids);
  };

  return (
    <Paper sx={{ p: 2, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        Accessible File Explorer
      </Typography>
      
      <Typography variant="body2" paragraph>
        Use keyboard navigation to interact with the file explorer:
      </Typography>
      
      <Box component="ul" sx={{ pl: 2, mb: 2 }}>
        <li>Use <strong>Tab</strong> to focus on items</li>
        <li>Use <strong>Enter</strong> to open files or toggle folders</li>
        <li>Use <strong>Arrow Right</strong> to expand folders</li>
        <li>Use <strong>Arrow Left</strong> to collapse folders</li>
      </Box>
      
      <Box 
        sx={{ mt: 2 }} 
        tabIndex={0} 
        onKeyDown={handleKeyDown} 
        role="tree"
        aria-label="File explorer with keyboard navigation"
      >
        <FileExplorer 
          items={items}
          defaultExpandedItems={expandedItems}
          onExpandItem={handleExpandItem}
          onClickItem={handleItemClick}
        />
      </Box>
      
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setMessage(null)} 
          severity="info" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {message}
        </Alert>
      </Snackbar>
    </Paper>
  );
} 
