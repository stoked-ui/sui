import * as React from 'react';
import { Timeline, ITimelineActionType} from '@stoked-ui/timeline';
import { useTheme } from '@mui/material/styles';

import { tracks } from './mock';

export default function TimelineEditorDemo() {
  const actionTypes: Record<string, ITimelineActionType> = {
    effect: {
      enter: params => { console.log(params); },
      leave: params => { console.log(params); },
    }
  };
  const theme = useTheme();
  console.log('theme', theme);
  return (
    <Timeline tracks={tracks} sx={{width:'100%'}}  actionTypes={actionTypes}/>
  );
};

