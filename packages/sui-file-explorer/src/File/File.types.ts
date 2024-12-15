import * as React from 'react';
import {SlotComponentProps} from '@mui/base/utils';
import {SxProps, Theme} from "@mui/system";
import {UseFileParameters} from '../useFile/useFile.types';
import {FileClasses} from './fileClasses';
import {FileIconSlotProps, FileIconSlots} from '../internals/FileIcon';
import {MuiCancellableEventHandler} from '../internals/models/MuiCancellableEvent';
import {UseFileStatus} from '../internals/models/UseFileStatus';

export type FileComponent = ((
  props: FileProps & React.RefAttributes<HTMLLIElement>,
) => React.JSX.Element) & { propTypes?: any } & any;

export interface FileSlots extends FileIconSlots {
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
  content?: React.ElementType;
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
   * The component that renders the item checkbox for selection.
   * @default FileCheckbox
   */
  checkbox?: React.ElementType;
  /**
   * The component that renders the item label.
   * @default FileLabel
   */
  name?: React.ElementType;

}

export interface FileSlotProps extends FileIconSlotProps {
  root?: SlotComponentProps<'li' | 'div', {}, {}>;
  content?: SlotComponentProps<'div', {}, {}>;
  groupTransition?: SlotComponentProps<'div', {}, {}>;
  iconContainer?: SlotComponentProps<'div', {}, {}>;
  checkbox?: SlotComponentProps<'button', {}, {}>;
  name?: SlotComponentProps<'div', {}, {}>;
}

export interface FileProps
  extends Omit<UseFileParameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement | HTMLDivElement>, 'onFocus'> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileClasses>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: FileSlots;
  /**
   * The props used for each component slot.
   * @default {}
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
  onKeyDown?: MuiCancellableEventHandler<React.KeyboardEvent<HTMLLIElement | HTMLDivElement>>;

  sx?: SxProps<Theme>;
}
export interface FileOwnerState extends Omit<FileProps, 'disabled'>, UseFileStatus {}
