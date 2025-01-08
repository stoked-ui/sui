import * as React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import VolumeUp from "@mui/icons-material/VolumeUp";
import VolumeOff from "@mui/icons-material/VolumeOff";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import ToggleButtonGroupEx from "../components/ToggleButtonGroupEx";
import { useTimeline } from "../TimelineProvider/TimelineProvider";

export function ToggleVolume({ track, file, toggleClick, dispatch, children }) {

  return  <ToggleButton
    id={`${track.id}-mute`}
    value={track.muted ?? false}
    onChange={(e, ) => {
      const currentTrackIndex = file.tracks.findIndex((currTrack) => currTrack.id === track.id)
      if (currentTrackIndex === -1) {
        return
      }

      const currentTrack = {...track};
      currentTrack.muted = !currentTrack.muted;
      const updatedTracks = [...file.tracks];
      updatedTracks[currentTrackIndex] = currentTrack;
      console.log('mute toggle track', currentTrack);
      dispatch({ type: 'SET_TRACKS', payload: updatedTracks });
    }}
    onClick={toggleClick}
    aria-label="mute"
    size={'small'}>
    {children}
  </ToggleButton>
}

export function ToggleLock({ track, file, toggleClick, dispatch, hide, children }) {
  if (hide) {
    return undefined;
  }
  return (
    <ToggleButton
      id={`${track.id}-locked`}
      value={track.locked ?? false}
      aria-label="locked"
      size={'small'}
      sx={{marginRight: '2px' }}
      onChange={(e, ) => {
        const currentTrackIndex = file.tracks.findIndex((currTrack) => currTrack.id === e.currentTarget.id.replace('-locked', ''))
        if (currentTrackIndex === -1) {
          return
        }
        const currentTrack = {...file.tracks[currentTrackIndex]};
        currentTrack.locked = !currentTrack.locked;
        currentTrack.actions.forEach((updateAction) => {
          updateAction.movable = !currentTrack.locked;
          updateAction.flexible = !currentTrack.locked;
        })
        const updatedTracks = [...file.tracks];
        updatedTracks[currentTrackIndex] = currentTrack;
        dispatch({ type: 'SET_TRACKS', payload: updatedTracks });
      }}
      onClick={toggleClick}
    >
      {children}
    </ToggleButton>
  );
}

export interface TimelineTrackActionsProps { track: any, sx?: any }
export default function TimelineTrackActions({ track, sx }: TimelineTrackActionsProps) {
  const { state: { file, flags }, dispatch } = useTimeline();
  const volumeIcon = track.muted ? <VolumeOff fontSize={'small'} /> : <VolumeUp fontSize={'small'} />;
  const lockIcon = track.locked ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;
  const toggleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
  }
  if (!file || flags.noTrackControls) {
    return undefined;
  }
  return <ToggleButtonGroupEx
    aria-label="text alignment"
    width={32}
    height={32}
    sx={[...(Array.isArray(sx) ? sx : [sx]), { marginLeft: '8px', marginRight: '2px', zIndex: 1 }]}
  >
    <ToggleVolume track={track} dispatch={dispatch} file={file} toggleClick={toggleClick} >{volumeIcon}</ToggleVolume>
    <ToggleLock track={track} dispatch={dispatch} file={file} toggleClick={toggleClick} hide={flags.hideLock} >{lockIcon}</ToggleLock>
  </ToggleButtonGroupEx>
}
