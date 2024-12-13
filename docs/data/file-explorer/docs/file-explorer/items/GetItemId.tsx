import * as React from 'react';
import Box from '@mui/material/Box';
import { FileBaseInput, FileBase } from '@stoked-ui/file-explorer/models';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

type MuiXProductInput = FileBaseInput<{
  internalId: string;
}>;

type MuiXProduct = FileBase<{
  internalId: string;
}>;

const MUI_X_PRODUCTS: MuiXProductInput[] = [
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
    children: [{ internalId: 'file-explorer-community', name: '@stoked-ui/file-explorer' }],
  },
];

const getItemId = (item: FileBase) => (item as MuiXProduct).internalId;

export default function GetItemId() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorer<MuiXProduct> items={MUI_X_PRODUCTS as FileBase[]} getItemId={getItemId} />
    </Box>
  );
}
