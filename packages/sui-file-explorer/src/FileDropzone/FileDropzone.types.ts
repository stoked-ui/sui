/**
 * FileDropzone component props
 *
 * Provides configuration options for the FileDropzone component.
 */

import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SlotComponentProps } from '@mui/base/utils';
import { SxProps } from '@mui/system';
import { FileDropzoneClasses } from './fileDropzoneClasses';

/**
 * Props for the root element of the FileDropzone component.
 */
export interface FileDropzoneSlots {
  /**
   * The root element type. Defaults to `FileDropzoneRoot`.
   */
  root?: React.ElementType;
}

/**
 * Props for the component slots of the FileDropzone component.
 */
export interface FileDropzoneSlotProps {
  /**
   * The props used for each component slot.
   */
  root?: SlotComponentProps<'div', {}, {}>;
}

/**
 * Props for the FileDropzone component.
 *
 * Extends React HTML attributes and provides configuration options for
 * rendering content, slots, and styles.
 */
export interface FileDropzoneProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Overridable component slots.
   */
  slots?: FileDropzoneSlots;
  /**
   * The props used for each component slot.
   */
  slotProps?: FileDropzoneSlotProps;
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileDropzoneClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
}