import * as React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from "@mui/material/Stack";
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
    effectId: 'video',  // Use the new video effect
    data: {
      src: '/static/video-editor/stock-loop.mp4',
      style: { width: '100%'}
    },
  },
];
function createLoading(sx: BoxProps['sx']) {
  return function Loading() {
    return (
      <Box
        sx={[
          (theme) => ({
            borderRadius: 1,
            bgcolor: 'grey.100',
            ...theme.applyDarkStyles({
              bgcolor: 'primaryDark.800',
            }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  };
}
const defaultEditorData = cloneDeep(actions);

export default function Hero() {
  const globalTheme = useTheme();
  const isMdUp = useMediaQuery(globalTheme.breakpoints.up('md'));

  React.useEffect(() => {
    /*
    const canvas: HTMLCanvasElement | null = document.querySelector('#editor-sandbox canvas');
    const target: HTMLDivElement | null = document.getElementById('canvas-target');

    if (target && canvas) {
      canvas.parentNode?.removeChild(canvas)
      target.appendChild(canvas);
      if (canvas.style) {
        canvas.style.position = 'relative';
      }
    } */
  }, [])
  const [data, setData] = React.useState(defaultEditorData);


  return (
      <Editor id='editor-sandbox' labels sx={{ width: '100%'}} actionData={data} />
  );
}
