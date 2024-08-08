import * as React from 'react';
import Box from '@mui/material/Box';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';


export default function DisableSelection() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorer disableSelection items={NestedFiles} />
    </Box>
  );
}
