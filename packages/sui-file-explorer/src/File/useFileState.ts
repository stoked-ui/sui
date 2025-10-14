/**
 * Custom hook that manages the state of a file in a file explorer.
 * @param {string} id - The unique identifier of the file.
 * @returns {Object} Object containing file state properties and event handlers.
 */
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

  /**
   * Handles the expansion of a file item.
   * @param {React.MouseEvent<HTMLDivElement>} event - The mouse event that triggered the expansion.
   */
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

  /**
   * Handles the selection of a file item.
   * @param {React.MouseEvent} event - The mouse event that triggered the selection.
   */
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
          instance.selectItem({ event, id, keepExistingSelection: true });
        }
      } else {
        instance.selectItem({ event, id, keepExistingSelection: false });
      }
    }
  };

  /**
   * Handles the checkbox selection of a file item.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event of the checkbox.
   */
  const handleCheckboxSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disableSelection || disabled) {
      return;
    }

    const hasShift = (event.nativeEvent as PointerEvent).shiftKey;
    if (multiSelect && hasShift) {
      instance.expandSelectionRange(event, id);
    } else {
      instance.selectItem({ event, id, keepExistingSelection: multiSelect, newValue: event.target.checked });
    }
  };

  /**
   * Prevents text selection on mouse events under certain conditions.
   * @param {React.MouseEvent<HTMLDivElement>} event - The mouse event to prevent selection for.
   */
  const preventSelection = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.shiftKey || event.ctrlKey || event.metaKey || disabled) {
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