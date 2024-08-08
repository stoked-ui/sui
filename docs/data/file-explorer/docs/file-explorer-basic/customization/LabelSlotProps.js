import * as React from 'react';
import Box from '@mui/material/Box';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { File } from '@stoked-ui/file-explorer/File';

const CustomTreeItem = React.forwardRef((props, ref) => (
  <File
    ref={ref}
    {...props}
    slotProps={{
      label: {
        id: `${props.itemId}-label`,
      },
    }}
  />
));

export default function LabelSlotProps() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorerBasic defaultExpandedItems={['grid']}>
        <CustomTreeItem itemId="grid" label="Data Grid">
          <CustomTreeItem itemId="grid-community" label="@mui/x-data-grid" />
          <CustomTreeItem itemId="grid-pro" label="@mui/x-data-grid-pro" />
          <CustomTreeItem itemId="grid-premium" label="@mui/x-data-grid-premium" />
        </CustomTreeItem>
        <CustomTreeItem itemId="pickers" label="Date and Time Pickers">
          <CustomTreeItem itemId="pickers-community" label="@mui/x-date-pickers" />
          <CustomTreeItem itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
        </CustomTreeItem>
        <CustomTreeItem itemId="charts" label="Charts">
          <CustomTreeItem itemId="charts-community" label="@mui/x-charts" />
        </CustomTreeItem>
        <CustomTreeItem itemId="file-explorer" label="File Explorer">
          <CustomTreeItem itemId="file-explorer-community" label="@stoked-ui/file-explorer" />
        </CustomTreeItem>
      </FileExplorerBasic>
    </Box>
  );
}
