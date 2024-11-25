import * as React from 'react';
import {SxProps, Theme} from "@mui/material/styles";
import type {ITimelineAction} from "../TimelineAction/TimelineAction.types";
import {type ITimelineTrack} from "../TimelineTrack/TimelineTrack.types";

export interface TimelineControlPropsBase<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /* /!**
   * @description Single tick mark category (>0)
   * @default 1
   *!/
  scale?: number;
  /!**
   * @description Minimum number of ticks (>=1)
   * @default 20
   *!/
  minScaleCount?: number;
  /!**
   * @description Maximum number of scales (>=minScaleCount)
   * @default Infinity
   *!/
  maxScaleCount?: number;
  /!**
   * @description Number of single scale subdivision units (>0 integer)
   * @default 10
   *!/
  scaleSplitCount?: number;
  /!**
   * @description Display width of a single scale (>0, unit: px)
   * @default 160
   *!/
  scaleWidth?: number;
  /!**
   * @description The distance from the start of the scale to the left (>=0, unit: px)
   * @default 20
   *!/
  startLeft?: number;
  /!**
   * @description Default height of each edit line (>0, unit: px)
   * @default 32
   *!/
  trackHeight?: number;
  /**
   * @description Whether to enable grid movement adsorption
   * @default false
   *!/
  gridSnap?: boolean;
  /!**
   * @description Start dragging auxiliary line adsorption
   * @default false
   *!/
  dragLine?: boolean;
  /!**
   * @description whether to hide the cursor
   * @default false
   *!/
  hideCursor?: boolean;
  /!**
   * @description Disable dragging of all action areas
   * @default false
   *!/
  disableDrag?: boolean;
  */
  /**
   * @description Custom scale rendering
   */
  getScaleRender?: (scale: number) => React.ReactNode;
   /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds?: (params: { action: ActionType; tracks: TrackType[]; track: TrackType }) => string[];

  /**
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea?: (time: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | undefined;

  sx?: SxProps<Theme>;
  /*
  trackSx?: SxProps<Theme>;

  viewSelector?: string;
   */
}
