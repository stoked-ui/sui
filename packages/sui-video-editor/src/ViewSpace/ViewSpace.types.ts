import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import { FileBase } from '@stoked-ui/file-explorer/models/items';
import { ViewSpaceClasses } from './viewSpaceClasses';


export interface ViewSpaceSlots {
  /**
   * Element rendered at the root.
   * @default ViewSpaceRoot
   */
  root?: React.ElementType;
}

export interface ViewSpaceSlotProps<R extends FileBase, Multiple extends boolean | undefined> {
  root?: SlotComponentProps<'div', {}, ViewSpaceProps<R, Multiple>>;
}

export interface ViewSpacePropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ViewSpaceClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
}

export interface ViewSpaceProps<R extends FileBase, Multiple extends boolean | undefined>
  extends ViewSpacePropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: ViewSpaceSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: ViewSpaceSlotProps<R, Multiple>;
}
