/**
 * @fileoverview This file exports interfaces and types related to the use of a keyboard navigation instance in a file explorer.
 */

import * as React from 'react';

import type {FileExplorerPluginSignature} from '../../models';
import type {
  UseFileExplorerFilesSignature
} from '../useFileExplorerFiles/useFileExplorerFiles.types';
import type {
  UseFileExplorerSelectionSignature
} from '../useFileExplorerSelection/useFileExplorerSelection.types';
import type {
  UseFileExplorerFocusSignature
} from '../useFileExplorerFocus/useFileExplorerFocus.types';
import type {
  UseFileExplorerExpansionSignature
} from '../useFileExplorerExpansion/useFileExplorerExpansion.types';
import type {
  UseFileExplorerDndSignature
} from '../useFileExplorerDnd/useFileExplorerDnd.types';

/**
 * Interface for a keyboard navigation instance.
 */
export interface UseFileExplorerKeyboardNavigationInstance {
  /**
   * Updates the `firstCharMap` to add/remove the first character of some item's labels.
   * This map is used to navigate the fileExplorer using type-ahead search.
   * This method is only used by the `useFileExplorerJSXItems` plugin, otherwise the updates are
   * handled internally.
   * @param {(map: FileExplorerFirstCharMap) => FileExplorerFirstCharMap} updater The function to
   *   update the map.
   */
  updateFirstCharMap: (updater: (map: FileExplorerFirstCharMap) => FileExplorerFirstCharMap) => void;

  /**
   * Callback fired when a key is pressed on an item.
   * Handles all the keyboard navigation logic.
   * @param {React.KeyboardEvent<HTMLElement> & MuiCancellableEvent} event The keyboard event that
   *   triggered the callback.
   * @param {FileId} id The id of the item that the event was triggered on.
   */
  handleItemKeyDown: (
    event: React.KeyboardEvent<HTMLElement> & MuiCancellableEvent,
    id: FileId,
  ) => void;
}

/**
 * Type for a keyboard navigation signature, which includes an instance and dependencies.
 */
export type UseFileExplorerKeyboardNavigationSignature = FileExplorerPluginSignature<{
  /**
   * The instance of the keyboard navigation.
   */
  instance: UseFileExplorerKeyboardNavigationInstance;

  /**
   * Dependencies required by the keyboard navigation.
   */
  dependencies: [
    UseFileExplorerFilesSignature,
    UseFileExplorerSelectionSignature,
    UseFileExplorerFocusSignature,
    UseFileExplorerExpansionSignature,
    UseFileExplorerDndSignature
  ];
}>;

/**
 * Type for a first char map, which maps item IDs to their first characters.
 */
export type FileExplorerFirstCharMap = { [id: string]: string };