import * as React from "react";
import { ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";
import {type ITimelineAction} from "../TimelineAction/TimelineAction.types"
import {parserActionsToPositions, parserTimeToTransform} from "../utils/deal_data";
import {DragLineData} from "./TimelineTrackAreaDragLines";
import { useTimeline } from "../TimelineProvider";

export function useDragLine() {
  const [dragLineData, setDragLineData] = React.useState<DragLineData>({ isMoving: false, movePositions: [], assistPositions: [] });
  const { state: {flags: { hideCursor }, settings: {  scale, scaleWidth, startLeft }} } = useTimeline();

  /** get auxiliary lines */
  function defaultGetAssistPosition (data: {
    tracks: ITimelineTrack[];
    assistActionIds?: string[];
    action: ITimelineAction;
    track: ITimelineTrack;
    cursorLeft: number;
  }) {
    const { tracks, assistActionIds, action, track, cursorLeft } = data;
    const otherActions: ITimelineAction[] = [];
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
  }

  /** get the current moving mark */
  const defaultGetMovePosition = (data: { start: number; end: number; dir?: "right" | "left" }) => {
    const { start, end, dir } = data;
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

