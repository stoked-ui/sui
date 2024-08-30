// eslint-disable-next-line stoked-ui/sui-name-matches-component-name
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { styled, useThemeProps, emphasize } from '@mui/material/styles';
import {ScrollSync, ScrollSyncNode} from "scroll-sync-react";
import {TimelineBaseProps, TimelineComponent, TimelineProps} from './Timeline.types';
import { getTimelineUtilityClass } from './timelineClasses';
import TimelineState from './TimelineState';
import TimelineLabels from '../TimelineLabels/TimelineLabels';
// import { ITimelineAction } from '../TimelineAction/TimelineAction.types';
import { TimelineLabelsProps } from '../TimelineLabels/TimelineLabels.types';
import {checkProps} from "../utils/check_props";
import {MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME} from "../interface/const";
import {getScaleCountByRows, parserPixelToTime, parserTimeToPixel} from "../utils/deal_data";
import TimelineTrack, { ITimelineTrack } from "../TimelineTrack";
import TimelineTimeArea from "../TimelineTimeArea/TimelineTimeArea";
import TimelineTrackArea from "../TimelineTrackArea/TimelineTrackArea";
import {TimelineTrackAreaState} from "../TimelineTrackArea/TimelineTrackArea.types";
import ScrollResizer from "../ScrollResizer/ScrollResizer";
import {ITimelineAction} from "../TimelineAction";
import Box from '@mui/system/Box';
import {useDragLines} from "../DragLines/useDragLines";
import {Grid} from "react-virtualized";
import MainComponent from "./MainComponent";

const useUtilityClasses = (ownerState: TimelineProps) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    labels: ['labels'],
    time: ['time'],
    tracks: ['tracks'],
    scroll: ['scroll'],
  };

  return composeClasses(slots, getTimelineUtilityClass, classes);
};

const TimelineRoot = styled('div', {
  name: 'MuiTimeline',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) =>
    prop !== 'labels',
})(({ theme }) => ({
  '& ::-webkit-scrollbar': {
    height: 0,
    width: 0
  },
  width: '100%',
  minHeight: 'max-content',
  height: '100%',
  position: 'relative',
  fontSize: '12px',
  backgroundColor: emphasize(theme.palette.background.default, 0.04),
  '&:hover': {
    '& .SuiScrollbar': {
      height: '12px',
    },
  },
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

/**
 *
 * Demos:
 *
 * - [Timeline](https://stoked-ui.github.io/timeline/docs/)
 *
 * API:
 *
 * - [Timeline](https://stoked-ui.github.io/timeline/api/)
 */
const Timeline = React.forwardRef(function Timeline(
  inProps: TimelineProps,
  ref: React.Ref<TimelineState>,
): React.JSX.Element {
  const checkedProps = checkProps( useThemeProps({
    props: inProps,
    name: 'MuiTimeline',
  }));
  const { style } = inProps;

  const {
    slots,
    slotProps,
    setTracks,
    tracks,
    // trackSx,
    actionTypes,
    // autoScroll,
    hideCursor,
    disableDrag,
    scale,
    scaleWidth,
    startLeft = 2,
    minScaleCount,
    maxScaleCount,
    engine: engineRef,
    autoReRender = true,
  } = checkedProps;

  const classes = useUtilityClasses(inProps);

  const timelineState = React.useRef<TimelineState>(null);
  const domRef = React.useRef<HTMLDivElement>(null);

  const areaRef = React.useRef<HTMLDivElement>();
  const scrollResizerRef = React.useRef<HTMLDivElement>(null);

  // Editor data
  // scale quantity
  const [scaleCount, setScaleCount] = React.useState(MIN_SCALE_COUNT);
  // cursor distance
  const [cursorTime, setCursorTime] = React.useState(START_CURSOR_TIME);
  // Is it running?
  const [isPlaying, setIsPlaying] = React.useState(false);
  // Current timelineControl width
  const [width, setWidth] = React.useState(Number.MAX_SAFE_INTEGER);
  const Root = slots?.root ?? TimelineRoot;
 /*
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState: { ...inProps },
  });

  */

    const Labels = slots?.labels ?? TimelineLabels;
  const labelsRef: React.RefObject<HTMLDivElement> = React.useRef(null);
  const labelsProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.labels,
    className: classes.labels,
    ownerState: { ...inProps, sx: inProps.labelsSx, timelineState } as TimelineLabelsProps,
  });

  const Time= slots?.time ?? TimelineTimeArea;
  const timeRef = React.useRef<HTMLElement>(null);
  const timeProps = useSlotProps({
    elementType: Time,
    externalSlotProps: slotProps?.time,
    className: classes.time,
    ownerState: checkedProps as TimelineBaseProps,
  });

  const Tracks = slots?.tracks ?? TimelineTrackArea;
  const tracksRef = React.useRef<HTMLElement>(null);
  const tracksProps = useSlotProps({
    elementType: Tracks,
    externalSlotProps: slotProps?.tracks,
    className: classes.tracks,
    ownerState: { sx: inProps.tracksSx, trackSx: inProps.trackSx, tracks, setTracks },
  });

  const Scroll = slots?.scroll ?? ScrollResizer;
  const scrollRef = React.useRef<HTMLElement>(null);
  const scrollProps = useSlotProps({
    elementType: Scroll,
    externalSlotProps: slotProps?.scroll,
    className: classes.scroll,
    ownerState: { scaleWidth },
  });

  const createAction = (e: React.MouseEvent<HTMLElement, MouseEvent>, { track, time }) => {
    const updatedTracks = [...inProps.tracks];
    const rowIndex = updatedTracks.findIndex((previousTrack) => previousTrack.id === track.id);
    const newAction: ITimelineAction = {
      id: `action ${tracks.length}`,
      start: time,
      end: time + 0.5,
      effectId: 'effect0',
    };
    updatedTracks[rowIndex] = { ...track, actions: [...track.actions, newAction]};
    console.log('create action ', newAction.id, newAction);
    setTracks(updatedTracks);
  };

  /** dynamicSettings scale count */
  const handleSetScaleCount = (value: number) => {
    setScaleCount(Math.min(maxScaleCount, Math.max(minScaleCount, value)));
  };

  /** Monitor data changes */
  React.useEffect(() => {
    handleSetScaleCount(getScaleCountByRows(tracks, { scale }));
    if (setTracks) {
      // setTracks(tracks);
    }
  }, [tracks, minScaleCount, maxScaleCount, scale]);

  React.useEffect(() => {
    if (engineRef?.current) {
      engineRef.current.actionTypes = actionTypes;
    }
  }, [actionTypes]);

  React.useEffect(() => {
    if (engineRef?.current) {
      engineRef.current.tracks = tracks;
    }
  }, [tracks]);

  React.useEffect(() => {
    if (autoReRender && engineRef?.current) {
      engineRef.current.reRender();
    }
  }, [tracks]);


  /** handle proactive data changes */
  const handleEditorDataChange = (updatedTracks: ITimelineTrack[]) => {
    if (engineRef?.current) {
      setTracks(updatedTracks);
      engineRef.current.tracks = updatedTracks;
      if (autoReRender) {
        engineRef.current.reRender();
      }
    }
  };

  /** handleCursor */
  const handleSetCursor = (param: { left?: number; time?: number; updateTime?: boolean }) => {
    let { left, time } = param;
    const { updateTime = true } = param;

    if (typeof left === 'undefined' && typeof time === 'undefined') {
      return undefined;
    }

    if (typeof left === 'undefined') {
      left = parserTimeToPixel(time, { startLeft, scale, scaleWidth });
    }

    if (typeof time === 'undefined') {
      time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    }

    let result = true;
    if (updateTime) {
      result = engineRef.current.setTime(time);
      if (autoReRender) {
        engineRef.current.reRender();
      }
    }

    if (result) {
      setCursorTime(time);
    }

    return result;
  };

  // process runner related data
  React.useEffect(() => {
    if (!engineRef?.current) {
      return;
    }
    const handleTime = ({ time }) => {
      handleSetCursor({ time, updateTime: false });
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePaused = () => setIsPlaying(false);
    engineRef.current.on('setTimeByTick', handleTime);
    engineRef.current.on('play', handlePlay);
    engineRef.current.on('paused', handlePaused);
  }, [engineRef]);

  React.useEffect(() => {
    if (timeRef.current && tracksRef.current) {
      const tracksWidth = timelineState.current.tracks.getAttribute('width')
      console.log('tracksWidth', tracksWidth);
      let timeWidth = timelineState.current.time.getAttribute('width')
      console.log('timeWidth',timeWidth);
      timeRef.current.setAttribute('width', timeWidth)
      timeWidth = timelineState.current.time.getAttribute('width')
      console.log('timeWidth',timeWidth);
    }
  }, [timelineState.current?.tracks?.getAttribute('width')])
  // ref data
  React.useImperativeHandle(
    ref,
    () => ({
      get target() {
        return domRef.current;
      },
      get listener() {
        return engineRef.current;
      },
      get labels() {
        return labelsRef.current;
      },
      get time() {
        return timeRef.current;
      },
      get tracks() {
        return tracksRef.current;
      },
      get scroll() {
        return scrollRef.current;
      },
      get isPlaying() {
        return engineRef.current?.isPlaying;
      },
      get isPaused() {
        return engineRef.current?.isPaused;
      },
      get scrollBar() {
        return scrollResizerRef.current;
      },
      setPlayRate: engineRef?.current?.setPlayRate.bind(engineRef.current),
      getPlayRate: engineRef?.current?.getPlayRate.bind(engineRef.current),
      setTime: (time: number) => handleSetCursor({ time }),
      getTime: engineRef?.current?.getTime.bind(engineRef.current),
      reRender: engineRef?.current?.reRender.bind(engineRef.current),
      play: (param: Parameters<TimelineState['play']>[0]) => {

        const playing = engineRef?.current?.play({...(param as any)})
        return playing;
      },
      pause: engineRef?.current?.pause.bind(engineRef.current),
      setScrollLeft: (val: number) => {
        /* if (scrollSync?.current) {
          scrollSync?.current?.setState({ scrollLeft: Math.max(val, 0) });
        } */
      },
      setScrollTop: (val: number) => {
        /* if (scrollSync.current) {
          scrollSync.current?.setState({ scrollTop: Math.max(val, 0) });
        } */
      },
    }),
    [engineRef],
  );
  // monitor timelineControl area width changes

  const [scrollThumbPosition, setScrollThumbPosition] = React.useState(0);
  const syncRef = React.useRef<HTMLElement>(null)
  const setScaleFallback = () => {};




  /** Get the /* rendering content of each cell *!/
   const CellRenderer: GridCellRenderer = ({ rowIndex, key, style }) => {
   const track = tracks[rowIndex]; // track data
   return (
   <TimelineTrack
   {...props}
   style={{
   ...style,
   backgroundPositionX: `0, ${startLeft}px`,
   backgroundSize: `${startLeft}px, ${scaleWidth}px`,
   }}
   areaRef={editAreaRef}
   key={key}
   rowHeight={track?.rowHeight || rowHeight}
   track={track}
   dragLineData={dragLineData}

   onActionMoveStart={(data) => {
   handleInitDragLine(data);
   return onActionMoveStart && onActionMoveStart(data);
   }}
   onActionResizeStart={(data) => {
   handleInitDragLine(data);

   return onActionResizeStart && onActionResizeStart(data);
   }}
   onActionMoving={(data) => {
   handleUpdateDragLine(data);
   return onActionMoving && onActionMoving(data);
   }}
   onActionResizing={(data) => {
   handleUpdateDragLine(data);
   return onActionResizing && onActionResizing(data);
   }}
   onActionResizeEnd={(data) => {
   disposeDragLine();
   return onActionResizeEnd && onActionResizeEnd(data);
   }}
   onActionMoveEnd={(data) => {
   disposeDragLine();
   return onActionMoveEnd && onActionMoveEnd(data);
   }}
   />
   );
   }; */


  function useTracks (props: any, timelineState: React.MutableRefObject<TimelineState>) {
    const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLines();
    const editAreaRef = React.useRef<HTMLDivElement>();
    const gridRef = React.useRef<Grid>();
    const heightRef = React.useRef(-1);

    // ref data


    const handleInitDragLine: TimelineBaseProps['onActionMoveStart'] = (data) => {
      if (props.dragLine) {
        const assistActionIds =
          props.getAssistDragLineActionIds &&
          props.getAssistDragLineActionIds({
            action: data.action,
            track: data.track,
            tracks,
          });
        const cursorLeft = parserTimeToPixel(cursorTime, { scaleWidth, scale, startLeft });
        const assistPositions = defaultGetAssistPosition({
          tracks,
          assistActionIds,
          action: data.action,
          track: data.track,
          scale,
          scaleWidth,
          startLeft,
          hideCursor,
          cursorLeft,
        });
        initDragLine({ assistPositions });
      }
    };

    const handleUpdateDragLine: TimelineBaseProps['onActionMoving'] = (data) => {
      if (props.dragLine) {
        const movePositions = defaultGetMovePosition({
          ...data,
          startLeft,
          scaleWidth,
          scale,
        });
        updateDragLine({ movePositions });
      }
    };
    const trackAreaProps = {
      scrollSyncNode: syncRef, ...{...checkedProps},
      timelineWidth: width,
      ref: (trackAreaEditRef: TimelineTrackAreaState) => {
        (areaRef.current as any) = trackAreaEditRef?.domRef.current;
      },
      disableDrag: disableDrag || isPlaying,
      tracks,
      cursorTime,
      scaleCount,
      setScaleCount: handleSetScaleCount,
      setTracks: handleEditorDataChange,
      actionTypes,
      style: {
        backgroundPositionX: `0, ${startLeft}px`,
        backgroundSize: `${startLeft}px, ${scaleWidth}px`,
        overflow: 'auto',
        height: '32px'
      }
    }
    return () => tracks.map((track, index) => {
          return (
        <ScrollSyncNode>
          <TimelineTrack
            {...trackAreaProps}
            areaRef={editAreaRef}
            key={index}
            rowHeight={track?.rowHeight || props.rowHeight}
            track={track}
            dragLineData={dragLineData}
            scrollLeft={props.scrollLeft}
            deltaScrollLeft={(scrollLeft: number) => {}}
            onActionMoveStart={(data) => {
              handleInitDragLine(data);
              return props.onActionMoveStart?.(data);
            }}
            onActionResizeStart={(data) => {
              handleInitDragLine(data);

              return props.onActionResizeStart?.(data);
            }}
            onActionMoving={(data) => {
              handleUpdateDragLine(data);
              return props.onActionMoving?.(data);
            }}
            onActionResizing={(data) => {
              handleUpdateDragLine(data);
              return props.onActionResizing?.(data);
            }}
            onActionResizeEnd={(data) => {
              disposeDragLine();
              return props.onActionResizeEnd?.(data);
            }}
            onActionMoveEnd={(data) => {
              disposeDragLine();
              return props.onActionMoveEnd?.(data);
            }}
          />
        </ScrollSyncNode>)})}

  const renderTracks = useTracks(checkedProps, timelineState);

  return (
    <TimelineRoot
      style={style}
      sx={inProps.sx}
      ref={domRef}
      className={`${PREFIX} ${disableDrag ? `${PREFIX}-disable` : ''}`}
    >
      <ScrollSync >

        <Box style={{ display: 'flex', flexDirection: 'column' }} ref={syncRef}>
          <MainComponent/>

          <ScrollSyncNode>
            <TimelineTimeArea
              {...timeProps.ownerState}
              timelineWidth={width}
              disableDrag={disableDrag || isPlaying}
              setCursor={handleSetCursor}
              cursorTime={cursorTime}
              tracks={tracks}
              scaleCount={scaleCount}
              setScaleCount={handleSetScaleCount}
              scrollLeft={0}
            />
          </ScrollSyncNode>

          <TimelineTrackArea
            scrollSyncNode={syncRef}
            {...checkedProps}
            timelineWidth={width}
            ref={(editAreaRef: TimelineTrackAreaState) => {
              (areaRef.current as any) = editAreaRef?.domRef.current;
            }}
            disableDrag={disableDrag || isPlaying}
            tracks={tracks}
            cursorTime={cursorTime}
            scaleCount={scaleCount}
            setScaleCount={handleSetScaleCount}
            setTracks={handleEditorDataChange}
            actionTypes={actionTypes}

            onScroll={(params) => {
              /*  const scrollPercentage = params.scrollLeft / (params.scrollWidth);
               // const scrollbarPosition = scrollPercentage * (params.clientWidth);
               const dragging = scrollResizerRef.current?.getAttribute('dragging');
               if (scrollResizerRef.current && dragging === 'false') {
               setScrollThumbPosition((params.clientWidth - 50) * (scrollPercentage / 5.23));
               }
               if (onScrollVertical) {
               onScrollVertical(params);
               }
               */
            }}

          />


          <ScrollSyncNode >
            <div style={{width: '100%', overflow: 'auto', height: '300px', display: 'flex', flexDirection: 'row'}}>
              {/* Content for the first scrollable area */}
              {Array.from({length: 50}, (_, i) => (<p key={i}>Item {i + 1}</p>))}
            </div>
          </ScrollSyncNode>
          <ScrollSyncNode>
            <div style={{width: '100%', overflow: 'auto', height: '300px', display: 'flex', flexDirection: 'row'}}>
              {/* Content for the first scrollable area */}
              {Array.from({length: 300}, (_, i) => (<p key={i}>Item {i + 1}</p>))}
            </div>
          </ScrollSyncNode>
          {!hideCursor && (
            <ScrollSyncNode>
              <div style={{width: '100%', overflow: 'auto', height: '300px', display: 'flex', flexDirection: 'row'}}>
                {/* Content for the first scrollable area */}
                {Array.from({length: 75}, (_, i) => (<p key={i}>Item {i + 1}</p>))}
              </div>
            </ScrollSyncNode>)}
          <ScrollSyncNode>
            <ScrollResizer
              parentRef={areaRef}
              selector={'[role=grid]'}
              scale={scaleWidth}
              maxScale={scaleWidth * 20}
              scrollThumbPosition={scrollThumbPosition}
              setScrollThumbPosition={setScrollThumbPosition}
              minScale={1}
              setScale={inProps.setScaleWidth ?? setScaleFallback}
              ref={scrollResizerRef}
            />
          </ScrollSyncNode>
        </Box>
      </ScrollSync>
    </TimelineRoot>
  );
}) as TimelineComponent;

Timeline.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * @description timelineControl action actionType map
   */
  actionTypes: PropTypes.object,
  /**
   * @description Whether to automatically re-render (update tick when data changes or cursor time
   *   changes)
   * @default true
   */
  autoReRender: PropTypes.bool,
  /**
   * @description Whether to start automatic scrolling when dragging
   * @default false
   */
  autoScroll: PropTypes.bool,
  /**
   * @description Disable dragging of all action areas
   * @default false
   */
  disableDrag: PropTypes.bool,
  /**
   * @description Start dragging auxiliary line adsorption
   * @default false
   */
  dragLine: PropTypes.bool,
  /**
   * @description timelineControl runner, if not passed, the built-in runner will be used
   */
  engine: PropTypes.any.isRequired,
  /**
   * @description Custom action area rendering
   */
  getActionRender: PropTypes.func,
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds: PropTypes.func,
  /**
   * Set playback rate
   */
  getPlayRate: PropTypes.func,
  /**
   * @description Custom scale rendering
   */
  getScaleRender: PropTypes.func,
  /**
   * Get the current playback time
   */
  getTime: PropTypes.func,
  /**
   * @description Whether to enable grid movement adsorption
   * @default false
   */
  gridSnap: PropTypes.bool,
  /**
   * @description whether to hide the cursor
   * @default false
   */
  hideCursor: PropTypes.bool,
  /**
   * Whether it is paused
   */
  isPaused: PropTypes.bool,
  /**
   * Whether it is playing
   */
  isPlaying: PropTypes.bool,
  /**
   * Run the listener
   */
  listener: PropTypes.shape({
    bind: PropTypes.func,
    events: PropTypes.object,
    exist: PropTypes.func,
    off: PropTypes.func,
    offAll: PropTypes.func,
    on: PropTypes.func,
    trigger: PropTypes.func,
  }),
  /**
   * @description Maximum number of scales (>=minScaleCount)
   * @default Infinity
   */
  maxScaleCount: PropTypes.number,
  /**
   * @description Minimum number of ticks (>=1)
   * @default 20
   */
  minScaleCount: PropTypes.number,
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
   * @description Click track callback
   */
  onClickRow: PropTypes.func,
  /**
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea: PropTypes.func,
  /**
   * @description Right-click action callback
   */
  onContextMenuAction: PropTypes.func,
  /**
   * @description Right-click track callback
   */
  onContextMenuRow: PropTypes.func,
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
  onDoubleClickRow: PropTypes.func,
  /**
   * @description Edit area scrolling callback (used to control synchronization with editing track
   *   scrolling)
   */
  onScroll: PropTypes.func,
  /**
   * pause
   */
  pause: PropTypes.func,
  /**
   * Play
   */
  play: PropTypes.func,
  /**
   * Re-render the current time
   */
  reRender: PropTypes.func,
  /**
   * @description Default height of each edit line (>0, unit: px)
   * @default 32
   */
  rowHeight: PropTypes.number,
  /**
   * @description Single tick mark category (>0)
   * @default 1
   */
  scale: PropTypes.number,
  /**
   * @description Number of single scale subdivision units (>0 integer)
   * @default 10
   */
  scaleSplitCount: PropTypes.number,
  /**
   * @description Display width of a single scale (>0, unit: px)
   * @default 160
   */
  scaleWidth: PropTypes.number,

  /**
   * Set playback rate
   */
  setPlayRate: PropTypes.func,
  setScaleWidth: PropTypes.func,
  /**
   * Set scroll left
   */
  setScrollLeft: PropTypes.func,
  /**
   * Set scroll top
   */
  setScrollTop: PropTypes.func,
  /**
   * Set the current playback time
   */
  setTime: PropTypes.func,
  /**
   * @description Data change callback, which will be triggered after the operation action end
   *   changes the data (returning false will prevent automatic engine synchronization to reduce
   *   performance overhead)
   */
  setTracks: PropTypes.func,
  /**
   * @description The distance from the start of the scale to the left (>=0, unit: px)
   * @default 20
   */
  startLeft: PropTypes.number,
  /**
   * @description Custom timelineControl style
   */
  style: PropTypes.object,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
    ),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * dom node
   */
  target: PropTypes.any,

  /**
   * @description TimelineControl editing data
   */
  tracks: PropTypes.arrayOf(
    PropTypes.any
  ).isRequired,
  trackSx: PropTypes.any,
  viewSelector: PropTypes.string,
};

export default Timeline;
