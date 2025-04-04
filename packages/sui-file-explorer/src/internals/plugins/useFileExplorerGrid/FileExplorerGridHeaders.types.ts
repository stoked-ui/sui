/**
 * @module FileExplorerGridHeaders
 *
 * The FileExplorerGridHeaders component is responsible for rendering the grid headers of a file explorer.
 * It provides customizable slots and props to override or extend its behavior.
 */

import * as React from 'react';
import {SlotComponentProps} from '@mui/base/utils';
import {SxProps, Theme} from "@mui/system";
import {UseFileExplorerGridHeadersParameters} from './useFileExplorerGridHeaders.types';
import {FileExplorerGridHeadersClasses} from './fileExplorerViewGridHeadersClasses';
import {MuiCancellableEventHandler} from '../../models/MuiCancellableEvent';

/**
 * @interface FileExplorerGridHeadersSlots
 * @description The component that renders the root.
 * @default FileRoot
 */
export interface FileExplorerGridHeadersSlots {
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
 * @interface FileExplorerGridHeadersSlotProps
 * @description Props used for each component slot.
 * @default {}
 */
export interface FileExplorerGridHeadersSlotProps {
  root?: SlotComponentProps<'div', {}, {}>;
  column?: SlotComponentProps<'div', {}, {}>;
  groupTransition?: SlotComponentProps<'div', {}, {}>;
  iconContainer?: SlotComponentProps<'div', {}, {}>;
  name?: SlotComponentProps<'div', {}, {}>;
}

/**
 * @interface FileExplorerGridHeadersProps
 * @description Props used to customize the FileExplorerGridHeaders component.
 * @extends Omit<UseFileExplorerGridHeadersParameters, 'rootRef'>,
 *          Omit<React.HTMLAttributes<HTMLDivElement>, 'onFocus' | 'id'>
 */
export interface FileExplorerGridHeadersProps
  extends Omit<UseFileExplorerGridHeadersParameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onFocus' | 'id'> {
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string;

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

  /**
   * Override or extend the styles applied to the component.
   */
  sx?: SxProps<Theme>;
}

/**
 * @interface FileExplorerGridHeadersOwnerState
 * @description The state used by the FileExplorerGridHeaders component owner.
 * @extends Omit<FileExplorerGridHeadersProps, 'disabled'>
 */
export interface FileExplorerGridHeadersOwnerState extends Omit<FileExplorerGridHeadersProps, 'disabled'> {}