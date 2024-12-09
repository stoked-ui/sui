import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { FileBaseInput } from '@stoked-ui/file-explorer/models';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks';

const MUI_X_PRODUCTS: FileBaseInput[] = [
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

export default function ApiMethodGetItemOrderedChildrenIds() {
  const apiRef = useFileExplorerApiRef();
  const [isSelectedItemLeaf, setIsSelectedItemLeaf] = React.useState<boolean | null>(
    null,
  );

  const handleSelectedItemsChange = (
    event: React.SyntheticEvent,
    itemId: string | null,
  ) => {
    if (itemId == null) {
      setIsSelectedItemLeaf(null);
    } else {
      const children = apiRef.current!.getItemOrderedChildrenIds(itemId);
      setIsSelectedItemLeaf(children.length === 0);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography>
        {isSelectedItemLeaf == null && 'No item selected'}
        {isSelectedItemLeaf === true && 'The selected item is a leaf'}
        {isSelectedItemLeaf === false && 'The selected item is a node with children'}
      </Typography>
      <Box sx={{ minHeight: 352, minWidth: 300 }}>
        <FileExplorer
          items={MUI_X_PRODUCTS}
          apiRef={apiRef}
          onSelectedItemsChange={handleSelectedItemsChange}
        />
      </Box>
    </Stack>
  );
}
