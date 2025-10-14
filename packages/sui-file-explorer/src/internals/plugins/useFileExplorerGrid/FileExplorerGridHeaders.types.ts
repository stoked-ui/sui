import * as React from 'react';
import {SlotComponentProps} from '@mui/base/utils';
import {SxProps, Theme} from "@mui/system";
import {UseFileExplorerGridHeadersParameters} from './useFileExplorerGridHeaders.types';
import {FileExplorerGridHeadersClasses} from './fileExplorerViewGridHeadersClasses';
import {MuiCancellableEventHandler} from '../../models/MuiCancellableEvent';

/**
 * Represents the available slots for the FileExplorerGridHeaders component.
 */
export interface FileExplorerGridHeadersSlots {
  /**
   * The component that renders the root.
   * @default FileRoot
   */
  root?: React.ElementType;
  /**
   * The component that renders the content of the item.
   * (e.g.: everything related to this item, not to its children).
   * @default FileContent
   */
  column?: React.ElementType;
  /**
   * The component that renders the children of the item.
   * @default FileGroupTransition
   */
  groupTransition?: React.ElementType;
  /**
   * The component that renders the icon.
   * @default FileIconContainer
   */
  iconContainer?: React.ElementType;
  /**
   * The component that renders the item label.
   * @default FileLabel
   */
  name?: React.ElementType;
}

/**
 * Represents the props for each slot in the FileExplorerGridHeaders component.
 */
export interface FileExplorerGridHeadersSlotProps {
  root?: SlotComponentProps<'div', {}, {}>;
  column?: SlotComponentProps<'div', {}, {}>;
  groupTransition?: SlotComponentProps<'div', {}, {}>;
  iconContainer?: SlotComponentProps<'div', {}, {}>;
  name?: SlotComponentProps<'div', {}, {}>;
}

/**
 * Represents the props for the FileExplorerGridHeaders component.
 */
export interface FileExplorerGridHeadersProps
  extends Omit<UseFileExplorerGridHeadersParameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onFocus' | 'id'> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileExplorerGridHeadersClasses>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: FileExplorerGridHeadersSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: FileExplorerGridHeadersSlotProps;
  /**
   * This prop isn't supported.
   * Use the `onItemFocus` callback on the tree if you need to monitor an item's focus.
   */
  onFocus?: null;
  /**
   * Callback fired when the item root is blurred.
   */
  onBlur?: MuiCancellableEventHandler<React.FocusEvent<HTMLDivElement>>;
  /**
   * Callback fired when a key is pressed on the keyboard and the tree is in focus.
   */
  onKeyDown?: MuiCancellableEventHandler<React.KeyboardEvent<HTMLDivElement>>;

  sx?: SxProps<Theme>;
}

/**
 * Represents the state of the FileExplorerGridHeaders component.
 */
export interface FileExplorerGridHeadersOwnerState extends Omit<FileExplorerGridHeadersProps, 'disabled'> {}