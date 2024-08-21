import * as React from 'react';
import { OnScrollParams } from 'react-virtualized';
import { SxProps, Theme } from "@mui/material/styles";
import { ITimelineEngine } from '../TimelineEngine/TimelineEngine';
import { TimelineTrack } from '../interface/TimelineAction';
import { ITimelineAction, ITimelineActionType } from '../TimelineAction/TimelineAction.types';
export * from '../interface/TimelineAction';
export * from '../TimelineAction/TimelineAction.types';

export interface EditData {
  /**
   * @description TimelineControl editing data
   */
  tracks: TimelineTrack[];
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
  engine?: ITimelineEngine;
  /**
   * @description Custom action area rendering
   */
  getActionRender?: (action: ITimelineAction, track: TimelineTrack) => React.ReactNode;
  /**
   * @description Custom scale rendering
   */
  getScaleRender?: (scale: number) => React.ReactNode;
  /**
   * @description Start moving callback
   */
  onActionMoveStart?: (params: { action: ITimelineAction; track: TimelineTrack }) => void;
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving?: (params: { action: ITimelineAction; track: TimelineTrack; start: number; end: number }) => void | boolean;
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd?: (params: { action: ITimelineAction; track: TimelineTrack; start: number; end: number }) => void;
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart?: (params: { action: ITimelineAction; track: TimelineTrack; dir: 'right' | 'left' }) => void;
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing?: (params: { action: ITimelineAction; track: TimelineTrack; start: number; end: number; dir: 'right' | 'left' }) => void | boolean;
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd?: (params: { action: ITimelineAction; track: TimelineTrack; start: number; end: number; dir: 'right' | 'left' }) => void;
  /**
   * @description Click track callback
   */
  onClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TimelineTrack;
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
      track: TimelineTrack;
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
      track: TimelineTrack;
      time: number;
    },
  ) => void;
  /**
   * @description Double-click track callback
   */
  onDoubleClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TimelineTrack;
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
      track: TimelineTrack;
      time: number;
    },
  ) => void;
  /**
   * @description Right-click track callback
   */
  onContextMenuRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TimelineTrack;
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
      track: TimelineTrack;
      time: number;
    },
  ) => void;
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds?: (params: { action: ITimelineAction; tracks: TimelineTrack[]; track: TimelineTrack }) => string[];
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
 * @interface TimelineControlProp
 */
export interface TimelineControlProps extends EditData {
  /**
   * @description The scroll distance from the top of the editing area (please use ref.setScrollTop instead)
   * @deprecated
   */
  scrollTop?: number;
  /**
   * @description Edit area scrolling callback (used to control synchronization with editing track scrolling)
   */
  onScroll?: (params: OnScrollParams) => void;
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
   * @description Whether to automatically re-render (update tick when data changes or cursor time changes)
   * @default true
   */
  autoReRender?: boolean;
  /**
   * @description Data change callback, which will be triggered after the operation action end changes the data (returning false will prevent automatic engine synchronization to reduce performance overhead)
   */
  onChange?: (tracks: TimelineTrack[]) => void | boolean;

  setScaleWidth?: (scaleWidth: number) => void;
}
