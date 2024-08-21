import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { styled, useThemeProps } from '@mui/material/styles';
import useForkRef from '@mui/utils/useForkRef';
import { TimelineProps } from './Timeline.types';
import { getTimelineUtilityClass } from './timelineClasses';
import { TimelineState } from './TimelineState';
import { TimelineLabels } from '../TimelineLabels/TimelineLabels';
import { ITimelineAction } from '../TimelineAction/TimelineAction.types';
import { TimelineControl } from '../TimelineControl/TimelineControl';
import { TimelineLabelsProps } from '../TimelineLabels/TimelineLabels.types';
import { TimelineTrack } from "../interface/TimelineAction";
import {blend} from "@mui/system";

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
  width: '800px',
  backgroundColor: blend(theme.palette.background.default,theme.palette.action.hover, 0.04),
  '&:hover': {
    '& .SuiScrollbar': {
      height: '12px',
    }
  }
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
  const { slots, slotProps, controlSx, tracks, setTracks, trackSx } = useThemeProps({
    props: inProps,
    name: 'MuiTimeline',
  });
  const classes = useUtilityClasses(inProps);


  const timelineState = React.useRef<TimelineState>(null);


  const timelineRef = React.useRef<TimelineState>(null);
  const combinedTimelineRef = useForkRef(inProps.timelineState , timelineRef);

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
    ownerState: { sx: controlSx, trackSx, tracks },
  });

  const createAction = (e: React.MouseEvent<HTMLElement, MouseEvent>, { track, time }) => {
    setTracks((previous) => {
      const rowIndex = previous.findIndex((previousTrack) => previousTrack.id === track.id);
      const newAction: ITimelineAction = {
        id: `action ${tracks.length}`,
        start: time,
        end: time + 0.5,
        effectId: 'effect0',
      };
      return { ...track, actions: [...track.actions, newAction] };
    });
  };

  return (
    <Root ref={combinedRootRef} {...rootProps} sx={inProps.sx}>
      <Labels
        ref={labelsRef}
        {...labelsProps.ownerState}
        timelineState={timelineState}
        onToggle={(id: string, property: string) => {
          setTracks((previous) => {
            const rowIndex = previous.findIndex((previousTrack) => previousTrack.id === id);
            previous[rowIndex][property] = !previous[rowIndex][property]
            return [...previous];
          });
        }}
        getToggles={(id: string) => {
          const status = [];
          const rowIndex = tracks.findIndex((previousTrack) => previousTrack.id === id);
          if (tracks[rowIndex]?.hidden) {
            status.push('hidden');
          }
          if (tracks[rowIndex]?.lock) {
            status.push('lock');
          }
          return status;
        }}
      />
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
        onDoubleClickRow={(e, { track, time }) => {
          setTracks((previous) => {
            const rowIndex = previous.findIndex((previousTrack) => previousTrack.id === track.id);
            const newAction: ITimelineAction = {
              id: `action ${previous.length}`,
              start: time,
              end: time + 0.5,
              effectId: 'effect0',
            };
            previous[rowIndex] = { ...track, actions: [...track.actions, newAction] };
            return [...previous];
          });
        }}
        onKeyDown={(event) => {
          event.preventDefault();
          const selectedActions = inProps.engine.getSelectedActions();
          console.log('timeline keydown event', event)
          selectedActions?.forEach((actionTrack) => {
            actionTrack.action.onKeyDown(event, 'keyDown')
          })
        }}
        onScroll={({ scrollTop }) => {
          labelsRef.current.scrollTop = scrollTop;
        }}
        startLeft={10}
        ref={combinedTimelineRef}
        scaleWidth={inProps.scaleWidth}
        setScaleWidth={inProps.setScaleWidth}
        engine={inProps.engine}
        onChange={setTracks}
        tracks={tracks}
        autoScroll
        className={'SuiTimeline'}
        actionTypes={inProps.actionTypes}
        viewSelector={inProps.viewSelector ?? '.viewer'}
        onClickAction={(e, { track, action, time }) => {
          setTracks((previous) => {
            const selectedRowIndex = previous.findIndex((previousTrack) => previousTrack.id === track.id);
            const selectedActionIndex = track.actions.findIndex((previousAction: ITimelineAction) => previousAction.id === action.id);
            // const updatedRows: TimelineTrack[] = [];
            previous.forEach((currTrack, currRowIndex) => {
              currTrack.selected = false;
              currTrack.actions.forEach((currAction, currActionIndex) => {
                if (selectedRowIndex === currRowIndex && currActionIndex === selectedActionIndex) {
                  console.log('selected', currAction.name, 'index', currActionIndex, 'on track', currRowIndex);
                  currAction.selected = true;
                  currTrack.selected = true;
                } else {
                  currAction.selected = false;
                }
              })
            })
            return [...previous];
          });
        }}
      />
    </Root>
  );
});

Timeline.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  actionTypes: PropTypes.object.isRequired,
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
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          data: PropTypes.any,
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
  trackSx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
} as any;

export default Timeline;
