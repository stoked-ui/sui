import * as React from 'react';
import {FileExplorerPlugin} from '../../models';
import {FileId} from '../../../models';
import {
  findOrderInTremauxFileExplorer,
  getAllNavigableItems,
  getFirstNavigableItem,
  getLastNavigableItem,
  getNonDisabledItemsInRange,
} from '../../utils/fileExplorer';
import {
  UseFileExplorerSelectionInstance, UseFileExplorerSelectionSignature,
} from './useFileExplorerSelection.types';
import {convertSelectedItemsToArray, getLookupFromArray} from './useFileExplorerSelection.utils';

export const useFileExplorerSelection: FileExplorerPlugin<UseFileExplorerSelectionSignature> = ({
  instance,
  params,
  models,
}) => {
  const lastSelectedItem = React.useRef<string | null>(null);
  const lastSelectedRange = React.useRef<{ [id: string]: boolean }>({});

  // AC-2.4.a: Map selection state with Multiple generic type safety
  // Convert FileExplorer selection model to format compatible with MUI X RichTreeView
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

  // AC-2.4.e: Expose selection state in format suitable for MUI X selectedItems prop
  // This allows the adapter layer to pass selection state to RichTreeView
  const getSelectedItemsForMuiX = React.useCallback(() => {
    if (params.multiSelect) {
      return convertSelectedItemsToArray(models.selectedItems.value);
    }
    return models.selectedItems.value;
  }, [models.selectedItems.value, params.multiSelect]);

  const setSelectedItems = (
    event: React.SyntheticEvent,
    newSelectedItems: typeof params.defaultSelectedItems,
  ) => {
    if (params.onItemSelectionToggle) {
      if (params.multiSelect) {
        const addedItems = (newSelectedItems as string[]).filter(
          (id) => !instance.isItemSelected(id),
        );
        const removedItems = (models.selectedItems.value as string[]).filter(
          (id) => !(newSelectedItems as string[]).includes(id),
        );

        addedItems.forEach((id) => {
          params.onItemSelectionToggle!(event, id, true);
        });

        removedItems.forEach((id) => {
          params.onItemSelectionToggle!(event, id, false);
        });
      } else if (newSelectedItems !== models.selectedItems.value) {
        if (models.selectedItems.value != null) {
          params.onItemSelectionToggle(event, models.selectedItems.value as string, false);
        }
        if (newSelectedItems != null) {
          params.onItemSelectionToggle(event, newSelectedItems as string, true);
        }
      }
    }

    if (params.onSelectedItemsChange) {
      params.onSelectedItemsChange(event, newSelectedItems);
    }

    models.selectedItems.setControlledValue(newSelectedItems);
  };

  const isItemSelected = (id: string) => selectedItemsMap.has(id);

  const selectItem: UseFileExplorerSelectionInstance['selectItem'] = (selectItemParams: {
    event: React.SyntheticEvent, id: string, keepExistingSelection?: boolean, newValue?: boolean,
  }) => {
    const {event, id, keepExistingSelection = false, newValue} = selectItemParams;
    if (params.disableSelection) {
      return;
    }

    let newSelected: typeof models.selectedItems.value;
    if (keepExistingSelection) {
      const cleanSelectedItems = convertSelectedItemsToArray(models.selectedItems.value);
      const isSelectedBefore = instance.isItemSelected(id);
      if (isSelectedBefore && (newValue === false || newValue == null)) {
        newSelected = cleanSelectedItems.filter((selectId) => selectId !== id);
      } else if (!isSelectedBefore && (newValue === true || newValue == null)) {
        newSelected = [id].concat(cleanSelectedItems);
      } else {
        newSelected = cleanSelectedItems;
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (newValue === false) {
        newSelected = params.multiSelect ? [] : null;
      } else {
        newSelected = params.multiSelect ? [id] : id;
      }
    }

    setSelectedItems(event, newSelected);
    lastSelectedItem.current = id;
    lastSelectedRange.current = {};
  };

  const selectRange = (event: React.SyntheticEvent, [start, end]: [string, string]) => {
    if (params.disableSelection || !params.multiSelect) {
      return;
    }

    let newSelectedItems = convertSelectedItemsToArray(models.selectedItems.value).slice();

    // If the last selection was a range selection,
    // remove the items that were part of the last range from the model
    if (Object.keys(lastSelectedRange.current).length > 0) {
      newSelectedItems = newSelectedItems.filter((id) => !lastSelectedRange.current[id]);
    }

    // Add to the model the items that are part of the new range and not already part of the model.
    const selectedItemsLookup = getLookupFromArray(newSelectedItems);
    const range = getNonDisabledItemsInRange(instance, start, end);
    const itemsToAddToModel = range.filter((id) => !selectedItemsLookup[id]);
    newSelectedItems = newSelectedItems.concat(itemsToAddToModel);

    setSelectedItems(event, newSelectedItems);
    lastSelectedRange.current = getLookupFromArray(range);
  };

  const expandSelectionRange = (event: React.SyntheticEvent, id: string) => {
    if (lastSelectedItem.current != null) {
      const [start, end] = findOrderInTremauxFileExplorer(instance, id, lastSelectedItem.current);
      selectRange(event, [start, end]);
    }
  };

  const selectRangeFromStartToItem = (event: React.SyntheticEvent, id: string) => {
    selectRange(event, [getFirstNavigableItem(instance), id]);
  };

  const selectRangeFromItemToEnd = (event: React.SyntheticEvent, id: string) => {
    selectRange(event, [id, getLastNavigableItem(instance)]);
  };

  const selectAllNavigableItems = (event: React.SyntheticEvent) => {
    if (params.disableSelection || !params.multiSelect) {
      return;
    }

    const navigableItems = getAllNavigableItems(instance);
    setSelectedItems(event, navigableItems);

    lastSelectedRange.current = getLookupFromArray(navigableItems);
  };

  const selectItemFromArrowNavigation = (
    event: React.SyntheticEvent,
    currentItem: string,
    nextItem: string,
  ) => {
    if (params.disableSelection || !params.multiSelect) {
      return;
    }

    let newSelectedItems = convertSelectedItemsToArray(models.selectedItems.value).slice();

    if (Object.keys(lastSelectedRange.current).length === 0) {
      newSelectedItems.push(nextItem);
      lastSelectedRange.current = { [currentItem]: true, [nextItem]: true };
    } else {
      if (!lastSelectedRange.current[currentItem]) {
        lastSelectedRange.current = {};
      }

      if (lastSelectedRange.current[nextItem]) {
        newSelectedItems = newSelectedItems.filter((id) => id !== currentItem);
        delete lastSelectedRange.current[currentItem];
      } else {
        newSelectedItems.push(nextItem);
        lastSelectedRange.current[nextItem] = true;
      }
    }

    setSelectedItems(event, newSelectedItems);
  };

  return {
    getRootProps: () => ({
      // AC-2.4.d: Maintain ARIA attributes for WCAG 2.1 AA compliance
      'aria-multiselectable': params.multiSelect,
    }),
    publicAPI: {
      // AC-2.4.e: Preserve programmatic selection API
      selectItem
    },
    instance: {
      isItemSelected,
      selectItem,
      selectAllNavigableItems,
      expandSelectionRange,
      selectRangeFromStartToItem,
      selectRangeFromItemToEnd,
      selectItemFromArrowNavigation,
      // AC-2.4.a: Expose method for MUI X adapter to get selection in correct format
      getSelectedItemsForMuiX,
    },
    contextValue: {
      selection: {
        // AC-2.4.b: Provide checkbox rendering config through context
        multiSelect: params.multiSelect,
        checkboxSelection: params.checkboxSelection,
        disableSelection: params.disableSelection,
      },
    },
  };
};

useFileExplorerSelection.models = {
  selectedItems: {
    getDefaultValue: (params) => params.defaultSelectedItems,
  },
};

const DEFAULT_SELECTED_ITEMS: string[] = [];

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
