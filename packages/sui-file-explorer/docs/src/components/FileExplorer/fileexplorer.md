# FileExplorer

<p class="description">The FileExplorer component provides a hierarchical view of files and directories with support for selection, expansion, and various interactions.</p>

## Introduction

The FileExplorer component allows users to navigate through a file system structure, select files and folders, and perform various operations on them. It's designed to be highly interactive and customizable, making it suitable for a wide range of applications.

## Basic Usage

```jsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/sui-file-explorer';

export default function BasicFileExplorer() {
  const items = [
    {
      id: 'folder-1',
      name: 'Documents',
      type: 'folder',
      children: [
        { 
          id: 'file-1', 
          name: 'Resume.pdf', 
          type: 'file' 
        },
        { 
          id: 'file-2', 
          name: 'Cover Letter.docx', 
          type: 'file' 
        }
      ]
    },
    {
      id: 'folder-2',
      name: 'Images',
      type: 'folder',
      children: [
        { 
          id: 'file-3', 
          name: 'Profile Picture.jpg', 
          type: 'file' 
        }
      ]
    }
  ];

  return (
    <FileExplorer 
      items={items}
      defaultExpandedItems={['folder-1']}
    />
  );
}
```

## Examples

### Basic File Explorer

A simple file explorer with default settings.

```jsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/sui-file-explorer';

export default function BasicFileExplorer() {
  const [items, setItems] = React.useState([
    {
      id: 'folder-1',
      name: 'Documents',
      type: 'folder',
      children: [
        { id: 'file-1', name: 'Resume.pdf', type: 'file' },
        { id: 'file-2', name: 'Cover Letter.docx', type: 'file' }
      ]
    },
    {
      id: 'folder-2',
      name: 'Images',
      type: 'folder',
      children: [
        { id: 'file-3', name: 'Profile Picture.jpg', type: 'file' }
      ]
    }
  ]);

  return (
    <FileExplorer 
      items={items}
      defaultExpandedItems={['folder-1']}
    />
  );
}
```

### File Explorer with Selection

A file explorer with the ability to select files and folders.

```jsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/sui-file-explorer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function FileExplorerWithSelection() {
  const [items, setItems] = React.useState([
    {
      id: 'folder-1',
      name: 'Documents',
      type: 'folder',
      children: [
        { id: 'file-1', name: 'Resume.pdf', type: 'file' },
        { id: 'file-2', name: 'Cover Letter.docx', type: 'file' }
      ]
    },
    {
      id: 'folder-2',
      name: 'Images',
      type: 'folder',
      children: [
        { id: 'file-3', name: 'Profile Picture.jpg', type: 'file' }
      ]
    }
  ]);

  const [selectedItem, setSelectedItem] = React.useState(null);

  const handleItemSelect = (event, item) => {
    setSelectedItem(item);
  };

  return (
    <Box>
      <FileExplorer 
        items={items}
        defaultExpandedItems={['folder-1']}
        onItemSelect={handleItemSelect}
      />
      
      {selectedItem && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6">Selected Item:</Typography>
          <Typography>ID: {selectedItem.id}</Typography>
          <Typography>Name: {selectedItem.name}</Typography>
          <Typography>Type: {selectedItem.type}</Typography>
        </Box>
      )}
    </Box>
  );
}
```

### Customized File Explorer

A file explorer with custom icons and styling.

```jsx
import * as React from 'react';
import { FileExplorer, File } from '@stoked-ui/sui-file-explorer';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// Custom file item component
const CustomFile = React.forwardRef((props, ref) => {
  const { type, name } = props;
  
  // Custom icon selection based on file type or extension
  const getIcon = () => {
    if (type === 'folder') {
      return <FolderIcon color="primary" />;
    }
    
    if (name.endsWith('.jpg') || name.endsWith('.png')) {
      return <ImageIcon color="success" />;
    }
    
    if (name.endsWith('.pdf') || name.endsWith('.docx')) {
      return <DescriptionIcon color="secondary" />;
    }
    
    return <InsertDriveFileIcon color="action" />;
  };
  
  return (
    <File
      ref={ref}
      {...props}
      slots={{
        icon: getIcon
      }}
      sx={{
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        '&.Mui-selected': {
          backgroundColor: 'primary.light',
          '&:hover': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
          }
        }
      }}
    />
  );
});

export default function CustomizedFileExplorer() {
  const items = [/* file items here */];

  return (
    <FileExplorer 
      items={items}
      slots={{
        item: CustomFile
      }}
    />
  );
}
```

## API

### Import

```jsx
import { FileExplorer } from '@stoked-ui/sui-file-explorer';
```

### Properties

| Name | Type | Default | Description |
|:-----|:-----|:--------|:------------|
| items | array | [] | Array of file/folder items to display. Each item should have an id, name, type, and optional children array. |
| defaultExpandedItems | array | [] | Array of item IDs that should be expanded by default. |
| defaultSelectedItems | array | [] | Array of item IDs that should be selected by default. |
| disableSelection | boolean | false | If true, disables the ability to select items. |
| multiSelect | boolean | false | If true, allows selecting multiple items. |
| onItemSelect | function | - | Callback fired when an item is selected. (event, item) => void |
| onItemExpand | function | - | Callback fired when an item is expanded or collapsed. (event, item, expanded) => void |
| onItemContextMenu | function | - | Callback fired when right-clicking on an item. (event, item) => void |
| onItemDrop | function | - | Callback fired when an item is dropped onto another item. (event, item, target) => void |
| onItemDragStart | function | - | Callback fired when starting to drag an item. (event, item) => void |
| slots | object | - | Overridable component slots. |
| slotProps | object | - | The props used for each component slot. |
| sx | object | - | The system prop that allows defining system overrides as well as additional CSS styles. |

### Slots

| Name | Default | Description |
|:-----|:--------|:------------|
| root | 'div' | The component used for the root node. |
| item | File | The component used for each file/folder item. |
| list | 'ul' | The component used for the list container. |
| icon | - | The component used for item icons. |

### CSS

| Rule name | Global class | Description |
|:---------|:-------------|:------------|
| root | .MuiFileExplorer-root | Styles applied to the root element. |
| list | .MuiFileExplorer-list | Styles applied to the list container. |
| item | .MuiFileExplorer-item | Styles applied to each item. |
| selected | .Mui-selected | Styles applied to the selected item. |
| expanded | .Mui-expanded | Styles applied to expanded items. | 