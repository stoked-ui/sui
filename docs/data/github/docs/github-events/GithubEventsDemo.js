import * as React from 'react';
import Box from '@mui/material/Box';
import { GithubEvents } from '@stoked-ui/github';

export default function GithubEventsDemo() {
  return (
    <Box sx={{ minHeight: 720, minWidth: 1152 }}>
      <GithubEvents githubUser="brian-stoker" eventsPerPage={15} />
    </Box>
  );
}
