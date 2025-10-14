import * as React from 'react';
import { SlotComponentProps } from '@mui/base/utils';
import { SxProps, Theme } from '@mui/material/styles';
import { UseFileStatus } from '../models/UseFileStatus';

/**
 * Represents the available icon slots for the FileIcon component.
 */
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

/**
 * Represents the props for each slot component of the FileIcon component.
 */
export interface FileIconSlotProps {
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  endIcon?: SlotComponentProps<'svg', {}, {}>;
  icon?: SlotComponentProps<'svg', {}, {}>;
}

/**
 * Represents the props for the FileIcon component.
 */
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

  /**
   * Specifies the name of the icon to be used.
   */
  iconName?: 'collapseIcon' | 'expandIcon' | 'endIcon' | 'icon';

  /**
   * Custom styling for the component.
   */
  sx?: SxProps<Theme>;
}