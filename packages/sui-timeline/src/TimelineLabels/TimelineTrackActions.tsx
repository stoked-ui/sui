import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroupEx from "../components/ToggleButtonGroupEx";
import * as React from "react";
import { useTimeline } from "../TimelineProvider";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";

export default function TimelineTrackActions({ track, sx }: { track: any, sx?: any }) {
  const { file, dispatch, flags } = useTimeline();
  const visibilityIcon = track.hidden ? <VisibilityOffIcon fontSize={'small'} /> : <VisibilityIcon fontSize={'small'} />;
  const lockIcon = track.lock ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;
  const toggleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
  }
  if (track.id === 'newTrack') {
    return (
      <Fab color="primary" size={'small'} sx={{ scale: '.7'}}><AddIcon fontSize={'large'} /></Fab>
    )

  }
  return <ToggleButtonGroupEx
    exclusive
    aria-label="text alignment"
    width={32}
    height={32}
    sx={[...(Array.isArray(sx) ? sx : [sx]), { marginLeft: '8px'}]}
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
    {!flags.includes('hideLock') &&
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
  </ToggleButtonGroupEx>
}
