import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import { EventHandlers } from '@mui/base/utils';
import ownerDocument from '@mui/utils/ownerDocument';
import { FileExplorerPlugin, FileExplorerUsedInstance } from '../../models/plugin';
import { UseFileExplorerFocusSignature } from './useFileExplorerFocus.types';
import { useInstanceEventHandler } from '../../hooks/useInstanceEventHandler';
import { getActiveElement } from '../../utils/utils';
import { getFirstNavigableItem } from '../../utils/fileExplorer';
import { MuiCancellableEvent } from '../../models/MuiCancellableEvent';
import {
  convertSelectedItemsToArray,
} from '../useFileExplorerSelection/useFileExplorerSelection.utils';

/**
 * Returns the ID of a focusable item in the file explorer.
 *
 * @param instance The file explorer instance.
 * @param selectedItems The currently selected items. Can be null or an array of strings.
 * @returns The ID of the first focusable item, or null if none exist.
 */
const useDefaultFocusableItemId = (
  instance: FileExplorerUsedInstance<UseFileExplorerFocusSignature>,
  selectedItems: string | string[] | null,
): string => {
  let tabbableItemId = convertSelectedItemsToArray(selectedItems).find((id) => {
    if (!instance.isItemNavigable(id)) {
      return false;
    }

    const itemMeta = instance.getItemMeta(id);
    return itemMeta && (itemMeta.parentId == null || instance.isItemExpanded(itemMeta.parentId));
  });

  if (tabbableItemId == null) {
    tabbableItemId = getFirstNavigableItem(instance);
  }

  return tabbableItemId;
};

export const useFileExplorerFocus: FileExplorerPlugin<UseFileExplorerFocusSignature> = ({
  instance,
  params,
  state,
  setState,
  models,
  rootRef,
}) => {
  /**
   * The default focusable item ID.
   */
  const defaultFocusableItemId = useDefaultFocusableItemId(instance, models.selectedItems.value);

  /**
   * Sets the focused item ID. If a function is passed, it will be called with the current state.
   *
   * @param id The new focused item ID.
   */
  const setFocusedItemId = useEventCallback((id: React.SetStateAction<string | null>) => {
    const cleanItemId = typeof id === 'function' ? id(state.focusedItemId) : id;
    if (state.focusedItemId !== cleanItemId) {
      setState((prevState) => ({ ...prevState, focusedItemId: cleanItemId }));
    }
  });

  /**
   * Checks if the file explorer is currently focused.
   *
   * @returns True if the file explorer is focused, false otherwise.
   */
  const isFileExplorerFocused = React.useCallback(
    () =>
      !!rootRef.current &&
      rootRef.current.contains(getActiveElement(ownerDocument(rootRef.current))),
    [rootRef],
  );

  /**
   * Checks if an item is currently focused.
   *
   * @param id The ID of the item to check.
   * @returns True if the item is focused, false otherwise.
   */
  const isItemFocused = React.useCallback(
    (id: string) => state.focusedItemId === id && isFileExplorerFocused,
    [state.focusedItemId, isFileExplorerFocused],
  );

  /**
   * Checks if an item can be tabbed.
   *
   * @param id The ID of the item to check.
   * @returns True if the item can be tabbed, false otherwise.
   */
  const canItemBeTabbed = (id: string) => id === defaultFocusableItemId;

  useInstanceEventHandler(instance, 'removeItem', ({ id }) => {
    if (state.focusedItemId === id) {
      innerFocusItem(null as unknown as React.SyntheticEvent, defaultFocusableItemId);
    }
  });

  /**
   * Creates a root handle focus function that steals the focus.
   *
   * @param otherHandlers The event handlers to pass along.
   */
  const createRootHandleFocus =
    (otherHandlers: EventHandlers) =>
    (event: React.FocusEvent<HTMLUListElement> & MuiCancellableEvent) => {
      otherHandlers.onFocus?.(event);
      if (event.defaultMuiPrevented) {
        return;
      }

      // if the event bubbled (which is React specific) we don't want to steal focus
      if (event.target === event.currentTarget) {
        innerFocusItem(event, defaultFocusableItemId);
      }
    };

  return {
    getRootProps: (otherHandlers) => ({
      onFocus: createRootHandleFocus(otherHandlers),
    }),
    publicAPI: {
      focusItem,
    },
    instance: {
      isItemFocused,
      canItemBeTabbed,
      focusItem,
      removeFocusedItem,
    },
  };
};

useFileExplorerFocus.getInitialState = () => ({ focusedItemId: null });

useFileExplorerFocus.params = {
  onItemFocus: true,
};