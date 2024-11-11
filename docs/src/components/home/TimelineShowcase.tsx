import * as React from 'react';
import Box from '@mui/material/Box';
import ShowcaseContainer from 'docs/src/components/home/ShowcaseContainer';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';
import {SxProps} from "@mui/system";
import Timeline, { AudioController, TimelineProvider } from "@stoked-ui/timeline";
import TimelineExample from "../showcase/TimelineExample";


const code = `

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


  return (
    <TimelineProvider id={'timeline-showcase'} controllers={{ audio: AudioController}} file={TimelineExample} >
      <Timeline sx={{width:'100%'}}/>
    </TimelineProvider>
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
