import * as React from 'react';
import Box from '@mui/material/Box';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';

export default function SingleSelectFileExplorer() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorerBasic>
        <FileElement itemId="grid" label="Data Grid">
          <FileElement itemId="grid-community" label="@mui/x-data-grid" />
          <FileElement itemId="grid-pro" label="@mui/x-data-grid-pro" />
          <FileElement itemId="grid-premium" label="@mui/x-data-grid-premium" />
        </FileElement>
        <FileElement itemId="pickers" label="Date and Time Pickers">
          <FileElement itemId="pickers-community" label="@mui/x-date-pickers" />
          <FileElement itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
        </FileElement>
        <FileElement itemId="charts" label="Charts">
          <FileElement itemId="charts-community" label="@mui/x-charts" />
        </FileElement>
        <FileElement itemId="file-explorer" label="File Explorer">
          <FileElement itemId="file-explorer-community" label="@stoked-ui/file-explorer" />
        </FileElement>
      </FileExplorerBasic>
    </Box>
  );
}
