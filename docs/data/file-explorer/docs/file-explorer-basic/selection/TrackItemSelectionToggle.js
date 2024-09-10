import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import Typography from '@mui/material/Typography';

export default function TrackItemSelectionToggle() {
  const [lastSelectedItem, setLastSelectedItem] = React.useState(null);

  const handleItemSelectionToggle = (event, itemId, isSelected) => {
    if (isSelected) {
      setLastSelectedItem(itemId);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography>
        {lastSelectedItem == null
          ? 'No item selection recorded'
          : `Last selected item: ${lastSelectedItem}`}
      </Typography>
      <Box sx={{ minHeight: 352, minWidth: 300 }}>
        <FileExplorerBasic onItemSelectionToggle={handleItemSelectionToggle}>
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
            <FileElement
              itemId="file-explorer-community"
              label="@stoked-ui/file-explorer"
            />
          </FileElement>
        </FileExplorerBasic>
      </Box>
    </Stack>
  );
}
