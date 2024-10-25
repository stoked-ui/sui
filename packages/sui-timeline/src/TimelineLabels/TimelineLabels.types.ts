import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import { IController } from '../Engine/Controller.types';
import {TimelineLabelsClasses} from './timelineLabelsClasses';
import {TimelineState} from "../Timeline/TimelineState";
import { ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";
import {IEngine, ViewMode} from "../Engine";
import { MediaFile } from '@stoked-ui/media-selector';

export interface TimelineLabelsSlots {
  /**
   * Element rendered at the root.
   * @default TimelineLabelsRoot
   */
  root?: React.ElementType;
  label?: React.ElementType;
}

export interface TimelineLabelsSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  label?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
}

export interface TimelineLabelsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TimelineLabelsClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  engineRef: React.RefObject<IEngine>;

  tracks: ITimelineTrack[];
  controllers: Record<string, IController>
  viewMode: ViewMode;
  detailMode?: boolean;

  onAddFiles?: (mediaFiles: MediaFile[]) => void;
}

export interface TimelineLabelsProps
  extends Omit<TimelineLabelsPropsBase, 'onToggle'> {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimelineLabelsSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimelineLabelsSlotProps;

  onToggle?: (id: string, property: string) => void;
  setFlags?: (id: string) => string[];
  setTracks:  React.Dispatch<React.SetStateAction<ITimelineTrack[]>>;
}
