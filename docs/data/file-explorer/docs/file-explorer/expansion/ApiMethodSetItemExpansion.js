import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

export default function ApiMethodSetItemExpansion() {
  const apiRef = useFileExplorerApiRef();

  const handleExpandClick = (event) => {
    apiRef.current.setItemExpansion(event, 'grid', true);
  };

  const handleCollapseClick = (event) => {
    apiRef.current.setItemExpansion(event, 'grid', false);
  };

  return (
    <Stack spacing={2}>
      <Stack spacing={2} direction="row">
        <Button onClick={handleExpandClick}>Expand Data Grid</Button>
        <Button onClick={handleCollapseClick}>Collapse Data Grid</Button>
      </Stack>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorer items={NestedFiles} apiRef={apiRef} />
      </Box>
    </Stack>
  );
}
