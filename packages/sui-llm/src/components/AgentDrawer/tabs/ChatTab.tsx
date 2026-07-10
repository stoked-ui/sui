import React, { useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Stack,
  Avatar,
  Paper,
  Chip,
  Link,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import type { ChatMessage, ChatAttachment } from '../../../types';

/** A file staged in the composer before send: data URL + name + mime. */
export interface StagedAttachment {
  url: string;
  name: string;
  type: string;
}

export interface ChatTabProps {
  messages: ChatMessage[];
  pending?: boolean;
  loading?: boolean;
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onSend: () => void;
  selectedAgentName?: string;
  bottomRef?: React.RefObject<HTMLDivElement>;
  /** Files staged in the composer (rendered above the input as thumbs/chips). */
  stagedAttachments?: StagedAttachment[];
  /** Called when the operator picks/drops/pastes files to attach. */
  onAttachFiles?: (files: File[]) => void;
  /** Remove a staged attachment by index. */
  onRemoveAttachment?: (index: number) => void;
  /** Override the copy-to-clipboard behavior for a message. Defaults to
   *  navigator.clipboard.writeText(message.content). */
  onCopyMessage?: (message: ChatMessage) => void;
  className?: string;
}

/** Render one persisted attachment: media inline (image/audio/video), anything
 *  else a download chip. `url` is a served href (or a data URL for optimistic). */
const AttachmentView: React.FC<{ attachment: ChatAttachment }> = ({ attachment }) => {
  if (attachment.kind === 'image') {
    return (
      <Link href={attachment.url} target="_blank" rel="noreferrer">
        <Box
          component="img"
          src={attachment.url}
          alt={attachment.name ?? 'image'}
          sx={{
            maxHeight: 192,
            maxWidth: '100%',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            objectFit: 'contain',
          }}
        />
      </Link>
    );
  }
  if (attachment.kind === 'audio') {
    return <Box component="audio" controls src={attachment.url} sx={{ maxWidth: '100%' }} />;
  }
  if (attachment.kind === 'video') {
    return (
      <Box
        component="video"
        controls
        src={attachment.url}
        sx={{ maxHeight: 256, maxWidth: '100%', borderRadius: 1, border: 1, borderColor: 'divider' }}
      />
    );
  }
  return (
    <Chip
      component="a"
      clickable
      icon={<AttachFileIcon />}
      label={attachment.name ?? 'file'}
      href={attachment.url}
      download={attachment.name}
      target="_blank"
      rel="noreferrer"
      variant="outlined"
      size="small"
      sx={{ maxWidth: 260 }}
    />
  );
};

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  pending = false,
  loading = false,
  chatInput,
  onChatInputChange,
  onSend,
  selectedAgentName,
  bottomRef,
  stagedAttachments = [],
  onAttachFiles,
  onRemoveAttachment,
  onCopyMessage,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && 'scrollIntoView' in messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const hasStaged = stagedAttachments.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatInput.trim() || hasStaged) {
        onSend();
      }
    }
  };

  const handleSend = () => {
    if (chatInput.trim() || hasStaged) {
      onSend();
    }
  };

  const handleCopy = (message: ChatMessage) => {
    if (onCopyMessage) {
      onCopyMessage(message);
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(message.content);
    }
  };

  const handlePickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAttachFiles?.(Array.from(e.target.files));
    }
    // Reset so picking the same file again re-fires onChange.
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!onAttachFiles) return;
    const files = Array.from(e.clipboardData.items)
      .filter((it) => it.kind === 'file')
      .map((it) => it.getAsFile())
      .filter((f): f is File => f != null);
    if (files.length > 0) {
      e.preventDefault();
      onAttachFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!onAttachFiles) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      e.preventDefault();
      onAttachFiles(Array.from(e.dataTransfer.files));
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
            {messages.map((msg) => {
              const attachments =
                msg.attachments && msg.attachments.length > 0
                  ? msg.attachments
                  : (msg.images ?? []).map(
                      (url): ChatAttachment => ({ url, kind: 'image' }),
                    );
              return (
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
                    '&:hover [data-testid="chat-copy"]': { opacity: 1 },
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
                    <Box sx={{ flex: 1 }} />
                    <Tooltip title="Copy to clipboard">
                      <IconButton
                        data-testid="chat-copy"
                        aria-label="Copy to clipboard"
                        size="small"
                        onClick={() => handleCopy(msg)}
                        sx={{ opacity: 0, transition: 'opacity 0.15s' }}
                      >
                        <ContentCopyIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  {msg.content && (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  )}
                  {attachments.length > 0 && (
                    <Stack spacing={1} sx={{ mt: msg.content ? 1 : 0 }}>
                      {attachments.map((att, i) => (
                        <AttachmentView key={i} attachment={att} />
                      ))}
                    </Stack>
                  )}
                </Paper>
              );
            })}

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

            <div ref={bottomRef ?? messagesEndRef} />
          </>
        )}
      </Box>

      {/* Staged attachments (any type): image thumb, else a file chip. */}
      {hasStaged && (
        <Stack
          data-testid="chat-staged"
          direction="row"
          spacing={1}
          sx={{ px: 2, pt: 1, flexWrap: 'wrap', gap: 1 }}
        >
          {stagedAttachments.map((a, i) => (
            <Box key={i} sx={{ position: 'relative' }}>
              {a.type.startsWith('image/') ? (
                <Box
                  component="img"
                  src={a.url}
                  alt={a.name}
                  sx={{ height: 48, width: 48, borderRadius: 1, objectFit: 'cover', border: 1, borderColor: 'divider' }}
                />
              ) : (
                <Chip icon={<AttachFileIcon />} label={a.name} size="small" variant="outlined" sx={{ maxWidth: 180 }} />
              )}
              <IconButton
                aria-label="Remove attachment"
                size="small"
                onClick={() => onRemoveAttachment?.(i)}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  p: 0.25,
                }}
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}

      {/* Input (drag a file anywhere over it to attach) */}
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => onAttachFiles && e.preventDefault()}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'background.default',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end">
          {onAttachFiles && (
            <React.Fragment>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                data-testid="chat-file-input"
                onChange={handlePickFiles}
              />
              <Tooltip title="Attach files (any type)">
                <IconButton
                  data-testid="chat-attach"
                  aria-label="Attach files"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  sx={{ height: 56, width: 56 }}
                >
                  <AttachFileIcon />
                </IconButton>
              </Tooltip>
            </React.Fragment>
          )}
          <TextField
            data-testid="chat-input"
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            inputRef={inputRef}
            disabled={loading}
          />
          <Button
            data-testid="chat-send"
            variant="contained"
            onClick={handleSend}
            disabled={(!chatInput.trim() && !hasStaged) || loading}
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
