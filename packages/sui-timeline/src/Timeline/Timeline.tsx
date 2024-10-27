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
  const { slots, slotProps, controlSx, onChange, trackSx, controllers, viewMode, locked } = useThemeProps({
    props: inProps,
    name: 'MuiTimeline',
  });
  const { file, engine, dispatch } = useTimeline();

  const hideLock = locked;

  const classes = useUtilityClasses(inProps);

  const timelineState = React.useRef<TimelineState>(null);

  const timelineRef = React.useRef<TimelineState>(null);
  const combinedTimelineRef = useForkRef(inProps.timelineState, timelineRef);

  const forkedRootRef = React.useRef<HTMLDivElement>(null);
  const combinedRootRef = useForkRef(ref, forkedRootRef);

  React.useEffect(() => {
    const screenerStuff = engine.screenerBlob;
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


  }, [engine.screenerBlob])

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
    ownerState: { ...inProps, sx: inProps.labelsSx, timelineState, viewMode: engine.viewMode } as TimelineLabelsProps,
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

  return (
    <Root ref={combinedRootRef} {...rootProps} sx={inProps.sx}>
      {inProps.labels && (
        <Labels
          ref={labelsRef}
          {...labelsProps.ownerState}
          onChange={onChange}
          hideLock={hideLock}
          controllers={inProps.controllers}
          detailMode={inProps.detailMode}
          onAddFiles={inProps.onAddFiles}
          onContextMenu={inProps.onContextMenuTrack}
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
          ref={combinedTimelineRef}
          autoScroll
          disableDrag={locked}
          dragLine={true}
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

  className: PropTypes.string,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  controlSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  controllers: PropTypes.object,
  detailMode: PropTypes.bool,
  detailRenderer: PropTypes.bool,
  engine: PropTypes.any,
  labelSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  labels: PropTypes.bool,
  labelsSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),

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
  trackSx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),), PropTypes.func, PropTypes.object,]),
  tracks: PropTypes.any,
  viewSelector: PropTypes.string,
};

export default Timeline;
