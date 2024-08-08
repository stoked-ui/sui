import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks/useFileExplorerApiRef';

export default function ApiMethodFocusItem() {
  const apiRef = useFileExplorerApiRef();
  const handleButtonClick = (event: React.SyntheticEvent) => {
    apiRef.current?.focusItem(event, 'pickers');
  };

  return (
    <Stack spacing={2}>
      <div>
        <Button onClick={handleButtonClick}>Focus pickers item</Button>
      </div>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorerBasic apiRef={apiRef}>
          <FileElement name={"Notes"}>
            <FileElement name="doc.pdf" />
            <FileElement name="notes.txt" />
          </FileElement>
          <FileElement name={"Images"}>
            <FileElement name={"logo.png"} />
            <FileElement name={"favicon.ico"} />
          </FileElement>
          <FileElement name={"Movies"}>
            <FileElement name={"feature.mp4"} />
          </FileElement>
          <FileElement name={"Data"}>
            <FileElement name={"client-data.xls"} />
          </FileElement>
        </FileExplorerBasic>
      </Box>
    </Stack>
  );
}
