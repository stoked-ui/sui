import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import Button from '@mui/material/Button';

export default function ControlledSelection() {
  const [selectedItems, setSelectedItems] = React.useState([]);

  const handleSelectedItemsChange = (event, ids) => {
    setSelectedItems(ids);
  };

  const handleSelectClick = () => {
    setSelectedItems((oldSelected) =>
      oldSelected.length === 0
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
        <Button onClick={handleSelectClick}>
          {selectedItems.length === 0 ? 'Select all' : 'Unselect all'}
        </Button>
      </div>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorerBasic
          selectedItems={selectedItems}
          onSelectedItemsChange={handleSelectedItemsChange}
          multiSelect
        >
          <FileElement itemId="grid" label="Data Grid">
            <FileElement itemId="grid-community" label="@mui/x-data-grid" />
            <FileElement itemId="grid-pro" label="@mui/x-data-grid-pro" />
            <FileElement itemId="grid-premium" label="@mui/x-data-grid-premium" />
          </FileElement>
          <FileElement itemId="pickers" label="Date and Time Pickers">
            <FileElement itemId="pickers-community" label="@mui/x-date-pickers" />
            <FileElement itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
          </FileElement>
          <FileElement itemId="charts" label="Charts">
            <FileElement itemId="charts-community" label="@mui/x-charts" />
          </FileElement>
          <FileElement itemId="file-explorer" label="File Explorer">
            <FileElement itemId="file-explorer-community" label="@stoked-ui/file-explorer" />
          </FileElement>
        </FileExplorerBasic>
      </Box>
    </Stack>
  );
}
