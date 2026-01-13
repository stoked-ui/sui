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
import VideoProcessingProgress, {
  ProcessingStage,
} from './VideoProcessingProgress';

interface EditorBackendProcessingDemoProps {
  id: string;
  sx?: SxProps;
}

interface ProcessingState {
  isProcessing: boolean;
  stage: ProcessingStage;
  progress: number;
  currentStage: number;
  statusMessage: string;
  error?: string;
  complete: boolean;
}

const initialState: ProcessingState = {
  isProcessing: false,
  stage: 'upload',
  progress: 0,
  currentStage: 1,
  statusMessage: '',
  error: undefined,
  complete: false,
};

const stageMessages = {
  upload: 'Uploading video to backend server...',
  processing: 'Processing video with FFmpeg on AWS ECS...',
  s3: 'Storing processed video in S3...',
  download: 'Preparing download link...',
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
  const [state, setState] = React.useState<ProcessingState>(initialState);

  const startProcessing = () => {
    setState({
      isProcessing: true,
      stage: 'upload',
      progress: 0,
      currentStage: 1,
      statusMessage: stageMessages.upload,
      error: undefined,
      complete: false,
    });

    // Simulate upload stage (2 seconds)
    let currentProgress = 0;
    const uploadInterval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setState((prev) => ({ ...prev, progress: currentProgress }));
      } else {
        clearInterval(uploadInterval);
        // Move to processing stage
        setState({
          isProcessing: true,
          stage: 'processing',
          progress: 0,
          currentStage: 2,
          statusMessage: stageMessages.processing,
          error: undefined,
          complete: false,
        });

        // Simulate processing stage (4 seconds)
        let processProgress = 0;
        const processInterval = setInterval(() => {
          processProgress += 5;
          if (processProgress <= 100) {
            setState((prev) => ({ ...prev, progress: processProgress }));
          } else {
            clearInterval(processInterval);
            // Move to S3 stage
            setState({
              isProcessing: true,
              stage: 's3',
              progress: 0,
              currentStage: 3,
              statusMessage: stageMessages.s3,
              error: undefined,
              complete: false,
            });

            // Simulate S3 stage (1 second)
            let s3Progress = 0;
            const s3Interval = setInterval(() => {
              s3Progress += 20;
              if (s3Progress <= 100) {
                setState((prev) => ({ ...prev, progress: s3Progress }));
              } else {
                clearInterval(s3Interval);
                // Move to download stage
                setState({
                  isProcessing: true,
                  stage: 'download',
                  progress: 0,
                  currentStage: 4,
                  statusMessage: stageMessages.download,
                  error: undefined,
                  complete: false,
                });

                // Simulate download stage (2 seconds)
                let downloadProgress = 0;
                const downloadInterval = setInterval(() => {
                  downloadProgress += 10;
                  if (downloadProgress <= 100) {
                    setState((prev) => ({ ...prev, progress: downloadProgress }));
                  } else {
                    clearInterval(downloadInterval);
                    // Complete
                    setState((prev) => ({
                      ...prev,
                      complete: true,
                      progress: 100,
                    }));
                  }
                }, 200);
              }
            }, 100);
          }
        }, 200);
      }
    }, 200);
  };

  const handleClose = () => {
    setState(initialState);
  };

  const handleRetry = () => {
    startProcessing();
  };

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
