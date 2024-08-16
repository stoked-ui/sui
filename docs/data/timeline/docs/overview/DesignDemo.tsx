import * as React from 'react';
import { withPointer } from 'docs/src/components/home/ElementPointer';
import { Timeline as MuiTimeline } from '@stoked-ui/timeline';
import { TimelineProps } from '@stoked-ui/timeline/Timeline';

import { mockData, mockEffect } from './mock' ;
import { cloneDeep } from "lodash";

const defaultEditorData = cloneDeep(mockData);
export const componentCode = `
<Timeline tracks={defaultEditorData} />
`;

const Timeline = withPointer(MuiTimeline, { id: 'timeline', name: 'Timeline' });

export default function MaterialDesignDemo() {
  const [active, setActive] = React.useState(true);
  return (
    <Timeline tracks={defaultEditorData}/>
  )
}



