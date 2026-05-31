import * as React from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { PLAYBOOKS, type PlaybookId } from 'docs/src/modules/auditBot/playbooks';
import type { AuditReport } from 'docs/src/modules/auditBot/types';
import AuditReportView from './AuditReportView';

interface AuditBotProps {
  open: boolean;
  onClose: () => void;
  playbook: PlaybookId;
  calendlyUrl?: string;
}

interface UiMessage {
  role: 'user' | 'assistant';
  content: string;
  report?: AuditReport;
}

const OPENING_MESSAGES: Record<PlaybookId, string> = {
  'ai-readiness':
    "Hi — I'm an AI agent Brian Stoker built to do a quick, free AI readiness audit. Takes about 5 minutes. At the end you get a 1-page writeup with the 3 best places AI would actually save you time. Yours to keep, no pitch required.\n\nTo start: what does your business do, and what city are you based in?",
  'cloud-cost':
    "Hi — I'm an AI agent Brian Stoker built to do a quick, free cloud cost audit. Takes about 6 minutes. At the end you get a 1-page writeup with the 3 biggest savings opportunities on your AWS, GCP, or Azure bill. Yours to keep.\n\nTo start: which cloud(s), and roughly what's your monthly spend? (Range is fine.)",
  security:
    "Hi — I'm an AI agent Brian Stoker built to do a quick, free security audit. Takes about 6 minutes. At the end you get a 1-page writeup with the 3 highest-impact security fixes for your stack. This is an app + infra review, not a pentest. Yours to keep.\n\nTo start: what does your business do, and what's your stack — ballpark?",
};

export default function AuditBot({ open, onClose, playbook, calendlyUrl }: AuditBotProps) {
  const config = PLAYBOOKS[playbook];
  const [messages, setMessages] = React.useState<UiMessage[]>([]);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [reportReady, setReportReady] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [emailDraft, setEmailDraft] = React.useState('');
  const [nameDraft, setNameDraft] = React.useState('');
  const [savingLead, setSavingLead] = React.useState(false);
  const [savedLead, setSavedLead] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Seed the opening message exactly once when the dialog opens fresh.
  React.useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: OPENING_MESSAGES[playbook] }]);
    }
  }, [open, playbook, messages.length]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  function reset() {
    setMessages([]);
    setSessionId(null);
    setInput('');
    setBusy(false);
    setReportReady(false);
    setFinished(false);
    setEmailDraft('');
    setNameDraft('');
    setSavingLead(false);
    setSavedLead(false);
  }

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || busy) {
      return;
    }
    const nextMessages: UiMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/audit/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          playbook,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          message: trimmed,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `request failed (${res.status})`);
      }
      const data: {
        sessionId: string;
        reply: string;
        report?: AuditReport;
        finished: boolean;
      } = await res.json();
      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || (data.report ? 'Audit ready below.' : ''),
          ...(data.report ? { report: data.report } : {}),
        },
      ]);
      if (data.report) {
        setReportReady(true);
      }
      if (data.finished) {
        setFinished(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'something went wrong';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry — I hit a snag (${msg}). Brian can take it from here — leave your email below and he'll follow up directly.`,
        },
      ]);
      setReportReady(true);
    } finally {
      setBusy(false);
    }
  }

  async function submitLead(bookedCall: boolean) {
    if (!sessionId) {
      return;
    }
    setSavingLead(true);
    try {
      await fetch('/api/audit/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          name: nameDraft.trim() || undefined,
          email: emailDraft.trim() || undefined,
          bookedCall,
        }),
      });
      setSavedLead(true);
    } catch (err) {
      console.error('save-lead failed', err);
    } finally {
      setSavingLead(false);
    }
  }

  const showEmailCapture = reportReady && !savedLead;

  return (
    <Dialog
      open={open}
      onClose={() => { onClose(); reset(); }}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, height: { xs: '100%', md: '85vh' } } }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: '#22c55e',
            boxShadow: '0 0 8px #22c55e',
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Stoked {config.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ~{config.estimatedMinutes} min · Free · Brian sees the report
          </Typography>
        </Box>
        <IconButton onClick={() => { onClose(); reset(); }} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {busy ? <LinearProgress sx={{ height: 2 }} /> : null}

      <DialogContent
        ref={scrollRef}
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 2 }}
      >
        {messages.map((m, idx) => (
          <Box
            key={idx}
            sx={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: m.report ? '100%' : '85%',
              width: m.report ? '100%' : 'auto',
            }}
          >
            <Box
              sx={[
                {
                  px: 1.75,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: m.role === 'user' ? '#3399ff' : 'grey.100',
                  color: m.role === 'user' ? '#fff' : 'text.primary',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5,
                },
                m.role === 'assistant'
                  ? (theme) => theme.applyDarkStyles({ bgcolor: 'primaryDark.700' })
                  : {},
              ]}
            >
              {m.content}
            </Box>
            {m.report ? (
              <Box sx={{ mt: 1.5 }}>
                <AuditReportView report={m.report} />
              </Box>
            ) : null}
          </Box>
        ))}

        {showEmailCapture ? (
          <Box
            sx={[
              {
                mt: 2,
                p: 2,
                border: 1,
                borderColor: '#3399ff',
                borderRadius: 2,
                bgcolor: 'background.paper',
              },
              (theme) => theme.applyDarkStyles({ bgcolor: 'primaryDark.800' }),
            ]}
          >
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
              Want Brian to follow up?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Drop your email below. He&apos;ll review this report and send you a short note
              with what he&apos;d actually do first. No spam, no funnel — one human reply.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 1 }}>
              <TextField
                size="small"
                placeholder="Your name"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                placeholder="you@company.com"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                sx={{ flex: 2 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => submitLead(false)}
                disabled={savingLead || !emailDraft.trim()}
                sx={{
                  backgroundColor: '#3399ff',
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { backgroundColor: '#1976d2' },
                }}
              >
                Send the follow-up
              </Button>
              {calendlyUrl ? (
                <Button
                  variant="outlined"
                  href={calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => submitLead(true)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Book a 30-min call
                </Button>
              ) : null}
            </Box>
          </Box>
        ) : null}

        {savedLead ? (
          <Box
            sx={[
              {
                mt: 1,
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'grey.50',
                textAlign: 'center',
              },
              (theme) => theme.applyDarkStyles({ bgcolor: 'primaryDark.900', borderColor: 'primaryDark.700' }),
            ]}
          >
            <Typography sx={{ fontWeight: 600 }}>
              Got it. Brian sees this on his phone — he&apos;ll get back to you within a business day.
            </Typography>
          </Box>
        ) : null}
      </DialogContent>

      {!finished ? (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your response…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={busy}
            size="small"
          />
          <IconButton
            onClick={send}
            disabled={busy || !input.trim()}
            sx={{
              bgcolor: '#3399ff',
              color: '#fff',
              '&:hover': { bgcolor: '#1976d2' },
              '&.Mui-disabled': { bgcolor: 'grey.300', color: 'grey.500' },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      ) : null}
    </Dialog>
  );
}
