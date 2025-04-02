import * as React from 'react';
import Box from '@mui/material/Box';
import { FileBaseInput, FileBase } from '@stoked-ui/file-explorer/models';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

const MUI_X_PRODUCTS: FileBaseInput[] = [
  {
    id: 'grid',
    name: 'Data Grid',
    children: [
      { id: 'grid-community', name: '@mui/x-data-grid' },
      { id: 'grid-pro', name: '@mui/x-data-grid-pro' },
      { id: 'grid-premium', name: '@mui/x-data-grid-premium' },
    ],
  },
  {
    id: 'pickers',
    name: 'Date and Time Pickers',
    children: [
      { id: 'pickers-community', name: '@mui/x-date-pickers' },
      { id: 'pickers-pro', name: '@mui/x-date-pickers-pro' },
    ],
  },
  {
    id: 'charts',
    name: 'Charts',
    children: [{ id: 'charts-community', name: '@mui/x-charts' }],
  },
  {
    id: 'file-explorer',
    name: 'File Explorer',
    children: [{ id: 'file-explorer-community', name: '@stoked-ui/file-explorer' }],
  },
];

export default function FileExplorerEx() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorer items={MUI_X_PRODUCTS as FileBase[]} />
    </Box>
  );
}

