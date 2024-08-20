import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import { FileBase } from '@stoked-ui/file-explorer/models/items';
import { TimelineState, TimelineTrack } from '@stoked-ui/timeline';
import { VideoEditorControlsClasses } from './videoEditorControlsClasses';

export interface VideoEditorControlsSlots {
  /**
   * Element rendered at the root.
   * @default VideoEditorControlsRoot
   */
  root?: React.ElementType;
}

export interface VideoEditorControlsSlotProps<R extends FileBase, Multiple extends boolean | undefined> {
  root?: SlotComponentProps<'div', {}, VideoEditorControlsProps<R, Multiple>>;
}

export interface VideoEditorControlsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<VideoEditorControlsClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /*
  * The scale of the video
  * @default 1
  */
  scale?: number;
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
  timelineState?: React.RefObject<TimelineState>;
  editorData?: TimelineTrack[];
  autoScrollWhenPlay: boolean;
}

export interface VideoEditorControlsProps<R extends FileBase, Multiple extends boolean | undefined>
  extends VideoEditorControlsPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: VideoEditorControlsSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: VideoEditorControlsSlotProps<R, Multiple>;
}
