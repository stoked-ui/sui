import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks/useFileExplorerApiRef';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';
import { UseFileMinimalPlugins } from "@stoked-ui/file-explorer/internals/models";


export default function ApiMethodSelectItem() {
  const apiRef = useFileExplorerApiRef<UseFileMinimalPlugins>();
  const handleSelectGridPro = (event: React.SyntheticEvent) => {
    apiRef.current?.selectItem( event, 'Notes', false );
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

