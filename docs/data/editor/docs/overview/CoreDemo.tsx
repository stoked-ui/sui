import * as React from 'react';
import Editor, { Controllers, EditorProvider } from '@stoked-ui/editor';
import { ITimelineFileAction } from '@stoked-ui/timeline'
import EditorExample from "../../../../src/components/showcase/EditorExample";

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions: ITimelineFileAction[] = [
  {
    name: 'write stuff',
    start: 9.5,
    end: 16,
    url: '/static/timeline/docs/overview/writing.lottie',
  },
  {
    name: 'doing things',
    start: 5,
    end: 9.5,
    url: '/static/timeline/docs/overview/doing-things.lottie',
  },
  {
    name: 'stolen cow',
    start: 0,
    end: 5,
    url: '/static/timeline/docs/overview/stolen-cow.lottie',
  },
  {
    name: 'music',
    start: 0,
    end: 20,
    url: '/static/timeline/docs/overview/bg.mp3',
  },
  {
    name: 'video',
    start: 0,
    end: 10,
    url: '/static/editor/stock-loop.mp4',
    style: {
      width: '100%'
    }
  },
];

export default function CoreDemo() {
  return (
    <EditorProvider id={'core-demo'} controllers={Controllers} file={EditorExample} >
      <Editor id='video-editor' sx={{ borderRadius: '12px 12px 0 0' }} />
    </EditorProvider>
  );
};

