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
