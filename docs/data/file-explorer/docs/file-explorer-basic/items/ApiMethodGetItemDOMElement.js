import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks/useFileExplorerApiRef';

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
        <FileExplorerBasic
          apiRef={apiRef}
          defaultExpandedItems={['Notes', 'Images', 'Movies', 'Data']}
        >
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

