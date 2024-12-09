import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks';

const MUI_X_PRODUCTS = [
  {
    id: 'grid',
    name: 'Data Grid',
    children: [
      { id: 'grid-community', name: '@mui/x-data-grid' },
      { id: 'grid-pro', name: '@mui/x-data-grid-pro' },
      { id: 'grid-premium', name: '@mui/x-data-grid-premium' },
    ],
  },
  {
    id: 'pickers',
    name: 'Date and Time Pickers',
    children: [
      { id: 'pickers-community', name: '@mui/x-date-pickers' },
      { id: 'pickers-pro', name: '@mui/x-date-pickers-pro' },
    ],
  },
  {
    id: 'charts',
    name: 'Charts',
    children: [{ id: 'charts-community', name: '@mui/x-charts' }],
  },
  {
    id: 'file-explorer',
    name: 'File Explorer',
    children: [{ id: 'file-explorer-community', name: '@stoked-ui/file-explorer' }],
  },
];

export default function ApiMethodGetItem() {
  const apiRef = useFileExplorerApiRef();
  const [selectedItem, setSelectedItem] = React.useState(null);

  const handleSelectedItemsChange = (event, itemId) => {
    if (itemId == null) {
      setSelectedItem(null);
    } else {
      setSelectedItem(apiRef.current.getItem(itemId));
    }
  };

  return (
    <Stack spacing={2}>
      <Typography sx={{ minWidth: 300 }}>
        Selected item: {selectedItem == null ? 'none' : selectedItem.name}
      </Typography>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorer
          items={MUI_X_PRODUCTS}
          apiRef={apiRef}
          selectedItems={selectedItem?.id ?? null}
          onSelectedItemsChange={handleSelectedItemsChange}
        />
      </Box>
    </Stack>
  );
}
