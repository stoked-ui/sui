import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Stack,
  Paper,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

export interface TalkTabProps {
  voiceState: 'idle' | 'listening' | 'speaking';
  onToggleVoice: () => void;
  voiceLogs: string[];
  agentColor?: string;
  className?: string;
}

const TalkTab: React.FC<TalkTabProps> = ({
  voiceState,
  onToggleVoice,
  voiceLogs,
  agentColor,
  className,
}) => {
  const isActive = voiceState !== 'idle';
  const micColor = voiceState === 'listening' ? 'primary' : voiceState === 'speaking' ? 'secondary' : 'default';

  return (
    <Box
      data-testid="talk-tab"
      className={className}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Typography variant="h5">Voice Communication</Typography>

      <Stack direction="row" alignItems="center" spacing={3}>
        {/* Visualizer rings */}
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: 120 - i * 20,
                height: 120 - i * 20,
                borderRadius: '50%',
                border: `2px solid ${isActive ? (agentColor || 'primary.main') : 'text.disabled'}`,
                opacity: isActive ? 0.8 - i * 0.2 : 0.3,
                animation: isActive ? `pulse 2s infinite ${i * 0.3}s` : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                },
              }}
            />
          ))}

          {/* Frequency bars */}
          {isActive && (
            <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', bottom: -30 }}>
              {Array.from({ length: 15 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 4,
                    height: Math.random() * 40 + 10,
                    backgroundColor: agentColor || 'primary.main',
                    animation: `barMove ${0.5 + Math.random() * 1}s infinite ${i * 0.05}s`,
                    '@keyframes barMove': {
                      '0%, 100%': { height: Math.random() * 20 + 10 },
                      '50%': { height: Math.random() * 40 + 20 },
                    },
                  }}
                />
              ))}
            </Stack>
          )}

          {/* Mic button */}
          <IconButton
            data-testid="talk-mic-button"
            size="large"
            color={micColor}
            onClick={onToggleVoice}
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 3,
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            {isActive ? <MicIcon fontSize="large" /> : <MicOffIcon fontSize="large" />}
          </IconButton>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Status: {voiceState.charAt(0).toUpperCase() + voiceState.slice(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {voiceState === 'idle' && 'Press the mic button to start'}
            {voiceState === 'listening' && 'Listening for voice input...'}
            {voiceState === 'speaking' && 'Speaking response...'}
          </Typography>
        </Box>
      </Stack>

      {/* Console feed */}
      {voiceLogs.length > 0 && (
        <Paper
          sx={{
            p: 2,
            width: '100%',
            maxHeight: 200,
            overflow: 'auto',
            backgroundColor: 'background.default',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        >
          {voiceLogs.map((log, index) => (
            <Box
              key={index}
              data-testid={`talk-log-${index}`}
              sx={{ color: 'text.primary', mb: 0.5 }}
            >
              {`> ${log}`}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default TalkTab;
