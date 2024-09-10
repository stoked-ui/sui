import * as React from 'react';
import {FileExplorerPluginSignature} from '../../models/plugin.types';
import {DefaultizedProps} from '../../models/helpers';
import {FileId} from '../../../models';
import type {
  UseFileExplorerFilesSignature
} from "../useFileExplorerFiles/useFileExplorerFiles.types";

export interface UseFileExplorerExpansionPublicAPI {
  /**
   * Change the expansion status of a given item.
   * @param {React.SyntheticEvent} event The UI event that triggered the change.
   * @param {string} itemId The id of the item to modify.
   * @param {boolean} isExpanded The new expansion status of the given item.
   */
  setItemExpansion: (event: React.SyntheticEvent, itemId: string, isExpanded: boolean) => void;
}

export interface UseFileExplorerExpansionInstance extends UseFileExplorerExpansionPublicAPI {
  /**
   * Check if an item is expanded.
   * @param {FileId} itemId The id of the item to check.
   * @returns {boolean} `true` if the item is expanded, `false` otherwise.
   */
  isItemExpanded: (itemId: FileId) => boolean;
  /**
   * Check if an item is expandable.
   * Currently, an item is expandable if it has children.
   * In the future, the user should be able to flag an item as expandable even if it has no loaded
   * children to support children lazy loading.
   * @param {FileId} itemId The id of the item to check.
   * @returns {boolean} `true` if the item can be expanded, `false` otherwise.
   */
  isItemExpandable: (itemId: FileId) => boolean;
  /**
   * Toggle the current expansion of an item.
   * If it is expanded, it will be collapsed, and vice versa.
   * @param {React.SyntheticEvent} event The UI event that triggered the change.
   * @param {FileId} itemId The id of the item to toggle.
   */
  toggleItemExpansion: (event: React.SyntheticEvent, itemId: FileId) => void;
  /**
   * Expand all the siblings (i.e.: the items that have the same parent) of a given item.
   * @param {React.SyntheticEvent} event The UI event that triggered the change.
   * @param {FileId} itemId The id of the item whose siblings will be expanded.
   */
  expandAllSiblings: (event: React.KeyboardEvent, itemId: FileId) => void;
}

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
   * @param {array} itemIds The ids of the expanded items.
   */
  onExpandedItemsChange?: (event: React.SyntheticEvent, itemIds: string[]) => void;
  /**
   * Callback fired when a fileExplorer item is expanded or collapsed.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} itemId The itemId of the modified item.
   * @param {array} isExpanded `true` if the item has just been expanded, `false` if it has just
   *   been collapsed.
   */
  onItemExpansionToggle?: (
    event: React.SyntheticEvent,
    itemId: string,
    isExpanded: boolean,
  ) => void;
  /**
   * The slot that triggers the item's expansion when clicked.
   * @default 'content'
   */
  expansionTrigger?: 'content' | 'iconContainer';
}

export type UseFileExplorerExpansionDefaultizedParameters = DefaultizedProps<
  UseFileExplorerExpansionParameters,
  'defaultExpandedItems'
>;

interface UseFileExplorerExpansionContextValue {
  expansion: Pick<UseFileExplorerExpansionParameters, 'expansionTrigger'>;
}

export type UseFileExplorerExpansionSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerExpansionParameters;
  defaultizedParams: UseFileExplorerExpansionDefaultizedParameters;
  instance: UseFileExplorerExpansionInstance;
  publicAPI: UseFileExplorerExpansionPublicAPI;
  modelNames: 'expandedItems';
  contextValue: UseFileExplorerExpansionContextValue;
  dependencies: [UseFileExplorerFilesSignature];
}>;
