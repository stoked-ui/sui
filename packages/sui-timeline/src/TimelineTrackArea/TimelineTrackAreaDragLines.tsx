import * as React from "react";
import {styled} from "@mui/material/styles";
import {prefix} from "../utils/deal_class_prefix";

/**
 * Interface for data passed to TimelineTrackAreaDragLines component
 */
export interface DragLineData {
  /**
   * Whether the line is moving
   */
  isMoving: boolean;
  /**
   * Array of positions where the line can move
   */
  movePositions: number[];
  /**
   * Array of assist positions for the line
   */
  assistPositions: number[];
}

/**
 * Type definition for props of TimelineTrackAreaDragLines component
 */
export type TimelineTrackAreaDragLinesProps = DragLineData & {scrollLeft: number};

/**
 * Root element for TimelineTrackAreaDragLines component
 */
const TimelineTrackAreaDragLinesRoot = styled('div')({
  position: 'absolute',
  height: '100%',
  top: 0,
  zIndex: 9999999,
  left: 0,
});

/**
 * Root element for a single drag line in TimelineTrackAreaDragLines component
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
 * Functionality of TimelineTrackAreaDragLines component
 * 
 * @param props Component props
 * @returns JSX element for the drag lines
 */
export default function TimelineTrackAreaDragLines ({
  isMoving,
  movePositions = [],
  assistPositions = [],
  scrollLeft,
}: TimelineTrackAreaDragLinesProps) {
  return(
    <TimelineTrackAreaDragLinesRoot className={prefix('drag-line-container')}>
      {
        /**
         * Filter and map move positions based on assist positions
         */
        isMoving && movePositions.filter(item => assistPositions.includes(item)).map(((linePos, index) => {
          return (
            <TimelineTrackAreaDragLineRoot key={index} className={prefix('drag-line')} style={{left: linePos - scrollLeft}} />
          )
        }))
      }
    </TimelineTrackAreaDragLinesRoot>
  );
}