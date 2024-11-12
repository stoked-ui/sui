import {styled} from "@mui/material/styles";
import * as React from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {IconButton, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ToggleButton from "@mui/material/ToggleButton";
import { getTrackBackgroundColor, ITimelineTrack } from "../TimelineTrack";
import {IController} from "../Controller";
import {TimelineLabelsClasses} from "./timelineLabelsClasses";
import {useTimeline} from "../TimelineProvider";
import ToggleButtonGroupEx from "../components/ToggleButtonGroupEx";


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
/*
,{
      props: { hover: true },
      style: {
        background: `linear-gradient(to right,${alpha(color, (theme.palette.mode === 'dark' ? .835 : .65))}, 70%, ${endColor})`,
      }
    },{
      props: { selected: true},
      style: {
        background: `linear-gradient(to right,${color}, 70%, ${theme.palette.action.active})`,
      }
    }
 */
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
      onClick: (track: ITimelineTrack) => void,
      hideLock?: boolean,
      trackHeight: number,
      collapsed?: boolean
    },
    ref: React.Ref<HTMLDivElement>
  ): React.JSX.Element {
    const { settings, file, selectedTrack, settings: { trackHeight }, dispatch } = useTimeline();
    const { track, classes, controller, onClick } = inProps;
    const visibilityIcon = track.hidden ? <VisibilityOffIcon fontSize={'small'} /> : <VisibilityIcon fontSize={'small'} />;
    const lockIcon = track.lock ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;
    const toggleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.stopPropagation();
    }
    const trackIndex = file?.tracks?.findIndex((t) => t.id === track.id);
    const trackHover = settings['track-hover'] === track.id;
    return (
      <TimelineLabelRoot key={track.id} className={classes.label} ref={ref} trackHeight={trackHeight}>
        <TimelineLabelContainer
          trackHeight={trackHeight}
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
          onClick={() => {
            onClick(track)
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
          <TimelineLabelText trackHeight={trackHeight}>
            <Typography variant="button" color="text.secondary" >{track.name}</Typography>
          </TimelineLabelText>
          {(file && track.id !== 'newTrack') &&
            <ToggleButtonGroupEx
              exclusive
              aria-label="text alignment"
              width={32}
              height={28}
            >
              <ToggleButton
                id={`${track.id}-hidden`}
                value={track.hidden ?? false}
                onChange={(e, ) => {
                  const currentTrackIndex = file.tracks.findIndex((currTrack) =>
                    currTrack.id === e.currentTarget.id.replace('-hidden', ''))
                  if (currentTrackIndex === -1) {
                    return
                  }
                  const currentTrack = {...file.tracks[currentTrackIndex]};
                  currentTrack.hidden = !currentTrack.hidden;
                  const updatedTracks = [...file.tracks];
                  updatedTracks[currentTrackIndex] = currentTrack;
                  dispatch({ type: 'SET_TRACKS', payload: updatedTracks });
                }}
                onClick={toggleClick}
                aria-label="hidden"
                size={'small'}>
                {visibilityIcon}
              </ToggleButton>
            {!inProps.hideLock &&
               <ToggleButton
                 id={`${track.id}-lock`}
                 value={track.lock ?? false}
                 aria-label="lock"
                 size={'small'}
                 onChange={(e, ) => {
                   const currentTrackIndex = file.tracks.findIndex((currTrack) => currTrack.id === e.currentTarget.id.replace('-lock', ''))
                   if (currentTrackIndex === -1) {
                     return
                   }
                   const currentTrack = {...file.tracks[currentTrackIndex]};
                   currentTrack.lock = !currentTrack.lock;
                   currentTrack.actions.forEach((updateAction) => {
                     updateAction.movable = !currentTrack.lock;
                     updateAction.flexible = !currentTrack.lock;
                   })
                   const updatedTracks = [...file.tracks];
                   updatedTracks[currentTrackIndex] = currentTrack;
                   dispatch({ type: 'SET_TRACKS', payload: updatedTracks });
                 }}
                 onClick={toggleClick}
               >
                 {lockIcon}
               </ToggleButton>
            }
          </ToggleButtonGroupEx>}
        </TimelineLabelContainer>
      </TimelineLabelRoot>
    );
  }
)

export default TimelineLabel;
