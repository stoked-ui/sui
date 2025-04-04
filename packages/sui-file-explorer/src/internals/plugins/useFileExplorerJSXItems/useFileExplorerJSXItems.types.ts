/**
 * @file UseFileExplorerFiles.ts
 * @description Provides the useFileExplorerFiles hook for managing file explorer items.
 */

import { FileId } from '../../../models';
import { FileMeta } from '../../models';

/**
 * @interface UseFileExplorerFilesInstance
 * @description The instance of the useFileExplorerFiles hook.
 */
export interface UseFileExplorerFilesInstance {
  /**
   * Inserts a new item in the state from a FileExplorer Item component.
   * @param {FileMeta} item - The meta-information of the item to insert.
   * @returns {() => void} A function to remove the item from the state.
   */
  insertJSXItem: (item: FileMeta) => () => void;

  /**
   * Updates the `firstCharMap` to register the first character of the given item's label.
   * This map is used to navigate the fileExplorer using type-ahead search.
   * @param {FileId} id - The id of the item to map the first character of.
   * @param {string} firstChar - The first character of the item's label.
   * @returns {() => void} A function to remove the item from the `firstCharMap`.
   */
  mapFirstCharFromJSX: (id: FileId, firstChar: string) => () => void;

  /**
   * Store the ids of a given item's children in the state.
   * Those ids must be passed in the order they should be rendered.
   * @param {FileId | null} parentId - The id of the item to store the children of.
   * @param {FileId[]} orderedChildrenIds - The ids of the item's children.
   */
  setJSXItemsOrderedChildrenIds: (
    parentId: FileId | null,
    orderedChildrenIds: FileId[],
  ) => void;
}

/**
 * @interface UseFileExplorerJSXItemsParameters
 * @description Parameters for the useFileExplorerJSXItems hook.
 */
export interface UseFileExplorerJSXItemsParameters {}

/**
 * @interface UseFileExplorerFilesDefaultizedParameters
 * @description Defaultized parameters for the useFileExplorerFiles hook.
 */
export interface UseFileExplorerFilesDefaultizedParameters {}

/**
 * @type {UseFileExplorerJSXItemsDependencies}
 * @description The dependencies required by the useFileExplorerJSXItems hook.
 */
export type UseFileExplorerJSXItemsDependencies = [UseFileExplorerFilesSignature, UseFileExplorerDndSignature, UseFileExplorerKeyboardNavigationSignature, UseFileExplorerGridSignature];

/**
 * @type {UseFileExplorerJSXItemsSignature}
 * @description The signature of the useFileExplorerJSXItems hook.
 */
export type UseFileExplorerJSXItemsSignature = FileExplorerPluginSignature<{
  /**
   * @param {UseFileExplorerJSXItemsParameters} params - Parameters for the useFileExplorerJSXItems hook.
   */
  params: UseFileExplorerJSXItemsParameters;

  /**
   * @type {UseFileExplorerFilesDefaultizedParameters}
   * @description Defaultized parameters for the useFileExplorerFiles hook.
   */
  defaultizedParams: UseFileExplorerFilesDefaultizedParameters;

  /**
   * @type {UseFileExplorerFilesInstance}
   * @description The instance of the useFileExplorerFiles hook.
   */
  instance: UseFileExplorerFilesInstance;

  /**
   * @type {UseFileExplorerJSXItemsDependencies}
   * @description The dependencies required by the useFileExplorerJSXItems hook.
   */
  dependencies: UseFileExplorerJSXItemsDependencies;
});