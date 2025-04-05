import * as React from 'react';
import {OnScrollParams} from 'react-virtualized';
import {ITimelineTrack, ITimelineTrackHandlers} from "../TimelineTrack";
import {ITimelineAction, ITimelineActionHandlers} from "../TimelineAction";
import {TimelineTimeProps} from "../TimelineTime";
import {TimelineCursorProps} from "../TimelineCursor";

/**
 * Props for the TimelineTrackArea component.
 * @template TrackType - Type of timeline track.
 * @template ActionType - Type of timeline action.
 */
export type TimelineTrackAreaProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction
> =  ITimelineTrackHandlers & ITimelineActionHandlers & TimelineTimeProps & TimelineCursorProps &{
  /**
   * Function to get assist drag line action ids.
   * @param {Object} params - Parameters for getting assist drag line action ids.
   * @param {ActionType} params.action - The timeline action.
   * @param {TrackType[]} params.tracks - Array of timeline tracks.
   * @param {TrackType} params.track - The timeline track.
   * @returns {string[]} - Array of assist drag line action ids.
   */
  getAssistDragLineActionIds?: (params: { action: ActionType; tracks: TrackType[]; track: TrackType }) => string[];

  /**
   * Scroll callback function for synchronous scrolling.
   * @param {OnScrollParams} params - Parameters for onScroll callback.
   */
  onScroll: (params: OnScrollParams) => void;
  
  /**
   * Function to set the scroll left position.
   * @param {number} scrollLeft - The scroll left position.
   */
  deltaScrollLeft: (scrollLeft: number) => void;

  /**
   * Callback function for adding files.
   */
  onAddFiles?: () => void;

  /**
   * Component type for track actions.
   */
  trackActions?: React.ElementType
};

/**
 * State interface for the TimelineTrackArea component.
 */
export interface TimelineTrackAreaState {
  domRef: React.MutableRefObject<HTMLDivElement>;
}