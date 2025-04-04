/**
 * TimelineCursor component parameters.
 *
 * This component handles the animation of the timeline cursor, allowing for
 * user interaction and scroll synchronization.
 *
 * @interface TimelineCursorProps
 */
export type TimelineCursorProps = {
  /**
   * Scroll distance from the left.
   * @type {number}
   */
  scrollLeft: number;
  
  /**
   * Set cursor position.
   * @param {Object} param - Options for setting cursor position
   * @param {number} [param.left] - Optional, new left position (default is null)
   * @param {number} [param.time] - Optional, time value (default is null)
   */
  // setCursor: (param: Object) => boolean;
  
  /**
   * Timeline area DOM ref.
   * @type {React.RefObject<HTMLDivElement>}
   */
  rowRnd?: React.RefObject<RowRndApi>;
  
  /**
   * Called when the cursor starts dragging.
   * @param {number} time - The start time of the drag
   * @return {void}
   */
  onCursorDragStart?: (time: number) => void;
  
  /**
   * Called when the cursor ends dragging.
   * @param {number} time - The end time of the drag
   * @return {void}
   */
  onCursorDragEnd?: (time: number) => void;
  
  /**
   * Called for each cursor drag event.
   * @param {number} time - The current time
   * @return {void}
   */
  onCursorDrag?: (time: number) => void;
  
  /**
   * Ref for the left position being dragged.
   * @type {React.RefObject<number | undefined>}
   */
  draggingLeft?: React.RefObject<undefined | number>;
}