/**
 * @interface UseEditorKeyboardInstance
 * 
 * Interface for use of the keyboard plugin in the editor.
 */
export interface UseEditorKeyboardInstance {
  /**
   * Updates the `firstCharMap` to add/remove the first character of some item's labels.
   * This map is used to navigate the editor using type-ahead search.
   * This method is only used by the `useEditorJSXItems` plugin, otherwise the updates are handled
   * internally.
   * @param {(map: EditorFirstCharMap) => EditorFirstCharMap} updater The function to update the
   *   map.
   */
  updateFirstCharMap: (updater: (map: EditorFirstCharMap) => EditorFirstCharMap) => void;

  /**
   * Callback fired when a key is pressed on an item.
   * Handles all the keyboard navigation logic.
   * @param {React.KeyboardEvent<HTMLElement> & MuiCancellableEvent} event The keyboard event that
   *   triggered the callback.
   */
  handleItemKeyDown: (
    event: KeyboardEvent,
    type: string,
    item: any
  ) => void;
}

/**
 * @interface UseEditorKeyboardSignature
 * 
 * Interface for use of the keyboard plugin in the editor, including its signature.
 */
export type UseEditorKeyboardSignature = EditorPluginSignature<{
  instance: UseEditorKeyboardInstance;
  dependencies: [
    UseEditorMetadataSignature,
  ];
}>;

/**
 * @type {EditorFirstCharMap}
 * Type definition for the first character map used by the keyboard plugin.
 */
export type EditorFirstCharMap = { [itemId: string]: string };