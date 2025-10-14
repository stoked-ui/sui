/**
 * File Explorer Plugin for managing file selection in a file explorer component.
 * @typedef {Object} UseFileExplorerSelectionSignature
 * @property {Object} instance - The instance of the file explorer component.
 * @property {Object} params - Parameters for file selection.
 * @property {Object} models - Models related to file selection.
 */

/**
 * Represents the function signature for the UseFileExplorerSelection instance.
 * @typedef {Object} UseFileExplorerSelectionInstance
 * @property {Function} selectItem - Function to select an item in the file explorer.
 */

import * as React from 'react';
import { FileExplorerPlugin } from '../../models';
import { FileId } from '../../../models';
import {
  findOrderInTremauxFileExplorer,
  getAllNavigableItems,
  getFirstNavigableItem,
  getLastNavigableItem,
  getNonDisabledItemsInRange,
} from '../../utils/fileExplorer';
import {
  UseFileExplorerSelectionInstance,
  UseFileExplorerSelectionSignature,
} from './useFileExplorerSelection.types';
import { convertSelectedItemsToArray, getLookupFromArray } from './useFileExplorerSelection.utils';

/**
 * Custom hook for managing file selection in a file explorer component.
 * @param {UseFileExplorerSelectionSignature} options - Options for file selection.
 * @returns {Object} Object containing functions and values related to file selection.
 */
export const useFileExplorerSelection: FileExplorerPlugin<UseFileExplorerSelectionSignature> = ({
  instance,
  params,
  models,
}) => {
  const lastSelectedItem = React.useRef<string | null>(null);
  const lastSelectedRange = React.useRef<{ [id: string]: boolean }>({});

  const selectedItemsMap = React.useMemo(() => {
    const temp = new Map<FileId, boolean>();
    if (Array.isArray(models.selectedItems.value)) {
      models.selectedItems.value.forEach((id) => {
        temp.set(id, true);
      });
    } else if (models.selectedItems.value != null) {
      temp.set(models.selectedItems.value, true);
    }

    return temp;
  }, [models.selectedItems.value]);

  /**
   * Sets the selected items in the file explorer.
   * @param {React.SyntheticEvent} event - The event triggering the selection change.
   * @param {string[]} newSelectedItems - The new selected items.
   */
  const setSelectedItems = (
    event: React.SyntheticEvent,
    newSelectedItems: typeof params.defaultSelectedItems,
  ) => {
    // Logic for setting selected items
  };

  /**
   * Checks if an item is selected in the file explorer.
   * @param {string} id - The ID of the item to check.
   * @returns {boolean} Returns true if the item is selected, false otherwise.
   */
  const isItemSelected = (id: string) => selectedItemsMap.has(id);

  // Other functions for selecting items and ranges

  return {
    // Functions and values related to file selection
  };
};

useFileExplorerSelection.models = {
  selectedItems: {
    getDefaultValue: (params) => params.defaultSelectedItems,
  },
};

const DEFAULT_SELECTED_ITEMS: string[] = [];

/**
 * Gets the default parameters for file selection.
 * @param {Object} params - Parameters for file selection.
 * @returns {Object} Defaultized parameters for file selection.
 */
useFileExplorerSelection.getDefaultizedParams = (params) => ({
  ...params,
  disableSelection: params.disableSelection ?? false,
  multiSelect: params.multiSelect ?? false,
  checkboxSelection: params.checkboxSelection ?? false,
  defaultSelectedItems:
    params.defaultSelectedItems ?? (params.multiSelect ? DEFAULT_SELECTED_ITEMS : null),
});

useFileExplorerSelection.params = {
  disableSelection: true,
  multiSelect: true,
  checkboxSelection: true,
  defaultSelectedItems: true,
  selectedItems: true,
  onSelectedItemsChange: true,
  onItemSelectionToggle: true,
};
