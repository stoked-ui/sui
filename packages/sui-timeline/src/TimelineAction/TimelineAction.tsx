import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha, darken, emphasize, lighten, styled } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';
import LockIcon from '@mui/icons-material/Lock';
import Zoom from '@mui/material/Zoom';
import { DEFAULT_ADSORPTION_DISTANCE, DEFAULT_MOVE_GRID } from '../interface/const';
import {
  getScaleCountByPixel,
  parserTimeToPixel,
  parserTimeToTransform,
  parserTransformToTime,
} from '../utils/deal_data';
import TimelineTrackDnd from '../TimelineTrack/TimelineTrackDnd';
import {
  RndDragCallback,
  RndDragEndCallback,
  RndDragStartCallback,
  RndResizeCallback,
  RndResizeEndCallback,
  RndResizeStartCallback,
  RowRndApi,
} from '../TimelineTrack/TimelineTrackDnd.types';
import { prefix } from '../utils/deal_class_prefix';
import { ITimelineAction, type TimelineActionProps } from './TimelineAction.types';
import { getTrackBackgroundColor, type ITimelineTrack } from '../TimelineTrack/TimelineTrack.types';
import { useTimeline } from '../TimelineProvider';

const Action = styled('div', {
  name: 'MuiTimelineAction',
  slot: 'root',
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'selected' &&
    prop !== 'color' &&
    prop !== 'duration' &&
    prop !== 'scaleWidth' &&
    prop !== 'loopCount' &&
    prop !== 'loop' &&
    prop !== 'trackHeight',
})<{
  selected?: boolean;
  color?: string;
  duration?: number;
  scaleWidth?: number;
  loop?: boolean;
  loopCount?: number;
  hover: boolean;
  trackHeight: number;
  disabled: boolean;
  dim?: boolean;
}>(({
  theme,
  duration,
  scaleWidth,
  color,
  loop = true,
  loopCount,
  selected,
  hover,
  trackHeight,
  disabled,
  dim
}) => {
  /* const base = theme.vars ? `rgba(color(from ${color}) / 1)` : alpha(color, 1);
  const unselected = emphasize(color, 0.7);
  const hover = emphasize(color, 0.45);
  const selectedColor = emphasize(color, 0.3);
  const background = selected ? selectedColor : unselected; */
  // console.log('color', color)

  // if (collapsed) {
  //   color = theme.palette.mode === 'dark' ? '#ccc' : '#444';
  // }
  const trackBack = getTrackBackgroundColor(color, theme.palette.mode, selected, hover, disabled, dim);

  const backgroundColor = emphasize(color, 0.1);
  const darker = darken(backgroundColor, 0.6);
  const lighter = lighten(backgroundColor, 0.6);
  const size = duration && scaleWidth ? duration * (100 / scaleWidth) : undefined;
  let background = `linear-gradient(to right, ${backgroundColor} 1px, ${theme.palette.action.hover} 1px)`;
  let backgroundSize = size ? `${size}px ` : undefined;
  let backgroundRepeat: string | undefined;
  let backgroundPosition: string | undefined;
  if (loop) {
    if (loopCount) {
      const newBack: string[] = [];
      const newSize: string[] = [];
      const newRepeat: string[] = [];
      let total = 0;
      for (let i = 0; i < loopCount; i += 1) {
        newBack.push(background);
        newRepeat.push('no-repeat');
        if (size) {
          newSize.push(`${total}px top`);
          total += size;
        }
      }
      background = `${newBack.join(',')};`;
      backgroundSize = `${newSize.join(',')};`;
      backgroundRepeat = `${newRepeat.join(',')};`;
    }
  } else {
    background += `,linear-gradient(to right, ${lighter} 1px, ${darker} 2
    px, transparent 1px)`;
    backgroundSize = undefined;
    backgroundPosition = `0px top, ${size}px top`;
    backgroundRepeat = 'no-repeat';
  }

  let height = '100%';
  const borderWidth = '1px';
  if (selected) {
    height = `${trackHeight + 2}px`;
  } else if (hover) {
    height = `${trackHeight + 4}px`;
  }
  return {
    borderRadius: '4px',
    borderWidth,
    marginTop: '-1px',
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: dim ? 0.05 : 1,
    background,
    backgroundSize,
    backgroundRepeat,
    backgroundPosition,
    // backgroundColor,
    ...trackBack.action,
    alignContent: 'center',
    padding: '0 0 0 10px',
    overflow: 'hidden',
    textWrap: 'nowrap',
    height,
    borderTop: `1px solid ${lighter}`,
    borderBottom: `1px solid ${darker}`,
    userSelect: 'none',
    justifyContent: 'end',
    display: 'flex',
    touchAction: 'none',
    '&.volume:hover': {
      cursor: "url('/static/cursors/volume-pen.svg') 16 16, auto",
    },
    '&:hover': {
      // backgroundColor:   `${emphasize(color, 0.15)}`,
      '& .label': {
        opacity: '1',
      },
    },
    variants: [
      {
        props: { selected: true },
        style: {
          // backgroundColor: `${color}`,
          '&:hover': {
            // backgroundColor: `${emphasize(color, 0.05)}`,
          },
        },
      },
    ],
  };
});

const sizerColor = (theme) => alpha(theme.palette.text.primary, 0.5);
const sizerHoverColor = (theme) => alpha(theme.palette.text.primary, 0.9);

const LeftStretch = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '10px',
  borderRadius: '4px',
  height: '100%',
  overflow: 'hidden',
  left: 0,
  '&:hover': {
    '&::after': {
      borderLeftColor: sizerHoverColor(theme),
    },
  },
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
    borderLeft: `7px solid ${sizerColor(theme)}`,
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
  '&:hover': {
    '&::after': {
      borderRightColor: sizerHoverColor(theme),
    },
  },
  '&::after': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    margin: 'auto',
    borderRadius: '4px',
    borderTop: '28px solid transparent',
    borderBottom: '28px solid transparent',
    right: 0,
    content: "''",
    borderLeft: '7px solid transparent',
    borderRight: `7px solid ${sizerColor(theme)}`,
  },
}));

function TimelineAction<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
>(props: TimelineActionProps<TrackType, ActionType>) {
  const context = useTimeline();
  const {
    dispatch,
    file,
    flags,
    engine,
    settings: {
      scaleCount,
      startLeft,
      scale,
      scaleWidth,
      maxScaleCount,
      scaleSplitCount,
      actionHoverId,
      setScaleCount,
      getTrackHeight,
      editorMode,
      selectedAction,
      selectedTrack
    },
  } = context;

  const { gridSnap } = flags;
  const disableDrag = flags.disableDrag || engine.isPlaying;
  const { action } = props;
  const { selected, flexible = true, movable = true } = action;
  const actionEl = React.useRef<HTMLDivElement>(null);
  const rowRnd = React.useRef<RowRndApi>();
  const isDragWhenClick = React.useRef(false);
  const { id, maxEnd, minStart, end, start } = action;
  const { track } = props;
  const trackHeight =  getTrackHeight(file.tracks.indexOf(track), context);

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

  const { onActionMoveEnd } = props;
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
    const rowItem = file.tracks.find((item) => item.id === track.id);
    const dragEndAction = rowItem.actions.find((item) => item.id === id);
    dragEndAction.start = dragEndStart;
    dragEndAction.end = dragEndEnd;
    dispatch({ type: 'SET_TRACKS', payload: file.tracks });

    // executeCallback
    if (onActionMoveEnd) {
      onActionMoveEnd({
        action: dragEndAction as ActionType,
        track,
        start: dragEndStart,
        end: dragEndEnd,
      });
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
    const rowItem = file.tracks.find((item) => item.id === track.id);
    const resizeEndAction = rowItem.actions.find((item) => item.id === id);
    resizeEndAction.start = resizeEndStart;
    resizeEndAction.end = resizeEndEnd;
    dispatch({ type: 'SET_TRACKS', payload: file.tracks });

    // triggerCallback
    if (onActionResizeEnd) {
      onActionResizeEnd({
        action: resizeEndAction as ActionType,
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

  const nowRow: TrackType = {
    ...track,
    actions: [...track.actions],
  };
  if (track.actions.includes(action)) {
    nowRow.actions[track.actions.indexOf(action)] = nowAction;
  }

  const {
    areaRef,
    dragLineData,
    deltaScrollLeft,
    handleTime,
    onClickAction,
    onClickActionOnly,
    onDoubleClickAction,
    onContextMenuAction,
  } = props;

  React.useEffect(() => {
    const backgroundImageStyle = track.controller.getActionStyle?.(
      action,
      scaleWidth,
      scale,
      trackHeight,
    );
    if (backgroundImageStyle) {
      dispatch({
        type: 'UPDATE_ACTION_STYLE',
        payload: {
          action,
          backgroundImageStyle,
        },
      });
    }
  }, [scaleWidth, trackHeight, scale, action.backgroundImage]);

  const loopCount =
    !!action?.loop && typeof action.loop === 'number' && action.loop > 0 ? action.loop : undefined;

  const hoverLocks = actionHoverId === action.id && track.lock;
  const lock = (
    <Zoom in={hoverLocks}>
      <LockIcon
        sx={(theme) => ({
          marginRight: '10px',
          color: alpha(`${theme.palette.text.primary}`, 0.65),
        })}
        fontSize={'small'}
      />
    </Zoom>
  );

  const locks = track.lock ? (
    <React.Fragment>
      {lock}
      {lock}
    </React.Fragment>
  ) : undefined;

  return (
    <TimelineTrackDnd
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
        ref={actionEl}
        duration={action?.duration}
        scaleWidth={100 / scaleWidth}
        loop={!!action?.loop}
        loopCount={loopCount}
        disabled={action?.disabled}
        id={action.id}
        tabIndex={0}
        dim={editorMode !== 'project' && (selectedTrack?.id !== track.id || selectedAction?.id !== action.id)}
        trackHeight={trackHeight}
        onKeyDown={(event: any) => {
          event.currentTarget = action;
          // eslint-disable-next-line default-case
          switch (event.key) {
            case 'Backspace':
            case 'Delete': {
              track.actions = track.actions.filter((trackAction) => trackAction.id !== action.id);
              const trackIndex = file.tracks.indexOf(track);
              file.tracks[trackIndex] = { ...track };
              dispatch({ type: 'SET_TRACKS', payload: [...file.tracks] });
              event.preventDefault();
              break;
            }
            case 'Meta': {
              // actionEl.current.classList?.add('volume');
              break;
            }
          }

        }}
        hover={actionHoverId === action.id ? true : undefined}
        onMouseEnter={(event) => {
          dispatch({
            type: 'SET_SETTING',
            payload: { key: 'actionHoverId', value: action.id },
          });
          dispatch({
            type: 'SET_SETTING',
            payload: { key: 'trackHoverId', value: track.id },
          });
          event.stopPropagation();
        }}
        onMouseLeave={() => {
          dispatch({
            type: 'SET_SETTING',
            payload: { key: 'actionHoverId', value: undefined },
          });
          dispatch({
            type: 'SET_SETTING',
            payload: { key: 'trackHoverId', value: undefined },
          });
        }}
        onMouseDown={() => {
          if (track.lock) {
            return;
          }
          isDragWhenClick.current = false;
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          dispatch({ type: 'SELECT_ACTION', payload: action });
          const time: number = handleTime(e);
          if (onClickAction) {
            onClickAction(e, { track, action, time });
          }
          if (!isDragWhenClick.current && onClickActionOnly) {

            onClickActionOnly(e, { track, action, time });
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (track.lock) {
            return;
          }
          if (onDoubleClickAction) {
            e.stopPropagation();
            e.preventDefault();
            const time: number = handleTime(e);
            onDoubleClickAction(e, { track, action, time });
          }
        }}
        onContextMenu={(e) => {
          if (track.lock) {
            return;
          }
          if (onContextMenuAction) {
            const time: number = handleTime(e);
            e.stopPropagation();
            e.preventDefault();
            onContextMenuAction(e, { track, action, time });
          }
        }}
        className={prefix((classNames || []).join(' '))}
        selected={action.selected !== undefined ? action.selected : false}
        style={{
          height: trackHeight,
          alignItems: 'center',
          justifyContent: 'space-between',
          ...action.backgroundImageStyle,
        }}
        color={`${track?.controller?.color}`}
      >
        {locks}
        {!disableDrag && flexible && <LeftStretch className={`${prefix('action-left-stretch')}`} />}
        {!disableDrag && flexible && (
          <RightStretch className={`${prefix('action-right-stretch')}`} />
        )}
      </Action>
    </TimelineTrackDnd>
  );
}

TimelineAction.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  action: PropTypes.any.isRequired,
  areaRef: PropTypes.shape({
    current: PropTypes.object.isRequired,
  }).isRequired,
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  classes: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  deltaScrollLeft: PropTypes.func.isRequired,
  /**
   * Whether the action is prohibited from running
   */
  disable: PropTypes.bool.isRequired,
  dragLineData: PropTypes.shape({
    assistPositions: PropTypes.arrayOf(PropTypes.number).isRequired,
    isMoving: PropTypes.bool.isRequired,
    movePositions: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  /**
   * Whether the action is scalable
   */
  flexible: PropTypes.bool.isRequired,
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds: PropTypes.func.isRequired,
  /**
   * @description Custom scale rendering
   */
  getScaleRender: PropTypes.func.isRequired,
  handleTime: PropTypes.func.isRequired,
  /**
   * Whether the action is hidden from timeline
   */
  hidden: PropTypes.bool.isRequired,
  /**
   * Whether the action is locked on the timeline
   */
  locked: PropTypes.bool.isRequired,
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
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea: PropTypes.func.isRequired,
  /**
   * @description Click track callback
   */
  onClickTrack: PropTypes.func.isRequired,
  /**
   * @description Right-click action callback
   */
  onContextMenuAction: PropTypes.func.isRequired,
  /**
   * @description Right-click track callback
   */
  onContextMenuTrack: PropTypes.func.isRequired,
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
  onDoubleClickTrack: PropTypes.func.isRequired,
  onScroll: PropTypes.func.isRequired,
  /**
   * Whether the action is selected
   */
  selected: PropTypes.bool.isRequired,
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
   * @description Custom timelineControl style
   */
  style: PropTypes.object.isRequired,
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
  track: PropTypes.any.isRequired,
} as any;

export { TimelineAction };
