import React, { useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Avatar,
  Paper,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import type { ChatMessage } from '../../../types';

export interface ChatTabProps {
  messages: ChatMessage[];
  pending?: boolean;
  loading?: boolean;
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onSend: () => void;
  selectedAgentName?: string;
  bottomRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  pending = false,
  loading = false,
  chatInput,
  onChatInputChange,
  onSend,
  selectedAgentName,
  bottomRef,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && 'scrollIntoView' in messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatInput.trim()) {
        onSend();
      }
    }
  };

  const handleSend = () => {
    if (chatInput.trim()) {
      onSend();
    }
  };

  return (
    <Box
      data-testid="chat-tab"
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {messages.map((msg) => (
              <Paper
                key={msg.id}
                data-testid={`chat-message-${msg.id}`}
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user'
                    ? 'primary.dark'
                    : msg.failed
                    ? 'error.dark'
                    : 'background.paper',
                  border: 1,
                  borderColor: msg.role === 'user'
                    ? 'primary.main'
                    : msg.failed
                    ? 'error.main'
                    : 'divider',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  {msg.role === 'user' ? (
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  ) : (
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                      <SmartToyIcon fontSize="small" />
                    </Avatar>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {msg.role === 'user' ? 'You' : msg.agentName || selectedAgentName || 'Agent'}
                    {' • '}
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
              </Paper>
            ))}

            {pending && (
              <Box
                data-testid="chat-typing-indicator"
                sx={{
                  alignSelf: 'flex-start',
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={0.5}>
                  {[1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        animation: `pulse 1.4s infinite ${i * 0.2}s`,
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 0.4 },
                          '50%': { opacity: 1 },
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'background.default',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            data-testid="chat-input"
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            disabled={loading}
          />
          <Button
            data-testid="chat-send"
            variant="contained"
            onClick={handleSend}
            disabled={!chatInput.trim() || loading}
            sx={{ minWidth: 'auto', px: 2, height: 56 }}
          >
            <SendIcon />
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default ChatTab;
