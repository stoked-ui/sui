import * as React from 'react';
import Box from '@mui/material/Box';
import {TimelineFile} from "@stoked-ui/timeline";
import Editor from '@stoked-ui/editor';
import ShowcaseContainer from 'docs/src/components/home/ShowcaseContainer';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';
import { cloneDeep } from 'lodash';

const code = `
import * as React from 'react';
import Editor from '@stoked-ui/editor';
import { cloneDeep } from 'lodash';
import { ITimelineAction }from '@stoked-ui/timeline'

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions: ITimelineAction[] = [
  {
    name: 'write stuff',
    start: 9.5,
    end: 16,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/writing.lottie',
    },
  },
  {
    name: 'doing things',
    start: 5,
    end: 9.5,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/doing-things.lottie',
    },
  },
  {
    name: 'stolen cow',
    start: 0,
    end: 5,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/stolen-cow.lottie',
    },
  },
  {
    name: 'music',
    start: 0,
    end: 20,
    controllerName: 'audio',
    data: {
      src: '/static/timeline/docs/overview/bg.mp3',
    },
  },
  {
    name: 'video',
    start: 0,
    end: 10,
    controllerName: 'video',  // Use the new video effect
    data: {
      src: '/static/editor/stock-loop.mp4',
      style: {
        width: '100%'
      }
    },
  },
];

const defaultEditorData = cloneDeep(actions);

export default function CoreDemo() {
  return (
    <Editor id='video-editor' sx={{ borderRadius: '12px 12px 0 0' }} actionData={defaultEditorData} />
  );
};`

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions = [
  {
    name: 'video',
    start: 0,
    end: 20,
    controllerName: 'video',  // Use the new video effect
    src: '/static/editor/stock-loop.mp4',
    layer: 'background',
  },
  {
    name: 'write stuff',
    start: 9.5,
    end: 16,
    controllerName: 'animation',
    src: '/static/timeline/docs/overview/writing.lottie',
  },
  {
    name: 'doing things',
    start: 5,
    end: 9.5,
    controllerName: 'animation',
    src: '/static/timeline/docs/overview/doing-things.lottie',
  },
  {
    name: 'stolen cow',
    start: 0,
    end: 5,
    controllerName: 'animation',
    src: '/static/timeline/docs/overview/stolen-cow.lottie',
    style: { width: '1920px', height: '1080px' },
    x: 990,
  },
  {
    name: 'music',
    start: 0,
    end: 20,
    controllerName: 'audio',
    // src: 'https://adam-rodgers.s3.amazonaws.com/stoked-studio/funeral.mp3',
    src: '/static/timeline/docs/overview/funeral.m4a',
    trimStart: 7.2,
  },
];

const defaultEditorData = cloneDeep(actions);

function EditorDemo() {
  return (
    <Editor id='video-editor' sx={{ borderRadius: '12px 12px 0 0' }} file={new TimelineFile({actionData: defaultEditorData})} />
  );
}


export default function FileExplorerShowcase() {
  return (
    <ShowcaseContainer
      preview={
        <EditorDemo/>
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
