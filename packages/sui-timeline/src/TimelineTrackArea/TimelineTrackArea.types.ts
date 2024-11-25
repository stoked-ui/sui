import * as React from 'react';
import {OnScrollParams} from 'react-virtualized';
import {ITimelineTrack, ITimelineTrackHandlers} from "../TimelineTrack";
import {ITimelineAction, ITimelineActionHandlers} from "../TimelineAction";
import {TimelineTimeProps} from "../TimelineTime";
import {TimelineCursorProps} from "../TimelineCursor";

export type TimelineTrackAreaProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction
> =  ITimelineTrackHandlers & ITimelineActionHandlers & TimelineTimeProps & TimelineCursorProps &{
  getAssistDragLineActionIds?: (params: { action: ActionType; tracks: TrackType[]; track: TrackType }) => string[];

  /** Scroll callback, used for synchronous scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set editor data */
  /** Set scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;

  onAddFiles?: () => void;
};

/** edit area ref data */
export interface TimelineTrackAreaState {
  domRef: React.MutableRefObject<HTMLDivElement>;
}
