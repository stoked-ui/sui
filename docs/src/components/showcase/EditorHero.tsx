import * as React from 'react';
import Editor from '@stoked-ui/editor';
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
    name: 'stock-loop',
    start: 0,
    end: 12,
    controllerName: 'video',  // Use the new video effect
    src: '/static/video-editor/stock-loop.mp4',
    layer: 'background',
    fit: 'fill' as 'fill',
  },
  {
    name: 'stock-loop-alpha',
    start: 12,
    end: 26,
    controllerName: 'video',  // Use the new video effect
    src: '/static/video-editor/stock-loop-alpha.webm',
    fit: 'fill' as 'fill',
  },
  {
    name: 'stoked-ui',
    start: 0,
    end: 12,
    loop: false,
    controllerName: 'video',  // Use the new video effect
    src: '/static/video-editor/stoked-ui-v8-24fps-opus.webm',
  },
  {
    name: 'music',
    start: 0,
    end: 15.5,
    trimStart: .5,
    controllerName: 'audio',
    src: '/static/timeline/docs/overview/funeral.m4a',
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
        <Editor id={props.id ? props.id : 'editor-hero-demo'} sx={props.sx ? props.sx : { borderRadius: '12px 12px 0 0' }} actionData={data} />
      </Card>
    </Fade>
  );
}


