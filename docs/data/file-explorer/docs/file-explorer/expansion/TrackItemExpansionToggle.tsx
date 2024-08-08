import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { FileBase } from '@stoked-ui/file-explorer/models';
import Typography from '@mui/material/Typography';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

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
        <FileExplorer
          items={NestedFiles}
          onItemExpansionToggle={handleItemExpansionToggle}
        />
      </Box>
    </Stack>
  );
}
