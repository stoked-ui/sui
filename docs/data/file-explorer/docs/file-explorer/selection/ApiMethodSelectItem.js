import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks/useFileExplorerApiRef';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';


export default function ApiMethodSelectItem() {
  const apiRef = useFileExplorerApiRef();
  const handleSelectGridPro = (event) => {
    apiRef.current?.selectItem({ event, itemId: 'grid-pro' });
  };

  return (
    <Stack spacing={2}>
      <div>
        <Button onClick={handleSelectGridPro}>Select grid pro item</Button>
      </div>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorer
          items={NestedFiles}
          apiRef={apiRef}
          defaultExpandedItems={['grid']}
        />
      </Box>
    </Stack>
  );
}
