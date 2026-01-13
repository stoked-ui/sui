import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NoSsr from '@mui/material/NoSsr';
import { SxProps } from '@mui/system';
import {
  EditorProvider,
  Editor,
  Controllers,
  createEditorFile,
  EditorVideoExampleProps,
} from '@stoked-ui/editor';
import VideoProcessingProgress from './VideoProcessingProgress';
import {
  VideoProcessingSimulator,
  ProcessingProgress,
} from '../../services/VideoProcessingSimulator';

interface EditorBackendProcessingDemoProps {
  id: string;
  sx?: SxProps;
}

interface DemoState extends ProcessingProgress {
  isProcessing: boolean;
}

const initialState: DemoState = {
  isProcessing: false,
  stage: 'upload',
  progress: 0,
  currentStage: 1,
  statusMessage: '',
  complete: false,
};

function EditorRaw({ id }: { id: string }) {
  const file = createEditorFile({
    ...EditorVideoExampleProps,
    name: 'Stoked UI - Video Multiverse',
  });

  return (
    <Editor
      id={id}
      file={file}
      name="backend-processing-demo"
      sx={{
        width: '100%',
        height: 600,
        '& .MuiEditor-root': {
          borderRadius: 0,
        },
      }}
    />
  );
}

export default function EditorBackendProcessingDemo({
  id,
  sx,
}: EditorBackendProcessingDemoProps) {
  const [state, setState] = React.useState<DemoState>(initialState);
  const simulatorRef = React.useRef<VideoProcessingSimulator | null>(null);

  const handleProgressUpdate = React.useCallback((progress: ProcessingProgress) => {
    setState((prev) => ({
      ...prev,
      ...progress,
    }));
  }, []);

  const startProcessing = React.useCallback(() => {
    // Cancel any existing simulation
    if (simulatorRef.current) {
      simulatorRef.current.cancel();
    }

    // Reset state
    setState({
      ...initialState,
      isProcessing: true,
    });

    // Create and start new simulation
    const simulator = new VideoProcessingSimulator(handleProgressUpdate, {
      uploadDuration: 2000,
      processingDuration: 4000,
      s3Duration: 1000,
      downloadDuration: 2000,
    });
    simulatorRef.current = simulator;
    simulator.start();
  }, [handleProgressUpdate]);

  const handleClose = React.useCallback(() => {
    if (simulatorRef.current) {
      simulatorRef.current.cancel();
      simulatorRef.current = null;
    }
    setState(initialState);
  }, []);

  const handleRetry = React.useCallback(() => {
    startProcessing();
  }, [startProcessing]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.cancel();
      }
    };
  }, []);

  return (
    <Box sx={sx}>
      <Fade in timeout={700}>
        <Card
          sx={{
            position: 'relative',
            overflow: 'visible',
            boxShadow: (theme) => theme.shadows[8],
          }}
        >
          <NoSsr>
            <EditorProvider controllers={Controllers}>
              <EditorRaw id={id} />
            </EditorProvider>
          </NoSsr>

          {/* Process Video Button */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CloudUploadIcon />}
              onClick={startProcessing}
              disabled={state.isProcessing && !state.complete}
              sx={{
                boxShadow: (theme) => theme.shadows[4],
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
            >
              {state.complete ? 'Process Another Video' : 'Process Video'}
            </Button>
          </Box>
        </Card>
      </Fade>

      {/* Processing Modal */}
      <Modal
        open={state.isProcessing}
        onClose={state.complete ? handleClose : undefined}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={state.isProcessing}>
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 0,
              outline: 'none',
              maxWidth: 650,
              width: '90%',
            }}
          >
            <VideoProcessingProgress
              stage={state.stage}
              progress={state.progress}
              currentStage={state.currentStage}
              statusMessage={state.statusMessage}
              error={state.error}
              onRetry={handleRetry}
              complete={state.complete}
            />
            {state.complete && (
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
