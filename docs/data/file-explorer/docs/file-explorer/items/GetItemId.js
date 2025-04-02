import * as React from 'react';
import Box from '@mui/material/Box';

import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

const MUI_X_PRODUCTS = [
  {
    internalId: 'grid',
    name: 'Data Grid',
    children: [
      { internalId: 'grid-community', name: '@mui/x-data-grid' },
      { internalId: 'grid-pro', name: '@mui/x-data-grid-pro' },
      { internalId: 'grid-premium', name: '@mui/x-data-grid-premium' },
    ],
  },
  {
    internalId: 'pickers',
    name: 'Date and Time Pickers',
    children: [
      { internalId: 'pickers-community', name: '@mui/x-date-pickers' },
      { internalId: 'pickers-pro', name: '@mui/x-date-pickers-pro' },
    ],
  },
  {
    internalId: 'charts',
    name: 'Charts',
    children: [{ internalId: 'charts-community', name: '@mui/x-charts' }],
  },
  {
    internalId: 'file-explorer',
    name: 'File Explorer',
    children: [
      { internalId: 'file-explorer-community', name: '@stoked-ui/file-explorer' },
    ],
  },
];

const getItemId = (item) => item.internalId;

export default function GetItemId() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorer items={MUI_X_PRODUCTS} getItemId={getItemId} />
    </Box>
  );
}

