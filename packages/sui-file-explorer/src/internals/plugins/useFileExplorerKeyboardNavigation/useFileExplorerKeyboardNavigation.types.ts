import * as React from 'react';
import type { FileExplorerPluginSignature } from '../../models';
import type { UseFileExplorerFilesSignature } from '../useFileExplorerFiles/useFileExplorerFiles.types';
import type { UseFileExplorerSelectionSignature } from '../useFileExplorerSelection/useFileExplorerSelection.types';
import type { UseFileExplorerFocusSignature } from '../useFileExplorerFocus/useFileExplorerFocus.types';
import type { UseFileExplorerExpansionSignature } from '../useFileExplorerExpansion/useFileExplorerExpansion.types';
import { MuiCancellableEvent } from '../../models/MuiCancellableEvent';
import { FileId } from '../../../models';
import type { UseFileExplorerDndSignature } from '../useFileExplorerDnd/useFileExplorerDnd.types';

export interface UseFileExplorerKeyboardNavigationInstance {
  /**
   * Updates the `firstCharMap` to add/remove the first character of some item's labels.
   * This map is used to navigate the fileExplorer using type-ahead search.
   * This method is only used by the `useFileExplorerJSXItems` plugin, otherwise the updates are handled internally.
   * @param {(map: FileExplorerFirstCharMap) => FileExplorerFirstCharMap} updater The function to update the map.
   */
  updateFirstCharMap: (updater: (map: FileExplorerFirstCharMap) => FileExplorerFirstCharMap) => void;
  /**
   * Callback fired when a key is pressed on an item.
   * Handles all the keyboard navigation logic.
   * @param {React.KeyboardEvent<HTMLElement> & MuiCancellableEvent} event The keyboard event that triggered the callback.
   * @param {FileId} itemId The id of the item that the event was triggered on.
   */
  handleItemKeyDown: (
    event: React.KeyboardEvent<HTMLElement> & MuiCancellableEvent,
    itemId: FileId,
  ) => void;
}

export type UseFileExplorerKeyboardNavigationSignature = FileExplorerPluginSignature<{
  instance: UseFileExplorerKeyboardNavigationInstance;
  dependencies: [
    UseFileExplorerFilesSignature,
    UseFileExplorerSelectionSignature,
    UseFileExplorerFocusSignature,
    UseFileExplorerExpansionSignature,
    UseFileExplorerDndSignature
  ];
}>;

export type FileExplorerFirstCharMap = { [itemId: string]: string };
