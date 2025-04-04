import * as React from 'react';
import { Timeline } from '../../../../src';
import { TimelineFile } from '../../../../src/TimelineFile';
import { ITimelineTrack } from '../../../../src/TimelineTrack/TimelineTrack.types';
import { ITimelineAction } from '../../../../src/TimelineAction';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

/**
 * CustomControlsTimeline component
 *
 * This component demonstrates a custom timeline with zooming functionality.
 * It displays a list of tracks and actions, allowing the user to click on
 * individual tracks and actions to view their details.
 */
export default function CustomControlsTimeline() {
  const [file, setFile] = React.useState<TimelineFile | null>(null);
  const [lastEvent, setLastEvent] = React.useState<string>('No events yet');
  const [zoom, setZoom] = React.useState<number>(100);

  /**
   * Initialize the timeline file with sample data
   */
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
   * Handle click on a track
   *
   * Updates the last event state with a message indicating which track was clicked.
   */
  const handleClickTrack = (
    e: React.MouseEvent<HTMLElement>, 
    { track, time }: { track: ITimelineTrack; time: number }
  ) => {
    setLastEvent(`Clicked on track "${track.name}" at time ${time.toFixed(2)}`);
  };

  /**
   * Handle click on an action
   *
   * Updates the last event state with a message indicating which action was clicked.
   */
  const handleClickAction = (
    e: React.MouseEvent<HTMLElement>, 
    { action, track, time }: { action: ITimelineAction; track: ITimelineTrack; time: number }
  ) => {
    setLastEvent(`Clicked on action "${action.name}" on track "${track.name}" at time ${time.toFixed(2)}`);
  };

  /**
   * Handle zoom in
   *
   * Increases the zoom level by 20.
   */
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 20, 200));
  };

  /**
   * Handle zoom out
   *
   * Decreases the zoom level by 20, but not below 40.
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
      
      /**
       * Custom timeline component with zooming functionality
       *
       * @param file - The timeline file data
       * @param labels - Whether to display labels on the tracks
       * @param onClickTrack - Callback function when a track is clicked
       * @param onClickAction - Callback function when an action is clicked
       * @param scaleWidth - The initial zoom level of the timeline
       */
      <Timeline 
        file={file} 
        labels={true}
        onClickTrack={handleClickTrack}
        onClickAction={handleClickAction}
        scaleWidth={zoom}
      />
      
      /**
       * Display the last event state
       *
       * @returns The last event state as a string
       */
      <Typography variant="body2" sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        Last event: {lastEvent}
      </Typography>
    </Box>
  );
}