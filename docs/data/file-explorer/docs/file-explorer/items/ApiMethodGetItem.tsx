import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { FileBase } from '@stoked-ui/file-explorer/models';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks';

const MUI_X_PRODUCTS: FileBase[] = [
  {
    id: 'grid',
    label: 'Data Grid',
    children: [
      { id: 'grid-community', label: '@mui/x-data-grid' },
      { id: 'grid-pro', label: '@mui/x-data-grid-pro' },
      { id: 'grid-premium', label: '@mui/x-data-grid-premium' },
    ],
  },
  {
    id: 'pickers',
    label: 'Date and Time Pickers',
    children: [
      { id: 'pickers-community', label: '@mui/x-date-pickers' },
      { id: 'pickers-pro', label: '@mui/x-date-pickers-pro' },
    ],
  },
  {
    id: 'charts',
    label: 'Charts',
    children: [{ id: 'charts-community', label: '@mui/x-charts' }],
  },
  {
    id: 'file-explorer',
    label: 'File Explorer',
    children: [{ id: 'file-explorer-community', label: '@stoked-ui/file-explorer' }],
  },
];

export default function ApiMethodGetItem() {
  const apiRef = useFileExplorerApiRef();
  const [selectedItem, setSelectedItem] = React.useState<FileBase | null>(
    null,
  );

  const handleSelectedItemsChange = (
    event: React.SyntheticEvent,
    itemId: string | null,
  ) => {
    if (itemId == null) {
      setSelectedItem(null);
    } else {
      setSelectedItem(apiRef.current!.getItem(itemId));
    }
  };

  return (
    <Stack spacing={2}>
      <Typography sx={{ minWidth: 300 }}>
        Selected item: {selectedItem == null ? 'none' : selectedItem.label}
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
