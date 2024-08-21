import * as React from 'react';
import type { EditorPluginSignature } from '../../models';
import type { UseEditorMetadataSignature } from '../useEditorMetadata/useEditorMetadata.types';
import { MuiCancellableEvent } from '../../models/MuiCancellableEvent';
import { FileId } from '../../../models';

export interface UseEditorKeyboardInstance {
  /**
   * Updates the `firstCharMap` to add/remove the first character of some item's labels.
   * This map is used to navigate the editor using type-ahead search.
   * This method is only used by the `useEditorJSXItems` plugin, otherwise the updates are handled internally.
   * @param {(map: EditorFirstCharMap) => EditorFirstCharMap} updater The function to update the map.
   */
  updateFirstCharMap: (updater: (map: EditorFirstCharMap) => EditorFirstCharMap) => void;
  /**
   * Callback fired when a key is pressed on an item.
   * Handles all the keyboard navigation logic.
   * @param {React.KeyboardEvent<HTMLElement> & MuiCancellableEvent} event The keyboard event that triggered the callback.
   */
  handleItemKeyDown: (
    event: KeyboardEvent,
    type: string,
    item: any
  ) => void;
}

export type UseEditorKeyboardSignature = EditorPluginSignature<{
  instance: UseEditorKeyboardInstance;
  dependencies: [
    UseEditorMetadataSignature,
  ];
}>;

export type EditorFirstCharMap = { [itemId: string]: string };
