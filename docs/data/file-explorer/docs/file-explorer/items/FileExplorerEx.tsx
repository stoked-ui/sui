import * as React from 'react';
import Box from '@mui/material/Box';
import { FileBase } from '@stoked-ui/file-explorer/models';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

const MUI_X_PRODUCTS: FileBase[] = [
  {
    id: 'grid',
    label: 'Data Grid',
    children: [
      { id: 'grid-community', label: '@mui/x-data-grid' },
      { id: 'grid-pro', label: '@mui/x-data-grid-pro' },
      { id: 'grid-premium', label: '@mui/x-data-grid-premium' },
    ],
  },
  {
    id: 'pickers',
    label: 'Date and Time Pickers',
    children: [
      { id: 'pickers-community', label: '@mui/x-date-pickers' },
      { id: 'pickers-pro', label: '@mui/x-date-pickers-pro' },
    ],
  },
  {
    id: 'charts',
    label: 'Charts',
    children: [{ id: 'charts-community', label: '@mui/x-charts' }],
  },
  {
    id: 'file-explorer',
    label: 'File Explorer',
    children: [{ id: 'file-explorer-community', label: '@stoked-ui/file-explorer' }],
  },
];

export default function FileExplorerEx() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorer items={MUI_X_PRODUCTS} />
    </Box>
  );
}
