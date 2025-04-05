/**
 * @typedef {Object} FileElementContentProps
 * @property {string} className - Additional class name for styling.
 * @property {Object} classes - CSS classes to override or extend styling.
 * @property {string} classes.root - Styles applied to the root element.
 * @property {string} classes.expanded - State class applied to the content element when expanded.
 * @property {string} classes.selected - State class applied to the content element when selected.
 * @property {string} classes.focused - State class applied to the content element when focused.
 * @property {string} classes.disabled - State class applied to the element when disabled.
 * @property {string} classes.iconContainer - Styles applied to the tree item icon and collapse/expand icon.
 * @property {string} classes.label - Styles applied to the label element.
 * @property {string} classes.checkbox - Styles applied to the checkbox element.
 * @property {React.ReactNode} label - The tree item label.
 * @property {string} id - The id of the item.
 * @property {React.ReactNode} icon - The icon to display next to the tree item's label.
 * @property {React.ReactNode} expansionIcon - The icon to display next to the tree item's label. Either an expansion or collapse icon.
 * @property {React.ReactNode} displayIcon - The icon to display next to the tree item's label. Either a parent or end icon.
 */

/**
 * @ignore - internal component.
 */
const FileElementContent = React.forwardRef(function FileElementContent(
  props: FileElementContentProps,
  ref: React.Ref<HTMLDivElement>,
) {
  /**
   * Handles mouse down event.
   * @param {React.MouseEvent<HTMLDivElement>} event - The mouse down event.
   */
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    preventSelection(event);

    if (onMouseDown) {
      onMouseDown(event);
    }
  };

  /**
   * Handles click event.
   * @param {React.MouseEvent<HTMLDivElement>} event - The click event.
   */
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (checkboxRef.current?.contains(event.target as HTMLElement)) {
      return;
    }

    if (expansionTrigger === 'content') {
      handleExpansion(event);
    }

    if (!checkboxSelection) {
      handleSelection(event);
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions -- Key event is handled by the FileExplorer */
    <div
      {...other}
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      ref={ref}
    >
      <div className={classes.iconContainer}>{icon}</div>
      {checkboxSelection && (
        <Checkbox
          className={classes.checkbox}
          checked={selected}
          onChange={handleCheckboxSelection}
          disabled={disabled || disableSelection}
          ref={checkboxRef}
          tabIndex={-1}
        />
      )}

      <div className={classes.label}>{label}</div>
    </div>
  );
});

/**
 * PropTypes for FileElementContent component.
 */
FileElementContent.propTypes = {
  classes: PropTypes.any,
  className: PropTypes.string,
  displayIcon: PropTypes.any,
  expansionIcon: PropTypes.any,
  icon: PropTypes.any,
  id: PropTypes.string.isRequired,
  label: PropTypes.any,
};

export { FileElementContent };
**/