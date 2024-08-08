import * as React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import {
  File,
  FileLabel,
  FileProps,
} from '@stoked-ui/file-explorer/File';

interface CustomLabelProps {
  children: React.ReactNode;
  tooltip?: string;
}

function CustomLabel(props: CustomLabelProps) {
  const { tooltip, ...other } = props;

  return (
    <Tooltip title={tooltip}>
      <FileLabel {...other} />
    </Tooltip>
  );
}

interface CustomTreeItemProps extends FileProps {
  labelTooltip?: string;
}

const CustomTreeItem = React.forwardRef(
  (props: CustomTreeItemProps, ref: React.Ref<HTMLLIElement>) => {
    const { labelTooltip, ...other } = props;

    return (
      <File
        {...other}
        ref={ref}
        slots={{ label: CustomLabel }}
        slotProps={{ label: { tooltip: labelTooltip } as any }}
      />
    );
  },
);

export default function LabelSlots() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorerBasic defaultExpandedItems={['grid']}>
        <CustomTreeItem itemId="grid" label="Data Grid">
          <CustomTreeItem
            itemId="grid-community"
            label="@mui/x-data-grid"
            labelTooltip="Community version (MIT) of the Data Grid"
          />
          <CustomTreeItem
            itemId="grid-pro"
            label="@mui/x-data-grid-pro"
            labelTooltip="Pro version (commercial) of the Data Grid"
          />
          <CustomTreeItem
            itemId="grid-premium"
            label="@mui/x-data-grid-premium"
            labelTooltip="Premium version (commercial) of the Data Grid"
          />
        </CustomTreeItem>
        <CustomTreeItem itemId="pickers" label="Date and Time Pickers">
          <CustomTreeItem
            itemId="pickers-community"
            label="@mui/x-date-pickers"
            labelTooltip="Community version (MIT) of the Date and Time Pickers"
          />
          <CustomTreeItem
            itemId="pickers-pro"
            label="@mui/x-date-pickers-pro"
            labelTooltip="Pro version (commercial) of the Date and Time Pickers"
          />
        </CustomTreeItem>
        <CustomTreeItem itemId="charts" label="Charts">
          <CustomTreeItem
            itemId="charts-community"
            label="@mui/x-charts"
            labelTooltip="Community version (MIT) of the Charts"
          />
        </CustomTreeItem>
        <CustomTreeItem itemId="file-explorer" label="File Explorer">
          <CustomTreeItem
            itemId="file-explorer-community"
            label="@stoked-ui/file-explorer"
            labelTooltip="Community version (MIT) of the File Explorer"
          />
        </CustomTreeItem>
      </FileExplorerBasic>
    </Box>
  );
}
