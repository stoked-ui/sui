import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import Typography from '@mui/material/Typography';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

export default function TrackItemSelectionToggle() {
  const [lastSelectedItem, setLastSelectedItem] = React.useState<string | null>(
    null,
  );

  const handleItemSelectionToggle = (
    event: React.SyntheticEvent,
    itemId: string,
    isSelected: boolean,
  ) => {
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
        <FileExplorer
          items={NestedFiles}
          onItemSelectionToggle={handleItemSelectionToggle}
        />
      </Box>
    </Stack>
  );
}

