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
  FileIcon,
  FileProvider,
} from '@stoked-ui/file-explorer';

const ITEMS = [
  {
    id: '1',
    name: 'Amelia Hart',
    children: [{ id: '2', name: 'Jane Fisher' }],
  },
  {
    id: '3',
    name: 'Bailey Monroe',
    children: [
      { id: '4', name: 'Freddie Reed' },
      {
        id: '5',
        name: 'Georgia Johnson',
        children: [{ id: '6', name: 'Samantha Malone' }],
      },
    ],
  },
];

const CustomTreeItemContent = styled(FileContent)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
}));

const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
  const { id, itemId, name, disabled, children, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useFile({ id, itemId, children, name, disabled, rootRef: ref });

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
              {name[0]}
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
  name: PropTypes.string,
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
