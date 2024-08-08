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
  convertSelectedItemsToArray
} from '../useFileExplorerSelection/useFileExplorerSelection.utils';
import { SyntheticEvent } from "react";

const useDefaultFocusableItemId = (
  instance: FileExplorerUsedInstance<UseFileExplorerFocusSignature>,
  selectedItems: string | string[] | null,
): string => {
  let tabbableItemId = convertSelectedItemsToArray(selectedItems).find((itemId) => {
    if (!instance.isItemNavigable(itemId)) {
      return false;
    }

    const itemMeta = instance.getItemMeta(itemId);
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
  const defaultFocusableItemId = useDefaultFocusableItemId(instance, models.selectedItems.value);

  const setFocusedItemId = useEventCallback((itemId: React.SetStateAction<string | null>) => {
    const cleanItemId = typeof itemId === 'function' ? itemId(state.focusedItemId) : itemId;
    if (state.focusedItemId !== cleanItemId) {
      setState((prevState) => ({ ...prevState, focusedItemId: cleanItemId }));
    }
  });

  const isFileExplorerFocused = React.useCallback(
    () =>
      !!rootRef.current &&
      rootRef.current.contains(getActiveElement(ownerDocument(rootRef.current))),
    [rootRef],
  );

  const isItemFocused = React.useCallback(
    (itemId: string) => state.focusedItemId === itemId && isFileExplorerFocused(),
    [state.focusedItemId, isFileExplorerFocused],
  );

  const isItemVisible = (itemId: string) => {
    const itemMeta = instance.getItemMeta(itemId);
    return itemMeta && (itemMeta.parentId == null || instance.isItemExpanded(itemMeta.parentId));
  };

  const innerFocusItem = (event: React.SyntheticEvent, itemId: string) => {
    const itemMeta = instance.getItemMeta(itemId);
    const itemElement = document.getElementById(
      instance.getFileIdAttribute(itemId, itemMeta.idAttribute),
    );
    if (itemElement) {
      itemElement.focus();
    }

    setFocusedItemId(itemId);
    if (params.onItemFocus) {
      params.onItemFocus(event, itemId);
    }
  };

  const focusItem = useEventCallback((event: React.SyntheticEvent, itemId: string) => {
    // If we receive an itemId, and it is visible, the focus will be set to it
    if (isItemVisible(itemId)) {
      innerFocusItem(event, itemId);
    }
  });

  const removeFocusedItem = useEventCallback(() => {
    if (state.focusedItemId == null) {
      return;
    }

    const itemMeta = instance.getItemMeta(state.focusedItemId);
    if (itemMeta) {
      const itemElement = document.getElementById(
        instance.getFileIdAttribute(state.focusedItemId, itemMeta.idAttribute),
      );
      if (itemElement) {
        itemElement.blur();
      }
    }

    setFocusedItemId(null);
  });

  const canItemBeTabbed = (itemId: string) => itemId === defaultFocusableItemId;

  useInstanceEventHandler(instance, 'removeItem', ({ id }) => {
    if (state.focusedItemId === id) {
      innerFocusItem(null as unknown as SyntheticEvent, defaultFocusableItemId);
    }
  });

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

useFileExplorerFocus.code = 'focus';
