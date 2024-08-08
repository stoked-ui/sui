import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import Typography from '@mui/material/Typography';

export default function TrackItemExpansionToggle() {
  const [action, setAction] = React.useState<{
    itemId: string;
    isExpanded: boolean;
  } | null>(null);

  const handleItemExpansionToggle = (
    event: React.SyntheticEvent,
    itemId: string,
    isExpanded: boolean,
  ) => {
    setAction({ itemId, isExpanded });
  };

  return (
    <Stack spacing={2}>
      {action == null ? (
        <Typography>No action recorded</Typography>
      ) : (
        <Typography>
          Last action: {action.isExpanded ? 'expand' : 'collapse'} {action.itemId}
        </Typography>
      )}
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorerBasic onItemExpansionToggle={handleItemExpansionToggle}>
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
    </Stack>
  );
}
