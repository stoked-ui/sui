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
 * Represents the interactions available for file utilities.
 */
interface UseFileInteractions {
  handleExpansion: (event: React.MouseEvent) => void;
  handleSelection: (event: React.MouseEvent) => void;
  handleCheckboxSelection: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Represents the return value of file utilities.
 */
interface UseFileUtilsReturnValue {
  interactions: UseFileInteractions;
  status: UseFileStatus;
}

/**
 * Plugins that need to be present in the FileExplorer View in order for `useFileUtils` to work
 * correctly.
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
 * Represents optional plugins that `useFileUtils` can use if they are present, but are not required.
 */
export type UseFileUtilsOptionalPlugins = readonly [];

/**
 * Custom hook that provides file utilities for a specific file.
 * @param {string} id - The unique identifier of the file.
 * @param {React.ReactNode} children - The children elements associated with the file.
 * @param {UseFileStatus | null} status - The status of the file.
 * @returns {UseFileUtilsReturnValue} The file utilities interactions and status.
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
  const {
    instance,
    selection: { multiSelect }
  } = useFileExplorerContext<UseFileUtilsMinimalPlugins, UseFileUtilsOptionalPlugins>();

  status = status === null ? instance.getItemStatus(id, children) : status;

  /**
   * Handles the expansion of the file.
   * @param {React.MouseEvent} event - The mouse event triggering the expansion.
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
   * Handles the selection of the file.
   * @param {React.MouseEvent} event - The mouse event triggering the selection.
   */
  const handleSelection = (event: React.MouseEvent) => {
    if (status.disabled) {
      return;
    }

    if (!status.focused) {
      instance.focusItem(event, id);
    }

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
  };

  /**
   * Handles the checkbox selection of the file.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event triggering the checkbox selection.
   */
  const handleCheckboxSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hasShift = (event.nativeEvent as PointerEvent).shiftKey;
    if (multiSelect && hasShift) {
      instance.expandSelectionRange(event, id);
    } else {
      instance.selectItem({event, id, keepExistingSelection: multiSelect, newValue: event.target.checked});
    }
  };

  const interactions: UseFileInteractions = {
    handleExpansion,
    handleSelection,
    handleCheckboxSelection,
  };

  return { interactions, status };
};