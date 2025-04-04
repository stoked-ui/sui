import * as React from 'react';
import {SlotComponentProps} from '@mui/base/utils';
import {SxProps, Theme} from '@mui/material/styles'
import {UseFileStatus} from '../models/UseFileStatus';

/**
 * Configuration for the file icon component.
 */
export interface FileIconSlots {
  /**
   * The icon used to collapse the item.
   * @default null
   */
  collapseIcon?: React.ElementType;
  /**
   * The icon used to expand the item.
   * @default null
   */
  expandIcon?: React.ElementType;
  /**
   * The icon displayed next to an end item.
   * @default null
   */
  endIcon?: React.ElementType;
  /**
   * The icon to display next to the fileExplorer item's label.
   * @default null
   */
  icon?: React.ElementType;
}

/**
 * Props for the component slots of the file icon component.
 */
export interface FileIconSlotProps {
  /**
   * The props used for the collapse icon slot.
   * @default {root: null}
   */
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  /**
   * The props used for the expand icon slot.
   * @default {root: null}
   */
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  /**
   * The props used for the end icon slot.
   * @default {root: null}
   */
  endIcon?: SlotComponentProps<'svg', {}, {}>;
  /**
   * The props used for the icon slot.
   * @default {root: null}
   */
  icon?: SlotComponentProps<'svg', {}, {}>;
}

/**
 * Props for the file icon component.
 */
export interface FileIconProps {
  /**
   * The current status of the file.
   * @required
   */
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

  /**
   * The icon name to use, can be 'collapseIcon', 'expandIcon', 'endIcon', or 'icon'.
   * @default null
   */
  iconName?: 'collapseIcon' | 'expandIcon' | 'endIcon' | 'icon';

  /**
   * Custom styles for the component.
   * @default {}
   */
  sx?: SxProps<Theme>;
}