import * as React from 'react';
import {MediaFile} from '@stoked-ui/media-selector';
import composeClasses from "@mui/utils/composeClasses";
import {useSlotProps} from '@mui/base/utils';
import {Box, Stack, Tooltip} from "@mui/material";
import Slider from "@mui/material/Slider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {styled, Theme, useThemeProps} from '@mui/material/styles';
import {type TimelineLabelsProps} from './TimelineLabels.types';
import {getTimelineLabelsUtilityClass} from "./timelineLabelsClasses";
import {useTimeline} from "../TimelineProvider";
import {ITimelineTrack} from "../TimelineTrack";
import {TimelineFile} from "../TimelineFile";
import TimelineTrackIcon from '../icons/TimelineTrackIcon';
import TimelineLabel from "./TimelineLabel";
import EdgeSnap from "../icons/EdgeSnap";
import GridSnap from "../icons/GridSnap";
import {ToggleButtonGroupSx} from "../Timeline/Timeline.types";

const useUtilityClasses = (
  ownerState: TimelineLabelsProps,
) => {
  const { classes } = ownerState;
  const slots = {
    root: ['root'],
    label: ['label'],
    container: ['container'],
    template: ['template']
  };
  return composeClasses(slots, getTimelineLabelsUtilityClass, classes);
};

const TimelineLabelsRoot = styled('div', {
  name: 'MuiTimelineLabels',
  slot: 'root',
  overridesResolver: (props, styles) => styles.icon,
})(() => ({

  width: '150px',
  height: '258px',
  flex: '0 1 auto',
  overflow: 'overlay',
}));
const ToolbarToggle = styled(ToggleButton)(() => ({
  background: 'unset',
  backgroundColor: 'unset',
}))

export function Toolbar() {
  const { dispatch, snapOptions } = useTimeline();

  const handleSnapOptions = (
    event: React.MouseEvent<HTMLElement>,
    newOptions: string[],
  ) => {
    console.info('newOptions', newOptions)
    dispatch({ type: 'SET_SNAP_OPTIONS', payload: newOptions })
  };
  console.info('snapOptions', snapOptions)
  return <ToggleButtonGroup
    onChange={handleSnapOptions}
    value={snapOptions}
    size={'small'}
    aria-label="text alignment"
    sx={(theme) => ToggleButtonGroupSx(theme, 40, 32)}
  >
    <Tooltip title={"Edge Snap"}>
      <ToggleButton value="edgeSnap" aria-label="edge snap">
        <EdgeSnap/>
      </ToggleButton>
    </Tooltip>
    <Tooltip title={"Grid Snap"}>
      <ToolbarToggle value="featureSnap" aria-label="feature snap">
        <GridSnap />
      </ToolbarToggle>
    </Tooltip>
  </ToggleButtonGroup>
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
const TimelineLabels = React.forwardRef(
  function TimelineLabels(inProps: TimelineLabelsProps, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
    const { engine, file, dispatch, rowHeight } = useTimeline();

    const { slotProps, slots, sx, width } = inProps;
    const finalWidth = width || '250px';
    // const themeProps = useThemeProps({ props: inProps, name: 'MuiTimelineLabels' });

    const classes = useUtilityClasses(inProps);
    const Root = slots?.root ?? TimelineLabelsRoot;

    const rootProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.root,
      className: classes.root,
      ownerState: inProps,
    });

    const handleItemClick = (t: ITimelineTrack, event: React.MouseEvent<HTMLElement>) => {
      if (t.id === 'newTrack') {
        inProps.onAddFiles();
        return;
      }

      dispatch({type: 'SELECT_TRACK', payload: t})
      dispatch({type: 'SET_POPOVER', payload: { open: true, name: 'detail' }});

    };

    return (
      <Root
        {...rootProps}
        style={{ overflow: 'overlay' }}
        onScroll={(scrollEvent:  React.UIEvent<HTMLDivElement, UIEvent>) => {
          // timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
          // timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
        }}
        sx={[sx, { width: finalWidth }]}
        classes={classes}
        className={`${classes.root} timeline-list`}>
        <Box sx={{height: '37.5px', padding: '3px 6px'}}>
          <Toolbar />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {!engine.isLoading && TimelineFile.displayTracks(file?.tracks).map((track) => {
            if (!track) {
              return undefined;
            }
            return <TimelineLabel
              rowHeight={rowHeight}
              track={track}
              hideLock={inProps.hideLock}
              classes={classes}
              key={track.id}
              controller={track.controller}
              onClick={handleItemClick}
            />
          })}
        </Box>

        {/* TODO: enable this once there is a mode where the screen height will not be modified if row height changes. */}
        <Stack spacing={2} direction="row" sx={{ display: 'none', alignItems: 'center', mb: 1 }}>
          <TimelineTrackIcon sx={{ width: '15px', height: '15px' }} />
          <Slider size="small"
                  aria-label="Volume"
                  value={rowHeight}
                  onChange={(event, value, ) => dispatch({type: 'SET_ROW_HEIGHT', payload: value as number})} />
          <TimelineTrackIcon sx={{ width: '32px', height: '32px' }} />
        </Stack>
      </Root>
    )
  })


export default TimelineLabels;
