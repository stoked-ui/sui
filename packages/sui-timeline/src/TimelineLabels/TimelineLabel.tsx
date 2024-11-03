import {alpha, styled} from "@mui/material/styles";
import * as React from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {IconButton, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ToggleButton from "@mui/material/ToggleButton";
import {ITimelineTrack} from "../TimelineTrack";
import {IController} from "../Controller";
import {TimelineLabelsClasses} from "./timelineLabelsClasses";
import {useTimeline} from "../TimelineProvider";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";


const TimelineLabelRoot = styled('div', {
  name: 'MuiTimelineLabels',
  slot: 'label',
  overridesResolver: (props, styles) => styles.icon,
  shouldForwardProp: (prop) => prop !== 'lock',
})<{ rowHeight: number }>(({theme, rowHeight} ) => {
  return ({
    height: `${rowHeight}px`,
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
  shouldForwardProp: (prop) => prop !== 'lock' && prop !== 'track',
})<{ lock?: boolean, color: string, selected?: boolean, hidden?: boolean, track?: ITimelineTrack, rowHeight: number}>
(({ theme, color, track, selected, hidden, rowHeight}) => {
  const endColor = alpha(color, selected ? .3 : theme.palette.action.focusOpacity);
  const getFirstColor = () => {
    if (selected) {
      return color;
    }
    return alpha(color, (theme.palette.mode === 'dark' ? .8 : .62));
  }
  const firstGradientColor = getFirstColor();
  return {
    color: ((selected ?? false) ? theme.palette.text.primary : theme.palette.text.secondary),
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px',
    borderBottom: `1px solid ${theme.palette.background.default}`,
    width: '250px',
    display: 'flex',
    height: `${rowHeight - 1}px`,
    alignItems: 'center',
    paddingLeft: '6px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textWrap: 'nowrap',
    flexGrow: '1',
    background: `linear-gradient(to right,${firstGradientColor}, 70%, ${endColor})`,
    '&:hover': {
      background: `linear-gradient(to right,${color}, 70%, ${endColor})`,
    },
    variants: [{
      props: {
        hidden: true
      },
      style: {
        opacity: '.4'
      }
    }]
  }
});

const TimelineLabelText = styled('div', {
  name: 'MuiTimelineLabels',
  slot: 'label',
  overridesResolver: (props, styles) => styles.icon,
})<{ rowHeight: number }>(({ theme, rowHeight }) => ({
  '& span': {
    color: theme.palette.text.primary,
  },
  height: `${rowHeight - 4}px`,
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

const ToggleButtonGroupStyled = styled(ToggleButtonGroup)(({theme})=> {
  return ({
    background: theme.palette.background.default,
    '& .MuiButtonBase-root': {
      color: theme.palette.text.primary,
      padding: '4px!important',
      '&:hover': {
        color: theme.palette.primary.main,
        background: theme.palette.background.default,
        border: `1px solid ${theme.palette.text.primary}`,
      },
    },
  })
})

const TimelineLabel = React.forwardRef(
  function TimelineLabel(inProps: {
      track: ITimelineTrack,
      classes: TimelineLabelsClasses,
      controller?: IController,
      onClick: (track: ITimelineTrack, event: React.MouseEvent<HTMLDivElement>) => void,
      hideLock?: boolean,
      rowHeight: number
    },
    ref: React.Ref<HTMLDivElement>
  ): React.JSX.Element {
    const { engine, file, selectedTrack, rowHeight, dispatch } = useTimeline();
    const { track, classes, controller, onClick } = inProps;
    const visibilityIcon = track.hidden ? <VisibilityOffIcon fontSize={'small'} /> : <VisibilityIcon fontSize={'small'} />;
    const lockIcon = track.lock ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;
    const toggleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => {
      event.stopPropagation();
    }

    return (
      <TimelineLabelRoot key={track.id} className={classes.label} ref={ref} rowHeight={rowHeight}>
        <TimelineLabelContainer
          rowHeight={rowHeight}
          className={classes.container}
          color={controller?.color ?? '#8882'}
          track={track}
          lock={track.lock}
          hidden={!!track.hidden}
          selected={track.id === selectedTrack?.id}
          onClick={(event) => {
            onClick(track, event)
          }}
        >
          {track.id === 'newTrack' &&
           <IconButton sx={{ borderRadius: '24px', width: '24px', height: '24px' }} size={'small'}>
             <AddIcon />
           </IconButton>}
          <TimelineLabelText rowHeight={rowHeight}>
            <Typography variant="button" color="text.secondary" >{track.name}</Typography>
          </TimelineLabelText>
          {(file && track.id !== 'newTrack') && <ToggleButtonGroupStyled
            exclusive
            aria-label="text alignment"
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
             </ToggleButton>}
          </ToggleButtonGroupStyled>}
        </TimelineLabelContainer>
      </TimelineLabelRoot>
    );
  }
)

export default TimelineLabel;
