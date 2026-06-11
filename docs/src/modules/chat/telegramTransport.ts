import type { ChatProvider } from './chatStore';
import {
  appendChatMessage,
  findSessionIdByTelegramMessageId,
  getTelegramOffset,
  setTelegramOffset,
} from './chatStore';

const TELEGRAM_PROVIDER = 'telegram';
const SESSION_TAG_REGEX = /\[session:([a-f0-9-]+)\]/i;
const REPLY_COMMAND_REGEX = /^\/reply(?:@\w+)?\s+([a-f0-9-]+)\s+([\s\S]+)/i;

type TelegramSendMessageResponse = {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
};

type TelegramUpdateResponse = {
  ok: boolean;
  result?: TelegramUpdate[];
  description?: string;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

type TelegramMessage = {
  message_id: number;
  text?: string;
  chat: {
    id: number;
  };
  from?: {
    is_bot?: boolean;
  };
  reply_to_message?: {
    message_id: number;
    text?: string;
  };
  message_thread_id?: number;
};

declare global {
   
  var _telegramChatSyncPromise: Promise<void> | undefined;
}

function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_SUPPORT_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID;
  const threadIdRaw = process.env.TELEGRAM_SUPPORT_THREAD_ID ?? process.env.TELEGRAM_THREAD_ID;

  if (!botToken || !chatId) {
    throw new Error('Messaging service is not configured');
  }

  if (threadIdRaw) {
    const parsedThreadId = Number(threadIdRaw);
    if (!Number.isInteger(parsedThreadId) || parsedThreadId <= 0) {
      throw new Error('Messaging service is not configured');
    }

    return {
      botToken,
      chatId,
      threadId: parsedThreadId,
    };
  }

  return {
    botToken,
    chatId,
  };
}

function formatTelegramText(params: {
  sessionId: string;
  name: string;
  email: string;
  message: string;
  isInitialMessage: boolean;
}) {
  const prefix = `[session:${params.sessionId}]`;

  if (params.isInitialMessage) {
    return [
      prefix,
      `From: ${params.name.trim()} <${params.email.trim()}>`,
      '',
      params.message.trim(),
      '',
      'Reply directly to this message to answer in the web chat.',
    ].join('\n');
  }

  return [
    prefix,
    `From: ${params.name.trim()} <${params.email.trim()}>`,
    '',
    params.message.trim(),
    '',
    'Reply directly to this message to answer in the web chat.',
  ].join('\n');
}

export async function sendTelegramRelayMessage(params: {
  provider: ChatProvider;
  sessionId: string;
  name: string;
  email: string;
  message: string;
  isInitialMessage: boolean;
}) {
  if (params.provider !== TELEGRAM_PROVIDER) {
    return null;
  }

  const config = getTelegramConfig();
  const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: config.chatId,
      text: formatTelegramText(params),
      disable_web_page_preview: true,
      ...(config.threadId ? { message_thread_id: config.threadId } : {}),
    }),
  });

  const body = (await response.json().catch(() => ({}))) as TelegramSendMessageResponse;

  if (!response.ok || !body.ok || !body.result?.message_id) {
    throw new Error(body.description || 'Failed to deliver message');
  }

  return body.result.message_id;
}

function parseReplyPayload(text?: string) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return null;
  }

  const replyCommandMatch = trimmed.match(REPLY_COMMAND_REGEX);
  if (replyCommandMatch) {
    return {
      sessionId: replyCommandMatch[1],
      content: replyCommandMatch[2].trim(),
    };
  }

  const sessionTagMatch = trimmed.match(SESSION_TAG_REGEX);
  if (sessionTagMatch) {
    return {
      sessionId: sessionTagMatch[1],
      content: trimmed.replace(SESSION_TAG_REGEX, '').trim(),
    };
  }

  return null;
}

async function resolveSessionId(message: TelegramMessage) {
  const replyToMessageId = message.reply_to_message?.message_id;
  if (replyToMessageId) {
    const sessionId = await findSessionIdByTelegramMessageId(replyToMessageId);
    if (sessionId) {
      return {
        sessionId,
        content: (message.text || '').trim(),
        replyToTelegramMessageId: replyToMessageId,
      };
    }
  }

  const parsedPayload = parseReplyPayload(message.text);
  if (!parsedPayload) {
    return null;
  }

  return {
    sessionId: parsedPayload.sessionId,
    content: parsedPayload.content,
    ...(replyToMessageId ? { replyToTelegramMessageId: replyToMessageId } : {}),
  };
}

async function syncTelegramRepliesInternal() {
  let config: ReturnType<typeof getTelegramConfig>;

  try {
    config = getTelegramConfig();
  } catch {
    return;
  }

  const offset = await getTelegramOffset();
  const updatesUrl = new URL(`https://api.telegram.org/bot${config.botToken}/getUpdates`);
  if (offset > 0) {
    updatesUrl.searchParams.set('offset', String(offset));
  }

  const response = await fetch(updatesUrl.toString());
  const body = (await response.json().catch(() => ({}))) as TelegramUpdateResponse;

  if (!response.ok || !body.ok || !Array.isArray(body.result)) {
    throw new Error(body.description || 'Failed to sync Telegram replies');
  }

  let nextOffset = offset;

  for (const update of body.result) {
    nextOffset = Math.max(nextOffset, update.update_id + 1);

    const message = update.message;
    if (!message?.text || message.from?.is_bot) {
      continue;
    }

    if (String(message.chat.id) !== String(config.chatId)) {
      continue;
    }

    if (config.threadId && message.message_thread_id !== config.threadId) {
      continue;
    }

    const resolved = await resolveSessionId(message);
    if (!resolved || !resolved.content) {
      continue;
    }

    await appendChatMessage({
      sessionId: resolved.sessionId,
      role: 'support',
      content: resolved.content,
      source: 'telegram',
      telegramMessageId: message.message_id,
      telegramUpdateId: update.update_id,
      ...(resolved.replyToTelegramMessageId
        ? { replyToTelegramMessageId: resolved.replyToTelegramMessageId }
        : {}),
    });
  }

  if (nextOffset > offset) {
    await setTelegramOffset(nextOffset);
  }
}

export async function syncTelegramReplies() {
  if (global._telegramChatSyncPromise) {
    return global._telegramChatSyncPromise;
  }

  global._telegramChatSyncPromise = syncTelegramRepliesInternal().finally(() => {
    global._telegramChatSyncPromise = undefined;
  });

  return global._telegramChatSyncPromise;
}
