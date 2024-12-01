import { alpha, styled } from "@mui/material/styles";
import * as React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { shouldForwardProp } from "@mui/system/createStyled";
import AddIcon from "@mui/icons-material/Add";
import { getTrackBackgroundColor, ITimelineTrack } from "../TimelineTrack";
import {IController} from "../Controller";
import {TimelineLabelsClasses} from "./timelineLabelsClasses";
import {useTimeline} from "../TimelineProvider";
import TimelineTrackActions from "./TimelineTrackActions";


const TimelineLabelRoot = styled('div', {
  name: 'MuiTimelineLabels',
  slot: 'label',
  overridesResolver: (props, styles) => styles.icon,
  shouldForwardProp: (prop) => prop !== 'lock' && prop !== 'trackHeight',
})<{ trackHeight: number }>(({trackHeight} ) => {
  return ({
    height: `${trackHeight}px`,
    paddingLeft: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '4px',
    cursor: 'pointer'
  })
});


const TimelineLabelContainer = styled('div', {
  name: 'MuiTimelineLabels',
  slot: 'container',
  overridesResolver: (props, styles) => styles.icon,
  shouldForwardProp: (prop) =>
    prop !== 'lock'
    && prop !== 'track'
    && prop !== 'trackHeight'
    && prop !== 'hover',
})<{ lock?: boolean, color: string, selected?: boolean, hidden?: boolean, track?: ITimelineTrack, trackHeight: number, hover?: boolean}>
(({ theme, color, selected, trackHeight, hover}) => {
  const trackBack = getTrackBackgroundColor(color, theme.palette.mode, selected, hover, true);
  return {
    ...trackBack.label,
    transition: 'all 0.5s ease',
    color: ((selected ?? false) ? theme.palette.text.primary : theme.palette.text.secondary),
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px',
    borderBottom: `1px solid ${theme.palette.background.default}`,
    width: '250px',
    display: 'flex',
    height: `${trackHeight - 1}px`,
    alignItems: 'center',
    paddingLeft: '6px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textWrap: 'nowrap',
    flexGrow: '1',
    variants: [{
      props: {
        hidden: true
      },
      style: {
        opacity: '.4'
      }
    },{
      props: {
        lock: true
      },
      style: {
        background: `linear-gradient(to right,#0008, 70%, #0003)`,
        /* background: lockedBg,
        '& .timeline-editor-action': {
          background: emphasize(theme.palette.background.default, 0.24)
        } */
      }
    }]
  }
});

const TrackLabel = styled('label', {
  name: 'MuiTimelineAction',
  slot: 'root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'color',
})<{
  hover: boolean;
  color: string;
}>(({ theme, hover }) => {

  const bgColor = alpha(theme.palette.background.default, .95);
  return {
    '& p': {
      color: theme.palette.text.primary,
      textWrap: 'none',
      whiteSpace: 'nowrap',
      position: 'sticky',
      left: 0,
    },
    padding: '3px 6px',
    display: 'flex-inline',
    width: 'min-content',
    borderRadius: '4px',
    background: bgColor,
    position: 'relative',
    margin: '8px 0px',
    alignSelf: 'center',
    overflow: 'auto',
    opacity: hover ? '1' : '0',
    marginRight: '8px',
    transition: hover ? 'opacity .4s ease-in' : 'opacity .4s 1s ease-out',
    zIndex: 200,
  }
});

export function TimelineTrackLabel({track, areaRef }: {track: ITimelineTrack, areaRef: React.RefObject<HTMLDivElement>}) {
  const { settings, flags } = useTimeline();
  const labelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (labelRef.current && areaRef?.current?.clientWidth !== labelRef.current?.clientWidth) {
      labelRef.current.style.width = `${areaRef.current.clientWidth - 8}px`;
    }
  }, [areaRef?.current?.clientWidth]);

  React.useEffect(() => {
    if ((labelRef?.current?.style?.left !== undefined) && areaRef?.current?.scrollLeft !== parseInt(labelRef.current?.style.left, 10)) {
      labelRef.current.style.left = `${areaRef?.current?.scrollLeft}px`;
    }
  }, [areaRef?.current?.scrollLeft]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} ref={labelRef}>
      {!flags.includes('labels') && <TimelineTrackActions track={track} />}
      {flags.includes('labels') && <div/>}
      <TrackLabel color={`${track?.controller?.color}`} hover={settings['track-hover'] === track.id} >
        <Typography variant="body2" color="text.primary"
                    sx={(theme) => ({
                      color: `${theme.palette.mode === 'light' ? '#000' : '#FFF'}`,
                      fontWeight: '500',
                      zIndex: 1000,
                    })}>
          {track.name}
        </Typography>

      </TrackLabel>
    </Box>
  )
}

const TimelineLabelText = styled('div', {
  name: 'MuiTimelineLabels',
  slot: 'label',
  overridesResolver: (props, styles) => styles.icon,
  shouldForwardProp: (prop) => prop !== 'trackHeight',
})<{ trackHeight: number }>(({ theme, trackHeight }) => ({
  '& span': {
    color: theme.palette.text.primary,
  },
  height: `${trackHeight - 4}px`,
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '6px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textWrap: 'nowrap',
  flexGrow: '1',
  userSelect: 'none',
}));

const TimelineLabel = React.forwardRef(
  function TimelineLabel(inProps: {
      track: ITimelineTrack,
      classes: TimelineLabelsClasses,
      controller?: IController,
      onClick: (event: React.MouseEvent<HTMLElement>, track: ITimelineTrack) => void,
      hideLock?: boolean,
      trackHeight: number,
      collapsed?: boolean
    },
    ref: React.Ref<HTMLDivElement>
  ): React.JSX.Element {
    const { settings, flags, file, selectedTrack, dispatch } = useTimeline();
    const { track, classes, controller, onClick } = inProps;

    const trackIndex = file?.tracks?.findIndex((t) => t.id === track.id);
    const trackHover = settings['track-hover'] === track.id;
    return (
      <TimelineLabelRoot key={track.id} className={classes.label} ref={ref} trackHeight={settings['timeline.trackHeight']}>
        <TimelineLabelContainer
          trackHeight={settings['timeline.trackHeight']}
          className={classes.container}
          color={controller?.color ?? '#8882'}
          hover={trackHover}
          track={track}
          lock={track.lock}
          hidden={!!track.hidden}
          selected={track.id === selectedTrack?.id}
          sx={{
            '& .timeline-editor-edit-track': {
              opacity: 0,
              transform: 'scaleX(100%):nth-child(3n+1)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '0.3s',
              transitionTimingFunction: 'cubic-bezier(0.750, -0.015, 0.565, 1.055)'
            },
            '& .MuiTimeline-loaded': {
              '& .timeline-editor-edit-track': {
                opacity: 1,
                transform: 'translateX(0)',
                transitionDelay: `calc(.5s * var(${trackIndex})))`,
              }
            }
          }}
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            onClick(event, track)
          }}
          onMouseEnter={(() => {
            dispatch({ type: 'SET_SETTING', payload: { key: 'track-hover', value: track.id } })
          })}
          onMouseLeave={(() => {
            dispatch({ type: 'SET_SETTING', payload: { key: 'track-hover', value: undefined} })
          })}
        >
          {track.id === 'newTrack' &&
           <IconButton sx={{ borderRadius: '24px', width: '24px', height: '24px' }} size={'small'}>
             <AddIcon />
           </IconButton>}
          <TimelineLabelText trackHeight={settings['timeline.trackHeight']}>
            <Typography variant="button" color="text.secondary" >{track.name}</Typography>
          </TimelineLabelText>
          {(flags.includes('trackControls') && file && track.id !== 'newTrack') && <TimelineTrackActions track={track} />}
        </TimelineLabelContainer>
      </TimelineLabelRoot>
    );
  }
)

export default TimelineLabel;
