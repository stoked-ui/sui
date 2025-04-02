import * as React from 'react';
import Editor, { Controllers, EditorProvider } from '@stoked-ui/editor';

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;


export default function CoreDemo() {
  return (
    <EditorProvider id={'core-demo'} controllers={Controllers} >
      <Editor id='video-editor' sx={{ borderRadius: '12px 12px 0 0' }} fileUrl={'/static/editor/stoked-ui.sue'} />
    </EditorProvider>
  );
};


