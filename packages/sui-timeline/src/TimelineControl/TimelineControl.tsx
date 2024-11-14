/*
import * as React from 'react';
import PropTypes from 'prop-types';
import styled from '@mui/system/styled';
import {ScrollSync} from 'react-virtualized';
import {MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME} from '../interface/const';
import {TimelineControlComponent, TimelineControlProps} from './TimelineControlProps';
import {type TimelineState} from '../Timeline/TimelineState';
import {checkProps} from '../utils/check_props';
import {getScaleCountByRows, parserPixelToTime, parserTimeToPixel} from '../utils/deal_data';
import TimelineCursor from '../TimelineCursor/TimelineCursor';
import TimelineTrackArea, { TimelineTrackAreaState } from '../TimelineTrackArea/TimelineTrackArea';
import TimelineTime from '../TimelineTime/TimelineTime';
import TimelineScrollResizer from '../TimelineScrollResizer/TimelineScrollResizer';
import {useTimeline} from "../TimelineProvider";
import { TimelineTrackAreaCollapsed } from '../TimelineTrackArea/TimelineTrackAreaCollapsed';
import { fitScaleData } from '../TimelineTrack/TimelineTrack.types';

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

const TimelineControl = React.forwardRef(
  function TimelineControl(props: TimelineControlProps, ref) {


/!*

    // process runner related data
    React.useEffect(() => {
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

      engine.on('setTimeByTick', handleTime);
      engine.on('play', handlePlay);
      engine.on('paused', handlePaused);
      engine.on('setScrollLeft', handleScrollLeft);
    }, [engine]);

    // ref data
    React.useImperativeHandle(
      ref,
      () => ({
        get engine() {
          return engine;
        },
        get target() {
          return domRef.current;
        },
        get listener() {
          return engine;
        },
        get isPlaying() {
          return engine.isPlaying;
        },
        get isPaused() {
          return engine.isPaused;
        },
        setPlayRate: engine.setPlayRate.bind(engine),
        getPlayRate: engine.getPlayRate.bind(engine),
        setTime: (time: number, move?: boolean) => handleSetCursor({time, move}),
        getTime: engine.getTime.bind(engine),
        reRender: engine.reRender.bind(engine),
        play: (param: Parameters<TimelineState['play']>[0]) => engine.play({...(param as any)}),
        pause: engine.pause.bind(engine),
        setScrollLeft: (val: number) => {
          return engine.setScrollLeft(val);
        },
        setScrollTop: (val: number) => {
          if (scrollSync.current) {
            scrollSync.current?.setState({scrollTop: Math.max(val, 0)});
          }
        },
        get duration() {
          return engine.duration;
        },
      }), [engine, duration],
    );
*!/


    const [initialized, setInitialized] = React.useState(false);


    // console.info('maxScaleCount', maxScaleCount, 'scaleCount', scaleCount, 'minScaleCount', minScaleCount, 'scaleWidth', scaleWidth, 'scale', scale);
    return (

    );
  },
) as TimelineControlComponent;

TimelineControl.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /!**
   * @description Whether to automatically re-render (update tick when data changes or cursor time
   *   changes)
   * @default true
   *!/
  autoReRender: PropTypes.bool,
  /!**
   * @description Whether to start automatic scrolling when dragging
   * @default false
   *!/
  autoScroll: PropTypes.bool,
  /!**
   * @description timelineControl action actionType map
   *!/
  controllers: PropTypes.object,
  /!**
   * @description Disable dragging of all action areas
   * @default false
   *!/
  disableDrag: PropTypes.bool,
  /!**
   * @description Start dragging auxiliary line adsorption
   * @default false
   *!/
  dragLine: PropTypes.bool,
  /!**
   * @description Custom action area rendering
   *!/
  getActionRender: PropTypes.func,
  /!**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   *!/
  getAssistDragLineActionIds: PropTypes.func,
  /!**
   * Set playback rate
   *!/
  getPlayRate: PropTypes.func,
  /!**
   * @description Custom scale rendering
   *!/
  getScaleRender: PropTypes.func,
  /!**
   * Get the current playback time
   *!/
  getTime: PropTypes.func,
  /!**
   * @description Whether to enable grid movement adsorption
   * @default false
   *!/
  gridSnap: PropTypes.bool,
  /!**
   * @description whether to hide the cursor
   * @default false
   *!/
  hideCursor: PropTypes.bool,
  /!**
   * Whether it is paused
   *!/
  isPaused: PropTypes.bool,
  /!**
   * Whether it is playing
   *!/
  isPlaying: PropTypes.bool,
  listener: PropTypes.shape({
    bind: PropTypes.func,
    events: PropTypes.object,
    exist: PropTypes.func,
    off: PropTypes.func,
    offAll: PropTypes.func,
    on: PropTypes.func,
    trigger: PropTypes.func,
  }),
  /!**
   * @description Maximum number of scales (>=minScaleCount)
   * @default Infinity
   *!/
  maxScaleCount: PropTypes.number,
  /!**
   * @description Minimum number of ticks (>=1)
   * @default 20
   *!/
  minScaleCount: PropTypes.number,
  /!**
   * @description Move end callback (return false to prevent onChange from triggering)
   *!/
  onActionMoveEnd: PropTypes.func,
  /!**
   * @description Start moving callback
   *!/
  onActionMoveStart: PropTypes.func,
  /!**
   * @description Move callback (return false to prevent movement)
   *!/
  onActionMoving: PropTypes.func,
  /!**
   * @description size change end callback (return false to prevent onChange from triggering)
   *!/
  onActionResizeEnd: PropTypes.func,
  /!**
   * @description Start changing the size callback
   *!/
  onActionResizeStart: PropTypes.func,
  /!**
   * @description Start size callback (return false to prevent changes)
   *!/
  onActionResizing: PropTypes.func,
  /!**
   * @description click action callback
   *!/
  onClickAction: PropTypes.func,
  /!**
   * @description Click action callback (not executed when drag is triggered)
   *!/
  onClickActionOnly: PropTypes.func,
  /!**
   * @description Click time area event, prevent setting time when returning false
   *!/
  onClickTimeArea: PropTypes.func,
  /!**
   * @description Click track callback
   *!/
  onClickTrack: PropTypes.func,
  /!**
   * @description Right-click action callback
   *!/
  onContextMenuAction: PropTypes.func,
  /!**
   * @description Right-click track callback
   *!/
  onContextMenuTrack: PropTypes.func,
  /!**
   * @description cursor drag event
   *!/
  onCursorDrag: PropTypes.func,
  /!**
   * @description cursor ends drag event
   *!/
  onCursorDragEnd: PropTypes.func,
  /!**
   * @description cursor starts drag event
   *!/
  onCursorDragStart: PropTypes.func,
  /!**
   * @description Double-click action callback
   *!/
  onDoubleClickAction: PropTypes.func,
  /!**
   * @description Double-click track callback
   *!/
  onDoubleClickRow: PropTypes.func,
  /!**
   * @description Edit area scrolling callback (used to control synchronization with editing track
   *   scrolling)
   *!/
  onScroll: PropTypes.func,
  /!**
   * pause
   *!/
  pause: PropTypes.func,
  /!**
   * Play
   *!/
  play: PropTypes.func,
  /!**
   * Re-render the current time
   *!/
  reRender: PropTypes.func,
  /!**
   * @description Single tick mark category (>0)
   * @default 1
   *!/
  scale: PropTypes.number,
  /!**
   * @description Number of single scale subdivision units (>0 integer)
   * @default 10
   *!/
  scaleSplitCount: PropTypes.number,
  /!**
   * @description Display width of a single scale (>0, unit: px)
   * @default 160
   *!/
  scaleWidth: PropTypes.number,
  /!**
   * @description The scroll distance from the top of the editing area (please use ref.setScrollTop
   *   instead)
   * @deprecated
   *!/
  scrollTop: PropTypes.number,
  /!**
   * Set playback rate
   *!/
  setPlayRate: PropTypes.func,
  setScaleWidth: PropTypes.func,
  /!**
   * Set scroll left
   *!/
  setScrollLeft: PropTypes.func,
  /!**
   * Set scroll top
   *!/
  setScrollTop: PropTypes.func,
  /!**
   * Set the current playback time
   *!/
  setTime: PropTypes.func,
  /!**
   * @description Data change callback, which will be triggered after the operation action end
   *   changes the data (returning false will prevent automatic engine synchronization to reduce
   *   performance overhead)
   *!/
  setTracks: PropTypes.func,
  /!**
   * @description The distance from the start of the scale to the left (>=0, unit: px)
   * @default 20
   *!/
  startLeft: PropTypes.number,
  /!**
   * @description Custom timelineControl style
   *!/
  style: PropTypes.object,
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  /!**
   * dom node
   *!/
  target: PropTypes.any,
  /!**
   * @description Default height of each edit line (>0, unit: px)
   * @default 32
   *!/
  trackHeight: PropTypes.number,
  /!**
   * @description TimelineControl editing data
   *!/
  tracks: PropTypes.arrayOf(PropTypes.any,),
  trackSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  viewSelector: PropTypes.string,
};

export default TimelineControl;
*/
