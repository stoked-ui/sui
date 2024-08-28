import * as React from 'react';
import PropTypes from 'prop-types';
import styled from '@mui/system/styled';
import { ScrollSync } from 'react-virtualized';
import { MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from '../interface/const';
import { TimelineTrack } from '../interface/TimelineAction';
import { TimelineControlProps, TimelineControlComponent } from './TimelineControl.types';
import { TimelineState } from '../Timeline/TimelineState';
import { checkProps } from '../utils/check_props';
import { getScaleCountByRows, parserPixelToTime, parserTimeToPixel } from '../utils/deal_data';
import { Cursor } from '../components/cursor/cursor';
import { EditArea, EditAreaState } from '../components/edit_area/edit_area';
import { TimeArea } from '../components/time_area/time_area';
import ScrollResizer from '../TimelineScrollResizer/ScrollResizer';

const TimelineControlRoot = styled('div')(({ theme }) => ({
  width: '100%',
  minHeight: 'max-content',
  height: '100%',
  position: 'relative',
  fontSize: '12px',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const TimelineControl = React.forwardRef<TimelineState, TimelineControlProps & any>(
  function TimelineControl(props, ref) {
    const checkedProps = checkProps(props);
    const { style } = props;
    const {
      actionTypes,
      tracks,
      scrollTop,
      autoScroll,
      hideCursor,
      disableDrag,
      scale,
      scaleWidth,
      startLeft = 2,
      minScaleCount,
      maxScaleCount,
      setTracks,
      engine: engineRef,
      autoReRender = true,
      onScroll: onScrollVertical,
    } = checkedProps;

    const domRef = React.useRef<HTMLDivElement>(null);

    const areaRef = React.useRef<HTMLDivElement>();
    const scrollSync = React.useRef<ScrollSync>();

    // Editor data
    // scale quantity
    const [scaleCount, setScaleCount] = React.useState(MIN_SCALE_COUNT);
    // cursor distance
    const [cursorTime, setCursorTime] = React.useState(START_CURSOR_TIME);
    // Is it running?
    const [isPlaying, setIsPlaying] = React.useState(false);
    // Current timelineControl width
    const [width, setWidth] = React.useState(Number.MAX_SAFE_INTEGER);

    /** dynamicSettings scale count */
    const handleSetScaleCount = (value: number) => {
      setScaleCount(Math.min(maxScaleCount, Math.max(minScaleCount, value)));
    };

    /** Monitor data changes */
    React.useEffect(() => {
      handleSetScaleCount(getScaleCountByRows(tracks, { scale }));
      if (setTracks) {
        setTracks(tracks);
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

    // deprecated
    React.useEffect(() => {
      if (scrollSync.current) {
        scrollSync.current.setState({ scrollTop });
      }
    }, [scrollTop]);

    /** handle proactive data changes */
    const handleEditorDataChange = (updatedTracks: TimelineTrack[]) => {
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

    const setHorizontalScroll = (left: number) => {
      scrollSync.current.setState({
        scrollLeft: Math.max(left, 0),
      });
    };

    /** setUp scrollLeft */
    const handleDeltaScrollLeft = (delta: number) => {
      // Disable automatic scrolling when the maximum distance is exceeded
      const dataScrollLeft = scrollSync.current.state.scrollLeft + delta;
      if (dataScrollLeft > scaleCount * (scaleWidth - 1) + startLeft - width) {
        return;
      }

      if (scrollSync.current) {
        setHorizontalScroll(scrollSync.current.state.scrollLeft + delta);
      }
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
        get isPlaying() {
          return engineRef.current?.isPlaying;
        },
        get isPaused() {
          return engineRef.current?.isPaused;
        },
        setPlayRate: engineRef?.current?.setPlayRate.bind(engineRef.current),
        getPlayRate: engineRef?.current?.getPlayRate.bind(engineRef.current),
        setTime: (time: number) => handleSetCursor({ time }),
        getTime: engineRef?.current?.getTime.bind(engineRef.current),
        reRender: engineRef?.current?.reRender.bind(engineRef.current),
        play: (param: Parameters<TimelineState['play']>[0]) =>
          engineRef?.current?.play({ ...(param as any) }),
        pause: engineRef?.current?.pause.bind(engineRef.current),
        setScrollLeft: (val: number) => {
          if (scrollSync?.current) {
            scrollSync?.current?.setState({ scrollLeft: Math.max(val, 0) });
          }
        },
        setScrollTop: (val: number) => {
          if (scrollSync.current) {
            scrollSync.current?.setState({ scrollTop: Math.max(val, 0) });
          }
        },
      }),
      [engineRef],
    );

    // monitor timelineControl area width changes
    React.useEffect(() => {
      const observer = new ResizeObserver(() => {
        if (!areaRef.current) {
          return;
        }
        setWidth(areaRef.current.getBoundingClientRect().width);
      });

      if (areaRef.current === undefined && width === Number.MAX_SAFE_INTEGER) {
        observer.observe(areaRef.current!);
      }

      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }, []);

    const setScaleFallback = (value: number) => {};
    return (
      <TimelineControlRoot
        style={style}
        sx={props.sx}
        ref={domRef}
        className={`${PREFIX} ${disableDrag ? `${PREFIX}-disable` : ''}`}
      >
        <ScrollSync ref={scrollSync}>
          {({ scrollLeft, scrollTop: scrollTopCurrent, onScroll }) => (
            <React.Fragment>
              <TimeArea
                {...checkedProps}
                timelineWidth={width}
                disableDrag={disableDrag || isPlaying}
                setCursor={handleSetCursor}
                cursorTime={cursorTime}
                tracks={tracks}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                onScroll={onScroll}
                scrollLeft={scrollLeft}
              />
              <EditArea
                {...checkedProps}
                timelineWidth={width}
                ref={(editAreaRef: EditAreaState) => {
                  (areaRef.current as any) = editAreaRef?.domRef.current;
                }}
                disableDrag={disableDrag || isPlaying}
                tracks={tracks}
                cursorTime={cursorTime}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                scrollTop={scrollTopCurrent}
                scrollLeft={scrollLeft}
                setEditorData={handleEditorDataChange}
                deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
                actionTypes={actionTypes}
                onScroll={(params) => {
                  onScroll(params);
                  if (onScrollVertical) {
                    onScrollVertical(params);
                  }
                }}
              />
              {!hideCursor && (
                <Cursor
                  {...checkedProps}
                  timelineWidth={width}
                  disableDrag={isPlaying}
                  scrollLeft={scrollLeft}
                  scaleCount={scaleCount}
                  setScaleCount={handleSetScaleCount}
                  setCursor={handleSetCursor}
                  cursorTime={cursorTime}
                  tracks={tracks}
                  areaRef={areaRef}
                  scrollSync={scrollSync}
                  deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
                />
              )}
            </React.Fragment>
          )}
        </ScrollSync>
        <ScrollResizer
          parentRef={areaRef}
          selector={'[role=grid]'}
          scale={scaleWidth}
          scrollLeft={scrollSync.current?.state?.scrollLeft}
          maxScale={scaleWidth * 20}
          minScale={1}
          setScale={props.setScaleWidth ?? setScaleFallback}
          setHorizontalScroll={setHorizontalScroll}
        />
      </TimelineControlRoot>
    );
  },
) as TimelineControlComponent;

TimelineControl.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * @description timelineControl action actionType map
   */
  actionTypes: PropTypes.object.isRequired,
  /**
   * @description Whether to automatically re-render (update tick when data changes or cursor time changes)
   * @default true
   */
  autoReRender: PropTypes.bool.isRequired,
  /**
   * @description Whether to start automatic scrolling when dragging
   * @default false
   */
  autoScroll: PropTypes.bool.isRequired,
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
   * @description Custom action area rendering
   */
  getActionRender: PropTypes.func.isRequired,
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds: PropTypes.func.isRequired,
  /**
   * Set playback rate
   */
  getPlayRate: PropTypes.func.isRequired,
  /**
   * @description Custom scale rendering
   */
  getScaleRender: PropTypes.func.isRequired,
  /**
   * Get the current playback time
   */
  getTime: PropTypes.func.isRequired,
  /**
   * @description Whether to enable grid movement adsorption
   * @default false
   */
  gridSnap: PropTypes.bool.isRequired,
  /**
   * @description whether to hide the cursor
   * @default false
   */
  hideCursor: PropTypes.bool.isRequired,
  /**
   * Whether it is paused
   */
  isPaused: PropTypes.bool.isRequired,
  /**
   * Whether it is playing
   */
  isPlaying: PropTypes.bool.isRequired,
  /**
   * Run the listener
   */
  listener: PropTypes.shape({
    bind: PropTypes.func.isRequired,
    events: PropTypes.object.isRequired,
    exist: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    offAll: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    trigger: PropTypes.func.isRequired,
  }).isRequired,
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
   * @description Edit area scrolling callback (used to control synchronization with editing track scrolling)
   */
  onScroll: PropTypes.func.isRequired,
  /**
   * pause
   */
  pause: PropTypes.func.isRequired,
  /**
   * Play
   */
  play: PropTypes.func.isRequired,
  /**
   * Re-render the current time
   */
  reRender: PropTypes.func.isRequired,
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
   * @description The scroll distance from the top of the editing area (please use ref.setScrollTop instead)
   * @deprecated
   */
  scrollTop: PropTypes.number.isRequired,
  /**
   * Set playback rate
   */
  setPlayRate: PropTypes.func.isRequired,
  setScaleWidth: PropTypes.func.isRequired,
  /**
   * Set scroll left
   */
  setScrollLeft: PropTypes.func.isRequired,
  /**
   * Set scroll top
   */
  setScrollTop: PropTypes.func.isRequired,
  /**
   * Set the current playback time
   */
  setTime: PropTypes.func.isRequired,
  /**
   * @description Data change callback, which will be triggered after the operation action end changes the data (returning false will prevent automatic engine synchronization to reduce performance overhead)
   */
  setTracks: PropTypes.func.isRequired,
  /**
   * @description The distance from the start of the scale to the left (>=0, unit: px)
   * @default 20
   */
  startLeft: PropTypes.number.isRequired,
  /**
   * @description Custom timelineControl style
   */
  style: PropTypes.object.isRequired,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
  /**
   * dom node
   */
  target: function (props, propName) {
    if (props[propName] == null) {
      return new Error(`Prop ${propName} is required but wasn't specified`);
    } else if (typeof props[propName] !== 'object' || props[propName].nodeType !== 1) {
      return new Error("Expected prop '" + propName + "' to be of type Element");
    }
  },
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
};

export { TimelineControl };
