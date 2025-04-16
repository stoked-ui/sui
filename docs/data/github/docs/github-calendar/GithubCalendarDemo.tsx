import * as React from 'react';
import Box from '@mui/material/Box';
import { GithubCalendar } from '@stoked-ui/github';

export default function GithubCalendarDemo() {
  return (
    <Box sx={{ minWidth: 250 }}>
      <GithubCalendar />
    </Box>
  );
}
