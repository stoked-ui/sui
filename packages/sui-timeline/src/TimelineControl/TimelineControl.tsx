import * as React from 'react';
import PropTypes from 'prop-types';
import styled from '@mui/system/styled';
import {ScrollSync} from 'react-virtualized';
import {MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME} from '../interface/const';
import { ITimelineTrack } from '../TimelineTrack/TimelineTrack.types';
import {TimelineControlComponent, TimelineControlProps} from './TimelineControlProps';
import {type TimelineState} from '../Timeline/TimelineState';
import {checkProps} from '../utils/check_props';
import {getScaleCountByRows, parserPixelToTime, parserTimeToPixel} from '../utils/deal_data';
import TimelineCursor from '../TimelineCursor/TimelineCursor';
import TimelineTrackArea, { TimelineTrackAreaState } from '../TimelineTrackArea/TimelineTrackArea';
import TimelineArea from '../TimelineTime/TimelineTime';
import TimelineScrollResizer from '../TimelineScrollResizer/TimelineScrollResizer';

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

function getInitialScaleWidth(startLeft: number, duration: number, timelineAreaWidth: number) {
  return (timelineAreaWidth - startLeft) / duration;
}

const TimelineControl = React.forwardRef(
  function TimelineControl(props: TimelineControlProps, ref) {
    const checkedProps = checkProps(props);
    const { style } = props;
    const {
      controllers,
      tracks,
      scrollTop,
      autoScroll,
      hideCursor,
      disableDrag,
      scaleWidth,
      startLeft = 2,
      minScaleCount: initialMinScaleCount,
      maxScaleCount,
      scaleSplitCount: initialScaleSplitCount,
      setTracks,
      engineRef,
      autoReRender = true,
      onScroll: onScrollVertical,
    } = checkedProps;


    const domRef = React.useRef<HTMLDivElement>(null);

    const areaRef = React.useRef<HTMLDivElement>(null);
    const gridRef = React.useRef<HTMLDivElement>(null);
    const scrollSync = React.useRef<ScrollSync>();

    // Editor data
    // scale quantity
    const [scaleCount, setScaleCount] = React.useState(MIN_SCALE_COUNT);
    // cursor distance
    const [cursorTime, setCursorTime] = React.useState(START_CURSOR_TIME);
    // Is it running?
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [duration, setDuration] = React.useState<number>()
    // Current timelineControl width
    const [width, setWidth] = React.useState(Number.MAX_SAFE_INTEGER);
    const [scale, setScale] = React.useState(1);
    const [minScaleCount, setMinScaleCount] = React.useState(initialMinScaleCount);
    const [scaleSplitCount, setScaleSplitCount] = React.useState(initialScaleSplitCount)
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

    }, [minScaleCount, maxScaleCount, scale]);

    React.useEffect(() => {
      let newScaleSplitCount = scaleSplitCount;
      if (scaleWidth < 50) {
        newScaleSplitCount = 2;
      } else if (scaleWidth < 100) {
        newScaleSplitCount = 5;
      } else {
        newScaleSplitCount = 10;
      }
      if (newScaleSplitCount !== scaleSplitCount) {
        setScaleSplitCount(newScaleSplitCount)
      }
    }, [scaleWidth])

    React.useEffect(() => {
      if (engineRef?.current) {
        engineRef.current.controllers = controllers;
      }
    }, [controllers]);

    React.useEffect(() => {
      if (!engineRef?.current || !tracks) {
        return;
      }
      engineRef.current.tracks = tracks;
      const getDuration = () => {
        let furthest = 0;
        if (tracks) {
          tracks.forEach((row) => {
            row.actions.forEach((action) => {
              if (action.end > furthest) {
                furthest = action.end;
              }
            })
          });
        }
        return furthest;
      }
      const durr = getDuration();
      setDuration(durr);
      setMinScaleCount(durr + 2);

    }, [tracks]);


    // deprecated
    React.useEffect(() => {
      if (scrollSync.current) {
        scrollSync.current.setState({ scrollTop });
      }
    }, [scrollTop]);

    /** handle proactive data changes */
    const handleEditorDataChange = (updatedTracks: ITimelineTrack[]) => {
      if (engineRef.current) {
        setTracks([...updatedTracks]);
        if (autoReRender) {
          engineRef.current.reRender();
        }
      }
    };

    const setHorizontalScroll = (left: number) => {
      scrollSync.current.setState({
        scrollLeft: Math.max(left, 0),
      });
    };
    /** handleCursor */
    const handleSetCursor = (param: { left?: number; time?: number; updateTime?: boolean, move?: boolean }) => {
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

      if ((typeof time !== 'undefined' || typeof time === 'undefined') && param.move) {
        setHorizontalScroll(left - (scrollSync.current.state.clientWidth * .5));
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

      if (!engineRef.current) {
        return;
      }

      const handleTime = ({ time }) => {
        handleSetCursor({ time, updateTime: false });
      };

      const handlePlay = () => setIsPlaying(true);

      const handlePaused = () => setIsPlaying(false);

      const handleScrollLeft = (({ left }) => {
        if (scrollSync?.current) {
          scrollSync?.current?.setState({scrollLeft: Math.max(left, 0)});
        }
      })

      engineRef.current.on('setTimeByTick', handleTime);
      engineRef.current.on('play', handlePlay);
      engineRef.current.on('paused', handlePaused);
      engineRef.current.on('setScrollLeft', handleScrollLeft);
    }, [engineRef.current]);

    // ref data
    React.useImperativeHandle(
      ref,
      () => ({
          get engine() {
            return engineRef.current;
          },
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
          setPlayRate: engineRef.current?.setPlayRate.bind(engineRef.current),
          getPlayRate: engineRef.current?.getPlayRate.bind(engineRef.current),
          setTime: (time: number, move?: boolean) => handleSetCursor({time, move}),
          getTime: engineRef.current?.getTime.bind(engineRef.current),
          reRender: engineRef.current?.reRender.bind(engineRef.current),
          play: (param: Parameters<TimelineState['play']>[0]) => engineRef.current?.play({...(param as any)}),
          pause: engineRef.current?.pause.bind(engineRef.current),
          setScrollLeft: (val: number) => {
            return engineRef.current?.setScrollLeft(val);
          },
          setScrollTop: (val: number) => {
            if (scrollSync.current) {
              scrollSync.current?.setState({scrollTop: Math.max(val, 0)});
            }
          },
          tracks,
          setTracks,
          get duration() {
            return engineRef.current?.duration;
          }
        }), [engineRef.current, duration],
    );

    window.end = () => {
      handleSetCursor({ left: width });
      scrollSync?.current?.setState({ scrollLeft: Math.max(width, 0) });
    }

    const [initialized, setInitialized] = React.useState(false);
    React.useEffect(() => {
      if (width !== Number.MAX_SAFE_INTEGER && duration && !initialized) {
        const newScaleWidth = getInitialScaleWidth(startLeft, minScaleCount, areaRef.current.clientWidth);
        props.setScaleWidth(newScaleWidth);
        setInitialized(true);
      }
    })

    // monitor timelineControl area width changes
    React.useEffect(() => {
      if (!areaRef.current) {
        return undefined;
      }
      const observer = new ResizeObserver(() => {
        if (!areaRef.current) {
          return;
        }
        setWidth(areaRef.current.getBoundingClientRect().width);
      });

      if (width === Number.MAX_SAFE_INTEGER) {
        observer.observe(areaRef.current!);
      }

      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }, [areaRef.current]);

    const setScaleFallback = () => {};
    const newProps = {...checkedProps, scaleSplitCount, scale, scaleWidth, minScaleCount};
    return (
      <TimelineControlRoot
        style={style}
        sx={{...props.sx, backgroundColor: 'unset'}}
        ref={domRef}
        className={`${PREFIX} ${disableDrag ? `${PREFIX}-disable` : ''}`}
      >
        <ScrollSync ref={scrollSync}>
          {({ scrollLeft, scrollTop: scrollTopCurrent, onScroll }) => (
            <React.Fragment>
              <TimelineArea
                {...newProps}
                timelineWidth={width}
                disableDrag={disableDrag || isPlaying}
                setCursor={handleSetCursor}
                cursorTime={cursorTime}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                onScroll={onScroll}
                scrollLeft={scrollLeft}
              />
              <TimelineTrackArea
                {...newProps}
                timelineWidth={width}
                ref={(editAreaRef: TimelineTrackAreaState) => {
                  (areaRef.current as any) = editAreaRef?.domRef.current;
                  (gridRef.current as any) = editAreaRef?.gridRef.current;
                }}
                disableDrag={disableDrag || isPlaying}
                cursorTime={cursorTime}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                scrollTop={scrollTopCurrent}
                scrollLeft={scrollLeft}
                setEditorData={handleEditorDataChange}
                deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
                controllers={controllers}
                onScroll={(params) => {
                  onScroll(params);
                  if (onScrollVertical) {
                    onScrollVertical(params);
                  }
                }}
              />
              {!hideCursor && (
                <TimelineCursor
                  {...newProps}
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
        <TimelineScrollResizer
          element={gridRef}
          type='horizontal'
          adjustScale={(value) => {
            console.log(value);
            const newScaleWidth = getInitialScaleWidth(startLeft, minScaleCount, areaRef.current.clientWidth - value);
            props.setScaleWidth(newScaleWidth);
            return true;
          }}
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
   * @description timelineControl action actionType map
   */
  controllers: PropTypes.object,
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
  engineRef: PropTypes.any,
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
   * @description The scroll distance from the top of the editing area (please use ref.setScrollTop
   *   instead)
   * @deprecated
   */
  scrollTop: PropTypes.number,
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
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  /**
   * dom node
   */
  target: PropTypes.any,
  /**
   * @description TimelineControl editing data
   */
  tracks: PropTypes.arrayOf(PropTypes.any,),
  trackSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  viewSelector: PropTypes.string,
};

export default TimelineControl;
