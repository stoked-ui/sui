import * as React from 'react';
import Box from '@mui/material/Box';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';

export default function CheckboxSelection() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 290 }}>
      <FileExplorerBasic checkboxSelection>
        <FileElement id="grid" name="Data Grid">
          <FileElement id="grid-community" name="@mui/x-data-grid" />
          <FileElement id="grid-pro" name="@mui/x-data-grid-pro" />
          <FileElement id="grid-premium" name="@mui/x-data-grid-premium" />
        </FileElement>
        <FileElement id="pickers" name="Date and Time Pickers">
          <FileElement id="pickers-community" name="@mui/x-date-pickers" />
          <FileElement id="pickers-pro" name="@mui/x-date-pickers-pro" />
        </FileElement>
        <FileElement id="charts" name="Charts">
          <FileElement id="charts-community" name="@mui/x-charts" />
        </FileElement>
        <FileElement id="file-explorer" name="File Explorer">
          <FileElement
            id="file-explorer-community"
            name="@stoked-ui/file-explorer"
          />
        </FileElement>
      </FileExplorerBasic>
    </Box>
  );
}
