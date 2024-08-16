import * as React from 'react';
import { Timeline} from '@stoked-ui/timeline';
import { tracks } from './mock';
export default function TimelineEditorDemo() {

  return (
    <Timeline tracks={tracks} />
  );
};

