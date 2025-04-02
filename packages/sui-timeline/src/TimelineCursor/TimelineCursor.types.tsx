import * as React from 'react';
import { RowRndApi } from "../TimelineTrack";

/** Animation timeline component parameters */
export type TimelineCursorProps = {
  /** Scroll distance from the left */
  scrollLeft: number;
  /** Set cursor position */
  // setCursor: (param: { left?: number; time?: number }) => boolean;
  /** Timeline area dom ref */
  // areaRef: React.MutableRefObject<HTMLDivElement>;
  /** Set scroll left */
  // deltaScrollLeft: (delta: number) => void;
  /** Scroll synchronization ref (TODO: This data is used to temporarily solve the problem of out-of-synchronization when scrollLeft is dragged) */
  // scrollSync: React.MutableRefObject<ScrollSync>;

  rowRnd?: React.RefObject<RowRndApi>;
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

  draggingLeft?: React.RefObject<undefined | number>;
}

