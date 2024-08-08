import * as React from 'react';
import Box from '@mui/material/Box';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { FileBase } from '@stoked-ui/file-explorer/models';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

export default function CheckboxMultiSelection() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 290 }}>
      <FileExplorer multiSelect checkboxSelection items={NestedFiles} />
    </Box>
  );
}
