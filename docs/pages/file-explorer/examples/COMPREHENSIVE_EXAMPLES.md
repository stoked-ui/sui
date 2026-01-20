# FileExplorer Examples and Tutorials

Comprehensive examples demonstrating all drag-and-drop features of the MUI X-powered FileExplorer component.

## Table of Contents

1. [Basic Internal Drag-and-Drop](#basic-internal-drag-and-drop)
2. [External File Import](#external-file-import)
3. [External File Export](#external-file-export)
4. [File Type Filtering](#file-type-filtering)
5. [Trash Management](#trash-management)
6. [Combined Features](#combined-features)
7. [Feature Flag Integration](#feature-flag-integration)
8. [Custom Drag Overlay](#custom-drag-overlay)
9. [Performance Optimization](#performance-optimization)
10. [Accessibility Enhancements](#accessibility-enhancements)

---

## Basic Internal Drag-and-Drop

Enable reordering of files and folders within FileExplorer.

### Simple Example

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function BasicInternalDnD() {
  const [items, setItems] = React.useState([
    {
      id: 'folder-1',
      name: 'Documents',
      type: 'folder',
      children: [
        { id: 'file-1', name: 'Resume.pdf', type: 'file' },
        { id: 'file-2', name: 'Cover Letter.docx', type: 'file' },
      ],
    },
    {
      id: 'folder-2',
      name: 'Images',
      type: 'folder',
      children: [
        { id: 'file-3', name: 'Photo.jpg', type: 'file' },
      ],
    },
  ]);

  const [lastAction, setLastAction] = React.useState('');

  const handleItemsReorder = (event, movedItem, newParent, newPosition) => {
    setLastAction(
      `Moved "${movedItem.name}" to "${newParent?.name || 'root'}" at position ${newPosition}`
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        Internal Drag-and-Drop
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Drag files and folders to reorder them
      </Typography>

      <FileExplorer
        items={items}
        dndInternal={true}
        defaultExpandedItems={['folder-1', 'folder-2']}
        onItemsReorder={handleItemsReorder}
        sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider' }}
      />

      {lastAction && (
        <Typography variant="body2" sx={{ mt: 2, color: 'success.main' }}>
          {lastAction}
        </Typography>
      )}
    </Box>
  );
}
```

### With State Management

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function InternalDnDWithState() {
  const [items, setItems] = React.useState([
    /* ... items ... */
  ]);

  const handleItemsReorder = React.useCallback((event, movedItem, newParent, newPosition) => {
    // Update state
    setItems(prevItems => {
      // Clone items
      const newItems = JSON.parse(JSON.stringify(prevItems));

      // Find and remove moved item
      const removeItem = (items, itemId) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === itemId) {
            return items.splice(i, 1)[0];
          }
          if (items[i].children) {
            const removed = removeItem(items[i].children, itemId);
            if (removed) return removed;
          }
        }
        return null;
      };

      const removed = removeItem(newItems, movedItem.id);

      // Insert at new location
      if (newParent) {
        const findParent = (items, parentId) => {
          for (const item of items) {
            if (item.id === parentId) return item;
            if (item.children) {
              const found = findParent(item.children, parentId);
              if (found) return found;
            }
          }
          return null;
        };

        const parent = findParent(newItems, newParent.id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.splice(newPosition, 0, removed);
        }
      } else {
        // Insert at root
        newItems.splice(newPosition, 0, removed);
      }

      return newItems;
    });

    // Persist to backend
    api.moveFile(movedItem.id, newParent?.id, newPosition);
  }, []);

  const handleUndo = () => {
    // Implement undo logic
  };

  return (
    <Stack spacing={2}>
      <FileExplorer
        items={items}
        dndInternal={true}
        onItemsReorder={handleItemsReorder}
      />
      <Button onClick={handleUndo}>Undo Last Move</Button>
    </Stack>
  );
}
```

---

## External File Import

Import files from the operating system into FileExplorer.

### Basic Import

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

export default function ExternalFileImport() {
  const [items, setItems] = React.useState([
    {
      id: 'folder-1',
      name: 'Upload Here',
      type: 'folder',
      children: [],
    },
  ]);

  const [importStatus, setImportStatus] = React.useState('');

  const handleExternalFilesImport = (files, targetFolder, validation) => {
    setImportStatus(
      `Imported ${validation.validFiles.length} files to ${targetFolder.name}. ` +
      `Rejected: ${validation.invalidFiles.length}`
    );

    // Files are automatically added to the tree
    // You can also upload to server here
    validation.validFiles.forEach(file => {
      uploadToServer(file, targetFolder.id);
    });
  };

  const uploadToServer = async (file, folderId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      console.log(`Uploaded: ${file.name}`);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Drag files from your computer onto the folder below
      </Alert>

      <FileExplorer
        items={items}
        dndExternal={true}
        defaultExpandedItems={['folder-1']}
        onExternalFilesImport={handleExternalFilesImport}
      />

      {importStatus && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {importStatus}
        </Alert>
      )}
    </Box>
  );
}
```

### With Progress Tracking

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function ImportWithProgress() {
  const [items, setItems] = React.useState([/* ... */]);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentFile, setCurrentFile] = React.useState('');

  const handleExternalFilesImport = async (files, targetFolder, validation) => {
    setUploading(true);
    const validFiles = validation.validFiles;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setCurrentFile(file.name);
      setProgress(((i + 1) / validFiles.length) * 100);

      await uploadFile(file, targetFolder.id);
    }

    setUploading(false);
    setProgress(0);
    setCurrentFile('');
  };

  const uploadFile = async (file, folderId) => {
    // Simulated upload with progress
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Uploaded: ${file.name}`);
        resolve();
      }, 1000);
    });
  };

  return (
    <Box>
      <FileExplorer
        items={items}
        dndExternal={true}
        onExternalFilesImport={handleExternalFilesImport}
      />

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Uploading: {currentFile}
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}
    </Box>
  );
}
```

---

## External File Export

Export files from FileExplorer to the operating system.

### Basic Export

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import Alert from '@mui/material/Alert';

export default function ExternalFileExport() {
  const items = [
    {
      id: 'file-1',
      name: 'Document.pdf',
      type: 'file',
      content: new Blob(['PDF content'], { type: 'application/pdf' }),
      mediaType: 'application/pdf',
    },
    {
      id: 'file-2',
      name: 'Image.png',
      type: 'file',
      content: new Blob([/* image data */], { type: 'image/png' }),
      mediaType: 'image/png',
    },
    {
      id: 'file-3',
      name: 'Data.json',
      type: 'file',
      content: JSON.stringify({ key: 'value' }),
      mediaType: 'application/json',
    },
  ];

  return (
    <div>
      <Alert severity="info" sx={{ mb: 2 }}>
        Drag files from the list below to your desktop or file manager
      </Alert>

      <FileExplorer
        items={items}
        dndExternal={true}
      />
    </div>
  );
}
```

### With Custom Content Generation

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';

export default function ExportWithGeneration() {
  const generatePDF = (data) => {
    // Generate PDF content dynamically
    const pdfContent = `PDF: ${JSON.stringify(data)}`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  };

  const generateCSV = (data) => {
    // Generate CSV content
    const csv = Object.entries(data).map(([k, v]) => `${k},${v}`).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  };

  const items = [
    {
      id: 'report-1',
      name: 'Sales Report.pdf',
      type: 'file',
      content: generatePDF({ sales: 1000, profit: 200 }),
      mediaType: 'application/pdf',
    },
    {
      id: 'data-1',
      name: 'Export Data.csv',
      type: 'file',
      content: generateCSV({ name: 'John', age: 30, city: 'NYC' }),
      mediaType: 'text/csv',
    },
  ];

  return (
    <FileExplorer
      items={items}
      dndExternal={true}
    />
  );
}
```

---

## File Type Filtering

Restrict allowed file types for security and compliance.

### Basic Filtering

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

export default function FileTypeFiltering() {
  const [items, setItems] = React.useState([
    {
      id: 'uploads',
      name: 'Uploads',
      type: 'folder',
      children: [],
    },
  ]);

  const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
  const [rejectedFiles, setRejectedFiles] = React.useState([]);

  const handleValidationError = (invalidFiles, allowedTypes, errors) => {
    setRejectedFiles(invalidFiles.map(f => f.name));

    // Show user-friendly error
    setTimeout(() => setRejectedFiles([]), 5000);
  };

  return (
    <div>
      <Alert severity="info" sx={{ mb: 2 }}>
        Allowed file types:
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {allowedTypes.map(type => (
            <Chip key={type} label={type} size="small" />
          ))}
        </Stack>
      </Alert>

      <FileExplorer
        items={items}
        dndExternal={true}
        dndFileTypes={allowedTypes}
        defaultExpandedItems={['uploads']}
        onFileTypeValidationError={handleValidationError}
      />

      {rejectedFiles.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Rejected files: {rejectedFiles.join(', ')}
        </Alert>
      )}
    </div>
  );
}
```

### Advanced Filtering with Categories

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Box from '@mui/material/Box';

export default function AdvancedFileTypeFiltering() {
  const [items, setItems] = React.useState([/* ... */]);

  const fileTypeCategories = {
    documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    images: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
    spreadsheets: ['.xls', '.xlsx', '.csv'],
    archives: ['.zip', '.tar', '.gz', '.rar'],
    all: [],
  };

  const [selectedCategory, setSelectedCategory] = React.useState('documents');

  const allowedTypes = selectedCategory === 'all'
    ? []
    : fileTypeCategories[selectedCategory];

  return (
    <Box>
      <ToggleButtonGroup
        value={selectedCategory}
        exclusive
        onChange={(e, value) => value && setSelectedCategory(value)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="documents">Documents</ToggleButton>
        <ToggleButton value="images">Images</ToggleButton>
        <ToggleButton value="spreadsheets">Spreadsheets</ToggleButton>
        <ToggleButton value="archives">Archives</ToggleButton>
        <ToggleButton value="all">All Types</ToggleButton>
      </ToggleButtonGroup>

      <FileExplorer
        items={items}
        dndExternal={true}
        dndFileTypes={allowedTypes.length > 0 ? allowedTypes : undefined}
      />
    </Box>
  );
}
```

---

## Trash Management

Implement delete functionality with undo capability.

### Basic Trash

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

export default function TrashManagement() {
  const [items, setItems] = React.useState([
    {
      id: 'folder-1',
      name: 'Documents',
      type: 'folder',
      children: [
        { id: 'file-1', name: 'Important.pdf', type: 'file' },
        { id: 'file-2', name: 'Old File.txt', type: 'file' },
      ],
    },
  ]);

  const [trashedItems, setTrashedItems] = React.useState([]);

  const handleItemsChange = (newItems) => {
    setItems(newItems);

    // Track trashed items
    const findTrashedItems = (items) => {
      const trashed = [];
      items.forEach(item => {
        if (item.isTrash) trashed.push(item);
        if (item.children) trashed.push(...findTrashedItems(item.children));
      });
      return trashed;
    };

    setTrashedItems(findTrashedItems(newItems));
  };

  const handleEmptyTrash = () => {
    setItems(prevItems => {
      const removeTrash = (items) => {
        return items.filter(item => {
          if (item.isTrash) return false;
          if (item.children) {
            item.children = removeTrash(item.children);
          }
          return true;
        });
      };

      return removeTrash(JSON.parse(JSON.stringify(prevItems)));
    });

    setTrashedItems([]);
  };

  return (
    <Stack spacing={2}>
      {trashedItems.length > 0 && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={handleEmptyTrash}>
              Empty Trash
            </Button>
          }
        >
          {trashedItems.length} item(s) in trash
        </Alert>
      )}

      <FileExplorer
        items={items}
        dndTrash={true}
        defaultExpandedItems={['folder-1']}
        onItemsChange={handleItemsChange}
      />
    </Stack>
  );
}
```

### With Undo Functionality

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';

export default function TrashWithUndo() {
  const [items, setItems] = React.useState([/* ... */]);
  const [history, setHistory] = React.useState([]);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const handleItemsChange = (newItems) => {
    // Save to history before updating
    setHistory(prev => [...prev, items]);
    setItems(newItems);
    setSnackbarOpen(true);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      setItems(history[history.length - 1]);
      setHistory(prev => prev.slice(0, -1));
      setSnackbarOpen(false);
    }
  };

  return (
    <div>
      <FileExplorer
        items={items}
        dndTrash={true}
        onItemsChange={handleItemsChange}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message="Item moved to trash"
        action={
          <Button color="secondary" size="small" onClick={handleUndo}>
            UNDO
          </Button>
        }
      />
    </div>
  );
}
```

---

## Combined Features

Demonstrate all drag-and-drop features together.

### Full-Featured Example

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

export default function FullFeaturedFileExplorer() {
  const [items, setItems] = React.useState([
    {
      id: 'folder-1',
      name: 'My Documents',
      type: 'folder',
      children: [
        { id: 'file-1', name: 'Resume.pdf', type: 'file' },
        { id: 'file-2', name: 'Photo.jpg', type: 'file' },
      ],
    },
    {
      id: 'folder-2',
      name: 'Projects',
      type: 'folder',
      children: [],
    },
  ]);

  const [dndState, setDndState] = React.useState(null);
  const [lastAction, setLastAction] = React.useState('');
  const [rejectedFiles, setRejectedFiles] = React.useState([]);

  const allowedFileTypes = [
    '.pdf', '.doc', '.docx', '.txt',
    '.png', '.jpg', '.jpeg', '.gif',
    '.xls', '.xlsx', '.csv',
  ];

  const handleItemsReorder = (event, movedItem, newParent, newPosition) => {
    setLastAction(`Moved "${movedItem.name}" to "${newParent?.name || 'root'}"`);
  };

  const handleExternalImport = (files, targetFolder, validation) => {
    setLastAction(
      `Imported ${validation.validFiles.length} files to ${targetFolder.name}`
    );
  };

  const handleValidationError = (invalidFiles) => {
    setRejectedFiles(invalidFiles.map(f => f.name));
    setTimeout(() => setRejectedFiles([]), 5000);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        FileExplorer - All Features
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          Try these features:
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Drag files/folders to reorder them</li>
          <li>Drag files from your computer to import</li>
          <li>Drag files to desktop to export</li>
          <li>Move items to trash</li>
        </ul>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Allowed file types:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
          {allowedFileTypes.map(type => (
            <Chip key={type} label={type} size="small" />
          ))}
        </Stack>
      </Alert>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <FileExplorer
          items={items}
          dndInternal={true}
          dndExternal={true}
          dndTrash={true}
          dndFileTypes={allowedFileTypes}
          defaultExpandedItems={['folder-1', 'folder-2']}
          onItemsReorder={handleItemsReorder}
          onExternalFilesImport={handleExternalImport}
          onFileTypeValidationError={handleValidationError}
          onDndStateChange={setDndState}
        />
      </Paper>

      {dndState?.isDragging && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Dragging: {dndState.draggedItem?.name}
          {dndState.dropTarget && ` → ${dndState.dropTarget.name}`}
          {' '}({dndState.isValidDrop ? 'valid' : 'invalid'})
        </Alert>
      )}

      {lastAction && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {lastAction}
        </Alert>
      )}

      {rejectedFiles.length > 0 && (
        <Alert severity="error">
          Rejected files: {rejectedFiles.join(', ')}
        </Alert>
      )}
    </Box>
  );
}
```

---

## Feature Flag Integration

Implement gradual rollout with feature flags.

### Basic Feature Flag

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import { shouldShowFeature } from './feature-flag-config';

export default function FeatureFlaggedFileExplorer() {
  const userId = useCurrentUserId();
  const useMuiXFileExplorer = shouldShowFeature(userId);

  const [items, setItems] = React.useState([/* ... */]);

  if (useMuiXFileExplorer) {
    return (
      <FileExplorer
        items={items}
        dndInternal={true}
        dndExternal={true}
      />
    );
  }

  // Fallback to legacy implementation
  return <LegacyFileExplorer items={items} />;
}
```

### With A/B Testing

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import { useFeatureFlag } from './hooks/useFeatureFlag';
import { trackEvent } from './analytics';

export default function ABTestFileExplorer() {
  const variant = useFeatureFlag('file-explorer-mui-x', {
    variants: ['control', 'treatment'],
    weights: [50, 50], // 50/50 split
  });

  const [items, setItems] = React.useState([/* ... */]);

  React.useEffect(() => {
    trackEvent('file_explorer_variant_assigned', {
      variant,
      userId: userId,
    });
  }, [variant]);

  const handleInteraction = (action, data) => {
    trackEvent('file_explorer_interaction', {
      variant,
      action,
      ...data,
    });
  };

  if (variant === 'treatment') {
    return (
      <FileExplorer
        items={items}
        dndInternal={true}
        onItemsReorder={(e, item, parent) => {
          handleInteraction('reorder', { item: item.name });
        }}
      />
    );
  }

  return <LegacyFileExplorer items={items} />;
}
```

---

## Custom Drag Overlay

Customize the visual feedback during drag operations.

### Styled Overlay

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';
import { TreeItem2DragAndDropOverlay } from '@mui/x-tree-view/TreeItem2DragAndDropOverlay';
import { alpha } from '@mui/material/styles';

function CustomDragOverlay(props) {
  return (
    <TreeItem2DragAndDropOverlay
      {...props}
      sx={{
        backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
        border: '2px dashed',
        borderColor: 'primary.main',
        borderRadius: 1,
        '&.valid': {
          borderColor: 'success.main',
          backgroundColor: theme => alpha(theme.palette.success.main, 0.1),
        },
        '&.invalid': {
          borderColor: 'error.main',
          backgroundColor: theme => alpha(theme.palette.error.main, 0.1),
        },
      }}
    />
  );
}

export default function CustomDragOverlayExample() {
  const [items, setItems] = React.useState([/* ... */]);

  return (
    <FileExplorer
      items={items}
      dndInternal={true}
      slots={{
        dragAndDropOverlay: CustomDragOverlay,
      }}
    />
  );
}
```

---

## Performance Optimization

Optimize FileExplorer for large datasets.

### Memoization

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';

export default function OptimizedFileExplorer() {
  const [items, setItems] = React.useState([/* large dataset */]);

  // Memoize callbacks
  const handleReorder = React.useCallback((event, item, parent, position) => {
    // Handle reorder
    console.log('Reordered:', item.name);
  }, []);

  const handleImport = React.useCallback((files, target, validation) => {
    // Handle import
    console.log('Imported:', files.length);
  }, []);

  // Memoize file type list
  const allowedTypes = React.useMemo(() => [
    '.pdf', '.png', '.jpg', '.docx',
  ], []);

  // Memoize getItemId and getItemLabel for performance
  const getItemId = React.useCallback((item) => item.id, []);
  const getItemLabel = React.useCallback((item) => item.name, []);

  return (
    <FileExplorer
      items={items}
      dndInternal={true}
      dndExternal={true}
      dndFileTypes={allowedTypes}
      getItemId={getItemId}
      getItemLabel={getItemLabel}
      onItemsReorder={handleReorder}
      onExternalFilesImport={handleImport}
    />
  );
}
```

---

## Accessibility Enhancements

Ensure FileExplorer is fully accessible.

### With ARIA Labels

```tsx
import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer';

export default function AccessibleFileExplorer() {
  const [items, setItems] = React.useState([/* ... */]);
  const [announcement, setAnnouncement] = React.useState('');

  const handleReorder = (event, item, parent) => {
    setAnnouncement(
      `${item.name} moved to ${parent?.name || 'root'}. Press Ctrl+Z to undo.`
    );
  };

  return (
    <div>
      {/* Screen reader announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', left: '-10000px' }}
      >
        {announcement}
      </div>

      <FileExplorer
        items={items}
        dndInternal={true}
        onItemsReorder={handleReorder}
        aria-label="File explorer with drag and drop support"
        aria-describedby="file-explorer-help"
      />

      <div id="file-explorer-help" style={{ display: 'none' }}>
        Use arrow keys to navigate, Enter to select, and drag to reorder files.
      </div>
    </div>
  );
}
```

---

## Summary

These examples demonstrate:

1. **Internal Drag-and-Drop**: Reordering within FileExplorer
2. **External Import**: Importing files from OS
3. **External Export**: Exporting files to OS
4. **File Type Filtering**: Security validation
5. **Trash Management**: Delete with undo
6. **Combined Features**: All features together
7. **Feature Flags**: Gradual rollout
8. **Custom Overlays**: Visual customization
9. **Performance**: Optimization techniques
10. **Accessibility**: Full a11y support

For more examples, visit:
- [FileExplorer Documentation](https://stoked-ui.com/file-explorer/docs)
- [API Reference](../api/file-explorer.json)
- [Migration Guide](../../data/migration/migration-file-explorer-mui-x/migration-file-explorer-mui-x.md)

---

**Examples Version:** 1.0.0
**Last Updated:** 2026-01-19
**Component Version:** @stoked-ui/file-explorer@1.0.0+
