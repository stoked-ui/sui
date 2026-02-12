import * as React from 'react';
import Timeline, { IController, TimelineProvider} from '@stoked-ui/timeline';

import { mockData } from '../mock';

export default function FirstComponent() {
  const controllers: Record<string, IController> = {
    effect: {
      enter: (params: any) => { console.log(params); },
      leave: (params: any) => { console.log(params); },
    } as any,
  };
  return (
    <TimelineProvider>
      <Timeline actions={mockData as any} sx={{width:'100%'}} controllers={controllers}/>
    </TimelineProvider>
  );
};

