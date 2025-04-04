/**
 * TimelineLabel component
 *
 * @description The TimelineLabel component renders a label for a timeline track.
 * It includes an icon, text, and optional actions.
 *
 * @param {ITimelineTrack} track - The track data
 * @param {TimelineLabelsClasses} classes - CSS classes for the component
 * @param {IController} controller - Optional controller instance
 * @param {Function} onClick - Click handler function
 * @param {Boolean} hideLock - Hide lock icon
 * @param {Number} trackHeight - Track height
 * @param {Boolean} collapsed - Is the label collapsed
 * @param {Boolean} last - Is this the last item in the timeline
 * @param {React.ElementType} trackActions - Optional track actions component
 *
 * @returns {JSX.Element} The rendered component
 */
const TimelineLabel = React.forwardRef(
  function TimelineLabel(inProps: {
    /**
     * Track data
     */
    track: ITimelineTrack,
    classes: TimelineLabelsClasses,
    controller?: IController,
    onClick: (event: React.MouseEvent<HTMLElement>, track: ITimelineTrack) => void,
    hideLock?: boolean,
    trackHeight: number,
    collapsed?: boolean,
    last: boolean
    trackActions?: React.ElementType<any, keyof React.JSX.IntrinsicElements>
  },
  ref: React.Ref<HTMLDivElement>
): React.JSX.Element {
  const { state: context, dispatch } = useTimeline();
  const { settings, flags, file, selectedTrack } = context;
  const { editorMode } = settings;
  const { track, trackHeight, classes, onClick, trackActions: TrackControls } = inProps;
  const { trackHoverId } = settings;

  const trackIndex = file?.tracks?.findIndex((t) => t.id === track.id);
  const trackHover = trackHoverId === track.id;
  const newTrackSim = track.id === 'newTrack';
  const adjustNoNew = inProps.last && !flags.newTracks

  return (
    <React.Fragment>
      {!flags.noLabels && (
        <TimelineLabelRoot key={track.id} className={classes.label} ref={ref} trackHeight={trackHeight}>
          <TimelineLabelContainer
            trackHeight={trackHeight}
            className={classes.label}
            color={TimelineFile.getTrackColor(track)}
            hover={trackHover ? true : undefined}
            track={track}
            locked={track.locked}
            disabled={track.disabled}
            selected={track.id === selectedTrack?.id}
            dim={editorMode !== 'project' && selectedTrack?.id !== track.id && newTrackSim}
            sx={(theme) => ({
              '& .timeline-track': {
                opacity: 0,
                transform: 'scaleX(100%):nth-child(3n+1)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '0.3s',
                transitionTimingFunction: 'cubic-bezier(0.750, -0.015, 0.565, 1.055)'
              }, '& .MuiTimeline-loaded': {
                '& .timeline-track': {
                  opacity: 1,
                  transform: 'translateX(0)',
                  transitionDelay: `calc(.5s * var(${trackIndex})))`,
                }
              },
              borderImage: `${(adjustNoNew && theme.palette.mode === 'light' ? `linear-gradient(to right, transparent, #BBB 3%, white 95%) 1` : undefined)}`,
              borderWidth: `${adjustNoNew ? '1px' : undefined}`,
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
            {(file && !newTrackSim) && <TrackControls track={track} />}
          </TimelineLabelContainer>
        </TimelineLabelRoot>
      )}
    </React.Fragment>
  );
}

export default TimelineLabel;