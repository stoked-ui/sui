import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SlotComponentProps} from '@mui/base/utils';
import {TransitionProps} from '@mui/material/transitions';
import {SxProps} from '@mui/system';
import {FileElementClasses} from './fileElementClasses';
import {FileId} from '../models';
import {SlotComponentPropsFromProps} from '../internals/models';
import {MuiCancellableEventHandler} from '../internals/models/MuiCancellableEvent';
type {
  /**
   * Signature for the useFileExplorerExpansion hook.
   */
  UseFileExplorerExpansionSignature,
  /**
   * Signature for the useFileExplorerFiles hook.
   */
  UseFileExplorerFilesSignature,
  /**
   * Signature for the useFileExplorerFocus hook.
   */
  UseFileExplorerFocusSignature,
  /**
   * Signature for the useFileExplorerIcons hook.
   */
  UseFileExplorerIconsSignature,
  /**
   * Signature for the useFileExplorerKeyboardNavigation hook.
   */
  UseFileExplorerKeyboardNavigationSignature,
  /**
   * Signature for the useFileExplorerSelection hook.
   */
  UseFileExplorerSelectionSignature
} from '../internals';
import {FileElementContentProps} from "./FileElementContent";

/**
 * Props for the FileElement component. This component is used to represent a file element in the tree view.
 * It can be configured with various props to customize its appearance and behavior.
 *
 * @see {@link FileElement}
 */
export interface FileElementSlots {
  /**
   * The icon used to collapse the item.
   */
  root?: React.ElementType;
  /**
   * The icon used to expand the item.
   */
  collapseIcon?: React.ElementType;
  /**
   * The icon used to display next to an end item.
   */
  endIcon?: React.ElementType;
  /**
   * The icon displayed next to the tree item's label.
   */
  icon?: React.ElementType;
  /**
   * The component that animates the appearance / disappearance of the item's children.
   * @default FileElement2Group
   */
  groupTransition?: React.ElementType;
}

/**
 * Props for the slot component of the FileElement. This props object is used to customize the appearance and behavior of each component slot.
 *
 * @see {@link FileElement}
 */
export interface FileElementSlotProps {
  /**
   * The root element of the file element.
   */
  root?: SlotComponentProps<'div', {}, {}>;
  /**
   * The icon used for collapsing the item.
   */
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  /**
   * The icon used for expanding the item.
   */
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  /**
   * The icon displayed next to an end item.
   */
  endIcon?: SlotComponentProps<'svg', {}, {}>;
  /**
   * The icon displayed next to the tree item's label.
   */
  icon?: SlotComponentProps<'svg', {}, {}>;
  /**
   * The component that animates the appearance / disappearance of the item's children.
   */
  groupTransition?: SlotComponentPropsFromProps<TransitionProps, {}, {}>;
}

/**
 * Props for the FileElement component. This object extends React.HTMLAttributes<HTMLLIElement> to provide additional props specific to the file element.
 *
 * @see {@link FileElement}
 */
export interface FileElementProps
  extends Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {
  /**
   * The content of the file element.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileElementClasses>;
  /**
   * Overridable component slots for the file element.
   */
  slots?: FileElementSlots;
  /**
   * Props used for each component slot in the file element.
   */
  slotProps?: FileElementSlotProps;
  /**
   * The content component that renders the item's label and other metadata.
   */
  ContentComponent?: React.JSXElementConstructor<FileElementContentProps>;
  /**
   * Props applied to the content component.
   */
  ContentProps?: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };
  /**
   * Flag indicating whether the file element is disabled.
   */
  disabled: boolean;
  /**
   * Flag indicating whether the file element is focused.
   */
  focused: boolean;
  /**
   * Flag indicating whether the file element is selected.
   */
  selected: boolean;
}

/**
 * Internal state of the FileElement component. This object provides information about the current state of the file element, such as its focus and selection status.
 *
 * @see {@link FileElement}
 */
export type FileElementState = {
  /**
   * Flag indicating whether the file element is disabled.
   */
  disabled: boolean;
  /**
   * Flag indicating whether the file element is focused.
   */
  focused: boolean;
  /**
   * Flag indicating whether the file element is selected.
   */
  selected: boolean;
};

/**
 * Types of plugins that are required for the FileElement component to function correctly.
 *
 * @see {@link FileElement}
 */
export type FileElementMinimalPlugins = readonly [
  UseFileExplorerIconsSignature,
  UseFileExplorerSelectionSignature,
  UseFileExplorerFilesSignature,
  UseFileExplorerFocusSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerKeyboardNavigationSignature,
];

/**
 * Types of plugins that are optional for the FileElement component.
 *
 * @see {@link FileElement}
 */
export type FileElementOptionalPlugins = readonly [];