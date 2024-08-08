import * as React from 'react';
import { SlotComponentProps } from '@mui/base/utils';
import { UseFileStatus } from '../models/UseFileStatus';

export interface FileIconSlots {
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
   * The icon to display next to the fileExplorer item's label.
   */
  icon?: React.ElementType;
}

export interface FileIconSlotProps {
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  endIcon?: SlotComponentProps<'svg', {}, {}>;
  icon?: SlotComponentProps<'svg', {}, {}>;
}

export interface FileIconProps {
  status: UseFileStatus;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: FileIconSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: FileIconSlotProps;
}
