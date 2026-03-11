import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import type {
  WebUserDirectChatProps,
  DirectChatFormData,
  DirectChatStatus,
  DirectChatPlaceholders,
  DirectChatPrompts,
} from './WebUserDirectChat.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_TITLE = 'Chat with support';
const DEFAULT_SUBTITLE = 'Tell us what you need and we will route it to the right person.';
const DEFAULT_PROMPTS: DirectChatPrompts = {
  askMessage: 'Hi, what do you need help with today?',
  askName: 'Got it. What should we call you?',
  askEmail: 'Thanks. What email should we reply to?',
  success: 'Thanks. We have your message and will follow up shortly.',
  failure: 'We could not send that just now.',
};
const DEFAULT_PLACEHOLDERS: DirectChatPlaceholders = {
  message: 'Type your question or issue',
  name: 'Your name',
  email: 'you@example.com',
};

type ConversationStep = 'message' | 'name' | 'email' | 'review' | 'complete';
type ChatMessageTone = 'default' | 'success' | 'error';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  tone: ChatMessageTone;
}

function createChatMessage(
  role: ChatMessage['role'],
  content: string,
  tone: ChatMessageTone = 'default',
): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    tone,
  };
}

function normalizeName(name?: string) {
  return (name ?? '').trim();
}

function normalizeEmail(email?: string) {
  const trimmed = (email ?? '').trim();
  return EMAIL_REGEX.test(trimmed) ? trimmed : '';
}

export function WebUserDirectChat({
  provider,
  apiEndpoint = '/api/chat/send',
  title = DEFAULT_TITLE,
  subtitle,
  headerText,
  initialName,
  initialEmail,
  prompts: promptOverrides,
  placeholders: placeholderOverrides,
  onSuccess,
  onError,
  sx,
}: WebUserDirectChatProps) {
  const prompts = React.useMemo(
    () => ({
      ...DEFAULT_PROMPTS,
      ...promptOverrides,
    }),
    [promptOverrides],
  );
  const placeholders = React.useMemo(
    () => ({
      ...DEFAULT_PLACEHOLDERS,
      ...placeholderOverrides,
    }),
    [placeholderOverrides],
  );
  const subtitleText = subtitle ?? headerText ?? DEFAULT_SUBTITLE;
  const normalizedInitialName = React.useMemo(() => normalizeName(initialName), [initialName]);
  const normalizedInitialEmail = React.useMemo(() => normalizeEmail(initialEmail), [initialEmail]);
  const messagesRef = React.useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    createChatMessage('assistant', prompts.askMessage),
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const [capturedMessage, setCapturedMessage] = React.useState('');
  const [capturedName, setCapturedName] = React.useState(normalizedInitialName);
  const [capturedEmail, setCapturedEmail] = React.useState(normalizedInitialEmail);
  const [step, setStep] = React.useState<ConversationStep>('message');
  const [status, setStatus] = React.useState<DirectChatStatus>('idle');
  const [composerError, setComposerError] = React.useState('');
  const [retryPayload, setRetryPayload] = React.useState<DirectChatFormData | null>(null);

  React.useEffect(() => {
    if (messages.length !== 1 || step !== 'message' || capturedMessage) {
      return;
    }

    setCapturedName(normalizedInitialName);
    setCapturedEmail(normalizedInitialEmail);
  }, [
    capturedMessage,
    messages.length,
    normalizedInitialEmail,
    normalizedInitialName,
    step,
  ]);

  React.useEffect(() => {
    const container = messagesRef.current;
    if (!container) {
      return;
    }

    if (typeof container.scrollTo === 'function') {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages, status]);

  const appendMessage = React.useCallback((message: ChatMessage) => {
    setMessages((currentMessages) => [...currentMessages, message]);
  }, []);

  const resetConversation = React.useCallback(() => {
    setMessages([createChatMessage('assistant', prompts.askMessage)]);
    setInputValue('');
    setCapturedMessage('');
    setCapturedName(normalizedInitialName);
    setCapturedEmail(normalizedInitialEmail);
    setStep('message');
    setStatus('idle');
    setComposerError('');
    setRetryPayload(null);
  }, [normalizedInitialEmail, normalizedInitialName, prompts.askMessage]);

  const submitConversation = React.useCallback(
    async (payload: DirectChatFormData) => {
      setStatus('loading');
      setStep('review');
      setComposerError('');
      setRetryPayload(payload);

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ message: 'Something went wrong' }));
          throw new Error(data.message || `Request failed (${response.status})`);
        }

        appendMessage(createChatMessage('assistant', prompts.success, 'success'));
        setStatus('success');
        setStep('complete');
        setRetryPayload(null);
        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong';
        appendMessage(
          createChatMessage('assistant', `${prompts.failure} ${message}`.trim(), 'error'),
        );
        setStatus('error');
        onError?.(message);
      }
    },
    [apiEndpoint, appendMessage, onError, onSuccess, prompts.failure, prompts.success],
  );

  const handleSend = React.useCallback(() => {
    if (status === 'loading' || step === 'review' || step === 'complete') {
      return;
    }

    const nextValue = inputValue.trim();
    if (!nextValue) {
      setComposerError(
        step === 'message'
          ? 'Start by telling us what you need help with.'
          : step === 'name'
            ? 'Tell us your name so we know who we are speaking with.'
            : 'Please enter a valid email address so we can reply.',
      );
      return;
    }

    if (step === 'email' && !EMAIL_REGEX.test(nextValue)) {
      setComposerError('Please enter a valid email address so we can reply.');
      return;
    }

    setComposerError('');
    appendMessage(createChatMessage('user', nextValue));
    setInputValue('');

    if (step === 'message') {
      setCapturedMessage(nextValue);

      if (!capturedName) {
        appendMessage(createChatMessage('assistant', prompts.askName));
        setStep('name');
        setStatus('collecting');
        return;
      }

      if (!capturedEmail) {
        appendMessage(createChatMessage('assistant', prompts.askEmail));
        setStep('email');
        setStatus('collecting');
        return;
      }

      void submitConversation({
        name: capturedName,
        email: capturedEmail,
        message: nextValue,
        provider,
      });
      return;
    }

    if (step === 'name') {
      setCapturedName(nextValue);

      if (!capturedEmail) {
        appendMessage(createChatMessage('assistant', prompts.askEmail));
        setStep('email');
        setStatus('collecting');
        return;
      }

      void submitConversation({
        name: nextValue,
        email: capturedEmail,
        message: capturedMessage,
        provider,
      });
      return;
    }

    setCapturedEmail(nextValue);
    void submitConversation({
      name: capturedName,
      email: nextValue,
      message: capturedMessage,
      provider,
    });
  }, [
    appendMessage,
    capturedEmail,
    capturedMessage,
    capturedName,
    inputValue,
    prompts.askEmail,
    prompts.askName,
    provider,
    status,
    step,
    submitConversation,
  ]);

  const handleRetry = () => {
    if (retryPayload) {
      void submitConversation(retryPayload);
    }
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const composerConfig = React.useMemo(() => {
    if (step === 'name') {
      return {
        autoComplete: 'name',
        chip: 'Your name',
        helperText: 'Tell support what to call you.',
        label: 'What should we call you?',
        maxRows: 1,
        minRows: 1,
        multiline: false,
        placeholder: placeholders.name,
        type: 'text' as const,
      };
    }

    if (step === 'email') {
      return {
        autoComplete: 'email',
        chip: 'Reply email',
        helperText: 'Support will reply to this address.',
        inputMode: 'email' as const,
        label: 'Where should we reply?',
        maxRows: 1,
        minRows: 1,
        multiline: false,
        placeholder: placeholders.email,
        type: 'email' as const,
      };
    }

    return {
      autoComplete: 'off',
      chip: 'Your issue',
      helperText: 'Press Enter to send. Shift+Enter adds a new line.',
      inputMode: 'text' as const,
      label: 'What do you need help with?',
      maxRows: 5,
      minRows: 2,
      multiline: true,
      placeholder: placeholders.message,
      type: 'text' as const,
    };
  }, [placeholders.email, placeholders.message, placeholders.name, step]);

  return (
    <Paper
      elevation={2}
      sx={{
        overflow: 'hidden',
        borderRadius: 4,
        maxWidth: 560,
        mx: 'auto',
        ...sx,
      }}
    >
      <Box
        sx={(theme) => ({
          px: 3,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, rgba(22, 28, 40, 0.98), rgba(14, 18, 27, 0.98))'
              : 'linear-gradient(180deg, rgba(247, 249, 252, 1), rgba(255, 255, 255, 1))',
        })}
      >
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}
        >
          Support
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {subtitleText}
        </Typography>
      </Box>

      <Box
        ref={messagesRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={status === 'loading'}
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          px: 2,
          py: 2,
          maxHeight: 360,
          overflowY: 'auto',
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(7, 10, 16, 0.96)' : 'rgba(250, 252, 255, 0.9)',
        })}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={(theme) => {
                const isUser = message.role === 'user';
                const isError = message.tone === 'error';
                const isSuccess = message.tone === 'success';

                return {
                  maxWidth: '85%',
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 3,
                  borderBottomLeftRadius: isUser ? 3 : 1,
                  borderBottomRightRadius: isUser ? 1 : 3,
                  backgroundColor: isUser
                    ? theme.palette.primary.main
                    : isError
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(95, 22, 28, 0.9)'
                        : 'rgba(255, 235, 238, 1)'
                      : isSuccess
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(17, 66, 50, 0.9)'
                          : 'rgba(232, 245, 233, 1)'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(24, 32, 45, 0.94)'
                          : 'rgba(255, 255, 255, 1)',
                  color: isUser
                    ? theme.palette.primary.contrastText
                    : isError
                      ? theme.palette.mode === 'dark'
                        ? '#ffd7dc'
                        : theme.palette.error.dark
                      : isSuccess
                        ? theme.palette.mode === 'dark'
                          ? '#d8ffec'
                          : theme.palette.success.dark
                        : theme.palette.text.primary,
                  boxShadow: isUser
                    ? `0 10px 24px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(15, 23, 42, 0.12)'}`
                    : 'none',
                };
              }}
            >
              <Typography
                variant="caption"
                sx={{ display: 'block', fontWeight: 700, mb: 0.5, opacity: 0.75 }}
              >
                {message.role === 'user' ? 'You' : 'Support'}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
            </Box>
          </Box>
        ))}

        {status === 'loading' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={(theme) => ({
                px: 1.5,
                py: 1.25,
                borderRadius: 3,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(24, 32, 45, 0.94)'
                    : 'rgba(255, 255, 255, 1)',
              })}
            >
              <CircularProgress size={14} />
              <Typography variant="body2">Sending to support...</Typography>
            </Stack>
          </Box>
        )}
      </Box>

      {step === 'review' || step === 'complete' ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ px: 2, py: 2, borderTop: '1px solid', borderColor: 'divider' }}
        >
          {status === 'error' && retryPayload ? (
            <Button variant="contained" onClick={handleRetry}>
              Retry send
            </Button>
          ) : null}
          <Button
            variant={status === 'success' ? 'contained' : 'outlined'}
            onClick={resetConversation}
          >
            {status === 'success' ? 'Start new chat' : 'Start over'}
          </Button>
        </Stack>
      ) : (
        <Box sx={{ px: 2, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mb: 1 }}
          >
            <Chip size="small" color="primary" variant="outlined" label={composerConfig.chip} />
            <Typography variant="caption" color="text.secondary">
              {composerConfig.helperText}
            </Typography>
          </Stack>
          <Box component="form" onSubmit={(event) => event.preventDefault()} noValidate>
            <TextField
              fullWidth
              autoComplete={composerConfig.autoComplete}
              multiline={composerConfig.multiline}
              minRows={composerConfig.minRows}
              maxRows={composerConfig.maxRows}
              label={composerConfig.label}
              placeholder={composerConfig.placeholder}
              type={composerConfig.type}
              inputProps={{
                inputMode: composerConfig.inputMode,
              }}
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                if (composerError) {
                  setComposerError('');
                }
              }}
              onKeyDown={handleComposerKeyDown}
              error={Boolean(composerError)}
              helperText={composerError || ' '}
              disabled={status === 'loading'}
            />
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
              <Button
                type="button"
                variant="contained"
                onClick={handleSend}
                disabled={status === 'loading'}
              >
                Send
              </Button>
            </Stack>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

export default WebUserDirectChat;
