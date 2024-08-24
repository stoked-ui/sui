import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import clsx from 'clsx';
import useSlotProps from '@mui/utils/useSlotProps';
import { shouldForwardProp } from '@mui/system/createStyled';
import { blend } from '@mui/system';
import { TimelineTrack } from '../interface/TimelineAction';
import { DEFAULT_ADSORPTION_DISTANCE, DEFAULT_MOVE_GRID } from '../interface/const';
import {
  getScaleCountByPixel,
  parserTimeToPixel,
  parserTimeToTransform,
  parserTransformToTime,
} from '../utils/deal_data';
import { RowDnd } from '../components/row_rnd/row_rnd';
import {
  RndDragCallback,
  RndDragEndCallback,
  RndDragStartCallback,
  RndResizeCallback,
  RndResizeEndCallback,
  RndResizeStartCallback,
  RowRndApi,
} from '../components/row_rnd/row_rnd_interface';
import { getTimelineActionUtilityClass } from './timelineActionClasses';
import { prefix } from '../utils/deal_class_prefix';
import { TimelineActionOwnerState, TimelineActionProps } from './TimelineAction.types';
import { TimelineEngine } from '../TimelineEngine/TimelineEngine';

export const useActionUtilityClasses = (ownerState: TimelineActionOwnerState) => {
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

const Action = styled('div', {
  name: 'MuiTimelineAction',
  slot: 'root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'selected',
})<{
  selected: boolean;
  color: string;
}>(({ theme, selected, color = 'blue' }) => {
  const base = theme.vars ? `rgba(color(from ${color}) / 1)` : alpha(color, 1);
  const unselected = blend('#FFF', base, 0.3);
  const hover = blend('#FFF', base, 0.45);
  const selectedColor = blend('#FFF', base, 0.75);
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
    },
  };
});

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

function TimelineAction(props: TimelineActionProps) {
  const { slotProps = {}, action, ...restProps } = props;
  const { selected, flexible = true, movable = true, disable } = action;
  const state = { selected, flexible, movable, disable };
  const ownerStateProps = { ...state, ...restProps, ...action };
  const { onKeyDown, ...ownerState } = ownerStateProps;
  const classes = useActionUtilityClasses(ownerState);
  const classNamesNew = Object.keys(classes).reduce((result, key) => {
    const classKey = classes[key];
    result[classKey] = !!state[key];
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
  const { id, maxEnd, minStart, end, start, effectId } = action;
  const {
    track,
    scaleCount,
    setScaleCount,
    actionTypes,
    startLeft,
    scale,
    scaleWidth,
    maxScaleCount,
    scaleSplitCount,
  } = props;
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

  const { onActionMoveStart, onActionMoving } = props;
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
      const { start: dragStart, end: dragEnd } = parserTransformToTime(
        { left, width },
        { scaleWidth, scale, startLeft },
      );
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
    const { start: dragEndStart, end: dragEndEnd } = parserTransformToTime(
      { left, width },
      { scaleWidth, scale, startLeft },
    );

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
      const { start: resizingStart, end: resizingEnd } = parserTransformToTime(
        { left, width },
        { scaleWidth, scale, startLeft },
      );
      const result = onActionResizing({
        action,
        track,
        start: resizingStart,
        end: resizingEnd,
        dir,
      });
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
    const { start: resizeEndStart, end: resizeEndEnd } = parserTransformToTime(
      { left, width },
      { scaleWidth, scale, startLeft },
    );

    // Set data
    const rowItem = tracks.find((item) => item.id === track.id);
    const resizeEndAction = rowItem.actions.find((item) => item.id === id);
    resizeEndAction.start = resizeEndStart;
    resizeEndAction.end = resizeEndEnd;
    setEditorData(tracks);

    // triggerCallback
    if (onActionResizeEnd) {
      onActionResizeEnd({
        action: resizeEndAction,
        track,
        start: resizeEndStart,
        end: resizeEndEnd,
        dir,
      });
    }
  };

  const nowAction = {
    ...action,
    ...parserTransformToTime(
      { left: transform.left, width: transform.width },
      { startLeft, scaleWidth, scale },
    ),
  };

  const nowRow: TimelineTrack = {
    ...track,
    actions: [...track.actions],
  };
  if (track.actions.includes(action)) {
    nowRow.actions[track.actions.indexOf(action)] = nowAction;
  }

  const {
    areaRef,
    gridSnap,
    dragLineData,
    disableDrag,
    deltaScrollLeft,
    onClickAction,
    handleTime,
    onClickActionOnly,
    onDoubleClickAction,
    onContextMenuAction,
    rowHeight,
    getActionRender,
  } = props;
  return (
    <RowDnd
      ref={rowRnd}
      parentRef={areaRef}
      start={startLeft}
      left={transform.left}
      width={transform.width}
      grid={(gridSnap && gridSize) || DEFAULT_MOVE_GRID}
      adsorptionDistance={
        gridSnap
          ? Math.max((gridSize || DEFAULT_MOVE_GRID) / 2, DEFAULT_ADSORPTION_DISTANCE)
          : DEFAULT_ADSORPTION_DISTANCE
      }
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
        id={action.id}
        {...rootProps}
        onKeyDown={(event: any) => {
          event.currentTarget = action;
          action.onKeyDown(event, action.id);
          event.preventDefault();
        }}
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
          action.selected = true;
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
        color={actionTypes[action.effectId]?.color ?? '#ccc'}
      >
        {getActionRender && getActionRender(nowAction, nowRow)}
        {flexible && <LeftStretch className={classes.left} />}
        {flexible && <RightStretch className={classes.right} />}
      </Action>
    </RowDnd>
  );
}

TimelineAction.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  action: PropTypes.shape({
    data: PropTypes.shape({
      src: PropTypes.string.isRequired,
      style: PropTypes.object.isRequired,
    }).isRequired,
    disable: PropTypes.bool.isRequired,
    effectId: PropTypes.string.isRequired,
    end: PropTypes.number.isRequired,
    flexible: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
    maxEnd: PropTypes.number.isRequired,
    minStart: PropTypes.number.isRequired,
    movable: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    onKeyDown: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired,
    start: PropTypes.number.isRequired,
  }).isRequired,
  /**
   * @description timelineControl action actionType map
   */
  actionTypes: PropTypes.object.isRequired,
  areaRef: PropTypes.shape({
    current: PropTypes.object.isRequired,
  }).isRequired,
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  classes: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  /**
   * Cursor time
   */
  cursorTime: PropTypes.number.isRequired,
  deltaScrollLeft: PropTypes.func.isRequired,
  /**
   * Whether the action is prohibited from running
   */
  disable: PropTypes.bool.isRequired,
  /**
   * @description Disable dragging of all action areas
   * @default false
   */
  disableDrag: PropTypes.bool.isRequired,
  /**
   * @description Start dragging auxiliary line adsorption
   * @default false
   */
  dragLine: PropTypes.bool.isRequired,
  dragLineData: PropTypes.shape({
    assistPositions: PropTypes.arrayOf(PropTypes.number).isRequired,
    isMoving: PropTypes.bool.isRequired,
    movePositions: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  /**
   * @description timelineControl runner, if not passed, the built-in runner will be used
   */
  engine: PropTypes.shape({
    current: PropTypes.shape({
      actionTypes: PropTypes.object.isRequired,
      bind: PropTypes.func.isRequired,
      canvas: PropTypes.object.isRequired,
      events: PropTypes.object.isRequired,
      exist: PropTypes.func.isRequired,
      getAction: PropTypes.func.isRequired,
      getActionTrack: PropTypes.func.isRequired,
      getPlayRate: PropTypes.func.isRequired,
      getSelectedActions: PropTypes.func.isRequired,
      getTime: PropTypes.func.isRequired,
      isPaused: PropTypes.bool.isRequired,
      isPlaying: PropTypes.bool.isRequired,
      off: PropTypes.func.isRequired,
      offAll: PropTypes.func.isRequired,
      on: PropTypes.func.isRequired,
      pause: PropTypes.func.isRequired,
      play: PropTypes.func.isRequired,
      reRender: PropTypes.func.isRequired,
      setPlayRate: PropTypes.func.isRequired,
      setTime: PropTypes.func.isRequired,
      tracks: PropTypes.arrayOf(
        PropTypes.shape({
          actions: PropTypes.arrayOf(PropTypes.object).isRequired,
          classNames: PropTypes.arrayOf(PropTypes.string).isRequired,
          hidden: PropTypes.bool.isRequired,
          id: PropTypes.string.isRequired,
          lock: PropTypes.bool.isRequired,
          name: PropTypes.string.isRequired,
          rowHeight: PropTypes.number.isRequired,
          selected: PropTypes.bool.isRequired,
        }),
      ).isRequired,
      trigger: PropTypes.func.isRequired,
      viewer: function (props, propName) {
        if (props[propName] == null) {
          return new Error(`Prop ${propName} is required but wasn't specified`);
        } else if (typeof props[propName] !== 'object' || props[propName].nodeType !== 1) {
          return new Error("Expected prop '" + propName + "' to be of type Element");
        }
      },
    }).isRequired,
  }).isRequired,
  /**
   * Whether the action is scalable
   */
  flexible: PropTypes.bool.isRequired,
  /**
   * @description Custom action area rendering
   */
  getActionRender: PropTypes.func.isRequired,
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds: PropTypes.func.isRequired,
  /**
   * @description Custom scale rendering
   */
  getScaleRender: PropTypes.func.isRequired,
  /**
   * @description Whether to enable grid movement adsorption
   * @default false
   */
  gridSnap: PropTypes.bool.isRequired,
  handleTime: PropTypes.func.isRequired,
  /**
   * @description whether to hide the cursor
   * @default false
   */
  hideCursor: PropTypes.bool.isRequired,
  /**
   * @description Maximum number of scales (>=minScaleCount)
   * @default Infinity
   */
  maxScaleCount: PropTypes.number.isRequired,
  /**
   * @description Minimum number of ticks (>=1)
   * @default 20
   */
  minScaleCount: PropTypes.number.isRequired,
  /**
   * Whether the action is movable
   */
  movable: PropTypes.bool.isRequired,
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd: PropTypes.func.isRequired,
  /**
   * @description Start moving callback
   */
  onActionMoveStart: PropTypes.func.isRequired,
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving: PropTypes.func.isRequired,
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd: PropTypes.func.isRequired,
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart: PropTypes.func.isRequired,
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing: PropTypes.func.isRequired,
  /**
   * @description click action callback
   */
  onClickAction: PropTypes.func.isRequired,
  /**
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly: PropTypes.func.isRequired,
  /**
   * @description Click track callback
   */
  onClickRow: PropTypes.func.isRequired,
  /**
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea: PropTypes.func.isRequired,
  /**
   * @description Right-click action callback
   */
  onContextMenuAction: PropTypes.func.isRequired,
  /**
   * @description Right-click track callback
   */
  onContextMenuRow: PropTypes.func.isRequired,
  /**
   * @description cursor drag event
   */
  onCursorDrag: PropTypes.func.isRequired,
  /**
   * @description cursor ends drag event
   */
  onCursorDragEnd: PropTypes.func.isRequired,
  /**
   * @description cursor starts drag event
   */
  onCursorDragStart: PropTypes.func.isRequired,
  /**
   * @description Double-click action callback
   */
  onDoubleClickAction: PropTypes.func.isRequired,
  /**
   * @description Double-click track callback
   */
  onDoubleClickRow: PropTypes.func.isRequired,
  /**
   * @description Default height of each edit line (>0, unit: px)
   * @default 32
   */
  rowHeight: PropTypes.number.isRequired,
  /**
   * @description Single tick mark category (>0)
   * @default 1
   */
  scale: PropTypes.number.isRequired,
  /**
   * Number of scales
   */
  scaleCount: PropTypes.number.isRequired,
  /**
   * @description Number of single scale subdivision units (>0 integer)
   * @default 10
   */
  scaleSplitCount: PropTypes.number.isRequired,
  /**
   * @description Display width of a single scale (>0, unit: px)
   * @default 160
   */
  scaleWidth: PropTypes.number.isRequired,
  /**
   * Whether the action is selected
   */
  selected: PropTypes.bool.isRequired,
  setEditorData: PropTypes.func.isRequired,
  /**
   * Set the number of scales
   */
  setScaleCount: PropTypes.func.isRequired,
  /**
   * The props used for each component slot.
   */
  slotProps: PropTypes.object.isRequired,
  /**
   * Overridable component slots.
   */
  slots: PropTypes.object.isRequired,
  /**
   * @description The distance from the start of the scale to the left (>=0, unit: px)
   * @default 20
   */
  startLeft: PropTypes.number.isRequired,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
  /**
   * Current timeline width
   */
  timelineWidth: PropTypes.number.isRequired,
  track: PropTypes.shape({
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.shape({
          src: PropTypes.string.isRequired,
          style: PropTypes.object.isRequired,
        }).isRequired,
        disable: PropTypes.bool.isRequired,
        effectId: PropTypes.string.isRequired,
        end: PropTypes.number.isRequired,
        flexible: PropTypes.bool.isRequired,
        id: PropTypes.string.isRequired,
        maxEnd: PropTypes.number.isRequired,
        minStart: PropTypes.number.isRequired,
        movable: PropTypes.bool.isRequired,
        name: PropTypes.string.isRequired,
        onKeyDown: PropTypes.func.isRequired,
        selected: PropTypes.bool.isRequired,
        start: PropTypes.number.isRequired,
      }),
    ).isRequired,
    classNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    hidden: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
    lock: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    rowHeight: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
  }).isRequired,
  /**
   * @description TimelineControl editing data
   */
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          data: PropTypes.shape({
            src: PropTypes.string.isRequired,
            style: PropTypes.object.isRequired,
          }).isRequired,
          disable: PropTypes.bool.isRequired,
          effectId: PropTypes.string.isRequired,
          end: PropTypes.number.isRequired,
          flexible: PropTypes.bool.isRequired,
          id: PropTypes.string.isRequired,
          maxEnd: PropTypes.number.isRequired,
          minStart: PropTypes.number.isRequired,
          movable: PropTypes.bool.isRequired,
          name: PropTypes.string.isRequired,
          onKeyDown: PropTypes.func.isRequired,
          selected: PropTypes.bool.isRequired,
          start: PropTypes.number.isRequired,
        }),
      ).isRequired,
      classNames: PropTypes.arrayOf(PropTypes.string).isRequired,
      hidden: PropTypes.bool.isRequired,
      id: PropTypes.string.isRequired,
      lock: PropTypes.bool.isRequired,
      name: PropTypes.string.isRequired,
      rowHeight: PropTypes.number.isRequired,
      selected: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  trackSx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
  viewSelector: PropTypes.string.isRequired,
} as any;

export default TimelineAction;
