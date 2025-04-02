import * as React from 'react';
import Editor, {
  Controllers, EditorFile, EditorProvider, IEditorFileProps,
  useEditorContext,
} from '@stoked-ui/editor';
import Fade from "@mui/material/Fade";
import { Card } from "@mui/material";
import {alpha} from "@mui/material/styles";
import {SxProps} from "@mui/system";
import {NoSsr} from "@mui/base/NoSsr";
import {createEditorFile, EditorVideoExampleProps} from './ExampleShowcaseFiles';

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

function EditorRaw({ id, sx}: { id: string, sx?: SxProps }) {
  const { dispatch } = useEditorContext();
    React.useEffect(() => {
    createEditorFile<IEditorFileProps, EditorFile>(EditorVideoExampleProps, EditorFile, id).then((editorFile) => {
      dispatch({ type: 'SET_FILE', payload: editorFile })
        });
  }, [])

  return  <Editor
    id={id}
    sx={sx || { borderRadius: '12px 12px 0 0' }}
    viewButtonAppear={10000}
    viewButtonEnter={1000}
    viewButtonExit={100}
  />
}
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
          borderColor: '#BBB',
          boxShadow: `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
        }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <NoSsr>
          <EditorProvider controllers={Controllers}>
            <EditorRaw id={id} />
          </EditorProvider>
        </NoSsr>
      </Card>
      </div>
    </Fade>
  );
}



