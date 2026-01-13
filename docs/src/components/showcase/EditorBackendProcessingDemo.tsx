import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
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
  simulateError: boolean;
  errorStage: 'upload' | 'processing' | 's3' | 'download';
}

const initialState: DemoState = {
  isProcessing: false,
  stage: 'upload',
  progress: 0,
  currentStage: 1,
  statusMessage: '',
  complete: false,
  simulateError: false,
  errorStage: 'processing',
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

    // Reset state but preserve error simulation settings
    setState((prev) => ({
      ...initialState,
      isProcessing: true,
      simulateError: prev.simulateError,
      errorStage: prev.errorStage,
    }));

    // Create and start new simulation
    const simulator = new VideoProcessingSimulator(handleProgressUpdate, {
      uploadDuration: 2000,
      processingDuration: 4000,
      s3Duration: 1000,
      downloadDuration: 2000,
      simulateError: state.simulateError,
      errorStage: state.errorStage,
      errorMessage: `${state.errorStage.charAt(0).toUpperCase() + state.errorStage.slice(1)} failed: Network timeout. Please check your connection and try again.`,
    });
    simulatorRef.current = simulator;
    simulator.start();
  }, [handleProgressUpdate, state.simulateError, state.errorStage]);

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

          {/* Error Simulation Controls */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1000,
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 1,
              boxShadow: (theme) => theme.shadows[4],
              minWidth: 250,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Error Simulation
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.simulateError}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      simulateError: e.target.checked,
                    }))
                  }
                  disabled={state.isProcessing && !state.complete}
                />
              }
              label="Simulate error"
            />
            {state.simulateError && (
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <Select
                  value={state.errorStage}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      errorStage: e.target.value as typeof state.errorStage,
                    }))
                  }
                  disabled={state.isProcessing && !state.complete}
                >
                  <MenuItem value="upload">Upload Stage</MenuItem>
                  <MenuItem value="processing">Processing Stage</MenuItem>
                  <MenuItem value="s3">S3 Storage Stage</MenuItem>
                  <MenuItem value="download">Download Stage</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>

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
        aria-labelledby="processing-modal-title"
        aria-describedby="processing-modal-description"
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
