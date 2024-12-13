import * as React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import {ToggleButtonGroupEx, ToggleVolume, ToggleLock } from "@stoked-ui/timeline";
import { useEditorContext } from "../EditorProvider/EditorContext";
import VolumeOff from "@mui/icons-material/VolumeOff";
import VolumeUp from "@mui/icons-material/VolumeUp";


export function ToggleHidden({ track, file, toggleClick, dispatch, hide, children }) {
  if (hide) {
    return undefined;
  }
  return (
    <ToggleButton
      id={`${track.id}-hidden`}
      value={track.mute ?? false}
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
      size={'small'}
    >
      {children}
    </ToggleButton>
  );
}

export default function EditorTrackActions({ track, sx }: { track: any, sx?: any }) {
  const { state: { file, flags }, dispatch} = useEditorContext();
  const volumeIcon = track.muted ? <VolumeOff fontSize={'small'} /> : <VolumeUp fontSize={'small'} />;
  const visibilityIcon = track.hidden ? <VisibilityOffIcon fontSize={'small'} /> : <VisibilityIcon fontSize={'small'} />;
  const lockIcon = track.locked ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;
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
    exclusive
    aria-label="text alignment"
    width={32}
    height={32}
    sx={[...(Array.isArray(sx) ? sx : [sx]), { marginLeft: '8px', marginRight: '2px' }]}
  >
    <ToggleHidden track={track} dispatch={dispatch} file={file} toggleClick={toggleClick} hide={flags.hideHidden} >{visibilityIcon}</ToggleHidden>
    <ToggleVolume track={track} dispatch={dispatch} file={file} toggleClick={toggleClick} >{volumeIcon}</ToggleVolume>
    <ToggleLock track={track} dispatch={dispatch} file={file} toggleClick={toggleClick} hide={flags.hideLock} >{lockIcon}</ToggleLock>
  </ToggleButtonGroupEx>
}
