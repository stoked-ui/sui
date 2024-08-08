import * as React from 'react';
import {
  UseFileExplorerGridSignature
} from "../internals/plugins/useFileExplorerGrid/useFileExplorerGrid.types";
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
import {
  UseFileExplorerDndSignature
} from '../internals/plugins/useFileExplorerDnd/useFileExplorerDnd.types';

type UseFileStateMinimalPlugins = readonly [
  UseFileExplorerSelectionSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerFocusSignature,
  UseFileExplorerFilesSignature,
  UseFileExplorerDndSignature,
  UseFileExplorerGridSignature
];

type UseFileStateOptionalPlugins = readonly [];

export function useFileState(itemId: string) {
  const {
    instance,
    selection: { multiSelect, checkboxSelection, disableSelection },
    expansion: { expansionTrigger },
  } = useFileExplorerContext<UseFileStateMinimalPlugins, UseFileStateOptionalPlugins>();

  const expandable = instance.isItemExpandable(itemId);
  const expanded = instance.isItemExpanded(itemId);
  const focused = instance.isItemFocused(itemId);
  const selected = instance.isItemSelected(itemId);
  const disabled = instance.isItemDisabled(itemId);
  const visibleIndex = instance.getVisibleIndex(itemId);
  const handleExpansion = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      if (!focused) {
        instance.focusItem(event, itemId);
      }

      const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

      // If already expanded and trying to toggle selection don't close
      if (expandable && !(multiple && instance.isItemExpanded(itemId))) {
        instance.toggleItemExpansion(event, itemId);
      }
    }
  };

  const handleSelection = (event: React.MouseEvent) => {
    if (!disabled) {
      if (!focused) {
        instance.focusItem(event, itemId);
      }

      const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

      if (multiple) {
        if (event.shiftKey) {
          instance.expandSelectionRange(event, itemId);
        } else {
          instance.selectItem(event, itemId, true);
        }
      } else {
        instance.selectItem(event, itemId, false);
      }
    }
  };

  const handleCheckboxSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disableSelection || disabled) {
      return;
    }

    const hasShift = (event.nativeEvent as PointerEvent).shiftKey;
    if (multiSelect && hasShift) {
      instance.expandSelectionRange(event, itemId);
    } else {
      instance.selectItem(event, itemId, multiSelect, event.target.checked);
    }
  };

  const preventSelection = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.shiftKey || event.ctrlKey || event.metaKey || disabled) {
      // Prevent text selection
      event.preventDefault();
    }
  };

  return {
    disabled,
    expanded,
    selected,
    focused,
    visibleIndex,
    disableSelection,
    checkboxSelection,
    handleExpansion,
    handleSelection,
    handleCheckboxSelection,
    preventSelection,
    expansionTrigger,
  };
}
