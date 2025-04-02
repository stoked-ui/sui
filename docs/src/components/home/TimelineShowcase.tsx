import * as React from 'react';
import Box from '@mui/material/Box';
import {SxProps} from "@mui/system";
import Timeline, {
  TimelineFile,
  ITimelineFileProps,
  TimelineProvider, ITimelineFile
} from "@stoked-ui/timeline";
import ShowcaseContainer from 'docs/src/components/home/ShowcaseContainer';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';
import {
  createTimelineFile, EditorAudioExampleProps
} from "../showcase/ExampleShowcaseFiles";


const code = `

  return (
    <TimelineProvider>
      <Timeline sx={{width:'100%'}} id={'timeline-showcase'} file={TimelineExample} />
    </TimelineProvider>
  );
};`

function TimelineEditorDemo({sx}: {sx: SxProps}) {
  const [loadedFile, setLoadedFile] = React.useState<ITimelineFile | undefined>();

  const id = 'timeline-showcase';

  const loadTimelineFile = async () => {
    const timelineFile = await createTimelineFile<ITimelineFileProps, TimelineFile>(EditorAudioExampleProps as ITimelineFileProps, TimelineFile, id);
    setLoadedFile(timelineFile);
  }

  React.useEffect(() => {
    loadTimelineFile().then(() => {});
  }, []);

  return (
    <TimelineProvider  >
      <Timeline sx={sx} id={id} file={loadedFile} />
    </TimelineProvider>
  );
};

export default function TimelineShowcase() {
  const sx: SxProps = { height: 'fit-content', flexGrow: 1, width: '100%', overflowY: 'auto', };
  return (
    <ShowcaseContainer
      id={'timeline-showcase'}
      preview={
        <TimelineEditorDemo sx={sx}/>
      }
      demoSx={{ p: 0 }}
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

