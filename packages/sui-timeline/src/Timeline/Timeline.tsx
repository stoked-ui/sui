import * as React from 'react';
import composeClasses from "@mui/utils/composeClasses";
import { useSlotProps } from '@mui/base/utils';
import { styled, useThemeProps } from '@mui/material/styles';
import useForkRef from "@mui/utils/useForkRef";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { TimelineProps } from './Timeline.types';
import { getTimelineUtilityClass } from "./timelineClasses";
import { TimelineState } from "./TimelineState";
import { TimelineLabels } from "../TimelineLabels/TimelineLabels";
import { TimelineAction } from "../interface/action";
import { TimelineControl } from "../TimelineControl/TimelineControl";
import { TimelineLabelsProps } from "../TimelineLabels/TimelineLabels.types";

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
  slot: 'root',
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
  width: '100%  ',
  marginTop: '42px',
  height: '258px',
  flex: '0 1 auto',
  overflow: 'overlay',
  display: 'flex',

  '& .MuiTimelineLabels-label': {
    height: '32px',
    padding: '2px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    '& div': {
      color: theme.palette.text.primary,
      height: '28px',
      width: '100%',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.grey.A100,
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
const Timeline = React.forwardRef(
  function Timeline(inProps: TimelineProps, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
    const { slots, slotProps, controlSx, trackSx, } = useThemeProps({ props: inProps, name: 'MuiTimeline' });
    const classes = useUtilityClasses(inProps);

    const [tracks, setTracks] = React.useState(inProps.tracks);
    const timelineState = React.useRef<TimelineState>(null);

    const labelsRef = React.useRef<HTMLDivElement>(null);

    const Root = slots?.root ?? TimelineRoot;
    const rootProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.root,
      className: classes.root,
      ownerState: inProps as TimelineProps,
    });

    const Labels = slots?.labels ?? TimelineLabels;
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
      <Root ref={ref} {...rootProps} className={classes.root}>
        <ScrollSync>
          <div style={{display: 'flex', flexDirection:'row'}}>
            <ScrollSyncPane>
              <Labels
                ref={labelsRef}
                {...labelsProps.ownerState}
              />
            </ScrollSyncPane>
            <ScrollSyncPane>
              <Control
                onDoubleClickRow={createAction}
                ref={timelineState}
                onChange={setTracks}
                {...controlProps.ownerState}
              />

            </ScrollSyncPane>
          </div>
        </ScrollSync>
      </Root>
    );
  })


export default Timeline;
