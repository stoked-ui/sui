import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Collapse from '@mui/material/Collapse';
import { resolveComponentProps, useSlotProps } from '@mui/base/utils';
import useForkRef from '@mui/utils/useForkRef';
import unsupportedProp from '@mui/utils/unsupportedProp';
import { alpha, useThemeProps } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';
import { TransitionProps } from '@mui/material/transitions';
import { unstable_composeClasses as composeClasses } from '@mui/base';
import { namedId } from '@stoked-ui/common';
import { FileElementContent } from './FileElementContent';
import { fileElementClasses, getFileElementUtilityClass } from './fileElementClasses';
import {
  FileElementMinimalPlugins,
  FileElementOptionalPlugins,
  FileElementOwnerState,
  FileElementProps,
} from './FileElement.types';
import { useFileExplorerContext } from '../internals/FileExplorerProvider/useFileExplorerContext';
import { FileExplorerCollapseIcon, FileExplorerExpandIcon } from '../icons';
import { FileProvider } from '../internals/FileProvider';
import { FileDepthContext } from '../internals/FileDepthContext';
import { useFileElementState } from './useFileElementState';
import { styled } from '../internals/zero-styled';

/**
 * Utility classes for FileElement component.
 *
 * @param {FileElementOwnerState} ownerState - The owner state of the FileElement.
 * @returns {object} The utility classes.
 */
const useUtilityClasses = (ownerState: FileElementOwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    content: ['content'],
    expanded: ['expanded'],
    selected: ['selected'],
    focused: ['focused'],
    disabled: ['disabled'],
    iconContainer: ['iconContainer'],
    checkbox: ['checkbox'],
    label: ['label'],
    groupTransition: ['groupTransition'],
  };

  return composeClasses(slots, getFileElementUtilityClass, classes);
};

/**
 * Root element of the FileElement component.
 */
const FileElementRoot = styled('li', {
  name: 'MuiFileElement',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'id',
})<{ ownerState: FileElementOwnerState }>({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  outline: 0,
});

/**
 * Styled component for FileElementContent.
 */
const StyledFileElementContent = styled(FileElementContent, {
  name: 'MuiFileElement',
  slot: 'Content',
  overridesResolver: (props, styles) => {
    return [
      styles.content,
      styles.iconContainer && {
        [`& .${fileElementClasses.iconContainer}`]: styles.iconContainer,
      },
      styles.label && {
        [`& .${fileElementClasses.label}`]: styles.label,
      },
    ];
  },
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'indentationAtItemLevel',
})<{ ownerState: FileElementOwnerState }>(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '@media (hover: none)': {
      backgroundColor: 'transparent',
    },
  },
  [`&.${fileElementClasses.disabled}`]: {
    opacity: theme.palette.action.disabledOpacity,
    backgroundColor: 'transparent',
  },
  [`&.${fileElementClasses.focused}`]: {
    backgroundColor: theme.palette.action.focus,
  },
  [`&.${fileElementClasses.selected}`]: {
    backgroundColor: theme?.vars
      ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
      : alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
    '&:hover': {
      backgroundColor: theme?.vars
        ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.hoverOpacity}))`
        : alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
          ),
      '@media (hover: none)': {
        backgroundColor: theme?.vars
          ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
          : alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
    [`&.${fileElementClasses.focused}`]: {
      backgroundColor: theme?.vars
        ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.focusOpacity}))`
        : alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity + theme.palette.action.focusOpacity,
          ),
    },
  },
  [`& .${fileElementClasses.iconContainer}`]: {
    width: 16,
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    '& svg': {
      fontSize: 18,
    },
  },
  [`& .${fileElementClasses.label}`]: {
    width: '100%',
    boxSizing: 'border-box',
    minWidth: 0,
    position: 'relative',
    ...theme.typography.body1,
  },
  [`& .${fileElementClasses.checkbox}`]: {
    padding: 0,
  },
  variants: [
    {
      props: { indentationAtItemLevel: true },
      style: {
        paddingLeft: `calc(${theme.spacing(1)} + var(--FileExplorer-itemChildrenIndentation) * var(--FileExplorer-itemDepth))`,
      },
    },
  ],
}));

/**
 * Group transition element of the FileElement component.
 */
const FileElementGroup = styled(Collapse, {
  name: 'MuiFileElement',
  slot: 'GroupTransition',
  overridesResolver: (props, styles) => styles.groupTransition,
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'indentationAtItemLevel',
})({
  margin: 0,
  padding: 0,
  paddingLeft: 'var(--FileExplorer-itemChildrenIndentation)',
  variants: [
    {
      props: { indentationAtItemLevel: true },
      style: { paddingLeft: 0 },
    },
  ],
});

/**
 * FileElement component.
 * 
 * Demos:
 * - [Tree View](https://mui.com/x/react-tree-view/)
 * 
 * API:
 * - [FileElement API](https://mui.com/x/api/tree-view/file-element/)
 * 
 * @returns {JSX.Element} The rendered FileElement component.
 */
export const FileElement = React.forwardRef(function FileElement(
  inProps: FileElementProps,
  inRef: React.Ref<HTMLLIElement>,
) {
  const {
    icons: contextIcons,
    runItemPlugins,
    selection: { multiSelect },
    expansion: { expansionTrigger },
    disabledItemsFocusable,
    indentationAtItemLevel,
    instance,
  } = useFileExplorerContext<FileElementMinimalPlugins, FileElementOptionalPlugins>();
  const depthContext = React.useContext(FileDepthContext);

  const props = useThemeProps({ props: inProps, name: 'MuiFileElement' });

  const {
    children,
    className,
    slots: inSlots,
    slotProps: inSlotProps,
    ContentComponent = FileElementContent,
    ContentProps,
    name,
    onClick,
    onMouseDown,
    onFocus,
    onBlur,
    onKeyDown,
    ...other
  } = props;

  const id: string = props.id ?? name ?? namedId({ id: 'file-element', length: 6 });
  const label: React.ReactNode = props.label ?? name ?? id ?? props.id;

  const { expanded, focused, selected, disabled, handleExpansion } = useFileElementState(id);

  const { contentRef, rootRef } = runItemPlugins<FileElementProps>(props);
  const handleRootRef = useForkRef(inRef, rootRef);
  const handleContentRef = useForkRef(ContentProps?.ref, contentRef);

  const slots = {
    expandIcon: inSlots?.expandIcon ?? contextIcons.slots.expandIcon ?? FileExplorerExpandIcon,
    collapseIcon:
      inSlots?.collapseIcon ?? contextIcons.slots.collapseIcon ?? FileExplorerCollapseIcon,
    endIcon: inSlots?.endIcon ?? contextIcons.slots.endIcon,
    icon: inSlots?.icon,
    groupTransition: inSlots?.groupTransition,
  };

  const isExpandable = (reactChildren: React.ReactNode) => {
    if (Array.isArray(reactChildren)) {
      return reactChildren.length > 0 && reactChildren.some(isExpandable);
    }
    return Boolean(reactChildren);
  };
  const expandable = isExpandable(children);

  const ownerState: FileElementOwnerState = {
    ...props,
    expanded,
    focused,
    selected,
    disabled,
    indentationAtItemLevel,
  };

  const classes = useUtilityClasses(ownerState);

  const GroupTransition: React.ElementType | undefined = slots.groupTransition ?? undefined;
  const groupTransitionProps: TransitionProps = useSlotProps({
    elementType: GroupTransition,
    ownerState: {},
    externalSlotProps: inSlotProps?.groupTransition,
    additionalProps: {
      unmountOnExit: true,
      in: expanded,
      component: 'ul',
      role: 'group',
      ...(indentationAtItemLevel ? { indentationAtItemLevel: true } : {}),
    },
    className: classes.groupTransition,
  });

  const handleIconContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (expansionTrigger === 'iconContainer') {
      handleExpansion(event);
    }
  };
  const ExpansionIcon = expanded ? slots.collapseIcon : slots.expandIcon;
  const { ownerState: expansionIconOwnerState, ...expansionIconProps } = useSlotProps({
    elementType: ExpansionIcon,
    ownerState: {},
    externalSlotProps: (tempOwnerState: any) => {
      if (expanded) {
        return {
          ...resolveComponentProps(contextIcons.slotProps.collapseIcon, tempOwnerState),
          ...resolveComponentProps(inSlotProps?.collapseIcon, tempOwnerState),
        };
      }

      return {
        ...resolveComponentProps(contextIcons.slotProps.expandIcon, tempOwnerState),
        ...resolveComponentProps(inSlotProps?.expandIcon, tempOwnerState),
      };
    },
    additionalProps: {
      onClick: handleIconContainerClick,
    },
  });
  const expansionIcon =
    expandable && !!ExpansionIcon ? <ExpansionIcon {...expansionIconProps} /> : null;

  const DisplayIcon = expandable ? undefined : slots.endIcon;
  const { ownerState: displayIconOwnerState, ...displayIconProps } = useSlotProps({
    elementType: DisplayIcon,
    ownerState: {},
    externalSlotProps: (tempOwnerState: any) => {
      if (expandable) {
        return {};
      }

      return {
        ...resolveComponentProps(contextIcons.slotProps.endIcon, tempOwnerState),
        ...resolveComponentProps(inSlotProps?.endIcon, tempOwnerState),
      };
    },
  });
  const displayIcon = DisplayIcon ? <DisplayIcon {...displayIconProps} /> : null;

  const Icon = slots.icon;
  const { ownerState: iconOwnerState, ...iconProps } = useSlotProps({
    elementType: Icon,
    ownerState: {},
    externalSlotProps: inSlotProps?.icon,
  });
  const icon = Icon ? <Icon {...iconProps} /> : null;

  let ariaSelected;
  if (multiSelect) {
    ariaSelected = selected;
  } else if (selected) {
    ariaSelected = true;
  }

  function handleFocus(event: React.FocusEvent<HTMLLIElement>) {
    const canBeFocused = !disabled || disabledItemsFocusable;
    if (!focused && canBeFocused && event.currentTarget === event.target) {
      instance.focusItem(event, id);
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLLIElement>) {
    onBlur?.(event);
    instance.removeFocusedItem();
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    onKeyDown?.(event);
    instance.handleItemKeyDown(event, id);
  };

  const idAttribute = instance.getFileIdAttribute(id);
  const tabIndex = instance.canItemBeTabbed(id) ? 0 : -1;

  return (
    <FileProvider id={id}>
      <FileElementRoot
        className={clsx(classes.root, className)}
        role="treeitem"
        aria-expanded={expandable ? expanded : undefined}
        aria-selected={ariaSelected}
        aria-disabled={disabled || undefined}
        id={idAttribute}
        tabIndex={tabIndex}
        {...other}
        ownerState={ownerState}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        ref={handleRootRef}
        style={
          indentationAtItemLevel
            ? ({
                ...other.style,
                '--FileExplorer-itemDepth':
                  typeof depthContext === 'function' ? depthContext(id) : depthContext,
              } as React.CSSProperties)
            : other.style
        }
      >
        <StyledFileElementContent
          as={ContentComponent}
          classes={{
            root: classes.content,
            expanded: classes.expanded,
            selected: classes.selected,
            focused: classes.focused,
            disabled: classes.disabled,
            iconContainer: classes.iconContainer,
            label: classes.label,
            checkbox: classes.checkbox,
          }}
          label={label}
          id={id}
          onClick={onClick}
          onMouseDown={onMouseDown}
          icon={icon}
          expansionIcon={expansionIcon}
          displayIcon={displayIcon}
          ownerState={ownerState}
          {...ContentProps}
          ref={handleContentRef}
        />
        {children && (
          <FileElementGroup as={GroupTransition} {...groupTransitionProps}>
            {children}
          </FileElementGroup>
        )}
      </FileElementRoot>
    </FileProvider>
  );
});

/**
 * PropTypes for the FileElement component.
 */
FileElement.propTypes = {
  children: PropTypes.any,
  classes: PropTypes.object,
  className: PropTypes.string,
  ContentComponent: PropTypes.any,
  ContentProps: PropTypes.object,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  label: PropTypes.any,
  name: PropTypes.string,
  onFocus: unsupportedProp,
  onKeyDown: PropTypes.func,
  slotProps: PropTypes.object,
  slots: PropTypes.object,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};