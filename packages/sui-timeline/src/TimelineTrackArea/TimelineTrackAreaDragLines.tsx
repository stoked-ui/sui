import * as React from "react";
import {styled} from "@mui/material/styles";
import {prefix} from "../utils/deal_class_prefix";

/**
 * Represents the data structure for drag guide lines in the timeline track area.
 * @typedef {Object} DragLineData
 * @property {boolean} isMoving - Indicates if the drag operation is in progress.
 * @property {number[]} movePositions - Array of positions for moving lines.
 * @property {number[]} assistPositions - Array of positions for assisting lines.
 */

/**
 * Props for the TimelineTrackAreaDragLines component.
 * @typedef {Object} TimelineTrackAreaDragLinesProps
 * @property {boolean} isMoving - Indicates if the drag operation is in progress.
 * @property {number[]} movePositions - Array of positions for moving lines.
 * @property {number[]} assistPositions - Array of positions for assisting lines.
 * @property {number} scrollLeft - The horizontal scroll position.
 */

/**
 * Root container for the drag guide lines in the timeline track area.
 */
const TimelineTrackAreaDragLinesRoot = styled('div')({
  position: 'absolute',
  height: '100%',
  top: 0,
  zIndex: 9999999,
  left: 0,
});

/**
 * Individual drag guide line component.
 */
const TimelineTrackAreaDragLineRoot = styled('div')({
  width: 0,
  position: 'absolute',
  zIndex: 9999999,
  top: -200,
  height: '99%',
  borderLeft: '1px dashed rgba(82, 151, 255, 0.6)',
});

/**
 * Displays drag guide lines in the timeline track area.
 * @param {TimelineTrackAreaDragLinesProps} props - The props for the component.
 * @returns {JSX.Element} The drag guide lines component.
 */
export default function TimelineTrackAreaDragLines({
  isMoving,
  movePositions = [],
  assistPositions = [],
  scrollLeft,
}: TimelineTrackAreaDragLinesProps) {
  return (
    <TimelineTrackAreaDragLinesRoot className={prefix('drag-line-container')}>
      {
        isMoving && movePositions.filter(item => assistPositions.includes(item)).map(((linePos, index) => {
          return (
            <TimelineTrackAreaDragLineRoot key={index} className={prefix('drag-line')} style={{left: linePos - scrollLeft}} />
          )
        }))
      }
    </TimelineTrackAreaDragLinesRoot>
  )
}