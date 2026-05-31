import type { NextApiRequest, NextApiResponse } from 'next';
import { runTurn, type ClientChatMessage } from 'docs/src/modules/auditBot/conversationRunner';
import { isPlaybookId, type PlaybookId } from 'docs/src/modules/auditBot/playbooks';
import {
  ensureLead,
  appendMessage,
  saveReport,
  newSessionId,
} from 'docs/src/modules/auditBot/auditStore';

interface TurnRequestBody {
  sessionId?: string;
  playbook?: string;
  history?: ClientChatMessage[];
  message?: string;
}

interface TurnResponseBody {
  sessionId: string;
  reply: string;
  report?: unknown;
  finished: boolean;
}

const MAX_HISTORY_TURNS = 40;
const MAX_MESSAGE_CHARS = 4000;

function sanitizeHistory(history: ClientChatMessage[] | undefined): ClientChatMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }
  return history
    .filter((m): m is ClientChatMessage =>
      Boolean(m)
      && (m.role === 'user' || m.role === 'assistant')
      && typeof m.content === 'string',
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TurnResponseBody | { error: string }>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (req.body || {}) as TurnRequestBody;

  const playbook = body.playbook;
  if (!isPlaybookId(playbook)) {
    return res.status(400).json({ error: 'playbook is required and must be a valid playbook id' });
  }

  const userMessage = (body.message || '').trim().slice(0, MAX_MESSAGE_CHARS);
  if (!userMessage) {
    return res.status(400).json({ error: 'message is required' });
  }

  const history = sanitizeHistory(body.history);
  const sessionId = body.sessionId && /^[a-z0-9-]{8,}$/i.test(body.sessionId)
    ? body.sessionId
    : newSessionId();

  try {
    await ensureLead(sessionId, playbook as PlaybookId);
    await appendMessage(sessionId, playbook as PlaybookId, 'user', userMessage);
  } catch (err) {
    // Persistence is best-effort — don't fail the conversation on a Mongo blip.
    console.error('auditStore append (user) failed', err);
  }

  try {
    const result = await runTurn({
      sessionId,
      playbook: playbook as PlaybookId,
      history,
      userMessage,
    });

    if (result.report) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await saveReport(sessionId, result.report as any);
      } catch (err) {
        console.error('auditStore saveReport failed', err);
      }
    }

    if (result.reply) {
      try {
        await appendMessage(sessionId, playbook as PlaybookId, 'assistant', result.reply);
      } catch (err) {
        console.error('auditStore append (assistant) failed', err);
      }
    }

    return res.status(200).json({
      sessionId,
      reply: result.reply,
      ...(result.report ? { report: result.report } : {}),
      finished: result.finished,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'turn failed';
    console.error('audit/turn failed', err);
    return res.status(500).json({ error: message });
  }
}
