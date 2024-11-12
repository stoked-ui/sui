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
import {ITimelineFileAction, type ITimelineAction} from '../TimelineAction/TimelineAction.types';
import TimelineControl from '../TimelineControl/TimelineControl';
import {type TimelineLabelsProps} from '../TimelineLabels/TimelineLabels.types';
import {useTimeline} from "../TimelineProvider";
import { TimelineFile } from "../TimelineFile";

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
  const { slots, slotProps, controlSx, onChange, trackSx, locked } = useThemeProps({
    props: inProps,
    name: 'MuiTimeline',
  });
  const { file, engine, dispatch, flags } = useTimeline();

  const hideLock = locked;

  const classes = useUtilityClasses(inProps);


  const [timelineState, setTimelineState] = React.useState<TimelineState>();
  const forkedRootRef = React.useRef<HTMLDivElement>(null);
  const combinedRootRef = useForkRef(ref, forkedRootRef);

  React.useEffect(() => {
    if (inProps.timelineState.current) {

      setTimelineState(inProps.timelineState.current);
    }
  }, [inProps.timelineState.current]);

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

  const Control = slots?.control ?? TimelineControl;
  const controlProps = useSlotProps({
    elementType: Control,
    externalSlotProps: slotProps?.control,
    className: classes.control,
    ownerState: { sx: controlSx, trackSx },
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

  const rootClasses = `${rootProps.className} ${!engine.isLoading ? 'MuiTimeline-loaded' : ''}`
  return (
    <Root ref={combinedRootRef} {...rootProps} className={rootClasses} sx={inProps.sx}>
      {(inProps.labels && !inProps.collapsed) && (
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
      )}

      {engine &&
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
          }}
          onClickAction={(e, { track, action }) => {
            dispatch({type: 'SELECT_ACTION', payload: {track, action} });
          }}
          onContextMenuAction={inProps.onContextMenuAction}
          onContextMenuTrack={inProps.onContextMenuTrack}
          collapsed={inProps.collapsed}
      />}

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
  timelineState: PropTypes.any,
  tracks: PropTypes.any,
  trackSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  viewSelector: PropTypes.string,
};

export default Timeline;
