// eslint-disable-next-line stoked-ui/sui-name-matches-component-name
import * as React from 'react';
import PropTypes from 'prop-types';
import { namedId } from '@stoked-ui/common';
import composeClasses from '@mui/utils/composeClasses';
import {useSlotProps} from '@mui/base/utils';
import {emphasize, styled, useThemeProps} from '@mui/material/styles';
import { ScrollSync } from "react-virtualized";
import {type TimelineComponent, type TimelineProps} from './Timeline.types';
import {getTimelineUtilityClass} from './timelineClasses';
import TimelineLabels from '../TimelineLabels/TimelineLabels';
import {TimelineLabelsProps} from '../TimelineLabels/TimelineLabels.types';
import { useTimeline } from "../TimelineProvider";
import TimelineFile, { ITimelineFile } from "../TimelineFile";
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
import AddTrackButton from "./AddTrackButton";
import {Box, Typography} from "@mui/material";
import {ControlledTrack} from "../TimelineTrack";
import KeyDownControls from "./KeyDownControls";

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
  '& .timeline-track': {
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
    '& .timeline-track': {
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

function NoTracksNotice({ tracks }) {
  if (!tracks || !tracks.length) {
    return <Box sx={{ minHeight: '100px', width: '100%', display: 'grid', justifyContent: 'center', alignItems: 'center', position: 'relative ', height: 'calc(100% - 18px - 37px)' }}>
      <Typography sx={{justifySelf: 'center'}} color={'action.disabled'}>No tracks</Typography>
    </Box>;
  }
}
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
  inPropsId: TimelineProps & TimelineControlProps,
  ref: React.Ref<HTMLDivElement>,
): React.JSX.Element {
  const {id: timelineIdLocal, ...inProps} = inPropsId;
  const { slots, slotProps, onChange, sx } = useThemeProps({
    props: inProps,
    name: 'MuiTimeline',
  });

  const context = useTimeline();
  const {state, dispatch } = context;
  const {
    file,
    flags,
    components,
    settings,
    engine,
  } = state;

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
    ownerState: { ...inProps, sx: inProps.labelsSx, trackActions: inProps.trackActions ?? TimelineTrackActions } as TimelineLabelsProps,
  });

  const {
    timelineWidth,
    scale,
    scaleWidth,
    minScaleCount,
    maxScaleCount,
    videoTrack,
    scrollTop,
    setScaleCount,
    deltaScrollLeft,
  } = settings;

  React.useEffect(() => {
    if (inProps.actions) {
      TimelineFile.fromActions(inProps.actions)
        .then((timelineFile) => {
          timelineFile.preload(settings.editorId).then(() => {
            dispatch({ type: 'SET_FILE', payload: timelineFile })
          })
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
     // let newScaleSplitCount = scaleSplitCount;
    // if (scaleWidth < 50) {
      // newScaleSplitCount = 2;
    // } else if (scaleWidth < 100) {
      // newScaleSplitCount = 5;
    // } else {
      // newScaleSplitCount = 10;
    // }
    // if (newScaleSplitCount !== scaleSplitCount) {
      // dispatch({ type: 'SET_SETTING', payload: { key: 'scaleSplitCount', value: newScaleSplitCount } });
    // }
    if (file) {
      file.tracks?.forEach((track) =>  {
        if (track?.file?.media?.screenshotStore) {
          track.file.media.screenshotStore.scaleWidth = scaleWidth;
          track.file.media.screenshotStore.scale = scale;
        }
      })
    }
  }, [scaleWidth, scale])


  const [lastFile, setLastFile] = React.useState<ITimelineFile | undefined>(undefined);
  React.useEffect(() => {
    if (engine.canvasDuration + 2 > engine.maxDuration) {
      engine.maxDuration = engine.canvasDuration + 2;
    }
    const grid = document.getElementById('timeline-grid');

    if (grid?.clientWidth && !engine.isLoading && file && file.id !== (lastFile?.id ?? 'no-id')) {
      setLastFile(file);
      fitScaleData(context, false, grid?.clientWidth, 'timeline');

    }
  }, [engine.maxDuration, engine.canvasDuration, engine.isLoading, file, videoTrack])

  const commonProps = {
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

  const isDisabled = () => !file || !file.tracks || !file.tracks.length;
  const finalTimelineId = timelineIdLocal || namedId('timeline');
  React.useEffect(() => {
    dispatch({type: 'SET_SETTING', payload: {key: 'disabled', value: isDisabled()}});
    dispatch({
      type: 'SET_SETTING',
      payload: {
        key: 'timelineId',
        value: finalTimelineId
      }
    });
    if (!inProps.internalComponent) {
      dispatch({
        type: 'SET_SETTING', payload: {
          key: 'componentId', value: finalTimelineId
        }
      });
    }
  }, [])

  React.useEffect(() => {
    const disabled = isDisabled();
    if (disabled !== settings.disabled) {
      dispatch({type: 'SET_SETTING', payload: {key: 'disabled', value: disabled}});
    }
  }, [file, file?.tracks])

  return (
    <Root
      ref={ref}
      {...rootProps}
      id={finalTimelineId}
      className={rootClasses}
      sx={[...(Array.isArray(sx) ? sx : [sx]), { height: '100%' }]}
      onScroll={inProps.onScrollVertical}
    >
      <KeyDownControls/>
      <Box width={'100%'}>
        <Box width={'100%'} style={{ display: 'flex', flexDirection: 'row' }}>
        <AddTrackButton onAddFiles={inProps.onAddFiles}/>
        {!flags.collapsed && !flags.noLabels && (
            <Labels
              ref={labelsRef}
              {...labelsProps.ownerState}
              onChange={onChange}
              controllers={inProps.controllers}
              onAddFiles={inProps.onAddFiles}
              onContextMenu={inProps.onContextMenuTrack}
              onClick={inProps.onClickLabel}
            />
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
            className={`${PREFIX} ${inProps.locked ? `${PREFIX}-disabled` : ''} ${engine.isLoading ? `${PREFIX}-loaded` : ''}`}>
            <ScrollSync ref={scrollSync}>
              {({ scrollLeft, scrollTop: scrollTopCurrent, onScroll }) => {
                return (<React.Fragment>
                  <TimelineTime
                    onScroll={onScroll}
                    scrollLeft={scrollLeft}
                  />
                    {settings.videoTrack ?
                      <ControlledTrack track={settings.videoTrack} width={domRef.current?.clientWidth} height={100} {...commonProps} /> :
                      <TrackArea
                        {...commonProps}
                        ref={(editAreaRef: TimelineTrackAreaState) => {
                          (areaRef.current as any) = editAreaRef?.domRef.current;
                          (tracksRef.current as any) = editAreaRef?.tracksRef.current;
                        }}
                        scrollLeft={scrollLeft}
                        deltaScrollLeft={flags.autoScroll && deltaScrollLeft}
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
                        trackActions={labelsProps.ownerState.trackActions}
                      />
                    }
                  {!flags.hideCursor && (
                    <TimelineCursor
                      {...settings}
                      scrollLeft={scrollLeft}
                    />
                  )}
                </React.Fragment>)
              }}
            </ScrollSync>
          </TimelineControlRoot>}
          </Box>
        <NoTracksNotice tracks={file?.tracks}/>
      </Box>
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
  internalComponent: PropTypes.bool,
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
  trackActions: PropTypes.any,
  tracks: PropTypes.any,
  trackSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  viewSelector: PropTypes.string,
};

export default Timeline;
