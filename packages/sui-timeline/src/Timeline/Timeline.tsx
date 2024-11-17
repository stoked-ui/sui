// eslint-disable-next-line stoked-ui/sui-name-matches-component-name
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import {useSlotProps} from '@mui/base/utils';
import {emphasize, styled, useThemeProps} from '@mui/material/styles';
import useForkRef from '@mui/utils/useForkRef';
import { ScrollSync } from "react-virtualized";
import {type TimelineComponent, type TimelineProps} from './Timeline.types';
import {getTimelineUtilityClass} from './timelineClasses';
import TimelineLabels from '../TimelineLabels/TimelineLabels';
import {ITimelineFileAction} from '../TimelineAction/TimelineAction.types';
import {type TimelineLabelsProps} from '../TimelineLabels/TimelineLabels.types';
import {useTimeline} from "../TimelineProvider";
import TimelineFile from "../TimelineFile";
import { fitScaleData } from "../TimelineTrack";
import TimelineScrollResizer from "../TimelineScrollResizer";
import { MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from "../interface/const";
import TimelineTime from "../TimelineTime";
import TimelineTrackArea, { TimelineTrackAreaState } from "../TimelineTrackArea/TimelineTrackArea";
import TimelineCursor from "../TimelineCursor";
import { TimelineTrackAreaCollapsed } from "../TimelineTrackArea/TimelineTrackAreaCollapsed";
import { checkProps, getScaleCountByRows, parserPixelToTime, parserTimeToPixel } from "../utils";
import { TimelineControlProps } from "./TimelineControlProps";

const useUtilityClasses = (ownerState: TimelineProps) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    labels: ['labels'],
    control: ['control'],
  };

  return composeClasses(slots, getTimelineUtilityClass, classes);
};

const TimelineRoot = styled('div', {
  name: 'MuiTimeline',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(({ theme  }) => ({
  display: 'flex',
  backgroundColor: emphasize(theme.palette.background.default, 0.04),
  '& .SuiScrollbar': {
    height: '18px',
  },
  '& .timeline-editor-edit-track': {
    opacity: 0,
    transform: 'scaleX(100%):nth-child(3n+1)',
    transitionProperty: 'opacity, transform',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'cubic-bezier(0.750, -0.015, 0.565, 1.055)'
  },
  '& .MuiEditorLabels-label': {
    opacity: 0,
    transform: 'scaleX(100%)',
    transitionProperty: 'opacity, transform',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'cubic-bezier(0.750, -0.015, 0.565, 1.055)'
  },
  '&.MuiTimeline-loaded': {
    '& .timeline-editor-edit-track': {
      opacity: 1,
      transform: 'translateX(0)',
      transitionDelay: 'calc(0.055s * var(--trackIndex)))',
    },
    '& .MuiEditorLabels-label': {
      opacity: 1,
      transform: 'translateX(0)',
      transitionDelay: 'calc(0.055s * var(--trackIndex)))',
    },
    '& #time-area-grid .ReactVirtualized__Grid__innerScrollContainer': {
      minWidth: '100%!important'
    }

}
}));

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
  inProps: TimelineProps & TimelineControlProps,
  ref: React.Ref<HTMLDivElement>,
): React.JSX.Element {
  const { slots, slotProps, onChange, trackSx, locked } = useThemeProps({
    props: inProps,
    name: 'MuiTimeline',
  });
  const { file,flags , components, settings, engine, dispatch } = useTimeline();
  const checkedProps = checkProps(inProps);

  React.useEffect(() => {
    dispatch({ type: 'SET_SETTING', payload: { key: 'timeline', value: checkedProps } });
  }, [])

  const {
    scrollTop,
    autoScroll,
    hideCursor,
    disableDrag,
    scaleWidth: scaleWidthDefault,
    scale: scaleDefault,
    startLeft = 2,
    minScaleCount,
    maxScaleCount: initialMaxScaleCount,
    scaleSplitCount: initialScaleSplitCount,
    autoReRender = true,
    onScroll: onScrollVertical,
    disabled,
    collapsed,
  } = checkedProps;

  const hideLock = locked;
  const classes = useUtilityClasses(inProps);
  const forkedRootRef = React.useRef<HTMLDivElement>(null);
  const combinedRootRef = useForkRef(ref, forkedRootRef);

  const Root = slots?.root ?? TimelineRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState: { ...inProps },
  });

  const Labels = slots?.labels ?? TimelineLabels;
  const labelsRef: React.RefObject<HTMLDivElement> = React.useRef(null);
  const labelsProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.labels,
    className: classes.labels,
    ownerState: { ...inProps, sx: inProps.labelsSx } as TimelineLabelsProps,
  });

  const createAction = (e: React.MouseEvent<HTMLElement, MouseEvent>, { track, time }) => {
    if (locked || !track) {
      return;
    }

    const newAction: ITimelineFileAction = {
      name: file.name,
      start: time,
      end: time + 0.5,
    };
    dispatch({ type: 'CREATE_ACTION', payload: { action: newAction, track }})
  }

  React.useEffect(() => {
    if (inProps.actions) {
      TimelineFile.fromActions(inProps.actions)
        .then((timelineFile) => {
          dispatch({ type: 'SET_FILE', payload: timelineFile })
        })
    }
  }, [])



  const domRef = React.useRef<HTMLDivElement>(null);

  const areaRef = React.useRef<HTMLDivElement>(null);
  const tracksRef = React.useRef<HTMLDivElement>(null);
  const scrollSync = React.useRef<ScrollSync>();

  // Editor data
  // scale quantity
  const [scaleCount, setScaleCount] = React.useState(MIN_SCALE_COUNT);

  // cursor distance
  const [cursorTime, setCursorTime] = React.useState(START_CURSOR_TIME);
  // Current timelineControl width
  const [timelineWidth, setTimelineWidth] = React.useState(Number.MAX_SAFE_INTEGER);
  const [maxScaleCount, setMaxScaleCount] = React.useState(initialMaxScaleCount);
  const [scaleSplitCount, setScaleSplitCount] = React.useState(initialScaleSplitCount)

  const [scale, setScale] = React.useState(scaleDefault);
  const [scaleWidth, setScaleWidth] = React.useState(scaleWidthDefault);

  /** dynamicSettings scale count */
  const handleSetScaleCount = (value: number) => {
    setScaleCount(Math.min(maxScaleCount, Math.max(minScaleCount, value)));
  };

  /** Monitor data changes */
  React.useEffect(() => {
    handleSetScaleCount(getScaleCountByRows(file?.tracks || [], { scale }));
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
    setMaxScaleCount( engine.duration + 2 );
  }, [file?.tracks]);

  // deprecated
  React.useEffect(() => {
    if (scrollSync.current) {
      scrollSync.current.setState({ scrollTop });
    }
  }, [scrollTop]);

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
      result = engine.setTime(time);
      if (autoReRender) {
        engine.reRender();
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
    if (dataScrollLeft > scaleCount * (scaleWidth - 1) + startLeft - timelineWidth) {
      return;
    }

    if (scrollSync.current) {
      setHorizontalScroll(scrollSync.current.state.scrollLeft + delta);
    }
  };

  if (typeof window !== 'undefined' ) {
    window.end = () => {
      handleSetCursor({left: timelineWidth});
      scrollSync?.current?.setState({scrollLeft: Math.max(timelineWidth, 0)});
    }
  }
  React.useEffect(() => {
    if (areaRef.current?.clientWidth && !engine.isLoading) {
      const scaleData = fitScaleData(file.tracks, minScaleCount, maxScaleCount, startLeft, engine.duration === 0 ? 15 : engine.duration, tracksRef.current?.clientWidth);
      const timeline =  { scrollTop, autoScroll, hideCursor, disableDrag,
        scaleWidth, scale, startLeft, minScaleCount, maxScaleCount,
        scaleSplitCount, autoReRender, disabled, collapsed,
        ...scaleData
      };
      setScale(timeline.scale);
      setScaleWidth(timeline.scaleWidth);
      setMaxScaleCount(timeline.maxScaleCount);
      setScaleCount(timeline.scaleCount);

      dispatch({ type: 'SET_SETTING', payload: { key: 'timeline', value: { ...timeline } } });
    }
  }, [areaRef?.current?.scrollWidth, engine.duration, engine.isLoading])


  const commonProps= {
    ...checkedProps,
    scaleSplitCount,
    scale,
    scaleWidth,
    minScaleCount,
    timelineWidth,
    setTimelineWidth,
    setCursor: handleSetCursor,
    setScaleCount: handleSetScaleCount,
    deltaScrollLeft: handleDeltaScrollLeft,
    cursorTime,
    scaleCount,
    disabled,
    areaRef,
    tracksRef,
    disableDrag,
    isPlaying: engine.isPlaying,
    onScrollVertical,
    collapsed
  };

  // monitor timelineControl area width changes
  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!areaRef.current) {
        return;
      }
      setTimelineWidth(areaRef.current.getBoundingClientRect().width);
    });

    if (areaRef.current === undefined && timelineWidth === Number.MAX_SAFE_INTEGER) {
      observer.observe(areaRef.current!);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const rootClasses = `${rootProps.className} ${!engine.isLoading ? 'MuiTimeline-loaded' : ''}`
  const TrackArea = inProps.collapsed ? TimelineTrackAreaCollapsed : TimelineTrackArea;

  return (
    <Root ref={combinedRootRef} {...rootProps} className={rootClasses} sx={inProps.sx}>
      {(flags.includes('labels') && !flags.includes('collapsed')) && (
        <React.Fragment>
          <Labels
            ref={labelsRef}
            {...labelsProps.ownerState}
            onChange={onChange}
            hideLock={hideLock}
            controllers={inProps.controllers}
            onAddFiles={inProps.onAddFiles}
            onContextMenu={inProps.onContextMenuTrack}
            onClick={inProps.onLabelClick}
          />
          {!flags.includes('noResizer') && components.timelineArea &&
            <TimelineScrollResizer
              scrollSync={scrollSync}
              type='vertical'
              adjustScale={(value) => {
                if (labelsRef.current) {
                  return false;
                }
                // console.info(file.tracks, settings.minScaleCount, settings.maxScaleCount, settings.startLeft, settings.duration, components.timelineArea?.scrollWidth - 7);
                const scaleData = fitScaleData(file.tracks, settings['timeline.minScaleCount'], settings['timeline.maxScaleCount'], settings['timeline.startLeft'], settings['timeline.duration'], labelsRef!.current.scrollWidth - value);
                const timeline =  {
                  ...settings,
                  ...scaleData
                };
                dispatch({ type: 'SET_SETTING', payload: { key: 'timeline', value: { ...timeline } } });
                return true;
              }}
            />
          }
        </React.Fragment>
      )}

      {engine &&
        <TimelineControlRoot
          /* style={style} */
          sx={{...{
              width: '100%',
              flex: '1 1 auto',
              '&-action': {
                height: '28px !important',
                top: '50%',
                transform: 'translateY(-50%)',
              },
              backgroundColor: 'red',
            }, backgroundColor: 'unset'}}
          ref={domRef}
          className={`${PREFIX} ${inProps.locked ? `${PREFIX}-disable` : ''} ${engine.isLoading ? `${PREFIX}-loaded` : ''}`}
        >
          <ScrollSync ref={scrollSync}>
            {({ scrollLeft, scrollTop: scrollTopCurrent, onScroll }) => {
              return (<React.Fragment>

                <TimelineTime {...commonProps}
                              disableDrag={locked || engine.isPlaying}
                              onScroll={onScroll}
                              scrollLeft={scrollLeft}
                />
                <TrackArea {...commonProps}
                  ref={(editAreaRef: TimelineTrackAreaState) => {
                    (areaRef.current as any) = editAreaRef?.domRef.current;
                    (tracksRef.current as any) = editAreaRef?.tracksRef.current;
                  }}
                  disableDrag={disableDrag || engine.isPlaying}
                  scrollTop={scrollTopCurrent}
                  scrollLeft={scrollLeft}
                  deltaScrollLeft={autoScroll && commonProps.deltaScrollLeft}
                  onDoubleClickRow={createAction}
                  onScroll={(params) => {
                    onScroll(params);
                    if (onScrollVertical) {
                      onScrollVertical(params);
                    }}}
                  onAddFiles={inProps.onAddFiles}
                />
                {!hideCursor && (
                  <TimelineCursor {...commonProps}
                                  scrollSync={scrollSync}
                                  disableDrag={engine.isPlaying}
                                  scrollLeft={scrollLeft}
                                  deltaScrollLeft={autoScroll && commonProps.deltaScrollLeft}
                                  cursorTime={engine.time}
                  />
                )}
              </React.Fragment>)
            }}
          </ScrollSync>
          {!flags.includes('noResizer') && <TimelineScrollResizer
            scrollSync={scrollSync}
            type='horizontal'
            adjustScale={(value) => {
              if (scrollSync?.current?.state?.clientWidth) {
                return false;
              }
              const scaleData = fitScaleData(
                file.tracks,
                settings['timeline.minScaleCount'],
                settings['timeline.maxScaleCount'],
                settings['timeline.startLeft'],
                settings['timeline.duration'],
                scrollSync.current.state.clientWidth - value
              );

              const timeline =  {
                ...settings,
                ...scaleData
              };

              dispatch({ type: 'SET_SETTING', payload: { key: 'timeline', value: { ...timeline } } });
              setScale(timeline.scale);
              setScaleWidth(timeline.scaleWidth);
              setMaxScaleCount(timeline.maxScaleCount);
              setScaleCount(timeline.scaleCount);
              return true;
            }}
          />}
        </TimelineControlRoot>
        /*
        <Control
          sx={{
            width: '100%',
            flex: '1 1 auto',
            '&-action': {
              height: '28px !important',
              top: '50%',
              transform: 'translateY(-50%)',
            },
            backgroundColor: 'red',
          }}
          {...controlProps.ownerState}
          onDoubleClickRow={createAction}
          onScroll={({ scrollTop }) => {
            if (labelsRef.current) {
              labelsRef.current.scrollTop = scrollTop;
            }
          }}
          startLeft={9}
          ref={inProps.timelineState}
          timelineState={timelineState}
          autoScroll
          disableDrag={locked}
          dragLine={flags.includes('edgeSnap')}
          gridSnap={flags.includes('gridSnap')}
          disabled={inProps.disabled}
          controllers={inProps.controllers}
          viewSelector={inProps.viewSelector ?? '.viewer'}
          onClickTrack={(e, {track }) => {
           dispatch({type: 'SELECT_TRACK', payload: track });
           inProps?.onTrackClick?.(track);
          }}
          onClickAction={(e, { track, action }) => {
            e.stopPropagation();
            dispatch({type: 'SELECT_ACTION', payload: {track, action} });
            inProps?.onActionClick?.(action);
          }}
          onContextMenuAction={inProps.onContextMenuAction}
          onContextMenuTrack={inProps.onContextMenuTrack}
          collapsed={inProps.collapsed}
      />
      */
      }

    </Root>
  );
}) as TimelineComponent;

// ----------------------------- Warning --------------------------------
// | These PropTypes are generated from the TypeScript type definitions |
// | To update them edit the TypeScript types and run "pnpm proptypes"  |
// ----------------------------------------------------------------------
Timeline.propTypes = {

  actionData: PropTypes.any,

  children: PropTypes.node,

  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  controllers: PropTypes.object,
  controlSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  detailRenderer: PropTypes.bool,
  engine: PropTypes.any,
  labels: PropTypes.bool,
  labelsSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  labelSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),

  setTracks: PropTypes.func,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  tracks: PropTypes.any,
  trackSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  viewSelector: PropTypes.string,
};

export default Timeline;
