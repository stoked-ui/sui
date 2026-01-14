import * as React from 'react';
import Editor, { Controllers, EditorProvider, createEditorFile, EditorVideoExampleProps } from '@stoked-ui/editor';

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export default function CoreDemo() {
  const file = React.useMemo(() => createEditorFile({
    ...EditorVideoExampleProps,
    name: 'Stoked UI - Video Editor Demo',
  }), []);

  return (
    <EditorProvider id={'core-demo'} controllers={Controllers}>
      <Editor
        id="video-editor"
        file={file}
        sx={{ borderRadius: '12px 12px 0 0' }}
      />
    </EditorProvider>
  );
}
