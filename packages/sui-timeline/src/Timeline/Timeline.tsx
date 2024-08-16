import * as React from 'react';
import composeClasses from "@mui/utils/composeClasses";
import { useSlotProps } from '@mui/base/utils';
import { styled, useThemeProps } from '@mui/material/styles';
import useForkRef from "@mui/utils/useForkRef";
import { TimelineProps } from './Timeline.types';
import { getTimelineUtilityClass } from "./timelineClasses";
import { TimelineState } from "./TimelineState";
import { TimelineLabels } from "../TimelineLabels/TimelineLabels";
import { TimelineAction } from "../interface/action";
import { TimelineControl } from "../TimelineControl/TimelineControl";
import { TimelineLabelsProps } from "../TimelineLabels/TimelineLabels.types";
import { actionTypes } from '../TimelineAction/TimelineActionTypes'

const useUtilityClasses = (
  ownerState: TimelineProps,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    labels: ['labels'],
    control: ['control']
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
  backgroundColor: theme.palette.background.default,
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
const Timeline = React.forwardRef(
  function Timeline(inProps: TimelineProps, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
    const { slots, slotProps, controlSx, trackSx, } = useThemeProps({
      props: inProps,
      name: 'MuiTimeline'
    });
    const classes = useUtilityClasses(inProps);

    const [tracks, setTracks] = React.useState(inProps.tracks);
    const timelineState = React.useRef<TimelineState>(null);

    const forkedRootRef = React.useRef<HTMLDivElement>(null);
    const combinedRootRef = useForkRef(ref, forkedRootRef);
    const Root = slots?.root ?? TimelineRoot;
    const rootProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.root,
      className: classes.root,
      ownerState: inProps as TimelineProps,
    });

    const Labels = slots?.labels ?? TimelineLabels;
    const labelsRef: React.RefObject<HTMLDivElement> = React.useRef(null);
    const labelsProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.labels,
      className: classes.labels,
      ownerState: { ...inProps as TimelineLabelsProps, sx: inProps.labelsSx },
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
        const rowIndex = previous.findIndex(previousTrack => previousTrack.id === track.id);
        const newAction: TimelineAction = {
          id: `action ${tracks.length}`,
          start: time,
          end: time + 0.5,
          effectId: "effect0",
        }
        return { ...track, actions: [...track.actions, newAction] };
      })
    }

    return (
      <Root ref={combinedRootRef} {...rootProps}>
        <Labels
          ref={labelsRef}
          {...labelsProps.ownerState}
          timelineState={timelineState}
        />
        <Control
          sx={{
            width: '100%',
            flex: '1 1 auto',
            '&-action': {
              height: '28px !important',
              top: '50%',
              transform: 'translateY(-50%)',
            }
          }}
          onDoubleClickRow={(e, { track, time }) => {
            setTracks((previous) => {
              const rowIndex = previous.findIndex(previousTrack => previousTrack.id === track.id);
              const newAction: TimelineAction = {
                id: `action ${previous.length}`,
                start: time,
                end: time + 0.5,
                effectId: "effect0",
              }
              previous[rowIndex] = { ...track, actions: [...track.actions, newAction] };
              return [...previous];
            })
          }}
          onScroll={({ scrollTop }) => {
            labelsRef.current.scrollTop = scrollTop;
          }}
          ref={timelineState}
          onChange={setTracks}
          tracks={tracks}
          actionTypes={actionTypes}
        />
      </Root>
    );
  })

export default Timeline;
