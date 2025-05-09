/**
 * Custom hook to manage state and behavior for a file element in a file explorer.
 * @param {string} id - The unique identifier of the file element.
 * @returns {Object} Object containing various states and event handlers for the file element.
 */
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

  /**
   * Handles the expansion of the file element.
   * @param {React.MouseEvent<HTMLDivElement>} event - The mouse event triggering the expansion.
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
   * Handles the selection of the file element.
   * @param {React.MouseEvent} event - The mouse event triggering the selection.
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
        instance.selectItem({ event, id, keepExistingSelection: false, newValue: true });
      }
    }
  };

  /**
   * Handles the checkbox selection of the file element.
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
      instance.selectItem({
        event, id, keepExistingSelection: multiSelect, newValue: event.target.checked,
      });
    }
  };

  /**
   * Prevents text selection on the file element.
   * @param {React.MouseEvent<HTMLDivElement>} event - The mouse event triggering the prevention of selection.
   */
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