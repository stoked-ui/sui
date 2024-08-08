import * as React from 'react';
import { FileExplorerPluginSignature } from '../../models/plugin.types';
import type {
  UseFileExplorerFilesSignature
} from '../useFileExplorerFiles/useFileExplorerFiles.types';
import type {
  UseFileExplorerSelectionSignature
} from '../useFileExplorerSelection/useFileExplorerSelection.types';
import {
  UseFileExplorerExpansionSignature
} from '../useFileExplorerExpansion/useFileExplorerExpansion.types';
import { FileId } from '../../../models';
import { UseFileExplorerDndSignature } from '../useFileExplorerDnd/useFileExplorerDnd.types';

export interface UseFileExplorerFocusPublicAPI {
  /**
   * Focus the item with the given id.
   *
   * If the item is the child of a collapsed item, then this method will do nothing.
   * Make sure to expand the ancestors of the item before calling this method if needed.
   * @param {React.SyntheticEvent} event The event source of the action.
   * @param {FileId} itemId The id of the item to focus.
   */
  focusItem: (event: React.SyntheticEvent, itemId: string) => void;
}

export interface UseFileExplorerFocusInstance extends UseFileExplorerFocusPublicAPI {

  /**
   * Check if an item is the currently focused item.
   * @param {FileId} itemId The id of the item to check.
   * @returns {boolean} `true` if the item is focused, `false` otherwise.
   */
  isItemFocused: (itemId: FileId) => boolean;
  /**
   * Check if an item should be sequentially focusable (usually with the Tab key).
   * At any point in time, there is a single item that can be sequentially focused in the FileExplorer View.
   * This item is the first selected item (that is both visible and navigable), if any, or the first navigable item if no item is selected.
   * @param {FileId} itemId The id of the item to check.
   * @returns {boolean} `true` if the item can be sequentially focusable, `false` otherwise.
   */
  canItemBeTabbed: (itemId: FileId) => boolean;
  /**
   * Remove the focus from the currently focused item (both from the internal state and the DOM).
   */
  removeFocusedItem: () => void;
}

export interface UseFileExplorerFocusParameters {
  /**
   * Callback fired when fileExplorer items are focused.
   * @param {React.SyntheticEvent} event The event source of the callback **Warning**: This is a generic event not a focus event.
   * @param {string} itemId The id of the focused item.
   * @param {string} value of the focused item.
   */
  onItemFocus?: (event: React.SyntheticEvent, itemId: string) => void;
}

export type UseFileExplorerFocusDefaultizedParameters = UseFileExplorerFocusParameters;

export interface UseFileExplorerFocusState {
  focusedItemId: string | null;
}

export type UseFileExplorerFocusSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerFocusParameters;
  defaultizedParams: UseFileExplorerFocusDefaultizedParameters;
  instance: UseFileExplorerFocusInstance;
  publicAPI: UseFileExplorerFocusPublicAPI;
  state: UseFileExplorerFocusState;
  dependencies: [
    UseFileExplorerFilesSignature,
    UseFileExplorerDndSignature,
    UseFileExplorerSelectionSignature,
    UseFileExplorerExpansionSignature,
  ];
}>;
