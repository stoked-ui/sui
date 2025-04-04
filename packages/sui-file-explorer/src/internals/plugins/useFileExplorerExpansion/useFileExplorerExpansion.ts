import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import {FileExplorerPlugin} from '../../models/plugin';
import {UseFileExplorerExpansionSignature} from './useFileExplorerExpansion.types';
import {FileId} from '../../../models';

/**
 * FileExplorerPlugin for file explorer expansion functionality.
 *
 * @interface UseFileExplorerExpansion
 */
export const useFileExplorerExpansion: FileExplorerPlugin<UseFileExplorerExpansionSignature> = ({
  instance,
  params,
  models,
}) => {
  /**
   * Map of expanded items with their corresponding boolean values.
   */
  const expandedItemsMap = React.useMemo(() => {
    const temp = new Map<FileId, boolean>();
    models.expandedItems.value.forEach((id) => {
      temp.set(id, true);
    });

    return temp;
  }, [models.expandedItems.value]);

  /**
   * Function to set the expanded items based on event and value.
   *
   * @param {React.SyntheticEvent} event - The event that triggered this function call.
   * @param {FileId[]} value - The list of file IDs to be expanded or collapsed.
   */
  const setExpandedItems = (event: React.SyntheticEvent, value: FileId[]) => {
    params.onExpandedItemsChange?.(event, value);
    models.expandedItems.setControlledValue(value);
  };

  /**
   * Function to check if an item is already expanded or not.
   *
   * @param {string} id - The ID of the item to be checked.
   * @returns {boolean} True if the item is expanded, false otherwise.
   */
  const isItemExpanded = React.useCallback(
    (id: string) => {
      return expandedItemsMap.has(id)
    },
    [expandedItemsMap],
  );

  /**
   * Function to check if an item can be expanded or not based on its meta data.
   *
   * @param {string} id - The ID of the item to be checked.
   * @returns {boolean} True if the item is expandable, false otherwise.
   */
  const isItemExpandable = React.useCallback(
    (id: string) => {
      return !!instance.getItemMeta(id)?.expandable
    },
    [instance],
  );

  /**
   * Function to toggle the expansion of an item.
   *
   * @param {React.SyntheticEvent} event - The event that triggered this function call.
   * @param {FileId} id - The ID of the item to be toggled.
   */
  const toggleItemExpansion = useEventCallback(
    (event: React.SyntheticEvent, id: FileId) => {
      const isExpandedBefore = instance.isItemExpanded(id);
      console.info('toggle expansion', id, `old: ${isExpandedBefore}, new: ${!isExpandedBefore}`);
      instance.setItemExpansion(event, id, !isExpandedBefore);
    },
  );

  /**
   * Function to set the expansion of an item.
   *
   * @param {React.SyntheticEvent} event - The event that triggered this function call.
   * @param {FileId} id - The ID of the item to be expanded or collapsed.
   * @param {boolean} isExpanded - True if the item should be expanded, false otherwise.
   */
  const setItemExpansion = useEventCallback(
    (event: React.SyntheticEvent, id: FileId, isExpanded: boolean) => {
      const isExpandedBefore = instance.isItemExpanded(id);
      if (isExpandedBefore === isExpanded) {
        return;
      }

      let newExpanded: string[];
      if (isExpanded) {
        newExpanded = [id].concat(models.expandedItems.value);
      } else {
        newExpanded = models.expandedItems.value.filter((expandedId) => expandedId !== id);
      }

      if (params.onItemExpansionToggle) {
        params.onItemExpansionToggle(event, id, isExpanded);
      }

      setExpandedItems(event, newExpanded);
    },
  );

  /**
   * Function to expand all siblings of an item.
   *
   * @param {React.KeyboardEvent} event - The event that triggered this function call.
   * @param {FileId} id - The ID of the parent item whose children should be expanded.
   */
  const expandAllSiblings = (event: React.KeyboardEvent, id: FileId) => {
    // implement logic to expand all siblings
  };

  return {
    setExpandedItems,
    isItemExpanded,
    isItemExpandable,
    toggleItemExpansion,
    setItemExpansion,
    expandAllSiblings,
  };
};

/**
 * Models for file explorer expansion.
 */
useFileExplorerExpansion.models = {
  expandedItems: {
    /**
     * Function to get the default value of the expanded items.
     *
     * @param {object} params - The parameters object containing the default values.
     * @returns {string[]} The list of default expanded items.
     */
    getDefaultValue: (params) => params.defaultExpandedItems,
  },
};

const DEFAULT_EXPANDED_ITEMS: string[] = [];

/**
 * Function to get the defaultized parameters for file explorer expansion.
 *
 * @param {object} params - The parameters object containing the default values.
 * @returns {object} An object with the defaultized parameters.
 */
useFileExplorerExpansion.getDefaultizedParams = (params) => ({
  ...params,
  defaultExpandedItems: params.defaultExpandedItems ?? DEFAULT_EXPANDED_ITEMS,
});

/**
 * Parameters for file explorer expansion.
 */
useFileExplorerExpansion.params = {
  expandedItems: true,
  defaultExpandedItems: true,
  onExpandedItemsChange: true,
  onItemExpansionToggle: true,
  expansionTrigger: true,
};