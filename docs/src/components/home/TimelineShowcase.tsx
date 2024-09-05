import * as React from 'react';
import Box from '@mui/material/Box';
import ShowcaseContainer from 'docs/src/components/home/ShowcaseContainer';
import HighlightedCode from '@stoked-ui/docs/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';
import {FileExplorer} from "@stoked-ui/file-explorer";
import {SxProps} from "@mui/system";
import {ITimelineActionType, Timeline, TimelineTrack} from "@stoked-ui/timeline";
import { getDynamicFiles } from '../fileExplorer/data';


const code = `

const tracks: TimelineTrack[] = [
  {
    id: '0',
    actions: [
      {
        id: 'action00',
        start: 0,
        end: 2,
        effectId: 'effect0',
      },
    ],
  },
  {
    id: '1',
    actions: [
      {
        id: 'action10',
        start: 1.5,
        end: 5,
        effectId: 'effect1',
      },
    ],
  },
  {
    id: '2',
    actions: [
      {
        id: 'action20',

        start: 1,
        end: 4,
        effectId: 'effect0',
      },
    ],
  },
  {
    id: '3',
    actions: [
      {
        id: 'action30',
        start: 0.5,
        end: 7,
        effectId: 'effect1',
      },
      {
        id: 'action31',
        start: 10,
        end: 12,
        effectId: 'effect1',
      },
    ],
  },
  {
    id: '4',
    actions: [
      {
        id: 'action40',
        start: 1,
        end: 2,
        effectId: 'effect0',
      },
    ],
  },
  {
    id: '5',
    actions: [
      {
        id: 'action50',
        start: 2.5,
        end: 6,
        effectId: 'effect1',
      },
    ],
  },
];


export default function TimelineEditorDemo() {
  const actionTypes: Record<string, ITimelineActionType> = {
    effect: {
      enter: params => { console.log(params); },
      leave: params => { console.log(params); },
    }
  };
  const theme = useTheme();
  console.log('theme', theme);
  return (
    <Timeline tracks={tracks} sx={{width:'100%'}}  actionTypes={actionTypes}/>
  );
};`

function TimelineEditorDemo() {
  const tracks: TimelineTrack[] = [
    {
      id: '0',
      actions: [
        {
          id: 'action00',
          start: 0,
          end: 2,
          effectId: 'effect0',
        },
      ],
    },
    {
      id: '1',
      actions: [
        {
          id: 'action10',
          start: 1.5,
          end: 5,
          effectId: 'effect1',
        },
      ],
    },
    {
      id: '2',
      actions: [
        {
          id: 'action20',

          start: 1,
          end: 4,
          effectId: 'effect0',
        },
      ],
    },
    {
      id: '3',
      actions: [
        {
          id: 'action30',
          start: 0.5,
          end: 7,
          effectId: 'effect1',
        },
        {
          id: 'action31',
          start: 10,
          end: 12,
          effectId: 'effect1',
        },
      ],
    },
    {
      id: '4',
      actions: [
        {
          id: 'action40',
          start: 1,
          end: 2,
          effectId: 'effect0',
        },
      ],
    },
    {
      id: '5',
      actions: [
        {
          id: 'action50',
          start: 2.5,
          end: 6,
          effectId: 'effect1',
        },
      ],
    },
  ];
  const actionTypes: Record<string, ITimelineActionType> = {
    effect: {
      enter: params => { console.log(params); },
      leave: params => { console.log(params); },
    }
  };
  return (
    <Timeline tracks={tracks} sx={{width:'100%'}}  actionTypes={actionTypes}/>
  );
};

export default function FileExplorerShowcase() {
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
