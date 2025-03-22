import * as React from 'react';
import { Timeline } from '@stoked-ui/sui-timeline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function TimelineUsage() {
  const tracks = [
    {
      id: 'track-1',
      name: 'Main Track',
      actions: [
        { id: 'action-1', start: 0, duration: 10, name: 'Introduction' },
        { id: 'action-2', start: 12, duration: 8, name: 'Development' },
        { id: 'action-3', start: 22, duration: 5, name: 'Conclusion' }
      ]
    },
    {
      id: 'track-2',
      name: 'Secondary Track',
      actions: [
        { id: 'action-4', start: 5, duration: 7, name: 'Supporting Content' },
        { id: 'action-5', start: 15, duration: 10, name: 'Additional Details' }
      ]
    }
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="body1">
        The Timeline component provides a visual representation of time-based events,
        allowing users to organize and manipulate actions along a timeline.
      </Typography>
      
      <Box sx={{ height: '250px', width: '100%', border: '1px solid #e0e0e0' }}>
        <Timeline 
          tracks={tracks}
          labels={true}
        />
      </Box>
    </Stack>
  );
} 