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
import {EditorFile, IEditorFile, IEditorFileProps} from "@stoked-ui/editor";
import {
  createFile, EditorAudioExampleProps, EditorVideoExampleProps
} from "../showcase/ExampleShowcaseFiles";


const code = `

  return (
    <TimelineProvider>
      <Timeline sx={{width:'100%'}} id={'timeline-showcase'} file={TimelineExample} />
    </TimelineProvider>
  );
};`

function TimelineEditorDemo() {
  const [loadedFile, setLoadedFile] = React.useState<ITimelineFile | undefined>();

  const loadEditorFile = async () => {
    const editorFile = await createFile<ITimelineFileProps, TimelineFile>(EditorVideoExampleProps, TimelineFile);
    setLoadedFile(editorFile);
  }

  const loadTimelineFile = async () => {
    const timelineFile = await createFile<ITimelineFileProps, TimelineFile>(EditorAudioExampleProps as ITimelineFileProps, TimelineFile);
    setLoadedFile(timelineFile);
  }

  React.useEffect(() => {
    loadEditorFile().then(() => {});
  }, []);
  return (
    <TimelineProvider  >
      <Timeline sx={{width:'100%'}} id={'timeline-showcase'} file={loadedFile} />
    </TimelineProvider>
  );
};

export default function TimelineShowcase() {
  const sx: SxProps = { height: 'fit-content', flexGrow: 1, width: '100%', overflowY: 'auto', };
  return (
    <ShowcaseContainer
      id={'timeline-showcase'}
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
