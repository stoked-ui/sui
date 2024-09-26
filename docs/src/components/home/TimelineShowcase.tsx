import * as React from 'react';
import Box from '@mui/material/Box';
import ShowcaseContainer from 'docs/src/components/home/ShowcaseContainer';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';
import {SxProps} from "@mui/system";
import {IController, Timeline } from "@stoked-ui/timeline";


const code = `

const actions = [
    {
      name: 'video',
      start: 0,
      end: 20,
      controllerName: 'effect',  // Use the new video effect
      src: '/static/video-editor/stock-loop.mp4',
      layer: 'background',
    },
    {
      name: 'write stuff',
      start: 9.5,
      end: 16,
      controllerName: 'effect',
      src: '/static/timeline/docs/overview/writing.lottie',
    },
    {
      name: 'doing things',
      start: 5,
      end: 9.5,
      controllerName: 'effect',
      src: '/static/timeline/docs/overview/doing-things.lottie',
    },
    {
      name: 'stolen cow',
      start: 0,
      end: 5,
      controllerName: 'effect',
      src: '/static/timeline/docs/overview/stolen-cow.lottie',
      style: { width: '1920px', height: '1080px' },
      x: 990,
    },
    {
      name: 'e',
      start: 0,
      end: 20,
      controllerName: 'effect',
      // src: 'https://adam-rodgers.s3.amazonaws.com/stoked-studio/funeral.mp3',
      src: '/static/timeline/docs/overview/funeral.m4a',
      trimStart: 7.2,
    },
  ];
  const controllers: Record<string, IController> = {
    effect: {
      enter: params => { console.log(params); },
      leave: params => { console.log(params); },
      color: '#FF0000',
      colorSecondary: '#f1abab'
    }
  };
  return (
    <Timeline actionData={actions} sx={{width:'100%'}}  controllers={controllers}/>
  );
};`

function TimelineEditorDemo() {

  const actions = [
    {
      name: 'video',
      start: 0,
      end: 20,
      controllerName: 'effect',  // Use the new video effect
      src: '/static/video-editor/stock-loop.mp4',
      layer: 'background',
    },
    {
      name: 'write stuff',
      start: 9.5,
      end: 16,
      controllerName: 'effect',
      src: '/static/timeline/docs/overview/writing.lottie',
    },
    {
      name: 'doing things',
      start: 5,
      end: 9.5,
      controllerName: 'effect',
      src: '/static/timeline/docs/overview/doing-things.lottie',
    },
    {
      name: 'stolen cow',
      start: 0,
      end: 5,
      controllerName: 'effect',
      src: '/static/timeline/docs/overview/stolen-cow.lottie',
      style: { width: '1920px', height: '1080px' },
      x: 990,
    },
    {
      name: 'e',
      start: 0,
      end: 20,
      controllerName: 'effect',
      // src: 'https://adam-rodgers.s3.amazonaws.com/stoked-studio/funeral.mp3',
      src: '/static/timeline/docs/overview/funeral.m4a',
      trimStart: 7.2,
    },
  ];
  const controllers: Record<string, IController> = {
    effect: {
      enter: params => { console.log(params); },
      leave: params => { console.log(params); },
      color: '#FF0000',
      colorSecondary: '#f1abab'
    }
  };
  return (
    <Timeline actionData={actions} sx={{width:'100%'}}  controllers={controllers}/>
  );
};

export default function TimelineShowcase() {
  const sx: SxProps = { height: 'fit-content', flexGrow: 1, width: '100%', overflowY: 'auto', };
  return (
    <ShowcaseContainer
      preview={
        <TimelineEditorDemo/>
      }
      code={
        <Box
          sx={{
            overflow: 'auto',
            flexGrow: 1,
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '& pre': {
              bgcolor: 'transparent !important',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            },
          }}
        >
          <HighlightedCode
            copyButtonHidden
            component={MarkdownElement}
            code={code}
            language="jsx"
          />
        </Box>
      }
    />
  );
}
