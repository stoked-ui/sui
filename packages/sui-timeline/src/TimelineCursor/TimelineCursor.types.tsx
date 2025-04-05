import * as React from 'react';
import { RowRndApi } from "../TimelineTrack";

/**
 * Animation timeline component parameters
 */
export type TimelineCursorProps = {
  /**
   * Scroll distance from the left
   */
  scrollLeft: number;
  /**
   * Set cursor position
   * @param {number} left - Left position of the cursor
   * @param {number} time - Time position of the cursor
   * @returns {boolean} - Returns true if successful
   */
  setCursor: (param: { left?: number; time?: number }) => boolean;
  /**
   * Timeline area dom ref
   */
  areaRef: React.MutableRefObject<HTMLDivElement>;
  /**
   * Set scroll left
   * @param {number} delta - Delta value for scroll left
   */
  deltaScrollLeft: (delta: number) => void;
  /**
   * Scroll synchronization ref (TODO: This data is used to temporarily solve the problem of out-of-synchronization when scrollLeft is dragged)
   */
  scrollSync: React.MutableRefObject<ScrollSync>;

  rowRnd?: React.RefObject<RowRndApi>;
  /**
   * @description cursor starts drag event
   * @param {number} time - Time value when drag starts
   */
  onCursorDragStart?: (time: number) => void;
  /**
   * @description cursor ends drag event
   * @param {number} time - Time value when drag ends
   */
  onCursorDragEnd?: (time: number) => void;
  /**
   * @description cursor drag event
   * @param {number} time - Time value during drag
   */
  onCursorDrag?: (time: number) => void;

  draggingLeft?: React.RefObject<undefined | number>;
}