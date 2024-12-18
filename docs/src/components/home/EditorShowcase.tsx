import * as React from 'react';
import Box from '@mui/material/Box';
import Editor, { Controllers, EditorProvider } from '@stoked-ui/editor';
import ShowcaseContainer from 'docs/src/components/home/ShowcaseContainer';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';

const code   = `
import * as React from 'react';
import Editor from '@stoked-ui/editor';
import { cloneDeep } from 'lodash';
import { ITimelineAction }from '@stoked-ui/timeline'

const defaultEditorData = cloneDeep(actions);

export default function EditorDemo() {
  return (
     <EditorProvider id={'editor-hero-demo'} controllers={Controllers} >
      <Editor id='editor-demo' sx={{ borderRadius: '12px 12px 0 0' }} fileUrl={'/static/editor/stoked-ui.sue'}/>
    </EditorProvider>
  );
};`

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

function EditorDemo() {
  return (
    <EditorProvider id={'editor-hero-demo'} controllers={Controllers} >
      <Editor id='editor-demo' sx={{ borderRadius: '12px 12px 0 0' }} fileUrl={'/static/editor/stoked-ui.sue'}  />
    </EditorProvider>
  );
}

export default function EditorShowcase() {
  return (
    <ShowcaseContainer id={'editor-showcase'}
      preview={
        <EditorDemo/>
      }
      code={
        <Box
          id={'editor-showcase-codep'}
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
