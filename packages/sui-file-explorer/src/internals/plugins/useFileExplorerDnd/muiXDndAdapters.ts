/**
 * MUI X TreeView DnD Adapters
 *
 * Work Item 2.1: MUI X itemsReordering Integration
 *
 * This module provides adapter functions that bridge MUI X RichTreeView's built-in
 * drag-and-drop API (itemsReordering) to the FileExplorer plugin system.
 *
 * MUI X DnD API:
 * - itemsReordering: boolean prop to enable DnD
 * - onItemPositionChange: callback fired when item position changes
 * - isItemReorderable: predicate to determine if item can be dragged
 * - canMoveItemToNewPosition: validator to determine if drop is allowed
 */

import type { FileBase } from '../../../models';

/**
 * Parameters passed to onItemPositionChange callback
 * From MUI X RichTreeView API
 */
export interface ItemPositionChangeParams {
  itemId: string;
  oldPosition: number;
  newPosition: number;
  oldParentId: string | null;
  newParentId: string | null;
}

/**
 * Parameters passed to canMoveItemToNewPosition predicate
 * From MUI X RichTreeView API
 */
export interface CanMoveItemParams {
  itemId: string;
  oldPosition: number;
  newPosition: number;
  oldParentId: string | null;
  newParentId: string | null;
}

/**
 * FileExplorer DnD Instance Methods
 * These are the methods we'll call from the adapters
 */
export interface FileExplorerDndInstance {
  getItem: (id: string) => FileBase;
  dndInternalEnabled: () => boolean;
  dropInternal?: (params: ItemPositionChangeParams | any) => void;
}

/**
 * Creates onItemPositionChange handler for MUI X RichTreeView
 *
 * AC-2.1.c: When user drops on valid target → onItemPositionChange fires with correct parameters
 *
 * @param instance - FileExplorer instance with DnD methods
 * @returns Callback function for MUI X onItemPositionChange prop
 */
export function createOnItemPositionChangeHandler(
  instance: FileExplorerDndInstance
) {
  return (params: ItemPositionChangeParams) => {
    // Only process if internal DnD is enabled
    if (!instance.dndInternalEnabled()) {
      return;
    }

    // Forward to DnD plugin's dropInternal method
    // This will trigger the existing FileExplorer DnD logic
    if (instance.dropInternal) {
      instance.dropInternal(params);
    }
  };
}

/**
 * Creates isItemReorderable predicate for MUI X RichTreeView
 *
 * AC-2.1.d: When isItemReorderable returns false → item cannot be dragged
 *
 * @param instance - FileExplorer instance with DnD methods
 * @returns Predicate function for MUI X isItemReorderable prop
 */
export function createIsItemReorderableHandler(
  instance: FileExplorerDndInstance
) {
  return (itemId: string): boolean => {
    // Only allow reordering if internal DnD is enabled
    if (!instance.dndInternalEnabled()) {
      return false;
    }

    // Get the item to check its properties
    const item = instance.getItem(itemId);
    if (!item) {
      return false;
    }

    // Allow all items to be dragged for now
    // In future phases, we can add more sophisticated logic:
    // - Check item.draggable property
    // - Block system items (trash, etc.)
    // - Check user permissions
    return true;
  };
}

/**
 * Creates canMoveItemToNewPosition validator for MUI X RichTreeView
 *
 * AC-2.1.e: When canMoveItemToNewPosition returns false → drop rejected with visual feedback
 *
 * @param instance - FileExplorer instance with DnD methods
 * @returns Validator function for MUI X canMoveItemToNewPosition prop
 */
export function createCanMoveItemToNewPositionHandler(
  instance: FileExplorerDndInstance
) {
  return (params: CanMoveItemParams): boolean => {
    // Only allow drops if internal DnD is enabled
    if (!instance.dndInternalEnabled()) {
      return false;
    }

    const { itemId, newParentId } = params;

    // Get the items to validate the move
    const item = instance.getItem(itemId);
    const targetParent = newParentId ? instance.getItem(newParentId) : null;

    if (!item) {
      return false;
    }

    // If dropping at root level (newParentId is null), allow it
    if (!newParentId) {
      return true;
    }

    // If target parent doesn't exist, reject
    if (!targetParent) {
      return false;
    }

    // Allow drops into folders or trash
    // Files cannot accept children
    const canAcceptChildren = ['folder', 'trash'].includes(targetParent.type || '');

    if (!canAcceptChildren) {
      return false;
    }

    // Prevent dropping an item into itself or its descendants
    // This would create a circular hierarchy
    if (isDescendantOf(itemId, newParentId, instance)) {
      return false;
    }

    return true;
  };
}

/**
 * Helper function to check if targetId is a descendant of itemId
 * Prevents circular hierarchy issues
 *
 * @param itemId - The item being dragged
 * @param targetId - The potential parent
 * @param instance - FileExplorer instance
 * @returns true if targetId is a descendant of itemId
 */
function isDescendantOf(
  itemId: string,
  targetId: string,
  instance: FileExplorerDndInstance
): boolean {
  if (itemId === targetId) {
    return true;
  }

  const targetItem = instance.getItem(targetId);
  if (!targetItem || !targetItem.children || targetItem.children.length === 0) {
    return false;
  }

  // Check all children recursively
  for (const child of targetItem.children) {
    if (typeof child === 'string') {
      if (child === itemId) {
        return true;
      }
    } else if (child.id === itemId) {
      return true;
    } else if (child.children && child.children.length > 0) {
      if (isDescendantOf(itemId, child.id, instance)) {
        return true;
      }
    }
  }

  return false;
}
