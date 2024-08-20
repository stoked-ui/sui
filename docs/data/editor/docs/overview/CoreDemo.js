import { Editor } from '@stoked-ui/editor';
import * as React from 'react';

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions = [
  {
    start: 9.5,
    end: 16,
    effectId: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie1.json',
      name: 'LIKE',
    },
  },
  {
    start: 5,
    end: 9.5,
    effectId: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie2.json',
      name: 'TASK',
    },
  },
  {
    start: 0,
    end: 5,
    effectId: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie3.json',
      name: 'MilkCow',
    },
  },
  {
    start: 0,
    end: 20,
    effectId: 'audio',
    data: {
      src: '/static/timeline/docs/overview/bg.mp3',
      name: 'BACKGROUND MUSIC',
    },
  },
  {
    start: 0,
    end: 10,
    effectId: 'video',  // Use the new video effect
    data: {
      src: '/static/timeline/docs/overview/sample.mp4',
      name: 'Sample Video',
    },
  },
];

export default function CoreDemo() {
  return (
    <Editor sx={{ borderRadius: '12px 12px 0 0' }} actions={actions} />
  );
};

