import * as React from 'react';
import { FileExplorerPluginSignature } from '../../models/plugin.types';
import type { UseFileExplorerFilesSignature } from '../useFileExplorerFiles/useFileExplorerFiles.types';
import type { UseFileExplorerSelectionSignature } from '../useFileExplorerSelection/useFileExplorerSelection.types';
import { UseFileExplorerExpansionSignature } from '../useFileExplorerExpansion/useFileExplorerExpansion.types';
import { FileId } from '../../../models';
import { UseFileExplorerDndSignature } from '../useFileExplorerDnd/useFileExplorerDnd.types';

/**
 * Public API for focusing on items in the File Explorer.
 */
export interface UseFileExplorerFocusPublicAPI {
  /**
   * Focus the item with the given id.
   * @param {React.SyntheticEvent} event - The event source of the action.
   * @param {FileId} id - The id of the item to focus.
   */
  focusItem: (event: React.SyntheticEvent, id: string) => void;
}

/**
 * Instance interface extending the public API for focusing on items in the File Explorer.
 */
export interface UseFileExplorerFocusInstance extends UseFileExplorerFocusPublicAPI {
  /**
   * Check if an item is the currently focused item.
   * @param {FileId} id - The id of the item to check.
   * @returns {boolean} `true` if the item is focused, `false` otherwise.
   */
  isItemFocused: (id: FileId) => boolean;
  /**
   * Check if an item should be sequentially focusable (usually with the Tab key).
   * @param {FileId} id - The id of the item to check.
   * @returns {boolean} `true` if the item can be sequentially focusable, `false` otherwise.
   */
  canItemBeTabbed: (id: FileId) => boolean;
  /**
   * Remove the focus from the currently focused item.
   */
  removeFocusedItem: () => void;
}

/**
 * Parameters for the useFileExplorerFocus hook.
 */
export interface UseFileExplorerFocusParameters {
  /**
   * Callback fired when fileExplorer items are focused.
   * @param {React.SyntheticEvent} event - The event source of the callback.
   * @param {string} id - The id of the focused item.
   * @param {string} value - Value of the focused item.
   */
  onItemFocus?: (event: React.SyntheticEvent, id: string) => void;
}

/**
 * Defaultized parameters for the useFileExplorerFocus hook.
 */
export type UseFileExplorerFocusDefaultizedParameters = UseFileExplorerFocusParameters;

/**
 * State for the useFileExplorerFocus hook.
 */
export interface UseFileExplorerFocusState {
  focusedItemId: string | null;
}

/**
 * Signature for the useFileExplorerFocus hook.
 */
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