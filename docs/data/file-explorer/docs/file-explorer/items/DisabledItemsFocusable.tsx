import * as React from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import {FileBaseInput, FileBase} from '@stoked-ui/file-explorer';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

type MuiXProductInput = FileBaseInput<{
  disabled?: boolean;
}>;

type MuiXProduct = FileBase<{
  disabled?: boolean;
}>;

const MUI_X_PRODUCTS: MuiXProductInput[] = [
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
    children: [{ id: 'charts-community', name: '@mui/x-charts', disabled: true }],
  },
  {
    id: 'file-explorer',
    name: 'File Explorer',
    disabled: true,
    children: [{ id: 'file-explorer-community', name: '@stoked-ui/file-explorer' }],
  },
];


export default function DisabledItemsFocusable() {
  const [disabledItemsFocusable, setDisabledItemsFocusable] = React.useState(false);
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisabledItemsFocusable(event.target.checked);
  };

  const isItemDisabled = (item: FileBase) => !!(item as MuiXProduct).disabled;

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Switch
            checked={disabledItemsFocusable}
            onChange={handleToggle}
            name="disabledItemsFocusable"
          />
        }
        label="Allow focusing disabled items"
      />
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorer<MuiXProduct>
          items={MUI_X_PRODUCTS as MuiXProduct[]}
          isItemDisabled={isItemDisabled}
          disabledItemsFocusable={disabledItemsFocusable}
        />
      </Box>
    </Stack>
  );
}
