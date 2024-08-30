import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import { ITimelineActionType, ITimelineAction } from '../TimelineAction/TimelineAction.types';
import { TimelineClasses } from './timelineClasses';
import { ITimelineTrack } from "../TimelineTrack";
import { TimelineLabelsProps } from "../TimelineLabels/TimelineLabels.types";
import TimelineState from "./TimelineState";
import { ITimelineEngine } from '../TimelineEngine/TimelineEngine';
import {TimelineTrackAreaProps} from "../TimelineTrackArea/TimelineTrackArea.types";
import {TimelineTimeAreaProps} from "../TimelineTimeArea/TimelineTimeArea.types";
import {ScrollResizerProps} from "../ScrollResizer/ScrollResizer.types";

export type TimelineComponent = ((
  props: TimelineProps,
) => React.JSX.Element) & { propTypes?: any };

export interface TimelineSlots {
  root?: React.ElementType;
  labels?: React.ElementType;
  time?: React.ElementType;
  tracks?: React.ElementType;
  scroll?: React.ElementType;
}

export interface TimelineSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineProps>;
  labels?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  time?: SlotComponentProps<'div', {}, TimelineTimeAreaProps>;
  tracks?: SlotComponentProps<'div', {}, {}>;
  scroll?: SlotComponentProps<'div', {}, {}>;
}

export interface TimelineBaseProps {
  /**
   * @description TimelineControl editing data
   */
  tracks: ITimelineTrack[];
  /**
   * @description Data change callback, which will be triggered after the operation action end
   *   changes the data (returning false will prevent automatic engine synchronization to reduce
   *   performance overhead)
   */
  setTracks: (updatedTracks: ITimelineTrack[]) => void;
  /**
   *  @description scroll distance from left
   *
   */
  scrollLeft?: number;
  /**
   * @description timelineControl action actionType map
   */
  actionTypes?: Record<string, ITimelineActionType>;
  /**
   * @description Single tick mark category (>0)
   * @default 1
   */
  scale?: number;
  /**
   * @description Minimum number of ticks (>=1)
   * @default 20
   */
  minScaleCount?: number;
  /**
   * @description Maximum number of scales (>=minScaleCount)
   * @default Infinity
   */
  maxScaleCount?: number;
  /**
   * @description Number of single scale subdivision units (>0 integer)
   * @default 10
   */
  scaleSplitCount?: number;
  /**
   * @description Display width of a single scale (>0, unit: px)
   * @default 160
   */
  scaleWidth?: number;
  /**
   * @description The distance from the start of the scale to the left (>=0, unit: px)
   * @default 20
   */
  startLeft?: number;
  /**
   * @description Default height of each edit line (>0, unit: px)
   * @default 32
   */
  rowHeight?: number;
  /**
   * @description Whether to enable grid movement adsorption
   * @default false
   */
  gridSnap?: boolean;
  /**
   * @description Start dragging auxiliary line adsorption
   * @default false
   */
  dragLine?: boolean;
  /**
   * @description whether to hide the cursor
   * @default false
   */
  hideCursor?: boolean;
  /**
   * @description Disable dragging of all action areas
   * @default false
   */
  disableDrag?: boolean;
  /**
   * @description timelineControl runner, if not passed, the built-in runner will be used
   */
  engine?: React.RefObject<ITimelineEngine>;
  /**
   * @description Custom action area rendering
   */
  getActionRender?: (action: ITimelineAction, track: ITimelineTrack) => React.ReactNode;
  /**
   * @description Custom scale rendering
   */
  getScaleRender?: (scale: number) => React.ReactNode;
  /**
   * @description Start moving callback
   */
  onActionMoveStart?: (params: { action: ITimelineAction; track: ITimelineTrack }) => void;
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving?: (params: { action: ITimelineAction; track: ITimelineTrack; start: number; end: number }) => void | boolean;
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd?: (params: { action: ITimelineAction; track: ITimelineTrack; start: number; end: number }) => void;
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart?: (params: { action: ITimelineAction; track: ITimelineTrack; dir: 'right' | 'left' }) => void;
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing?: (params: { action: ITimelineAction; track: ITimelineTrack; start: number; end: number; dir: 'right' | 'left' }) => void | boolean;
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd?: (params: { action: ITimelineAction; track: ITimelineTrack; start: number; end: number; dir: 'right' | 'left' }) => void;
  /**
   * @description Click track callback
   */
  onClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;
  /**
   * @description click action callback
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
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;
  /**
   * @description Double-click track callback
   */
  onDoubleClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;
  /**
   * @description Double-click action callback
   */
  onDoubleClickAction?: (
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
  onContextMenuRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;
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
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds?: (params: { action: ITimelineAction; tracks: ITimelineTrack[]; track: ITimelineTrack }) => string[];
  /**
   * @description cursor starts drag event
   */
  onCursorDragStart?: (time: number) => void;
  /**
   * @description cursor ends drag event
   */
  onCursorDragEnd?: (time: number) => void;
  /**
   * @description cursor drag event
   */
  onCursorDrag?: (time: number) => void;
  /**
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea?: (time: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | undefined;

  sx?: SxProps<Theme>;

  trackSx?: SxProps<Theme>;

  viewSelector?: string;
}

/**
 * Animation editor parameters
 * @export
 * @interface TimelineControlProps
 */
export interface TimelineProps
  extends TimelineBaseProps,
    React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
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
  tracksSx?: SxProps<Theme>;
  timeSx?: SxProps<Theme>;


  actionTypes: Record<string, ITimelineActionType>;
  timelineState?: React.RefObject<TimelineState>;
  viewSelector?: string;
  engine?: React.RefObject<ITimelineEngine>;
  labels?: boolean;
  scaleWidth?: number;
  /**
   * @description Whether to start automatic scrolling when dragging
   * @default false
   */
  autoScroll?: boolean;
  /**
   * @description Custom timelineControl style
   */
  style?: React.CSSProperties;
  /**
   * @description Whether to automatically re-render (update tick when data changes or cursor time
   *   changes)
   * @default true
   */
  autoReRender?: boolean;


  setScaleWidth?: (scaleWidth: number) => void;

  labelProps?: any;
}
