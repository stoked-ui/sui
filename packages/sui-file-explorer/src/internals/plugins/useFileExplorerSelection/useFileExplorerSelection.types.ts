/**
 * UseFileExplorerSelection API
 *
 * The UseFileExplorerSelection hook provides a selection API for the File Explorer component.
 * It allows you to select or deselect items, check if an item is selected, and update the selection
 * when navigating with keyboard navigation.
 */

export interface UseFileExplorerSelectionPublicAPI {
  /**
   * Select or deselect an item.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {string} id The id of the item to select or deselect.
   * @param {boolean} keepExistingSelection If `true`, don't remove the other selected items.
   * @param {boolean | undefined} newValue The new selection status of the item. If not defined,
   *   the new state will be the opposite of the current state.
   */
  selectItem: (params: {
    event: React.SyntheticEvent, id: string, keepExistingSelection?: boolean, newValue?: boolean,
  }) => void;
}

export interface UseFileExplorerSelectionInstance {
  /**
   * Check if an item is selected.
   * @param {string} id The id of the item to check.
   * @returns {boolean} `true` if the item is selected, `false` otherwise.
   */
  isSelected: (id: string) => boolean;

  /**
   * Get all selected items.
   * @returns {string[]}
   */
  getSelectedItems: () => string[];

  /**
   * Deselect an item.
   * @param {string} id The id of the item to deselect.
   */
  deselectItem: (id: string) => void;

  /**
   * Select multiple items.
   * @param {string[]} ids The ids of the items to select.
   */
  selectItems: (ids: string[]) => void;
}

type FileExplorerSelectionValue<Multiple extends boolean | undefined> = Multiple extends true
  ? string[]
  : string | null;

/**
 * UseFileExplorerSelection parameters
 *
 * The UseFileExplorerSelectionParameters object contains options for the selection API.
 */
export interface UseFileExplorerSelectionParameters<Multiple extends boolean | undefined> {
  /**
   * If `true` selection is disabled.
   * @default false
   */
  disableSelection?: boolean;

  /**
   * Selected item ids. (Uncontrolled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   * @default []
   */
  defaultSelectedItems?: FileExplorerSelectionValue<Multiple>;

  /**
   * Selected item ids. (Controlled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   */
  selectedItems?: FileExplorerSelectionValue<Multiple>;

  /**
   * If `true`, `ctrl` and `shift` will trigger multiselect.
   * @default false
   */
  multiSelect?: Multiple;

  /**
   * If `true`, the fileExplorer view renders a checkbox at the left of its label that allows
   * selecting it.
   * @default false
   */
  checkboxSelection?: boolean;

  /**
   * Callback fired when fileExplorer items are selected/deselected.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {string[] | string} ids The ids of the selected items.
   * When `multiSelect` is `true`, this is an array of strings; when false (default) a string.
   */
  onSelectedItemsChange?: (
    event: React.SyntheticEvent,
    ids: FileExplorerSelectionValue<Multiple>,
  ) => void;

  /**
   * Callback fired when a fileExplorer item is selected or deselected.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} id The id of the lastModified item.
   * @param {boolean} isSelected `true` if the item has just been selected, `false` if it has just
   *   been deselected.
   */
  onItemSelectionToggle?: (
    event: React.SyntheticEvent,
    id: string,
    isSelected: boolean,
  ) => void;
}

export type UseFileExplorerSelectionDefaultizedParameters<Multiple extends boolean> = DefaultizedProps<
  UseFileExplorerSelectionParameters<Multiple>,
  'disableSelection' | 'defaultSelectedItems' | 'multiSelect' | 'checkboxSelection'
>;

/**
 * UseFileExplorerSelection context value
 *
 * The UseFileExplorerSelectionContextValue object contains the current selection state.
 */
interface UseFileExplorerSelectionContextValue {
  /**
   * Selection settings.
   */
  selection: Pick<
    UseFileExplorerSelectionDefaultizedParameters<boolean>,
    'multiSelect' | 'checkboxSelection' | 'disableSelection'
  >;
}

/**
 * UseFileExplorerSelection signature
 *
 * The UseFileExplorerSelectionSignature object contains all the hooks for the File Explorer component.
 */
export type UseFileExplorerSelectionSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerSelectionParameters<any>;
  defaultizedParams: UseFileExplorerSelectionDefaultizedParameters<any>;
  instance: UseFileExplorerSelectionInstance;
  contextValue: UseFileExplorerSelectionContextValue;
  modelNames: 'selectedItems';
  publicAPI: UseFileExplorerSelectionPublicAPI,
  dependencies: [
    UseFileExplorerFilesSignature,
    UseFileExplorerExpansionSignature,
  ];
}>;