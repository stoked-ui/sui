import * as React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import VolumeUp from "@mui/icons-material/VolumeUp";
import VolumeOff from "@mui/icons-material/VolumeOff";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import {ToggleButtonGroupEx} from "@stoked-ui/timeline";
import { useTimeline } from "../TimelineProvider/TimelineProvider";

export function ToggleVolume({ track, file, toggleClick, dispatch, children }) {

  return  <ToggleButton
    id={`${track.id}-mute`}
    value={track.mute ?? false}
    onChange={(e, ) => {
      const currentTrackIndex = file.tracks.findIndex((currTrack) =>
        currTrack.id === e.currentTarget.id.replace('-mute', ''))
      if (currentTrackIndex === -1) {
        return
      }
      const currentTrack = {...file.tracks[currentTrackIndex]};
      currentTrack.mute = !currentTrack.mute;
      const updatedTracks = [...file.tracks];
      updatedTracks[currentTrackIndex] = currentTrack;
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
      id={`${track.id}-lock`}
      value={track.lock ?? false}
      aria-label="lock"
      size={'small'}
      sx={{marginRight: '2px'}}
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
      {children}
    </ToggleButton>
  );
}

export default function TimelineTrackActions({ track, sx }: { track: any, sx?: any }) {
  const { file, dispatch, flags } = useTimeline();
  const volumeIcon = track.hidden ? <VolumeOff fontSize={'small'} /> : <VolumeUp fontSize={'small'} />;
  const lockIcon = track.lock ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;
  const toggleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
  }
  if (track.id === 'newTrack') {
    return (
      <Fab color="primary" size={'small'} sx={{ scale: '.7'}}><AddIcon fontSize={'large'} /></Fab>
    )
  }
  if (!file || flags.noTrackControls) {
    return undefined;
  }
  return <ToggleButtonGroupEx
    aria-label="text alignment"
    width={32}
    height={32}
    sx={[...(Array.isArray(sx) ? sx : [sx]), { marginLeft: '8px', marginRight: '2px' }]}
  >
    <ToggleVolume track={track} dispatch={dispatch} file={file} toggleClick={toggleClick} >{volumeIcon}</ToggleVolume>
    <ToggleLock track={track} dispatch={dispatch} file={file} toggleClick={toggleClick} hide={flags.hideLock} >{lockIcon}</ToggleLock>
  </ToggleButtonGroupEx>
}
