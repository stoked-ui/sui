import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Checkbox from '@mui/material/Checkbox';
import { useFileElementState } from './useFileElementState';

export interface FileElementContentProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes: {
    /** Styles applied to the root element. */
    root: string;
    /** State class applied to the content element when expanded. */
    expanded: string;
    /** State class applied to the content element when selected. */
    selected: string;
    /** State class applied to the content element when focused. */
    focused: string;
    /** State class applied to the element when disabled. */
    disabled: string;
    /** Styles applied to the tree item icon and collapse/expand icon. */
    iconContainer: string;
    /** Styles applied to the label element. */
    label: string;
    /** Styles applied to the checkbox element. */
    checkbox: string;
  };
  /**
   * The tree item label.
   */
  label?: React.ReactNode;
  /**
   * The id of the item.
   */
  id: string;
  /**
   * The icon to display next to the tree item's label.
   */
  icon?: React.ReactNode;
  /**
   * The icon to display next to the tree item's label. Either an expansion or collapse icon.
   */
  expansionIcon?: React.ReactNode;
  /**
   * The icon to display next to the tree item's label. Either a parent or end icon.
   */
  displayIcon?: React.ReactNode;
}

export type FileElementContentClassKey = keyof NonNullable<FileElementContentProps['classes']>;

/**
 * @ignore - internal component.
 */
const FileElementContent = React.forwardRef(function FileElementContent(
  props: FileElementContentProps,
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

  const icon = iconProp || expansionIcon || displayIcon;
  const checkboxRef = React.useRef<HTMLButtonElement>(null);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    preventSelection(event);

    if (onMouseDown) {
      onMouseDown(event);
    }
  };

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

FileElementContent.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.any,
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
