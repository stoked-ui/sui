import * as React from 'react';
import {ScrollSync} from 'react-virtualized';
import {CommonProps} from '../interface/common_prop';

/** Animation timeline component parameters */
export type TimelineCursorProps = CommonProps & {
  /** Scroll distance from the left */
  scrollLeft: number;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => boolean;
  /** Timeline area dom ref */
  areaRef: React.MutableRefObject<HTMLDivElement>;
  /** Set scroll left */
  deltaScrollLeft: (delta: number) => void;
  /** Scroll synchronization ref (TODO: This data is used to temporarily solve the problem of out-of-synchronization when scrollLeft is dragged) */
  scrollSync: React.MutableRefObject<ScrollSync>;
};
