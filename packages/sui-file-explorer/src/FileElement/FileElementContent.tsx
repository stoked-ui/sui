import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Checkbox from '@mui/material/Checkbox';
import { useFileElementState }/**
 * @ignore - internal component.
 */
const FileElementContent = React.forwardRef(function FileElementContent(
  /**
   * Props for the FileElementContent component.
   *
   * @property {Object} props - The properties of the component.
   * @property {string} props.className - Override or extend the styles applied to the component.
   * @property {Object} props.classes - Override or extend the styles applied to the component.
   * @property {React.ReactNode} props.label - The tree item label.
   * @property {string} props.id - The id of the item.
   * @property {React.ReactNode} props.icon - The icon to display next to the tree item's label.
   * @property {React.ReactNode} props.expansionIcon - The icon to display next to the tree item's label. Either an expansion or collapse icon.
   * @property {React.ReactNode} props.displayIcon - The icon to display next to the tree item's label. Either a parent or end icon.
   */
  props: FileElementContentProps,
  /**
   * Reference to the component.
   *
   * @type {HTMLDivElement|null}
   */
  ref: React.Ref<HTMLDivElement>,
) {
  const {
    classes,
    className,
    displayIcon,
    expansionIcon,
    icon: iconProp,
    label,
    id,
    onClick,
    onMouseDown,
    ...other
  } = props;
  /**
   * State from the useFileElementState hook.
   *
   * @type {Object}
   */
  const {
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
  } = useFileElementState(id);

  /**
   * The icon to display next to the tree item's label.
   */
  const icon = iconProp || expansionIcon || displayIcon;
  /**
   * Reference to the checkbox element.
   *
   * @type {HTMLButtonElement|null}
   */
  const checkboxRef = React.useRef<HTMLButtonElement>(null);

  /**
   * Handles the mouse down event on the component.
   *
   * @param {React.MouseEvent<HTMLDivElement>} event - The mouse down event.
   */
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    preventSelection(event);

    if (onMouseDown) {
      onMouseDown(event);
    }
  };

  /**
   * Handles the click event on the component.
   *
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
        [classes.disabled]: disabled,
      })}
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
}

/**
 * Prop types for the FileElementContent component.
 *
 * @type {Object}
 */
FileElementContent.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.any,
  /**
   * Override or extend the styles applied to the component.
   */
  className: PropTypes.string,
  /**
   * The icon to display next to the tree item's label. Either a parent or end icon.
   */
  displayIcon: PropTypes.any,
  /**
   * The icon to display next to the tree item's label. Either an expansion or collapse icon.
   */
  expansionIcon: PropTypes.any,
  /**
   * The icon to display next to the tree item's label.
   */
  icon: PropTypes.any,
  /**
   * The id of the item.
   */
  id: PropTypes.string.isRequired,
  /**
   * The tree item label.
   */
  label: PropTypes.any,
};

export { FileElementContent };