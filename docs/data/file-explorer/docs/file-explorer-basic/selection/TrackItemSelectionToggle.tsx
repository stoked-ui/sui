import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import Typography from '@mui/material/Typography';

export default function TrackItemSelectionToggle() {
  const [lastSelectedItem, setLastSelectedItem] = React.useState<string | null>(
    null,
  );

  const handleItemSelectionToggle = (
    event: React.SyntheticEvent,
    id: string,
    isSelected: boolean,
  ) => {
    if (isSelected) {
      setLastSelectedItem(id);
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

