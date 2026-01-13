import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VideoSettingsIcon from '@mui/icons-material/VideoSettings';
import CloudIcon from '@mui/icons-material/Cloud';
import DownloadIcon from '@mui/icons-material/Download';
import { alpha } from '@mui/material/styles';

export type ProcessingStage = 'upload' | 'processing' | 's3' | 'download';

export interface VideoProcessingProgressProps {
  /** Current processing stage */
  stage: ProcessingStage;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current stage number (1-4) */
  currentStage: number;
  /** Status message to display */
  statusMessage: string;
  /** Error message if processing failed */
  error?: string;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Whether processing is complete */
  complete?: boolean;
}

const stageConfig = {
  upload: {
    icon: CloudUploadIcon,
    label: 'Upload',
    color: '#1976d2',
  },
  processing: {
    icon: VideoSettingsIcon,
    label: 'Processing',
    color: '#9c27b0',
  },
  s3: {
    icon: CloudIcon,
    label: 'S3 Storage',
    color: '#ed6c02',
  },
  download: {
    icon: DownloadIcon,
    label: 'Download',
    color: '#2e7d32',
  },
};

export default function VideoProcessingProgress({
  stage,
  progress,
  currentStage,
  statusMessage,
  error,
  onRetry,
  complete = false,
}: VideoProcessingProgressProps) {
  const stages: ProcessingStage[] = ['upload', 'processing', 's3', 'download'];
  const config = stageConfig[stage];
  const StageIcon = config.icon;

  return (
    <Card
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 2,
        boxShadow: (theme) => theme.shadows[8],
      }}
    >
      <CardContent>
        {/* Stage Indicators */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          {stages.map((stageKey, index) => {
            const StageIconComponent = stageConfig[stageKey].icon;
            const stageNumber = index + 1;
            const isActive = stageNumber === currentStage;
            const isComplete = stageNumber < currentStage || complete;
            const stageColor = stageConfig[stageKey].color;

            return (
              <Box
                key={stageKey}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                  '&:not(:last-child)::after': {
                    content: '""',
                    position: 'absolute',
                    top: 20,
                    left: '60%',
                    width: '80%',
                    height: 2,
                    bgcolor: isComplete ? stageColor : 'divider',
                    transition: 'background-color 0.3s',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isComplete
                      ? stageColor
                      : isActive
                        ? alpha(stageColor, 0.1)
                        : 'background.paper',
                    border: 2,
                    borderColor: isComplete || isActive ? stageColor : 'divider',
                    transition: 'all 0.3s',
                    zIndex: 1,
                  }}
                >
                  {isComplete ? (
                    <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
                  ) : (
                    <StageIconComponent
                      sx={{
                        color: isActive ? stageColor : 'text.disabled',
                        fontSize: 20,
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    color: isActive ? stageColor : 'text.secondary',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.3s',
                  }}
                >
                  {stageConfig[stageKey].label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Current Stage Info */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <StageIcon sx={{ color: config.color, fontSize: 24 }} />
            <Typography variant="h6" sx={{ color: config.color, fontWeight: 600 }}>
              Stage {currentStage}/4
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {statusMessage}
          </Typography>
        </Box>

        {/* Progress Bar */}
        {!error && !complete && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: config.color }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: (theme) => alpha(config.color, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: config.color,
                  borderRadius: 4,
                  transition: 'transform 0.4s ease',
                },
              }}
            />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
              borderRadius: 1,
              border: 1,
              borderColor: 'error.main',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ErrorIcon color="error" />
              <Typography variant="subtitle2" color="error" fontWeight={600}>
                Processing Failed
              </Typography>
            </Box>
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            {onRetry && (
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={onRetry}
                fullWidth
              >
                Retry Processing
              </Button>
            )}
          </Box>
        )}

        {/* Success State */}
        {complete && !error && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
              borderRadius: 1,
              border: 1,
              borderColor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle2" color="success.main" fontWeight={600}>
                Processing Complete
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your video is ready for download
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
