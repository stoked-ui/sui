/**
 * Toggle button component for volume control.
 *
 * @param {Object} props - Component props.
 * @param {any} props.track - The track object to toggle.
 * @param {any} props.file - The file object containing tracks.
 * @param {function} props.toggleClick - Callback function for toggle click.
 * @param {function} props.dispatch - Dispatch function for state updates.
 * @param {*} [props.children] - Child components or icon.
 */
export function ToggleVolume({
  track,
  file,
  toggleClick,
  dispatch,
  children
}) {

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

/**
 * Toggle button component for lock control.
 *
 * @param {Object} props - Component props.
 * @param {any} props.track - The track object to toggle.
 * @param {any} props.file - The file object containing tracks.
 * @param {function} props.toggleClick - Callback function for toggle click.
 * @param {function} props.dispatch - Dispatch function for state updates.
 * @param {boolean} [props.hide=false] - Flag to hide the component if true.
 */
export function ToggleLock({
  track,
  file,
  toggleClick,
  dispatch,
  hide,
  children
}) {
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

/**
 * Interface for TimelineTrackActions props.
 *
 * @interface TimelineTrackActionsProps
 * @property {any} track - The track object to toggle actions on.
 * @property {Object|null} [sx] - Custom styles for the component.
 */
export interface TimelineTrackActionsProps {
  /**
   * The track object to toggle actions on.
   */
  track: any;
  /**
   * Custom styles for the component.
   */
  sx?: any;
}

/**
 * Component that renders volume and lock controls for a track.
 *
 * @param {Object} props - Component props.
 * @param {any} props.track - The track object to toggle actions on.
 * @param {Object|null} [props.sx] - Custom styles for the component.
 */
export default function TimelineTrackActions({
  track,
  sx
}: TimelineTrackActionsProps) {
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
    sx={[...(Array.isArray(sx) ? sx : [sx]), { display: 'flex', justifyContent: 'space-between' }]}
  >
    <ToggleVolume track={track} file={file} toggleClick={toggleClick} >{volumeIcon}</ToggleVolume>
    <ToggleLock track={track} dispatch={dispatch} file={file} toggleClick={toggleClick} hide={flags.hideLock} >{lockIcon}</ToggleLock>
  </ToggleButtonGroupEx>
}