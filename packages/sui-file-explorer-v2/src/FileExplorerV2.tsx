import * as React from 'react';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { CustomTreeItem } from './CustomTreeItem';
import { FileExplorerV2Props } from './types';

export function FileExplorerV2(props: FileExplorerV2Props) {
  const {
    items,
    defaultExpandedItems,
    defaultSelectedItems,
    sx,
    itemChildrenIndentation = 24,
    ...other
  } = props;

  return (
    <RichTreeView
      items={items}
      defaultExpandedItems={defaultExpandedItems}
      defaultSelectedItems={defaultSelectedItems}
      sx={{ height: 'fit-content', flexGrow: 1, maxWidth: 400, overflowY: 'auto', ...sx }}
      slots={{ item: CustomTreeItem }}
      itemChildrenIndentation={itemChildrenIndentation}
      {...other}
    />
  );
}
