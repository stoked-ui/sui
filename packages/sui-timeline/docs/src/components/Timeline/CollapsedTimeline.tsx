import * as React from 'react';
import { Timeline } from '../../../../src';
import { TimelineFile } from '../../../../src/TimelineFile';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function CollapsedTimeline() {
  const [file, setFile] = React.useState<TimelineFile | null>(null);
  const [collapsed, setCollapsed] = React.useState<boolean>(true);
  
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
        },
        {
          id: 'track-3',
          name: 'Track 3',
          actions: [
            { id: 'action-4', start: 12, duration: 6, name: 'Action 4' },
            { id: 'action-5', start: 22, duration: 4, name: 'Action 5' }
          ]
        }
      ]
    });
    
    setFile(timelineFile);
  }, []);
  
  const handleCollapseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCollapsed(event.target.checked);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <FormControlLabel
        control={
          <Switch 
            checked={collapsed} 
            onChange={handleCollapseChange} 
          />
        }
        label="Collapsed view"
        sx={{ mb: 2 }}
      />
      
      <Timeline 
        file={file} 
        labels={true}
        collapsed={collapsed}
      />
    </Box>
  );
} 