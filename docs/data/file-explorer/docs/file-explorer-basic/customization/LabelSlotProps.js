import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { File } from '@stoked-ui/file-explorer/File';

const CustomTreeItem = React.forwardRef((props, ref) => (
  <File
    ref={ref}
    {...props}
    slotProps={{
      name: {
        id: `${props.id}-name`,
      },
    }}
  />
));

CustomTreeItem.propTypes = {
  /**
   * The id attribute of the item. If not provided, it will be generated.
   */
  id: PropTypes.string,
};

export default function LabelSlotProps() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorerBasic defaultExpandedItems={['grid']}>
        <CustomTreeItem id="grid" name="Data Grid">
          <CustomTreeItem id="grid-community" name="@mui/x-data-grid" />
          <CustomTreeItem id="grid-pro" name="@mui/x-data-grid-pro" />
          <CustomTreeItem id="grid-premium" name="@mui/x-data-grid-premium" />
        </CustomTreeItem>
        <CustomTreeItem id="pickers" name="Date and Time Pickers">
          <CustomTreeItem id="pickers-community" name="@mui/x-date-pickers" />
          <CustomTreeItem id="pickers-pro" name="@mui/x-date-pickers-pro" />
        </CustomTreeItem>
        <CustomTreeItem id="charts" name="Charts">
          <CustomTreeItem id="charts-community" name="@mui/x-charts" />
        </CustomTreeItem>
        <CustomTreeItem id="file-explorer" name="File Explorer">
          <CustomTreeItem
            id="file-explorer-community"
            name="@stoked-ui/file-explorer"
          />
        </CustomTreeItem>
      </FileExplorerBasic>
    </Box>
  );
}

