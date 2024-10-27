import * as React from 'react';
import Editor, { Controllers, EditorProvider } from '@stoked-ui/editor';
import Fade from "@mui/material/Fade";
import {Card} from "@mui/material";
import {alpha} from "@mui/material/styles";
import {SxProps} from "@mui/system";
import {TimelineFile, ITimelineFileAction } from "@stoked-ui/timeline";
import {namedId} from "@stoked-ui/media-selector/src";

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

const idFunc = () => namedId('track');
const videoFile = new TimelineFile({
  name: 'Stoked UI - Multiverse',
  description: 'demonstrate the @stoked-ui/editor features',
  author: 'Brian Stoker',
  created: 1729783494563,
  backgroundColor: '#000',
  tracks: [
    {
      id: idFunc(),
      name: 'dr. strange trailer',
      src: '/static/video-editor/vast-multiverse.mp4',
      controller: Controllers['video'],
      actions: [{
        name: 'vast-multiverse',
        start: 11,
        end: 36,
        trimStart: 29.5,
        volume: [
          [0, 0, 32],
          [1, 32, 41.5],
          [0, 41.5, ]
        ],
        layer: 'background',
        fit: 'fill' as 'fill',
        z: -2,
      } as ITimelineFileAction]
    },
    {
      id: idFunc(),
      name: 'tunnel alpha',
      src: '/static/video-editor/background-alpha.webm',
      controller: Controllers['video'],
      actions: [{
        name: 'background-alpha',
        start: 0,
        end: 15.3,
        trimStart: 1,
        loop: false,
        layer: 'background',
        fit: 'fill' as 'fill',
        z: -1,
      }]
    },
    {
      id: idFunc(),
      name: 'sui logo',
      src: '/static/video-editor/stoked-ui.webm',
      controller: Controllers['video'],
      actions: [{
        name: 'stoked-ui',
        start: 0,
        end: 12,
      }]
    },
    {
      id: idFunc(),
      name: 'sui reverse logo',
      src: '/static/video-editor/stoked-ui-reverse.webm',
      controller: Controllers['video'],
      actions: [{
        name: 'stoked-ui-reverse',
        start: 35.7,
        end: 40,
        volume: [[0.5, 0,]],
      }]
    },
    {
      id: idFunc(),
      name: 'Funeral - Adam Rodgers',
      src: '/static/timeline/docs/overview/funeral.m4a',
      controller: Controllers['audio'],
      actions: [{
        name: 'funeral',
        start: 3,
        end: 37.6,
        trimStart: .5,
        volume: [[0, 14, 20.5], [4, 20.5,],],
      }]
    },
  ]
});

export default function EditorHero({ id, sx }: { id: string, sx?: SxProps}) {
  return (
    <Fade in timeout={700}>
      <div style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
      <Card
        sx={[(theme) => ({
          minWidth: 280,
          maxWidth: '100%',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
        }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <EditorProvider id={id ? id : 'editor-hero-demo'} controllers={Controllers} file={videoFile} >
          <Editor sx={sx ? sx : { borderRadius: '12px 12px 0 0' }}/>
        </EditorProvider>
      </Card>
      </div>
    </Fade>
  );
}


