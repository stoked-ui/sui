import * as React from "react";
import {styled} from "@mui/material/styles";
import {prefix} from "../utils/deal_class_prefix";

export interface DragLineData {
  isMoving: boolean;
  movePositions: number[];
  assistPositions: number[];
}

export type TimelineTrackAreaDragLinesProps = DragLineData & {scrollLeft: number};

const TimelineTrackAreaDragLinesRoot = styled('div')({
  position: 'absolute',
  height: '100%',
  top: 0,
  zIndex: 9999999,
  left: 0,
});

const TimelineTrackAreaDragLineRoot = styled('div')({
  width: 0,
  position: 'absolute',
  zIndex: 9999999,
  top: -200,
  height: '99%',
  borderLeft: '1px dashed rgba(82, 151, 255, 0.6)',
});

/** drag guide lines */
export default function TimelineTrackAreaDragLines ({
  isMoving,
  movePositions = [],
  assistPositions = [],
  scrollLeft,
}: TimelineTrackAreaDragLinesProps) {
  return(
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
