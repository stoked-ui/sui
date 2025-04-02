import * as React from 'react';
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

type UseFileElementStateMinimalPlugins = readonly [
  UseFileExplorerSelectionSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerFocusSignature,
  UseFileExplorerFilesSignature,
];

type UseFileElementStateOptionalPlugins = readonly [];

export function useFileElementState(id: string) {
  const {
    instance,
    selection: { multiSelect, checkboxSelection, disableSelection },
    expansion: { expansionTrigger },
  } = useFileExplorerContext<UseFileElementStateMinimalPlugins, UseFileElementStateOptionalPlugins>();

  const expandable = instance.isItemExpandable(id);
  const expanded = instance.isItemExpanded(id);
  const focused = instance.isItemFocused(id);
  const selected = instance.isItemSelected(id);
  const disabled = instance.isItemDisabled(id);

  const handleExpansion = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      if (!focused) {
        instance.focusItem(event, id);
      }

      const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

      // If already expanded and trying to toggle selection don't close
      if (expandable && !(multiple && instance.isItemExpanded(id))) {
        instance.toggleItemExpansion(event, id);
      }
    }
  };

  const handleSelection = (event: React.MouseEvent) => {
    if (!disabled) {
      if (!focused) {
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
        instance.selectItem({event, id, keepExistingSelection: false, newValue: true});
      }
    }
  };

  const handleCheckboxSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disableSelection || disabled) {
      return;
    }

    const hasShift = (event.nativeEvent as PointerEvent).shiftKey;
    if (multiSelect && hasShift) {
      instance.expandSelectionRange(event, id);
    } else {
      instance.selectItem({
        event, id, keepExistingSelection: multiSelect, newValue: event.target.checked,
      });
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
    disableSelection,
    checkboxSelection,
    handleExpansion,
    handleSelection,
    handleCheckboxSelection,
    preventSelection,
    expansionTrigger,
  };
}

