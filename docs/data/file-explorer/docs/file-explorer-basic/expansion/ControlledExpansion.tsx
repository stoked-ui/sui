import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';

export default function ControlledExpansion() {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const handleExpandedItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string[],
  ) => {
    setExpandedItems(itemIds);
  };

  const handleExpandClick = () => {
    setExpandedItems((oldExpanded) =>
      oldExpanded.length === 0
        ? [
            'grid',
            'grid-community',
            'grid-pro',
            'grid-premium',
            'pickers',
            'pickers-community',
            'pickers-pro',
            'charts',
            'charts-community',
            'file-explorer',
            'file-explorer-community',
          ]
        : [],
    );
  };

  return (
    <Stack spacing={2}>
      <div>
        <Button onClick={handleExpandClick}>
          {expandedItems.length === 0 ? 'Expand all' : 'Collapse all'}
        </Button>
      </div>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorerBasic
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}
        >
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

