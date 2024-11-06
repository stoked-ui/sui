import * as React from 'react';
import {SxProps, Theme} from "@mui/material/styles";
import type { IController } from '../Controller/Controller.types';
import type {ITimelineAction} from "../TimelineAction/TimelineAction.types";
import {type ITimelineTrack} from "../TimelineTrack/TimelineTrack.types";

export interface TimelineControlPropsBase<
  ControllerType extends IController = IController,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
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
   * @description Custom scale rendering
   */
  getScaleRender?: (scale: number) => React.ReactNode;
  /**
   * @description Start moving callback
   */
  onActionMoveStart?: (params: { action: ActionType; track: TrackType }) => void;
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving?: (params: { action: ActionType; track: TrackType; start: number; end: number }) => void | boolean;
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd?: (params: { action: ActionType; track: TrackType; start: number; end: number }) => void;
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart?: (params: { action: ActionType; track: TrackType; dir: 'right' | 'left' }) => void;
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing?: (params: { action: ActionType; track: TrackType; start: number; end: number; dir: 'right' | 'left' }) => void | boolean;
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd?: (params: { action: ActionType; track: TrackType; start: number; end: number; dir: 'right' | 'left' }) => void;
  /**
   * @description Click track callback
   */
  onClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * @description click action callback
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ActionType;
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ActionType;
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * @description Double-click track callback
   */
  onDoubleClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * @description Double-click action callback
   */
  onDoubleClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ActionType;
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * @description Right-click track callback
   */
  onContextMenuTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * @description Right-click action callback
   */
  onContextMenuAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ActionType;
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds?: (params: { action: ActionType; tracks: TrackType[]; track: TrackType }) => string[];
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
