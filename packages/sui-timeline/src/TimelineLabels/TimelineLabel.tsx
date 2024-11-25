import { styled } from "@mui/material/styles";
import * as React from "react";
import { IconButton, Typography } from "@mui/material";
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
    marginLeft: '3px',
    paddingLeft: '1px',
    backgroundImage: 'linear-gradient(to right, #BBB , #BBB0)',
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
})<{ lock?: boolean, color: string, selected?: boolean, hidden?: boolean, track?: ITimelineTrack, trackHeight: number, hover?: boolean, disabled: boolean, dim?: boolean}>
(({ theme, color, selected, trackHeight, hover, disabled, dim}) => {
  const trackBack = getTrackBackgroundColor(color, theme.palette.mode, selected, hover, disabled, dim);
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
    collapsed?: boolean,
    last: boolean
  },
  ref: React.Ref<HTMLDivElement>
): React.JSX.Element {
  const context = useTimeline();
  const { settings, flags, file, selectedTrack, dispatch } = context;
  const { editorMode, getTrackHeight } = settings;
  const { track, trackHeight, classes, controller, onClick } = inProps;
  const { trackHoverId } = settings;

  const trackIndex = file?.tracks?.findIndex((t) => t.id === track.id);
  const trackHover = trackHoverId === track.id;
  return (
    <React.Fragment>
      {!flags.noLabels && <TimelineLabelRoot key={track.id} className={classes.label} ref={ref} trackHeight={trackHeight}>
        <TimelineLabelContainer
          trackHeight={trackHeight}
          className={classes.label}
          color={controller?.color ?? '#8882'}
          hover={trackHover ? true : undefined}
          track={track}
          lock={track.lock}
          disabled={track.disabled}
          selected={track.id === selectedTrack?.id}
          dim={editorMode !== 'project' && selectedTrack?.id !== track.id}
          sx={(theme) => ({
            '& .timeline-editor-edit-track': {
              opacity: 0,
              transform: 'scaleX(100%):nth-child(3n+1)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '0.3s',
              transitionTimingFunction: 'cubic-bezier(0.750, -0.015, 0.565, 1.055)'
            }, '& .MuiTimeline-loaded': {
              '& .timeline-editor-edit-track': {
                opacity: 1,
                transform: 'translateX(0)',
                transitionDelay: `calc(.5s * var(${trackIndex})))`,
              }
            },
            borderImage: `${(inProps.last && theme.palette.mode === 'light' ? `linear-gradient(to right, transparent, #BBB 3%, white 95%) 1` : undefined)}`,
            borderWidth: `${inProps.last ? '1px' : undefined}`,
          })}
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            onClick(event, track)
          }}
          onMouseEnter={(() => {
            dispatch({ type: 'SET_SETTING', payload: { key: 'trackHoverId', value: track.id } })
          })}
          onMouseLeave={(() => {
            dispatch({ type: 'SET_SETTING', payload: { key: 'trackHoverId', value: undefined} })
          })}
        >
          {track.id === 'newTrack' &&
           <IconButton sx={{ borderRadius: '24px', width: '24px', height: '24px' }} size={'small'}>
             <AddIcon />
           </IconButton>}
          <TimelineLabelText trackHeight={trackHeight}>
            <Typography variant="button" color="text.secondary" sx={(theme) => ({ color: `${theme.palette.background.default}!important` })} >{track.name}</Typography>
          </TimelineLabelText>
          {(file && track.id !== 'newTrack') && <TimelineTrackActions track={track} />}
        </TimelineLabelContainer>
      </TimelineLabelRoot>}
    </React.Fragment>);
  }
)

export default TimelineLabel;
