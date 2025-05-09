/**
 * Interface for the instance of the file explorer files handling.
 */
export interface UseFileExplorerFilesInstance {
  /**
   * Insert a new item in the state from a FileExplorer Item component.
   * @param {FileMeta} item The meta-information of the item to insert.
   * @returns {() => void} A function to remove the item from the state.
   */
  insertJSXItem: (item: FileMeta) => () => void;
  /**
   * Updates the `firstCharMap` to register the first character of the given item's label.
   * This map is used to navigate the fileExplorer using type-ahead search.
   * @param {FileId} id The id of the item to map the first character of.
   * @param {string} firstChar The first character of the item's label.
   * @returns {() => void} A function to remove the item from the `firstCharMap`.
   */
  mapFirstCharFromJSX: (id: FileId, firstChar: string) => () => void;
  /**
   * Store the ids of a given item's children in the state.
   * Those ids must be passed in the order they should be rendered.
   * @param {FileId | null} parentId The id of the item to store the children of.
   * @param {FileId[]} orderedChildrenIds The ids of the item's children.
   */
  setJSXItemsOrderedChildrenIds: (
    parentId: FileId | null,
    orderedChildrenIds: FileId[],
  ) => void;
}

/**
 * Interface for the parameters of the JSX items in the file explorer.
 */
export interface UseFileExplorerJSXItemsParameters {}

/**
 * Interface for the defaultized parameters of the file explorer files handling.
 */
export interface UseFileExplorerFilesDefaultizedParameters {}

/**
 * Type alias for the dependencies required by UseFileExplorerJSXItems.
 */
export type UseFileExplorerJSXItemsDependencies = [UseFileExplorerFilesSignature, UseFileExplorerDndSignature, UseFileExplorerKeyboardNavigationSignature, UseFileExplorerGridSignature];

/**
 * Type alias for the signature of UseFileExplorerJSXItems.
 */
export type UseFileExplorerJSXItemsSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerJSXItemsParameters;
  defaultizedParams: UseFileExplorerFilesDefaultizedParameters;
  instance: UseFileExplorerFilesInstance;
  dependencies: UseFileExplorerJSXItemsDependencies;
}>;
