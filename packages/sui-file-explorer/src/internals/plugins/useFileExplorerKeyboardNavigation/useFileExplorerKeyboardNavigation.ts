import * as React from 'react';
import {useRtl} from '@mui/system/RtlProvider';
import useEventCallback from '@mui/utils/useEventCallback';
import {FileExplorerPlugin, FileMeta} from '../../models';
import {
  getFirstNavigableItem, getLastNavigableItem, getNextNavigableItem, getPreviousNavigableItem,
} from '../../utils/fileExplorer';
import {
  FileExplorerFirstCharMap, UseFileExplorerKeyboardNavigationSignature,
} from './useFileExplorerKeyboardNavigation.types';
import {MuiCancellableEvent} from '../../models/MuiCancellableEvent';

function isPrintableCharacter(string: string) {
  return !!string && string.length === 1 && !!string.match(/\S/);
}

export const useFileExplorerKeyboardNavigation: FileExplorerPlugin<
  UseFileExplorerKeyboardNavigationSignature
> = ({ instance, params, state }) => {
  const isRtl = useRtl();
  const firstCharMap = React.useRef<FileExplorerFirstCharMap>({});

  const updateFirstCharMap = useEventCallback(
    (callback: (firstCharMap: FileExplorerFirstCharMap) => FileExplorerFirstCharMap) => {
      firstCharMap.current = callback(firstCharMap.current);
    },
  );

  React.useEffect(() => {
    if (instance.areItemUpdatesPrevented()) {
      return;
    }

    const newFirstCharMap: { [id: string]: string } = {};

    const processItem = (item: FileMeta) => {
      newFirstCharMap[item.id] = item.name!.substring(0, 1).toLowerCase();
    };

    Object.values(state.items.itemMetaMap).forEach(processItem);
    firstCharMap.current = newFirstCharMap;
  }, [state.items.itemMetaMap, params.getItemId, instance]);

  const getFirstMatchingItem = (id: string, query: string) => {
    const cleanQuery = query.toLowerCase();

    const getNextItem = (itemIdToCheck: string) => {
      const nextItemId = getNextNavigableItem(instance, itemIdToCheck);
      // We reached the end of the fileExplorer, check from the beginning
      if (nextItemId === null) {
        return getFirstNavigableItem(instance);
      }

      return nextItemId;
    };

    let matchingItemId: string | null = null;
    let currentItemId: string = getNextItem(id);
    const checkedItems: Record<string, true> = {};
    // The "!checkedItems[currentItemId]" condition avoids an infinite loop when there is no matching item.
    while (matchingItemId == null && !checkedItems[currentItemId]) {
      if (firstCharMap.current[currentItemId] === cleanQuery) {
        matchingItemId = currentItemId;
      } else {
        checkedItems[currentItemId] = true;
        currentItemId = getNextItem(currentItemId);
      }
    }

    return matchingItemId;
  };

  const canToggleItemSelection = (id: string) =>
    !params.disableSelection && !instance.isItemDisabled(id);

  const canToggleItemExpansion = (id: string) => {
    return !instance.isItemDisabled(id) && instance.isItemExpandable(id);
  };

  // ARIA specification: https://www.w3.org/WAI/ARIA/apg/patterns/fileExplorerview/#keyboardinteraction
  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLElement> & MuiCancellableEvent,
    id: string,
  ) => {
    if (event.defaultMuiPrevented) {
      return;
    }

    if (
      event.altKey ||
      event.currentTarget !== (event.target as HTMLElement).closest('*[role="fileexploreritem"]')
    ) {
      return;
    }

    const ctrlPressed = event.ctrlKey || event.metaKey;
    const key = event.key;

    // eslint-disable-next-line default-case
    switch (true) {
      // Select the item when pressing "Space"
      case key === ' ' && canToggleItemSelection(id): {
        event.preventDefault();
        if (params.multiSelect && event.shiftKey) {
          instance.expandSelectionRange(event, id);
        } else if (params.multiSelect) {
          instance.selectItem({event, id, keepExistingSelection: true});
        } else {
          instance.selectItem({event, id, keepExistingSelection: false});
        }
        break;
      }

      // If the focused item has children, we expand it.
      // If the focused item has no children, we select it.
      case key === 'Enter': {
        if (canToggleItemExpansion(id)) {
          instance.toggleItemExpansion(event, id);
          event.preventDefault();
        } else if (canToggleItemSelection(id)) {
          if (params.multiSelect) {
            event.preventDefault();
            instance.selectItem({event, id, keepExistingSelection: true});
          } else if (!instance.isItemSelected(id)) {
            instance.selectItem({event, id, keepExistingSelection: false});
            event.preventDefault();
          }
        }

        break;
      }

      // Focus the next focusable item
      case key === 'ArrowDown': {
        const nextItem = getNextNavigableItem(instance, id);
        if (nextItem) {
          event.preventDefault();
          instance.focusItem(event, nextItem);

          // Multi select behavior when pressing Shift + ArrowDown
          // Toggles the selection state of the next item
          if (params.multiSelect && event.shiftKey && canToggleItemSelection(nextItem)) {
            instance.selectItemFromArrowNavigation(event, id, nextItem);
          }
        }

        break;
      }

      // Focuses the previous focusable item
      case key === 'ArrowUp': {
        const previousItem = getPreviousNavigableItem(instance, id);
        if (previousItem) {
          event.preventDefault();
          instance.focusItem(event, previousItem);

          // Multi select behavior when pressing Shift + ArrowUp
          // Toggles the selection state of the previous item
          if (params.multiSelect && event.shiftKey && canToggleItemSelection(previousItem)) {
            instance.selectItemFromArrowNavigation(event, id, previousItem);
          }
        }

        break;
      }

      // If the focused item is expanded, we move the focus to its first child
      // If the focused item is collapsed and has children, we expand it
      case (key === 'ArrowRight' && !isRtl) || (key === 'ArrowLeft' && isRtl): {
        if (instance.isItemExpanded(id)) {
          const nextItemId = getNextNavigableItem(instance, id);
          if (nextItemId) {
            instance.focusItem(event, nextItemId);
            event.preventDefault();
          }
        } else if (canToggleItemExpansion(id)) {
          instance.toggleItemExpansion(event, id);
          event.preventDefault();
        }

        break;
      }

      // If the focused item is expanded, we collapse it
      // If the focused item is collapsed and has a parent, we move the focus to this parent
      case (key === 'ArrowLeft' && !isRtl) || (key === 'ArrowRight' && isRtl): {
        if (canToggleItemExpansion(id) && instance.isItemExpanded(id)) {
          instance.toggleItemExpansion(event, id);
          event.preventDefault();
        } else {
          const parent = instance.getItemMeta(id).parentId;
          if (parent) {
            instance.focusItem(event, parent);
            event.preventDefault();
          }
        }

        break;
      }

      // Focuses the first item in the fileExplorer
      case key === 'Home': {
        // Multi select behavior when pressing Ctrl + Shift + Home
        // Selects the focused item and all items up to the first item.
        if (canToggleItemSelection(id) && params.multiSelect && ctrlPressed && event.shiftKey) {
          instance.selectRangeFromStartToItem(event, id);
        } else {
          instance.focusItem(event, getFirstNavigableItem(instance));
        }

        event.preventDefault();
        break;
      }

      // Focuses the last item in the fileExplorer
      case key === 'End': {
        // Multi select behavior when pressing Ctrl + Shirt + End
        // Selects the focused item and all the items down to the last item.
        if (canToggleItemSelection(id) && params.multiSelect && ctrlPressed && event.shiftKey) {
          instance.selectRangeFromItemToEnd(event, id);
        } else {
          instance.focusItem(event, getLastNavigableItem(instance));
        }

        event.preventDefault();
        break;
      }

      // Expand all siblings that are at the same level as the focused item
      case key === '*': {
        instance.expandAllSiblings(event, id);
        event.preventDefault();
        break;
      }

      // Multi select behavior when pressing Ctrl + a
      // Selects all the items
      case key === 'a' && ctrlPressed && params.multiSelect && !params.disableSelection: {
        instance.selectAllNavigableItems(event);
        event.preventDefault();
        break;
      }

      // Type-ahead
      // TODO: Support typing multiple characters
      case !ctrlPressed && !event.shiftKey && isPrintableCharacter(key): {
        const matchingItem = getFirstMatchingItem(id, key);
        if (matchingItem != null) {
          instance.focusItem(event, matchingItem);
          event.preventDefault();
        }
        break;
      }
    }
  };

  return {
    instance: {
      updateFirstCharMap,
      handleItemKeyDown,
    },
  };
};

useFileExplorerKeyboardNavigation.params = {};
