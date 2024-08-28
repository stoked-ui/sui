// eslint-disable-next-line stoked-ui/sui-name-matches-component-name
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { styled, useThemeProps, emphasize } from '@mui/material/styles';
import useForkRef from '@mui/utils/useForkRef';
import { TimelineComponent, TimelineProps } from './Timeline.types';
import { getTimelineUtilityClass } from './timelineClasses';
import { TimelineState } from './TimelineState';
import { TimelineLabels } from '../TimelineLabels/TimelineLabels';
import { ITimelineAction } from '../TimelineAction/TimelineAction.types';
import { TimelineControl } from '../TimelineControl/TimelineControl';
import { TimelineLabelsProps } from '../TimelineLabels/TimelineLabels.types';
import { TimelineTrack } from 'src/TimelineControl/TimelineControl.types';

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
})(({ theme }) => ({
  display: 'flex',
  backgroundColor: emphasize(theme.palette.background.default, 0.04),
  '&:hover': {
    '& .SuiScrollbar': {
      height: '12px',
    },
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
  const { slots, slotProps, setTracks, controlSx, tracks, onChange, trackSx } = useThemeProps({
    props: inProps,
    name: 'MuiTimeline',
  });
  const { sx, ...unstyledProps } = inProps;
  const classes = useUtilityClasses(inProps);

  const timelineState = React.useRef<TimelineState>(null);

  const timelineRef = React.useRef<TimelineState>(null);
  const combinedTimelineRef = useForkRef(inProps.timelineState, timelineRef);

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
    ownerState: { ...inProps, sx: inProps.labelsSx, timelineState } as TimelineLabelsProps,
  });

  const Control = slots?.root ?? TimelineControl;
  const controlRef = React.useRef<typeof TimelineControl>(null);
  const controlProps = useSlotProps({
    elementType: Control,
    externalSlotProps: slotProps?.control,
    className: classes.root,
    ownerState: { sx: controlSx, trackSx, tracks, setTracks },
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
    setTracks(updatedTracks);
  };

  return (
    <Root ref={combinedRootRef} {...rootProps} sx={inProps.sx}>
      {inProps.labels && (
        <Labels
          ref={labelsRef}
          {...labelsProps.ownerState}
          timelineState={timelineState}
          onChange={onChange}
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
        onDoubleClickRow={createAction}
        onKeyDown={(event) => {
          event.preventDefault();
          const selectedActions = inProps.engine.current.getSelectedActions();
          selectedActions?.forEach((actionTrack) => {
            actionTrack.action.onKeyDown(event, 'keyDown');
          });
        }}
        onScroll={({ scrollTop }) => {
          if (labelsRef.current) {
            labelsRef.current.scrollTop = scrollTop;
          }
        }}
        startLeft={10}
        ref={combinedTimelineRef}
        scaleWidth={inProps.scaleWidth}
        setScaleWidth={inProps.setScaleWidth}
        engine={inProps.engine}
        onChange={onChange}
        tracks={tracks}
        autoScroll
        setTracks={setTracks}
        className={'SuiTimeline'}
        actionTypes={inProps.actionTypes}
        viewSelector={inProps.viewSelector ?? '.viewer'}
        onClickAction={(e, { track, action, time }) => {
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
            trackUnselect = {...trackUnselect};
            if (trackUnselect.selected) {
              trackUnselect.actions.forEach((actionUnselect) => {
                actionUnselect = {...actionUnselect};
                actionUnselect.selected = false
              });
              trackUnselect.selected = false
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
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  actionTypes: PropTypes.object.isRequired,
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  controlSx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
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
  labels: PropTypes.bool.isRequired,
  labelsSx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
  labelSx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
  scaleWidth: PropTypes.number.isRequired,
  setScaleWidth: PropTypes.func.isRequired,
  setTracks: PropTypes.func.isRequired,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object.isRequired,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object.isRequired,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
  timelineState: PropTypes.shape({
    current: PropTypes.shape({
      getPlayRate: PropTypes.func.isRequired,
      getTime: PropTypes.func.isRequired,
      isPaused: PropTypes.bool.isRequired,
      isPlaying: PropTypes.bool.isRequired,
      listener: PropTypes.shape({
        bind: PropTypes.func.isRequired,
        events: PropTypes.object.isRequired,
        exist: PropTypes.func.isRequired,
        off: PropTypes.func.isRequired,
        offAll: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        trigger: PropTypes.func.isRequired,
      }).isRequired,
      pause: PropTypes.func.isRequired,
      play: PropTypes.func.isRequired,
      reRender: PropTypes.func.isRequired,
      setPlayRate: PropTypes.func.isRequired,
      setScrollLeft: PropTypes.func.isRequired,
      setScrollTop: PropTypes.func.isRequired,
      setTime: PropTypes.func.isRequired,
      target: function (props, propName) {
        if (props[propName] == null) {
          return new Error(`Prop ${propName} is required but wasn't specified`);
        } else if (typeof props[propName] !== 'object' || props[propName].nodeType !== 1) {
          return new Error("Expected prop '" + propName + "' to be of type Element");
        }
      },
    }).isRequired,
  }).isRequired,
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

export { Timeline };
