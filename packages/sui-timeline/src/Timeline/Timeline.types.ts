import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import { type IController } from '../Controller/Controller.types';
import {TimelineClasses} from './timelineClasses';
import {type ITimelineTrack} from "../TimelineTrack/TimelineTrack.types";
import {type TimelineLabelsProps} from "../TimelineLabels/TimelineLabels.types";
import {TimelineControlProps} from "./TimelineControlProps";
import { ITimelineAction, ITimelineFileAction } from "../TimelineAction";
import { ITimelineFile } from "../TimelineFile";

export type TimelineComponent = ((
  props: TimelineProps & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element) & { propTypes?: any };

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

export interface TimelineSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineProps>;
  labels?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  time?: SlotComponentProps<'div', {}, TimelineControlProps>;
  trackArea?: SlotComponentProps<'div', {}, TimelineControlProps>;
  resizer?: SlotComponentProps<'div', {}, TimelineControlProps>;
}

export interface TimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  actions?: ITimelineFileAction[],
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

  labelsSx?: SxProps<Theme>;
  locked?: boolean;
  onAddFiles?: () => void;


  /**
   * @description Right-click action callback
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
   * @description Right-click track callback
   */
  onContextMenuTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * @description Click label callback
   */
  onClickLabel?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    track: ITimelineTrack,
  ) => void;

  /**
   * @description Click track callback
   */
  onClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * @description Click track callback
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;


  scaleWidth?: number;

  setScaleWidth?: (scaleWidth: number) => void;

  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimelineSlotProps;

  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimelineSlots;

  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  trackSx?: SxProps<Theme>;

  viewSelector?: string;
}
