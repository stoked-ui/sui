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

/**
 * Hook to generate utility classes for the component.
 *
 * @param {TimelineLabelsProps} ownerState - The state of the component.
 * @returns {object} An object containing the utility classes.
 */
const useUtilityClasses = (ownerState: TimelineLabelsProps) => {
  const { classes } = ownerState;
  const slots = {
    root: ['root'],
    label: ['label'],
    actions: ['actions'],
  };
  return composeClasses(slots, getTimelineLabelsUtilityClass, classes);
};

/**
 * Styled component for the timeline labels root.
 *
 * @type {React.FC}
 */
const TimelineLabelsRoot = styled('div', {
  name: 'MuiTimelineLabels',
  slot: 'root',
  overridesResolver: (props, styles) => styles.icon,
})(() => ({
  width: '150px',
  flex: '0 1 auto',
  overflow: 'overlay',
}));

/**
 * Timeline labels component.
 *
 * @param {TimelineLabelsProps} inProps - The props of the component.
 * @param {React.Ref<HTMLDivElement>} ref - A reference to the root element.
 * @returns {JSX.Element} The JSX element representing the timeline labels.
 */
const TimelineLabels = React.forwardRef(function TimelineLabels(
  inProps: TimelineLabelsProps,
  ref: React.Ref<HTMLDivElement>,
): React.JSX.Element {
  const { state: context, dispatch } = useTimeline();
  const { engine, flags, file, settings } = context;
  const { trackHeight, videoTrack } = settings;
  const { slotProps, slots, sx, width } = inProps;
  const finalWidth = width || !flags.noLabels ? '275px' : '150px';

  return (
    <Root>
      {/* Timeline labels container */}
      <Container>
        {displayTracks.map((track, index) => (
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
        ))}
      </Container>

      {/* Volume slider */}
      <VolumeSlider>
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
      </VolumeSlider>

      {/* Controls container */}
      <Controls>
        {/* TODO: enable this once there is a mode where the screen height will not be modified if row height changes. */}
        {controls.map((control, index) => (
          <TimelineTrackIcon
            sx={{ width: '32px', height: '32px' }}
            key={control.id}
          />
        ))}
      </Controls>
    </Root>
  );
});

/**
 * Props type for the timeline labels component.
 *
 * @type {object}
 */
TimelineLabels.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  controllers: PropTypes.any,
  hideLock: PropTypes.bool,
  onAddFiles: PropTypes.func,
  onLabelClick: PropTypes.func,
  onToggle: PropTypes.func,
  setFlags: PropTypes.func,

  /**
   * The props used for each component slot.
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
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