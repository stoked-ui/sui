import * as React from 'react';
import {MediaFile} from '@stoked-ui/media-selector';
import composeClasses from "@mui/utils/composeClasses";
import {useSlotProps} from '@mui/base/utils';
import {emphasize, styled, Theme, useThemeProps} from '@mui/material/styles';
import {type TimelineLabelsProps} from './TimelineLabels.types';
import {getTimelineLabelsUtilityClass} from "./timelineLabelsClasses";
import {useTimeline} from "../TimelineProvider";
import {Box, Stack, Tooltip} from "@mui/material";
import Slider from "@mui/material/Slider";
import {ITimelineTrack} from "../TimelineTrack";
import {TimelineFile} from "../TimelineFile";
import TimelineTrackIcon from '../icons/TimelineTrackIcon';
import TimelineLabel from "./TimelineLabel";
import EdgeSnap from "../icons/EdgeSnap";
import FeatureSnap from "../icons/FeatureSnap";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
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
})(({ theme }) => ({

  width: '150px',
  height: '258px',
  flex: '0 1 auto',
  overflow: 'overlay',
}));

const ToolbarGroup  = styled(ToggleButtonGroup, {
  name: 'MuiEditorLabels',
  slot: 'toolbar',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  background: 'unset!important',
  backgroundColor: 'unset!important',
  border: 'unset!important',
  '&:hover': {
    background: 'unset!important',
    backgroundColor: 'unset!important',
    border: 'unset!important',
    '& svg': {
      strokeWidth: '20px',
      '&:hover': {
        strokeWidth: '40px'
      }
    }
  },
  '& button': {
    background: 'unset!important',
    backgroundColor: 'unset!important',
    border: 'unset!important',
    '&:hover': {
      background: 'unset!important',
      backgroundColor: 'unset!important',
      border: 'unset!important',
    }
  }
}))

const ToolbarToggle = styled(ToggleButton)(() => ({
  background: 'unset',
  backgroundColor: 'unset',
}))

export function Toolbar() {
  const { dispatch } = useTimeline();
  const selectedColor = (theme: Theme) => theme.palette.mode === 'light' ? '#FFF' : '#000';
  const sxButton = (theme: Theme) => {
    return {
      borderRadius: '0px!important',
      // border: `2px solid ${selectedColor(theme)}!important`,
      padding: '5px 6px',
      '& svg': {
        width: '28px',
        height: '28px'
      },
    }
  };

  const handleSnapOptions = (
    event: React.MouseEvent<HTMLElement>,
    snapOptions: string[],
  ) => {
    dispatch({ type: 'SET_SNAP_OPTIONS', payload: snapOptions })
  };

  return <ToggleButtonGroup
    exclusive
    onChange={handleSnapOptions}
    size={'small'}
    aria-label="text alignment"
    sx={(theme) => ToggleButtonGroupSx(theme, 40, 32)}
  >
    <Tooltip title={"Snap to Edge"}>
      <ToggleButton value="edgeSnap" aria-label="edge snap">
        <EdgeSnap/>
      </ToggleButton>
    </Tooltip>
    <Tooltip title={"Snap to Feature"}>
      <ToolbarToggle value="featureSnap" aria-label="feature snap">
        <FeatureSnap />
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

    const { slotProps, slots, sx, hideLock = false, width } = inProps;
    const finalWidth = width ? width : '250px';
    const { } = useThemeProps({ props: inProps, name: 'MuiEditorLabels' });

    const classes = useUtilityClasses(inProps);
    const Root = slots?.root ?? TimelineLabelsRoot;

    const rootProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.root,
      className: classes.root,
      ownerState: inProps,
    });

    const newTrackClick = () => {
      const input = document.createElement('input') as HTMLInputElement;
      input.type = 'file';
      input.onchange =  async (ev) => {
        const files =  await MediaFile.from(ev)
        dispatch({ type: 'CREATE_TRACKS', payload: files });
      }
      input.click();
    }

    const handleItemClick = (t: ITimelineTrack, event: React.MouseEvent<HTMLElement>) => {
      if (t.id === 'newTrack') {
        newTrackClick();
        return;
      }
      dispatch({type: 'SELECT_TRACK', payload: t});
      dispatch({type: 'DETAIL', payload: event.currentTarget});
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
