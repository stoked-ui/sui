import * as React from "react";
import { styled } from "@mui/material/styles";
import { prefix } from "../../utils/deal_class_prefix";

export interface DragLineData {
  isMoving: boolean;
  movePositions: number[];
  assistPositions: number[];
}

export type DragLineProps = DragLineData;

const DragLinesRoot = styled('div')({
  position: 'absolute',
  height: '100%',
  top: 0,
  left: 0,
});

const DragLineRoot = styled('div')({
  width: 0,
  position: 'absolute',
  top: 0,
  height: '99%',
  borderLeft: '1px dashed rgba(82, 151, 255, 0.6)',
});

/** drag guide lines */
export function DragLines ({
  isMoving,
  movePositions = [],
  assistPositions = [],
}: DragLineProps) {
  return(
    <DragLinesRoot className={prefix('drag-line-container')}>
      {
        isMoving && movePositions.filter(item => assistPositions.includes(item)).map(((linePos, index) => {
          return (
            <DragLineRoot key={index} className={prefix('drag-line')} style={{left: linePos}} />
          )
        }))
      }
    </DragLinesRoot>
  )
}
