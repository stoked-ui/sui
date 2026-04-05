import type { NextApiRequest, NextApiResponse } from 'next';
import { getChatSession, listChatMessagesAfter } from 'docs/src/modules/chat/chatStore';
import { syncTelegramReplies } from 'docs/src/modules/chat/telegramTransport';

function readAfterSequence(rawValue: string | string[] | undefined) {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  const parsed = Number(value || '0');
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const rawSessionId = Array.isArray(req.query.sessionId) ? req.query.sessionId[0] : req.query.sessionId;
  if (!rawSessionId || typeof rawSessionId !== 'string') {
    return res.status(400).json({ message: 'Chat session is required' });
  }

  const session = await getChatSession(rawSessionId);
  if (!session) {
    return res.status(404).json({ message: 'Chat session not found' });
  }

  try {
    if (session.provider === 'telegram') {
      await syncTelegramReplies();
    }
  } catch (error) {
    console.error('[chat] failed to sync Telegram replies:', error);
  }

  const afterSequence = readAfterSequence(req.query.after);
  const messages = await listChatMessagesAfter(rawSessionId, afterSequence);
  const lastSequence = messages.length > 0 ? messages[messages.length - 1].sequence : afterSequence;

  return res.status(200).json({
    sessionId: rawSessionId,
    provider: session.provider,
    messages,
    lastSequence,
  });
}
