import { styled } from '@mui/material/styles';
import { VideoEditor } from '@stoked-ui/editor';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { CustomRender0, CustomRender1 } from './custom';
import { IControl, TimelineAction } from "@stoked-ui/timeline";

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions: TimelineAction[] = [
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

const defaultEditorData = cloneDeep(actions);

const getActionRenderer = (action, row) => {
  if (action.effectId === 'effect0') {
    return <CustomRender0 action={action} row={row}/>;
  }
  // else if (action.effectId === 'effect1') {
  return <CustomRender1 action={action} row={row}/>;
}

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  '& .player-panel': {
    width: '100%',
    height: '500px',
    position: 'relative',

    '& .lottie-ani': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
    }
  },
  overflow: 'hidden',
}));

export default function VideoEditorDemo() {
  const [data, setData] = React.useState(defaultEditorData);

  return (
    <VideoEditor sx={{ borderRadius: '12px 12px 0 0' }} actions={data}/>
  );
};

