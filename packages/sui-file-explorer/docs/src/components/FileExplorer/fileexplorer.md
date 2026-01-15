# FileExplorer

<p class="description">The FileExplorer component provides a hierarchical view of files and directories with support for selection, expansion, and various interactions. Built on MUI X Tree View for reliability and accessibility.</p>

## Introduction

The FileExplorer component allows users to navigate through a file system structure, select files and folders, and perform various operations on them. It's designed to be highly interactive and customizable, making it suitable for a wide range of applications.

**Foundation**: FileExplorer is built on top of MUI X RichTreeView, providing a solid, well-maintained foundation with excellent accessibility support (WCAG 2.1 compliant). The component preserves the full FileExplorer API while leveraging MUI X's robust tree view implementation.

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

## MUI X Tree View Integration

FileExplorer uses MUI X RichTreeView as its core tree view implementation. This provides:

- **Built-in Expansion**: Automatic expand/collapse functionality
- **Selection Management**: Single and multi-select support
- **Keyboard Navigation**: Arrow keys, Home/End, type-ahead search
- **Accessibility**: Full WCAG 2.1 compliance with ARIA attributes
- **Focus Management**: Proper tab order and focus handling

### Adapter Layer

FileExplorer wraps MUI X RichTreeView with additional features:

```typescript
// Internal adapter pattern
const muiXExpansionProps = {
  expandedItems: instance.getExpandedItems(),
  onExpandedItemsChange: instance.setExpandedItems,
};

// Item metadata preservation
const convertToTreeViewItems = (items: FileBase[]) => {
  return items.map(item => ({
    id: item.id,
    label: item.name,
    children: item.children ? convertToTreeViewItems(item.children) : undefined,
    _fileData: { ...item }, // Preserve all metadata
  }));
};
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

### File Explorer with Grid View

A file explorer displaying items in a grid layout with custom columns.

```jsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/sui-file-explorer';

export default function FileExplorerWithGrid() {
  const items = [
    {
      id: 'folder-1',
      name: 'Documents',
      type: 'folder',
      size: 1024,
      mediaType: 'folder',
      children: [
        {
          id: 'file-1',
          name: 'Resume.pdf',
          type: 'file',
          size: 256000,
          mediaType: 'application/pdf'
        },
      ]
    }
  ];

  return (
    <FileExplorer
      items={items}
      grid={true}
      gridHeader={true}
      gridColumns={{
        type: (item) => item.mediaType || item.type,
        size: (item) => (item.size ? (item.size / 1024).toFixed(2) + ' KB' : '-'),
      }}
    />
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
| expandedItems | array | - | Controlled expansion state. Array of item IDs that are expanded. |
| onExpandedItemsChange | function | - | Callback fired when expanded items change. (event, ids) => void |
| defaultSelectedItems | string/array | - | Default selected item(s). Single string or array of strings. |
| selectedItems | string/array | - | Controlled selection state. Single string or array of strings. |
| onSelectedItemsChange | function | - | Callback fired when selected items change. (event, value) => void |
| multiSelect | boolean | false | If true, allows selecting multiple items. |
| disableSelection | boolean | false | If true, disables the ability to select items. |
| checkboxSelection | boolean | false | If true, displays checkboxes for selection. |
| onItemFocus | function | - | Callback fired when an item receives focus. (event, id) => void |
| onItemDoubleClick | function | - | Callback fired when an item is double-clicked. (item) => void |
| grid | boolean | false | If true, renders items in a grid layout with columns. |
| gridHeader | boolean | false | If true, displays column headers in grid view. |
| gridColumns | object | - | Column definitions for grid view. Object mapping column IDs to render functions. |
| onAddFiles | function | - | Callback fired when files are added (via drag-drop). (files) => void |
| dropzone | boolean | false | If true, displays a dropzone when no items are present. |
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
| item | .MuiFileExplorer-item | Styles applied to each item. |
| selected | .Mui-selected | Styles applied to the selected item. |
| expanded | .Mui-expanded | Styles applied to expanded items. |
| focused | .Mui-focused | Styles applied to the focused item. |
| disabled | .Mui-disabled | Styles applied to disabled items. |

## Migration Guide

### From Previous Versions

If you're upgrading from an older version of FileExplorer, the API remains fully backward compatible. Here are the key changes:

#### 1. MUI X Foundation (Internal)

The component now uses MUI X RichTreeView internally. This improves:
- Stability and maintenance
- Accessibility (WCAG 2.1)
- Performance and feature set
- Integration with MUI ecosystem

**Your code doesn't need to change** - the FileExplorer API is preserved.

#### 2. Grid View

Grid view works the same way but with improved column rendering:

```jsx
// Before and After (works the same)
<FileExplorer
  grid={true}
  gridColumns={{
    type: item => item.mediaType,
    size: item => item.size,
  }}
/>
```

#### 3. Selection Handling

Controlled selection works as before:

```jsx
// Before and After (unchanged)
const [selected, setSelected] = React.useState(null);

<FileExplorer
  multiSelect={false}
  selectedItems={selected}
  onSelectedItemsChange={(event, id) => setSelected(id)}
/>
```

### Troubleshooting

#### Items not expanding

Ensure items have a `children` property (even if empty):

```jsx
// ✅ Correct
const items = [
  {
    id: 'folder',
    name: 'My Folder',
    type: 'folder',
    children: [ /* items or empty array */ ]
  }
];

// ❌ Won't expand
const items = [
  {
    id: 'folder',
    name: 'My Folder',
    type: 'folder'
    // Missing children property
  }
];
```

#### Selection not working

Check that `disableSelection` is not set to `true`:

```jsx
// ✅ Selection enabled
<FileExplorer items={items} />

// ❌ Selection disabled
<FileExplorer items={items} disableSelection={true} />
```

#### Grid columns not showing

Ensure both `grid` and `gridHeader` are enabled:

```jsx
// ✅ Grid with headers
<FileExplorer
  items={items}
  grid={true}
  gridHeader={true}
  gridColumns={{ type: item => item.mediaType }}
/>

// ❌ Grid without headers
<FileExplorer
  items={items}
  grid={true}
  gridColumns={{ type: item => item.mediaType }}
/>
```

#### Keyboard navigation not working

Check that the component has focus and no parent element is preventing keyboard events:

```jsx
// ✅ Keyboard navigation works
<FileExplorer items={items} autoFocus />

// ❌ May not work if parent prevents key events
<div onKeyDown={e => e.preventDefault()}>
  <FileExplorer items={items} />
</div>
```

## Performance Tips

For large file lists (1000+ items), consider:

1. **Lazy Loading**: Load items on-demand as users expand folders
2. **Virtualization**: Use with react-window for very large lists
3. **Controlled Expansion**: Only expand folders user explicitly expands
4. **Memoization**: Wrap item render functions to prevent recalculation

```jsx
const gridColumns = React.useMemo(() => ({
  type: (item) => item.mediaType || item.type,
  size: (item) => (item.size ? Math.round(item.size / 1024) + ' KB' : '-'),
}), []);

<FileExplorer items={items} gridColumns={gridColumns} />
``` 