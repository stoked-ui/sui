import * as React from 'react';
import { cloneDeep } from "lodash";
import { withPointer } from 'docs/src/components/home/ElementPointer';
import { default as MuiTimeline } from '@stoked-ui/timeline';

import { mockData } from './mock' ;

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




