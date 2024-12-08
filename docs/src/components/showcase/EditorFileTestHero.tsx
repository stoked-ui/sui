import * as React from 'react';
import {
  App, AppFile,
  AppFileFactory,
  AppOutputFile,
  AppOutputFileFactory,
  MimeRegistry,
  WebFile,
  WebFileFactory,
  SUIMime,
  MediaFile
} from "@stoked-ui/media-selector";
import {Controllers, EditorProvider, IEditorFile} from '@stoked-ui/editor';
import Stack from '@mui/material/Stack';
import Fade from "@mui/material/Fade";
import {Button, Card} from "@mui/material";
import {SxProps} from "@mui/system";
import Typography from '@mui/material/Typography';
import {styled} from "@mui/styles";
import Plyr from "plyr-react";
import {alpha} from "@mui/material/styles";
import { default as EditorFileTest } from './EditorFileTest'
import CreateAudioFile from "./EditorFileTest";


const Widget = styled('div')(({ theme }) => ({
  padding: 16,
  borderRadius: 16,
  width: 343,
  maxWidth: '100%',
  margin: 'auto',
  position: 'relative',
  zIndex: 1,
  backgroundColor: 'rgba(255,255,255,0.4)',
  backdropFilter: 'blur(40px)',
}));

const CoverImage = styled('div')({
  width: 100,
  height: 100,
  objectFit: 'cover',
  overflow: 'hidden',
  flexShrink: 0,
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.08)',
  '& > img': {
    width: '100%',
  },
});

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});



export function AudioPlayer({ editorFile, title, id }: { id: string, title: string,  editorFile?: IEditorFile }) {

  const [audioData, setAudioData] = React.useState<{ audio: string, type: string, duration: number, img?: string }>({ audio: 'https://localhost:5199/static/editor/paranoid-android.mp3', type: 'audio/mpeg3', duration: 200});
  const ref = React.useRef<HTMLDivElement>(null);
  console.log('audioData', audioData)


  React.useEffect(() => {

  }, [])

  if (!audioData?.audio || !audioData.type) {
    return null;
  }
  const audioSource:  Plyr.SourceInfo = {
    type: 'audio',
    sources: [
      {
        src: '', // Replace with your audio selectedFile URL
      },
    ],
  };

  return (
    <Stack direction={'row'}>
      <Widget id={id} ref={ref}>
        <Button onClick={saveFile} >derp</Button>
        <div style={{ marginLeft: '30px' }}>{title}</div>
        <Plyr  source={audioSource} title={title} options={{ controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume'] }} />
      </Widget>
    </Stack>
  );
}


function EditorFileTestHero({ id, sx }: { id: string, sx?: SxProps}) {
  const [fromBlob, setFromBlob] = React.useState<IEditorFile>();

  // const paranoidAndroid = ;
  //const [current, setCurrent] = React.useState<IEditorFile>(paranoidAndroid);

  React.useEffect(() => {

    const funeral = CreateAudioFile('Funeral', 'Adam Rodgers');

    const process = async () => {
      // setCurrent(funeral);
      // const blob = await current.createBlob(true, SUIEditor);
      // console.info('blob created', blob);

    }
    process().then(() => {
      console.info('blob created');
    })

  }, []);

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
        <EditorProvider controllers={Controllers} >
          <AudioPlayer id={'initial'} title={'initial'} editorFile={CreateAudioFile('Paranoid Android', 'Radiohead')}/>
          <AudioPlayer id={'fromBlob'} title={'from blob'} editorFile={fromBlob}/>
        </EditorProvider>
      </Card>
      </div>
    </Fade>
  );
}
export default EditorFileTestHero;
// file={EditorExample}

