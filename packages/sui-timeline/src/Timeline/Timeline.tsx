// eslint-disable-next-line stoked-ui/sui-name-matches-component-name
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import {useSlotProps} from '@mui/base/utils';
import {emphasize, styled, useThemeProps} from '@mui/material/styles';
import useForkRef from '@mui/utils/useForkRef';
import { namedId } from '@stoked-ui/media-selector';
import {type TimelineComponent, type TimelineProps} from './Timeline.types';
import {getTimelineUtilityClass} from './timelineClasses';
import {type TimelineState} from './TimelineState';
import TimelineLabels from '../TimelineLabels/TimelineLabels';
import {type ITimelineAction} from '../TimelineAction/TimelineAction.types';
import TimelineControl from '../TimelineControl/TimelineControl';
import {type TimelineLabelsProps} from '../TimelineLabels/TimelineLabels.types';
import {type ITimelineTrack} from "../TimelineTrack";
import Engine, {IEngine} from "../Engine";

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
  ref: React.Ref<HTMLDivElement>,
): React.JSX.Element {
  const { slots, slotProps, controlSx, onChange, trackSx, controllers, viewMode, setScaleWidth: inSetScaleWidth, scaleWidth: inScaleWidth } = useThemeProps({
    props: inProps,
    name: 'MuiTimeline',
  });
  const { engineRef: engineIn } = inProps;
  const createEngine = (): IEngine => {
    return new Engine({id: inProps.id, controllers: inProps.controllers, defaultState: 'paused' });
  }
  const [scaleWidthNew, setScaleWidthNew] = React.useState<number>(inScaleWidth);
  const scaleWidth = inScaleWidth ?? scaleWidthNew;
  const setScaleWidth = inSetScaleWidth ?? setScaleWidthNew;
  const engineRef = React.useRef<IEngine>(engineIn?.current ? engineIn.current : createEngine());

  const classes = useUtilityClasses(inProps);

  const timelineState = React.useRef<TimelineState>(null);

  const timelineRef = React.useRef<TimelineState>(null);
  const combinedTimelineRef = useForkRef(inProps.timelineState, timelineRef);

  const forkedRootRef = React.useRef<HTMLDivElement>(null);
  const combinedRootRef = useForkRef(ref, forkedRootRef);

  const [tracks, setTracksBase] = React.useState<ITimelineTrack[] | null>(null);
  const setTracks: React.Dispatch<React.SetStateAction<ITimelineTrack[]>> = (tracksUpdater) => {
    if (typeof tracksUpdater === "function") {
      setTracksBase((prevTracks) => tracksUpdater(prevTracks));
    } else {
      setTracksBase(tracksUpdater);
    }
  };

  const [screenerTrack, setScreenerTrack] = React.useState<ITimelineTrack | null>(null);

  const [currentTracks, setCurrentTracks] = React.useState(engineRef.current.viewMode === 'Renderer' ? tracks : [screenerTrack]);

  engineRef.current.setTracks = setTracks;
  engineRef.current.setScreenerTrack = setScreenerTrack;
  React.useEffect(() => {
    console.log('new view mode', engineRef.current.viewMode, engineRef.current.screenerBlob, screenerTrack);
    let screenerTracks = screenerTrack ? [screenerTrack] : null;
    if (!screenerTrack && engineRef.current.viewMode === 'Screener') {
      screenerTracks = [engineRef.current.screenerTrack];
    }
    setCurrentTracks(engineRef.current.viewMode === 'Renderer' ? tracks : screenerTracks)
  }, [engineRef.current.viewMode, engineRef.current.screenerTrack])


  React.useEffect(() => {
    if (engineRef.current.viewMode === 'Renderer') {
      setCurrentTracks(tracks)
    }
  }, [tracks])

  React.useEffect(() => {
    if (engineRef.current.viewMode === 'Screener') {
      setCurrentTracks([screenerTrack])
    }
  }, [screenerTrack])

  const tracksInitialized = React.useRef(false);

  React.useEffect(() => {
    if (!tracksInitialized.current) {
      tracksInitialized.current = true;
      engineRef.current?.buildTracks(controllers, inProps.actionData)
        .then((initialTracks) => {
          setTracks(initialTracks)
        });
    }
  }, [])


  React.useEffect(() => {
    const engine = engineRef.current;
    const screenerStuff = engineRef.current.screenerBlob;
    if (!engine || !screenerStuff) {
      return;
    }

    const actionInput = {
      name: `${screenerStuff.name} v${screenerStuff.version}`,
      start: 0,
      end: 1,
      controllerName: 'video',
      src: engine.screener.src,
      layer: 'screener',
    }

    engine.buildScreenerTrack(controllers.video, actionInput)
    .then((track) => {
      console.log('track', track);
      setScreenerTrack(track);
    })
      .catch((err) => {
        console.error(err);
        throw new Error(err);
      })
  }, [engineRef.current.screenerBlob])

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
    ownerState: { setTracks, ...inProps, sx: inProps.labelsSx, timelineState, viewMode: engineRef.current.viewMode } as TimelineLabelsProps,
  });

  const Control = slots?.control ?? TimelineControl;
  const controlProps = useSlotProps({
    elementType: Control,
    externalSlotProps: slotProps?.control,
    className: classes.control,
    ownerState: { sx: controlSx, trackSx, tracks: currentTracks, setTracks, engineRef, setScreenerTrack, screenerTrack },
  });

  const createAction = (e: React.MouseEvent<HTMLElement, MouseEvent>, { track, time }) => {
    if (!track.actionRef) {
      return;
    }
    const existingTrackAction = track.actionRef;
    const rowIndex = tracks.findIndex((previousTrack) => previousTrack.id === track.id);
    const newAction: ITimelineAction = {...existingTrackAction, ...{
      id: namedId('action'),
      start: time,
      end: time + 0.5,
    }};
    tracks[rowIndex] = { ...track, actions: [...track.actions, newAction] };
    setTracks([...tracks]);
  };

  return (
    <Root ref={combinedRootRef} {...rootProps} sx={inProps.sx}>
      {inProps.labels && (
        <Labels
          ref={labelsRef}
          {...labelsProps.ownerState}
          tracks={currentTracks}
          timelineState={timelineState}
          onChange={onChange}
          controllers={inProps.controllers}
        />
      )}

      {engineRef?.current && <Control
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
        startLeft={10}
        ref={combinedTimelineRef}
        scaleWidth={scaleWidth}
        setScaleWidth={setScaleWidth}
        engineRef={engineRef}
        tracks={currentTracks}
        autoScroll
        setTracks={setTracks}
        controllers={inProps.controllers}
        viewSelector={inProps.viewSelector ?? '.viewer'}
        onClickAction={(e, { track, action }) => {
          const updateTracks = [...inProps.tracks];
          const trackIndex = updateTracks.indexOf(track);
          if (trackIndex === -1) {
            return;
          }
          const actionIndex = updateTracks[trackIndex].actions.indexOf(action);
          if (actionIndex === -1) {
            return;
          }
          updateTracks.forEach((trackUnselect) => {
            trackUnselect = { ...trackUnselect };
            if (trackUnselect.selected) {
              trackUnselect.actions.forEach((actionUnselect) => {
                actionUnselect = { ...actionUnselect };
                actionUnselect.selected = false;
              });
              trackUnselect.selected = false;
            }
          });
          updateTracks[trackIndex].selected = true;
          updateTracks[trackIndex].actions[actionIndex].selected = true;
          setTracks(updateTracks);
        }}
      />}
    </Root>
  );
}) as TimelineComponent;

Timeline.propTypes = {
  actionData: PropTypes.any,

  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  controllers: PropTypes.object,
  controlSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  engine: PropTypes.any,
  labels: PropTypes.bool,
  labelsSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  labelSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  scaleWidth: PropTypes.number,
  setScaleWidth: PropTypes.func,
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
  timelineState: PropTypes.any,
  tracks: PropTypes.any,
  trackSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  viewSelector: PropTypes.string,
};

export default Timeline;
