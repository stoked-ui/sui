import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import Button from '@mui/material/Button';

export default function ControlledSelection() {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  const handleSelectedItemsChange = (event: React.SyntheticEvent, ids: string[]) => {
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
          <FileElement id="grid" name="Data Grid">
            <FileElement id="grid-community" name="@mui/x-data-grid" />
            <FileElement id="grid-pro" name="@mui/x-data-grid-pro" />
            <FileElement id="grid-premium" name="@mui/x-data-grid-premium" />
          </FileElement>
          <FileElement id="pickers" name="Date and Time Pickers">
            <FileElement id="pickers-community" name="@mui/x-date-pickers" />
            <FileElement id="pickers-pro" name="@mui/x-date-pickers-pro" />
          </FileElement>
          <FileElement id="charts" name="Charts">
            <FileElement id="charts-community" name="@mui/x-charts" />
          </FileElement>
          <FileElement id="file-explorer" name="File Explorer">
            <FileElement id="file-explorer-community" name="@stoked-ui/file-explorer" />
          </FileElement>
        </FileExplorerBasic>
      </Box>
    </Stack>
  );
}

