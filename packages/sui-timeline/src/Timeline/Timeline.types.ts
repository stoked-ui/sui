import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import { ITimelineActionType } from '../TimelineAction/TimelineAction.types';
import { TimelineClasses } from './timelineClasses';
import { TimelineControl } from "../TimelineControl/TimelineControl";
import { TimelineControlProps } from "../TimelineControl/TimelineControl.types";
import { TimelineTrack } from "../interface/TimelineAction";
import { TimelineLabelsProps } from "../TimelineLabels/TimelineLabels.types";
import { TimelineState } from "./TimelineState";
import { ITimelineEngine } from '../TimelineEngine/TimelineEngine';

export interface TimelineSlots {
  /**
   * Element rendered at the root.
   * @default TimelineRoot
   */
  root?: React.ElementType;
  labels?: React.ElementType;
  control?: typeof TimelineControl;
}

export interface TimelineSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineProps>;
  labels?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  control?: SlotComponentProps<'div', {}, TimelineControlProps>;
}

export interface TimelinePropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TimelineClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  labelsSx?: SxProps<Theme>;
  labelSx?: SxProps<Theme>;
  controlSx?: SxProps<Theme>;
  trackSx?: SxProps<Theme>;

  tracks?: TimelineTrack[];
  actionTypes: Record<string, ITimelineActionType>;
  timelineState?: React.RefObject<TimelineState>;
  viewSelector?: string;
  engine?: ITimelineEngine;
}

export interface TimelineProps
  extends TimelinePropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimelineSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimelineSlotProps;
}
