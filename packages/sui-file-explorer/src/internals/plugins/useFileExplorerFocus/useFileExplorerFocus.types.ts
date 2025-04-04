/**
 * @interface UseFileExplorerFocusPublicAPI
 * @description Provides a public API to focus an item in the File Explorer.
 */
export interface UseFileExplorerFocusPublicAPI {
  /**
   * Focuses the item with the given id.
   *
   * If the item is the child of a collapsed item, then this method will do nothing.
   * Make sure to expand the ancestors of the item before calling this method if needed.
   *
   * @param {React.SyntheticEvent} event - The event source of the action.
   * @param {FileId} id - The id of the item to focus.
   */
  focusItem: (event: React.SyntheticEvent, id: string) => void;
}

/**
 * @interface UseFileExplorerFocusInstance
 * @description Provides an instance for managing focus state and events in the File Explorer.
 */
export interface UseFileExplorerFocusInstance extends UseFileExplorerFocusPublicAPI {
  /**
   * Checks if an item is the currently focused item.
   *
   * @param {FileId} id - The id of the item to check.
   * @returns {boolean} `true` if the item is focused, `false` otherwise.
   */
  isItemFocused: (id: FileId) => boolean;

  /**
   * Checks if an item should be sequentially focusable (usually with the Tab key).
   *
   * @param {FileId} id - The id of the item to check.
   * @returns {boolean} `true` if the item can be sequentially focusable, `false` otherwise.
   */
  canItemBeTabbed: (id: FileId) => boolean;

  /**
   * Removes the focus from the currently focused item (both from the internal state and the DOM).
   */
  removeFocusedItem: () => void;
}

/**
 * @interface UseFileExplorerFocusParameters
 * @description Provides parameters for customizing the behavior of focus events in the File Explorer.
 */
export interface UseFileExplorerFocusParameters {
  /**
   * Callback fired when fileExplorer items are focused.
   *
   * **Warning**: This is a generic event not a focus event.
   *
   * @param {React.SyntheticEvent} event - The event source of the callback.
   * @param {string} id - The id of the focused item.
   */
  onItemFocus?: (event: React.SyntheticEvent, id: string) => void;
}

/**
 * @type UseFileExplorerFocusParameters
 * @description Defaultized parameters for focus events in the File Explorer.
 */
export type UseFileExplorerFocusDefaultizedParameters = UseFileExplorerFocusParameters;

/**
 * @interface UseFileExplorerFocusState
 * @description Provides state for managing focus information in the File Explorer.
 */
export interface UseFileExplorerFocusState {
  /**
   * The id of the currently focused item, or null if no item is focused.
   */
  focusedItemId: string | null;
}

/**
 * @type {UseFileExplorerFocusSignature}
 * @description Signature for the useFileExplorerFocus hook.
 */
export type UseFileExplorerFocusSignature = FileExplorerPluginSignature<{
  /**
   * Parameters for customizing focus behavior in the File Explorer.
   */
  params: UseFileExplorerFocusParameters;

  /**
   * Defaultized parameters for focus events in the File Explorer.
   */
  defaultizedParams: UseFileExplorerFocusDefaultizedParameters;

  /**
   * An instance for managing focus state and events in the File Explorer.
   */
  instance: UseFileExplorerFocusInstance;

  /**
   * Public API to interact with the focused item in the File Explorer.
   */
  publicAPI: UseFileExplorerFocusPublicAPI;

  /**
   * The current focus state of the File Explorer.
   */
  state: UseFileExplorerFocusState;

  /**
   * Dependencies for the useFileExplorerFocus hook.
   */
  dependencies: [
    UseFileExplorerFilesSignature,
    UseFileExplorerDndSignature,
    UseFileExplorerSelectionSignature,
    UseFileExplorerExpansionSignature,
  ];
}>;