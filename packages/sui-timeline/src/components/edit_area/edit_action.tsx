import * as React from 'react';
import { styled } from '@mui/material/styles';
import { TimelineAction, TimelineTrack } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { DEFAULT_ADSORPTION_DISTANCE, DEFAULT_MOVE_GRID } from '../../interface/const';
import { prefix } from '../../utils/deal_class_prefix';
import { getScaleCountByPixel, parserTimeToPixel, parserTimeToTransform, parserTransformToTime } from '../../utils/deal_data';
import { RowDnd } from '../row_rnd/row_rnd';
import { RndDragCallback, RndDragEndCallback, RndDragStartCallback, RndResizeCallback, RndResizeEndCallback, RndResizeStartCallback, RowRndApi } from '../row_rnd/row_rnd_interface';
import { DragLineData } from './drag_lines';
import { TimelineControlProps } from "../../TimelineControl/TimelineControl.types";
import { ActionTypes } from '../../TimelineAction/TimelineActionTypes';

export type EditActionProps = TimelineControlProps & CommonProp & {
  track: TimelineTrack;
  action: TimelineAction;
  dragLineData: DragLineData;
  setEditorData: (tracks: TimelineTrack[]) => void;
  handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
  areaRef: React.MutableRefObject<HTMLDivElement>;
  /* setUp scroll left */
  deltaScrollLeft?: (delta: number) => void;
};

const Action = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  backgroundColor: theme.palette.action.selected,
  alignContent: 'center',
  padding: '0 0 0 10px',
  overflow: 'hidden',
  textWrap: 'nowrap',
  borderTop: `1px solid ${theme.palette.action.hover}`,
  borderBottom: `1px solid ${theme.palette.action.hover}`,
}));

const LeftStretch = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '10px',
  borderRadius: '4px',
  height: '100%',
  overflow: 'hidden',
  left: 0,
  '&::after': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    margin: 'auto',
    bordeRadius: '4px',
    borderTop: '28px solid transparent',
    borderBottom: '28px solid transparent',
    left: 0,
    content: "''",
    borderLeft: `7px solid ${theme.palette.action.disabled}`,
    borderRight: '7px solid transparent',
  },
}));

const RightStretch = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '10px',
  borderRadius: '4px',
  height: '100%',
  overflow: 'hidden',
  right: 0,
  '&::after': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    margin: 'auto',
    bordeRadius: '4px',
    borderTop: '28px solid transparent',
    borderBottom: '28px solid transparent',
    right: 0,
    content: "''",
    borderLeft: '7px solid transparent',
    borderRight: `7px solid ${theme.palette.action.disabled}`,
  },
}));


export function EditAction({
  tracks,
  track,
  action,
  actionTypes = ActionTypes,
  rowHeight,
  scale,
  scaleWidth,
  scaleSplitCount = 10,
  startLeft = 20,
  gridSnap,
  disableDrag,

  scaleCount,
  maxScaleCount,
  setScaleCount,
  onActionMoveStart,
  onActionMoving,
  onActionMoveEnd,
  onActionResizeStart,
  onActionResizeEnd,
  onActionResizing,

  dragLineData,
  setEditorData,
  onClickAction,
  onClickActionOnly,
  onDoubleClickAction,
  onContextMenuAction,
  getActionRender,
  handleTime,
  areaRef,
  deltaScrollLeft,
}: EditActionProps) {
  const rowRnd = React.useRef<RowRndApi>();
  const isDragWhenClick = React.useRef(false);
  const { id, maxEnd, minStart, end, start, selected, flexible = true, movable = true, effectId } = action;

  // get the maximum minimum pixel range
  const leftLimit = parserTimeToPixel(minStart || 0, {
    startLeft,
    scale,
    scaleWidth,
  });
  const rightLimit = Math.min(
    maxScaleCount * scaleWidth + startLeft, // 根据maxScaleCount限制移动范围
    parserTimeToPixel(maxEnd || Number.MAX_VALUE, {
      startLeft,
      scale,
      scaleWidth,
    }),
  );

  // initialize action coordinate data
  const [transform, setTransform] = React.useState(() => {
    return parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth });
  });

  React.useEffect(() => {
    setTransform(parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth }));
  }, [end, start, startLeft, scaleWidth, scale]);

  // configure drag grid and its properties
  const gridSize = scaleWidth / scaleSplitCount;

  // actionName
  const classNames = ['action'];
  if (movable) {
    classNames.push('action-movable');
  }
  if (selected) {
    classNames.push('action-selected');
  }
  if (flexible) {
    classNames.push('action-flexible');
  }
  if (actionTypes[effectId]) {
    classNames.push(`action-effect-${effectId}`);
  }

  /** calculate scale count */
  const handleScaleCount = (left: number, width: number) => {
    const curScaleCount = getScaleCountByPixel(left + width, {
      startLeft,
      scaleCount,
      scaleWidth,
    });
    if (curScaleCount !== scaleCount) {
      setScaleCount(curScaleCount);
    }
  };

  const handleDragStart: RndDragStartCallback = () => {
    if (onActionMoveStart) {
      onActionMoveStart({ action, track });
    }
  };
  const handleDrag: RndDragCallback = ({ left, width }) => {
    isDragWhenClick.current = true;

    if (onActionMoving) {
      const { start: dragStart, end: dragEnd } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });
      const result = onActionMoving({ action, track, start: dragStart, end: dragEnd });
      if (result === false) {
        return;
      }
    }
    setTransform({ left, width });
    handleScaleCount(left, width);
  };

  const handleDragEnd: RndDragEndCallback = ({ left, width }) => {
    // Computation time
    const { start: dragEndStart, end: dragEndEnd } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });

    // setData
    const rowItem = tracks.find((item) => item.id === track.id);
    const dragEndAction = rowItem.actions.find((item) => item.id === id);
    dragEndAction.start = dragEndStart;
    dragEndAction.end = dragEndEnd;
    setEditorData(tracks);

    // executeCallback
    if (onActionMoveEnd) {
      onActionMoveEnd({ action: dragEndAction, track, start: dragEndStart, end: dragEndEnd });
    }
  };

  const handleResizeStart: RndResizeStartCallback = (dir) => {
    if (onActionResizeStart) {
      onActionResizeStart({ action, track, dir });
    }
  };

  const handleResizing: RndResizeCallback = (dir, { left, width }) => {
    isDragWhenClick.current = true;
    if (onActionResizing) {
      const { start: resizingStart, end: resizingEnd } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });
      const result = onActionResizing({ action, track, start: resizingStart, end: resizingEnd, dir });
      if (result === false) {
        return;
      }
    }
    setTransform({ left, width });
    handleScaleCount(left, width);
  };

  const handleResizeEnd: RndResizeEndCallback = (dir, { left, width }) => {
    // calculatingTime
    const { start: resizeEndStart, end: resizeEndEnd } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });

    // Set data
    const rowItem = tracks.find((item) => item.id === track.id);
    const resizeEndAction = rowItem.actions.find((item) => item.id === id);
    resizeEndAction.start = resizeEndStart;
    resizeEndAction.end = resizeEndEnd;
    setEditorData(tracks);

    // triggerCallback
    if (onActionResizeEnd) {
      onActionResizeEnd({ action: resizeEndAction, track, start: resizeEndStart, end: resizeEndEnd, dir });
    }
  };

  const nowAction = {
    ...action,
    ...parserTransformToTime({ left: transform.left, width: transform.width }, { startLeft, scaleWidth, scale }),
  };

  const nowRow: TimelineTrack = {
    ...track,
    actions: [...track.actions],
  };
  if (track.actions.includes(action)) {
    nowRow.actions[track.actions.indexOf(action)] = nowAction;
  }

  return (
    <RowDnd
      ref={rowRnd}
      parentRef={areaRef}
      start={startLeft}
      left={transform.left}
      width={transform.width}
      grid={(gridSnap && gridSize) || DEFAULT_MOVE_GRID}
      adsorptionDistance={gridSnap ? Math.max((gridSize || DEFAULT_MOVE_GRID) / 2, DEFAULT_ADSORPTION_DISTANCE) : DEFAULT_ADSORPTION_DISTANCE}
      adsorptionPositions={dragLineData.assistPositions}
      bounds={{
        left: leftLimit,
        right: rightLimit,
      }}
      edges={{
        left: !disableDrag && flexible && `.${prefix('action-left-stretch')}`,
        right: !disableDrag && flexible && `.${prefix('action-right-stretch')}`,
      }}
      enableDragging={!disableDrag && movable}
      enableResizing={!disableDrag && flexible}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onResizeStart={handleResizeStart}
      onResize={handleResizing}
      onResizeEnd={handleResizeEnd}
      deltaScrollLeft={deltaScrollLeft}
    >
      <Action
        onMouseDown={() => {
          isDragWhenClick.current = false;
        }}
        onClick={(e) => {
          let time: number;
          if (onClickAction) {
            time = handleTime(e);
            onClickAction(e, { track, action, time });
          }
          if (!isDragWhenClick.current && onClickActionOnly) {
            if (!time) {
              time = handleTime(e);
            }
            onClickActionOnly(e, { track, action, time });
          }
        }}
        onDoubleClick={(e) => {
          if (onDoubleClickAction) {
            const time = handleTime(e);
            onDoubleClickAction(e, { track, action, time });
          }
        }}
        onContextMenu={(e) => {
          if (onContextMenuAction) {
            const time = handleTime(e);
            onContextMenuAction(e, { track, action, time });
          }
        }}
        className={prefix((classNames || []).join(' '))}
        style={{ height: rowHeight }}
      >
        {getActionRender && getActionRender(nowAction, nowRow)}
        {flexible && <LeftStretch className={prefix('action-left-stretch')} />}
        {flexible && <RightStretch className={prefix('action-right-stretch')} />}
      </Action>
    </RowDnd>
  );
};
