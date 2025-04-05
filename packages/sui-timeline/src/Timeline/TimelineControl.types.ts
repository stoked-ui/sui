import * as React from 'react';
import {SxProps, Theme} from "@mui/material/styles";
import type {ITimelineAction} from "../TimelineAction/TimelineAction.types";
import {type ITimelineTrack} from "../TimelineTrack/TimelineTrack.types";

/**
 * @typedef {Object} TimelineControlPropsBase
 * @property {number} [scale=1] - Single tick mark category (>0)
 * @property {number} [minScaleCount=20] - Minimum number of ticks (>=1)
 * @property {number} [maxScaleCount=Infinity] - Maximum number of scales (>=minScaleCount)
 * @property {number} [scaleSplitCount=10] - Number of single scale subdivision units (>0 integer)
 * @property {number} [scaleWidth=160] - Display width of a single scale (>0, unit: px)
 * @property {number} [startLeft=20] - The distance from the start of the scale to the left (>=0, unit: px)
 * @property {number} [trackHeight=32] - Default height of each edit line (>0, unit: px)
 * @property {boolean} [gridSnap=false] - Whether to enable grid movement adsorption
 * @property {boolean} [dragLine=false] - Start dragging auxiliary line adsorption
 * @property {boolean} [hideCursor=false] - Whether to hide the cursor
 * @property {boolean} [disableDrag=false] - Disable dragging of all action areas
 * @property {(scale: number) => React.ReactNode} [getScaleRender] - Custom scale rendering
 * @property {(params: { action: ActionType; tracks: TrackType[]; track: TrackType }) => string[]} [getAssistDragLineActionIds] - Get the action id list to prompt the auxiliary line. Calculate it when move/resize start. By default, get all the action ids except the current move action.
 * @property {(time: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | undefined} [onClickTimeArea] - Click time area event, prevent setting time when returning false
 * @property {SxProps<Theme>} [sx] - Styling properties
 */
export interface TimelineControlPropsBase<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  scale?: number;
  minScaleCount?: number;
  maxScaleCount?: number;
  scaleSplitCount?: number;
  scaleWidth?: number;
  startLeft?: number;
  trackHeight?: number;
  gridSnap?: boolean;
  dragLine?: boolean;
  hideCursor?: boolean;
  disableDrag?: boolean;
  getScaleRender?: (scale: number) => React.ReactNode;
  getAssistDragLineActionIds?: (params: { action: ActionType; tracks: TrackType[]; track: TrackType }) => string[];
  onClickTimeArea?: (time: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | undefined;
  sx?: SxProps<Theme>;
}