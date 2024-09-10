import {FileExplorerPluginSignature, FileMeta} from '../../models';
import {UseFileExplorerFilesSignature} from '../useFileExplorerFiles';
import {UseFileExplorerKeyboardNavigationSignature} from '../useFileExplorerKeyboardNavigation';
import {FileId} from '../../../models';
import {UseFileExplorerGridSignature} from "../useFileExplorerGrid";
import {UseFileExplorerDndSignature} from '../useFileExplorerDnd/useFileExplorerDnd.types';

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
   * @param {FileId} itemId The id of the item to map the first character of.
   * @param {string} firstChar The first character of the item's label.
   * @returns {() => void} A function to remove the item from the `firstCharMap`.
   */
  mapFirstCharFromJSX: (itemId: FileId, firstChar: string) => () => void;
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

export interface UseFileExplorerJSXItemsParameters {}

export interface UseFileExplorerFilesDefaultizedParameters {}

export type UseFileExplorerJSXItemsDependencies = [UseFileExplorerFilesSignature, UseFileExplorerDndSignature, UseFileExplorerKeyboardNavigationSignature, UseFileExplorerGridSignature];
export type UseFileExplorerJSXItemsSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerJSXItemsParameters;
  defaultizedParams: UseFileExplorerFilesDefaultizedParameters;
  instance: UseFileExplorerFilesInstance;
  dependencies: UseFileExplorerJSXItemsDependencies;
}>;
