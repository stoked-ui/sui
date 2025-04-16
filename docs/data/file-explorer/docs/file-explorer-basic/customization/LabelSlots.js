import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { File, FileLabel } from '@stoked-ui/file-explorer';

function CustomLabel(props) {
  const { tooltip, ...other } = props;

  return (
    <Tooltip title={tooltip}>
      <FileLabel {...other} />
    </Tooltip>
  );
}

CustomLabel.propTypes = {
  tooltip: PropTypes.string,
};

const CustomTreeItem = React.forwardRef((props, ref) => {
  const { labelTooltip, ...other } = props;

  return (
    <File
      {...other}
      ref={ref}
      slots={{ name: CustomLabel }}
      slotProps={{ name: { tooltip: labelTooltip } }}
    />
  );
});

CustomTreeItem.propTypes = {
  labelTooltip: PropTypes.string,
};

export default function LabelSlots() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorerBasic defaultExpandedItems={['grid']}>
        <CustomTreeItem id="grid" name="Data Grid">
          <CustomTreeItem
            id="grid-community"
            name="@mui/x-data-grid"
            labelTooltip="Community version (MIT) of the Data Grid"
          />
          <CustomTreeItem
            id="grid-pro"
            name="@mui/x-data-grid-pro"
            labelTooltip="Pro version (commercial) of the Data Grid"
          />
          <CustomTreeItem
            id="grid-premium"
            name="@mui/x-data-grid-premium"
            labelTooltip="Premium version (commercial) of the Data Grid"
          />
        </CustomTreeItem>
        <CustomTreeItem id="pickers" name="Date and Time Pickers">
          <CustomTreeItem
            id="pickers-community"
            name="@mui/x-date-pickers"
            labelTooltip="Community version (MIT) of the Date and Time Pickers"
          />
          <CustomTreeItem
            id="pickers-pro"
            name="@mui/x-date-pickers-pro"
            labelTooltip="Pro version (commercial) of the Date and Time Pickers"
          />
        </CustomTreeItem>
        <CustomTreeItem id="charts" name="Charts">
          <CustomTreeItem
            id="charts-community"
            name="@mui/x-charts"
            labelTooltip="Community version (MIT) of the Charts"
          />
        </CustomTreeItem>
        <CustomTreeItem id="file-explorer" name="File Explorer">
          <CustomTreeItem
            id="file-explorer-community"
            name="@stoked-ui/file-explorer"
            labelTooltip="Community version (MIT) of the File Explorer"
          />
        </CustomTreeItem>
      </FileExplorerBasic>
    </Box>
  );
}
