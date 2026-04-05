import type { NextApiRequest, NextApiResponse } from 'next';
import { appendChatMessage, createChatSession, getChatSession, type ChatProvider } from 'docs/src/modules/chat/chatStore';
import { sendTelegramRelayMessage } from 'docs/src/modules/chat/telegramTransport';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WHATS_APP_PROVIDER = 'whats-app';
const TELEGRAM_PROVIDER = 'telegram';

const PROVIDER_CONFIGS: Record<string, { envPhone: string; envToken: string }> = {
  'whats-app': {
    envPhone: 'WHATSAPP_PHONE_NUMBER_ID',
    envToken: 'WHATSAPP_ACCESS_TOKEN',
  },
};

type NewSupportMessageInput = {
  name: string;
  email: string;
  message: string;
  provider: ChatProvider;
  sessionId?: string;
};

type SupportMessageInput = {
  name: string;
  email: string;
  message: string;
};

function formatSupportMessage({ name, email, message }: SupportMessageInput) {
  return [
    'New support request',
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    '',
    message.trim(),
  ].join('\n');
}

async function sendWhatsAppMessage(input: SupportMessageInput, res: NextApiResponse) {
  const config = PROVIDER_CONFIGS[WHATS_APP_PROVIDER];
  const phoneNumberId = process.env[config.envPhone];
  const accessToken = process.env[config.envToken];
  const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER;

  if (!phoneNumberId || !accessToken || !recipientNumber) {
    console.error('Missing WhatsApp env vars:', {
      hasPhoneId: !!phoneNumberId,
      hasToken: !!accessToken,
      hasRecipient: !!recipientNumber,
    });
    return res.status(500).json({ message: 'Messaging service is not configured' });
  }

  try {
    const waRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientNumber,
        type: 'text',
        text: { body: formatSupportMessage(input) },
      }),
    });

    if (!waRes.ok) {
      const err = await waRes.json().catch(() => ({}));
      console.error('WhatsApp API error:', waRes.status, err);
      return res.status(502).json({ message: 'Failed to deliver message' });
    }

    return res.status(200).json({ status: 'sent' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('WhatsApp send error:', msg);
    return res.status(500).json({ message: 'Failed to send message' });
  }
}

function validateInput(body: Record<string, unknown>): NewSupportMessageInput {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const provider = body.provider;
  const sessionId = typeof body.sessionId === 'string' && body.sessionId.trim()
    ? body.sessionId.trim()
    : undefined;

  if (!name) {
    throw new Error('name is required');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('A valid email is required');
  }
  if (!message) {
    throw new Error('message is required');
  }
  if (provider !== TELEGRAM_PROVIDER && provider !== WHATS_APP_PROVIDER) {
    throw new Error(`Unsupported provider: ${String(provider)}`);
  }

  return {
    name,
    email,
    message,
    provider,
    ...(sessionId ? { sessionId } : {}),
  };
}

async function handleTelegramMessage(input: NewSupportMessageInput, res: NextApiResponse) {
  try {
    if (input.sessionId) {
      const session = await getChatSession(input.sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Chat session not found' });
      }

      const telegramMessageId = await sendTelegramRelayMessage({
        provider: input.provider,
        sessionId: input.sessionId,
        name: session.name,
        email: session.email,
        message: input.message,
        isInitialMessage: false,
      });

      const storedMessage = await appendChatMessage({
        sessionId: input.sessionId,
        role: 'user',
        content: input.message,
        source: 'web',
        ...(telegramMessageId ? { telegramMessageId } : {}),
      });

      return res.status(200).json({
        status: 'sent',
        sessionId: input.sessionId,
        message: storedMessage,
        lastSequence: storedMessage.sequence,
      });
    }

    const session = await createChatSession({
      provider: input.provider,
      name: input.name,
      email: input.email,
    });

    const telegramMessageId = await sendTelegramRelayMessage({
      provider: input.provider,
      sessionId: session.id,
      name: input.name,
      email: input.email,
      message: input.message,
      isInitialMessage: true,
    });

    const storedMessage = await appendChatMessage({
      sessionId: session.id,
      role: 'user',
      content: input.message,
      source: 'web',
      ...(telegramMessageId ? { telegramMessageId } : {}),
    });

    return res.status(200).json({
      status: 'sent',
      sessionId: session.id,
      message: storedMessage,
      lastSequence: storedMessage.sequence,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to send message';
    console.error('Telegram send error:', msg);
    return res.status(500).json({ message: msg });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let input: NewSupportMessageInput;
  try {
    input = validateInput((req.body || {}) as Record<string, unknown>);
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid request' });
  }

  if (input.provider === TELEGRAM_PROVIDER) {
    return handleTelegramMessage(input, res);
  }

  return sendWhatsAppMessage(input, res);
}
