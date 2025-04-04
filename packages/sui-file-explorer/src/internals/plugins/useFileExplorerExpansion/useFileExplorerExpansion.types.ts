/**
 * The useFileExplorerExpansion hook provides a way to manage the expansion of file explorer items.
 */

export interface UseFileExplorerExpansionPublicAPI {
  /**
   * Change the expansion status of a given item.
   * @param {React.SyntheticEvent} event The UI event that triggered the change.
   * @param {string} id The id of the item to modify.
   * @param {boolean} isExpanded The new expansion status of the given item.
   */
  setItemExpansion: (event: React.SyntheticEvent, id: string, isExpanded: boolean) => void;
}

/**
 * The useFileExplorerExpansionInstance hook provides a way to interact with the file explorer expansion state.
 */
export interface UseFileExplorerExpansionInstance extends UseFileExplorerExpansionPublicAPI {
  /**
   * Check if an item is expanded.
   * @param {FileId} id The id of the item to check.
   * @returns {boolean} `true` if the item is expanded, `false` otherwise.
   */
  isItemExpanded: (id: FileId) => boolean;
  /**
   * Check if an item is expandable.
   * Currently, an item is expandable if it has children.
   * In the future, the user should be able to flag an item as expandable even if it has no loaded
   * children to support children lazy loading.
   * @param {FileId} id The id of the item to check.
   * @returns {boolean} `true` if the item can be expanded, `false` otherwise.
   */
  isItemExpandable: (id: FileId) => boolean;
  /**
   * Toggle the current expansion of an item.
   * If it is expanded, it will be collapsed, and vice versa.
   * @param {React.SyntheticEvent} event The UI event that triggered the change.
   * @param {FileId} id The id of the item to toggle.
   */
  toggleItemExpansion: (event: React.SyntheticEvent, id: FileId) => void;
  /**
   * Expand all the siblings (i.e.: the items that have the same parent) of a given item.
   * @param {React.KeyboardEvent} event The UI event that triggered the change.
   * @param {FileId} id The id of the item whose siblings will be expanded.
   */
  expandAllSiblings: (event: React.KeyboardEvent, id: FileId) => void;
}

/**
 * The useFileExplorerExpansionParameters hook provides a way to customize the file explorer expansion state.
 */
export interface UseFileExplorerExpansionParameters {
  /**
   * Expanded item ids.
   * Used when the item's expansion is controlled.
   */
  expandedItems?: string[];
  /**
   * Expanded item ids.
   * Used when the item's expansion is not controlled.
   * @default []
   */
  defaultExpandedItems?: string[];
  /**
   * Callback fired when fileExplorer items are expanded/collapsed.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} ids The ids of the expanded items.
   */
  onExpandedItemsChange?: (event: React.SyntheticEvent, ids: string[]) => void;
  /**
   * Callback fired when a fileExplorer item is expanded or collapsed.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} id The id of the lastModified item.
   * @param {array} isExpanded `true` if the item has just been expanded, `false` if it has just
   *   been collapsed.
   */
  onItemExpansionToggle?: (
    event: React.SyntheticEvent,
    id: string,
    isExpanded: boolean,
  ) => void;
  /**
   * The slot that triggers the item's expansion when clicked.
   * @default 'content'
   */
  expansionTrigger?: 'content' | 'iconContainer';
}

/**
 * The defaultized parameters for the useFileExplorerExpansion hook, excluding the `defaultExpandedItems` property.
 */
export type UseFileExplorerExpansionDefaultizedParameters = DefaultizedProps<
  UseFileExplorerExpansionParameters,
  'defaultExpandedItems'
>;

/**
 * The context value for the useFileExplorerExpansion hook, containing the expansion trigger.
 */
interface UseFileExplorerExpansionContextValue {
  expansion: Pick<UseFileExplorerExpansionParameters, 'expansionTrigger'>;
}

/**
 * The signature of the useFileExplorerExpansion hook, including its parameters and dependencies.
 */
export type UseFileExplorerExpansionSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerExpansionParameters;
  defaultizedParams: UseFileExplorerExpansionDefaultizedParameters;
  instance: UseFileExplorerExpansionInstance;
  publicAPI: UseFileExplorerExpansionPublicAPI;
  modelNames: 'expandedItems';
  contextValue: UseFileExplorerExpansionContextValue;
  dependencies: [UseFileExplorerFilesSignature];
}>;