import * as React  from "react";
import { TimelineAction, TimelineTrack } from "../../../interface/action";
import { parserActionsToPositions, parserTimeToTransform } from "../../../utils/deal_data";
import { DragLineData } from "../drag_lines";

export function useDragLine() {
  const [dragLineData, setDragLineData] = React.useState<DragLineData>({ isMoving: false, movePositions: [], assistPositions: [] });

  /** get auxiliary lines */
  const defaultGetAssistPosition = (data: {
    tracks: TimelineTrack[];
    assistActionIds?: string[];
    action: TimelineAction;
    track: TimelineTrack;
    startLeft?: number;
    scale?: number;
    scaleWidth?: number;
    hideCursor: boolean;
    cursorLeft: number;
  }) => {
    const { tracks, assistActionIds, action, track, scale = 1, scaleWidth = 160, startLeft= 20, cursorLeft, hideCursor } = data;
    const otherActions: TimelineAction[] = [];
    if (assistActionIds) {
      tracks.forEach((rowItem) => {
        rowItem.actions.forEach((actionItem) => {
          if (assistActionIds.includes(actionItem.id)) {
            otherActions.push(actionItem);
          }
        });
      });
    } else {
      tracks.forEach((rowItem) => {
        if (rowItem.id !== track.id) {
          otherActions.push(...rowItem.actions);
        } else {
          rowItem.actions.forEach((actionItem) => {
            if (actionItem.id !== action.id) {
              otherActions.push(actionItem);
            }
          });
        }
      });
    }

    const positions = parserActionsToPositions(otherActions, {
      startLeft,
      scale,
      scaleWidth,
    });
    if (!hideCursor) {
      positions.push(cursorLeft);
    }

    return positions;
  };

  /** get the current moving mark */
  const defaultGetMovePosition = (data: { start: number; end: number; dir?: "right" | "left"; startLeft: number; scale: number; scaleWidth: number }) => {
    const { start, end, dir, scale, scaleWidth, startLeft } = data;
    const { left, width } = parserTimeToTransform({ start, end }, { startLeft, scaleWidth, scale });
    if (!dir) {
      return [left, left + width];
    }
    return dir === "right" ? [left + width] : [left];
  };

  /** initialize draglines */
  const initDragLine = (data: { movePositions?: number[]; assistPositions?: number[] }) => {
    const { movePositions, assistPositions } = data;

    setDragLineData({
      isMoving: true,
      movePositions: movePositions || [],
      assistPositions: assistPositions || [],
    });
  };

  /** update dragline */
  const updateDragLine = (data: { movePositions?: number[]; assistPositions?: number[] }) => {
    const { movePositions, assistPositions } = data;
    setDragLineData((pre) => ({
      ...pre,
      movePositions: movePositions || pre.movePositions,
      assistPositions: assistPositions || pre.assistPositions,
    }));
  };

  /** release draglines */
  const disposeDragLine = () => {
    setDragLineData({ isMoving: false, movePositions: [], assistPositions: [] });
  };

  return {
    initDragLine,
    updateDragLine,
    disposeDragLine,
    dragLineData,
    defaultGetAssistPosition,
    defaultGetMovePosition,
  };
}
