/**
 * @interface TimelineCursorProps
 * @description The props for the TimelineCursor component.
 *
 * @property {number} [scrollLeft] - The initial scroll position of the cursor.
 * @property {function} onCursorDragStart - The function called when the cursor starts dragging.
 * @property {function} onCursorDrag - The function called when the cursor is dragged.
 * @property {function} onCursorDragEnd - The function called when the cursor ends dragging.
 */
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { prefix } from '../utils/deal_class_prefix';
import { parserPixelToTime, parserTimeToPixel } from '../utils/deal_data';
import TimelineTrackDnd from '../TimelineTrackDnd'; // Import the parent component
import { CurveType } from '../types';

/**
 * @typedef {object} TimelineCursorProps
 */

const styles = {
  /**
   * The styles for the cursor root element.
   */
  CursorRoot: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: ${props => props.width}px;
    height: ${props => props.height}px;
  `,
};

const TimelineCursor = ({
  rowRnd,
  scrollLeft,
  onCursorDragStart,
  onCursorDrag,
  onCursorDragEnd,
}) => (
  <TimelineTrackDnd
    ref={rowRnd}
    bounds={{
      left: 0,
      right: Math.min(timelineWidth, maxScaleCount * scaleWidth + startLeft - scrollLeft),
    }}
    enableDragging={!engine.isPlaying}
    enableResizing={false}
    onDragStart={() => {
      onCursorDragStart?.(cursorTime);
      draggingLeft.current =
        parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft;
      rowRnd.current.updateLeft(draggingLeft.current);
    }}
    onDragEnd={() => {
      const time = parserPixelToTime(draggingLeft.current + scrollLeft, {
        startLeft,
        scale,
        scaleWidth,
      });
      setCursor({ time }, context);
      onCursorDragEnd?.(time);
      draggingLeft.current = undefined;
    }}
    onDrag={({ left }, scroll = 0) => {
      const scrollLeftDrag = scrollSync.state.scrollLeft;

      if (!scroll || scrollLeftDrag === 0) {
        // When dragging, if the current left < left min, set the value to left min
        if (left < startLeft - scrollLeftDrag) {
          draggingLeft.current = startLeft - scrollLeftDrag;
        } else {
          draggingLeft.current = left;
        }
      } else if (draggingLeft.current < startLeft - scrollLeftDrag - scroll) {
        draggingLeft.current = startLeft - scrollLeftDrag - scroll;
      }
      rowRnd.current.updateLeft(draggingLeft.current);
      const time = parserPixelToTime(draggingLeft.current + scrollLeftDrag, {
        startLeft,
        scale,
        scaleWidth,
      });
      onCursorDrag?.(time);
      setCursor({ time }, context);
      return false;
    }}
  >
    <styles.CursorRoot id={'timeline-cursor'} ref={cursorRef}>
      <CurveType width="8" height="12" viewBox="0 0 8 12" fill="none">
        <path
          d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764 C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
          fill="#5297FF"
        />
      </CurveType>
    </styles.CursorRoot>
  </TimelineTrackDnd>
);

export default TimelineCursor;