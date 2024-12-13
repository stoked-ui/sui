import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha, darken, emphasize, lighten, styled } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';
import LockIcon from '@mui/icons-material/Lock';
import {Fade, ImageList, ImageListItem} from "@mui/material";
import Zoom from '@mui/material/Zoom';
import { Screenshot } from '@stoked-ui/media-selector';
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
import {
  getActionFileTimespan,
  ITimelineAction,
  type TimelineActionProps
} from './TimelineAction.types';
import { getTrackBackgroundColor, type ITimelineTrack } from '../TimelineTrack/TimelineTrack.types';
import { useTimeline } from '../TimelineProvider';
import TimelineFile from "../TimelineFile";
import {getTrackHeight} from "../TimelineProvider/TimelineProviderFunctions";

const Action = styled('div', {
  name: 'MuiTimelineAction',
  slot: 'root',
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop)
    && prop !== 'selected'
    && prop !== 'color'
    && prop !== 'duration'
    && prop !== 'scaleWidth'
    && prop !== 'loop'
    && prop !== 'loopCount'
    && prop !== 'hover'
    && prop !== 'trackHeight'
    && prop !== 'disabled'
    && prop !== 'dim',
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
    background,
    backgroundSize,
    backgroundRepeat,
    backgroundPosition,
    // backgroundColor,
    ...trackBack.action,
    alignContent: 'center',
    padding: 0,
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
    borderRadius: '4px',
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
  const { state, dispatch} = context;
  const {
    settings,
    file,
    flags,
    engine,
    selectedTrack,
    selectedAction
  } = state;
  const {
    scaleCount,
    startLeft,
    scale,
    scaleWidth,
    maxScaleCount,
    scaleSplitCount,
    actionHoverId,
    setScaleCount,
    trackHeight,
    editorMode,
    selected: currentSelection,
  } = settings;

  const { gridSnap } = flags;
  const disableDrag = flags.disableDrag || engine.isPlaying;
  const { action } = props;
  const { selected, flexible = true, movable = true } = action;
  const actionEl = React.useRef<HTMLDivElement>(null);
  const rowRnd = React.useRef<RowRndApi>();
  const isDragWhenClick = React.useRef(false);
  const { id, maxEnd, minStart, end, start } = action;
  const { track } = props;

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
    if (track.locked) {
      return;
    }
    setTransform(parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth }));
  }, [end, start, startLeft, scaleWidth, scale]);

  // configure drag grid and its properties
  const gridSize = scaleWidth / scaleSplitCount;

  // actionName
  const classNames = ['action'];
  if (movable && !track.locked) {
    classNames.push('action-movable');
  }
  if (selectedAction?.id === action.id) {
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
      setScaleCount(curScaleCount, context, dispatch );
    }
  };

  const { onActionMoveStart, onActionMoving } = props;
  const handleDragStart: RndDragStartCallback = () => {
    if (track.locked) {
      return;
    }
    if (onActionMoveStart) {
      onActionMoveStart({ action, track });
    }
  };

  const handleDrag: RndDragCallback = ({ left, width }) => {
    if (track.locked) {
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
    if (track.locked) {
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
    if (track.locked) {
      return;
    }
    if (onActionResizeStart) {
      onActionResizeStart({ action, track, dir });
    }
  };

  const handleResizing: RndResizeCallback = (dir, { left, width }) => {
    if (track.locked) {
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
    if (track.locked) {
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

  const [actionStyle, setActionStyle] = React.useState<any | false>(false);
  React.useEffect(() => {
    if (track.file) {
      const newActionStyle = track.file?.actionStyle(settings, getActionFileTimespan<ITimelineAction>(action))
      if (JSON.stringify(newActionStyle) !== JSON.stringify(actionStyle)) {
        setActionStyle(newActionStyle);
      }
    }
 }, [track.file, action.start, action.end, scaleWidth, scale, trackHeight, track.file?.media.backgroundImage])

  const currTrackHeight = getTrackHeight(track, state);
  const [dynamicTrackHeight, setDynamicTrackHeight] = React.useState(currTrackHeight);
  React.useEffect(() => {
    if (dynamicTrackHeight !== currTrackHeight) {
      setDynamicTrackHeight(currTrackHeight);
    }
  }, [currTrackHeight])

  const [screenshots, setScreenshots] = React.useState<Screenshot[]>([]);
  const [screenshotData, setScreenshotData] = React.useState<{
    start: number,
    end: number,
    scaleWidth: number,
    height: number,
    scale: number,
    screensMissing: boolean,
  }>({ start, end, scaleWidth, height: dynamicTrackHeight, scale, screensMissing: true });

  React.useEffect(() => {
    if ((
      screenshotData.start !== start ||
      screenshotData.end !== end ||
      scaleWidth !== screenshotData.scaleWidth ||
      screenshotData.height !== dynamicTrackHeight ||
      scale !== screenshotData.scale ||
      screenshotData.screensMissing
    )) {
      if (track.file.media?.screenshotStore) {
        track.file.media.screenshotStore.scaleWidth = scaleWidth;
        track.file.media.screenshotStore.scale = scale;
      }
      track.file.media.screenshotStore?.queryScreenshots('track', getActionFileTimespan(action), dynamicTrackHeight).then((queryRes: { found: Screenshot[], missing: number[] }) => {
        setScreenshotData({end, start, scaleWidth, height: dynamicTrackHeight, scale, screensMissing: queryRes.missing.length > 0 })
        setScreenshots(queryRes.found);
      })
    }
  }, [end, start, dynamicTrackHeight, scaleWidth, scaleSplitCount, track.file.media.screenshotStore?.count])

  const loopCount = !!action?.loop && typeof action.loop === 'number' && action.loop > 0 ? action.loop : undefined;

  const locked = (right: boolean) => (
    <Zoom in={track.locked}>
      <LockIcon
        sx={(theme) => ({
          margin: '0 10px',
          color: alpha(`${theme.palette.text.primary}`, 0.65),
          position: 'absolute',
          right: right ? '0' : undefined,
        })}
        fontSize={'small'}

      />
    </Zoom>
  );

  const locks = track.locked ? (
    <React.Fragment>
      {locked(false)}
      {locked(true)}
    </React.Fragment>
  ) : undefined;


  // @ts-ignore
  // @ts-ignore
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
        dim={action?.dim}
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
          event.stopPropagation();
        }}
        onMouseLeave={(event) => {
          dispatch({
            type: 'SET_SETTING',
            payload: { key: 'actionHoverId', value: undefined },
          });
          event.stopPropagation();
        }}
        onMouseDown={() => {
          if (track.locked) {
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
          if (track.locked) {
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
          if (track.locked) {
            return;
          }
          if (onContextMenuAction) {
            const time: number = handleTime(e);
            // e.stopPropagation();
            // e.preventDefault();
            // onContextMenuAction(e, { track, action, time });
          }
        }}
        className={prefix((classNames || []).join(' '))}
        selected={action.selected !== undefined ? action.selected : false}
        style={{
          height: trackHeight,
          alignItems: 'center',
          justifyContent: 'space-between',
          ...actionStyle
        }}
        color={`${TimelineFile.getTrackColor(track)}`}
      >
        <ImageList
          gap={0}
          cols={screenshots?.length}
          sx={{
            overflow: 'hidden',
          }}
        >
          {screenshots.map((screen, index) => (
            <ImageListItem key={`key-${index}`}>
              <img
                key={`ss-${screen.timestamp}`}
                src={screen.data}
                alt={`ss-${screen.timestamp}`}
                className={'screen-shot'}
                style={{
                  aspectRatio: track.file.media.screenshotStore.aspectRatio,
                  objectFit: 'cover',
                  height: '100%',
                  opacity: track.locked ? 0.5 : 0.9,
                  // @ts-ignore
                  WebkitUserDrag: 'none',
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
        {locks}
        <Fade in={!disableDrag && flexible}><LeftStretch className={`${prefix('action-left-stretch')}`} /></Fade>
        <Fade in={!disableDrag && flexible}><RightStretch className={`${prefix('action-right-stretch')}`} /></Fade>
      </Action>
    </TimelineTrackDnd>
  );
}

TimelineAction.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  action: PropTypes.any,
  areaRef: PropTypes.shape({
    current: PropTypes.object,
  }),
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  deltaScrollLeft: PropTypes.func,
  /**
   * Whether the action is prohibited from running
   */
  disabled: PropTypes.bool,
  dragLineData: PropTypes.shape({
    assistPositions: PropTypes.arrayOf(PropTypes.number),
    isMoving: PropTypes.bool,
    movePositions: PropTypes.arrayOf(PropTypes.number),
  }),
  /**
   * Whether the action is scalable
   */
  flexible: PropTypes.bool,
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds: PropTypes.func,
  /**
   * @description Custom scale rendering
   */
  getScaleRender: PropTypes.func,
  handleTime: PropTypes.func,
  /**
   * Whether the action is hidden from timeline
   */
  muted: PropTypes.bool,
  /**
   * Whether the action is locked on the timeline
   */
  locked: PropTypes.bool,
  /**
   * Whether the action is movable
   */
  movable: PropTypes.bool,
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd: PropTypes.func,
  /**
   * @description Start moving callback
   */
  onActionMoveStart: PropTypes.func,
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving: PropTypes.func,
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd: PropTypes.func,
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart: PropTypes.func,
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing: PropTypes.func,
  /**
   * @description click action callback
   */
  onClickAction: PropTypes.func,
  /**
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly: PropTypes.func,
  /**
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea: PropTypes.func,
  /**
   * @description Click track callback
   */
  onClickTrack: PropTypes.func,
  /**
   * @description Right-click action callback
   */
  onContextMenuAction: PropTypes.func,
  /**
   * @description Right-click track callback
   */
  onContextMenuTrack: PropTypes.func,
  /**
   * @description cursor drag event
   */
  onCursorDrag: PropTypes.func,
  /**
   * @description cursor ends drag event
   */
  onCursorDragEnd: PropTypes.func,
  /**
   * @description cursor starts drag event
   */
  onCursorDragStart: PropTypes.func,
  /**
   * @description Double-click action callback
   */
  onDoubleClickAction: PropTypes.func,
  /**
   * @description Double-click track callback
   */
  onDoubleClickTrack: PropTypes.func,
  onScroll: PropTypes.func,
  /**
   * Whether the action is selected
   */
  selected: PropTypes.bool,
  /**
   * Set the number of scales
   */
  setScaleCount: PropTypes.func,
  /**
   * The props used for each component slot.
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   */
  slots: PropTypes.object,
  /**
   * @description Custom timelineControl style
   */
  style: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
    ),
    PropTypes.func,
    PropTypes.object,
  ]),
  track: PropTypes.any,
} as any;

export { TimelineAction };
