import React, { useState } from 'react';
import { RichTreeViewPro } from '@mui/x-tree-view-pro/RichTreeViewPro';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { Box, Typography, Paper, Alert, Chip, Divider } from '@mui/material';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';

interface FileItem extends TreeViewBaseItem {
  name: string;
  type: 'file' | 'folder';
}

const INITIAL_ITEMS: FileItem[] = [
  {
    id: 'folder-1',
    label: 'Projects',
    name: 'Projects',
    type: 'folder',
    children: [
      { id: 'file-1', label: 'app.tsx', name: 'app.tsx', type: 'file' },
      { id: 'file-2', label: 'index.tsx', name: 'index.tsx', type: 'file' },
    ],
  },
  {
    id: 'folder-2',
    label: 'Documents',
    name: 'Documents',
    type: 'folder',
    children: [
      { id: 'file-3', label: 'readme.md', name: 'readme.md', type: 'file' },
    ],
  },
];

export default function DragDropPrototype() {
  const apiRef = useTreeViewApiRef();
  const [items, setItems] = useState<FileItem[]>(INITIAL_ITEMS);
  const [findings, setFindings] = useState<string[]>([]);
  const [dragEvents, setDragEvents] = useState<string[]>([]);
  const [trashItems, setTrashItems] = useState<string[]>([]);

  React.useEffect(() => {
    const newFindings: string[] = [];

    // Test MUI X Pro DnD capabilities
    newFindings.push('✓ MUI X Pro supports native itemsReordering prop');
    newFindings.push('⚠ Internal DnD works for reordering within tree');
    newFindings.push('❌ External file drop (from OS) NOT natively supported');
    newFindings.push('❌ Custom drop zones (trash) NOT natively supported');
    newFindings.push('⚠ Requires @atlaskit/pragmatic-drag-and-drop integration for full FileExplorer DnD');

    setFindings(newFindings);
  }, []);

  const handleItemsReordered = (params: any) => {
    setDragEvents(prev => [...prev, `Reordered: ${JSON.stringify(params)}`].slice(-5));
  };

  // Simulated external drop zone
  const handleExternalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragEvents(prev => [...prev, 'External drop detected (requires custom handler)'].slice(-5));
  };

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragEvents(prev => [...prev, 'Trash drop detected (requires custom handler)'].slice(-5));
    setTrashItems(prev => [...prev, 'Item moved to trash']);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        AC-1.2.b: Drag & Drop for All 3 Zones
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        MUI X RichTreeViewPro supports INTERNAL reordering only.
        External drops and custom drop zones require additional integration.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Zone 1: Internal DnD (Native Support)
          </Typography>
          <RichTreeViewPro
            items={items}
            apiRef={apiRef}
            itemsReordering
            defaultExpandedItems={['folder-1', 'folder-2']}
            experimentalFeatures={{
              indentationAtItemLevel: true,
            }}
            sx={{ minHeight: 200 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Drag items to reorder within the tree
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200 }}>
          <Paper
            sx={{ p: 2, border: 2, borderColor: 'primary.main', borderStyle: 'dashed' }}
            onDrop={handleExternalDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Typography variant="h6" gutterBottom>
              Zone 2: External Drop
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drop files from OS here
            </Typography>
            <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
              Requires custom file input handler
            </Typography>
          </Paper>

          <Paper
            sx={{ p: 2, border: 2, borderColor: 'error.main', borderStyle: 'dashed' }}
            onDrop={handleTrashDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Typography variant="h6" gutterBottom>
              Zone 3: Trash Drop
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drop items to delete
            </Typography>
            <Box sx={{ mt: 1 }}>
              {trashItems.map((item, idx) => (
                <Chip key={idx} label={item} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Drag & Drop Events
        </Typography>
        <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
          {dragEvents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No drag events yet. Try dragging items in the tree.
            </Typography>
          ) : (
            dragEvents.map((event, idx) => (
              <Typography key={idx} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {event}
              </Typography>
            ))
          )}
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Findings & Integration Strategy
      </Typography>

      <Paper sx={{ p: 2 }}>
        {findings.map((finding, index) => (
          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
            {finding}
          </Typography>
        ))}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Recommended Integration:
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>
              <strong>Keep @atlaskit/pragmatic-drag-and-drop:</strong> Already integrated, proven solution
            </li>
            <li>
              <strong>Layer approach:</strong> Use RichTreeView for tree logic, pragmatic-drag-and-drop for DnD
            </li>
            <li>
              <strong>Custom drop zones:</strong> Implement using existing DnD library patterns
            </li>
            <li>
              <strong>External file drops:</strong> Use File API with existing DnD handlers
            </li>
            <li>
              <strong>Migration path:</strong> Minimal changes to existing DnD implementation
            </li>
          </ul>
        </Typography>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Decision:</strong> MUI X native DnD is insufficient. Continue using @atlaskit/pragmatic-drag-and-drop
            with RichTreeView as the tree structure provider.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
}
