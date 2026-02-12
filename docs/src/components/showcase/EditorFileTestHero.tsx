import * as React from 'react';
import {Controllers, EditorProvider, IEditorFile} from '@stoked-ui/editor';
import Stack from '@mui/material/Stack';
import Fade from "@mui/material/Fade";
import {Button, Card} from "@mui/material";
import {SxProps} from "@mui/system";
import {styled} from "@mui/styles";
import {alpha} from "@mui/material/styles";
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

export function AudioPlayer({ title, id }: { id: string, title: string,  editorFile?: IEditorFile }) {

  const [audioData] = React.useState<{ audio: string, type: string, duration: number, img?: string }>({ audio: 'https://localhost:5199/static/editor/paranoid-android.mp3', type: 'audio/mpeg3', duration: 200});
  const ref = React.useRef<HTMLDivElement>(null);
  console.log('audioData', audioData)

  if (!audioData?.audio || !audioData.type) {
    return null;
  }

  return (
    <Stack direction={'row'}>
      <Widget id={id} ref={ref}>
        <Button>derp</Button>
        <div style={{ marginLeft: '30px' }}>{title}</div>
      </Widget>
    </Stack>
  );
}


function EditorFileTestHero({ id, sx }: { id: string, sx?: SxProps}) {

  React.useEffect(() => {
    CreateAudioFile('Funeral', 'Adam Rodgers');

    const process = async () => {
      // placeholder for future processing
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
          <AudioPlayer id={'fromBlob'} title={'from blob'}/>
        </EditorProvider>
      </Card>
      </div>
    </Fade>
  );
}
export default EditorFileTestHero;
// file={EditorExample}

