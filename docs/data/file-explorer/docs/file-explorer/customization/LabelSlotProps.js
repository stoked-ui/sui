import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { File } from '@stoked-ui/file-explorer/File';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

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

CustomTreeItem.propTypes = {
  /**
   * The id of the item.
   * Must be unique.
   */
  itemId: PropTypes.string,
};

export default function LabelSlotProps() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorer
        items={NestedFiles}
        defaultExpandedItems={['grid']}
        slots={{ item: CustomTreeItem }}
      />
    </Box>
  );
}
