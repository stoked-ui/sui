import * as React from 'react';
import { useFileExplorerContext } from '../internals/FileExplorerProvider/useFileExplorerContext';
import {
  UseFileExplorerSelectionSignature
} from '../internals/plugins/useFileExplorerSelection/useFileExplorerSelection.types';
import {
  UseFileExplorerExpansionSignature
} from '../internals/plugins/useFileExplorerExpansion/useFileExplorerExpansion.types';
import {
  UseFileExplorerFocusSignature
} from '../internals/plugins/useFileExplorerFocus/useFileExplorerFocus.types';
import {
  UseFileExplorerFilesSignature
} from '../internals/plugins/useFileExplorerFiles/useFileExplorerFiles.types';

/**
 * Type definition for the minimal plugins used in file element state.
 */
type UseFileElementStateMinimalPlugins = readonly [
  /**
   * Signature of the selection plugin.
   */
  UseFileExplorerSelectionSignature,
  /**
   * Signature of the expansion plugin.
   */
  UseFileExplorerExpansionSignature,
  /**
   * Signature of the focus plugin.
   */
  UseFileExplorerFocusSignature,
  /**
   * Signature of the files plugin.
   */
  UseFileExplorerFilesSignature,
];

/**
 * Type definition for the optional plugins used in file element state.
 */
type UseFileElementStateOptionalPlugins = readonly [];

/**
 * Hook to get the file element state.
 *
 * @param {string} id - The ID of the file element.
 * @returns {Object} An object containing the file element state and its associated functions.
 */
export function useFileElementState(id: string) {
  const {
    instance,
    selection: { multiSelect, checkboxSelection, disableSelection },
    expansion: { expansionTrigger },
  } = useFileExplorerContext<UseFileElementStateMinimalPlugins, UseFileElementStateOptionalPlugins>();

  /**
   * Whether the item is expandable.
   */
  const expandable = instance.isItemExpandable(id);
  
  /**
   * Whether the item is expanded.
   */
  const expanded = instance.isItemExpanded(id);
  
  /**
   * Whether the item is focused.
   */
  const focused = instance.isItemFocused(id);
  
  /**
   * Whether the item is selected.
   */
  const selected = instance.isItemSelected(id);
  
  /**
   * Whether the item is disabled.
   */
  const disabled = instance.isItemDisabled(id);

  /**
   * Handles the expansion event.
   *
   * @param {React.MouseEvent<HTMLDivElement>} event - The mouse event triggered by the user.
   */
  const handleExpansion = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      if (!focused) {
        instance.focusItem(event, id);
      }

      /**
       * Whether multiple selection should be allowed.
       */
      const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

      /**
       * If the item is already expanded and trying to toggle selection don't close.
       */
      if (expandable && !(multiple && instance.isItemExpanded(id))) {
        instance.toggleItemExpansion(event, id);
      }
    }
  };

  /**
   * Handles the selection event.
   *
   * @param {React.MouseEvent} event - The mouse event triggered by the user.
   */
  const handleSelection = (event: React.MouseEvent) => {
    if (!disabled) {
      if (!focused) {
        instance.focusItem(event, id);
      }

      /**
       * Whether multiple selection should be allowed.
       */
      const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);
      
      if (multiple) {
        /**
         * If the shift key is pressed, expand the selection range.
         */
        if (event.shiftKey) {
          instance.expandSelectionRange(event, id);
        } else {
          /**
           * Select the item and keep existing selection.
           */
          instance.selectItem({event, id, keepExistingSelection: true});
        }
      } else {
        /**
         * Select the item with no existing selection.
         */
        instance.selectItem({event, id, keepExistingSelection: false, newValue: true});
      }
    }
  };

  /**
   * Handles the checkbox event.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event triggered by the user.
   */
  const handleCheckboxSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disableSelection || disabled) {
      return;
    }

    /**
     * Whether the shift key is pressed.
     */
    const hasShift = (event.nativeEvent as PointerEvent).shiftKey;

    /**
     * If multiple selection should be allowed and the shift key is pressed, expand the selection range.
     */
    if (multiSelect && hasShift) {
      instance.expandSelectionRange(event, id);
    } else {
      /**
       * Select the item with the checkbox state.
       */
      instance.selectItem({
        event, id, keepExistingSelection: multiSelect, newValue: event.target.checked,
      });
    }
  };

  /**
   * Prevents text selection.
   *
   * @param {React.MouseEvent<HTMLDivElement>} event - The mouse event triggered by the user.
   */
  const preventSelection = (event: React.MouseEvent<HTMLDivElement>) => {
    // Implement text selection prevention logic here
  };

  return {
    expandable,
    expanded,
    focused,
    selected,
    disabled,
    handleExpansion,
    handleSelection,
    handleCheckboxSelection,
    preventSelection,
  };
}