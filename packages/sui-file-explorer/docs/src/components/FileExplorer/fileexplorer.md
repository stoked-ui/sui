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

## Advanced Usage: Comprehensive File Explorer

For more complex use cases, the `FileExplorer` component can be combined with other UI elements to create a comprehensive file management interface.

```jsx
import { ComprehensiveFileExplorer } from './index.ts';

<ComprehensiveFileExplorer />
```

The comprehensive example demonstrates:

- Displaying file metadata (size, type, last modified date)
- Handling file and folder selection
- Implementing file actions (download, edit, delete)
- Creating a details panel for selected items
- Adding new folder and upload buttons

This example can be customized to fit your specific application needs.

## Accessibility

The `FileExplorer` component can be enhanced with keyboard navigation to ensure better accessibility for all users. This example demonstrates how to implement keyboard navigation and screen reader friendly interactions.

```jsx
import { AccessibleFileExplorer } from './index.ts';

<AccessibleFileExplorer />
```

Key accessibility features implemented in this example:

- **Tab Navigation**: Users can tab through items in the file explorer
- **Keyboard Shortcuts**: 
  - Enter: Open files or toggle folders
  - Arrow Right: Expand folders
  - Arrow Left: Collapse folders
- **ARIA attributes**: The component uses appropriate `role` and `aria-label` attributes
- **Feedback notifications**: Visual and screen-reader friendly notifications of actions

### Implementing Keyboard Navigation

To enhance keyboard accessibility in your file explorer:

```jsx
// Set up keyboard event handling
const handleKeyDown = (event) => {
  if (!selectedItemId) return;
    
  const selectedItem = findItem(selectedItemId, items);
  if (!selectedItem) return;
    
  switch (event.key) {
    case 'Enter':
      // Toggle folder expansion or open file
      break;
    case 'ArrowRight':
      // Expand folder
      break;
    case 'ArrowLeft':
      // Collapse folder
      break;
  }
};

// Wrap your FileExplorer in a keyboard-accessible container
<Box 
  tabIndex={0}
  onKeyDown={handleKeyDown}
  role="tree" 
  aria-label="File explorer"
>
  <FileExplorer 
    items={items}
    onClickItem={handleItemClick}
    // other props
  />
</Box>
```

## Mobile Responsiveness

The `FileExplorer` component can be adapted for mobile use through responsive design techniques. When implementing for mobile:

1. **Adjust sizes**: Use relative sizing units or media queries to adjust item sizes on smaller screens
2. **Touch interactions**: Ensure touch targets are large enough (at least 44x44px)
3. **Simplified views**: Consider hiding less important information on small screens
4. **Swipe gestures**: Implement swipe gestures for common actions like selection or expansion

## Props API

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FileBase[]` | `[]` | Array of file and folder items to display |
| `defaultExpandedItems` | `string[]` | `[]` | Array of item IDs that should be expanded by default |
| `onClickItem` | `(id: string) => void` | - | Callback when an item is clicked |
| `onDoubleClickItem` | `(id: string) => void` | - | Callback when an item is double-clicked |
| `onExpandItem` | `(ids: string[]) => void` | - | Callback when an item is expanded or collapsed |
| `onMoveItem` | `(dragId: string, dropId: string) => void` | - | Callback when an item is moved (drag and drop) |
| `renderIcon` | `(item: FileBase) => React.ReactNode` | - | Custom renderer for item icons |
| `renderName` | `(item: FileBase) => React.ReactNode` | - | Custom renderer for item names |
| `iconSx` | `SxProps` | - | Style overrides for the icon container |
| `sx` | `SxProps` | - | Style overrides for the component |

## Item Types

The `FileExplorer` component uses the following type definitions for items:

```typescript
// Base file or folder properties
interface FileBase {
  id: string;          // Unique identifier
  name: string;        // Display name
  mediaType: MediaType; // Type of media (folder, image, document, etc.)
  type: string;        // 'file' or 'folder'
  size?: number;       // File size in bytes (optional)
  lastModified?: Date; // Last modified date (optional)
  children?: FileBase[]; // For folders, array of child items
}
```

## Styling

The `FileExplorer` component can be styled using the `sx` prop, which follows the Material-UI styling convention. Additionally, you can use the `iconSx` prop to specifically target the icon containers.

```jsx
<FileExplorer
  items={items}
  sx={{
    maxHeight: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 1,
    p: 1
  }}
  iconSx={{
    backgroundColor: 'primary.light',
    borderRadius: '50%',
    p: 0.5
  }}
/>
```

## Best Practices

1. **Performance**: For large file structures, consider lazy loading child items or implementing virtualization for better performance.

2. **Accessibility**: Ensure that the file explorer is accessible by providing clear focus states and keyboard navigation.

3. **Feedback**: Provide visual feedback for user actions such as selection, drag and drop, and item expansion.

4. **Error Handling**: Implement proper error handling for failed operations like file uploads or deletions.

5. **Responsive Design**: Ensure that the file explorer works well on different screen sizes by adjusting layouts and spacing.

## Common Use Cases

- **Document Management**: Organize and navigate through a collection of documents.
- **Media Library**: Browse and manage media files like images and videos.
- **Project Structure**: Visualize the structure of a project or codebase.
- **File Upload Interface**: Provide a familiar interface for selecting upload locations.

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
