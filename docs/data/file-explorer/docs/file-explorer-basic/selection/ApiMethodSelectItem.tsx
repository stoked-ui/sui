import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks/useFileExplorerApiRef';

export default function ApiMethodSelectItem() {
  const apiRef = useFileExplorerApiRef();
  const handleSelectGridPro = (event: React.SyntheticEvent) => {
    apiRef.current?.selectItem( event, 'grid-pro', false, true);
  };

  return (
    <Stack spacing={2}>
      <div>
        <Button onClick={handleSelectGridPro}>Select grid pro item</Button>
      </div>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorerBasic apiRef={apiRef} defaultExpandedItems={['grid']}>
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
            <FileElement id="file-explorer-community" name="@stoked-ui/file-explorer" />
          </FileElement>
        </FileExplorerBasic>
      </Box>
    </Stack>
  );
}

