import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySquareWebhookSignature, SquareClientError } from 'docs/src/modules/square/squareClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const signature = req.headers['x-square-hmacsha256-signature'];
  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ message: 'Missing x-square-hmacsha256-signature header' });
  }

  try {
    const rawBody = await readRawBody(req);
    const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL ?? '';

    await verifySquareWebhookSignature(rawBody.toString(), signature, notificationUrl);

    const event = JSON.parse(rawBody.toString());

    switch (event.type) {
      case 'payment.completed':
        console.log('[square-webhook] Payment completed:', event.data?.id);
        break;
      case 'subscription.created':
        console.log('[square-webhook] Subscription created:', event.data?.id);
        break;
      case 'subscription.updated':
        console.log('[square-webhook] Subscription updated:', event.data?.id);
        break;
      case 'subscription.canceled':
        console.log('[square-webhook] Subscription canceled:', event.data?.id);
        break;
      default:
        console.log('[square-webhook] Unrecognized event type:', event.type);
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error: unknown) {
    if (error instanceof SquareClientError) {
      return res.status(error.status).json({ message: error.message });
    }
    const message = error instanceof Error ? error.message : 'Failed to process Square webhook';
    return res.status(500).json({ message });
  }
}
