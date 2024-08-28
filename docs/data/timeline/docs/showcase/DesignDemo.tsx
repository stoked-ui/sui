import * as React from 'react';
import { withPointer } from 'docs/src/components/home/ElementPointer';
import { Timeline as MuiTimeline } from '@stoked-ui/timeline';

import { mockData } from './mock' ;
import { cloneDeep } from "lodash";

const defaultEditorData = cloneDeep(mockData);
export const componentCode = `
<Timeline tracks={defaultEditorData} />
`;

const Timeline = withPointer(MuiTimeline, { id: 'timeline', name: 'Timeline' });

export default function MaterialDesignDemo() {
  return (
    <Timeline tracks={defaultEditorData}/>
  )
}



