import { TreeViewBaseItem } from '@mui/x-tree-view/models';

export type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash';

export type ExtendedTreeItemProps = {
  fileType?: FileType;
  id: string;
  label: string;
};

export type FileItem = {
  fileType: FileType;
  id: string;
  label: string;
  children?: FileItem[];
};

export interface FileExplorerV2Props {
  items: TreeViewBaseItem<ExtendedTreeItemProps>[];
  defaultExpandedItems?: string[];
  defaultSelectedItems?: string;
  sx?: Record<string, unknown>;
  itemChildrenIndentation?: number;
}

/**
 * Position descriptor for an item during a reorder operation.
 * Mirrors the shape from `@mui/x-tree-view-pro` internal types.
 */
export interface TreeViewItemReorderPosition {
  parentId: string | null;
  index: number;
}

export interface FileExplorerV2ProProps {
  /** The tree items — every item MUST have a `fileType`. */
  items: FileItem[];
  defaultExpandedItems?: string[];
  defaultSelectedItems?: string;
  sx?: Record<string, unknown>;
  itemChildrenIndentation?: number;
  /**
   * Custom validator that decides whether an item can be dropped at a new position.
   * When omitted the default validator is used which only allows drops into
   * root, folders, or trash.
   */
  canMoveItemToNewPosition?: (params: {
    itemId: string;
    oldPosition: TreeViewItemReorderPosition;
    newPosition: TreeViewItemReorderPosition;
  }) => boolean;
  /**
   * Callback fired when an item is moved to a new position.
   */
  onItemPositionChange?: (params: {
    itemId: string;
    oldPosition: TreeViewItemReorderPosition;
    newPosition: TreeViewItemReorderPosition;
  }) => void;
  /**
   * Optional callback to determine if a given item can be dragged at all.
   */
  isItemReorderable?: (itemId: string) => boolean;
}
