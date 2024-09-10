import * as React from 'react';
import { Editor } from '@stoked-ui/editor';
import { cloneDeep } from 'lodash';

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions = [
  {
    name: 'write stuff',
    start: 9.5,
    end: 16,
    effectId: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie1.json',
    },
  },
  {
    name: 'doing things',
    start: 5,
    end: 9.5,
    effectId: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie2.json',
    },
  },
  {
    name: 'stolen cow',
    start: 0,
    end: 5,
    effectId: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie3.json',
    },
  },
  {
    name: 'music',
    start: 0,
    end: 20,
    effectId: 'audio',
    data: {
      src: '/static/timeline/docs/overview/bg.mp3',
    },
  },
  {
    name: 'video',
    start: 0,
    end: 10,
    effectId: 'video', // Use the new video effect
    data: {
      src: '/static/video-editor/stock-loop.mp4',
      style: {
        width: '100%',
      },
    },
  },
];

const defaultEditorData = cloneDeep(actions);

export default function CoreDemo() {
  return (
    <Editor
      id="video-editor"
      sx={{ borderRadius: '12px 12px 0 0' }}
      actionData={defaultEditorData}
    />
  );
}
