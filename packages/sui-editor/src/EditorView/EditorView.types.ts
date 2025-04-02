import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import { IMediaFile } from "@stoked-ui/media-selector";
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

export interface EditorViewSlotProps<R extends IMediaFile, Multiple extends boolean | undefined> {
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
}

export interface EditorViewProps<R extends IMediaFile, Multiple extends boolean | undefined>
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

  children?: React.ReactNode;

  viewButtons?: React.ReactElement[];
  viewButtonAppear?: number;
  viewButtonEnter?: number;
  viewButtonExit?: number;

  editorId: string;
}

