import * as React from 'react';
import {useFileExplorerContext} from '../../internals/FileExplorerProvider/useFileExplorerContext';
import type {
  UseFileExplorerSelectionSignature
} from '../../internals/plugins/useFileExplorerSelection';
import type {
  UseFileExplorerExpansionSignature
} from '../../internals/plugins/useFileExplorerExpansion';
import type {
  UseFileExplorerFilesSignature
} from '../../internals/plugins/useFileExplorerFiles/useFileExplorerFiles.types';
import type {
  UseFileExplorerGridSignature
} from '../../internals/plugins/useFileExplorerGrid/useFileExplorerGrid.types';
import type {
  UseFileExplorerFocusSignature
} from '../../internals/plugins/useFileExplorerFocus/useFileExplorerFocus.types';
import type {UseFileStatus} from '../../internals/models/UseFileStatus';
import type {
  UseFileExplorerDndSignature
} from '../../internals/plugins/useFileExplorerDnd/useFileExplorerDnd.types';

/**
 * @interface UseFileInteractions
 * @description Provides methods for handling file interactions.
 */
interface UseFileInteractions {
  /**
   * Handles the expansion of a file item.
   * @param event The mouse event that triggered the expansion.
   */
  handleExpansion: (event: React.MouseEvent) => void;

  /**
   * Handles the selection of a file item.
   * @param event The mouse event that triggered the selection.
   */
  handleSelection: (event: React.MouseEvent) => void;

  /**
   * Handles the toggle of a checkbox for a file item.
   * @param event The change event of the checkbox.
   */
  handleCheckboxSelection: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * @interface UseFileUtilsReturnValue
 * @description Returns an object containing the interactions and status of the files.
 */
interface UseFileUtilsReturnValue {
  /**
   * The interactions for handling file events.
   */
  interactions: UseFileInteractions;

  /**
   * The status of the files.
   */
  status: UseFileStatus;
}

/**
 * @enum { readonly }
 * @description Plugins that are required for `useFileUtils` to work correctly.
 */
type UseFileUtilsMinimalPlugins = readonly [
  UseFileExplorerSelectionSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerFilesSignature,
  UseFileExplorerDndSignature,
  UseFileExplorerFocusSignature,
  UseFileExplorerGridSignature
];

/**
 * @enum { readonly }
 * @description Plugins that `useFileUtils` can use if they are present, but are not required.
 */
export type UseFileUtilsOptionalPlugins = readonly [];

/**
 * @function useFileUtils
 * @description Provides utility functions for working with files in the FileExplorer View.
 * 
 * @param {string} id The ID of the file to work with.
 * @param {React.ReactNode} children The children components that need to be rendered for the file.
 * @param {UseFileStatus | null} status The current status of the file, or null if not set.
 * @returns {UseFileUtilsReturnValue} An object containing the interactions and status of the files.
 */
export const useFileUtils = ({
  id,
  children,
  status,
}: {
  id: string;
  children: React.ReactNode;
  status: UseFileStatus | null
}): UseFileUtilsReturnValue => {
  /**
   * Get the file explorer context.
   */
  const {
    instance,
    selection: { multiSelect }
  } = useFileExplorerContext<UseFileUtilsMinimalPlugins, UseFileUtilsOptionalPlugins>();

  /**
   * Update the status if it is not set or has changed.
   */
  status = status === null ? instance.getItemStatus(id, children) : status;

  /**
   * Handles the expansion of a file item.
   */
  const handleExpansion = (event: React.MouseEvent) => {
    if (status.disabled) {
      return;
    }

    if (!status.focused) {
      instance.focusItem(event, id);
    }

    const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

    // If already expanded and trying to toggle selection don't close
    if (status.expandable && !(multiple && instance.isItemExpanded(id))) {
      instance.toggleItemExpansion(event, id);
    }
  };

  /**
   * Handles the selection of a file item.
   */
  const handleSelection = (event: React.MouseEvent) => {
    if (status.disabled) {
      return;
    }

    if (!status.focused) {
      instance.focusItem(event, id);
    }

    const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

    instance.selectItem({event, id, keepExistingSelection: multiple});
  };

  /**
   * Handles the toggle of a checkbox for a file item.
   */
  const handleCheckboxSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (status.disabled) {
      return;
    }

    instance.selectItem({
      event,
      id,
      keepExistingSelection: true,
      newValue: event.target.checked
    });
  };

  /**
   * Returns an object containing the interactions and status of the files.
   */
  const interactions: UseFileInteractions = {
    handleExpansion,
    handleSelection,
    handleCheckboxSelection,
  };

  return { interactions, status };
};