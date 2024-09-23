import * as React from 'react';
import { Editor } from '@stoked-ui/editor';
import { cloneDeep } from 'lodash';
import Fade from "@mui/material/Fade";
import {Card} from "@mui/material";
import {alpha} from "@mui/material/styles";
import {SxProps} from "@mui/system";

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions = [
  {
    name: 'video',
    start: 0,
    end: 20,
    controllerName: 'video',  // Use the new video effect
    src: '/static/video-editor/stock-loop.mp4',
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
    src: 'https://adam-rodgers.s3.amazonaws.com/stoked-studio/funeral.mp3',
    trimStart: 7.2,
  },

];

const defaultEditorData = cloneDeep(actions);

export default function EditorHero(props: { id: string, sx?: SxProps}) {
  const [data, ] = React.useState(defaultEditorData);
  return (
    <Fade in timeout={700}>
      <Card
        sx={{
          minWidth: 280,
          maxWidth: '100%',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: (theme) => `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
        }}
      >
        <Editor id={props.id ? props.id : 'video-editor-test'} sx={props.sx ? props.sx : { borderRadius: '12px 12px 0 0' }} actionData={data} />
      </Card>
    </Fade>
  );
}


