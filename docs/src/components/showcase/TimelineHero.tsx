import * as React from 'react';
import Fade from "@mui/material/Fade";
import {Card} from "@mui/material";
import {alpha} from "@mui/material/styles";
import {SxProps} from "@mui/system";
import {IController, Timeline} from "@stoked-ui/timeline";

export default function TimelineHero(props: { id: string, sx?: SxProps}) {
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
        <Timeline id={props.id} actionData={actions} sx={{width:'100%'}} controllers={controllers}/>
      </Card>
    </Fade>
  );
}


