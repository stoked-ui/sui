import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks';
import { IMediaFileEx } from '@stoked-ui/file-explorer/internals/models/IMediaFileEx';

const MUI_X_PRODUCTS= [
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

export default function ApiMethodGetItemTree() {
  const apiRef = useFileExplorerApiRef();

  const [items, setItems] = React.useState(MUI_X_PRODUCTS);
  const [itemOnTop, setItemOnTop] = React.useState(items[0].name);

  const handleInvertItems = () => {
    setItems((prevItems) => [...prevItems].reverse());
  };

  const handleUpdateItemOnTop = () => {
    setItemOnTop(apiRef.current!.getItem('pickers').name);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button onClick={handleInvertItems}>Invert first tree</Button>
        <Button onClick={handleUpdateItemOnTop}>Update item on top</Button>
      </Stack>
      <Typography>Item on top: {itemOnTop}</Typography>
      <Box sx={{ minHeight: 352, minWidth: 300 }}>
        <FileExplorer apiRef={apiRef} items={items as IMediaFileEx[]} />
      </Box>
    </Stack>
  );
}

