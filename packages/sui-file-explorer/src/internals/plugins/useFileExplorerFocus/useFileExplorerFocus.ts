import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import {EventHandlers} from '@mui/base/utils';
import ownerDocument from '@mui/utils/ownerDocument';
import {FileExplorerPlugin, FileExplorerUsedInstance} from '../../models/plugin';
import {UseFileExplorerFocusSignature} from './useFileExplorerFocus.types';
import {useInstanceEventHandler} from '../../hooks/useInstanceEventHandler';
import {getActiveElement} from '../../utils/utils';
import {getFirstNavigableItem} from '../../utils/fileExplorer';
import {MuiCancellableEvent} from '../../models/MuiCancellableEvent';
import {
  convertSelectedItemsToArray
} from '../useFileExplorerSelection/useFileExplorerSelection.utils';

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
  const defaultFocusableItemId = useDefaultFocusableItemId(instance, models.selectedItems.value);

  const setFocusedItemId = useEventCallback((id: React.SetStateAction<string | null>) => {
    const cleanItemId = typeof id === 'function' ? id(state.focusedItemId) : id;
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
    (id: string) => state.focusedItemId === id && isFileExplorerFocused(),
    [state.focusedItemId, isFileExplorerFocused],
  );

  const isItemVisible = (id: string) => {
    const itemMeta = instance.getItemMeta(id);
    return itemMeta && (itemMeta.parentId == null || instance.isItemExpanded(itemMeta.parentId));
  };

  const innerFocusItem = (event: React.SyntheticEvent, id: string) => {
    const itemMeta = instance.getItemMeta(id);
    if (!window) {
      throw new Error('innerFocusItem')
    }
    const itemElement = event.currentTarget as HTMLElement;
    if (itemElement) {
      itemElement.focus();
    }

    setFocusedItemId(id);
    if (params.onItemFocus) {
      params.onItemFocus(event, id);
    }
  };

  const focusItem = useEventCallback((event: React.SyntheticEvent, id: string) => {
    // If we receive an id, and it is visible, the focus will be set to it
    if (isItemVisible(id)) {
      innerFocusItem(event, id);
    }
  });

  const removeFocusedItem = useEventCallback(() => {
    if (state.focusedItemId == null) {
      return;
    }

    const itemMeta = instance.getItemMeta(state.focusedItemId);
    if (itemMeta) {
      if (!window) {
        throw new Error('itemMeta')
      }
      const itemElement = document.getElementById(
        instance.getFileIdAttribute(state.focusedItemId),
      );
      if (itemElement) {
        itemElement.blur();
      }
    }

    setFocusedItemId(null);
  });

  const canItemBeTabbed = (id: string) => id === defaultFocusableItemId;

  useInstanceEventHandler(instance, 'removeItem', ({ id }) => {
    if (state.focusedItemId === id) {
      innerFocusItem(null as unknown as React.SyntheticEvent, defaultFocusableItemId);
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

