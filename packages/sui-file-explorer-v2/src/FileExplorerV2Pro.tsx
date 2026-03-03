import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import FolderRounded from '@mui/icons-material/FolderRounded';
import { RichTreeViewPro } from '@mui/x-tree-view-pro/RichTreeViewPro';
import { useTreeItem2, UseTreeItem2Parameters } from '@mui/x-tree-view/useTreeItem2';
import {
  TreeItem2Checkbox,
  TreeItem2Content,
  TreeItem2GroupTransition,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Root,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeItem2DragAndDropOverlay } from '@mui/x-tree-view/TreeItem2DragAndDropOverlay';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import type { FileItem, FileExplorerV2ProProps, TreeViewItemReorderPosition } from './types';
import { getIconFromFileType, DotIcon } from './icons';

// ---------------------------------------------------------------------------
// Styled components (matching the base CustomTreeItem look)
// ---------------------------------------------------------------------------

const StyledTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  color: theme.palette.grey[400],
  ...theme.applyStyles('light', {
    color: theme.palette.grey[800],
  }),
})) as typeof TreeItem2Root;

const StyledTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  padding: theme.spacing(0.5),
  paddingRight: theme.spacing(1),
  borderRadius: theme.spacing(0.7),
  marginBottom: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  fontWeight: 500,
  [`&[data-focused], &[data-selected]`]: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    ...theme.applyStyles('light', {
      backgroundColor: theme.palette.primary.main,
    }),
  },
  '&:not([data-focused], [data-selected]):hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: 'white',
    ...theme.applyStyles('light', {
      color: theme.palette.primary.main,
    }),
  },
})) as typeof TreeItem2Content;

const TreeItemLabelText = styled(Typography)({
  color: 'inherit',
  fontFamily: 'General Sans',
  fontWeight: 500,
});

// ---------------------------------------------------------------------------
// CustomLabel (shared label rendering)
// ---------------------------------------------------------------------------

interface CustomLabelProps {
  children: React.ReactNode;
  icon?: React.ElementType;
  expandable?: boolean;
}

function CustomLabel({
  icon: Icon,
  expandable,
  children,
  ...other
}: CustomLabelProps) {
  return (
    <TreeItem2Label
      {...other}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {Icon && (
        <Box
          component={Icon}
          className="labelIcon"
          color="inherit"
          sx={{ mr: 1, fontSize: '1.2rem' }}
        />
      )}
      <TreeItemLabelText variant="body2">{children}</TreeItemLabelText>
      {expandable && <DotIcon />}
    </TreeItem2Label>
  );
}

// ---------------------------------------------------------------------------
// CustomTreeItemPro — uses TreeItem2GroupTransition (no react-spring)
// ---------------------------------------------------------------------------

interface CustomTreeItemProProps
  extends
    Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const CustomTreeItemPro = React.forwardRef(function CustomTreeItemPro(
  props: CustomTreeItemProProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    getDragAndDropOverlayProps,
    status,
    publicAPI,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  const item = publicAPI.getItem(itemId) as FileItem;

  let icon: React.ElementType | undefined;
  if (status.expandable) {
    icon = FolderRounded;
  } else if (item.fileType) {
    icon = getIconFromFileType(item.fileType);
  }

  return (
    <TreeItem2Provider itemId={itemId}>
      <StyledTreeItemRoot {...getRootProps(other)}>
        <StyledTreeItemContent {...getContentProps()}>
          <TreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} />
          </TreeItem2IconContainer>
          <TreeItem2Checkbox {...getCheckboxProps()} />
          <CustomLabel
            {...getLabelProps({
              icon,
              expandable: status.expandable && status.expanded,
            })}
          />
          <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </StyledTreeItemContent>
        {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
      </StyledTreeItemRoot>
    </TreeItem2Provider>
  );
});

// ---------------------------------------------------------------------------
// Default canMoveItemToNewPosition
// ---------------------------------------------------------------------------

/**
 * Default reorder-position validator for the file explorer.
 *
 * Allows drops when:
 * - the target parent is the root (parentId === null), OR
 * - the target parent's `fileType` is `'folder'` or `'trash'`.
 *
 * The function receives `allItems` so it can look up the parent's metadata.
 */
export function defaultCanMoveItemToNewPosition(
  allItems: FileItem[],
  params: {
    itemId: string;
    oldPosition: TreeViewItemReorderPosition;
    newPosition: TreeViewItemReorderPosition;
  },
): boolean {
  const { newPosition } = params;

  // Drops at root level are always allowed
  if (newPosition.parentId === null) {
    return true;
  }

  // Look up the parent item in the flat-or-nested tree
  const parent = findItemById(allItems, newPosition.parentId);
  if (!parent) {
    return false;
  }

  return parent.fileType === 'folder' || parent.fileType === 'trash';
}

/** Recursively search a nested FileItem[] for an item by id. */
function findItemById(items: FileItem[], targetId: string): FileItem | undefined {
  for (const item of items) {
    if (item.id === targetId) {
      return item;
    }
    if (item.children) {
      const found = findItemById(item.children, targetId);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// FileExplorerV2Pro Component
// ---------------------------------------------------------------------------

export function FileExplorerV2Pro(props: FileExplorerV2ProProps) {
  const {
    items,
    defaultExpandedItems,
    defaultSelectedItems,
    sx,
    itemChildrenIndentation = 24,
    canMoveItemToNewPosition: canMoveItemToNewPositionProp,
    onItemPositionChange,
    isItemReorderable,
    ...other
  } = props;

  const apiRef = useTreeViewApiRef();

  const canMoveItemToNewPosition = React.useCallback(
    (params: {
      itemId: string;
      oldPosition: TreeViewItemReorderPosition;
      newPosition: TreeViewItemReorderPosition;
    }) => {
      if (canMoveItemToNewPositionProp) {
        return canMoveItemToNewPositionProp(params);
      }
      return defaultCanMoveItemToNewPosition(items, params);
    },
    [canMoveItemToNewPositionProp, items],
  );

  return (
    <RichTreeViewPro
      items={items}
      apiRef={apiRef}
      defaultExpandedItems={defaultExpandedItems}
      defaultSelectedItems={defaultSelectedItems}
      sx={{ height: 'fit-content', flexGrow: 1, maxWidth: 400, overflowY: 'auto', ...sx }}
      slots={{ item: CustomTreeItemPro as React.JSXElementConstructor<any> }}
      itemChildrenIndentation={itemChildrenIndentation}
      itemsReordering
      experimentalFeatures={{ itemsReordering: true }}
      canMoveItemToNewPosition={canMoveItemToNewPosition}
      onItemPositionChange={onItemPositionChange}
      isItemReorderable={isItemReorderable}
      {...other}
    />
  );
}
