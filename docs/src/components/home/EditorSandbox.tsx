import * as React from 'react';
import { Editor } from '@stoked-ui/editor';
import { cloneDeep } from 'lodash';
import { namedId } from '@stoked-ui/media-selector';

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions = [
  {
    id: namedId('action'),
    name: 'write stuff',
    start: 9.5,
    end: 16,
    effectId: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie1.json',
    },
  },
  {
    id: namedId('action'),
    name: 'doing things',
    start: 5,
    end: 9.5,
    effectId: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie2.json',
    },
  },
  {
    id: namedId('action'),
    name: 'stolen cow',
    start: 0,
    end: 5,
    effectId: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie3.json',
    },
  },
  {
    id: namedId('action'),
    name: 'music',
    start: 0,
    end: 20,
    effectId: 'audio',
    data: {
      src: 'https://adam-rodgers.s3.amazonaws.com/stoked-studio/funeral.mp3',
      /* src:'https://archive.org/download/radiohead-ok-computer-oknotok-1997-2017-remastered/02%20Paranoid%20Android%20%28Remastered%29.mp3', */
    },
  },
  {
    id: namedId('action'),
    name: 'video',
    start: 0,
    end: 10,
    effectId: 'video',  // Use the new video effect
    data: {
      src: '/static/video-editor/stock-loop.mp4',
      style: { width: '100%'}
    },
  },
];
const defaultEditorData = cloneDeep(actions);

export default function Hero() {

  const [data,] = React.useState(defaultEditorData);


  return (
      <Editor id='editor-sandbox' sx={{ width: '100%'}} actionData={data} />
  );
}
