import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SlotComponentProps } from '@mui/base/utils';
import { TransitionProps } from '@mui/material/transitions';
import { SxProps } from '@mui/system';
import { FileElementContentProps } from './FileElementContent';
import { FileElementClasses } from './fileElementClasses';
import { FileId } from '../models';
import { SlotComponentPropsFromProps } from '../internals/models';
import { MuiCancellableEventHandler } from '../internals/models/MuiCancellableEvent';
import type { UseFileExplorerIconsSignature } from '../internals/plugins/useFileExplorerIcons/useFileExplorerIcons.types';
import type { UseFileExplorerSelectionSignature } from '../internals/plugins/useFileExplorerSelection/useFileExplorerSelection.types';
import type { UseFileExplorerFilesSignature } from '../internals/plugins/useFileExplorerFiles/useFileExplorerFiles.types';
import type { UseFileExplorerFocusSignature } from '../internals/plugins/useFileExplorerFocus/useFileExplorerFocus.types';
import type { UseFileExplorerExpansionSignature } from '../internals/plugins/useFileExplorerExpansion/useFileExplorerExpansion.types';
import type {
  UseFileExplorerKeyboardNavigationSignature
} from '../internals/plugins/useFileExplorerKeyboardNavigation';

export interface FileElementSlots {
  /**
   * The icon used to collapse the item.
   */
  collapseIcon?: React.ElementType;
  /**
   * The icon used to expand the item.
   */
  expandIcon?: React.ElementType;
  /**
   * The icon displayed next to an end item.
   */
  endIcon?: React.ElementType;
  /**
   * The icon to display next to the tree item's label.
   */
  icon?: React.ElementType;
  /**
   * The component that animates the appearance / disappearance of the item's children.
   * @default FileElement2Group
   */
  groupTransition?: React.ElementType;
}

export interface FileElementSlotProps {
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  endIcon?: SlotComponentProps<'svg', {}, {}>;
  icon?: SlotComponentProps<'svg', {}, {}>;
  groupTransition?: SlotComponentPropsFromProps<TransitionProps, {}, {}>;
}

export interface FileElementProps extends Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileElementClasses>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: FileElementSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: FileElementSlotProps;
  /**
   * The component used to render the content of the item.
   * @default FileElementContent
   */
  ContentComponent?: React.JSXElementConstructor<FileElementContentProps>;
  /**
   * Props applied to ContentComponent.
   */
  ContentProps?: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * This prop isn't supported.
   * Use the `onItemFocus` callback on the tree if you need to monitor a item's focus.
   */
  onFocus?: null;
  /**
   * The tree item label.
   */
  name?: string;
  /**
   * The tree item label.
   */
  label?: React.ReactNode;
  /**
   * The id of the item.
   */
  itemId?: FileId;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * Callback fired when a key of the keyboard is pressed on the item.
   */
  onKeyDown?: MuiCancellableEventHandler<React.KeyboardEvent<HTMLLIElement>>;
}

export interface FileElementOwnerState extends FileElementProps {
  expanded: boolean;
  focused: boolean;
  selected: boolean;
  disabled: boolean;
  indentationAtItemLevel: boolean;
}

/**
 * Plugins that need to be present in the Tree View in order for `FileElement` to work correctly.
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
 * Plugins that `FileElement` can use if they are present, but are not required.
 */
export type FileElementOptionalPlugins = readonly [];
