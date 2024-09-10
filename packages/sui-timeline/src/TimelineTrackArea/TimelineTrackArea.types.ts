import * as React from 'react';
import {OnScrollParams} from 'react-virtualized';
import { ITimelineTrack } from '../TimelineTrack/TimelineTrack.types';
import {CommonProps} from '../interface/common_prop';

export type TimelineTrackAreaProps =  CommonProps & {
  /** Scroll distance from the left */
  scrollLeft: number;
  /** Scroll distance from top */
  scrollTop?: number;
  /** Scroll callback, used for synchronous scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set editor data */
  setEditorData: (tracks: ITimelineTrack[]) => void;
  /** Set scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};

/** edit area ref data */
export interface TimelineTrackAreaState {
  domRef: React.MutableRefObject<HTMLDivElement>;
}
