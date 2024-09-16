import * as React from 'react';
import Box from '@mui/material/Box';
import ShowcaseContainer from 'docs/src/components/home/ShowcaseContainer';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';
import {SxProps} from "@mui/system";
import { Editor } from '@stoked-ui/editor';
import { cloneDeep } from 'lodash';
import { ITimelineAction }from '@stoked-ui/timeline'



const code = `
import * as React from 'react';
import { Editor } from '@stoked-ui/editor';
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
      src: '/static/timeline/docs/overview/lottie1.json',
    },
  },
  {
    name: 'doing things',
    start: 5,
    end: 9.5,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie2.json',
    },
  },
  {
    name: 'stolen cow',
    start: 0,
    end: 5,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie3.json',
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
      src: '/static/video-editor/stock-loop.mp4',
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

export const actions: ITimelineAction[] = [
  {
    name: 'write stuff',
    start: 9.5,
    end: 16,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie1.json',
    },
  },
  {
    name: 'doing things',
    start: 5,
    end: 9.5,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie2.json',
    },
  },
  {
    name: 'stolen cow',
    start: 0,
    end: 5,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/lottie3.json',
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
      src: '/static/video-editor/stock-loop.mp4',
      style: {
        width: '100%'
      }
    },
  },
];

const defaultEditorData = cloneDeep(actions);

function EditorDemo() {
  return (
    <Editor id='video-editor' sx={{ borderRadius: '12px 12px 0 0' }} actionData={defaultEditorData} />
  );
};


export default function FileExplorerShowcase() {
  const sx: SxProps = { height: 'fit-content', flexGrow: 1, width: '100%', overflowY: 'auto', };
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
