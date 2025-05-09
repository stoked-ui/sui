import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SlotComponentProps } from '@mui/base/utils';
import { SxProps } from '@mui/system';
import { FileDropzoneClasses } from './fileDropzoneClasses';

/**
 * Represents the slots available for customization in the FileDropzone component.
 */
export interface FileDropzoneSlots {
  /**
   * Element rendered at the root.
   * @default FileDropzoneRoot
   */
  root?: React.ElementType;
}

/**
 * Represents the props for customizing the slots in the FileDropzone component.
 */
export interface FileDropzoneSlotProps {
  root?: SlotComponentProps<'div', {}, {}>;
}

/**
 * Represents the props for the FileDropzone component.
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