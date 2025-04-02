import * as React from 'react';
import Box from '@mui/material/Box';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';

export default function FirstComponent() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorerBasic getItemId>
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
  );
}

