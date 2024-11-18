import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

import { useFile } from '@stoked-ui/file-explorer/useFile';
import {
  FileContent,
  FileIconContainer,
  FileGroupTransition,
  FileLabel,
  FileRoot,
  FileCheckbox,
} from '@stoked-ui/file-explorer/File';
import { FileIcon } from 'packages/sui-file-explorer/src/internals/FileIcon';
import { FileProvider } from 'packages/sui-file-explorer/src/internals/FileProvider';

const ITEMS = [
  {
    id: '1',
    label: 'Amelia Hart',
    children: [{ id: '2', label: 'Jane Fisher' }],
  },
  {
    id: '3',
    label: 'Bailey Monroe',
    children: [
      { id: '4', label: 'Freddie Reed' },
      {
        id: '5',
        label: 'Georgia Johnson',
        children: [{ id: '6', label: 'Samantha Malone' }],
      },
    ],
  },
];

const CustomTreeItemContent = styled(FileContent)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
}));

const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useFile({ id, itemId, children, label, disabled, rootRef: ref });

  return (
    <FileProvider itemId={itemId}>
      <FileRoot {...getRootProps(other)}>
        <CustomTreeItemContent {...getContentProps()}>
          <FileIconContainer {...getIconContainerProps()}>
            <FileIcon status={status} />
          </FileIconContainer>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Avatar
              sx={(theme) => ({
                background: theme.palette.primary.main,
                width: 24,
                height: 24,
                fontSize: '0.8rem',
              })}
            >
              {label[0]}
            </Avatar>
            <FileCheckbox {...getCheckboxProps()} />
            <FileLabel {...getLabelProps()} />
          </Box>
        </CustomTreeItemContent>
        {children && <FileGroupTransition {...getGroupTransitionProps()} />}
      </FileRoot>
    </FileProvider>
  );
});

CustomTreeItem.propTypes = {
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * The id attribute of the item. If not provided, it will be generated.
   */
  id: PropTypes.string,
  /**
   * The id of the item.
   * Must be unique.
   */
  itemId: PropTypes.string,
};

export default function HeadlessAPI() {
  return (
    <Box sx={{ minHeight: 200, minWidth: 250 }}>
      <FileExplorer
        defaultExpandedItems={['3']}
        items={ITEMS}
        slots={{ item: CustomTreeItem }}
      />
    </Box>
  );
}
