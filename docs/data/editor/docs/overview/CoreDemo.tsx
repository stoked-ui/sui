import * as React from 'react';
import Editor, { EditorProvider } from '@stoked-ui/editor';
import { ITimelineFileAction } from '@stoked-ui/timeline'

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions: ITimelineFileAction[] = [
  {
    name: 'write stuff',
    start: 9.5,
    end: 16,
    url: '/static/timeline/docs/overview/lottie1.json',
  },
  {
    name: 'doing things',
    start: 5,
    end: 9.5,
    url: '/static/timeline/docs/overview/lottie2.json',
  },
  {
    name: 'stolen cow',
    start: 0,
    end: 5,
    url: '/static/timeline/docs/overview/lottie3.json',
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
    <EditorProvider actions={actions}>
      <Editor id='video-editor' sx={{ borderRadius: '12px 12px 0 0' }} />
    </EditorProvider>
  );
};

