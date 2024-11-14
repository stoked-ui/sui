import * as React from 'react';
import {OnScrollParams} from 'react-virtualized';
import {CommonProps} from '../interface/common_prop';

export type TimelineTrackAreaProps =  CommonProps & {
  /** Scroll distance from the left */
  scrollLeft: number;
  /** Scroll distance from top */
  scrollTop?: number;
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
