import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import {FileBase} from '@stoked-ui/file-explorer/models/items';
import {IEngine, TimelineState} from '@stoked-ui/timeline';
import {EditorControlsClasses} from './editorControlsClasses';

export interface EditorControlsSlots {
  /**
   * Element rendered at the root.
   * @default EditorControlsRoot
   */
  root?: React.ElementType;
}

export interface EditorControlsSlotProps<R extends FileBase, Multiple extends boolean | undefined> {
  root?: SlotComponentProps<'div', {}, EditorControlsProps<R, Multiple>>;
}

export interface EditorControlsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<EditorControlsClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /*
  * The scale of the video
  * @default 1
  */
  scale?: number;
  setScaleWidth: (scaleWidth: number) => void;
  /*
  * The width of the scale
  * @default 160
  */
  scaleWidth?: number;
  /*
  * How many ticks to the left of the view at start
  * @default 20
  */
  startLeft?: number;
  timelineState: React.RefObject<TimelineState>;
  engineRef: React.RefObject<IEngine>;
  autoScroll: boolean;
  view: 'timeline' | 'files',
  setView: (newView: 'timeline' | 'files') => void
}

export interface EditorControlsProps<R extends FileBase, Multiple extends boolean | undefined>
  extends EditorControlsPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: EditorControlsSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: EditorControlsSlotProps<R, Multiple>;
}
