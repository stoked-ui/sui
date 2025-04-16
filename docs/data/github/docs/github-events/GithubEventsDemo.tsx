import * as React from 'react';
import Box from '@mui/material/Box';
import { GithubEvents  } from '@stoked-ui/github';

export default function GithubEventsDemo() {
  return (
    <Box sx={{ minHeight: 720, minWidth: '340px', width: '814px' }}>
      <GithubEvents githubUser="brian-stoker" eventsPerPage={15} githubToken={process.env.GITHUB_TOKEN} />
    </Box>
  );
}
