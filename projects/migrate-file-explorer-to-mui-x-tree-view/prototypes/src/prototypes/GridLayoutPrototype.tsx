import React, { useState, useRef } from 'react';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { Box, Typography, Paper, Alert, Divider } from '@mui/material';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';

interface FileItem extends TreeViewBaseItem {
  name: string;
  size: number;
  modified: string;
  type: string;
}

const SAMPLE_ITEMS: FileItem[] = [
  {
    id: '1',
    label: 'Documents',
    name: 'Documents',
    size: 0,
    modified: '2024-01-15',
    type: 'folder',
    children: [
      { id: '1.1', label: 'Report.pdf', name: 'Report.pdf', size: 2048, modified: '2024-01-14', type: 'file' },
      { id: '1.2', label: 'Notes.txt', name: 'Notes.txt', size: 512, modified: '2024-01-13', type: 'file' },
    ],
  },
  {
    id: '2',
    label: 'Images',
    name: 'Images',
    size: 0,
    modified: '2024-01-12',
    type: 'folder',
    children: [
      { id: '2.1', label: 'Photo1.jpg', name: 'Photo1.jpg', size: 4096, modified: '2024-01-11', type: 'file' },
      { id: '2.2', label: 'Photo2.png', name: 'Photo2.png', size: 8192, modified: '2024-01-10', type: 'file' },
    ],
  },
];

export default function GridLayoutPrototype() {
  const apiRef = useTreeViewApiRef();
  const [findings, setFindings] = useState<string[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const newFindings: string[] = [];

    // Test 1: Grid layout rendering
    newFindings.push('✓ Basic tree structure renders successfully');

    // Test 2: Multiple columns via wrapper
    newFindings.push('⚠ Native multi-column grid NOT supported - requires wrapper component');

    // Test 3: Header synchronization
    newFindings.push('⚠ Synchronized scrolling headers require custom implementation');

    // Test 4: Column width management
    newFindings.push('⚠ Dynamic column widths require state management layer');

    setFindings(newFindings);
  }, []);

  // Simulate synchronized scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        AC-1.2.a: Grid View with Column Headers
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        MUI X RichTreeView does NOT natively support grid layouts with multiple columns.
        A wrapper component approach is required.
      </Alert>

      <Typography variant="h6" gutterBottom>
        Approach 1: Wrapper Component (Recommended)
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box>
          {/* Custom header row */}
          <Box
            ref={headerRef}
            sx={{
              display: 'flex',
              borderBottom: 1,
              borderColor: 'divider',
              overflow: 'hidden',
              backgroundColor: 'background.paper',
            }}
          >
            <Box sx={{ minWidth: 200, p: 1, fontWeight: 'bold' }}>Name</Box>
            <Box sx={{ minWidth: 100, p: 1, fontWeight: 'bold' }}>Size</Box>
            <Box sx={{ minWidth: 150, p: 1, fontWeight: 'bold' }}>Modified</Box>
            <Box sx={{ minWidth: 100, p: 1, fontWeight: 'bold' }}>Type</Box>
          </Box>

          {/* Scrollable content area */}
          <Box
            ref={contentRef}
            onScroll={handleScroll}
            sx={{
              overflow: 'auto',
              maxHeight: 300,
            }}
          >
            {SAMPLE_ITEMS.map((item) => (
              <Box key={item.id}>
                <Box sx={{ display: 'flex', p: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                  <Box sx={{ minWidth: 200 }}>{item.name}</Box>
                  <Box sx={{ minWidth: 100 }}>{item.size > 0 ? `${item.size} KB` : '-'}</Box>
                  <Box sx={{ minWidth: 150 }}>{item.modified}</Box>
                  <Box sx={{ minWidth: 100 }}>{item.type}</Box>
                </Box>
                {item.children?.map((child) => (
                  <Box key={child.id} sx={{ display: 'flex', p: 1, pl: 4, '&:hover': { bgcolor: 'action.hover' } }}>
                    <Box sx={{ minWidth: 200 }}>{child.name}</Box>
                    <Box sx={{ minWidth: 100 }}>{child.size > 0 ? `${child.size} KB` : '-'}</Box>
                    <Box sx={{ minWidth: 150 }}>{child.modified}</Box>
                    <Box sx={{ minWidth: 100 }}>{child.type}</Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Approach 2: RichTreeView with Custom Rendering
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <RichTreeView
          items={SAMPLE_ITEMS}
          apiRef={apiRef}
          defaultExpandedItems={['1', '2']}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Standard RichTreeView rendering - single column only
        </Typography>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Findings & Recommendations
      </Typography>

      <Paper sx={{ p: 2 }}>
        {findings.map((finding, index) => (
          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
            {finding}
          </Typography>
        ))}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Recommended Architecture:
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>Create GridFileExplorer wrapper component</li>
            <li>Maintain RichTreeView for tree logic (expand/collapse)</li>
            <li>Implement custom rendering layer for grid cells</li>
            <li>Use synchronized scroll handlers for header alignment</li>
            <li>Store column widths in React state with resize handlers</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
}
