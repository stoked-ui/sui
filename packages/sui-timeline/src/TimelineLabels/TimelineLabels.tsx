import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { Box, Stack, Tooltip } from '@mui/material';
import Slider from '@mui/material/Slider';
import ToggleButton from '@mui/material/ToggleButton';
import { styled } from '@mui/material/styles';
import ToggleButtonGroupEx from '../components/ToggleButtonGroupEx';
import { type TimelineLabelsProps } from './TimelineLabels.types';
import { getTimelineLabelsUtilityClass } from './timelineLabelsClasses';
import { useTimeline } from '../TimelineProvider';
import { ITimelineTrack } from '../TimelineTrack';
import TimelineFile from '../TimelineFile';
import TimelineTrackIcon from '../icons/TimelineTrackIcon';
import TimelineLabel from './TimelineLabel';
import EdgeSnap from '../icons/EdgeSnap';
import GridSnap from '../icons/GridSnap';

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
const ToolbarToggle = styled(ToggleButton)(() => ({
  background: 'unset',
  backgroundColor: 'unset',
}));

function SnapControls({ style }: { style?: React.CSSProperties }) {
  const { dispatch, flags } = useTimeline();
  if (flags.noSnapControls) {
    return undefined;
  }
  const handleSnapOptions = (event: React.MouseEvent<HTMLElement>, newOptions: string[]) => {
    const add: string[] = [];
    const remove: string[] = [];
    if (newOptions.includes('gridSnap')) {
      add.push('gridSnap');
    } else {
      remove.push('gridSnap');
    }
    if (newOptions.includes('edgeSnap')) {
      add.push('edgeSnap');
    } else {
      remove.push('edgeSnap');
    }
    dispatch({ type: 'SET_FLAGS', payload: { add, remove } });
  };
  const onControls = flags.noLabels && !flags.noSnapControls;
  const width = onControls ? 52 : 40;
  const height = onControls ? 40 : 32;
  const controlFlags: string[] = [];
  if (flags.edgeSnap) {
    controlFlags.push('edgeSnap');
  }
  if (flags.gridSnap) {
    controlFlags.push('gridSnap');
  }
  return (
    <ToggleButtonGroupEx
      onChange={handleSnapOptions}
      value={controlFlags}
      size={'small'}
      aria-label="text alignment"
      maxWidth={width}
      maxHeight={height}
      style={style}
    >
      <Tooltip enterDelay={1000} title={'Edge Snap'} key={'edgeSnap'}>
        <ToggleButton value="edgeSnap" aria-label="edge snap" key={'edgeSnap-tooltip'}>
          <EdgeSnap />
        </ToggleButton>
      </Tooltip>
      <Tooltip enterDelay={1000} title={'Grid Snap'} key={'gridSnap'}>
        <ToolbarToggle value="gridSnap" aria-label="grid snap" key={'gridSnap-tooltip'}>
          <GridSnap />
        </ToolbarToggle>
      </Tooltip>
    </ToggleButtonGroupEx>
  );
}

/**
 *
 * Demos:
 *
 * - [TimelineLabels](https://stoked-ui.github.io/timeline/docs/)
 *
 * API:
 *
 * - [TimelineLabels](https://stoked-ui.github.io/timeline/api/)
 */

SnapControls.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  style: PropTypes.object.isRequired,
} as any;

export { SnapControls };
const TimelineLabels = React.forwardRef(function TimelineLabels(
  inProps: TimelineLabelsProps,
  ref: React.Ref<HTMLDivElement>,
): React.JSX.Element {
  const context = useTimeline();
  const { engine, flags, file, dispatch, settings, } = context;
  const { getTrackHeight } = settings;
  const { slotProps, slots, sx, width } = inProps;
  const finalWidth = width || !flags.noLabels ? '275px' : '0px';
  // const themeProps = useThemeProps({ props: inProps, name: 'MuiTimelineLabels' });

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
  const displayTracks = TimelineFile.displayTracks(file?.tracks, !flags.newTrack);

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
      {!flags.isMobile && (
        <Box sx={{ height: '37.5px', padding: '3px 0px', justifyContent: 'end', display: 'flex' }}>
          <SnapControls style={{ display: 'flex' }} />
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {!engine.isLoading &&
          displayTracks.map((track, index) => {
            if (!track) {
              return undefined;
            }
            const trackHeight = getTrackHeight(index, context);
            return (
              <TimelineLabel
                trackHeight={trackHeight}
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

      {/* TODO: enable this once there is a mode where the screen height will not be modified if row height changes. */}
      <Stack spacing={2} direction="row" sx={{ display: 'none', alignItems: 'center', mb: 1 }}>
        <TimelineTrackIcon sx={{ width: '15px', height: '15px' }} />
        <Slider
          size="small"
          aria-label="Volume"
          value={settings['trackHeight']}
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
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  controllers: PropTypes.any.isRequired,
  hideLock: PropTypes.bool.isRequired,
  onAddFiles: PropTypes.func.isRequired,
  onLabelClick: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  setFlags: PropTypes.func.isRequired,
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
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
} as any;

export default TimelineLabels;
