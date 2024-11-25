// eslint-disable-next-line stoked-ui/sui-name-matches-component-name
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import {useSlotProps} from '@mui/base/utils';
import {emphasize, styled, useThemeProps} from '@mui/material/styles';
import { ScrollSync } from "react-virtualized";
import {type TimelineComponent, type TimelineProps} from './Timeline.types';
import {getTimelineUtilityClass} from './timelineClasses';
import TimelineLabels from '../TimelineLabels/TimelineLabels';
import {TimelineLabelsProps} from '../TimelineLabels/TimelineLabels.types';
import { useTimeline } from "../TimelineProvider";
import TimelineFile from "../TimelineFile";
import TimelineScrollResizer from "../TimelineScrollResizer";
import {
  PREFIX,
} from "../interface/const";
import TimelineTime from "../TimelineTime";
import TimelineTrackArea, { TimelineTrackAreaState } from "../TimelineTrackArea/TimelineTrackArea";
import TimelineCursor from "../TimelineCursor";
import { TimelineTrackAreaCollapsed } from "../TimelineTrackArea/TimelineTrackAreaCollapsed";
import { getScaleCountByRows } from "../utils";
import { TimelineControlProps } from "./TimelineControlProps";
import {fitScaleData} from "../TimelineProvider/TimelineProviderFunctions";
import TimelineTrackActions from "../TimelineLabels/TimelineTrackActions";

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
 * - [Timeline](https://timeline.stoked-ui.com/docs/)
 *
 * API:
 *
 * - [Timeline](https://timeline.stoked-ui.com/api/)
 */
const Timeline = React.forwardRef(function Timeline(
  inProps: TimelineProps & TimelineControlProps,
  ref: React.Ref<HTMLDivElement>,
): React.JSX.Element {
  const { slots, slotProps, onChange, sx } = useThemeProps({
    props: inProps,
    name: 'MuiTimeline',
  });

  const context = useTimeline();
  const {
    file,
    flags,
    components,
    settings,
    engine,
    dispatch,
  } = context;

  const classes = useUtilityClasses(inProps);

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
    ownerState: { ...inProps, sx: inProps.labelsSx, trackControls: inProps.trackControls ?? TimelineTrackActions } as TimelineLabelsProps,
  });

  const {
    timelineWidth,
    scale,
    scaleWidth,
    minScaleCount,
    maxScaleCount,
    scaleSplitCount,
    scrollTop,
    setScaleCount,
  } = settings;

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
  // Is it running?

  /** Monitor data changes */
  React.useEffect(() => {
    setScaleCount(getScaleCountByRows(file?.tracks || [], { scale }), context);
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
      dispatch({ type: 'SET_SETTING', payload: { key: 'scaleSplitCount', value: newScaleSplitCount } });
    }
  }, [scaleWidth])


  // deprecated
  React.useEffect(() => {
    if (scrollSync.current) {
      scrollSync.current.setState({ scrollTop: settings.scrollTop });
    }
  }, [settings.scrollTop]);

  React.useEffect(() => {
    if (tracksRef.current?.clientWidth && !engine.isLoading) {
      const scaleData = fitScaleData(file?.tracks, context, tracksRef.current?.clientWidth);
      dispatch({ type: 'SET_SETTING', payload: { value: { ...scaleData } } });
    }
  }, [tracksRef.current?.clientWidth,  tracksRef.current?.scrollWidth, engine.isLoading])


  React.useEffect(() => {

  }, [])
  const commonProps = {
    ...settings.timeline,
    setScaleCount,
    areaRef,
    tracksRef,
  };

  // monitor timelineControl area width changes
  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!areaRef.current) {
        return;
      }
      dispatch({ type: 'SET_SETTING', payload: { key: 'timelineWidth', value: areaRef.current.getBoundingClientRect().width } });
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

  // deprecated
  React.useEffect(() => {
    if (scrollSync.current) {
      scrollSync.current.setState({ scrollTop });
    }
  }, [scrollTop]);

  // process runner related data
  React.useEffect(() => {
    const handleTime = ({ time }) => {
      settings.setCursor({ time, updateTime: false }, context);
    };
    const handleScrollLeft = (({ left }) => {
      if (scrollSync?.current) {
        console.info('timeline handleScrollLeft', Math.max(left, 0))
        scrollSync?.current?.setState({scrollLeft: Math.max(left, 0)});
      }
    })

    engine.on('setTimeByTick', handleTime);
    engine.on('setScrollLeft', handleScrollLeft);
  }, [engine]);

  React.useEffect(() => {
    if (scrollSync.current) {
      dispatch({ type: 'SET_COMPONENT', payload: { key: 'scrollSync', value: scrollSync.current }});
    }
  }, [scrollSync.current])
  return (
    <Root
      ref={ref}
      {...rootProps}
      className={rootClasses}
      sx={sx}
      onScroll={inProps.onScrollVertical}
    >
      {!flags.collapsed && !flags.noLabels && (
        <React.Fragment>
          <Labels
            ref={labelsRef}
            {...labelsProps.ownerState}
            onChange={onChange}
            controllers={inProps.controllers}
            onAddFiles={inProps.onAddFiles}
            onContextMenu={inProps.onContextMenuTrack}
            onClick={inProps.onClickLabel}
          />
          {flags.verticalResizer && !flags.noResizer && components.timelineArea &&
            <TimelineScrollResizer
              elementRef={tracksRef}
              type='vertical'
              adjustScale={(value) => {
                if (labelsRef.current) {
                  return false;
                }
                const scaleData = fitScaleData(file.tracks, context, labelsRef!.current.clientWidth - value);
                dispatch({ type: 'SET_SETTING', payload: { value: { ...scaleData } } });
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

                <TimelineTime
                  {...commonProps}
                  onScroll={onScroll}
                  scrollLeft={scrollLeft}
                />
                <TrackArea
                  {...commonProps}
                  ref={(editAreaRef: TimelineTrackAreaState) => {
                    (areaRef.current as any) = editAreaRef?.domRef.current;
                    (tracksRef.current as any) = editAreaRef?.tracksRef.current;
                  }}
                  scrollTop={scrollTopCurrent}
                  scrollLeft={scrollLeft}
                  deltaScrollLeft={flags.autoScroll && commonProps.deltaScrollLeft}
                  onClickTrack={inProps.onClickTrack}
                  onClickAction={inProps.onClickAction}
                  onScroll={(params) => {
                    onScroll(params);
                    if (inProps.onScrollVertical) {
                      inProps.onScrollVertical(params as any);
                    }}}
                  onAddFiles={inProps.onAddFiles}
                  onContextMenuAction={inProps.onContextMenuAction}
                  onContextMenuTrack={inProps.onContextMenuTrack}
                />
                {!flags.hideCursor && (
                  <TimelineCursor
                    {...settings}
                    scrollLeft={scrollLeft}
                    areaRef={areaRef}
                    scrollSync={scrollSync}
                  />

                )}
              </React.Fragment>)
            }}
          </ScrollSync>
          {/* flags.noResizer && <TimelineScrollResizer
            scrollSync={scrollSync}
            type='horizontal'
            adjustScale={(value) => {
              if (scrollSync?.current?.state?.clientWidth) {
                return false;
              }
              const scaleData = fitScaleData(
                file.tracks,
                context,
                scrollSync.current.state.clientWidth - value - startLeft
              );

              dispatch({ type: 'SET_SETTING', payload: { value: { ...scaleData } } });
              return true;
            }}
          /> */}


        {!flags.noResizer &&
         <TimelineScrollResizer elementRef={tracksRef}
            type='horizontal'
            adjustScale={(value) => {
            const scaledSettings = fitScaleData(file.tracks, context, areaRef.current.clientWidth - value);
            dispatch({ type: 'SET_SETTING', payload: { value: { ...scaledSettings } } });
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
          onDoubleClickTrack={createAction}
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
  trackControls: PropTypes.any,
  tracks: PropTypes.any,
  trackSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  viewSelector: PropTypes.string,
};

export default Timeline;
