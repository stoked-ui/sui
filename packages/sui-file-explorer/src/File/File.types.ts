/**
 * @module FileComponent
 * @description The FileComponent is a React component that represents a file item.
 */

import * as React from 'react';
import {SlotComponentProps} from '@mui/base/utils';
import {SxProps, Theme} from "@mui/system";
import {UseFileParameters} from '../useFile/useFile.types';
import {FileClasses} from './fileClasses';
import {FileIconSlotProps, FileIconSlots} from '../internals/FileIcon';
import {MuiCancellableEventHandler} from '../internals/models/MuiCancellableEvent';
import {UseFileStatus} from '../internals/models/UseFileStatus';

/**
 * The FileComponent is a React component that represents a file item.
 * It can be customized with various props to display different information.
 */
export type FileComponent = ((
  props: FileProps & React.RefAttributes<HTMLLIElement>,
) => React.JSX.Element) & { propTypes?: any } & any;

/**
 * @interface FileSlots
 * @description The FileSlots interface defines the possible slots for a file item.
 */

export interface FileSlots extends FileIconSlots {
  /**
   * The component that renders the root.
   * Defaults to FileRoot if not specified.
   */
  root?: React.ElementType;
  /**
   * The component that renders the content of the item.
   * Defaults to FileContent if not specified.
   */
  content?: React.ElementType;
  /**
   * The component that renders the children of the item.
   * Defaults to FileGroupTransition if not specified.
   */
  groupTransition?: React.ElementType;
  /**
   * The component that renders the icon.
   * Defaults to FileIconContainer if not specified.
   */
  iconContainer?: React.ElementType;
  /**
   * The component that renders the item checkbox for selection.
   * Defaults to FileCheckbox if not specified.
   */
  checkbox?: React.ElementType;
  /**
   * The component that renders the item label.
   * Defaults to FileLabel if not specified.
   */
  name?: React.ElementType;

}

/**
 * @interface FileSlotProps
 * @description The FileSlotProps interface defines the possible props for a file slot.
 */

export interface FileSlotProps extends FileIconSlotProps {
  /**
   * The component that renders the root.
   * Defaults to SlotComponentProps<'li' | 'div', {}, {}> if not specified.
   */
  root?: SlotComponentProps<'li' | 'div', {}, {}>;
  /**
   * The component that renders the content of the item.
   * Defaults to SlotComponentProps<'div', {}, {}> if not specified.
   */
  content?: SlotComponentProps<'div', {}, {}>;
  /**
   * The component that renders the children of the item.
   * Defaults to SlotComponentProps<'div', {}, {}> if not specified.
   */
  groupTransition?: SlotComponentProps<'div', {}, {}>;
  /**
   * The component that renders the icon.
   * Defaults to SlotComponentProps<'div', {}, {}> if not specified.
   */
  iconContainer?: SlotComponentProps<'div', {}, {}>;
  /**
   * The component that renders the item checkbox for selection.
   * Defaults to SlotComponentProps<'button', {}, {}> if not specified.
   */
  checkbox?: SlotComponentProps<'button', {}, {}>;
  /**
   * The component that renders the item label.
   * Defaults to SlotComponentProps<'div', {}, {}> if not specified.
   */
  name?: SlotComponentProps<'div', {}, {}>;

}

/**
 * @interface FileProps
 * @description The FileProps interface defines the possible props for a file item.
 */

export interface FileProps
  extends Omit<UseFileParameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement | HTMLDivElement>, 'onFocus'> {
  /**
   * An optional class name to apply to the component.
   */
  className?: string;
  /**
   * The styles applied to the component.
   */
  classes?: Partial<FileClasses>;
  /**
   * Overridable component slots.
   * Defaults to {} if not specified.
   */
  slots?: FileSlots;
  /**
   * The props used for each component slot.
   * Defaults to {} if not specified.
   */
  slotProps?: FileSlotProps;
  /**
   * This prop isn't supported.
   * Use the `onItemFocus` callback on the tree if you need to monitor an item's focus.
   */
  onFocus?: null;
  /**
   * Callback fired when the item root is blurred.
   */
  onBlur?: MuiCancellableEventHandler<React.FocusEvent<HTMLLIElement | HTMLDivElement>>;
  /**
   * Callback fired when a key is pressed on the keyboard and the tree is in focus.
   */
  onKeyDown?: MuiCancellabaleEventHandler<React.KeyboardEvent<HTMLLIElement | HTMLDivElement>>;

  /**
   * Custom styles applied to the component.
   */
  sx?: SxProps<Theme>;
}

/**
 * @interface FileOwnerState
 * @description The FileOwnerState interface defines the possible state for a file owner.
 */

export interface FileOwnerState extends Omit<FileProps, 'disabled'>, UseFileStatus {
}