import type {EditorPluginSignature} from '../../models';
import type {UseEditorMetadataSignature} from '../useEditorMetadata/useEditorMetadata.types';
import {MuiCancellableEvent} from '../../models/MuiCancellableEvent';

/**
 * Interface for the instance of the keyboard functionality in the editor.
 */
export interface UseEditorKeyboardInstance {
  /**
   * Updates the `firstCharMap` to add/remove the first character of some item's labels.
   * This map is used to navigate the editor using type-ahead search.
   * This method is only used by the `useEditorJSXItems` plugin, otherwise the updates are handled
   * internally.
   * @param {(map: EditorFirstCharMap) => EditorFirstCharMap} updater The function to update the map.
   */
  updateFirstCharMap: (updater: (map: EditorFirstCharMap) => EditorFirstCharMap) => void;
  
  /**
   * Callback fired when a key is pressed on an item.
   * Handles all the keyboard navigation logic.
   * @param {React.KeyboardEvent<HTMLElement> & MuiCancellableEvent} event The keyboard event that triggered the callback.
   * @param {string} type The type of the item.
   * @param {any} item The item on which the key was pressed.
   */
  handleItemKeyDown: (
    event: KeyboardEvent,
    type: string,
    item: any
  ) => void;
}

/**
 * Signature for the keyboard plugin in the editor.
 */
export type UseEditorKeyboardSignature = EditorPluginSignature<{
  instance: UseEditorKeyboardInstance;
  dependencies: [
    UseEditorMetadataSignature,
  ];
}>;

/**
 * Represents a map where the keys are item IDs and the values are the first characters of the item labels.
 */
export type EditorFirstCharMap = { [itemId: string]: string };