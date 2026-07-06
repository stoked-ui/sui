import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  TextField,
  CircularProgress,
} from '@mui/material';
import type { ChatSession, ChatMessage } from '../../../types';

export interface SessionsTabProps {
  sessions: ChatSession[];
  selectedSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  transcript?: ChatMessage[] | null;
  onBack?: () => void;
  onSearch?: () => void;
  sessionSearch: string;
  onSessionSearchChange: (v: string) => void;
  onNewSession?: () => void;
  agentName?: string;
  className?: string;
}

const SessionsTab: React.FC<SessionsTabProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  transcript,
  onBack,
  onSearch,
  sessionSearch,
  onSessionSearchChange,
  onNewSession,
  agentName,
  className,
}) => {
  if (selectedSessionId) {
    return (
      <Paper
        className={className}
        data-testid="sessions-tab"
        sx={{
          p: 3,
          bgcolor: '#0b0c10',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          {onBack && (
            <Button
              size="small"
              color="primary"
              onClick={onBack}
              data-testid="sessions-back"
              sx={{ mr: 2 }}
            >
              ← Back to sessions
            </Button>
          )}
          <Typography
            variant="body2"
            fontFamily="monospace"
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            SESSION: {selectedSessionId}
          </Typography>
        </Stack>

        {transcript === null ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : transcript?.length === 0 ? (
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', p: 2 }}>
            No archived transcript for this session.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {transcript?.map((msg) => (
              <Box
                key={msg.id}
                data-testid={`session-msg-${msg.id}`}
                sx={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  p: 2,
                  bgcolor: msg.role === 'user' ? '#1a5fb4' : 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}
                >
                  {msg.timestamp}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {msg.content}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    );
  }

  return (
    <Stack
      className={className}
      data-testid="sessions-tab"
      spacing={3}
      sx={{
        p: 3,
        bgcolor: '#0b0c10',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch?.();
        }}
        sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
      >
        <TextField
          value={sessionSearch}
          onChange={(e) => onSessionSearchChange(e.target.value)}
          placeholder={`Search ${agentName || 'agent'}'s sessions...`}
          size="small"
          data-testid="sessions-search"
          sx={{ flexGrow: 1 }}
        />
        <Button
          type="submit"
          disabled={!sessionSearch.trim()}
          onClick={onSearch}
          data-testid="sessions-search-btn"
          variant="contained"
          size="small"
        >
          Search
        </Button>
      </Box>

      <Typography variant="h6" sx={{ color: '#f1f5f9' }}>
        Prior Sessions
      </Typography>

      {sessions.length === 0 ? (
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          No prior sessions yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {sessions.map((sess) => (
            <Paper
              key={sess.id}
              data-testid={`session-item-${sess.id}`}
              onClick={() => sess.hasTranscript && onSelectSession?.(sess.id)}
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 2,
                cursor: sess.hasTranscript ? 'pointer' : 'default',
                '&:hover': sess.hasTranscript
                  ? { bgcolor: 'rgba(255,255,255,0.04)' }
                  : {},
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.5}>
                  <Typography
                    variant="caption"
                    sx={{ color: sess.active ? '#2ecc71' : 'rgba(255,255,255,0.5)' }}
                  >
                    {sess.active ? 'Active room' : 'Archived room'}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    sx={{ color: 'rgba(255,255,255,0.8)' }}
                  >
                    {sess.id}
                  </Typography>
                </Stack>
                <Stack spacing={0.5} alignItems="flex-end">
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {new Date(sess.startedAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {sess.hasTranscript ? 'view ›' : sess.active ? 'live' : 'no log'}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default SessionsTab;