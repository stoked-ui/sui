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
  const { slots, slotProps, controlSx, onChange, trackSx, engineRef, controllers } = useThemeProps({
    props: inProps,
    name: 'MuiTimeline',
  });
  const classes = useUtilityClasses(inProps);

  const timelineState = React.useRef<TimelineState>(null);

  const timelineRef = React.useRef<TimelineState>(null);
  const combinedTimelineRef = useForkRef(inProps.timelineState, timelineRef);

  const forkedRootRef = React.useRef<HTMLDivElement>(null);
  const combinedRootRef = useForkRef(ref, forkedRootRef);

  const [tracks, setTracks] = React.useState<ITimelineTrack[] | null>(null);

  React.useEffect(() => {
    engineRef.current?.buildTracks(controllers, inProps.actionData)
      .then((initialTracks) => {
        setTracks(initialTracks)
      });
  }, [])

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
    ownerState: { setTracks, ...inProps, sx: inProps.labelsSx, timelineState } as TimelineLabelsProps,
  });

  const Control = slots?.control ?? TimelineControl;
  const controlProps = useSlotProps({
    elementType: Control,
    externalSlotProps: slotProps?.control,
    className: classes.control,
    ownerState: { sx: controlSx, trackSx, tracks, setTracks, engineRef: inProps.engineRef },
  });

  const createAction = (e: React.MouseEvent<HTMLElement, MouseEvent>, { track, time }) => {
    if (!track.actions.length) {
      return;
    }
    const existingTrackAction = track.actions[0];
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
          tracks={tracks}
          timelineState={timelineState}
          onChange={onChange}
          controllers={inProps.controllers}
        />
      )}

      <Control
        sx={{
          width: '100%',
          flex: '1 1 auto',
          '&-action': {
            height: '28px !important',
            top: '50%',
            transform: 'translateY(-50%)',
          },
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
        scaleWidth={inProps.scaleWidth}
        setScaleWidth={inProps.setScaleWidth}
        engineRef={inProps.engineRef}
        tracks={tracks}
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
      />
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
