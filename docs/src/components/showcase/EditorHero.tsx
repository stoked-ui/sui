import * as React from 'react';
import Editor from '@stoked-ui/editor';
import { cloneDeep } from 'lodash';
import Fade from "@mui/material/Fade";
import {Card} from "@mui/material";
import {alpha} from "@mui/material/styles";
import {SxProps} from "@mui/system";
import { TimelineFile, ITimelineFileAction } from "@stoked-ui/timeline";

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const data = [
  {
    name: 'vast-multiverse',
    start: 11,
    end: 36,
    trimStart: 29.5,
    volume: [
      [0, 0, 32],
      [1, 32, 41.5],
      [0, 41.5, ]
    ],
    controllerName: 'video',  // Use the new video effect
    src: '/static/video-editor/vast-multiverse.mp4',
    layer: 'background',
    fit: 'fill' as 'fill',
    z: -2,
  },
  {
    name: 'background-alpha',
    start: 0,
    end: 15.3,
    trimStart: 1,
    loop: false,
    controllerName: 'video',  // Use the new video effect
    src: '/static/video-editor/background-alpha.webm',
    layer: 'background',
    fit: 'fill' as 'fill',
    z: -1,
  },
  {
    name: 'stoked-ui',
    start: 0,
    end: 12,
    loop: false,
    controllerName: 'video',  // Use the new video effect
    src: '/static/video-editor/stoked-ui.webm',
  },
  {
    name: 'stoked-ui-reverse',
    start: 35.7,
    end: 41,
    volume: [[0.5, 0, ]],
    loop: false,
    controllerName: 'video',  // Use the new video effect
    src: '/static/video-editor/stoked-ui-reverse.webm',
  },
  {
    name: 'funeral',
    start: 3,
    end: 37.6,
    trimStart: .5,
    volume: [
      [0, 14, 20.5],
      [2, 20.5, ],
    ],
    controllerName: 'audio',
    src: '/static/timeline/docs/overview/funeral.m4a',
  },
];

const videoFileData = cloneDeep(data);

const props = {
  name: 'Stoked UI - Multiverse',
  description: 'demonstratnig the stoked-ui/editor features',
  author: 'Brian Stoker',
  created: 1729783494563,
  backgroundColor: '#000',
  actionData: videoFileData as ITimelineFileAction[],
};

const videoFile = new TimelineFile(props);

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
        <Editor id={id ? id : 'editor-hero-demo'} sx={sx ? sx : { borderRadius: '12px 12px 0 0' }} file={videoFile} />
      </Card>
      </div>
    </Fade>
  );
}


