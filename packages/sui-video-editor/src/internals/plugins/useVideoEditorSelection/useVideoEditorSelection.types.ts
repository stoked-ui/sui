import * as React from 'react';
import type { DefaultizedProps, VideoEditorPluginSignature } from '../../models';

export interface UseVideoEditorSelectionPublicAPI {
  /**
   * Select or deselect an item.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {string} itemId The id of the item to select or deselect.
   * @param {boolean} keepExistingSelection If `true`, don't remove the other selected items.
   * @param {boolean | undefined} newValue The new selection status of the item. If not defined, the new state will be the opposite of the current state.
   */
  selectItem: (
    event: React.SyntheticEvent,
    itemId: string,
    keepExistingSelection: boolean,
    newValue?: boolean,
  ) => void;
}

export interface UseVideoEditorSelectionInstance {
  /**
   * Check if an item is selected.
   * @param {FileId} itemId The id of the item to check.
   * @returns {boolean} `true` if the item is selected, `false` otherwise.
   */
  isItemSelected: (itemId: string) => boolean;
  /**
   * Select or deselect an item.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {string} itemId The id of the item to select or deselect.
   * @param {boolean} keepExistingSelection If `true`, don't remove the other selected items.
   * @param {boolean | undefined} newValue The new selection status of the item. If not defined, the new state will be the opposite of the current state.
   */
  selectItem: (
    event: React.SyntheticEvent,
    itemId: string,
    keepExistingSelection: boolean,
    newValue?: boolean,
  ) => void;
  /**
   * Select all the navigable items in the fileExplorer.
   * @param {React.SyntheticEvent} event The event source of the callback.
   */
  selectAllNavigableItems: (event: React.SyntheticEvent) => void;
  /**
   * Expand the current selection range up to the given item.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {string} itemId The id of the item to expand the selection to.
   */
  expandSelectionRange: (event: React.SyntheticEvent, itemId: string) => void;
  /**
   * Expand the current selection range from the first navigable item to the given item.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {string} itemId The id of the item up to which the selection range should be expanded.
   */
  selectRangeFromStartToItem: (event: React.SyntheticEvent, itemId: string) => void;
  /**
   * Expand the current selection range from the given item to the last navigable item.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {string} itemId The id of the item from which the selection range should be expanded.
   */
  selectRangeFromItemToEnd: (event: React.SyntheticEvent, itemId: string) => void;
  /**
   * Update the selection when navigating with ArrowUp / ArrowDown keys.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {string} currentItemId The id of the active item before the keyboard navigation.
   * @param {string} nextItemId The id of the active item after the keyboard navigation.
   */
  selectItemFromArrowNavigation: (
    event: React.SyntheticEvent,
    currentItemId: string,
    nextItemId: string,
  ) => void;
}

type VideoEditorSelectionValue<Multiple extends boolean | undefined> = Multiple extends true
  ? string[]
  : string | null;

export interface UseVideoEditorSelectionParameters<Multiple extends boolean | undefined> {
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
  defaultSelectedItems?: VideoEditorSelectionValue<Multiple>;
  /**
   * Selected item ids. (Controlled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   */
  selectedItems?: VideoEditorSelectionValue<Multiple>;
  /**
   * If `true`, `ctrl` and `shift` will trigger multiselect.
   * @default false
   */
  multiSelect?: Multiple;
  /**
   * If `true`, the fileExplorer view renders a checkbox at the left of its label that allows selecting it.
   * @default false
   */
  checkboxSelection?: boolean;
  /**
   * Callback fired when fileExplorer items are selected/deselected.
   * @param {React.SyntheticEvent} event The event source of the callback
   * @param {string[] | string} itemIds The ids of the selected items.
   * When `multiSelect` is `true`, this is an array of strings; when false (default) a string.
   */
  onSelectedItemsChange?: (
    event: React.SyntheticEvent,
    itemIds: VideoEditorSelectionValue<Multiple>,
  ) => void;
  /**
   * Callback fired when a fileExplorer item is selected or deselected.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} itemId The itemId of the modified item.
   * @param {array} isSelected `true` if the item has just been selected, `false` if it has just been deselected.
   */
  onItemSelectionToggle?: (
    event: React.SyntheticEvent,
    itemId: string,
    isSelected: boolean,
  ) => void;
}

export type UseVideoEditorSelectionDefaultizedParameters<Multiple extends boolean> = DefaultizedProps<
  UseVideoEditorSelectionParameters<Multiple>,
  'disableSelection' | 'defaultSelectedItems' | 'multiSelect' | 'checkboxSelection'
>;

interface UseVideoEditorSelectionContextValue {
  selection: Pick<
    UseVideoEditorSelectionDefaultizedParameters<boolean>,
    'multiSelect' | 'checkboxSelection' | 'disableSelection'
  >;
}

export type UseVideoEditorSelectionSignature = VideoEditorPluginSignature<{
  params: UseVideoEditorSelectionParameters<any>;
  defaultizedParams: UseVideoEditorSelectionDefaultizedParameters<any>;
  instance: UseVideoEditorSelectionInstance;
  contextValue: UseVideoEditorSelectionContextValue;
  modelNames: 'selectedItems';
  publicAPI: UseVideoEditorSelectionPublicAPI,
  dependencies: [
  ];
}>;
