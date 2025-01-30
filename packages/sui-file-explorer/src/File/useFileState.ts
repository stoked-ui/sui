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

type UseFileStateMinimalPlugins = readonly [
  UseFileExplorerSelectionSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerFocusSignature,
  UseFileExplorerFilesSignature,
  UseFileExplorerDndSignature,
  UseFileExplorerGridSignature
];

type UseFileStateOptionalPlugins = readonly [];

export function useFileState(id: string) {
  const {
    instance,
    selection: { multiSelect, checkboxSelection, disableSelection },
    expansion: { expansionTrigger },
  } = useFileExplorerContext<UseFileStateMinimalPlugins, UseFileStateOptionalPlugins>();

  const expandable = instance.isItemExpandable(id);
  const expanded = instance.isItemExpanded(id);
  console.info('expanded', id, expanded);
  const focused = instance.isItemFocused(id);
  const selected = instance.isItemSelected(id);
  const disabled = instance.isItemDisabled(id);
  const visibleIndex = instance.getVisibleIndex(id);
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
        instance.selectItem({event, id, keepExistingSelection: false});
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
      instance.selectItem({event, id, keepExistingSelection: multiSelect, newValue: event.target.checked});
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
