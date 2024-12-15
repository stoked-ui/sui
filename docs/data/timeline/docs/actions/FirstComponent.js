import * as React from 'react';
import { Timeline, TimelineProvider } from '@stoked-ui/timeline';
import { useTheme } from '@mui/material/styles';

import { mockData } from '../mock';

export default function FirstComponent() {
  const controllers = {
    effect: {
      enter: (params) => {
        console.log(params);
      },
      leave: (params) => {
        console.log(params);
      },
    },
  };
  const theme = useTheme();
  console.log('theme', theme);
  return (
    <TimelineProvider>
      <Timeline tracks={mockData} sx={{ width: '100%' }} controllers={controllers} />
    </TimelineProvider>
  );
}
