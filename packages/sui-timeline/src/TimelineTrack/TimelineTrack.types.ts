import * as React from "react";
import {CommonProps} from "../interface/common_prop";
import { TimelineBaseProps } from "../Timeline/Timeline.types";
import { ITimelineAction } from '../TimelineAction/TimelineAction.types';
import {DragLineData} from "../DragLines/DragLines.types";

/**
 *Basic parameters of action lines
 * @export
 * @interface TimelineTrack
 */
export interface ITimelineTrack {
  /** Action track id */
  id: string;

  name?: string;
  /** Row action list */
  actions: ITimelineAction[];
  /** Customize track height */
  rowHeight?: number;
  /** Whether the track is selected */
  selected?: boolean;
  /** Extended class name of track */
  classNames?: string[];
  /** Whether the action is hidden */
  hidden?: boolean;
  /** Whether the action is hidden */
  lock?: boolean;

}

export type TimelineTrackProps = CommonProps & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  track?: ITimelineTrack;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  /** setUp scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};
