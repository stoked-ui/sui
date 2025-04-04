/**
 * Hook to manage dragline state and functionality for a timeline.
 * 
 * @returns An object containing the following properties:
 *   - initDragLine: Function to initialize draglines
 *   - updateDragLine: Function to update dragline state
 *   - disposeDragLine: Function to release draglines
 *   - dragLineData: State object for draglines (isMoving, movePositions, assistPositions)
 *   - defaultGetAssistPosition: Function to get auxiliary lines
 *   - defaultGetMovePosition: Function to get the current moving mark
 */
export function useDragLine() {
  const [dragLineData, setDragLineData] = React.useState<DragLineData>({
    isMoving: false,
    movePositions: [],
    assistPositions: []
  });
  const { state: { flags: { hideCursor }, settings: { scale, scaleWidth, startLeft }} } = useTimeline();

  /**
   * Get auxiliary lines based on the provided data.
   * 
   * @param data Object containing tracks, assistActionIds, action, track, and cursorLeft
   * @returns Array of positions for auxiliary lines
   */
  function defaultGetAssistPosition(data: {
    tracks: ITimelineTrack[];
    assistActionIds?: string[];
    action: ITimelineAction;
    track: ITimelineTrack;
    cursorLeft: number;
  }) {
    const { tracks, assistActionIds, action, track, cursorLeft } = data;
    const otherActions: ITimelineAction[] = [];

    // Filter actions based on assistActionIds
    if (assistActionIds) {
      tracks.forEach((rowItem) => {
        rowItem.actions.forEach((actionItem) => {
          if (assistActionIds.includes(actionItem.id)) {
            otherActions.push(actionItem);
          }
        });
      });
    } else {
      // Default to all actions for track
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

    // Calculate positions using parserActionsToPositions
    const positions = parserActionsToPositions(otherActions, {
      startLeft,
      scale,
      scaleWidth,
    });

    // Add cursorLeft position if hideCursor is false
    if (!hideCursor) {
      positions.push(cursorLeft);
    }

    return positions;
  }

  /**
   * Get the current moving mark based on the provided data.
   * 
   * @param data Object containing start, end, and dir (optional)
   * @returns Array of positions for move marks
   */
  const defaultGetMovePosition = (data: { start: number; end: number; dir?: "right" | "left" }) => {
    const { start, end, dir } = data;
    const { left, width } = parserTimeToTransform({ start, end }, { startLeft, scaleWidth, scale });

    // Calculate move marks based on direction
    if (!dir) {
      return [left, left + width];
    }
    return dir === "right" ? [left + width] : [left];
  };

  /**
   * Initialize draglines with the provided data.
   * 
   * @param data Object containing movePositions and assistPositions (optional)
   */
  const initDragLine = (data: { movePositions?: number[]; assistPositions?: number[] }) => {
    const { movePositions, assistPositions } = data;

    setDragLineData({
      isMoving: true,
      movePositions: movePositions || [],
      assistPositions: assistPositions || [],
    });
  };

  /**
   * Update dragline state with the provided data.
   * 
   * @param data Object containing movePositions and assistPositions (optional)
   */
  const updateDragLine = (data: { movePositions?: number[]; assistPositions?: number[] }) => {
    const { movePositions, assistPositions } = data;
    setDragLineData((pre) => ({
      ...pre,
      movePositions: movePositions || pre.movePositions,
      assistPositions: assistPositions || pre.assistPositions,
    }));
  };

  /**
   * Release draglines by resetting state.
   */
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