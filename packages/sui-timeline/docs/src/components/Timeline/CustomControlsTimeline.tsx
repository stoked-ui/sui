/**
 * React component for displaying a custom controls timeline.
 * Allows users to interact with tracks and actions on a timeline.
 *
 * @returns {JSX.Element} The custom controls timeline component.
 */
export default function CustomControlsTimeline() {
  const [file, setFile] = React.useState<TimelineFile | null>(null);
  const [lastEvent, setLastEvent] = React.useState<string>('No events yet');
  const [zoom, setZoom] = React.useState<number>(100);
  
  React.useEffect(() => {
    // Create a timeline file with sample data
    const timelineFile = new TimelineFile({
      tracks: [
        {
          id: 'track-1',
          name: 'Track 1',
          actions: [
            { id: 'action-1', start: 0, duration: 10, name: 'Action 1' },
            { id: 'action-2', start: 15, duration: 5, name: 'Action 2' }
          ]
        },
        {
          id: 'track-2',
          name: 'Track 2',
          actions: [
            { id: 'action-3', start: 5, duration: 8, name: 'Action 3' }
          ]
        }
      ]
    });
    
    setFile(timelineFile);
  }, []);
  
  /**
   * Handles the click event on a timeline track.
   *
   * @param {React.MouseEvent<HTMLElement>} e - The click event object.
   * @param {{ track: ITimelineTrack; time: number }} param1 - Object containing track and time information.
   */
  const handleClickTrack = (
    e: React.MouseEvent<HTMLElement>, 
    { track, time }: { track: ITimelineTrack; time: number }
  ) => {
    setLastEvent(`Clicked on track "${track.name}" at time ${time.toFixed(2)}`);
  };
  
  /**
   * Handles the click event on a timeline action.
   *
   * @param {React.MouseEvent<HTMLElement>} e - The click event object.
   * @param {{ action: ITimelineAction; track: ITimelineTrack; time: number }} param1 - Object containing action, track, and time information.
   */
  const handleClickAction = (
    e: React.MouseEvent<HTMLElement>, 
    { action, track, time }: { action: ITimelineAction; track: ITimelineTrack; time: number }
  ) => {
    setLastEvent(`Clicked on action "${action.name}" on track "${track.name}" at time ${time.toFixed(2)}`);
  };

  /**
   * Increases the zoom level of the timeline.
   */
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 20, 200));
  };

  /**
   * Decreases the zoom level of the timeline.
   */
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 20, 40));
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleZoomIn}>
          Zoom In
        </Button>
        <Button variant="contained" onClick={handleZoomOut}>
          Zoom Out
        </Button>
      </Stack>
      
      <Timeline 
        file={file} 
        labels={true}
        onClickTrack={handleClickTrack}
        onClickAction={handleClickAction}
        scaleWidth={zoom}
      />
      
      <Typography variant="body2" sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        Last event: {lastEvent}
      </Typography>
    </Box>
  );
}