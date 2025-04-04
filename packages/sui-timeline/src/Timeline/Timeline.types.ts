/**
 * Import necessary dependencies
 */
import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import { type IController } from '../Controller/Controller.types';
import { TimelineClasses } from './timelineClasses';
import { type ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";
import { type TimelineLabelsProps } from "../TimelineLabels/TimelineLabels.types";
import { TimelineControlProps } from "./TimelineControlProps";
import { ITimelineAction, ITimelineFileAction } from "../TimelineAction";
import { ITimelineFile } from "../TimelineFile";

/**
 * Define the TimelineComponent interface
 */
export type TimelineComponent = ((
  /**
   * Props for the component.
   */
  props: TimelineProps & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element) & { propTypes?: any };

/**
 * Define the TimelineSlots interface
 */
export interface TimelineSlots {
  /**
   * Element rendered at the root.
   * @default TimelineRoot
   */
  root?: React.ElementType;
  labels?: React.ElementType;
  time?: React.ElementType;
  trackArea?: React.ElementType;
  resizer?: React.ElementType;
}

/**
 * Define the TimelineSlotProps interface
 */
export interface TimelineSlotProps {
  /**
   * Props for each slot.
   */
  root?: SlotComponentProps<'div', {}, TimelineProps>;
  labels?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  time?: SlotComponentProps<'div', {}, TimelineControlProps>;
  trackArea?: SlotComponentProps<'div', {}, TimelineControlProps>;
  resizer?: SlotComponentProps<'div', {}, TimelineControlProps>;
}

/**
 * Define the TimelineProps interface
 */
export interface TimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Actions for the timeline.
   */
  actions?: ITimelineFileAction[];
  children?: React.ReactNode;
  className?: string;
  onScrollVertical?: React.UIEventHandler<HTMLDivElement>;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TimelineClasses>;
  collapsed?: boolean;
  controllers?: Record<string, IController>;
  detailRenderer?: boolean;
  disabled?: boolean;
  file?: ITimelineFile;
  fileUrl?: string;
  labelSx?: SxProps<Theme>;
  labels?: boolean;

  /**
   * Styles for the labels.
   */
  labelsSx?: SxProps<Theme>;
  locked?: boolean;
  onAddFiles?: () => void;

  /**
   * Right-click action callback.
   */
  onContextMenuAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * Right-click track callback.
   */
  onContextMenuTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * Click label callback.
   */
  onClickLabel?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    track: ITimelineTrack,
  ) => void;

  /**
   * Click track callback.
   */
  onClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * Click action callback.
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * Scale width for the timeline.
   */
  scaleWidth?: number;

  /**
   * Set the scale width for the timeline.
   */
  setScaleWidth?: (scaleWidth: number) => void;

  /**
   * Props used for each component slot.
   */
  slotProps?: TimelineSlotProps;

  /**
   * Overridable component slots.
   */
  slots?: TimelineSlots;

  /**
   * System prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  /**
   * Styles for the track.
   */
  trackSx?: SxProps<Theme>;

  /**
   * View selector for the timeline.
   */
  viewSelector?: string;
  internalComponent?: boolean;
}