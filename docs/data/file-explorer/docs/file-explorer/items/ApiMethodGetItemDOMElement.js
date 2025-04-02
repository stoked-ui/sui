import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks/useFileExplorerApiRef';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

export default function ApiMethodGetItemDOMElement() {
  const apiRef = useFileExplorerApiRef();
  const handleScrollToChartsCommunity = (event) => {
    apiRef.current.focusItem(event, 'charts-community');
    apiRef.current
      .getItemDOMElement('charts-community')
      ?.scrollIntoView({ block: 'center' });
  };

  return (
    <Stack spacing={2}>
      <div>
        <Button onClick={handleScrollToChartsCommunity}>
          Focus and scroll to charts community item
        </Button>
      </div>
      <Box sx={{ height: 200, minWidth: 250, overflowY: 'scroll' }}>
        <FileExplorer
          items={NestedFiles}
          apiRef={apiRef}
          defaultExpandedItems={['Documents', 'Company', 'Bookmarked']}
        />
      </Box>
    </Stack>
  );
}

