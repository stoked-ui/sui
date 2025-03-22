import * as React from 'react';
import { Timeline } from '../../../../src';
import { TimelineFile } from '../../../../src/TimelineFile';
import { ITimelineTrack } from '../../../../src/TimelineTrack/TimelineTrack.types';
import { ITimelineAction } from '../../../../src/TimelineAction';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

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
  
  const handleClickTrack = (
    e: React.MouseEvent<HTMLElement>, 
    { track, time }: { track: ITimelineTrack; time: number }
  ) => {
    setLastEvent(`Clicked on track "${track.name}" at time ${time.toFixed(2)}`);
  };
  
  const handleClickAction = (
    e: React.MouseEvent<HTMLElement>, 
    { action, track, time }: { action: ITimelineAction; track: ITimelineTrack; time: number }
  ) => {
    setLastEvent(`Clicked on action "${action.name}" on track "${track.name}" at time ${time.toFixed(2)}`);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 20, 200));
  };

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