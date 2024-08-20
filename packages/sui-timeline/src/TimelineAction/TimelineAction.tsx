import * as React from 'react';
import { alpha, styled, SxProps, Theme } from '@mui/material/styles';
import { TimelineTrack } from '../interface/TimelineAction';
import { DEFAULT_ADSORPTION_DISTANCE, DEFAULT_MOVE_GRID } from '../interface/const';
import { getScaleCountByPixel, parserTimeToPixel, parserTimeToTransform, parserTransformToTime } from '../utils/deal_data';
import { RowDnd } from '../components/row_rnd/row_rnd';
import { RndDragCallback, RndDragEndCallback, RndDragStartCallback, RndResizeCallback, RndResizeEndCallback, RndResizeStartCallback, RowRndApi } from '../components/row_rnd/row_rnd_interface';
import { getTimelineActionUtilityClass, TimelineActionClassKey} from "./timelineActionClasses";
import { prefix } from '../utils/deal_class_prefix';
import {
  TimelineActionOwnerState,
  TimelineActionProps,
  TimelineActionState,
  ITimelineActionType
} from "./TimelineAction.types";
import composeClasses from "@mui/utils/composeClasses";
import clsx from "clsx";
import useSlotProps from '@mui/utils/useSlotProps';
import { shouldForwardProp } from "@mui/system/createStyled";
import {blend} from "@mui/system";

export const useActionUtilityClasses = (
  ownerState: TimelineActionOwnerState
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    left: ['left'],
    right: ['right'],
    selected: ['selected'],
    flexible: ['flexible'],
    movable: ['movable'],
    disable: ['disable'],

  };

  return composeClasses(slots, getTimelineActionUtilityClass, classes);
};


const Action = styled('div',{
  name: 'MuiTimelineAction',
  slot: 'root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) && prop !== 'selected',
})<{
  selected: boolean;
  color: string;
}>(({ theme, selected , color = 'blue'}) => {
  const base = theme.vars ? `rgba(color(from ${color}) / 1)` : alpha(color, 1);
  const unselected = blend('#FFF', base, 0.3);
  const selectedColor =  blend('#FFF', base, 0.45);
  const hover = blend('#FFF', base, 0.55);
  const background = selected ? selectedColor : unselected;
  return {
  position: 'absolute',
  left: 0,
  top: 0,
  backgroundColor: background,
  alignContent: 'center',
  padding: '0 0 0 10px',
  overflow: 'hidden',
  textWrap: 'nowrap',
  borderTop: `1px solid ${theme.palette.action.hover}`,
  borderBottom: `1px solid ${theme.palette.action.hover}`,
    '&:hover': {
      backgroundColor: hover,
    }
}})

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


export default function TimelineAction(props: TimelineActionProps) {
  const { slotProps = {}, action, selected, flexible = true , movable = true , disable, ...actionProps} = props;
  const state = { selected, flexible, movable, disable};
  const ownerState = { ...state, ...actionProps, ...action};
  const classes = useActionUtilityClasses(ownerState);
  const classNamesNew = Object.keys(classes).reduce((result, key, val) => {
      const classKey = classes[key];
      result[classKey] = !!state[key]
      return result;
    }, {});

  const rootProps = useSlotProps({
    elementType: TimelineAction,
    externalSlotProps: slotProps.root,
    externalForwardedProps: props,
    ownerState,
    className: clsx(props.className, classes.root, classNamesNew),
  });

  const rowRnd = React.useRef<RowRndApi>();
  const isDragWhenClick = React.useRef(false);
  const { id, maxEnd, minStart, end, start,  effectId } = action;
  const { track, scaleCount, setScaleCount, actionTypes, startLeft, scale, scaleWidth, maxScaleCount,scaleSplitCount } = props;
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
    if (track.lock) {
      return;
    }
    setTransform(parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth }));
  }, [end, start, startLeft, scaleWidth, scale]);

  // configure drag grid and its properties
  const gridSize = scaleWidth / scaleSplitCount;

  // actionName
  const classNames = ['action'];
  if (movable && !track.lock) {
    classNames.push('action-movable');
  }
  if (selected) {
    classNames.push('action-selected');
  }
  if (flexible) {
    classNames.push('action-flexible');
  }
  if (actionTypes[effectId]) {
    classNames.push(`action-actionType-${effectId}`);
  }
  // rootProps.className = classNames.join(' ')

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

  const { onActionMoveStart,onActionMoving } = props;
  const handleDragStart: RndDragStartCallback = () => {
    if (track.lock) {
      return;
    }
    if (onActionMoveStart) {
      onActionMoveStart({ action, track });
    }
  };
  const handleDrag: RndDragCallback = ({ left, width }) => {
    if (track.lock) {
      return;
    }
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

  const { tracks, setEditorData, onActionMoveEnd } = props;
  const handleDragEnd: RndDragEndCallback = ({ left, width }) => {
    if (track.lock) {
      return;
    }
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

  const { onActionResizeStart, onActionResizing, onActionResizeEnd } = props;

  const handleResizeStart: RndResizeStartCallback = (dir) => {
    if (track.lock) {
      return;
    }
    if (onActionResizeStart) {
      onActionResizeStart({ action, track, dir });
    }
  };

  const handleResizing: RndResizeCallback = (dir, { left, width }) => {
    if (track.lock) {
      return;
    }
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
    if (track.lock) {
      return;
    }
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

  const { areaRef, gridSnap, dragLineData, disableDrag, deltaScrollLeft, onClickAction, handleTime, onClickActionOnly, onDoubleClickAction, onContextMenuAction, rowHeight, getActionRender } = props;
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
          if (track.lock) {
            return;
          }
          isDragWhenClick.current = false;
        }}
        onClick={(e) => {
          if (track.lock) {
            return;
          }
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
          if (track.lock) {
            return;
          }
          if (onDoubleClickAction) {
            const time = handleTime(e);
            onDoubleClickAction(e, { track, action, time });
          }
        }}
        onContextMenu={(e) => {
          if (track.lock) {
            return;
          }
          if (onContextMenuAction) {
            const time = handleTime(e);
            onContextMenuAction(e, { track, action, time });
          }
        }}
        className={prefix((classNames || []).join(' '))}
        selected={action.selected}
        style={{ height: rowHeight }}
        color={actionTypes[action.effectId].color}
      >
        {getActionRender && getActionRender(nowAction, nowRow)}
        {flexible && <LeftStretch className={classes.left} />}
        {flexible && <RightStretch className={classes.right} />}
      </Action>
    </RowDnd>
  );
};
