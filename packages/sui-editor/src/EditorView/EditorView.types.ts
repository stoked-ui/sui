import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import {IEngine} from "@stoked-ui/timeline";
import {FileBase} from '@stoked-ui/file-explorer/models/items';
import {EditorViewClasses} from './editorViewClasses';

export interface EditorViewSlots {
  /**
   * Element rendered at the root.
   * @default EditorViewRoot
   */
  root?: React.ElementType;
  renderer?: React.ElementType;
  preview?: React.ElementType;
}

export interface EditorViewSlotProps<R extends FileBase, Multiple extends boolean | undefined> {
  root?: SlotComponentProps<'div', {}, EditorViewProps<R, Multiple>>;
  renderer?: SlotComponentProps<'canvas', {}, {}>;
  preview?: SlotComponentProps<'div', {}, {}>;
}

export interface EditorViewPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<EditorViewClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  engine: React.RefObject<IEngine>;
}

export interface EditorViewProps<R extends FileBase, Multiple extends boolean | undefined>
  extends EditorViewPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: EditorViewSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: EditorViewSlotProps<R, Multiple>;
}
