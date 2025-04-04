import * as React from 'react';
import {
  UseFileExplorerGridSignature
} from "../internals/plugins/useFileExplorerGrid/useFileExplorerGrid.types";
import {useFileExplorerContext} from '../internals/FileExplorerProvider/useFileExplorerContext';
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
import {
  UseFileExplorerDndSignature
} from '../internals/plugins/useFileExplorerDnd/useFileExplorerDnd.types';

/**
 * Type definition for the minimal plugins required by the useFileState hook.
 *
 * @description These plugins provide the core functionality of the file explorer state management system.
 *              They define how to handle selection, expansion, focus, and other interactions with files in the explorer.
 */
type UseFileStateMinimalPlugins = readonly [
  UseFileExplorerSelectionSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerFocusSignature,
  UseFileExplorerFilesSignature,
  UseFileExplorerDndSignature,
  UseFileExplorerGridSignature
];

/**
 * Type definition for the optional plugins required by the useFileState hook.
 *
 * @description These plugins provide additional functionality that can be used in conjunction with the core file explorer state management system.
 */
type UseFileStateOptionalPlugins = readonly [];

/**
 * Hook that manages the state of a file explorer.
 *
 * @param {string} id - The ID of the file to manage.
 *
 * @returns An object containing the current state of the file, as well as functions for managing this state.
 */

export function useFileState(id: string) {
  /**
   * Extract the necessary context from the FileExplorerProvider.
   */
  const {
    instance,
    selection: { multiSelect, checkboxSelection, disableSelection },
    expansion: { expansionTrigger },
  } = useFileExplorerContext<UseFileStateMinimalPlugins, UseFileStateOptionalPlugins>();

  /**
   * Determine whether the file is expandable and expanded based on its state.
   */
  const expandable = instance.isItemExpandable(id);
  const expanded = instance.isItemExpanded(id);

  /**
   * Determine whether the file is focused or not.
   */
  const focused = instance.isItemFocused(id);

  /**
   * Determine whether the file is selected or not.
   */
  const selected = instance.isItemSelected(id);

  /**
   * Determine whether the file is disabled or not.
   */
  const disabled = instance.isItemDisabled(id);

  /**
   * Get the visible index of the file in the grid.
   */
  const visibleIndex = instance.getVisibleIndex(id);

  /**
   * Handle the expansion event for a file.
   *
   * @param {React.MouseEvent<HTMLDivElement>} event - The mouse event that triggered the expansion.
   */
  const handleExpansion = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      if (!focused) {
        instance.focusItem(event, id);
      }

      /**
       * Check whether multiple files should be expanded or not based on the shift key and control/meta keys being pressed.
       */
      const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

      /**
       * If the file is already expanded but trying to toggle selection, do not close the expansion.
       */
      if (expandable && !(multiple && instance.isItemExpanded(id))) {
        instance.toggleItemExpansion(event, id);
      }
    }
  };

  /**
   * Handle the selection event for a file.
   *
   * @param {React.MouseEvent} event - The mouse event that triggered the selection.
   */
  const handleSelection = (event: React.MouseEvent) => {
    if (!disabled) {
      if (!focused) {
        instance.focusItem(event, id);
      }

      /**
       * Check whether multiple files should be selected or not based on the shift key and control/meta keys being pressed.
       */
      const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

      if (multiple) {
        if (event.shiftKey) {
          instance.expandSelectionRange(event, id);
        } else {
          instance.selectItem({event, id, keepExistingSelection: true});
        }
      } else {
        instance.selectItem({event, id, keepExistingSelection: false});
      }
    }
  };

  /**
   * Handle the checkbox selection event for a file.
   *
   * @param {React.MouseEvent} event - The mouse event that triggered the checkbox selection.
   */
  const handleCheckboxSelection = (event: React.MouseEvent) => {
    instance.checkboxSelection(id, !(instance.isItemChecked(id)));
  };

  /**
   * Prevent the default behavior of the selection event to prevent multiple files from being selected at once.
   *
   * @param {React.MouseEvent} event - The mouse event that triggered the selection.
   */
  const preventSelection = (event: React.MouseEvent) => {
    if (!disabled) {
      instance.preventSelection(event);
    }
  };

  /**
   * Return an object containing the current state of the file and functions for managing this state.
   *
   * @returns An object containing the current state of the file, as well as functions for managing this state.
   */
  return {
    id,
    expandable,
    expanded,
    focused,
    selected,
    disabled,
    visibleIndex,
    handleExpansion,
    handleSelection,
    handleCheckboxSelection,
    preventSelection,
    expansionTrigger,
  };
}