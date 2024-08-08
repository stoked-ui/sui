import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks';

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
        <FileExplorerBasic apiRef={apiRef}>
          <FileElement name={'Notes'}>
            <FileElement name="doc.pdf" />
            <FileElement name="notes.txt" />
          </FileElement>
          <FileElement name={'Images'}>
            <FileElement name={'logo.png'} />
            <FileElement name={'favicon.ico'} />
          </FileElement>
          <FileElement name={'Movies'}>
            <FileElement name={'feature.mp4'} />
          </FileElement>
          <FileElement name={'Data'}>
            <FileElement name={'client-data.xls'} />
          </FileElement>
        </FileExplorerBasic>
      </Box>
    </Stack>
  );
}
