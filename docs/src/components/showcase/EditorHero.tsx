import * as React from 'react';
import Editor, {
  Controllers, EditorFile, EditorProvider, IEditorFile, IEditorFileProps
} from '@stoked-ui/editor';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import Fade from "@mui/material/Fade";
import Fab from "@mui/material/Fab";
import { Card } from "@mui/material";
import {alpha} from "@mui/material/styles";
import {SxProps} from "@mui/system";
import {NoSsr} from "@mui/base/NoSsr";
import {
  createFile,
  EditorVideoExampleProps,
  EditorAudioExampleProps
} from "./ExampleShowcaseFiles";

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

function EditorHeroGuts({ id, sx }: { id: string, sx?: SxProps}) {
  const [loadedFile, setLoadedFile] = React.useState<IEditorFile | undefined>();

  const loadEditorFile = async () => {
    const editorFile = await createFile<IEditorFileProps, EditorFile>(EditorVideoExampleProps, EditorFile);
    setLoadedFile(editorFile);
  }

  const loadTimelineFile = async () => {
    const timelineFile = await createFile<IEditorFileProps, EditorFile>(EditorAudioExampleProps as IEditorFileProps, EditorFile);
    setLoadedFile(timelineFile);
  }

  React.useEffect(() => {
    loadEditorFile().then(() => {});
  }, []);

  return (
    <Editor
      id={id}
      sx={sx || { borderRadius: '12px 12px 0 0' }}
      fileUrl={'/static/editor/stoked-ui.sue'}
      viewButtonAppear={10000}
      viewButtonEnter={1000}
      viewButtonExit={100}
      viewButtons={[
        <Fab
          color={'primary'}
          size="large"
          sx={{
            position: 'absolute',
            top: '0px',
            right: '50%',
            margin: '8px',
          }}
          onClick={loadTimelineFile}
        >
          <AudioFileIcon />
        </Fab>,
        <Fab
          color={'primary'}
          size="large"
          sx={{
            position: 'absolute',
            top: '0px',
            left: '50%',
            right: '50%',
            margin: '8px',
          }}
          onClick={loadEditorFile}
        >
          <VideoFileIcon />
        </Fab>
      ]}
    />);
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
            <EditorHeroGuts id={id} sx={sx} />
          </EditorProvider>
        </NoSsr>
      </Card>
      </div>
    </Fade>
  );
}


