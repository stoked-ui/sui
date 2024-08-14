import * as React from 'react';
import PropTypes from 'prop-types';
import styled from '@mui/system/styled';
import { ScrollSync } from 'react-virtualized';
import { ITimelineEngine, TimelineEngine } from '../TimelineEngine/TimelineEngine';
import { MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from '../interface/const';
import { TimelineProps, TimelineRow } from './Timeline.type';
import { TimelineState } from './TimelineState';
import { checkProps } from '../utils/check_props';
import { getScaleCountByRows, parserPixelToTime, parserTimeToPixel } from '../utils/deal_data';
import { Cursor } from '../components/cursor/cursor';
import { EditArea } from '../components/edit_area/edit_area';
import { TimeArea } from '../components/time_area/time_area';

const TimelineRoot = styled('div')(({ theme }) => ({
  width: '100%',
  minHeight: 'max-content',
  height: '100%',
  position: 'relative',
  fontSize: '12px',
  fontFamily: 'PingFang SC',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  '&:hover': {
    '& .timeline-editor-edit-area': {
      '& .ReactVirtualized__Grid': {
        '&::-webkit-scrollbar': {
          height: '8px',
        },
      },
    },
  },
}));

const Timeline = React.forwardRef<TimelineState, TimelineProps & { scaleSplitCount?: number }>(
  (props, ref) => {
    const checkedProps = checkProps(props);
    const { style } = props;
    const {
      effects,
      editorData: data,
      scrollTop,
      autoScroll,
      hideCursor,
      disableDrag,
      scale,
      scaleWidth,
      startLeft,
      minScaleCount,
      maxScaleCount,
      onChange,
      engine,
      autoReRender = true,
      onScroll: onScrollVertical,
    } = checkedProps;
    const engineRef = React.useRef<ITimelineEngine>(engine || new TimelineEngine());
    const domRef = React.useRef<HTMLDivElement>();
    const areaRef = React.useRef<HTMLDivElement>();
    const scrollSync = React.useRef<ScrollSync>();

    // Editor data
    const [editorData, setEditorData] = React.useState(data);
    // scale quantity
    const [scaleCount, setScaleCount] = React.useState(MIN_SCALE_COUNT);
    // cursor distance
    const [cursorTime, setCursorTime] = React.useState(START_CURSOR_TIME);
    // Is it running?
    const [isPlaying, setIsPlaying] = React.useState(false);
    // Current timeline width
    const [width, setWidth] = React.useState(Number.MAX_SAFE_INTEGER);

    /** Monitor data changes */
    React.useEffect(() => {
      handleSetScaleCount(getScaleCountByRows(data, { scale }));
      setEditorData(data);
    }, [data, minScaleCount, maxScaleCount, scale]);

    React.useEffect(() => {
      engineRef.current.effects = effects;
    }, [effects]);

    React.useEffect(() => {
      engineRef.current.data = editorData;
    }, [editorData]);

    React.useEffect(() => {
      autoReRender && engineRef.current.reRender();
    }, [editorData]);

    // deprecated
    React.useEffect(() => {
      scrollSync.current && scrollSync.current.setState({ scrollTop: scrollTop });
    }, [scrollTop]);
    /** dynamicSettings scale count */
    const handleSetScaleCount = (value: number) => {
      const data = Math.min(maxScaleCount, Math.max(minScaleCount, value));
      setScaleCount(data);
    };

    /** handle proactive data changes */
    const handleEditorDataChange = (editorData: TimelineRow[]) => {
      const result = onChange(editorData);
      if (result !== false) {
        engineRef.current.data = editorData;
        autoReRender && engineRef.current.reRender();
      }
    };

    /** handleCursor */
    const handleSetCursor = (param: { left?: number; time?: number; updateTime?: boolean }) => {
      let { left, time, updateTime = true } = param;
      console.log('handle set cursor', left, time, updateTime);

      if (typeof left === 'undefined' && typeof time === 'undefined') return;

      if (typeof time === 'undefined') {
        if (typeof left === 'undefined')
          left = parserTimeToPixel(time, { startLeft, scale, scaleWidth });
        time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
      }

      let result = true;
      if (updateTime) {
        result = engineRef.current.setTime(time);
        autoReRender && engineRef.current.reRender();
      }
      result && setCursorTime(time);
      return result;
    };

    /** setUp scrollLeft */
    const handleDeltaScrollLeft = (delta: number) => {
      // 当超过最大距离时，禁止自动滚动
      const data = scrollSync.current.state.scrollLeft + delta;
      if (data > scaleCount * (scaleWidth - 1) + startLeft - width) return;
      scrollSync.current &&
        scrollSync.current.setState({
          scrollLeft: Math.max(scrollSync.current.state.scrollLeft + delta, 0),
        });
    };

    // process runner related data
    React.useEffect(() => {
      const handleTime = ({ time }) => {
        handleSetCursor({ time, updateTime: false });
      };
      const handlePlay = () => setIsPlaying(true);
      const handlePaused = () => setIsPlaying(false);
      engineRef.current.on('setTimeByTick', handleTime);
      engineRef.current.on('play', handlePlay);
      engineRef.current.on('paused', handlePaused);
    }, [engineRef.current]);

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
          return engineRef.current.isPlaying;
        },
        get isPaused() {
          return engineRef.current.isPaused;
        },
        setPlayRate: engineRef.current.setPlayRate.bind(engineRef.current),
        getPlayRate: engineRef.current.getPlayRate.bind(engineRef.current),
        setTime: (time: number) => handleSetCursor({ time }),
        getTime: engineRef.current.getTime.bind(engineRef.current),
        reRender: engineRef.current.reRender.bind(engineRef.current),
        play: (param: Parameters<TimelineState['play']>[0]) => engineRef.current.play({ ...param }),
        pause: engineRef.current.pause.bind(engineRef.current),
        setScrollLeft: (val) => {
          scrollSync.current && scrollSync.current.setState({ scrollLeft: Math.max(val, 0) });
        },
        setScrollTop: (val) => {
          scrollSync.current && scrollSync.current.setState({ scrollTop: Math.max(val, 0) });
        },
      }),
      [engineRef.current],
    );

    // monitor timeline area width changes
    React.useEffect(() => {
      const observer = new ResizeObserver(() => {
        if (!areaRef.current) {
          return;
        }
        console.log('width', areaRef.current.getBoundingClientRect().width);
        setWidth(areaRef.current.getBoundingClientRect().width);
      });
      if (areaRef.current === undefined && width === Number.MAX_SAFE_INTEGER) {
        observer.observe(areaRef.current!);
      }
      return () => {
        observer && observer.disconnect();
      };
    }, []);

    return (
      <TimelineRoot
        ref={domRef}
        style={style}
        className={`${PREFIX} ${disableDrag ? PREFIX + '-disable' : ''}`}
      >
        <ScrollSync ref={scrollSync}>
          {({ scrollLeft, scrollTop, onScroll }) => (
            <>
              <TimeArea
                {...checkedProps}
                timelineWidth={width}
                disableDrag={disableDrag || isPlaying}
                setCursor={handleSetCursor}
                cursorTime={cursorTime}
                editorData={editorData}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                onScroll={onScroll}
                scrollLeft={scrollLeft}
              />
              <EditArea
                {...checkedProps}
                timelineWidth={width}
                ref={(ref) => ((areaRef.current as any) = ref?.domRef.current)}
                disableDrag={disableDrag || isPlaying}
                editorData={editorData}
                cursorTime={cursorTime}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                scrollTop={scrollTop}
                scrollLeft={scrollLeft}
                setEditorData={handleEditorDataChange}
                deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
                onScroll={(params) => {
                  onScroll(params);
                  onScrollVertical && onScrollVertical(params);
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
                  editorData={editorData}
                  areaRef={areaRef}
                  scrollSync={scrollSync}
                  deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
                />
              )}
            </>
          )}
        </ScrollSync>
      </TimelineRoot>
    );
  },
);

Timeline.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
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
   * @description Timeline editing data
   */
  editorData: PropTypes.arrayOf(
    PropTypes.shape({
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          disable: PropTypes.bool.isRequired,
          effectId: PropTypes.string.isRequired,
          end: PropTypes.number.isRequired,
          flexible: PropTypes.bool.isRequired,
          id: PropTypes.string.isRequired,
          maxEnd: PropTypes.number.isRequired,
          minStart: PropTypes.number.isRequired,
          movable: PropTypes.bool.isRequired,
          selected: PropTypes.bool.isRequired,
          start: PropTypes.number.isRequired,
        }),
      ).isRequired,
      classNames: PropTypes.arrayOf(PropTypes.string).isRequired,
      id: PropTypes.string.isRequired,
      rowHeight: PropTypes.number.isRequired,
      selected: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  /**
   * @description timeline action effect map
   */
  effects: PropTypes.object.isRequired,
  /**
   * @description timeline runner, if not passed, the built-in runner will be used
   */
  engine: PropTypes.shape({
    bind: PropTypes.func.isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        actions: PropTypes.arrayOf(
          PropTypes.shape({
            disable: PropTypes.bool.isRequired,
            effectId: PropTypes.string.isRequired,
            end: PropTypes.number.isRequired,
            flexible: PropTypes.bool.isRequired,
            id: PropTypes.string.isRequired,
            maxEnd: PropTypes.number.isRequired,
            minStart: PropTypes.number.isRequired,
            movable: PropTypes.bool.isRequired,
            selected: PropTypes.bool.isRequired,
            start: PropTypes.number.isRequired,
          }),
        ).isRequired,
        classNames: PropTypes.arrayOf(PropTypes.string).isRequired,
        id: PropTypes.string.isRequired,
        rowHeight: PropTypes.number.isRequired,
        selected: PropTypes.bool.isRequired,
      }),
    ).isRequired,
    effects: PropTypes.object.isRequired,
    events: PropTypes.object.isRequired,
    exist: PropTypes.func.isRequired,
    getPlayRate: PropTypes.func.isRequired,
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
    trigger: PropTypes.func.isRequired,
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
   * @description Custom scale rendering
   */
  getScaleRender: PropTypes.func.isRequired,
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
   * @description Data change callback, which will be triggered after the operation action end changes the data (returning false will prevent automatic engine synchronization to reduce performance overhead)
   */
  onChange: PropTypes.func.isRequired,
  /**
   * @description click action callback
   */
  onClickAction: PropTypes.func.isRequired,
  /**
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly: PropTypes.func.isRequired,
  /**
   * @description Click row callback
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
   * @description Right-click row callback
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
   * @description Double-click row callback
   */
  onDoubleClickRow: PropTypes.func.isRequired,
  /**
   * @description Edit area scrolling callback (used to control synchronization with editing row scrolling)
   */
  onScroll: PropTypes.func.isRequired,
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
   * @description The distance from the start of the scale to the left (>=0, unit: px)
   * @default 20
   */
  startLeft: PropTypes.number.isRequired,
  /**
   * @description Custom timeline style
   */
  style: PropTypes.object.isRequired,
} as any;

export default Timeline;
