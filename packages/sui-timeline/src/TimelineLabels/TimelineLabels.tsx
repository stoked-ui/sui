/**
 * React component for rendering timeline labels.
 * @description Displays labels for timeline tracks and provides functionality for interacting with them.
 * @param {Object} props - The props for the TimelineLabels component.
 * @param {Object} props.classes - Override or extend the styles applied to the component.
 * @param {string} props.className - Additional CSS class for styling.
 * @param {any} props.controllers - Controller objects for managing timeline tracks.
 * @param {boolean} props.hideLock - Flag to hide lock icon.
 * @param {function} props.onAddFiles - Callback function for adding files.
 * @param {function} props.onLabelClick - Callback function for clicking on a label.
 * @param {function} props.onToggle - Callback function for toggling.
 * @param {function} props.setFlags - Setter function for flags.
 * @param {Object} props.slotProps - The props used for each component slot. Default is an empty object.
 * @param {Object} props.slots - Overridable component slots. Default is an empty object.
 * @param {Array|function|Object} props.sx - The system prop for defining system overrides and additional CSS styles.
 * @param {number|string} props.width - The width of the component.
 * @returns {JSX.Element} Rendered React component for timeline labels.
 * @example
 * <TimelineLabels
 *   classes={classes}
 *   className="timeline-labels"
 *   controllers={controllers}
 *   hideLock={false}
 *   onAddFiles={handleAddFiles}
 *   onLabelClick={handleLabelClick}
 *   onToggle={handleToggle}
 *   setFlags={setFlags}
 *   slotProps={slotProps}
 *   slots={slots}
 *   sx={[sx1, sx2]}
 *   width={200}
 * />
 */
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { Box, Stack } from '@mui/material';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import { type TimelineLabelsProps } from './TimelineLabels.types';
import { getTimelineLabelsUtilityClass } from './timelineLabelsClasses';
import { useTimeline } from '../TimelineProvider';
import { ITimelineTrack } from '../TimelineTrack';
import TimelineTrackIcon from '../icons/TimelineTrackIcon';
import TimelineLabel from './TimelineLabel';
import SnapControls from './SnapControls';

const useUtilityClasses = (ownerState: TimelineLabelsProps) => {
  const { classes } = ownerState;
  const slots = {
    root: ['root'],
    label: ['label'],
    actions: ['actions'],
  };
  return composeClasses(slots, getTimelineLabelsUtilityClass, classes);
};

const TimelineLabelsRoot = styled('div', {
  name: 'MuiTimelineLabels',
  slot: 'root',
  overridesResolver: (props, styles) => styles.icon,
})(() => ({
  width: '150px',
  flex: '0 1 auto',
  overflow: 'overlay',
}));

const TimelineLabels = React.forwardRef(function TimelineLabels(
  inProps: TimelineLabelsProps,
  ref: React.Ref<HTMLDivElement>,
): React.JSX.Element {
  const { state: context, dispatch } = useTimeline();
  const { engine, flags, file, settings } = context;
  const { trackHeight, videoTrack } = settings;
  const { slotProps, slots, sx, width } = inProps;
  const finalWidth = width || !flags.noLabels ? '275px' : '0px';

  const classes = useUtilityClasses(inProps);
  const Root = slots?.root ?? TimelineLabelsRoot;

  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState: inProps,
  });

  const handleItemClick = (event: React.MouseEvent<HTMLElement>, t: ITimelineTrack) => {
    if (t.id === 'newTrack') {
      inProps.onAddFiles();
      return;
    }
    inProps.onClickLabel(event, t);
  };
  let displayTracks = file?.tracks || [];
  if (videoTrack) {
    displayTracks = [videoTrack];
  }
  return (
    <Root
      {...rootProps}
      style={{ overflow: 'overlay' }}
      onScroll={(scrollEvent: React.UIEvent<HTMLDivElement, UIEvent>) => {
        // timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
        // timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
      }}
      sx={[sx, { width: finalWidth }]}
      classes={classes}
      className={`${classes.root} timeline-list`}
      ref={ref}
    >
      <Box sx={{ height: '37.5px', padding: '3px 0px', justifyContent: 'end', display: 'flex' }}>
        <SnapControls style={{ display: 'flex' }} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {!engine.isLoading &&
          displayTracks.map((track, index) => {
            if (!track) {
              return undefined;
            }
            return (
              <TimelineLabel
                trackHeight={trackHeight}
                trackActions={inProps.trackActions}
                track={track}
                hideLock={inProps.hideLock}
                classes={classes}
                key={track.id}
                last={index === displayTracks.length - 1}
                controller={track.controller}
                onClick={(event: React.MouseEvent<HTMLElement>, clickTrack: ITimelineTrack) => {
                  handleItemClick(event, clickTrack);
                }}
              />
            );
          })}
      </Box>
      <Stack spacing={2} direction="row" sx={{ display: 'none', alignItems: 'center', mb: 1 }}>
        <TimelineTrackIcon sx={{ width: '15px', height: '15px' }} />
        <Slider
          size="small"
          aria-label="Volume"
          value={settings.trackHeight}
          onChange={(event, value) =>
            dispatch({
              type: 'SET_SETTING',
              payload: {
                key: 'trackHeight',
                value: value as number,
              },
            })
          }
        />
        <TimelineTrackIcon sx={{ width: '32px', height: '32px' }} />
      </Stack>
    </Root>
  );
});

TimelineLabels.propTypes = {
  classes: PropTypes.object,
  className: PropTypes.string,
  controllers: PropTypes.any,
  hideLock: PropTypes.bool,
  onAddFiles: PropTypes.func,
  onLabelClick: PropTypes.func,
  onToggle: PropTypes.func,
  setFlags: PropTypes.func,
  slotProps: PropTypes.object,
  slots: PropTypes.object,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
    ),
    PropTypes.func,
    PropTypes.object,
  ]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
} as any;

export default TimelineLabels;
**/