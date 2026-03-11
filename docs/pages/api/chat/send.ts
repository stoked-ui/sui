import type { NextApiRequest, NextApiResponse } from 'next';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WHATS_APP_PROVIDER = 'whats-app';
const TELEGRAM_PROVIDER = 'telegram';

const PROVIDER_CONFIGS: Record<string, { envPhone: string; envToken: string }> = {
  'whats-app': {
    envPhone: 'WHATSAPP_PHONE_NUMBER_ID',
    envToken: 'WHATSAPP_ACCESS_TOKEN',
  },
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

async function sendTelegramMessage(input: SupportMessageInput, res: NextApiResponse) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_SUPPORT_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID;
  const threadIdRaw = process.env.TELEGRAM_SUPPORT_THREAD_ID ?? process.env.TELEGRAM_THREAD_ID;

  if (!botToken || !chatId) {
    console.error('Missing Telegram env vars:', {
      hasBotToken: !!botToken,
      hasChatId: !!chatId,
      hasThreadId: !!threadIdRaw,
    });
    return res.status(500).json({ message: 'Messaging service is not configured' });
  }

  let messageThreadId: number | undefined;
  if (threadIdRaw) {
    const parsedThreadId = Number(threadIdRaw);
    if (!Number.isInteger(parsedThreadId) || parsedThreadId <= 0) {
      console.error('Invalid Telegram thread id:', threadIdRaw);
      return res.status(500).json({ message: 'Messaging service is not configured' });
    }
    messageThreadId = parsedThreadId;
  }

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatSupportMessage(input),
        disable_web_page_preview: true,
        ...(messageThreadId ? { message_thread_id: messageThreadId } : {}),
      }),
    });

    if (!telegramResponse.ok) {
      const error = await telegramResponse.json().catch(() => ({}));
      console.error('Telegram API error:', telegramResponse.status, error);
      return res.status(502).json({ message: 'Failed to deliver message' });
    }

    return res.status(200).json({ status: 'sent' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Telegram send error:', msg);
    return res.status(500).json({ message: 'Failed to send message' });
  }
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, message, provider } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'name is required' });
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'message is required' });
  }
  if (!provider || (provider !== TELEGRAM_PROVIDER && !PROVIDER_CONFIGS[provider])) {
    return res.status(400).json({ message: `Unsupported provider: ${provider}` });
  }

  const input = {
    name,
    email,
    message,
  };

  if (provider === TELEGRAM_PROVIDER) {
    return sendTelegramMessage(input, res);
  }

  return sendWhatsAppMessage(input, res);
}
